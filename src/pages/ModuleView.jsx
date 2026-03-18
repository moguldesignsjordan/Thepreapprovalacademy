import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, CheckCircle, XCircle, ArrowRight, Award, RefreshCcw,
  Play, Pause, Video, BookOpen, Star, AlertTriangle, GraduationCap,
  Volume2, VolumeX, SkipForward, SkipBack, Clock, ChevronDown, ChevronUp,
  ListOrdered, Eye, Headphones, Settings, X, Mic
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════
const ELEVENLABS_API_KEY = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_ELEVENLABS_API_KEY || null : null;
const ELEVENLABS_VOICE_ID = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB' : 'pNInz6obpgDQGcFmaJgB';

// ═══════════════════════════════════════════════════════════════════
// AUDIO / TTS ENGINE (rebuilt with cancellation + error handling)
// ═══════════════════════════════════════════════════════════════════
const useAudioPlayer = (moduleId) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSection, setCurrentSection] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [useElevenLabs, setUseElevenLabs] = useState(!!ELEVENLABS_API_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cancellation: every new play session gets a unique ID.
  // Callbacks check if their session is still the active one before proceeding.
  const sessionIdRef = useRef(0);
  const audioElRef = useRef(null);
  const abortRef = useRef(null);        // AbortController for ElevenLabs fetch
  const sectionsRef = useRef([]);
  const currentIndexRef = useRef(-1);
  const speedRef = useRef(1);
  const voicesLoadedRef = useRef(false);
  const pausedSectionRef = useRef(-1);   // Track which section was paused for restart
  const chromePauseTimerRef = useRef(null);

  // Keep speedRef in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Load voices (Chrome fires voiceschanged async)
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const loadVoices = () => { synth.getVoices(); voicesLoadedRef.current = true; };
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => synth.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // ── Hard stop everything ──
  const stop = useCallback(() => {
    // Increment session to invalidate all pending callbacks
    sessionIdRef.current += 1;

    // Cancel any in-flight ElevenLabs request
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (_) {}
      abortRef.current = null;
    }

    // Stop browser speech
    try { window.speechSynthesis?.cancel(); } catch (_) {}

    // Stop HTML audio element
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.src = '';
        audioElRef.current.load();
      } catch (_) {}
      audioElRef.current = null;
    }

    // Clear Chrome pause workaround timer
    if (chromePauseTimerRef.current) {
      clearInterval(chromePauseTimerRef.current);
      chromePauseTimerRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSection(-1);
    setIsLoading(false);
    setError(null);
    currentIndexRef.current = -1;
    pausedSectionRef.current = -1;
  }, []);

  // ── Auto-stop + reset when module changes ──
  useEffect(() => {
    stop();
  }, [moduleId, stop]);

  // ── Cleanup on unmount ──
  useEffect(() => { return () => stop(); }, [stop]);

  // ── Pick best available voice ──
  const pickVoice = useCallback(() => {
    try {
      const voices = window.speechSynthesis?.getVoices() || [];
      // Preference order for natural-sounding English voices
      const prefs = ['Samantha', 'Google US English', 'Daniel', 'Karen', 'Alex', 'Microsoft David', 'Google UK English Female'];
      for (const name of prefs) {
        const match = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
        if (match) return match;
      }
      // Fallback: any English voice
      return voices.find(v => v.lang.startsWith('en')) || null;
    } catch (_) { return null; }
  }, []);

  // ── Speak with browser SpeechSynthesis ──
  const speakBrowser = useCallback((text, session, onDone) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setError('Your browser does not support text-to-speech.');
      onDone(false);
      return;
    }

    try {
      synth.cancel(); // Clear any queued utterances
    } catch (_) {}

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speedRef.current;
      utter.pitch = 1;
      const voice = pickVoice();
      if (voice) utter.voice = voice;

      let ended = false;
      const finish = (success) => {
        if (ended) return;
        ended = true;
        if (chromePauseTimerRef.current) {
          clearInterval(chromePauseTimerRef.current);
          chromePauseTimerRef.current = null;
        }
        onDone(success && session === sessionIdRef.current);
      };

      utter.onend = () => finish(true);
      utter.onerror = (e) => {
        // 'interrupted' and 'canceled' are expected when user stops/skips
        if (e?.error === 'interrupted' || e?.error === 'canceled') {
          finish(false);
        } else {
          console.warn('SpeechSynthesis error:', e);
          finish(false);
        }
      };

      synth.speak(utter);

      // Chrome bug workaround: Chrome pauses speech after ~15 seconds.
      // Periodically call resume() to keep it going.
      if (chromePauseTimerRef.current) clearInterval(chromePauseTimerRef.current);
      chromePauseTimerRef.current = setInterval(() => {
        if (session !== sessionIdRef.current) {
          clearInterval(chromePauseTimerRef.current);
          chromePauseTimerRef.current = null;
          return;
        }
        if (synth.speaking && !synth.paused) {
          synth.pause();
          synth.resume();
        }
      }, 10000);

    } catch (err) {
      console.error('SpeechSynthesis setup error:', err);
      setError('Failed to start audio. Please try again.');
      onDone(false);
    }
  }, [pickVoice]);

  // ── Speak with ElevenLabs ──
  const speakElevenLabs = useCallback(async (text, session, onDone) => {
    setIsLoading(true);

    // Create AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          }),
          signal: controller.signal
        }
      );

      // Check if session was cancelled during fetch
      if (session !== sessionIdRef.current) { onDone(false); return; }

      if (!res.ok) throw new Error(`ElevenLabs API ${res.status}: ${res.statusText}`);

      const blob = await res.blob();
      if (session !== sessionIdRef.current) { onDone(false); return; }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = speedRef.current;
      audioElRef.current = audio;

      let ended = false;
      const finish = (success) => {
        if (ended) return;
        ended = true;
        try { URL.revokeObjectURL(url); } catch (_) {}
        onDone(success && session === sessionIdRef.current);
      };

      audio.onended = () => finish(true);
      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        finish(false);
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') {
            console.warn('Audio play() rejected:', err);
            finish(false);
          }
        });
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        // Expected when user cancels — not an error
        onDone(false);
        return;
      }
      console.warn('ElevenLabs failed, falling back to browser TTS:', err);
      setIsLoading(false);
      // Fallback to browser
      speakBrowser(text, session, onDone);
      return;
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [speakBrowser]);

  // ── Core play chain ──
  const playChain = useCallback((sections, startIdx, session) => {
    const playNext = (idx) => {
      // Session check: bail if user stopped, switched module, or started new playback
      if (session !== sessionIdRef.current) return;
      if (idx >= sections.length) {
        // Finished all sections
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSection(-1);
        currentIndexRef.current = -1;
        return;
      }

      currentIndexRef.current = idx;
      setCurrentSection(idx);
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);

      const text = sections[idx];
      if (!text || text.trim().length === 0) {
        // Skip empty sections
        playNext(idx + 1);
        return;
      }

      const onDone = (shouldContinue) => {
        if (shouldContinue && session === sessionIdRef.current) {
          playNext(idx + 1);
        }
      };

      if (useElevenLabs && ELEVENLABS_API_KEY) {
        speakElevenLabs(text, session, onDone);
      } else {
        speakBrowser(text, session, onDone);
      }
    };

    playNext(startIdx);
  }, [useElevenLabs, speakBrowser, speakElevenLabs]);

  // ── Public: start playing ──
  const playSections = useCallback((sections, startIdx = 0) => {
    if (!sections || sections.length === 0) return;

    // Stop any current playback and start fresh session
    stop();

    // Small delay to let stop() cleanup finish
    requestAnimationFrame(() => {
      const session = sessionIdRef.current; // stop() already incremented this
      sectionsRef.current = sections;
      setError(null);
      playChain(sections, startIdx, session);
    });
  }, [stop, playChain]);

  // ── Public: pause ──
  const pause = useCallback(() => {
    if (chromePauseTimerRef.current) {
      clearInterval(chromePauseTimerRef.current);
      chromePauseTimerRef.current = null;
    }

    try { window.speechSynthesis?.pause(); } catch (_) {}
    if (audioElRef.current) {
      try { audioElRef.current.pause(); } catch (_) {}
    }

    pausedSectionRef.current = currentIndexRef.current;
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  // ── Public: resume ──
  // Instead of relying on buggy speechSynthesis.resume(),
  // we restart from the paused section with a fresh session.
  const resume = useCallback(() => {
    const idx = pausedSectionRef.current;
    if (idx < 0 || !sectionsRef.current.length) return;

    // If we had an ElevenLabs audio element that was just paused, try resuming it
    if (audioElRef.current && audioElRef.current.paused && audioElRef.current.src) {
      try {
        const playPromise = audioElRef.current.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            // If resume fails, restart from section
            restartFromSection(idx);
          });
        }
        setIsPlaying(true);
        setIsPaused(false);
        return;
      } catch (_) {}
    }

    // For browser TTS, restart from the current section (Chrome resume is buggy)
    restartFromSection(idx);
  }, []);

  const restartFromSection = useCallback((idx) => {
    // Increment session to kill old chain
    sessionIdRef.current += 1;
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    if (chromePauseTimerRef.current) {
      clearInterval(chromePauseTimerRef.current);
      chromePauseTimerRef.current = null;
    }

    const session = sessionIdRef.current;
    pausedSectionRef.current = -1;
    setIsPaused(false);
    playChain(sectionsRef.current, idx, session);
  }, [playChain]);

  // ── Public: skip forward ──
  const skipForward = useCallback(() => {
    const next = currentIndexRef.current + 1;
    if (next >= sectionsRef.current.length) { stop(); return; }

    // Kill current, start new session from next section
    sessionIdRef.current += 1;
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    if (audioElRef.current) {
      try { audioElRef.current.pause(); audioElRef.current.src = ''; } catch (_) {}
      audioElRef.current = null;
    }
    if (abortRef.current) { try { abortRef.current.abort(); } catch (_) {} abortRef.current = null; }
    if (chromePauseTimerRef.current) { clearInterval(chromePauseTimerRef.current); chromePauseTimerRef.current = null; }

    const session = sessionIdRef.current;
    pausedSectionRef.current = -1;
    setIsPaused(false);
    setError(null);
    playChain(sectionsRef.current, next, session);
  }, [stop, playChain]);

  // ── Public: skip back ──
  const skipBack = useCallback(() => {
    const prev = Math.max(0, currentIndexRef.current - 1);

    sessionIdRef.current += 1;
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    if (audioElRef.current) {
      try { audioElRef.current.pause(); audioElRef.current.src = ''; } catch (_) {}
      audioElRef.current = null;
    }
    if (abortRef.current) { try { abortRef.current.abort(); } catch (_) {} abortRef.current = null; }
    if (chromePauseTimerRef.current) { clearInterval(chromePauseTimerRef.current); chromePauseTimerRef.current = null; }

    const session = sessionIdRef.current;
    pausedSectionRef.current = -1;
    setIsPaused(false);
    setError(null);
    playChain(sectionsRef.current, prev, session);
  }, [playChain]);

  // ── Public: cycle speed ──
  const cycleSpeed = useCallback(() => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    speedRef.current = next;
    if (audioElRef.current) {
      try { audioElRef.current.playbackRate = next; } catch (_) {}
    }
  }, [speed]);

  // ── Public: dismiss error ──
  const clearError = useCallback(() => setError(null), []);

  return {
    isPlaying, isPaused, currentSection, speed, isLoading, error, useElevenLabs,
    playSections, pause, resume, stop, skipForward, skipBack, cycleSpeed,
    clearError, setUseElevenLabs, hasElevenLabs: !!ELEVENLABS_API_KEY,
    isActive: isPlaying || isPaused  // True if player should be visible
  };
};


// ═══════════════════════════════════════════════════════════════════
// VIDEO PLAYER
// ═══════════════════════════════════════════════════════════════════
const VideoPlayer = ({ videoId, title }) => (
  <div className="w-full aspect-video bg-stone-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 relative">
    {videoId && !videoId.includes("VIDEO_ID") ? (
      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 dark:from-zinc-900 dark:via-zinc-800/80 dark:to-zinc-900">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 dark:bg-amber-500/15 flex items-center justify-center border-2 border-orange-500/25 dark:border-amber-500/30">
          <Play size={36} className="text-orange-500 dark:text-amber-400 ml-1" />
        </div>
        <p className="text-stone-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase">Module Video</p>
        <p className="text-stone-400 dark:text-zinc-600 text-xs max-w-xs text-center">{title}</p>
      </div>
    )}
  </div>
);


// ═══════════════════════════════════════════════════════════════════
// FLOATING AUDIO PLAYER
// ═══════════════════════════════════════════════════════════════════
const FloatingAudioPlayer = ({ audio, totalSections, sectionTitles, onClose }) => {
  // Show player when actively playing OR paused (but not when fully stopped)
  if (!audio.isActive) return null;

  const progress = totalSections > 0 && audio.currentSection >= 0
    ? ((audio.currentSection + 1) / totalSections) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-stone-200 dark:border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-stone-100 dark:bg-zinc-800">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 dark:from-amber-500 dark:to-amber-400 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }} />
          </div>

          {/* Error banner */}
          {audio.error && (
            <div className="px-5 py-2 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-center justify-between">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{audio.error}</p>
              <button onClick={audio.clearError} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-2">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="px-5 py-3.5 flex items-center gap-4">
            {/* Section info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-orange-500 dark:text-amber-400">
                {audio.isLoading ? 'Loading audio...' :
                  audio.isPaused ? 'Paused' :
                  audio.currentSection >= 0 ? `Section ${audio.currentSection + 1} of ${totalSections}` : 'Ready'}
              </p>
              <p className="text-sm font-semibold text-stone-700 dark:text-zinc-300 truncate">
                {audio.currentSection >= 0 ? (sectionTitles[audio.currentSection] || 'Playing...') : 'Preparing...'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button onClick={audio.skipBack}
                disabled={audio.isLoading}
                className="p-2 text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-30"
                title="Previous section">
                <SkipBack size={16} />
              </button>

              <button onClick={audio.isPlaying ? audio.pause : audio.resume}
                disabled={audio.isLoading && !audio.isPlaying}
                className="p-3 bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black rounded-full transition-all shadow-lg shadow-orange-500/20 dark:shadow-amber-500/20 disabled:opacity-50">
                {audio.isLoading ? (
                  <div className="w-[18px] h-[18px] border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : audio.isPlaying ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} className="ml-0.5" />
                )}
              </button>

              <button onClick={audio.skipForward}
                disabled={audio.isLoading}
                className="p-2 text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-30"
                title="Next section">
                <SkipForward size={16} />
              </button>
            </div>

            {/* Speed + Close */}
            <div className="flex items-center gap-1.5">
              <button onClick={audio.cycleSpeed}
                className="px-2.5 py-1.5 bg-stone-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-stone-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-amber-400 transition-colors min-w-[44px] text-center">
                {audio.speed}x
              </button>
              <button onClick={() => { audio.stop(); onClose(); }}
                className="p-2 text-stone-400 dark:text-zinc-500 hover:text-red-500 transition-colors" title="Stop">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS (SIDEBAR NAV)
// ═══════════════════════════════════════════════════════════════════
const TableOfContents = ({ sections, activeIndex, readSections, onSelect, isOpen, onToggle }) => (
  <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
    <div className="lg:sticky lg:top-24">
      <div className="bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-stone-400 dark:text-zinc-500">In This Lesson</h4>
          <button onClick={onToggle} className="lg:hidden p-1 text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-1">
          {sections.map((section, idx) => {
            const isActive = activeIndex === idx;
            const isRead = readSections.has(idx);
            return (
              <button key={idx} onClick={() => onSelect(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group text-[13px]
                  ${isActive
                    ? 'bg-orange-50 dark:bg-amber-500/10 text-orange-600 dark:text-amber-400 font-bold'
                    : isRead
                      ? 'text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-zinc-800/50 font-medium'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all
                  ${isActive
                    ? 'bg-orange-500 dark:bg-amber-500 text-white dark:text-black'
                    : isRead
                      ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-500'}`}>
                  {isRead ? <CheckCircle size={12} /> : idx + 1}
                </span>
                <span className="truncate">{section.heading}</span>
              </button>
            );
          })}
          <div className="border-t border-stone-100 dark:border-zinc-800 mt-2 pt-2 space-y-1">
            <button onClick={() => onSelect(sections.length)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-stone-500 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-amber-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-all flex items-center gap-3">
              <Star size={14} className="shrink-0" /> Core Takeaway
            </button>
            <button onClick={() => onSelect(sections.length + 1)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-stone-500 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-amber-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-all flex items-center gap-3">
              <GraduationCap size={14} className="shrink-0" /> Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// ═══════════════════════════════════════════════════════════════════
// MAIN MODULE VIEW
// ═══════════════════════════════════════════════════════════════════
const ModuleView = ({ module, onComplete, onBack, quizResult }) => {
  const [phase, setPhase] = useState("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [readSections, setReadSections] = useState(new Set());
  const [tocOpen, setTocOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const sectionRefs = useRef([]);
  const contentRef = useRef(null);
  const coreRef = useRef(null);
  const assessRef = useRef(null);

  // Pass moduleId so audio auto-resets on module change
  const audio = useAudioPlayer(module.id);

  // ── Reset ALL component state when module changes ──
  useEffect(() => {
    setPhase("lesson");
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setAnswers([]);
    setActiveSection(0);
    setReadSections(new Set());
    setTocOpen(false);
    setReadingProgress(0);
    setShowAudioPlayer(false);
    sectionRefs.current = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [module.id]);

  // Estimate reading time
  const totalWords = module.sections.reduce((acc, s) => acc + s.paragraphs.join(' ').split(' ').length, 0);
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  // IntersectionObserver for active section tracking
  useEffect(() => {
    if (phase !== 'lesson') return;
    // Small delay to ensure refs are populated after render
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const idx = parseInt(entry.target.dataset.sectionIndex);
              if (!isNaN(idx)) {
                setActiveSection(idx);
                setReadSections(prev => new Set([...prev, idx]));
              }
            }
          });
        },
        { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
      );
      sectionRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [phase, module.id]);

  // Reading progress bar
  useEffect(() => {
    if (phase !== 'lesson') return;
    const handleScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [phase]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [phase, currentQ]);

  const scrollToSection = (idx) => {
    if (idx < module.sections.length) {
      sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (idx === module.sections.length) {
      coreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      assessRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTocOpen(false);
  };

  // Build all text segments for audio playback
  const buildAudioSections = useCallback(() => {
    const parts = [];
    parts.push(`Module ${module.id}: ${module.title}. ${module.quote.text}, by ${module.quote.author}.`);
    module.sections.forEach(s => {
      parts.push(`${s.heading}. ${s.paragraphs.join(' ')}`);
    });
    parts.push(`Core Takeaway. ${module.coreLesson}`);
    return parts;
  }, [module]);

  const sectionTitles = ['Introduction', ...module.sections.map(s => s.heading), 'Core Takeaway'];

  const startListening = useCallback((fromSection = 0) => {
    setShowAudioPlayer(true);
    audio.playSections(buildAudioSections(), fromSection);
  }, [audio, buildAudioSections]);

  const handleAnswer = (idx) => { if (answered) return; setSelected(idx); setAnswered(true); setAnswers(prev => [...prev, { question: currentQ, selected: idx, correct: module.quiz[currentQ].a }]); };
  const handleNext = () => { if (currentQ < module.quiz.length - 1) { setCurrentQ(currentQ + 1); setSelected(null); setAnswered(false); } else { setPhase("results"); } };
  const handleRetake = () => { setCurrentQ(0); setSelected(null); setAnswered(false); setAnswers([]); setPhase("quiz"); };
  const startQuiz = () => { audio.stop(); setCurrentQ(0); setSelected(null); setAnswered(false); setAnswers([]); setPhase("quiz"); };

  const score = answers.filter(a => a.selected === a.correct).length;
  const passingCount = Math.ceil(module.quiz.length * 0.8);
  const passed = score >= passingCount;


  // ═══════════════ LESSON PHASE ═══════════════
  if (phase === "lesson") {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors duration-300">
        {/* Reading progress bar */}
        <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-stone-200/50 dark:bg-zinc-900/50">
          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 dark:from-amber-500 dark:to-amber-400 transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }} />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <button onClick={() => { audio.stop(); onBack(); }}
              className="flex items-center gap-2 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <button onClick={() => setTocOpen(!tocOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-amber-400 text-xs font-bold transition-colors">
                <ListOrdered size={14} /> Contents
              </button>

              <button onClick={() => startListening(0)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${audio.isActive
                    ? 'bg-orange-500 dark:bg-amber-500 text-white dark:text-black'
                    : 'bg-orange-500/10 dark:bg-amber-500/10 border border-orange-500/20 dark:border-amber-500/20 text-orange-600 dark:text-amber-400 hover:bg-orange-500/20 dark:hover:bg-amber-500/20'}`}>
                <Headphones size={14} /> {audio.isActive ? 'Restart' : 'Listen'}
              </button>

              <p className="text-orange-500 dark:text-amber-400 text-[11px] font-bold tracking-[0.15em] uppercase hidden sm:block">Module {module.id}/10</p>
            </div>

            {quizResult?.passed ? (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle size={16} /><span className="text-xs font-bold hidden sm:inline">Passed</span>
              </div>
            ) : <div className="w-16" />}
          </div>
        </div>

        {/* Mobile TOC overlay */}
        {tocOpen && (
          <div className="fixed inset-0 z-[55] lg:hidden">
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setTocOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-950 p-4 pt-16 overflow-y-auto shadow-2xl">
              <TableOfContents sections={module.sections} activeIndex={activeSection} readSections={readSections}
                onSelect={scrollToSection} isOpen={true} onToggle={() => setTocOpen(false)} />
            </div>
          </div>
        )}

        {/* Main layout: Content + Sidebar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-8">
            {/* SIDEBAR */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <TableOfContents sections={module.sections} activeIndex={activeSection} readSections={readSections}
                  onSelect={scrollToSection} isOpen={true} onToggle={() => {}} />

                <div className="mt-4 bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 dark:text-zinc-500 flex items-center gap-1.5"><Clock size={12} /> ~{readingTime} min read</span>
                    <span className="text-stone-400 dark:text-zinc-500 flex items-center gap-1.5"><Eye size={12} /> {readSections.size}/{module.sections.length}</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${(readSections.size / module.sections.length) * 100}%` }} />
                  </div>
                </div>

                {audio.hasElevenLabs && (
                  <div className="mt-3 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
                    <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1"><Mic size={10} /> ElevenLabs Active</p>
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-w-0 space-y-8" ref={contentRef}>
              {/* Title Card */}
              <div className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-800/50 border border-stone-200 dark:border-zinc-800 rounded-2xl p-7 sm:p-10 overflow-hidden shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/5 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-orange-500/10 dark:bg-amber-500/10 border border-orange-500/15 dark:border-amber-500/20 px-3 py-1.5 rounded-full text-orange-600 dark:text-amber-400 text-[10px] font-bold tracking-[0.15em] uppercase">
                      Module {module.id}
                    </span>
                    <span className="text-stone-400 dark:text-zinc-600 text-xs flex items-center gap-1"><Clock size={12} /> {readingTime} min read</span>
                    <span className="text-stone-400 dark:text-zinc-600 text-xs flex items-center gap-1"><BookOpen size={12} /> {module.sections.length} sections</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                    {module.title}
                  </h1>
                  <p className="text-stone-500 dark:text-zinc-400 text-sm sm:text-base mt-2">{module.subtitle}</p>

                  <div className="mt-7 bg-stone-50 dark:bg-black/40 rounded-xl p-5 sm:p-6 border-l-4 border-orange-500 dark:border-amber-500">
                    <p className="text-stone-700 dark:text-zinc-300 italic text-sm sm:text-base leading-relaxed">"{module.quote.text}"</p>
                    <p className="text-orange-600 dark:text-amber-400 text-xs font-bold mt-3">— {module.quote.author}</p>
                  </div>

                  <button onClick={() => startListening(0)}
                    className="mt-6 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-orange-500/10 dark:bg-amber-500/10 border border-orange-500/20 dark:border-amber-500/20 text-orange-600 dark:text-amber-400 text-sm font-bold hover:bg-orange-500/20 dark:hover:bg-amber-500/20 transition-all group">
                    <Headphones size={18} className="group-hover:scale-110 transition-transform" />
                    Listen to Full Lesson
                    <span className="text-[10px] text-stone-400 dark:text-zinc-600 font-normal ml-1">~{readingTime} min</span>
                  </button>
                </div>
              </div>

              {/* Video */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-amber-500/15 flex items-center justify-center">
                    <Video size={17} className="text-orange-500 dark:text-amber-400" />
                  </div>
                  <h2 className="text-stone-900 dark:text-white font-bold text-lg">Module Video</h2>
                </div>
                <VideoPlayer videoId={module.videoId} title={module.title} />
              </div>

              {/* Lesson Sections */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-amber-500/15 flex items-center justify-center">
                      <BookOpen size={17} className="text-orange-500 dark:text-amber-400" />
                    </div>
                    <h2 className="text-stone-900 dark:text-white font-bold text-lg">Lesson Content</h2>
                  </div>
                  <div className="lg:hidden text-xs text-stone-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Eye size={12} /> {readSections.size}/{module.sections.length} read
                  </div>
                </div>

                <div className="space-y-5">
                  {module.sections.map((section, idx) => {
                    const isActive = activeSection === idx;
                    const isRead = readSections.has(idx);
                    const isBeingRead = audio.isPlaying && audio.currentSection === idx + 1;
                    return (
                      <div key={idx} ref={el => sectionRefs.current[idx] = el} data-section-index={idx}
                        className={`bg-white dark:bg-zinc-900/60 border rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-sm dark:shadow-none scroll-mt-24
                          ${isBeingRead
                            ? 'border-orange-400 dark:border-amber-500/60 ring-2 ring-orange-400/20 dark:ring-amber-500/20 shadow-lg shadow-orange-500/5'
                            : isActive
                              ? 'border-stone-300 dark:border-zinc-700/60'
                              : 'border-stone-200 dark:border-zinc-800/50 hover:border-stone-300 dark:hover:border-zinc-700/50'}`}>

                        <div className="flex items-start justify-between gap-4 mb-5">
                          <h3 className="text-orange-600 dark:text-amber-300 font-bold text-base sm:text-lg flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all
                              ${isRead
                                ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                                : 'bg-orange-500/10 dark:bg-amber-500/15 text-orange-600 dark:text-amber-400'}`}>
                              {isRead ? <CheckCircle size={14} /> : idx + 1}
                            </span>
                            {section.heading}
                          </h3>

                          <button onClick={() => startListening(idx + 1)}
                            className="shrink-0 p-2 rounded-lg text-stone-400 dark:text-zinc-600 hover:text-orange-500 dark:hover:text-amber-400 hover:bg-orange-50 dark:hover:bg-amber-500/10 transition-all"
                            title="Listen to this section">
                            {isBeingRead ? <Volume2 size={16} className="text-orange-500 dark:text-amber-400 animate-pulse" /> : <Headphones size={16} />}
                          </button>
                        </div>

                        <div className="space-y-4">
                          {section.paragraphs.map((p, pidx) => (
                            <p key={pidx} className="text-stone-600 dark:text-zinc-300/90 leading-[1.85] text-[15px]">{p}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Core Takeaway */}
              <div ref={coreRef} className="scroll-mt-24 bg-orange-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent border border-orange-200 dark:border-amber-500/20 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <Star size={22} className="text-orange-500 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-orange-600 dark:text-amber-300 font-bold text-base mb-2">Core Takeaway</h3>
                    <p className="text-stone-700 dark:text-zinc-300 leading-relaxed text-[15px]">{module.coreLesson}</p>
                  </div>
                </div>
              </div>

              {/* Assessment CTA */}
              <div ref={assessRef} className="scroll-mt-24 bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-sm dark:shadow-none">
                <GraduationCap size={44} className="text-orange-500 dark:text-amber-400 mx-auto mb-5" />
                <h3 className="text-stone-900 dark:text-white font-black text-xl sm:text-2xl mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                  Module {module.id} Assessment
                </h3>
                <p className="text-stone-500 dark:text-zinc-400 text-sm mb-7">
                  {module.quiz.length} questions · {passingCount}/{module.quiz.length} to pass (80%) · Unlimited retakes
                </p>
                {quizResult?.passed ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 px-6 py-3.5 rounded-xl">
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-bold">Passed — {quizResult.score}/{quizResult.total}</span>
                    </div>
                    <div>
                      <button onClick={startQuiz} className="text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-amber-400 text-sm font-medium transition-colors flex items-center gap-1.5 mx-auto mt-3">
                        <RefreshCcw size={14} /> Retake anyway
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={startQuiz}
                    className="bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold px-8 py-4 rounded-xl transition-all inline-flex items-center gap-2.5">
                    Begin Assessment <ArrowRight size={18} />
                  </button>
                )}
              </div>

              {/* Bottom padding for floating player */}
              {showAudioPlayer && <div className="h-24" />}
            </div>
          </div>
        </div>

        {/* Floating Audio Player */}
        {showAudioPlayer && (
          <FloatingAudioPlayer audio={audio} totalSections={buildAudioSections().length} sectionTitles={sectionTitles}
            onClose={() => setShowAudioPlayer(false)} />
        )}
      </div>
    );
  }


  // ═══════════════ QUIZ PHASE ═══════════════
  if (phase === "quiz") {
    const q = module.quiz[currentQ];
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-orange-500 dark:text-amber-400 text-[11px] font-bold tracking-[0.15em] uppercase">Module {module.id} Assessment</span>
              <span className="text-stone-400 dark:text-zinc-500 text-sm font-mono">{currentQ + 1} / {module.quiz.length}</span>
            </div>
            <div className="h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 dark:from-amber-500 dark:to-amber-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQ + 1) / module.quiz.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-none">
            <h3 className="text-stone-900 dark:text-white font-bold text-lg sm:text-xl mb-7 leading-relaxed">{q.q}</h3>
            <div className="space-y-3">
              {q.o.map((opt, idx) => {
                let cls = "border-stone-200 dark:border-zinc-700/60 bg-stone-50 dark:bg-zinc-800/40 hover:border-stone-300 dark:hover:border-zinc-600 hover:bg-stone-100 dark:hover:bg-zinc-800/70 text-stone-700 dark:text-zinc-300";
                if (answered) {
                  if (idx === q.a) cls = "border-green-400 dark:border-green-500/70 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300";
                  else if (idx === selected && idx !== q.a) cls = "border-red-400 dark:border-red-500/70 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300";
                  else cls = "border-stone-100 dark:border-zinc-800/40 bg-stone-50/50 dark:bg-zinc-900/30 text-stone-400 dark:text-zinc-600";
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${cls}`}>
                    <span className="w-8 h-8 rounded-full border-2 border-current/30 flex items-center justify-center text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-[15px] leading-snug flex-1">{opt}</span>
                    {answered && idx === q.a && <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />}
                    {answered && idx === selected && idx !== q.a && <XCircle size={20} className="text-red-500 dark:text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-xl text-sm ${selected === q.a
                  ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300'}`}>
                  {selected === q.a ? "✓ Correct!" : `✗ The correct answer is ${String.fromCharCode(65 + q.a)}.`}
                </div>
                <button onClick={handleNext}
                  className="w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  {currentQ < module.quiz.length - 1 ? <>Next Question <ArrowRight size={18} /></> : <>View Results <Award size={18} /></>}
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setPhase("lesson")}
            className="mt-4 text-stone-400 dark:text-zinc-600 hover:text-stone-600 dark:hover:text-zinc-400 text-sm font-medium transition-colors flex items-center gap-1.5 mx-auto">
            <ChevronLeft size={14} /> Back to lesson
          </button>
        </div>
      </div>
    );
  }


  // ═══════════════ RESULTS PHASE ═══════════════
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-sm dark:shadow-none">
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? "bg-green-50 dark:bg-green-500/15 ring-2 ring-green-300 dark:ring-green-500/30" : "bg-red-50 dark:bg-red-500/15 ring-2 ring-red-300 dark:ring-red-500/30"}`}>
          {passed ? <Award size={44} className="text-green-600 dark:text-green-400" /> : <AlertTriangle size={44} className="text-red-500 dark:text-red-400" />}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>
          {passed ? "Assessment Passed!" : "Not Quite Ready"}
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-lg mb-1">
          Score: <span className="text-stone-900 dark:text-white font-black text-2xl">{score}</span> / {module.quiz.length}
        </p>
        <p className="text-stone-400 dark:text-zinc-600 text-sm mb-8">Required: {passingCount}/{module.quiz.length}</p>

        {passed ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-5">
              <p className="text-green-700 dark:text-green-300 font-medium text-sm">Module {module.id} complete. Progress saved.</p>
            </div>
            <button onClick={() => onComplete(score, module.quiz.length)}
              className="w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all">
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-5 mb-2">
              <p className="text-red-600 dark:text-red-300 font-medium text-sm">Review the material and try again.</p>
            </div>
            <button onClick={handleRetake}
              className="w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <RefreshCcw size={18} /> Retake Assessment
            </button>
            <button onClick={() => setPhase("lesson")}
              className="w-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold py-4 rounded-xl transition-all">
              Review Lesson Material
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
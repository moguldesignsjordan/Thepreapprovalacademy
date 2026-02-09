import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, CheckCircle, XCircle, ArrowRight, Award, RefreshCcw,
  Play, Video, BookOpen, Star, AlertTriangle, GraduationCap
} from 'lucide-react';

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

const ModuleView = ({ module, onComplete, onBack, quizResult }) => {
  const [phase, setPhase] = useState("lesson");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [phase, currentQ]);

  const handleAnswer = (idx) => { if (answered) return; setSelected(idx); setAnswered(true); setAnswers(prev => [...prev, { question: currentQ, selected: idx, correct: module.quiz[currentQ].a }]); };
  const handleNext = () => { if (currentQ < module.quiz.length - 1) { setCurrentQ(currentQ + 1); setSelected(null); setAnswered(false); } else { setPhase("results"); } };
  const handleRetake = () => { setCurrentQ(0); setSelected(null); setAnswered(false); setAnswers([]); setPhase("quiz"); };
  const startQuiz = () => { setCurrentQ(0); setSelected(null); setAnswered(false); setAnswers([]); setPhase("quiz"); };

  const score = answers.filter(a => a.selected === a.correct).length;
  const passingCount = Math.ceil(module.quiz.length * 0.8);
  const passed = score >= passingCount;

  // ═══════════════ LESSON ═══════════════
  if (phase === "lesson") {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors duration-300">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </button>
            <p className="text-orange-500 dark:text-amber-400 text-[11px] font-bold tracking-[0.2em] uppercase">Module {module.id} of 10</p>
            {quizResult?.passed ? (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle size={16} /><span className="text-xs font-bold hidden sm:inline">Passed</span>
              </div>
            ) : <div className="w-16" />}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          {/* Title Card */}
          <div className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-800/50 border border-stone-200 dark:border-zinc-800 rounded-2xl p-7 sm:p-10 overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/5 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-amber-500/10 border border-orange-500/15 dark:border-amber-500/20 px-3 py-1.5 rounded-full mb-4">
                <span className="text-orange-600 dark:text-amber-400 text-[10px] font-bold tracking-[0.15em] uppercase">Module {module.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                {module.title}
              </h1>
              <p className="text-stone-500 dark:text-zinc-400 text-sm sm:text-base mt-2">{module.subtitle}</p>
              {/* Quote */}
              <div className="mt-7 bg-stone-50 dark:bg-black/40 rounded-xl p-5 sm:p-6 border-l-4 border-orange-500 dark:border-amber-500">
                <p className="text-stone-700 dark:text-zinc-300 italic text-sm sm:text-base leading-relaxed">"{module.quote.text}"</p>
                <p className="text-orange-600 dark:text-amber-400 text-xs font-bold mt-3">— {module.quote.author}</p>
              </div>
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

          {/* Lesson Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-amber-500/15 flex items-center justify-center">
                <BookOpen size={17} className="text-orange-500 dark:text-amber-400" />
              </div>
              <h2 className="text-stone-900 dark:text-white font-bold text-lg">Lesson Content</h2>
            </div>
            <div className="space-y-6">
              {module.sections.map((section, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800/50 rounded-2xl p-6 sm:p-8 transition-colors hover:border-stone-300 dark:hover:border-zinc-700/50 shadow-sm dark:shadow-none">
                  <h3 className="text-orange-600 dark:text-amber-300 font-bold text-base sm:text-lg mb-5 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-orange-500/10 dark:bg-amber-500/15 flex items-center justify-center text-xs font-black text-orange-600 dark:text-amber-400 shrink-0">{idx + 1}</span>
                    {section.heading}
                  </h3>
                  <div className="space-y-4">
                    {section.paragraphs.map((p, pidx) => (
                      <p key={pidx} className="text-stone-600 dark:text-zinc-300/90 leading-[1.75] text-[15px]">{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Takeaway */}
          <div className="bg-orange-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent border border-orange-200 dark:border-amber-500/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Star size={22} className="text-orange-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-orange-600 dark:text-amber-300 font-bold text-base mb-2">Core Takeaway</h3>
                <p className="text-stone-700 dark:text-zinc-300 leading-relaxed text-[15px]">{module.coreLesson}</p>
              </div>
            </div>
          </div>

          {/* Assessment CTA */}
          <div className="bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-sm dark:shadow-none">
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
        </div>
      </div>
    );
  }

  // ═══════════════ QUIZ ═══════════════
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

  // ═══════════════ RESULTS ═══════════════
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
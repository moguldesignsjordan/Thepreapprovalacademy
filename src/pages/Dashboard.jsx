import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, BookOpen, Trophy, Award, ArrowRight, CheckCircle, Lock,
  PlayCircle, Home, FileText, Menu, X, ChevronRight, GraduationCap,
  LayoutDashboard, User, Sun, Moon, Settings, Shield
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ProgressRing = ({ progress, size = 80, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" className="stroke-stone-200 dark:stroke-zinc-800" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" className="stroke-orange-500 dark:stroke-amber-500" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
};

const Dashboard = ({ user, progress, modules, onSelectModule, onStartFinal, onLogout, isAdmin, onAdminView }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const completedCount = progress?.completedModules?.length || 0;
  const allModulesComplete = completedCount === 10;
  const overallPercent = Math.round((completedCount / 10) * 100);
  const totalXp = progress?.xp || 0;
  const displayName = user?.displayName || user?.name || user?.email?.split('@')[0] || "Student";

  const SidebarItem = ({ id, label, icon: Icon, onClick }) => (
    <button onClick={onClick || (() => { setActiveView(id); setIsMobileMenuOpen(false); })}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
        ${activeView === id
          ? 'bg-orange-500 dark:bg-amber-500 text-white dark:text-black shadow-lg font-bold'
          : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800/80 hover:text-stone-900 dark:hover:text-white'}`}>
      <Icon size={18} /><span>{label}</span>
    </button>
  );

  // ═══════════════ OVERVIEW ═══════════════
  const OverviewView = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-orange-500 dark:text-amber-400">{displayName.split(' ')[0]}</span>
        </h1>
        <p className="text-stone-400 dark:text-zinc-500 mt-2">Education → Readiness → Ownership</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "XP Earned", value: totalXp, icon: Trophy, color: "text-orange-500 dark:text-amber-400", bg: "bg-orange-500/10 dark:bg-amber-500/10" },
          { label: "Modules", value: `${completedCount} / 10`, icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
          { label: "Certification", value: progress?.finalPassed ? "Earned ✓" : "Pending", icon: Award, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
            <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon size={22} className={stat.color} /></div>
            <div>
              <p className="text-stone-400 dark:text-zinc-500 text-[11px] font-bold tracking-widest uppercase">{stat.label}</p>
              <p className="text-2xl font-black text-stone-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm dark:shadow-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/5 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <ProgressRing progress={overallPercent} size={100} stroke={7} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-900 dark:text-white font-black text-2xl">{overallPercent}%</span>
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-1">
              {progress?.finalPassed ? "Academy Complete! 🎓" : allModulesComplete ? "Ready for Final Assessment" : `Module ${completedCount + 1} of 10`}
            </h3>
            <p className="text-stone-500 dark:text-zinc-400 text-sm">
              {progress?.finalPassed ? `Final Score: ${progress.finalScore}/40 — Graduate Status Earned` :
                allModulesComplete ? "All modules complete. Take the final to earn your certification." : `${10 - completedCount} modules remaining`}
            </p>
          </div>
          {!progress?.finalPassed && (
            <button onClick={() => {
              if (allModulesComplete) { onStartFinal(); }
              else { const next = modules.find(m => !progress?.completedModules?.includes(m.id)); if (next) onSelectModule(next); }
            }}
              className="shrink-0 bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold px-7 py-3.5 rounded-xl transition-all flex items-center gap-2">
              {allModulesComplete ? <><Award size={18} /> Take Final</> : <><PlayCircle size={18} /> Continue</>}
            </button>
          )}
        </div>
      </div>

      {/* Module List */}
      <div>
        <h3 className="text-stone-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-orange-500 dark:text-amber-400" /> Modules
        </h3>
        <div className="space-y-2.5">
          {modules.map((mod, idx) => {
            const isCompleted = progress?.completedModules?.includes(mod.id);
            const isLocked = idx > 0 && !progress?.completedModules?.includes(modules[idx - 1].id);
            const isCurrent = !isCompleted && !isLocked;
            const quizRes = progress?.moduleQuizzes?.[mod.id];
            return (
              <button key={mod.id} onClick={() => !isLocked && onSelectModule(mod)} disabled={isLocked}
                className={`w-full text-left rounded-xl border p-4 transition-all flex items-center gap-3.5 group
                  ${isCompleted ? "bg-white dark:bg-zinc-900/50 border-green-200/60 dark:border-green-500/15 hover:border-green-300 dark:hover:border-green-500/30 shadow-sm dark:shadow-none" :
                    isCurrent ? "bg-white dark:bg-zinc-900 border-orange-300/50 dark:border-amber-500/25 hover:border-orange-400 dark:hover:border-amber-500/50 shadow-md shadow-orange-500/5 dark:shadow-amber-500/5" :
                    "bg-stone-50 dark:bg-zinc-900/20 border-stone-200/50 dark:border-zinc-800/50 opacity-45 cursor-not-allowed"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black
                  ${isCompleted ? "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400" :
                    isCurrent ? "bg-orange-50 dark:bg-amber-500/15 text-orange-600 dark:text-amber-400" :
                    "bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-600"}`}>
                  {isCompleted ? <CheckCircle size={18} /> : isLocked ? <Lock size={16} /> : mod.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm leading-tight truncate ${isCompleted ? "text-stone-500 dark:text-zinc-400" : isCurrent ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-zinc-600"}`}>
                    {mod.title}
                  </p>
                  <p className="text-stone-400 dark:text-zinc-600 text-xs mt-0.5 truncate">{mod.subtitle}</p>
                  {quizRes && (
                    <p className={`text-[11px] mt-1 font-semibold ${quizRes.passed ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>
                      Assessment: {quizRes.score}/{quizRes.total} {quizRes.passed ? "✓" : "— Retry"}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className={`shrink-0 transition-colors ${isLocked ? "text-stone-300 dark:text-zinc-700" : "text-stone-400 dark:text-zinc-600 group-hover:text-orange-500 dark:group-hover:text-amber-400"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Final Assessment Card */}
      <div className={`rounded-2xl border p-6 sm:p-8 text-center transition-all shadow-sm dark:shadow-none
        ${allModulesComplete
          ? "bg-gradient-to-br from-orange-50 dark:from-amber-500/8 to-white dark:to-zinc-900 border-orange-200 dark:border-amber-500/25"
          : "bg-stone-50 dark:bg-zinc-900/20 border-stone-200/50 dark:border-zinc-800/50 opacity-45"}`}>
        <Trophy size={40} className={`mx-auto mb-4 ${allModulesComplete ? "text-orange-500 dark:text-amber-400" : "text-stone-300 dark:text-zinc-700"}`} />
        <h3 className={`font-black text-xl mb-2 ${allModulesComplete ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-zinc-600"}`} style={{ fontFamily: "'Georgia', serif" }}>
          Final Assessment
        </h3>
        <p className={`text-sm mb-6 ${allModulesComplete ? "text-stone-500 dark:text-zinc-400" : "text-stone-400 dark:text-zinc-700"}`}>
          40 questions · 36/40 to pass (90%) · Unlimited retakes
        </p>
        {progress?.finalPassed ? (
          <div className="inline-flex items-center gap-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 px-6 py-3.5 rounded-xl">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-bold">Passed — {progress.finalScore}/40</span>
          </div>
        ) : allModulesComplete ? (
          <button onClick={onStartFinal}
            className="bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold px-8 py-4 rounded-xl transition-all inline-flex items-center gap-2">
            {progress?.finalScore != null ? "Retake Assessment" : "Begin Assessment"} <ArrowRight size={18} />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Lock size={16} className="text-stone-400 dark:text-zinc-600" />
            <span className="text-stone-400 dark:text-zinc-600 text-sm">Complete all 10 modules to unlock</span>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════ CURRICULUM ═══════════════
  const CurriculumView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
        <BookOpen className="text-orange-500 dark:text-amber-400" /> Full Curriculum
      </h2>
      <div className="space-y-3">
        {modules.map((mod, idx) => {
          const isCompleted = progress?.completedModules?.includes(mod.id);
          const isLocked = idx > 0 && !progress?.completedModules?.includes(modules[idx - 1].id);
          const isCurrent = !isCompleted && !isLocked;
          const quizRes = progress?.moduleQuizzes?.[mod.id];
          return (
            <div key={mod.id} onClick={() => !isLocked && onSelectModule(mod)}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer shadow-sm dark:shadow-none
                ${isLocked ? 'bg-stone-50 dark:bg-zinc-950 border-stone-200/50 dark:border-zinc-900 opacity-40 cursor-not-allowed' :
                  isCompleted ? 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-green-300 dark:hover:border-green-500/30' :
                  isCurrent ? 'bg-white dark:bg-zinc-900 border-orange-300/60 dark:border-amber-500/30 shadow-lg shadow-orange-500/5 dark:shadow-amber-500/5 hover:border-orange-400 dark:hover:border-amber-500/60' :
                  'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                  ${isCompleted ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400' :
                    isLocked ? 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-600' :
                    'bg-orange-50 dark:bg-amber-500/15 text-orange-600 dark:text-amber-400'}`}>
                  {isCompleted ? <CheckCircle size={22} /> : isLocked ? <Lock size={18} /> : mod.id}
                </div>
                <div>
                  <h4 className={`font-bold transition-colors ${isCompleted ? 'text-stone-500 dark:text-zinc-400' : 'text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400'}`}>{mod.title}</h4>
                  <p className="text-sm text-stone-400 dark:text-zinc-500">{mod.subtitle}</p>
                  {quizRes && <p className={`text-xs mt-1 font-semibold ${quizRes.passed ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>Assessment: {quizRes.score}/{quizRes.total} {quizRes.passed ? "✓ Passed" : "— Retry"}</p>}
                </div>
              </div>
              {!isLocked && (
                <div className="bg-stone-100 dark:bg-zinc-800 p-2.5 rounded-full text-stone-400 dark:text-zinc-500 group-hover:bg-orange-500 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-black transition-all shrink-0">
                  {isCompleted ? <CheckCircle size={18} /> : <PlayCircle size={18} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ═══════════════ RESOURCES ═══════════════
  const ResourcesView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
        <FileText className="text-orange-500 dark:text-amber-400" /> Resources
      </h2>
      <p className="text-stone-500 dark:text-zinc-400">Guides and tools to support your journey.</p>
      <div className="grid gap-4">
        {[{ title: "Detroit DPA Guidelines", type: "PDF" }, { title: "Monthly Budget Worksheet", type: "Excel" }, { title: "Credit Repair Checklist", type: "PDF" }, { title: "Home Inspection Red Flags", type: "PDF" }].map((res, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 flex justify-between items-center hover:border-stone-300 dark:hover:border-zinc-700 transition-all cursor-pointer group shadow-sm dark:shadow-none">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 p-3 rounded-xl border border-blue-200/50 dark:border-blue-500/15"><FileText size={20} /></div>
              <div>
                <h4 className="font-bold text-stone-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-amber-400 transition-colors">{res.title}</h4>
                <p className="text-xs text-stone-400 dark:text-zinc-500">{res.type}</p>
              </div>
            </div>
            <span className="text-stone-400 dark:text-zinc-600 group-hover:text-stone-900 dark:group-hover:text-white text-sm font-medium">Download</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-black font-sans overflow-hidden text-stone-900 dark:text-zinc-100 transition-colors duration-300">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md p-4 z-50 flex justify-between items-center border-b border-stone-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-orange-500 dark:text-amber-400 text-sm tracking-wider">
          <Home size={18} /> Academy
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/profile')} className="p-2 rounded-full text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-amber-400">
            <Settings size={18} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-amber-400">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-zinc-950 border-r border-stone-200 dark:border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-7 border-b border-stone-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 dark:bg-amber-500 p-2.5 rounded-xl text-white dark:text-black"><Home size={20} /></div>
            <div>
              <h1 className="font-black text-base leading-none uppercase tracking-wider text-stone-900 dark:text-white">Pre-Approval</h1>
              <p className="text-orange-500 dark:text-amber-400 font-black text-sm uppercase tracking-wider">Academy</p>
            </div>
          </div>
          <p className="text-stone-300 dark:text-zinc-600 text-[10px] tracking-widest uppercase mt-2">Initiative 2053</p>
        </div>

        <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <SidebarItem id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarItem id="curriculum" label="Curriculum" icon={BookOpen} />
          <SidebarItem id="resources" label="Resources" icon={FileText} />
          
          {/* Divider */}
          <div className="border-t border-stone-100 dark:border-zinc-800 my-3" />
          
          {/* Admin Panel Link - navigates to /admin */}
          {isAdmin && (
            <SidebarItem 
              id="admin" 
              label="Admin Panel" 
              icon={Shield} 
              onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
            />
          )}
          
          {/* Settings Link */}
          <SidebarItem 
            id="settings" 
            label="Settings" 
            icon={Settings} 
            onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
          />
        </div>

        <div className="p-5 border-t border-stone-100 dark:border-zinc-900 bg-stone-50/50 dark:bg-black/50">
          {/* Theme Toggle */}
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-sm font-medium text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white transition-all">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Clickable User Profile */}
          <button 
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 mb-4 p-2 -mx-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border border-stone-200 dark:border-zinc-700 object-cover" />
            ) : (
              <div className="w-9 h-9 bg-stone-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-orange-500 dark:text-amber-400 font-bold text-sm border border-stone-200 dark:border-zinc-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden flex-1 text-left">
              <p className="font-bold text-stone-900 dark:text-white text-sm truncate group-hover:text-orange-500 dark:group-hover:text-amber-400 transition-colors">{displayName}</p>
              <p className="text-[11px] text-stone-400 dark:text-zinc-500 truncate">View profile →</p>
            </div>
          </button>

          <button onClick={onLogout}
            className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 md:ml-72 flex flex-col h-full relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pt-20 md:pt-8">
          <div className="max-w-5xl mx-auto">
            {activeView === 'overview' && <OverviewView />}
            {activeView === 'curriculum' && <CurriculumView />}
            {activeView === 'resources' && <ResourcesView />}
          </div>
        </main>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
};

export default Dashboard;

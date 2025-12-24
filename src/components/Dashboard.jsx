import React, { useState } from 'react';
import { 
  LayoutDashboard, LogOut, BookOpen, Briefcase, Trophy, Award, 
  ArrowRight, CheckCircle, RefreshCcw, Menu, X, Home, FileText, 
  Lock, PlayCircle 
} from 'lucide-react';

const badges = [
  { id: 'starter', name: 'Legacy Starter', icon: BookOpen, threshold: 0, color: 'text-zinc-500' },
  { id: 'student', name: 'Detroit Dreamer', icon: Briefcase, threshold: 150, color: 'text-blue-400' },
  { id: 'budget', name: 'Budget Boss', icon: Trophy, threshold: 300, color: 'text-yellow-500' },
  { id: 'grad', name: 'Legacy Leader', icon: Award, threshold: 700, color: 'text-purple-400' }
];

const resources = [
  { title: "Detroit DPA Guidelines 2024", type: "PDF", size: "2.4 MB" },
  { title: "Monthly Budget Worksheet", type: "Excel", size: "145 KB" },
  { title: "Credit Repair Checklist", type: "PDF", size: "1.1 MB" },
  { title: "Home Inspection Red Flags", type: "PDF", size: "3.2 MB" },
];

const Dashboard = ({ user, progress, quizState, onLogout, onResume, onReview, lessonData }) => {
  const [activeView, setActiveView] = useState('overview'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- SAFETY CHECKS (Prevents Crashes) ---
  // Ensure we have a valid index, defaulting to 0 if missing
  const currentIndex = progress?.currentLessonIndex || 0;
  // Ensure nextLesson exists. If completed, use the last lesson as fallback to prevent crash
  const nextLesson = lessonData[currentIndex] || lessonData[lessonData.length - 1] || { id: 0, title: "Loading...", subtitle: "" };
  
  const completedCount = progress?.completedLessons?.length || 0;
  const isCourseComplete = completedCount === lessonData.length;
  const progressPercent = Math.round((completedCount / lessonData.length) * 100);
  
  // Safe Quiz State Check
  const quizInProgress = isCourseComplete && quizState && !quizState.completed && quizState.currentQuestion > 0;
  // ----------------------------------------

  // --- SUB-COMPONENTS ---
  const SidebarItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveView(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === id ? 'bg-yellow-500 text-black shadow-lg font-bold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full bg-zinc-800`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );

  // --- VIEWS ---
  const OverviewView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Welcome back, <span className="text-yellow-500">{user.displayName?.split(' ')[0] || "Student"}</span>
        </h1>
        <p className="text-zinc-400 mt-2">Ownership is your legacy. Let's build it.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Current XP" value={progress.xp || 0} icon={Trophy} color="text-yellow-500" />
        <StatCard label="Modules Done" value={`${completedCount} / 10`} icon={CheckCircle} color="text-green-500" />
        <StatCard label="Certification" value={progress.quizPassed ? "Earned" : "Pending"} icon={Award} color="text-purple-500" />
      </div>

      {/* Main Action Card */}
      <div className="bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>

        <div className="p-8 relative z-10">
           <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                    <LayoutDashboard className="text-yellow-500" /> Your Path
                  </h3>
                  <p className="text-zinc-500 text-sm">Course Progress</p>
               </div>
               <span className="text-5xl font-black text-yellow-500">{progressPercent}%</span>
           </div>
        
           {!isCourseComplete ? (
             <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1 w-full">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-white">Up Next</h4>
                    <span className="text-xs font-bold text-black bg-yellow-500 px-2 py-1 rounded uppercase">Module {nextLesson.id}</span>
                 </div>
                 <p className="text-zinc-400 mb-6 text-lg border-l-2 border-zinc-700 pl-4 py-1">
                    <strong className="text-white block">{nextLesson.title}</strong> 
                    {nextLesson.subtitle}
                 </p>
                 <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                   <div className="bg-yellow-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                 </div>
               </div>
               <button 
                 onClick={onResume}
                 className="w-full md:w-auto px-10 py-4 bg-yellow-500 text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 hover:scale-105"
               >
                 <PlayCircle size={24} /> Resume Course
               </button>
             </div>
           ) : (
             <div className="text-center w-full py-6">
               <h4 className="text-3xl font-black mb-4 text-white">
                   {quizInProgress ? "Finish Your Exam" : "Curriculum Complete!"}
               </h4>
               
               {progress.quizPassed ? (
                 <div className="inline-flex flex-col items-center gap-3">
                    <div className="bg-green-900/30 text-green-400 border border-green-500/30 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 animate-pulse">
                      <CheckCircle size={32} /> Certified Mortgage Ready
                    </div>
                    <p className="text-zinc-500 text-sm">You have unlocked all features.</p>
                 </div>
               ) : (
                 <button 
                   onClick={onResume}
                   className="px-12 py-5 bg-yellow-500 text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-transform flex items-center gap-3 mx-auto text-lg"
                 >
                   {quizInProgress ? "Resume Quiz" : "Take Final Exam"} <Award /> 
                 </button>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const CurriculumView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
        <BookOpen className="text-yellow-500" /> Full Curriculum
      </h2>
      <div className="grid gap-4">
        {lessonData.map((lesson, index) => {
          const isCompleted = progress.completedLessons?.includes(lesson.id);
          const isLocked = !isCompleted && index !== currentIndex && !isCourseComplete;
          const isCurrent = index === currentIndex && !isCourseComplete;

          return (
            <div 
              key={lesson.id}
              onClick={() => {
                if (isCompleted || isCurrent) onReview(lesson.id);
              }}
              className={`p-6 rounded-2xl border transition-all flex items-center justify-between group
                ${isLocked ? 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed' : 'bg-zinc-900 border-zinc-800 cursor-pointer hover:border-yellow-500/50 hover:bg-zinc-800'}
                ${isCurrent ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${isCompleted ? 'bg-green-900/20 text-green-500 border border-green-500/20' : isLocked ? 'bg-zinc-800 text-zinc-600' : 'bg-yellow-500 text-black'}
                `}>
                  {isCompleted ? <CheckCircle size={24} /> : isLocked ? <Lock size={20} /> : lesson.id}
                </div>
                <div>
                  <h4 className={`font-bold transition-colors ${isCompleted ? 'text-zinc-400' : 'text-white group-hover:text-yellow-500'}`}>{lesson.title}</h4>
                  <p className="text-sm text-zinc-500">{lesson.subtitle}</p>
                </div>
              </div>
              
              {!isLocked && (
                <div className="bg-zinc-800 p-2 rounded-full text-zinc-400 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  {isCompleted ? <RefreshCcw size={20} /> : <PlayCircle size={20} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );

  const BadgesView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
        <Trophy className="text-yellow-500" /> Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => {
          const isUnlocked = (progress.xp || 0) >= badge.threshold;
          return (
            <div key={badge.id} className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${isUnlocked ? 'bg-zinc-900 border-yellow-500/50 shadow-lg' : 'bg-zinc-950 border-zinc-900 opacity-40 grayscale'}`}>
              <div className={`p-4 rounded-full ${isUnlocked ? 'bg-yellow-500/10' : 'bg-zinc-800'}`}>
                <badge.icon size={32} className={isUnlocked ? badge.color : 'text-zinc-600'} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">{badge.name}</h4>
                <p className="text-sm text-zinc-500">Unlocked at {badge.threshold} XP</p>
                {isUnlocked && <span className="inline-block mt-2 text-xs font-bold text-green-400 bg-green-900/30 border border-green-500/30 px-2 py-1 rounded">UNLOCKED</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const ResourcesView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
        <FileText className="text-yellow-500" /> Student Resources
      </h2>
      <p className="text-zinc-400">Downloadable guides and tools to assist your journey.</p>
      
      <div className="grid gap-4">
        {resources.map((res, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center hover:border-zinc-600 transition-all cursor-pointer group">
             <div className="flex items-center gap-4">
                <div className="bg-blue-900/20 text-blue-400 p-3 rounded-lg border border-blue-500/20">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-yellow-500 transition-colors">{res.title}</h4>
                  <p className="text-xs text-zinc-500">{res.type} • {res.size}</p>
                </div>
             </div>
             <button className="text-zinc-500 group-hover:text-white font-bold text-sm">Download</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black font-sans overflow-hidden text-zinc-100">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-zinc-900/80 backdrop-blur-md text-white p-4 z-50 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-yellow-500 uppercase tracking-wider">
          <Award size={20} /> Academy
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 border-b border-zinc-900">
           <div className="flex items-center gap-3 text-white mb-1">
              <div className="bg-yellow-500 p-2 rounded-lg text-black">
                <Award size={24} />
              </div>
              <h1 className="font-black text-lg leading-none uppercase tracking-wider">Pre Approval<br/><span className="text-yellow-500">Academy</span></h1>
           </div>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem id="overview" label="Dashboard" icon={Home} />
          <SidebarItem id="curriculum" label="Curriculum" icon={BookOpen} />
          <SidebarItem id="badges" label="Achievements" icon={Trophy} />
          <SidebarItem id="resources" label="Resources" icon={FileText} />
        </div>

        <div className="p-6 border-t border-zinc-900 bg-black">
          <div className="flex items-center gap-3 mb-4">
             {user.photoURL ? (
               <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border border-zinc-700" />
             ) : (
               <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500 font-bold border border-zinc-700">
                  {user.displayName?.charAt(0) || "U"}
               </div>
             )}
             <div className="overflow-hidden">
               <p className="font-bold text-white truncate">{user.displayName || "Student"}</p>
               <p className="text-xs text-zinc-500 truncate">{user.email}</p>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 md:ml-72 flex flex-col h-full relative bg-black">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-20 md:pt-10">
           <div className="max-w-5xl mx-auto">
              {activeView === 'overview' && <OverviewView />}
              {activeView === 'curriculum' && <CurriculumView />}
              {activeView === 'badges' && <BadgesView />}
              {activeView === 'resources' && <ResourcesView />}
           </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
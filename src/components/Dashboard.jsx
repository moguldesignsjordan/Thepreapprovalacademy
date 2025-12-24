import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  BookOpen, 
  Briefcase, 
  Trophy, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  RefreshCcw, 
  Menu, 
  X, 
  Home,
  FileText,
  Settings,
  Lock,
  PlayCircle
} from 'lucide-react';

const badges = [
  { id: 'starter', name: 'Legacy Starter', icon: BookOpen, threshold: 0, color: 'text-zinc-400' },
  { id: 'student', name: 'Detroit Dreamer', icon: Briefcase, threshold: 150, color: 'text-blue-500' },
  { id: 'budget', name: 'Budget Boss', icon: Trophy, threshold: 300, color: 'text-yellow-600' },
  { id: 'grad', name: 'Legacy Leader', icon: Award, threshold: 700, color: 'text-purple-600' }
];

const resources = [
  { title: "Detroit DPA Guidelines 2024", type: "PDF", size: "2.4 MB" },
  { title: "Monthly Budget Worksheet", type: "Excel", size: "145 KB" },
  { title: "Credit Repair Checklist", type: "PDF", size: "1.1 MB" },
  { title: "Home Inspection Red Flags", type: "PDF", size: "3.2 MB" },
];

const Dashboard = ({ user, progress, quizState, onLogout, onResume, onReview, lessonData }) => {
  const [activeView, setActiveView] = useState('overview'); // overview, curriculum, badges, resources
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const nextLesson = lessonData[progress.currentLessonIndex];
  const isCourseComplete = progress.completedLessons.length === lessonData.length;
  const progressPercent = Math.round((progress.completedLessons.length / lessonData.length) * 100);
  const quizInProgress = isCourseComplete && !quizState.completed && quizState.currentQuestion > 0;

  // --- SUB-COMPONENTS ---

  const SidebarItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveView(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === id ? 'bg-yellow-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-zinc-900">{value}</p>
      </div>
    </div>
  );

  // --- VIEWS ---

  const OverviewView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900">Welcome back, {user.displayName?.split(' ')[0]}</h1>
        <p className="text-zinc-500">You are on track to building your legacy.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Current XP" value={progress.xp} icon={Trophy} color="text-yellow-600 bg-yellow-600" />
        <StatCard label="Modules Done" value={`${progress.completedLessons.length} / 10`} icon={CheckCircle} color="text-green-600 bg-green-600" />
        <StatCard label="Certification" value={progress.quizPassed ? "Earned" : "Pending"} icon={Award} color="text-purple-600 bg-purple-600" />
      </div>

      {/* Main Action Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-200">
        <div className="bg-zinc-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-2xl font-bold flex items-center gap-2 mb-1">
               <LayoutDashboard className="text-yellow-600" /> Your Path
             </h3>
             <p className="text-zinc-400 text-sm">Course Progress</p>
           </div>
           <div className="text-right relative z-10">
              <span className="text-4xl font-black text-yellow-600">{progressPercent}%</span>
           </div>
           {/* Background Pattern */}
           <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-10 -translate-y-10">
              <Award size={150} />
           </div>
        </div>
        
        <div className="p-8">
           {!isCourseComplete ? (
             <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1 w-full">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-bold text-zinc-900">Up Next</h4>
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded uppercase">Module {nextLesson.id}</span>
                 </div>
                 <p className="text-zinc-500 mb-6 text-lg"><strong className="text-black">{nextLesson.title}:</strong> {nextLesson.subtitle}</p>
                 <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                   <div className="bg-yellow-600 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                 </div>
               </div>
               <button 
                 onClick={onResume}
                 className="w-full md:w-auto px-8 py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 hover:scale-105"
               >
                 <PlayCircle size={24} /> Resume Course
               </button>
             </div>
           ) : (
             <div className="text-center w-full py-6">
               <h4 className="text-3xl font-black mb-4 text-zinc-900">
                   {quizInProgress ? "Finish Your Exam" : "Curriculum Complete!"}
               </h4>
               
               {progress.quizPassed ? (
                 <div className="inline-flex flex-col items-center gap-3">
                    <div className="bg-green-100 text-green-800 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 animate-pulse">
                      <CheckCircle size={32} /> Certified Mortgage Ready
                    </div>
                    <p className="text-zinc-500 text-sm">You have unlocked all features.</p>
                 </div>
               ) : (
                 <button 
                   onClick={onResume}
                   className="px-12 py-5 bg-yellow-600 text-black font-bold rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto text-lg"
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
      <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
        <BookOpen className="text-yellow-600" /> Full Curriculum
      </h2>
      <div className="grid gap-4">
        {lessonData.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isLocked = !isCompleted && index !== progress.currentLessonIndex && !isCourseComplete;
          const isCurrent = index === progress.currentLessonIndex && !isCourseComplete;

          return (
            <div 
              key={lesson.id}
              onClick={() => {
                if (isCompleted || isCurrent) onReview(lesson.id);
              }}
              className={`p-6 rounded-2xl border transition-all flex items-center justify-between group
                ${isLocked ? 'bg-zinc-50 border-zinc-100 opacity-60 cursor-not-allowed' : 'bg-white border-zinc-200 cursor-pointer hover:border-yellow-600 hover:shadow-md'}
                ${isCurrent ? 'ring-2 ring-yellow-600 ring-offset-2' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${isCompleted ? 'bg-green-100 text-green-600' : isLocked ? 'bg-zinc-200 text-zinc-400' : 'bg-yellow-600 text-white'}
                `}>
                  {isCompleted ? <CheckCircle size={24} /> : isLocked ? <Lock size={20} /> : lesson.id}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 group-hover:text-yellow-700 transition-colors">{lesson.title}</h4>
                  <p className="text-sm text-zinc-500">{lesson.subtitle}</p>
                </div>
              </div>
              
              {!isLocked && (
                <div className="bg-zinc-100 p-2 rounded-full text-zinc-400 group-hover:bg-yellow-600 group-hover:text-white transition-all">
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
      <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
        <Trophy className="text-yellow-600" /> Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => {
          const isUnlocked = progress.xp >= badge.threshold;
          return (
            <div key={badge.id} className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${isUnlocked ? 'bg-white border-yellow-600 shadow-lg' : 'bg-zinc-50 border-zinc-100 opacity-50 grayscale'}`}>
              <div className={`p-4 rounded-full ${isUnlocked ? 'bg-yellow-50' : 'bg-zinc-200'}`}>
                <badge.icon size={32} className={isUnlocked ? badge.color : 'text-zinc-400'} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{badge.name}</h4>
                <p className="text-sm text-zinc-500">Unlocked at {badge.threshold} XP</p>
                {isUnlocked && <span className="inline-block mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">UNLOCKED</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const ResourcesView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
        <FileText className="text-yellow-600" /> Student Resources
      </h2>
      <p className="text-zinc-500">Downloadable guides and tools to assist your journey.</p>
      
      <div className="grid gap-4">
        {resources.map((res, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 flex justify-between items-center hover:shadow-lg transition-shadow cursor-pointer group">
             <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-800 group-hover:text-blue-600 transition-colors">{res.title}</h4>
                  <p className="text-xs text-zinc-400">{res.type} • {res.size}</p>
                </div>
             </div>
             <button className="text-zinc-400 group-hover:text-blue-600 font-bold text-sm">Download</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 font-sans overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-black text-white p-4 z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 font-bold text-yellow-600 uppercase tracking-wider">
          <Award size={20} /> Academy
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR (Desktop Fixed / Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-900 text-zinc-300 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="p-8 border-b border-zinc-800">
           <div className="flex items-center gap-3 text-white mb-1">
              <div className="bg-yellow-600 p-2 rounded-lg text-black">
                <Award size={24} />
              </div>
              <h1 className="font-black text-lg leading-none uppercase tracking-wider">Pre Approval<br/><span className="text-yellow-600">Academy</span></h1>
           </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem id="overview" label="Dashboard" icon={Home} />
          <SidebarItem id="curriculum" label="Curriculum" icon={BookOpen} />
          <SidebarItem id="badges" label="Achievements" icon={Trophy} />
          <SidebarItem id="resources" label="Resources" icon={FileText} />
        </div>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3 mb-4">
             {user.photoURL ? (
               <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border border-zinc-600" />
             ) : (
               <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                  {user.displayName?.charAt(0)}
               </div>
             )}
             <div className="overflow-hidden">
               <p className="font-bold text-white truncate">{user.displayName}</p>
               <p className="text-xs text-zinc-500 truncate">{user.email}</p>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-72 flex flex-col h-full relative">
        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-20 md:pt-10">
           <div className="max-w-5xl mx-auto">
              {activeView === 'overview' && <OverviewView />}
              {activeView === 'curriculum' && <CurriculumView />}
              {activeView === 'badges' && <BadgesView />}
              {activeView === 'resources' && <ResourcesView />}
           </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
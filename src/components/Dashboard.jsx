import React from 'react';
import { LayoutDashboard, LogOut, BookOpen, Briefcase, Trophy, Award, ArrowRight, CheckCircle, RefreshCcw } from 'lucide-react';

const badges = [
  { id: 'starter', name: 'Legacy Starter', icon: BookOpen, threshold: 0, color: 'text-zinc-400' },
  { id: 'student', name: 'Detroit Dreamer', icon: Briefcase, threshold: 150, color: 'text-blue-500' },
  { id: 'budget', name: 'Budget Boss', icon: Trophy, threshold: 300, color: 'text-yellow-600' },
  { id: 'grad', name: 'Legacy Leader', icon: Award, threshold: 700, color: 'text-purple-600' }
];

const Dashboard = ({ user, progress, quizState, onLogout, onResume, onReview, lessonData }) => {
  const nextLesson = lessonData[progress.currentLessonIndex];
  const isCourseComplete = progress.completedLessons.length === lessonData.length;
  const progressPercent = Math.round((progress.completedLessons.length / lessonData.length) * 100);
  const quizInProgress = isCourseComplete && !quizState.completed && quizState.currentQuestion > 0;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans pb-12">
      <nav className="bg-black text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             {user.photoURL ? (
               <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-yellow-600" />
             ) : (
               <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                  {user.displayName?.charAt(0)}
               </div>
             )}
             <div className="hidden md:block">
               <h2 className="font-bold leading-none">{user.displayName}</h2>
               <p className="text-xs text-zinc-400">{progress.xp} XP</p>
             </div>
          </div>
          <button onClick={onLogout} className="text-zinc-400 hover:text-white transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
         {/* Badges Grid */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const isUnlocked = progress.xp >= badge.threshold;
              return (
                <div key={badge.id} className={`bg-white p-4 rounded-xl border-2 ${isUnlocked ? 'border-yellow-600 shadow-md' : 'border-zinc-200 opacity-50'} flex flex-col items-center text-center transition-all`}>
                  <badge.icon size={24} className={`mb-2 ${isUnlocked ? badge.color : 'text-zinc-300'}`} />
                  <p className="font-bold text-sm">{badge.name}</p>
                  <p className="text-xs text-zinc-400">{badge.threshold} XP</p>
                </div>
              )
            })}
         </div>

         {/* Main Action Card */}
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
           <div className="bg-zinc-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <LayoutDashboard className="text-yellow-600" /> Your Path
              </h3>
              <span className="bg-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full">
                 {progressPercent}% Ready
              </span>
           </div>
           
           <div className="p-6 md:p-10 text-center md:text-left">
              {!isCourseComplete ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full">
                    <h4 className="text-2xl font-bold mb-2">Continue Learning</h4>
                    <p className="text-zinc-500 mb-4">Up Next: <strong className="text-black">{nextLesson.title}</strong></p>
                    <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-yellow-600 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                  <button 
                    onClick={onResume}
                    className="w-full md:w-auto px-8 py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    Resume <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-center w-full">
                  <h4 className="text-3xl font-black mb-4">
                      {quizInProgress ? "Finish Your Exam" : "Curriculum Complete!"}
                  </h4>
                  
                  {progress.quizPassed ? (
                    <div className="bg-green-100 text-green-800 px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2 animate-pulse">
                      <CheckCircle size={32} /> Certified Mortgage Ready
                    </div>
                  ) : (
                    <button 
                      onClick={onResume}
                      className="px-10 py-5 bg-yellow-600 text-black font-bold rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
                    >
                      {quizInProgress ? "Resume Quiz" : "Take Final Exam"} <Award /> 
                    </button>
                  )}
                </div>
              )}
           </div>
         </div>

         {/* Review Modules Section */}
         {progress.completedLessons.length > 0 && (
             <div className="mt-8">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-700">
                     <RefreshCcw size={20} /> Review Modules
                 </h3>
                 <div className="grid gap-3 md:grid-cols-2">
                     {lessonData.filter(l => progress.completedLessons.includes(l.id)).map((lesson) => (
                         <button 
                            key={lesson.id}
                            onClick={() => onReview(lesson.id)}
                            className="text-left bg-white p-4 rounded-xl border border-zinc-200 hover:border-yellow-600 hover:shadow-md transition-all flex justify-between items-center group"
                         >
                             <div>
                                 <span className="text-xs font-bold text-zinc-400 uppercase">Module {lesson.id}</span>
                                 <p className="font-bold text-zinc-800 group-hover:text-yellow-700">{lesson.title}</p>
                             </div>
                             <ArrowRight size={16} className="text-zinc-300 group-hover:text-yellow-600" />
                         </button>
                     ))}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, User, Lock, Award } from 'lucide-react';

const LessonModule = ({ lesson, onComplete, onBack }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-4 md:p-8">
      <button onClick={onBack} className="self-start mb-6 flex items-center gap-2 text-zinc-500 hover:text-black font-bold transition-colors">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
         <div className="bg-black text-white p-6 md:p-8">
            <span className="text-yellow-600 font-bold text-xs uppercase tracking-wider">Module {lesson.id}</span>
            <h2 className="text-2xl md:text-4xl font-black mt-2 leading-tight">{lesson.title}</h2>
            <p className="text-zinc-400 mt-1">{lesson.subtitle}</p>
         </div>

         <div className="p-6 md:p-10 space-y-8">
            {/* Objective */}
            <div className="bg-zinc-50 border-l-4 border-yellow-600 p-5 rounded-r-lg">
               <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2">Objective</h3>
               <p className="font-medium text-lg md:text-xl text-zinc-900">{lesson.objective}</p>
            </div>

            {/* Key Points */}
            <ul className="space-y-4">
              {lesson.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-zinc-700 text-lg">{pt}</span>
                </li>
              ))}
            </ul>

            {/* Case Study Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-blue-900 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                      <FileText size={16} /> Case Study: {lesson.caseStudy.character}
                  </h3>
                  <p className="text-zinc-800 italic mb-4 font-serif text-lg leading-relaxed">"{lesson.caseStudy.scenario}"</p>
                  <div className="bg-white/90 p-4 rounded-lg border-l-4 border-blue-500">
                       <p className="text-xs font-bold text-blue-900 uppercase mb-1">The Lesson</p>
                       <p className="text-zinc-700 text-sm md:text-base">{lesson.caseStudy.lesson}</p>
                  </div>
               </div>
            </div>

            {/* Gold Tip Interaction */}
            <div className="pt-4">
              {!showTip ? (
                <button 
                  onClick={() => setShowTip(true)}
                  className="w-full py-6 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-400 font-bold hover:border-yellow-600 hover:text-yellow-600 hover:bg-yellow-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <Lock size={20} className="group-hover:scale-110 transition-transform" /> Tap to Unlock Gold Standard Rule
                </button>
              ) : (
                <div className="bg-black text-white p-8 rounded-xl animate-in fade-in slide-in-from-bottom-4 border-b-4 border-yellow-600 shadow-xl">
                  <div className="flex items-center gap-2 mb-4 text-yellow-500">
                    <Award size={24} />
                    <span className="font-bold text-sm uppercase tracking-widest">Gold Standard Rule</span>
                  </div>
                  <p className="text-xl md:text-2xl italic font-serif leading-relaxed">"{lesson.goldTip}"</p>
                </div>
              )}
            </div>
         </div>

         {/* Footer */}
         <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end sticky bottom-0">
           <button 
             onClick={() => onComplete(lesson.id, lesson.xp)}
             className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
           >
             Complete Module <ChevronRight size={20} />
           </button>
         </div>
      </div>
    </div>
  );
};

export default LessonModule;
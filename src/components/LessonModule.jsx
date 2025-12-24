import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Lock, Award } from 'lucide-react';

const LessonModule = ({ lesson, onComplete, onBack }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="min-h-screen bg-black flex flex-col p-4 md:p-8 text-zinc-100">
      <button onClick={onBack} className="self-start mb-6 flex items-center gap-2 text-zinc-500 hover:text-yellow-500 font-bold transition-colors">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="max-w-3xl w-full mx-auto bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
         <div className="bg-zinc-950 p-6 md:p-8 border-b border-zinc-800 relative">
            {/* Yellow Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
            
            <span className="text-yellow-500 font-bold text-xs uppercase tracking-wider">Module {lesson.id}</span>
            <h2 className="text-2xl md:text-4xl font-black mt-2 leading-tight text-white">{lesson.title}</h2>
            <p className="text-zinc-400 mt-1">{lesson.subtitle}</p>
         </div>

         <div className="p-6 md:p-10 space-y-8">
            {/* Objective */}
            <div className="bg-black/50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
               <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Objective</h3>
               <p className="font-medium text-lg md:text-xl text-white">{lesson.objective}</p>
            </div>

            {/* Key Points */}
            <ul className="space-y-4">
              {lesson.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-zinc-300 text-lg">{pt}</span>
                </li>
              ))}
            </ul>

            {/* Case Study Card */}
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-blue-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                      <FileText size={16} /> Case Study: {lesson.caseStudy.character}
                  </h3>
                  <p className="text-zinc-200 italic mb-4 font-serif text-lg leading-relaxed">"{lesson.caseStudy.scenario}"</p>
                  <div className="bg-black/40 p-4 rounded-lg border-l-4 border-blue-500">
                       <p className="text-xs font-bold text-blue-300 uppercase mb-1">The Lesson</p>
                       <p className="text-zinc-300 text-sm md:text-base">{lesson.caseStudy.lesson}</p>
                  </div>
               </div>
            </div>

            {/* Gold Tip Interaction */}
            <div className="pt-4">
              {!showTip ? (
                <button 
                  onClick={() => setShowTip(true)}
                  className="w-full py-6 border-2 border-dashed border-zinc-700 rounded-xl text-zinc-500 font-bold hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2 group"
                >
                  <Lock size={20} className="group-hover:scale-110 transition-transform" /> Tap to Unlock Gold Standard Rule
                </button>
              ) : (
                <div className="bg-zinc-950 text-white p-8 rounded-xl animate-in fade-in slide-in-from-bottom-4 border-b-4 border-yellow-500 shadow-xl ring-1 ring-zinc-800">
                  <div className="flex items-center gap-2 mb-4 text-yellow-500">
                    <Award size={24} />
                    <span className="font-bold text-sm uppercase tracking-widest">Gold Standard Rule</span>
                  </div>
                  <p className="text-xl md:text-2xl italic font-serif leading-relaxed text-zinc-100">"{lesson.goldTip}"</p>
                </div>
              )}
            </div>
         </div>

         {/* Footer */}
         <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex justify-end sticky bottom-0">
           <button 
             onClick={() => onComplete(lesson.id, lesson.xp)}
             className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
           >
             Complete Module <ChevronRight size={20} />
           </button>
         </div>
      </div>
    </div>
  );
};

export default LessonModule;
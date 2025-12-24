import React from 'react';
import { ArrowRight, CheckCircle, XCircle, Briefcase, Award } from 'lucide-react';

const QuizModule = ({ quizData, quizState, onAnswer, onNext, onDashboard }) => {
  const isComplete = quizState.completed;
  const passed = quizState.score === quizData.length;

  // 1. RESULT VIEW
  if (isComplete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center text-white font-sans">
        <div className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
           <Award size={80} className={`mx-auto mb-6 ${passed ? 'text-yellow-500' : 'text-zinc-600'}`} />
           <h2 className="text-3xl font-black mb-2">Assessment Complete</h2>
           <p className="text-zinc-400 text-lg mb-8">You scored <span className="text-white font-bold text-2xl">{quizState.score}</span> / {quizData.length}</p>
           
           {passed ? (
             <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl mb-8">
               <p className="text-green-400 font-bold text-lg">Perfect Score!</p>
               <p className="text-green-200/70 text-sm mt-1">You are officially Mortgage Ready.</p>
             </div>
           ) : (
             <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl mb-8">
               <p className="text-red-400 font-bold text-lg">Not Quite Ready.</p>
               <p className="text-red-200/70 text-sm mt-1">You need 10/10 to pass. Review and try again.</p>
             </div>
           )}

           <button onClick={onDashboard} className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-zinc-200 transition-colors">
             Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  // 2. QUESTION VIEW
  const q = quizData[quizState.currentQuestion];
  
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4">
       <div className="max-w-2xl w-full bg-white p-6 md:p-10 rounded-2xl shadow-xl border-t-8 border-black">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-sm">Question {quizState.currentQuestion + 1} of {quizData.length}</span>
            <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded">Potential XP: +10</span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Briefcase size={120} className="text-black" />
              </div>
              <div className="relative z-10">
                  <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Briefcase size={14} /> Real-World Scenario
                  </h3>
                  <p className="text-lg font-serif italic text-zinc-800 leading-relaxed">"{q.story}"</p>
              </div>
          </div>

          <h2 className="text-xl font-bold mb-6 text-black">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let statusClass = "border-zinc-200 hover:border-yellow-600 hover:bg-yellow-50";
              if (quizState.selected !== null) {
                 if (idx === q.correct) statusClass = "bg-green-100 border-green-500 text-green-800";
                 else if (idx === quizState.selected) statusClass = "bg-red-50 border-red-500 text-red-800";
                 else statusClass = "opacity-50 grayscale";
              }

              return (
                <button
                  key={idx}
                  onClick={() => onAnswer(idx)}
                  disabled={quizState.selected !== null}
                  className={`w-full p-4 border-2 rounded-xl text-left font-medium transition-all duration-200 flex justify-between items-center ${statusClass}`}
                >
                  <span className="flex-1 mr-2">{opt}</span>
                  {quizState.selected !== null && idx === q.correct && <CheckCircle size={20} className="text-green-600 flex-shrink-0" />}
                  {quizState.selected === idx && idx !== q.correct && <XCircle size={20} className="text-red-600 flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {quizState.selected !== null && (
            <div className="mt-8 flex justify-end animate-in fade-in slide-in-from-bottom-2">
              <button 
                onClick={onNext} 
                className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                 {quizState.currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Exam"} <ArrowRight size={18} />
              </button>
            </div>
          )}
       </div>
    </div>
  );
};

export default QuizModule;
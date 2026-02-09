import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Award, RefreshCcw, Trophy, AlertTriangle, ChevronLeft } from 'lucide-react';

const PASSING_SCORE = 36;
const TOTAL_QUESTIONS = 40;

const FINAL_QUESTIONS = [
  { q: "What is the primary wealth-building benefit of homeownership?", o: ["Lifestyle flexibility", "Fixed monthly payments", "Equity accumulation over time", "Tax deductions"], a: 2 },
  { q: "Why is renting without a long-term plan financially risky?", o: ["Rent is always higher than a mortgage", "Rent builds no equity and often increases", "Rent lowers credit scores", "Rent requires larger deposits"], a: 1 },
  { q: "Equity in a home can be used for which of the following?", o: ["Education expenses", "Business investment", "Purchasing additional property", "All of the above"], a: 3 },
  { q: "Why is the 2053 projection significant in the context of homeownership?", o: ["Mortgage programs will end", "Housing inventory will disappear", "Continued lack of ownership compounds long-term wealth loss", "Credit scoring systems will change"], a: 2 },
  { q: "Which step comes immediately after pre-approval?", o: ["Underwriting", "Closing", "Home search", "Appraisal"], a: 2 },
  { q: "Why do most mortgage issues occur during the process?", o: ["Rates change", "Borrowers don't understand steps or roles", "Appraisals fail", "Lenders delay files"], a: 1 },
  { q: "What is the primary difference between an inspection and an appraisal?", o: ["Inspections protect the lender; appraisals protect the buyer", "Appraisals assess value; inspections assess condition", "Inspections determine loan approval", "Appraisals are optional"], a: 1 },
  { q: "Who prepares the loan file for underwriting?", o: ["Loan Officer", "Loan Processor", "Underwriter", "Title Agent"], a: 1 },
  { q: "What credit factor carries the most weight in mortgage approval?", o: ["Credit mix", "Length of history", "Payment history", "Number of accounts"], a: 2 },
  { q: "Why can high credit card balances hurt a borrower even if payments are on time?", o: ["Interest accrues", "Utilization reports high", "Accounts close", "Mix is affected"], a: 1 },
  { q: "What utilization range is safest during preparation?", o: ["Under 50%", "Under 40%", "Under 30% (ideally under 10%)", "Any balance if paid"], a: 2 },
  { q: "Why should new credit not be opened pre-approval?", o: ["Raises escrow", "Resets risk evaluation", "Lowers income", "Delays appraisal"], a: 1 },
  { q: "Why are credit disputes risky during mortgage preparation?", o: ["They permanently remove accounts", "They inflate scores temporarily and drop later", "They increase balances", "They reset payment history"], a: 1 },
  { q: "When is a bankruptcy generally eligible for standard FHA consideration?", o: ["Immediately after filing", "When the score improves", "After it is discharged or dismissed for at least 24 months", "Never"], a: 2 },
  { q: "What is the purpose of being added as an authorized user?", o: ["To gain spending access", "To transfer debt", "To reflect positive payment history", "To increase income"], a: 2 },
  { q: "What type of income is most favorably viewed by lenders?", o: ["Sporadic cash income", "Stable, documented income", "Gift income", "Rental projections only"], a: 1 },
  { q: "How long must self-employed income typically be documented?", o: ["6 months", "12 months", "24 months", "No documentation needed"], a: 2 },
  { q: "Why do large write-offs matter for self-employed borrowers?", o: ["They increase taxes", "They reduce qualifying income", "They raise credit scores", "They affect appraisal"], a: 1 },
  { q: "Which document is commonly required to verify income?", o: ["Bank screenshots", "Pay stubs and tax returns", "Venmo statements", "Personal budget"], a: 1 },
  { q: "Why is 'mattress money' a problem in underwriting?", o: ["It increases taxes", "It cannot be verified or sourced", "It lowers credit scores", "It delays appraisal"], a: 1 },
  { q: "Why are brick-and-mortar banks often preferred in underwriting?", o: ["Lower fees", "Full transaction histories", "Faster loans", "Higher balances"], a: 1 },
  { q: "How many months of bank statements are typically reviewed?", o: ["1", "2", "6", "12"], a: 1 },
  { q: "What does DTI measure?", o: ["Credit risk", "Asset strength", "Monthly debt compared to income", "Home value"], a: 2 },
  { q: "How are student loans in deferment typically calculated for DTI if no payment is shown?", o: ["$0", "1% of balance", "0.5% of total balance", "Interest-only"], a: 2 },
  { q: "Why might enrolling in an income-based repayment plan help a buyer qualify?", o: ["It raises credit score", "It replaces the loan", "It lowers the monthly DTI calculation", "It removes the debt"], a: 2 },
  { q: "Why is the FHA Play considered a foundation strategy?", o: ["Lowest rates", "Allows up to 6% seller concessions and repeat ownership", "No underwriting", "Investment-only"], a: 1 },
  { q: "What makes 'The 2 Family Play' especially effective in Detroit?", o: ["Low taxes", "High concentration of 2-unit properties", "No maintenance", "Higher appreciation"], a: 1 },
  { q: "How can rental income from a 2-family property help a buyer qualify?", o: ["It replaces credit", "It increases appraisal value", "A portion can be used toward DTI", "It eliminates mortgage insurance"], a: 2 },
  { q: "What is the main advantage of the FHA 203(k) Play?", o: ["Faster closings", "Financing renovations into the mortgage", "No appraisal", "Lower rates"], a: 1 },
  { q: "What makes the VA Play uniquely powerful?", o: ["Lowest rates", "Unlimited seller-paid buyer expenses to help qualify", "No underwriting", "Cash-back allowed"], a: 1 },
  { q: "What is the biggest risk after pre-approval is issued?", o: ["Market changes", "Buyer behavior changes", "Appraisal delays", "Rate locks"], a: 1 },
  { q: "Which action is most likely to kill a deal during conditional approval?", o: ["Asking questions", "Reviewing disclosures", "Opening new credit", "Scheduling inspection"], a: 2 },
  { q: "Who inspects the home to protect the buyer?", o: ["Appraiser", "Underwriter", "Private Inspector", "Title Agent"], a: 2 },
  { q: "What should a buyer do if an appraisal comes in low?", o: ["Ignore it", "Force approval", "Evaluate renegotiation or exit options", "Switch lenders"], a: 2 },
  { q: "Which document shows final terms and cash to close?", o: ["Loan Estimate", "Appraisal", "Closing Disclosure", "Purchase Agreement"], a: 2 },
  { q: "Which action can derail approval after pre-approval?", o: ["Monitoring credit", "Asking questions", "New debt or income changes", "Reviewing documents"], a: 2 },
  { q: "When does legal ownership transfer to the buyer?", o: ["Offer acceptance", "Clear to Close", "After signing and recording", "When keys are received"], a: 2 },
  { q: "Why is choosing a buying strategy before pre-approval important?", o: ["Faster appraisal", "Better agent selection", "Reduced out-of-pocket costs and clearer planning", "Guaranteed approval"], a: 2 },
  { q: "Core principle of this academy:", o: ["Speed over structure", "Approval is guaranteed", "Understanding leads to better decisions", "Credit fixes everything"], a: 2 },
  { q: "What is the single largest contributor to the wealth gap in America?", o: ["Wage differences", "Education access", "Home equity and property ownership", "Stock market participation"], a: 2 }
];

const FinalAssessment = ({ onComplete, onBack, prevResult }) => {
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [phase]);

  const handleAnswer = (idx) => { if (answered) return; setSelected(idx); setAnswered(true); setAnswers(prev => [...prev, { selected: idx, correct: FINAL_QUESTIONS[currentQ].a }]); };
  const handleNext = () => { if (currentQ < FINAL_QUESTIONS.length - 1) { setCurrentQ(currentQ + 1); setSelected(null); setAnswered(false); } else { setPhase("results"); } };
  const handleRetake = () => { setCurrentQ(0); setSelected(null); setAnswered(false); setAnswers([]); setPhase("quiz"); };

  const score = answers.filter(a => a.selected === a.correct).length;
  const passed = score >= PASSING_SCORE;

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-sm dark:shadow-none">
            <Trophy size={60} className="text-orange-500 dark:text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-stone-900 dark:text-white mb-3" style={{ fontFamily: "'Georgia', serif" }}>Final Assessment</h2>
            <p className="text-stone-500 dark:text-zinc-400 mb-8">
              {TOTAL_QUESTIONS} questions across all 10 modules.<br/>
              You need <span className="text-stone-900 dark:text-white font-bold">{PASSING_SCORE}/{TOTAL_QUESTIONS}</span> (90%) to pass.
            </p>
            <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-xl p-5 mb-6 text-left space-y-3">
              <p className="text-stone-600 dark:text-zinc-300 text-sm flex items-center gap-2.5"><CheckCircle size={15} className="text-orange-500 dark:text-amber-400 shrink-0" /> Unlimited attempts — education-first</p>
              <p className="text-stone-600 dark:text-zinc-300 text-sm flex items-center gap-2.5"><CheckCircle size={15} className="text-orange-500 dark:text-amber-400 shrink-0" /> Unlocks: 90-Day Readiness Plan</p>
              <p className="text-stone-600 dark:text-zinc-300 text-sm flex items-center gap-2.5"><CheckCircle size={15} className="text-orange-500 dark:text-amber-400 shrink-0" /> Unlocks: Pre-Approval Scheduling</p>
            </div>
            {prevResult && !prevResult.passed && (
              <div className="bg-orange-50 dark:bg-amber-500/10 border border-orange-200 dark:border-amber-500/20 rounded-xl p-4 mb-6">
                <p className="text-orange-700 dark:text-amber-300 text-sm">Previous attempt: {prevResult.score}/{TOTAL_QUESTIONS}. Keep going!</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={onBack} className="flex-1 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold py-4 rounded-xl transition-all">Back</button>
              <button onClick={handleRetake} className="flex-1 bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all">Begin</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (phase === "quiz") {
    const q = FINAL_QUESTIONS[currentQ];
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-orange-500 dark:text-amber-400 text-[11px] font-bold tracking-[0.15em] uppercase">Final Assessment</span>
              <span className="text-stone-400 dark:text-zinc-500 text-sm font-mono">{currentQ + 1} / {TOTAL_QUESTIONS}</span>
            </div>
            <div className="h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 dark:from-amber-500 dark:to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${((currentQ + 1) / TOTAL_QUESTIONS) * 100}%` }} />
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-none">
            <h3 className="text-stone-900 dark:text-white font-bold text-lg sm:text-xl mb-7 leading-relaxed">{q.q}</h3>
            <div className="space-y-3">
              {q.o.map((opt, idx) => {
                let cls = "border-stone-200 dark:border-zinc-700/60 bg-stone-50 dark:bg-zinc-800/40 hover:border-stone-300 dark:hover:border-zinc-600 text-stone-700 dark:text-zinc-300";
                if (answered) {
                  if (idx === q.a) cls = "border-green-400 dark:border-green-500/70 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300";
                  else if (idx === selected && idx !== q.a) cls = "border-red-400 dark:border-red-500/70 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300";
                  else cls = "border-stone-100 dark:border-zinc-800/40 bg-stone-50/50 dark:bg-zinc-900/30 text-stone-400 dark:text-zinc-600";
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-4 ${cls}`}>
                    <span className="w-8 h-8 rounded-full border-2 border-current/30 flex items-center justify-center text-sm font-bold shrink-0">{String.fromCharCode(65 + idx)}</span>
                    <span className="text-[15px] leading-snug flex-1">{opt}</span>
                    {answered && idx === q.a && <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />}
                    {answered && idx === selected && idx !== q.a && <XCircle size={20} className="text-red-500 dark:text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <button onClick={handleNext}
                className="mt-6 w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                {currentQ < TOTAL_QUESTIONS - 1 ? <>Next <ArrowRight size={18} /></> : <>View Results <Award size={18} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-sm dark:shadow-none">
        {passed ? (
          <>
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 dark:from-amber-400 dark:to-amber-600 flex items-center justify-center shadow-xl shadow-orange-500/25 dark:shadow-amber-500/25">
              <Trophy size={56} className="text-white dark:text-black" />
            </div>
            <h2 className="text-3xl font-black text-stone-900 dark:text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>Congratulations!</h2>
            <p className="text-orange-600 dark:text-amber-300 font-bold text-lg mb-1">You Passed the Final Assessment</p>
            <p className="text-stone-500 dark:text-zinc-400 mb-8">Score: <span className="text-stone-900 dark:text-white font-bold text-2xl">{score}</span> / {TOTAL_QUESTIONS}</p>
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 rounded-xl p-6 mb-6 text-left space-y-3">
              <p className="text-green-700 dark:text-green-300 text-sm flex items-center gap-2"><CheckCircle size={16} /> 90-Day Dynamic Readiness Plan — Unlocked</p>
              <p className="text-green-700 dark:text-green-300 text-sm flex items-center gap-2"><CheckCircle size={16} /> Pre-Approval Scheduling Path — Unlocked</p>
            </div>
            <button onClick={() => onComplete(score, true)}
              className="w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all">
              Return to Dashboard
            </button>
          </>
        ) : (
          <>
            <AlertTriangle size={60} className="text-red-500 dark:text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2">Not Quite There</h2>
            <p className="text-stone-500 dark:text-zinc-400 mb-1">Score: <span className="text-stone-900 dark:text-white font-bold text-2xl">{score}</span> / {TOTAL_QUESTIONS}</p>
            <p className="text-stone-400 dark:text-zinc-600 text-sm mb-8">Need {PASSING_SCORE} to pass. Review modules and try again.</p>
            <div className="space-y-3">
              <button onClick={handleRetake}
                className="w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                <RefreshCcw size={18} /> Retake Assessment
              </button>
              <button onClick={() => onComplete(score, false)}
                className="w-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-bold py-4 rounded-xl transition-all">
                Review Modules First
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinalAssessment;
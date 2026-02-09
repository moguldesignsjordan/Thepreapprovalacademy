import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ModuleView from './components/ModuleView';
import FinalAssessment from './components/FinalAssessment';
import { ShieldCheck, User } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// MODULE CURRICULUM DATA (10 MODULES)
// ═══════════════════════════════════════════════════════════════════
const MODULES = [
  {
    id: 1,
    title: "The Why: Homeownership, Wealth & Urgency",
    subtitle: "Why This Matters — Especially in Detroit",
    quote: { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
    videoId: "MODULE_1_VIDEO_ID",
    xp: 50,
    sections: [
      { heading: "Why Homeownership Is Different", paragraphs: [
        "For most people, housing is the biggest bill they'll ever pay. When you rent, that bill goes up and disappears. When you own, part of that same payment builds equity — something that stays with you.",
        "Rent is an expense. A mortgage is a forced savings mechanism. When you own, part of your payment builds equity, housing costs stabilize, and appreciation works in your favor over time. When you rent, payments increase, equity goes to someone else, and long-term security is limited.",
        "Homeownership isn't about status. It's about control."
      ]},
      { heading: "The Detroit Reality", paragraphs: [
        "Black homeownership has declined, and if nothing changes, projections show Black net worth could approach zero by 2053. That's not theory — that's trajectory.",
        "Detroit sits at the center of this conversation: one of the largest Black populations in the country, rising rents, investors buying properties at scale, and fewer Black buyers owning the homes in their own neighborhoods.",
        "A large percentage of Detroit households are cost-burdened. Many renters spend over 30–40% of income on housing. Homeownership rates among Black residents lag behind demand. At the same time, out-of-state investors continue acquiring property and neighborhood ownership is shifting. Ownership determines who benefits from Detroit's future."
      ]},
      { heading: "Why Waiting Costs More", paragraphs: [
        "Waiting feels safe — but it's expensive. Rent increases compound, home prices trend upward, and buying power erodes with inflation. Time is the most undervalued factor in real estate.",
        "The goal is not perfection. The goal is preparedness."
      ]},
      { heading: "Education Before Application", paragraphs: [
        "This academy is not designed to rush you. It's designed to eliminate surprises, build discipline, increase approval odds, and protect you from costly mistakes.",
        "Knowledge doesn't guarantee approval — but lack of knowledge almost guarantees denial."
      ]}
    ],
    coreLesson: "Homeownership is not just a personal decision. It's an economic one with generational impact. Understanding the stakes changes how you move.",
    quiz: [
      { q: "Why is rent considered a financial liability long-term?", o: ["It lowers credit scores", "It builds no equity and often increases", "It requires deposits", "It limits employment"], a: 1 },
      { q: "What makes homeownership a wealth-building tool?", o: ["Tax deductions", "Fixed payments", "Equity accumulation over time", "Insurance coverage"], a: 2 },
      { q: "Why is Detroit especially important in the homeownership conversation?", o: ["Lower interest rates", "Large investor activity and declining local ownership", "More inventory", "Faster closings"], a: 1 },
      { q: "What is the biggest risk of waiting to buy without a plan?", o: ["Higher taxes", "Rising rents and lost buying power", "Credit score changes", "Appraisal delays"], a: 1 }
    ]
  },
  {
    id: 2, title: "Equity, Mindset & Ownership Readiness", subtitle: "How Housing Becomes Wealth",
    quote: { text: "If you make a consumer conscious, you can make a people conscious.", author: "Carter G. Woodson" },
    videoId: "MODULE_2_VIDEO_ID", xp: 50,
    sections: [
      { heading: "What Equity Is (Plain Language)", paragraphs: ["Equity is the portion of a home that you own, not the bank. It's calculated as what the home is worth minus what you still owe on the mortgage.", "Equity grows in two ways: each mortgage payment reduces the loan balance, and over time, the property may increase in value. Rent does not create equity."] },
      { heading: "Why Equity Matters So Much", paragraphs: ["Right now, home equity represents roughly 48% of total wealth in America. Nearly half of all wealth in this country comes from owning property.", "When one group owns homes and another rents long-term, one group builds equity and the other pays housing costs with no asset at the end. This is why researchers project that Black net worth could approach zero by 2053 if ownership rates don't change."] },
      { heading: "Renting vs Owning: The Real Difference", paragraphs: ["Renting means payments increase over time, no equity is built, and no long-term asset is created. Owning means part of every payment builds equity, housing costs stabilize over time, and an appreciating asset is created.", "Renting is not failure. But renting without a long-term ownership or exit plan is expensive."] },
      { heading: "The Mindset Shift", paragraphs: ["Preparing for homeownership requires a shift from 'What's easiest right now?' to 'What builds something over time?'", "This is not about rushing to buy. It's about positioning yourself on the ownership side of the equation."] }
    ],
    coreLesson: "Equity is how housing becomes wealth. Understanding equity changes how you view renting, buying, waiting, and preparing.",
    quiz: [
      { q: "What is equity in a home?", o: ["The purchase price", "The amount the bank owns", "The difference between value and what is owed", "Monthly payments"], a: 2 },
      { q: "Why is equity such a powerful wealth-building tool?", o: ["It lowers rates", "It represents nearly half of all wealth in America", "It replaces income", "It eliminates taxes"], a: 1 },
      { q: "What mindset shift is required for homeownership?", o: ["Buy ASAP", "Housing is only an expense", "Shift from paying for housing to investing in housing", "Avoid responsibility until closing"], a: 2 }
    ]
  },
  {
    id: 3, title: "The Mortgage System", subtitle: "Roles, Steps & Structure",
    quote: { text: "A lack of transparency results in distrust and a deep sense of insecurity.", author: "Dalai Lama" },
    videoId: "MODULE_3_VIDEO_ID", xp: 50,
    sections: [
      { heading: "Understanding the Process", paragraphs: ["Every mortgage follows the same basic process. Most problems happen because people don't understand where they are in the process, who is responsible for what, and what happens next."] },
      { heading: "The Mortgage Process — Step by Step", paragraphs: ["The standard mortgage process: Education, Pre-Approval, Home Search, Offer & Contract, Earnest Money Deposit, Inspection, Loan Processing, Underwriting, Appraisal, Conditional Approval, and Closing.", "Skipping steps or moving out of order creates delays, stress, and sometimes denial."] },
      { heading: "The Professionals Involved", paragraphs: ["The Buyer's Agent represents you. The Listing Agent represents the seller. Your Loan Officer reviews income, credit, and assets. The Loan Processor prepares the file for underwriting.", "The Underwriter is the lender's risk decision-maker. The Title Company ensures the property can legally transfer. The Inspector evaluates condition (protects you). The Appraiser determines value (protects the lender)."] },
      { heading: "FHA vs Other Programs", paragraphs: ["FHA guidelines are generally more flexible. This academy focuses on FHA standards because they offer a realistic entry point for first-time buyers."] }
    ],
    coreLesson: "Understanding the mortgage process and the roles involved eliminates confusion and empowers you to move confidently.",
    quiz: [
      { q: "Which step comes after pre-approval?", o: ["Underwriting", "Closing", "Home search", "Appraisal"], a: 2 },
      { q: "Who prepares the loan file for underwriting?", o: ["Loan Officer", "Loan Processor", "Underwriter", "Title Agent"], a: 1 },
      { q: "Who determines whether the loan meets guidelines?", o: ["Loan Officer", "Loan Processor", "Underwriter", "Realtor"], a: 2 },
      { q: "Who represents the buyer?", o: ["Listing Agent", "Buyer's Agent", "Appraiser", "Title Company"], a: 1 },
      { q: "Who determines market value for the lender?", o: ["Inspector", "Buyer's Agent", "Appraiser", "Insurance Agent"], a: 2 },
      { q: "What best describes an inspection?", o: ["Determines value", "Protects the lender", "Protects the buyer", "Replaces appraisal"], a: 2 },
      { q: "Who facilitates the closing?", o: ["Loan Officer", "Insurance Agent", "Title Company / Closing Agent", "Appraiser"], a: 2 }
    ]
  },
  {
    id: 4, title: "Credit: What Actually Matters", subtitle: "How Lenders Evaluate Risk",
    quote: { text: "Every financial decision you make sends a signal.", author: "Claude Anderson" },
    videoId: "MODULE_4_VIDEO_ID", xp: 75,
    sections: [
      { heading: "What Lenders Look At", paragraphs: ["Credit is about patterns, predictability, and discipline. Three factors matter most: payment history, credit utilization, and length of credit history."] },
      { heading: "Payment History & Utilization", paragraphs: ["One late payment can drop a score 50–100 points. Utilization under 30% is acceptable, under 10% is ideal. It's not about when you pay — it's about what balance reports when the statement closes."] },
      { heading: "Credit History, Mix & Authorized Users", paragraphs: ["Old accounts help your score even if unused. Don't close them. An authorized user is added for reporting purposes only — no spending access needed."] },
      { heading: "Collections Strategy", paragraphs: ["Don't make small monthly payments on collections — that restarts the reporting clock. Save about 50% and negotiate a lump-sum settlement. Request pay-for-delete. Get everything in writing."] },
      { heading: "What NOT to Do", paragraphs: ["During mortgage preparation: no new credit cards, no car financing, no store cards. Every inquiry sends a risk signal. Silence is safer than activity."] }
    ],
    coreLesson: "Credit is about patterns, not perfection. When you understand how lenders read credit, you can position yourself strategically.",
    quiz: [
      { q: "What is the most important credit factor?", o: ["Credit mix", "Length of history", "Payment history", "Number of accounts"], a: 2 },
      { q: "Why can on-time payers still have low scores?", o: ["Rates too high", "High balances report at statement close", "Limits too low", "Accounts too old"], a: 1 },
      { q: "Safest utilization range?", o: ["Under 50%", "Under 40%", "Under 30% (ideally under 10%)", "Any if paid on time"], a: 2 },
      { q: "Which action MOST hurts during pre-approval?", o: ["Keeping old accounts", "Using auto-pay", "Opening new credit", "Paying balances early"], a: 2 },
      { q: "Why avoid small monthly payments on collections?", o: ["Increase interest", "Restart reporting clock", "Reduce limits", "Delay underwriting"], a: 1 },
      { q: "Strongest collection settlement strategy?", o: ["Payment plan", "Pay full balance", "Lump-sum at ~50% saved", "Ignore it"], a: 2 },
      { q: "What does authorized user status do?", o: ["Gives spending access", "Transfers debt", "Reflects positive payment history", "Opens new account"], a: 2 },
      { q: "Why are credit disputes risky?", o: ["Remove history permanently", "Inflate scores temporarily then drop", "Increase utilization", "Close accounts"], a: 1 },
      { q: "Bankruptcy eligibility for FHA?", o: ["Immediately", "When score improves", "Discharged/dismissed 24+ months", "Never"], a: 2 },
      { q: "Why are secured cards and rent reporting helpful?", o: ["Replace good habits", "Guarantee approval", "Add positive history when used responsibly", "Remove negatives"], a: 2 }
    ]
  },
  {
    id: 5, title: "Income & Employment: Stability Matters Most", subtitle: "How Lenders Decide What You Actually Make",
    quote: { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
    videoId: "MODULE_5_VIDEO_ID", xp: 50,
    sections: [
      { heading: "Qualifying Income", paragraphs: ["Lenders ask: 'Is this income stable, predictable, and likely to continue?' Income must be verifiable, consistent, and expected to continue for at least 3 years."] },
      { heading: "Employment History & W-2 Income", paragraphs: ["Most programs look for 2 years in the same line of work. Changing employers is OK; changing industries creates scrutiny. Hourly income uses regular hours; overtime must show consistency."] },
      { heading: "Self-Employed Income", paragraphs: ["Lenders use net taxable income, not gross revenue. Write-offs lower qualifying income. High revenue does not equal high qualifying income. Planning matters more than earnings."] },
      { heading: "What NOT to Do", paragraphs: ["Don't change jobs, pay structure, or go from W-2 to self-employed during preparation. Even positive changes can delay underwriting."] }
    ],
    coreLesson: "Income qualification is mathematical and document-based. When structured correctly, buying power increases and approvals happen faster.",
    quiz: [
      { q: "What income do lenders prioritize?", o: ["Potential", "Gross", "Stable and likely-to-continue", "Cash"], a: 2 },
      { q: "Why is employment history important?", o: ["Affects rates", "Shows stability", "Impacts appraisal", "Replaces credit"], a: 1 },
      { q: "Self-employed qualifying income is based on:", o: ["Gross revenue", "Bank deposits", "Net taxable income", "Projections"], a: 2 },
      { q: "Why can write-offs reduce eligibility?", o: ["Increase taxes", "Lower net qualifying income", "Affect utilization", "Raise closing costs"], a: 1 },
      { q: "Which income needs 2-year history?", o: ["Salary", "Hourly", "Bonus/commission/overtime", "Gift income"], a: 2 },
      { q: "Why avoid job changes during prep?", o: ["Raise rates", "Reset income evaluation", "Delay appraisal", "Lower credit"], a: 1 },
      { q: "Documents required to verify income?", o: ["Pay stubs only", "Bank statements only", "Pay stubs, W-2s/tax returns, VOE", "Credit report"], a: 2 }
    ]
  },
  {
    id: 6, title: "Debt-to-Income Ratio (DTI)", subtitle: "What Determines Buying Power",
    quote: { text: "The first step toward change is awareness. The second step is acceptance.", author: "Nathaniel Branden" },
    videoId: "MODULE_6_VIDEO_ID", xp: 50,
    sections: [
      { heading: "What DTI Really Is", paragraphs: ["DTI is the percentage of monthly income already going back out the door. The higher that percentage, the riskier you look. Strong credit does not override high DTI."] },
      { heading: "Student Loans & DTI", paragraphs: ["Student loans always count, even if deferred. If no payment shows, lenders use 0.5% of the balance. An income-based repayment plan can lower the DTI-counted payment."] },
      { heading: "High Car Payments & DTI", paragraphs: ["A $600 car payment can quietly kill a deal. Cars lose value and count 100% against DTI. Many Detroit buyers get stuck in high-interest auto loans that delay homeownership."] }
    ],
    coreLesson: "DTI answers: 'How much of what you make is already gone?' The lower your DTI, the stronger your position.",
    quiz: [
      { q: "What does DTI measure?", o: ["Credit risk", "Asset strength", "Monthly debt vs income", "Home value"], a: 2 },
      { q: "Are deferred student loans included?", o: ["No", "Sometimes", "Yes", "Only federal"], a: 2 },
      { q: "If no student loan payment appears, what's used?", o: ["1%", "0.5%", "$0", "Average payment"], a: 1 },
      { q: "Why can IBR help eligibility?", o: ["Removes loan", "Delays underwriting", "Lowers DTI-counted payment", "Boosts score"], a: 2 },
      { q: "Why does understanding DTI matter?", o: ["Guarantees approval", "Determines buying power", "Lowers rates", "Replaces underwriting"], a: 1 }
    ]
  },
  {
    id: 7, title: "Assets, Savings & No Mattress Money", subtitle: "What Money Counts and Why",
    quote: { text: "Wealth is not about having a lot of money; it's about having a lot of options.", author: "Chris Rock" },
    videoId: "MODULE_7_VIDEO_ID", xp: 50,
    sections: [
      { heading: "What Assets Mean", paragraphs: ["Assets are funds that are verifiable, traceable, and seasoned or sourced. Having money is not enough — lenders must follow the paper trail."] },
      { heading: "Large Deposits & Mattress Money", paragraphs: ["Large cash deposits are a common cause of delay. Traditional banks are preferred because they provide full transaction histories."] },
      { heading: "Minimizing Out-of-Pocket Costs", paragraphs: ["Seller concessions (up to 6%), gift funds (documented with gift letter), Gift of Equity, and earnest money all reduce cash needed at closing."] }
    ],
    coreLesson: "Assets are not about how much money you have. They're about how clearly that money can be explained.",
    quiz: [
      { q: "Why must assets be traceable?", o: ["Reduce taxes", "Verify ownership and legitimacy", "Increase credit", "Speed appraisal"], a: 1 },
      { q: "Risk of large undocumented deposits?", o: ["Higher rates", "Funds may not be usable", "Lower appraisal", "Credit impact"], a: 1 },
      { q: "Preferred banking option?", o: ["Cash accounts", "Prepaid cards", "Brick-and-mortar banks", "Investment apps"], a: 2 },
      { q: "Seller concessions are used for?", o: ["Down payment only", "Closing costs and prepaid items", "Appraisal fees only", "Inspection repairs"], a: 1 },
      { q: "Gift funds require?", o: ["Repayment", "No documentation", "Proper documentation and sourcing", "Any source without limits"], a: 2 },
      { q: "Gift of equity is?", o: ["Seller loan", "Price reduction", "Equity gifted to buyer", "Tax credit"], a: 2 },
      { q: "Earnest money importance?", o: ["Lowers rates", "Proves commitment, credited toward closing", "Replaces down payment", "Speeds underwriting"], a: 1 }
    ]
  },
  {
    id: 8, title: "Buying Strategy", subtitle: "Structure the Deal & Build Advantage",
    quote: { text: "Strategy without tactics is the slowest route to victory.", author: "Sun Tzu" },
    videoId: "MODULE_8_VIDEO_ID", xp: 50,
    sections: [
      { heading: "The FHA Play", paragraphs: ["Up to 6% seller concessions. 12-month owner-occupancy, then you may move, rent, or buy again if qualified. Strategic financing, not cheap financing."] },
      { heading: "The 2 Family Play", paragraphs: ["Live in one unit, rent the other. Up to 75% of projected rent can count toward qualifying income. The property helps qualify itself."] },
      { heading: "The FHA 203(k) Play", paragraphs: ["One loan covers purchase plus approved renovations. Manufacturing equity, not waiting for it. More paperwork but rewards long-term thinkers."] },
      { heading: "The VA Play", paragraphs: ["0% down, up to 4% seller concessions, no cap on seller-paid buyer expenses (including paying off debt to help qualify), no mortgage insurance. A strategic advantage, not just a benefit."] }
    ],
    coreLesson: "Choosing a buying strategy before pre-approval aligns financing with long-term goals and reduces cash strain.",
    quiz: [
      { q: "Why is FHA the foundation strategy?", o: ["Lowest rates", "Up to 6% concessions and repeat ownership after 12 months", "No underwriting", "Investment-only"], a: 1 },
      { q: "Best profile for The 2 Family Play?", o: ["No responsibility", "Short-term only", "Living in one unit, using rental income", "Investment-only"], a: 2 },
      { q: "How does 2-family rental income help?", o: ["Replaces credit", "Eliminates MI", "Portion counts toward qualifying income/DTI", "Increases appraisal"], a: 2 },
      { q: "What makes 203(k) different?", o: ["No documentation", "Finance renovations into the mortgage", "No appraisal", "No closing costs"], a: 1 },
      { q: "Why is VA uniquely powerful?", o: ["Lowest rates", "Unlimited seller-paid buyer expenses for qualification", "No underwriting", "Single-family only"], a: 1 },
      { q: "Why choose strategy BEFORE pre-approval?", o: ["Lock a house", "Apply faster", "Align financing with goals, reduce cash strain", "Avoid inspections"], a: 2 },
      { q: "Which doesn't qualify for standard strategies?", o: ["2-unit owner-occupied", "203(k) renovation", "Detroit Land Bank property", "Single-family primary"], a: 2 }
    ]
  },
  {
    id: 9, title: "Buyer Execution", subtitle: "How Deals Get Won or Lost After Pre-Approval",
    quote: { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    videoId: "MODULE_9_VIDEO_ID", xp: 50,
    sections: [
      { heading: "Pre-Approval Discipline", paragraphs: ["Pre-approval gives permission to shop, not to stretch. Pre-approval is conditional — your behavior keeps it valid or invalidates it."] },
      { heading: "No Changes Without Asking", paragraphs: ["No new debt, no job changes, no bank changes, no large deposits. Even 'good' changes can reset underwriting. Emotion loses deals. Strategy wins them."] },
      { heading: "Inspection, Appraisal & Conditional Approval", paragraphs: ["Inspections: focus on safety and structure, not cosmetics. If appraisal comes in low: renegotiate, bring additional funds, or walk away.", "Conditional approval is where most deals die. No furniture financing, no credit cards, no missed documents. Discipline matters most here."] }
    ],
    coreLesson: "You don't need to control the entire process. You only need to control your behavior, decisions, and discipline.",
    quiz: [
      { q: "Biggest threat after pre-approval?", o: ["Rate changes", "Buyer behavior changes", "Appraisal delays", "Market competition"], a: 1 },
      { q: "Why is pre-approval conditional?", o: ["Rates fluctuate", "Underwriting monitors income, credit, assets", "Appraisals expire", "Sellers cancel"], a: 1 },
      { q: "Which action MOST invalidates pre-approval?", o: ["Asking questions", "Shopping within range", "Opening new credit", "Reviewing disclosures"], a: 2 },
      { q: "Why do buyers lose inspection leverage?", o: ["Asking for major repairs", "Reviewing carefully", "Focusing on cosmetic issues", "Hiring inspector"], a: 2 },
      { q: "When appraisal is low, which is NOT available?", o: ["Renegotiate price", "Bring funds", "Force lender to accept", "Cancel under contingency"], a: 2 },
      { q: "Where do most deals quietly fall apart?", o: ["Home search", "Offer stage", "Conditional approval", "Closing day"], a: 2 },
      { q: "Best mindset during contract-to-close?", o: ["Emotional urgency", "Passive trust", "Strategic discipline", "Aggressive negotiation"], a: 2 }
    ]
  },
  {
    id: 10, title: "Closing, Escrow & The Finish Line", subtitle: "What Happens at the Table",
    quote: { text: "The time is always right to do what is right.", author: "Dr. Martin Luther King Jr." },
    videoId: "MODULE_10_VIDEO_ID", xp: 75,
    sections: [
      { heading: "What Escrow Is", paragraphs: ["Escrow is a neutral holding process ensuring buyer's funds, seller's deed, and lender's loan are exchanged only when all conditions are met."] },
      { heading: "The Closing Disclosure", paragraphs: ["Shows final loan terms, rate, monthly payment, cash to close, seller concessions, and escrow details. Review before closing day, not at the table."] },
      { heading: "Wire Fraud & Funds", paragraphs: ["Wire fraud is real. Always confirm instructions verbally using trusted contact info. Never rely on emailed wiring instructions alone."] },
      { heading: "After Closing", paragraphs: ["Once recorded: you are legally the owner, the mortgage is active, insurance must remain in place, and property taxes are your responsibility."] }
    ],
    coreLesson: "Closing is the legal transfer of responsibility and ownership. Understanding it protects you.",
    quiz: [
      { q: "Purpose of escrow?", o: ["Speed up closing", "Hold funds/documents until conditions met", "Approve the loan", "Inspect property"], a: 1 },
      { q: "Which shows final terms and cash to close?", o: ["Loan Estimate", "Appraisal", "Closing Disclosure", "Purchase Agreement"], a: 2 },
      { q: "Who conducts closing?", o: ["Loan Officer", "Realtor", "Title company / closing agent", "Appraiser"], a: 2 },
      { q: "Why is wire fraud a risk?", o: ["Funds move slowly", "Emails can be spoofed", "Rates change", "Appraisals expire"], a: 1 },
      { q: "When does ownership legally transfer?", o: ["Offer accepted", "Clear to Close", "After signing and recording", "Keys received"], a: 2 },
      { q: "If you have Closing Disclosure questions?", o: ["Ignore it", "Ask at the table", "Ask before closing day", "Sign and review later"], a: 2 }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════
const PreApprovalAcademy = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading');
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [progress, setProgress] = useState({ completedModules: [], moduleQuizzes: {}, finalScore: null, finalPassed: false, xp: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const basicUser = { uid: currentUser.uid, displayName: currentUser.displayName || currentUser.email.split('@')[0], name: currentUser.displayName || currentUser.email.split('@')[0], email: currentUser.email, photoURL: currentUser.photoURL };
        setUser(basicUser);
        setView('dashboard');
        try {
          const docRef = doc(db, "students", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser(prev => ({ ...prev, ...data }));
            if (data.progress) setProgress(data.progress);
            if (currentUser.email === "admin@initiative2053.com") setIsAdmin(true);
          } else {
            await setDoc(docRef, { ...basicUser, joined: new Date().toISOString(), progress: { completedModules: [], moduleQuizzes: {}, finalScore: null, finalPassed: false, xp: 0 } });
          }
        } catch (err) { console.error("Firestore fetch error:", err); }
      } else { setUser(null); setView('login'); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (view === 'admin' && isAdmin) {
      (async () => { try { const snap = await getDocs(collection(db, "students")); const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() })); setStudentsList(list); } catch (e) { console.error(e); } })();
    }
  }, [view, isAdmin]);

  const saveProgress = async (newProgress) => {
    setProgress(newProgress);
    if (user?.uid) { try { await setDoc(doc(db, "students", user.uid), { progress: newProgress }, { merge: true }); } catch (err) { console.error("Save error:", err); } }
  };

  const handleLogout = async () => { await signOut(auth); setUser(null); setView('login'); };

  const handleModuleComplete = (moduleId, score, total) => {
    const mod = MODULES.find(m => m.id === moduleId);
    const already = progress.completedModules?.includes(moduleId);
    const newProgress = { ...progress, completedModules: [...new Set([...(progress.completedModules || []), moduleId])], moduleQuizzes: { ...(progress.moduleQuizzes || {}), [moduleId]: { score, total, passed: true } }, xp: (progress.xp || 0) + (already ? 0 : (mod?.xp || 50)) };
    saveProgress(newProgress);
    setView('dashboard');
    setActiveModule(null);
  };

  const handleFinalComplete = (score, passed) => {
    const newProgress = { ...progress, finalScore: score, finalPassed: passed, xp: (progress.xp || 0) + (passed && !progress.finalPassed ? 200 : 0) };
    saveProgress(newProgress);
    setView('dashboard');
  };

  const AdminView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2"><ShieldCheck size={22} /> Admin Panel</h2>
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden overflow-x-auto shadow-sm dark:shadow-none">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-stone-50 dark:bg-zinc-800">
            <tr><th className="p-4 text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase">Student</th><th className="p-4 text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase">XP</th><th className="p-4 text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase">Modules</th><th className="p-4 text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase">Status</th></tr>
          </thead>
          <tbody>{studentsList.map(s => (
            <tr key={s.id} className="border-t border-stone-100 dark:border-zinc-800">
              <td className="p-4 font-bold text-stone-900 dark:text-white flex items-center gap-2"><User size={16} className="text-stone-400 dark:text-zinc-500" /> {s.name || s.displayName || "Student"}</td>
              <td className="p-4 text-orange-500 dark:text-amber-400 font-mono">{s.progress?.xp || 0}</td>
              <td className="p-4"><div className="w-24 bg-stone-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden"><div className="bg-orange-500 dark:bg-amber-500 h-full rounded-full" style={{ width: `${((s.progress?.completedModules?.length || 0) / 10) * 100}%` }} /></div></td>
              <td className="p-4">{s.progress?.finalPassed ? <span className="text-green-700 dark:text-green-400 font-bold text-xs bg-green-50 dark:bg-green-500/15 px-2 py-1 rounded">GRADUATE</span> : <span className="text-stone-400 dark:text-zinc-500 text-xs">In Progress</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );

  if (view === 'loading') return (
    <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-orange-500/30 dark:border-amber-500/30 border-t-orange-500 dark:border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-400 dark:text-zinc-500 font-medium">Loading Academy...</p>
      </div>
    </div>
  );

  if (view === 'login') return <LoginPage onLogin={() => {}} />;

  if (view === 'module' && activeModule) return (
    <ModuleView module={activeModule} quizResult={progress.moduleQuizzes?.[activeModule.id]}
      onComplete={(score, total) => handleModuleComplete(activeModule.id, score, total)}
      onBack={() => { setView('dashboard'); setActiveModule(null); }} />
  );

  if (view === 'final') return (
    <FinalAssessment prevResult={progress.finalScore != null ? { score: progress.finalScore, passed: progress.finalPassed } : null}
      onComplete={handleFinalComplete} onBack={() => setView('dashboard')} />
  );

  if (user) return (
    <Dashboard user={user} progress={progress} modules={MODULES} isAdmin={isAdmin}
      onSelectModule={(mod) => { setActiveModule(mod); setView('module'); }}
      onStartFinal={() => setView('final')} onLogout={handleLogout}
      onAdminView={isAdmin ? () => <AdminView /> : null} />
  );

  return <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center text-stone-400 dark:text-zinc-500">Loading...</div>;
};

export default PreApprovalAcademy;
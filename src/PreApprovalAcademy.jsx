import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; 
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import LessonModule from './components/LessonModule';
import QuizModule from './components/QuizModule';
import { ShieldCheck, User } from 'lucide-react';

// --- CURRICULUM DATA ---
const lessonData = [
  {
    id: 1,
    title: "The Mindset Shift",
    subtitle: "The Detroit Reality",
    xp: 50,
    objective: "Understand that homeownership requires a change in habits, not just a change in address.",
    points: [
      "Detroit home values rose 72% from 2020-2024. The window is closing.",
      "Mindset matters more than money in the early stages.",
      "You must decide: Are you building wealth, or being pushed out?"
    ],
    caseStudy: {
      character: "Berry (Auto Worker)",
      scenario: "Berry makes $85k/year at the plant. He pays $1,100 in rent but spends every other dollar on clothes and dinners. He wants a $2,200 mortgage.",
      lesson: "Even though Berry earns enough, he hasn't practiced 'Payment Shock.' If he can't save the difference between his rent ($1,100) and his future mortgage ($2,200) for 6 months, he isn't ready."
    },
    goldTip: "If your habits don't change, your future won't either."
  },
  {
    id: 2,
    title: "Financial Readiness",
    subtitle: "Budgeting & Banking",
    xp: 50,
    objective: "Master the budget to prove mortgage affordability.",
    points: [
      "No 'mattress money'. Cash cannot be tracked or used.",
      "Funds must be 'seasoned' (in a bank account for 60+ days).",
      "Underwriters look at NET income (what you keep), not just GROSS."
    ],
    caseStudy: {
      character: "Diana (Nurse)",
      scenario: "Diana doesn't trust banks. She keeps $6,000 cash in a safe. She deposits it all one week before applying for a loan.",
      lesson: "The bank cannot use this money. To an underwriter, a large sudden cash deposit looks like a loan from a friend. Money must sit in a bank account for 60 days ('Seasoning') to be counted."
    },
    goldTip: "No Mattress Money. No Cash App. No Chime."
  },
  {
    id: 3,
    title: "Credit That Closes",
    subtitle: "Score & Utilization",
    xp: 50,
    objective: "Learn how credit acts as a measure of 'lender trust'.",
    points: [
      "Mortgage denial rates hit Black borrowers hardest (27% denial rate).",
      "High credit utilization (maxed cards) drastically lowers scores.",
      "Strategy: Pay balances down to 30% (or ideally 10%)."
    ],
    caseStudy: {
      character: "Smokey (Teacher)",
      scenario: "Smokey has a $1,000 limit credit card. He owes $950. He pays on time every month, but his score is stuck at 620.",
      lesson: "Payment history isn't the only factor. His 'Utilization Rate' is 95%. Lenders see this as 'maxed out' and risky. If he pays the balance down to $300 (30%), his score could jump 40+ points."
    },
    goldTip: "If your credit wildin', the deal dies."
  },
  {
    id: 4,
    title: "Income Stability",
    subtitle: "Employment History",
    xp: 50,
    objective: "Demonstrate stability. Underwriters hate surprises.",
    points: [
      "Job hopping scares banks. Stick to your job.",
      "W-2 income is the 'Gold Standard'.",
      "Self-employed? You MUST show a YTD Profit & Loss statement."
    ],
    caseStudy: {
      character: "Marvin (Contractor)",
      scenario: "Marvin made $120k last year! But to avoid taxes, he wrote off his truck, gas, and tools. His tax return shows a taxable profit of only $18,000.",
      lesson: "You can't have it both ways. If you tell the IRS you make $18k to save on taxes, the bank assumes you make $18k and will deny your loan. Write-offs lower your borrowing power."
    },
    goldTip: "A raise won't fix unstable deposits."
  },
  {
    id: 5,
    title: "The Document Vault",
    subtitle: "Paperwork Precision",
    xp: 50,
    objective: "Prepare a pristine paper trail.",
    points: [
      "The 'All Pages' Rule: Provide all pages, even if blank.",
      "No screenshots allowed—only official PDF downloads.",
      "Missing pages are the #1 cause of delays."
    ],
    caseStudy: {
      character: "Aretha (Admin)",
      scenario: "Aretha downloads her bank statement. It says 'Page 1 of 6'. Page 6 is blank, so she deletes it to be helpful and sends pages 1-5.",
      lesson: "The underwriter pauses her file. Why? Because Page 6 *might* show a hidden loan or debt. You must submit EVERY page, even the blank ones, or the process stops."
    },
    goldTip: "If we can't find it, we can't fund it."
  },
  {
    id: 6,
    title: "Loan Mechanics",
    subtitle: "FHA, Conventional & DPA",
    xp: 50,
    objective: "Know your loan types and credit benchmarks.",
    points: [
      "FHA Loans often require a minimum 580 credit score.",
      "Down Payment Assistance (DPA) programs often require a 640 score.",
      "Do NOT buy furniture or cars before closing."
    ],
    caseStudy: {
      character: "Stevie (IT Pro)",
      scenario: "Stevie has a 600 credit score. He is excited because FHA loans only require a 580. He also wants the $10,000 MSHDA grant for his down payment.",
      lesson: "Stevie has a problem. While he qualifies for the *loan* (580), he does NOT qualify for the *grant* (640). He needs to raise his score 40 points to get the free money."
    },
    goldTip: "Pre-approval ain't pre-paid."
  },
  {
    id: 7,
    title: "Smart Search Strategy",
    subtitle: "Shopping for Value",
    xp: 50,
    objective: "Shop for the financial reality, not just the aesthetic.",
    points: [
      "Shop UNDER your pre-approval limit to leave room for bidding.",
      "Work with a DPA-friendly real estate agent.",
      "Don't fall in love with the house; fall in love with the payment."
    ],
    caseStudy: {
      character: "Gladys (Bus Driver)",
      scenario: "Gladys is pre-approved for $175,000. She finds a dream home listed for $175,000 in a neighborhood with high taxes.",
      lesson: "If Gladys offers the full $175,000, the high taxes will push her monthly payment ABOVE what the bank approved. She should shop at $160,000 to leave 'wiggle room' for taxes and insurance."
    },
    goldTip: "Your eyes can be bigger than your budget."
  },
  {
    id: 8,
    title: "Inspections vs. Appraisals",
    subtitle: "Condition vs. Value",
    xp: 50,
    objective: "Understand the difference between protection and value.",
    points: [
      "Inspection = Condition (Protects YOU).",
      "Appraisal = Value (Protects the BANK).",
      "Never waive the inspection on an older Detroit home."
    ],
    caseStudy: {
      character: "David (Mechanic)",
      scenario: "The seller tells David, 'The bank appraisal is done and the value is high! You don't need an inspection.'",
      lesson: "Wrong. The Appraiser checks VALUE. They don't check if the sewer line is collapsed or the furnace is about to die. David needs an INSPECTOR to protect his wallet from repairs."
    },
    goldTip: "Skipping inspection is skipping protection."
  },
  {
    id: 9,
    title: "Closing Day",
    subtitle: "The Finish Line",
    xp: 50,
    objective: "Finalizing the deal without fumbling.",
    points: [
      "The Closing Disclosure (CD) is your final receipt.",
      "Bring your ID and Cashier's Check.",
      "Keys > Contract. You aren't done until keys are in hand."
    ],
    caseStudy: {
      character: "Martha (Chef)",
      scenario: "Martha is 3 days from closing. Her daughter needs a car for college. Martha co-signs the loan because 'I'm not making the payments.'",
      lesson: "The lender does a final credit check 24 hours before closing. They see the new $25,000 car debt. This ruins Martha's Debt-to-Income ratio, and her mortgage is DENIED at the finish line."
    },
    goldTip: "The deal isn't closed until the ink is dry."
  },
  {
    id: 10,
    title: "Legacy Building",
    subtitle: "Sustaining Ownership",
    xp: 50,
    objective: "Turning a house into generational wealth.",
    points: [
      "Establish a 'Maintenance Fund' immediately.",
      "Don't treat your home like an ATM (refinancing constantly).",
      "Equity is the fuel; Ownership is the engine."
    ],
    caseStudy: {
      character: "Otis (Retired)",
      scenario: "Two weeks after moving in, a pipe bursts in Otis's basement. He calls the bank to ask for help.",
      lesson: "The bank won't help. The seller won't help. Otis owns it now. This is why a Maintenance Fund is mandatory—homeownership means YOU are the landlord."
    },
    goldTip: "Ownership is YOUR Legacy."
  }
];

const quizData = [
  { 
    id: 1, 
    story: "Berry works at the Jefferson North Assembly Plant making $85k/year. He pays $1,100 in rent but spends the rest of his paycheck every month. He wants to buy a house with a $2,200/month mortgage payment. He has the down payment saved from a bonus.",
    question: "Why is Berry considered 'High Risk' despite having the income and down payment?", 
    options: [
      "He makes too much annual income to qualify for any first-time homebuyer programs or DPA grants.", 
      "He hasn't practiced 'Payment Shock' by saving the $1,100 difference between his rent and future mortgage.", 
      "Factory workers are considered seasonal employees, so his income cannot be used for a 30-year mortgage."
    ], 
    correct: 1 
  },
  { 
    id: 2, 
    story: "Diana is a nurse at Henry Ford Hospital. She saved $6,000 in cash in her safe at home over the last year. She deposits it into her credit union account 2 weeks before applying for her mortgage.",
    question: "How will the underwriter view this $6,000 deposit?", 
    options: [
      "They will accept the cash deposit because she works at a reputable hospital with steady income.", 
      "They will reject the funds because cash cannot be sourced. Money must be 'seasoned' in a bank for 60 days.", 
      "They will require a notarized letter from her manager and a signed affidavit explaining the cash savings."
    ], 
    correct: 1 
  },
  { 
    id: 3, 
    story: "Smokey is a teacher. He has a 700 credit score. He has one credit card with a $1,000 limit. He currently has a balance of $900 on it, but he pays the minimum payment on time every single month.",
    question: "Smokey thinks his credit is fine because he pays on time. What is actually hurting his score?", 
    options: [
      "Teachers often have lower credit score requirements, so his current score is acceptable for rates.", 
      "His Utilization Rate is 90%. He needs to pay it down to 30% or 10% to maximize his score.", 
      "He needs to open three new credit cards to increase his total available credit limit immediately."
    ], 
    correct: 1 
  },
  { 
    id: 4, 
    story: "Marvin is a self-employed contractor. His business Gross Revenue was $120,000 last year. However, he wrote off almost everything (gas, tools, truck) on his taxes, so his 'Net Income' on his tax return shows only $18,000.",
    question: "When Marvin applies for a loan, which income figure will the bank use?", 
    options: [
      "The full $120,000 Gross Revenue, as this reflects the total cash flow of his business.", 
      "An average of $69,000, combining his gross revenue and his expenses for a fair estimate.", 
      "Only the $18,000 Net Income, because lenders calculate income based on what is taxable after write-offs."
    ], 
    correct: 2 
  },
  { 
    id: 5, 
    story: "Aretha works in administration. She downloads her bank statement PDF. It says 'Page 1 of 6' at the top. Page 6 is completely blank, so she deletes it and submits Pages 1-5 to the loan officer.",
    question: "What happens next?", 
    options: [
      "The loan proceeds smoothly since the page was blank and contained no financial transactions.", 
      "The underwriter pauses the file. The 'All Pages' rule requires every page, even if it is completely blank.", 
      "The bank assumes she is hiding debt and will automatically deny the loan for mortgage fraud."
    ], 
    correct: 1 
  },
  { 
    id: 6, 
    story: "Stevie works in IT. He has a credit score of 605. He wants to use the MSHDA Down Payment Assistance (DPA) program to help with his closing costs.",
    question: "Does Stevie qualify for most DPA programs based on his score?", 
    options: [
      "Yes, because FHA loans and DPA programs always have the exact same credit score requirements.", 
      "No. While FHA allows 580, most Down Payment Assistance (DPA) programs require a minimum of 640.", 
      "Yes, IT professionals usually receive industry-specific waivers for down payment assistance scores."
    ], 
    correct: 1 
  },
  { 
    id: 7, 
    story: "Gladys is a bus driver. She was pre-approved for $175,000. She finds a house listed for $175,000 in a neighborhood with high property taxes.",
    question: "Is it safe for Gladys to offer the full $175,000?", 
    options: [
      "Yes, if the bank pre-approved her for that amount, it guarantees she can comfortably afford the payment.", 
      "No. High property taxes could push her payment over the limit. She should shop lower to be safe.", 
      "Yes, because first-time homebuyers in Detroit are exempt from paying property taxes for the first year."
    ], 
    correct: 1 
  },
  { 
    id: 8, 
    story: "David is a mechanic. The seller of a home tells him, 'We already had an appraisal done, and the value is high! You don't need to waste money on an inspection.'",
    question: "What is the critical error in the seller's logic?", 
    options: [
      "Appraisals determine VALUE for the bank. Inspections determine CONDITION (roof, furnace) for David.", 
      "Appraisals cover everything. An inspector is only needed if the appraiser finds a specific problem.", 
      "Mechanics can fix anything, so David can waive the inspection to make his offer more attractive."
    ], 
    correct: 0 
  },
  { 
    id: 9, 
    story: "Martha is a chef. Three days before her closing, her daughter asks her to co-sign for a car loan. Martha agrees because 'I'm not the one making the payments.'",
    question: "How does this affect Martha's mortgage?", 
    options: [
      "It has no effect because she is only a co-signer and will not be the primary driver of the car.", 
      "It creates a new hard inquiry and increases her Debt-to-Income ratio, which could disqualify her.", 
      "It helps her application by adding another active trade line to her credit report before closing."
    ], 
    correct: 1 
  },
  { 
    id: 10, 
    story: "Otis is retired and just bought his bungalow. A pipe bursts in the basement two weeks after moving in. He calls his loan officer asking for money to fix it.",
    question: "Who is responsible for this repair?", 
    options: [
      "The Bank is responsible since the damage occurred within the first 30 days of the mortgage.", 
      "The Seller is responsible because they likely knew about the pipe issue before selling the home.", 
      "Otis is responsible. This is why having a 'Maintenance Fund' is mandatory for sustainable ownership."
    ], 
    correct: 2 
  }
];

const PreApprovalAcademy = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  
  // State for overall progress and detailed quiz state
  const [progress, setProgress] = useState({ completedLessons: [], xp: 0, quizPassed: false, currentLessonIndex: 0 });
  const [quizState, setQuizState] = useState({ currentQuestion: 0, score: 0, selected: null, isCorrect: null, completed: false });
  const [activeLesson, setActiveLesson] = useState(null); // For Review Mode

  // 1. AUTH LISTENER & DATA SYNC
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "students", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({ ...currentUser, ...data });
            setProgress(data.progress || { completedLessons: [], xp: 0, quizPassed: false, currentLessonIndex: 0 });
            // LOAD SAVED QUIZ STATE IF EXISTS
            if (data.quizState) {
                setQuizState(data.quizState);
            }
            
            if (currentUser.email === "admin@initiative2053.com") {
               setIsAdmin(true);
               setView('admin');
            } else {
               setView('dashboard');
            }
          } else {
             // CREATE PROFILE IF MISSING
             const newProfile = {
                name: currentUser.displayName || currentUser.email.split('@')[0],
                email: currentUser.email,
                photo: currentUser.photoURL || null,
                joined: new Date().toISOString(),
                progress: { completedLessons: [], xp: 0, quizPassed: false, currentLessonIndex: 0 },
                quizState: { currentQuestion: 0, score: 0, selected: null, isCorrect: null, completed: false }
             };
             await setDoc(docRef, newProfile);
             setUser({ ...currentUser, ...newProfile });
             setProgress(newProfile.progress);
             setQuizState(newProfile.quizState);
             setView('dashboard');
          }
        } catch (err) {
          console.error("Database Error:", err);
          setView('login');
        }
      } else {
        setUser(null);
        setView('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. ADMIN FETCH
  useEffect(() => {
    if (view === 'admin') {
      const fetchStudents = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "students"));
          const list = [];
          querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
          setStudentsList(list);
        } catch(e) { console.error(e); }
      };
      fetchStudents();
    }
  }, [view]);

  // 3. UNIVERSAL SAVE FUNCTION
  const saveUserData = async (updates) => {
    // updates can contain { progress: ... } OR { quizState: ... } OR both
    if (user && !isAdmin) {
       await setDoc(doc(db, "students", user.uid), updates, { merge: true });
    }
  };

  // 4. HANDLERS
  const handleLogout = async () => {
    await signOut(auth);
    setView('login');
  };

  const handleLessonComplete = (id, xp) => {
    // If in Review Mode, just go back to Dashboard without saving progress
    if (activeLesson) {
        setView('dashboard');
        setActiveLesson(null);
        return;
    }

    let newP = { ...progress };
    if (!newP.completedLessons.includes(id)) {
        newP.completedLessons.push(id);
        newP.xp += xp;
    }
    if (newP.currentLessonIndex < lessonData.length - 1) {
        newP.currentLessonIndex += 1;
    }
    
    setProgress(newP);
    saveUserData({ progress: newP }); // Save Progress
    
    if (newP.completedLessons.length === lessonData.length) {
       setView('dashboard');
    }
  };

  // Handle "Review" click from Dashboard
  const handleReviewLesson = (lessonId) => {
      const lessonToReview = lessonData.find(l => l.id === lessonId);
      if (lessonToReview) {
          setActiveLesson(lessonToReview);
          setView('lesson');
      }
  };

  const handleQuizNext = () => {
    let newState;
    if (quizState.currentQuestion < quizData.length - 1) {
       newState = { ...quizState, currentQuestion: quizState.currentQuestion + 1, selected: null, isCorrect: null };
    } else {
       newState = { ...quizState, completed: true };
       if (quizState.score === quizData.length) {
          const newP = { ...progress, quizPassed: true, xp: progress.xp + 200 };
          setProgress(newP);
          saveUserData({ progress: newP, quizState: newState });
          setQuizState(newState);
          return;
       }
    }
    setQuizState(newState);
    saveUserData({ quizState: newState }); // SAVE QUIZ STATE
  };

  const handleQuizAnswer = (idx) => {
    const correct = idx === quizData[quizState.currentQuestion].correct;
    const newState = { ...quizState, selected: idx, isCorrect: correct, score: correct ? quizState.score + 1 : quizState.score };
    
    setQuizState(newState);
    saveUserData({ quizState: newState }); // SAVE QUIZ STATE

    if (correct && !quizState.completed) {
        const newP = { ...progress, xp: progress.xp + 10 };
        setProgress(newP);
        saveUserData({ progress: newP });
    }
  };

  // --- RENDER ---
  if (view === 'loading') return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">Loading Academy...</div>;

  if (view === 'login') return <LoginPage onLogin={(u) => setView('loading')} />;

  if (view === 'admin') return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8">
       <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
             <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck /> Admin Dashboard</h1>
             <button onClick={handleLogout} className="text-zinc-500 font-bold">Logout</button>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden overflow-x-auto">
             <table className="w-full text-left min-w-[600px]">
                <thead className="bg-black text-white">
                   <tr><th className="p-4">Student</th><th className="p-4">XP</th><th className="p-4">Progress</th><th className="p-4">Status</th></tr>
                </thead>
                <tbody>
                   {studentsList.map(s => (
                      <tr key={s.id} className="border-b">
                         <td className="p-4 font-bold flex items-center gap-2"><User size={16}/> {s.name}</td>
                         <td className="p-4 text-yellow-600 font-mono">{s.progress?.xp || 0}</td>
                         <td className="p-4"><div className="w-24 bg-zinc-200 h-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width: `${(s.progress?.completedLessons?.length/10)*100 || 0}%`}}></div></div></td>
                         <td className="p-4">{s.progress?.quizPassed ? <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">GRADUATE</span> : <span className="text-zinc-400 text-xs">Learning</span>}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  if (view === 'lesson') return <LessonModule lesson={activeLesson || lessonData[progress.currentLessonIndex]} onBack={() => setView('dashboard')} onComplete={handleLessonComplete} />;
  
  if (view === 'quiz') return <QuizModule quizData={quizData} quizState={quizState} onAnswer={handleQuizAnswer} onNext={handleQuizNext} onDashboard={() => setView('dashboard')} />;

  if (user && progress) {
      return (
        <Dashboard 
            user={user} 
            progress={progress} 
            quizState={quizState} // Pass quiz state to dashboard
            lessonData={lessonData} 
            onLogout={handleLogout} 
            onResume={() => setView(progress.completedLessons.length === 10 ? 'quiz' : 'lesson')} 
            onReview={handleReviewLesson} // Pass review handler
        />
      );
  } else {
      return <div>Loading user data...</div>
  }
};

export default PreApprovalAcademy;
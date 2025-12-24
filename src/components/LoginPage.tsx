import React, { useState } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BookOpen, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ensureStudentProfile = async (user, displayName) => {
    const docRef = doc(db, "students", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        name: displayName || user.displayName || "Student",
        email: user.email,
        photo: user.photoURL || null,
        joined: new Date().toISOString(),
        progress: { completedLessons: [], xp: 0, quizPassed: false, currentLessonIndex: 0 }
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureStudentProfile(result.user, result.user.displayName);
      onLogin(result.user);
    } catch (err) {
      console.error(err);
      setError("Google Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await ensureStudentProfile(userCredential.user, name);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(userCredential.user);
    } catch (err) {
      console.error(err);
      setError("Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background Gradient Spot */}
      <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 relative z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-yellow-500 rounded-full mb-4 shadow-lg shadow-yellow-500/20">
              <BookOpen size={32} className="text-black" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">
              Pre Approval Academy
            </h1>
            <p className="text-zinc-500 font-serif italic text-sm mt-2">
              "Ownership is YOUR Legacy"
            </p>
          </div>

          {error && <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-3 rounded flex items-center gap-2 text-red-400 text-sm"><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-zinc-500" size={20} />
                <input type="text" placeholder="Full Name" required={isSignUp} value={name} onChange={(e) => setName(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-zinc-600" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-500" size={20} />
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-zinc-600" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-500" size={20} />
              <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-zinc-600" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-colors">
              {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")} {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-zinc-800 flex-1"></div>
            <span className="text-xs text-zinc-600 font-bold uppercase">OR</span>
            <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-800 hover:text-white transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm text-zinc-500 hover:text-yellow-500 font-medium transition-colors">
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
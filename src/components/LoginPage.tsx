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

  // 1. ENSURE PROFILE EXISTS (The Fix)
  const ensureStudentProfile = async (user, displayName) => {
    try {
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
        await setDoc(docRef, {
            name: displayName || user.displayName || user.email.split('@')[0],
            email: user.email,
            photo: user.photoURL || null,
            joined: new Date().toISOString(),
            progress: { completedLessons: [], xp: 0, quizPassed: false, currentLessonIndex: 0 }
        });
        }
    } catch (e) {
        console.error("Error creating profile:", e);
    }
  };

  // 2. GOOGLE LOGIN
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

  // 3. EMAIL AUTH
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
        // FORCE CHECK PROFILE ON LOGIN TOO
        await ensureStudentProfile(userCredential.user, userCredential.user.displayName);
      }
      onLogin(userCredential.user);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError("Invalid email or password.");
      else if (err.code === 'auth/email-already-in-use') setError("Email already used.");
      else if (err.code === 'auth/weak-password') setError("Password too weak.");
      else setError("Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-t-8 border-yellow-600">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-black rounded-full mb-4 shadow-lg">
              <BookOpen size={32} className="text-yellow-600" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-900">Pre Approval Academy</h1>
            <p className="text-zinc-500 font-serif italic text-sm">"Ownership is YOUR Legacy"</p>
          </div>

          {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center gap-2 text-red-700 text-sm"><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-zinc-400" size={20} />
                <input type="text" placeholder="Full Name" required={isSignUp} value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition-all" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-400" size={20} />
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-400" size={20} />
              <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition-all" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-zinc-800 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
              {isLoading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")} {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-zinc-200 flex-1"></div>
            <span className="text-xs text-zinc-400 font-bold uppercase">OR</span>
            <div className="h-px bg-zinc-200 flex-1"></div>
          </div>

          <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white border-2 border-zinc-100 text-zinc-600 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm text-zinc-500 hover:text-black font-medium transition-colors">
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
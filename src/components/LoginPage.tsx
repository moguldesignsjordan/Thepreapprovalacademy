import React, { useState } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BookOpen, Mail, Lock, User, ArrowRight, AlertCircle, Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const LoginPage = ({ onLogin }) => {
  const { theme, toggleTheme } = useTheme();
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
        progress: { completedModules: [], moduleQuizzes: {}, finalScore: null, finalPassed: false, xp: 0 }
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureStudentProfile(result.user, result.user.displayName);
      if (onLogin) onLogin(result.user);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') setError("Login popup was closed. Please try again.");
      else if (err.code === 'auth/popup-blocked') setError("Popup blocked. Please allow popups for this site.");
      else setError("Google login failed. Please try again.");
    } finally { setIsLoading(false); }
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
      if (onLogin) onLogin(userCredential.user);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError("Invalid email or password.");
      else if (err.code === 'auth/email-already-in-use') setError("Account exists. Try signing in.");
      else if (err.code === 'auth/weak-password') setError("Password must be at least 6 characters.");
      else setError("Authentication failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-400/8 dark:bg-amber-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-300/6 dark:bg-amber-600/4 rounded-full blur-[100px] pointer-events-none" />

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-amber-400 transition-all shadow-sm">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 bg-orange-500/10 dark:bg-amber-500/10 border border-orange-500/20 dark:border-amber-500/20 px-5 py-2.5 rounded-full mb-6">
            <Home size={15} className="text-orange-500 dark:text-amber-400" />
            <span className="text-orange-600 dark:text-amber-300 text-[11px] font-bold tracking-[0.2em] uppercase">Initiative 2053</span>
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Pre-Approval Academy
          </h1>
          <p className="text-stone-400 dark:text-zinc-500 text-sm mt-2 tracking-wide">Education → Readiness → Ownership</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-stone-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-stone-500 dark:text-zinc-500 text-[11px] font-bold tracking-widest uppercase block mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-stone-400 dark:text-zinc-600" size={18} />
                    <input type="text" placeholder="Your full name" required value={name} onChange={e => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/60 text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-orange-400 dark:focus:border-amber-500/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:ring-amber-500/30 transition-all placeholder-stone-400 dark:placeholder-zinc-600 text-sm" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-stone-500 dark:text-zinc-500 text-[11px] font-bold tracking-widest uppercase block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-stone-400 dark:text-zinc-600" size={18} />
                  <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/60 text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-orange-400 dark:focus:border-amber-500/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:ring-amber-500/30 transition-all placeholder-stone-400 dark:placeholder-zinc-600 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-stone-500 dark:text-zinc-500 text-[11px] font-bold tracking-widest uppercase block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-stone-400 dark:text-zinc-600" size={18} />
                  <input type="password" placeholder="Min 6 characters" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/60 text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-orange-400 dark:focus:border-amber-500/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:ring-amber-500/30 transition-all placeholder-stone-400 dark:placeholder-zinc-600 text-sm" />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full bg-orange-500 dark:bg-amber-500 hover:bg-orange-400 dark:hover:bg-amber-400 text-white dark:text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 tracking-wide mt-2 shadow-sm">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> :
                  <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={18} /></>}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1" />
              <span className="text-[10px] text-stone-400 dark:text-zinc-600 font-bold tracking-widest uppercase">or continue with</span>
              <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1" />
            </div>

            {/* Google Login */}
            <button onClick={handleGoogleLogin} disabled={isLoading}
              className="w-full bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/50 text-stone-700 dark:text-zinc-300 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-stone-100 dark:hover:bg-zinc-700/60 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-zinc-600 transition-all disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-sm text-stone-500 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-amber-400 transition-colors">
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
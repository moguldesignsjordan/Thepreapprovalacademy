import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft, Camera, User, Mail, Lock, Bell, Shield, Trash2,
  Sun, Moon, Save, AlertCircle, CheckCircle, Eye, EyeOff,
  LogOut, ChevronRight, Loader2
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  const user = auth.currentUser;

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI states
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    progressReminders: true,
    newContent: false,
    marketingEmails: false
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Create a reference to the file location
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile
      await updateProfile(user, { photoURL: downloadURL });
      
      // Update Firestore
      await updateDoc(doc(db, 'students', user.uid), {
        photo: downloadURL,
        photoURL: downloadURL
      });

      setPhotoURL(downloadURL);
      showMessage('success', 'Profile photo updated!');
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Update profile info
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update display name
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
        await updateDoc(doc(db, 'students', user.uid), {
          name: displayName,
          displayName: displayName
        });
      }

      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Update email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showMessage('error', 'Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, email);
      await updateDoc(doc(db, 'students', user.uid), { email });

      setCurrentPassword('');
      showMessage('success', 'Email updated successfully!');
    } catch (error) {
      console.error('Email update error:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Incorrect password');
      } else if (error.code === 'auth/email-already-in-use') {
        showMessage('error', 'Email already in use');
      } else {
        showMessage('error', 'Failed to update email');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password updated successfully!');
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Current password is incorrect');
      } else {
        showMessage('error', 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      showMessage('error', 'Please enter your password to confirm');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Delete Firestore data
      await deleteDoc(doc(db, 'students', user.uid));

      // Delete user account
      await deleteUser(user);

      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Incorrect password');
      } else {
        showMessage('error', 'Failed to delete account');
      }
    } finally {
      setLoading(false);
    }
  };

  const SectionButton = ({ id, icon: Icon, label, danger = false }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
        activeSection === id
          ? 'bg-orange-50 dark:bg-amber-500/10 border-orange-200 dark:border-amber-500/20'
          : 'hover:bg-stone-50 dark:hover:bg-zinc-800/50'
      } ${danger ? 'text-red-500 dark:text-red-400' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={
          danger ? 'text-red-500 dark:text-red-400' :
          activeSection === id ? 'text-orange-500 dark:text-amber-400' : 'text-stone-400 dark:text-zinc-500'
        } />
        <span className={`font-medium ${
          danger ? '' :
          activeSection === id ? 'text-orange-600 dark:text-amber-400' : 'text-stone-700 dark:text-zinc-300'
        }`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-stone-300 dark:text-zinc-600" />
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-stone-600 dark:text-zinc-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">Settings</h1>
                <p className="text-sm text-stone-500 dark:text-zinc-500">Manage your account</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-amber-400 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-2 space-y-1">
              <SectionButton id="profile" icon={User} label="Profile" />
              <SectionButton id="security" icon={Lock} label="Security" />
              <SectionButton id="notifications" icon={Bell} label="Notifications" />
              <SectionButton id="appearance" icon={Sun} label="Appearance" />
              <div className="border-t border-stone-100 dark:border-zinc-800 my-2" />
              <SectionButton id="danger" icon={Trash2} label="Delete Account" danger />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 sm:p-8">
              
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-1">Profile Information</h2>
                    <p className="text-stone-500 dark:text-zinc-500 text-sm">Update your photo and personal details</p>
                  </div>

                  {/* Profile Photo */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-zinc-800 border-2 border-stone-200 dark:border-zinc-700">
                        {photoURL ? (
                          <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-zinc-600">
                            <User size={40} />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute -bottom-2 -right-2 p-2 bg-orange-500 dark:bg-amber-500 text-white dark:text-black rounded-xl shadow-lg hover:bg-orange-600 dark:hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">Profile Photo</p>
                      <p className="text-sm text-stone-500 dark:text-zinc-500">JPG, PNG, or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800/50 text-stone-500 dark:text-zinc-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-stone-400 dark:text-zinc-600 mt-1.5">
                        Email changes require re-authentication. Go to Security settings.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-orange-500 dark:bg-amber-500 text-white dark:text-black font-bold rounded-xl hover:bg-orange-600 dark:hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-1">Security Settings</h2>
                    <p className="text-stone-500 dark:text-zinc-500 text-sm">Manage your email and password</p>
                  </div>

                  {/* Change Email */}
                  <div className="p-5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                      <Mail size={18} className="text-orange-500 dark:text-amber-400" />
                      Change Email
                    </h3>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-zinc-400 mb-1.5">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-zinc-400 mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-12 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500"
                            placeholder="Enter to confirm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !currentPassword}
                        className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
                      >
                        Update Email
                      </button>
                    </form>
                  </div>

                  {/* Change Password */}
                  <div className="p-5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                      <Lock size={18} className="text-orange-500 dark:text-amber-400" />
                      Change Password
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-zinc-400 mb-1.5">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-zinc-400 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-12 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500"
                            placeholder="Min 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-zinc-400 mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !currentPassword || !newPassword}
                        className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-1">Notification Preferences</h2>
                    <p className="text-stone-500 dark:text-zinc-500 text-sm">Choose what updates you want to receive</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive updates about your progress via email' },
                      { key: 'progressReminders', label: 'Progress Reminders', desc: 'Get reminded to continue your learning' },
                      { key: 'newContent', label: 'New Content', desc: 'Be notified when new modules are added' },
                      { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive news and promotions' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-stone-500 dark:text-zinc-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            notifications[item.key] 
                              ? 'bg-orange-500 dark:bg-amber-500' 
                              : 'bg-stone-200 dark:bg-zinc-700'
                          }`}
                        >
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-1">Appearance</h2>
                    <p className="text-stone-500 dark:text-zinc-500 text-sm">Customize how the app looks</p>
                  </div>

                  <div className="space-y-4">
                    <p className="font-medium text-stone-700 dark:text-zinc-300">Theme</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === 'light'
                            ? 'border-orange-500 dark:border-amber-500 bg-orange-50 dark:bg-amber-500/10'
                            : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="w-full h-20 rounded-lg bg-white border border-stone-200 mb-3 flex items-center justify-center">
                          <Sun size={24} className="text-orange-500" />
                        </div>
                        <p className="font-medium text-stone-900 dark:text-white">Light</p>
                      </button>
                      <button
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-orange-500 dark:border-amber-500 bg-orange-50 dark:bg-amber-500/10'
                            : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="w-full h-20 rounded-lg bg-zinc-900 border border-zinc-700 mb-3 flex items-center justify-center">
                          <Moon size={24} className="text-amber-400" />
                        </div>
                        <p className="font-medium text-stone-900 dark:text-white">Dark</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeSection === 'danger' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
                    <p className="text-stone-500 dark:text-zinc-500 text-sm">Irreversible account actions</p>
                  </div>

                  <div className="p-5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      Once you delete your account, there is no going back. All your progress, data, and certificates will be permanently removed.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-500/30">
                        <p className="text-sm text-stone-600 dark:text-zinc-400">
                          Enter your password to confirm account deletion:
                        </p>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Your password"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setShowDeleteConfirm(false); setCurrentPassword(''); }}
                            className="px-4 py-2 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading || !currentPassword}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Permanently Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

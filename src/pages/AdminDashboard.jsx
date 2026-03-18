import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { 
  ArrowLeft, Shield, ShieldOff, Users, FileText, GraduationCap, 
  Clock, CheckCircle, XCircle, UserPlus, TrendingUp, Award,
  ChevronDown, ChevronUp, Eye, Trash2, Mail, Phone, Calendar,
  BookOpen, Trophy, Target, BarChart3, X
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Real-time listener for applications
  useEffect(() => {
    const q = query(
      collection(db, "academy-applications"),
      orderBy("submittedAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
      }));
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for registered users (students collection)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRegisteredUsers(usersList);
    }, (error) => {
      console.error("Error fetching registered users:", error);
    });

    return () => unsubscribe();
  }, []);

  // Update application status
  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, "academy-applications", appId), {
        applicationStatus: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Delete application
  const deleteApplication = async (appId) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      await deleteDoc(doc(db, "academy-applications", appId));
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    }
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "grant admin access to" : "remove admin access from";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await updateDoc(doc(db, "students", userId), {
        isAdmin: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating admin status:", error);
      alert("Failed to update admin status");
    }
  };

  // Toggle row expansion
  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (app.applicationStatus || "pending") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter users
  const filteredUsers = registeredUsers.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "admin") return matchesSearch && user.isAdmin;
    if (statusFilter === "completed") return matchesSearch && user.progress?.finalPassed;
    if (statusFilter === "in-progress") return matchesSearch && !user.progress?.finalPassed && (user.progress?.completedModules?.length || 0) > 0;
    if (statusFilter === "not-started") return matchesSearch && (user.progress?.completedModules?.length || 0) === 0;
    return matchesSearch;
  });

  // Calculate comprehensive stats
  const stats = {
    // Applications
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => !a.applicationStatus || a.applicationStatus === "pending").length,
    reviewedApplications: applications.filter(a => a.applicationStatus === "reviewed").length,
    approvedApplications: applications.filter(a => a.applicationStatus === "approved").length,
    enrolledApplications: applications.filter(a => a.applicationStatus === "enrolled").length,
    rejectedApplications: applications.filter(a => a.applicationStatus === "rejected").length,
    
    // Students
    totalStudents: registeredUsers.length,
    adminCount: registeredUsers.filter(u => u.isAdmin).length,
    completedStudents: registeredUsers.filter(u => u.progress?.finalPassed).length,
    inProgressStudents: registeredUsers.filter(u => !u.progress?.finalPassed && (u.progress?.completedModules?.length || 0) > 0).length,
    notStartedStudents: registeredUsers.filter(u => (u.progress?.completedModules?.length || 0) === 0).length,
    totalXP: registeredUsers.reduce((sum, u) => sum + (u.progress?.xp || 0), 0),
    avgProgress: registeredUsers.length > 0 
      ? Math.round(registeredUsers.reduce((sum, u) => sum + ((u.progress?.completedModules?.length || 0) / 10) * 100, 0) / registeredUsers.length)
      : 0,
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time ago
  const timeAgo = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      reviewed: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
      approved: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",
      enrolled: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300",
      rejected: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || styles.pending}`}>
        {status || "pending"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-stone-600 dark:text-zinc-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-stone-500 dark:text-zinc-500">Pre-Approval Academy Management</p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {/* Application Stats */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-stone-400 dark:text-zinc-500" />
              <span className="text-xs text-stone-500 dark:text-zinc-500">Applications</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-white">{stats.totalApplications}</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-yellow-500" />
              <span className="text-xs text-stone-500 dark:text-zinc-500">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingApplications}</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs text-stone-500 dark:text-zinc-500">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedApplications}</p>
          </div>

          {/* Student Stats */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-stone-400 dark:text-zinc-500" />
              <span className="text-xs text-stone-500 dark:text-zinc-500">Students</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-white">{stats.totalStudents}</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-purple-500" />
              <span className="text-xs text-stone-500 dark:text-zinc-500">Graduated</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.completedStudents}</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-orange-500" />
              <span className="text-xs text-stone-500 dark:text-zinc-500">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-amber-400">{stats.avgProgress}%</p>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20 p-4">
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Total XP Earned</p>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{stats.totalXP.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-stone-500 dark:text-zinc-500 mb-1">In Progress</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgressStudents}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-stone-500 dark:text-zinc-500 mb-1">Not Started</p>
            <p className="text-xl font-bold text-stone-400 dark:text-zinc-500">{stats.notStartedStudents}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-stone-500 dark:text-zinc-500 mb-1">Enrolled (Apps)</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.enrolledApplications}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-stone-500 dark:text-zinc-500 mb-1">Admins</p>
            <p className="text-xl font-bold text-stone-900 dark:text-white">{stats.adminCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 dark:border-zinc-800 mb-4">
          <nav className="flex gap-6">
            <button
              onClick={() => { setActiveTab("applications"); setStatusFilter("all"); }}
              className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === "applications"
                  ? "text-orange-600 dark:text-amber-500"
                  : "text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300"
              }`}
            >
              <FileText size={16} />
              Applications
              {activeTab === "applications" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-amber-500"></span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab("students"); setStatusFilter("all"); }}
              className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === "students"
                  ? "text-orange-600 dark:text-amber-500"
                  : "text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300"
              }`}
            >
              <GraduationCap size={16} />
              Students & Progress
              {activeTab === "students" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-amber-500"></span>
              )}
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500 text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-amber-500"
          >
            <option value="all">All</option>
            {activeTab === "applications" ? (
              <>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="enrolled">Enrolled</option>
                <option value="rejected">Rejected</option>
              </>
            ) : (
              <>
                <option value="completed">Graduated</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
                <option value="admin">Admins Only</option>
              </>
            )}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        ) : activeTab === "applications" ? (
          /* Applications Table */
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={48} className="mx-auto text-stone-300 dark:text-zinc-700 mb-4" />
                <p className="text-stone-500 dark:text-zinc-500">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700">
                    <tr>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Applicant</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Contact</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Status</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Timeline</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Submitted</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                    {filteredApplications.map((app) => (
                      <>
                        <tr key={app.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-amber-500/20 flex items-center justify-center text-orange-600 dark:text-amber-400 font-bold text-sm">
                                {(app.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-stone-900 dark:text-white text-sm">{app.name || "No name"}</p>
                                <p className="text-xs text-stone-400 dark:text-zinc-500">{app.status || "N/A"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-sm text-stone-600 dark:text-zinc-400">{app.email}</p>
                            <p className="text-xs text-stone-400 dark:text-zinc-500">{app.phone || "No phone"}</p>
                          </td>
                          <td className="p-3">
                            <select
                              value={app.applicationStatus || "pending"}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                              className="text-xs font-semibold rounded-full px-2 py-1 border-0 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="approved">Approved</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-stone-600 dark:text-zinc-400">
                            {app.timeline || "N/A"}
                          </td>
                          <td className="p-3">
                            <p className="text-sm text-stone-600 dark:text-zinc-400">{formatDate(app.submittedAt)}</p>
                            <p className="text-xs text-stone-400 dark:text-zinc-500">{timeAgo(app.submittedAt)}</p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleRow(app.id)}
                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-stone-500 dark:text-zinc-400"
                                title="View details"
                              >
                                {expandedRows[app.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                              <button
                                onClick={() => deleteApplication(app.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[app.id] && (
                          <tr className="bg-stone-50 dark:bg-zinc-800/30">
                            <td colSpan={6} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase mb-1">Message</p>
                                  <p className="text-sm text-stone-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-stone-200 dark:border-zinc-700">
                                    {app.message || "No message provided"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase mb-1">Contact Info</p>
                                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-stone-200 dark:border-zinc-700 space-y-2">
                                    <p className="text-sm flex items-center gap-2 text-stone-700 dark:text-zinc-300">
                                      <Mail size={14} className="text-stone-400" /> {app.email}
                                    </p>
                                    <p className="text-sm flex items-center gap-2 text-stone-700 dark:text-zinc-300">
                                      <Phone size={14} className="text-stone-400" /> {app.phone || "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase mb-1">Details</p>
                                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-stone-200 dark:border-zinc-700 space-y-2">
                                    <p className="text-sm text-stone-700 dark:text-zinc-300">
                                      <span className="text-stone-500 dark:text-zinc-500">Current Status:</span> {app.status || "N/A"}
                                    </p>
                                    <p className="text-sm text-stone-700 dark:text-zinc-300">
                                      <span className="text-stone-500 dark:text-zinc-500">Timeline:</span> {app.timeline || "N/A"}
                                    </p>
                                    <p className="text-sm text-stone-700 dark:text-zinc-300">
                                      <span className="text-stone-500 dark:text-zinc-500">ID:</span> <span className="font-mono text-xs">{app.id}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Students Table */
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={48} className="mx-auto text-stone-300 dark:text-zinc-700 mb-4" />
                <p className="text-stone-500 dark:text-zinc-500">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700">
                    <tr>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Student</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Progress</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Modules</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">XP</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Status</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Role</th>
                      <th className="text-left p-3 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                    {filteredUsers.map((user) => {
                      const completedModules = user.progress?.completedModules?.length || 0;
                      const progressPercent = (completedModules / 10) * 100;
                      const isGraduated = user.progress?.finalPassed;
                      
                      return (
                        <>
                          <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {user.photoURL ? (
                                  <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-amber-500/20 flex items-center justify-center text-orange-600 dark:text-amber-400 font-bold text-sm">
                                    {(user.name || user.displayName || user.email || "?").charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-stone-900 dark:text-white text-sm">
                                    {user.name || user.displayName || "Unnamed"}
                                  </p>
                                  <p className="text-xs text-stone-400 dark:text-zinc-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-stone-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${isGraduated ? 'bg-green-500' : 'bg-orange-500 dark:bg-amber-500'}`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-stone-600 dark:text-zinc-400">{Math.round(progressPercent)}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">
                                {completedModules}/10
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-bold text-orange-600 dark:text-amber-400">
                                {(user.progress?.xp || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3">
                              {isGraduated ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">
                                  <Award size={12} /> Graduated
                                </span>
                              ) : completedModules > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                  <BookOpen size={12} /> In Progress
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-500">
                                  Not Started
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {user.isAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                                  <Shield size={12} /> Admin
                                </span>
                              ) : (
                                <span className="text-xs text-stone-500 dark:text-zinc-500">Student</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleRow(user.id)}
                                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-stone-500 dark:text-zinc-400"
                                  title="View details"
                                >
                                  {expandedRows[user.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <button
                                  onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    user.isAdmin 
                                      ? "hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" 
                                      : "hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-500"
                                  }`}
                                  title={user.isAdmin ? "Remove admin" : "Make admin"}
                                >
                                  {user.isAdmin ? <ShieldOff size={16} /> : <Shield size={16} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows[user.id] && (
                            <tr className="bg-stone-50 dark:bg-zinc-800/30">
                              <td colSpan={7} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase mb-2">Module Progress</p>
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-stone-200 dark:border-zinc-700">
                                      <div className="grid grid-cols-5 gap-1">
                                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                          <div 
                                            key={num}
                                            className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                                              user.progress?.completedModules?.includes(num)
                                                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                                : 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-600'
                                            }`}
                                          >
                                            {num}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase mb-2">Final Assessment</p>
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-stone-200 dark:border-zinc-700">
                                      {user.progress?.finalScore != null ? (
                                        <div className="text-center">
                                          <p className={`text-3xl font-bold ${user.progress?.finalPassed ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                            {user.progress.finalScore}/40
                                          </p>
                                          <p className={`text-sm ${user.progress?.finalPassed ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                            {user.progress?.finalPassed ? '✓ Passed' : '✗ Not Passed'}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-stone-500 dark:text-zinc-500 text-center py-2">Not attempted</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500 uppercase mb-2">Account Info</p>
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-stone-200 dark:border-zinc-700 space-y-1">
                                      <p className="text-sm text-stone-700 dark:text-zinc-300">
                                        <span className="text-stone-500 dark:text-zinc-500">Joined:</span> {formatDate(user.joined)}
                                      </p>
                                      <p className="text-sm text-stone-700 dark:text-zinc-300">
                                        <span className="text-stone-500 dark:text-zinc-500">ID:</span> <span className="font-mono text-xs">{user.id.slice(0, 12)}...</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

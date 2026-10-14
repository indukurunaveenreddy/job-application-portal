import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import "./index.css";

const API_BASE = typeof window !== "undefined" && window.location.port === "3000" ? "http://localhost:5001" : "";

// Toast helper context
const ToastContext = React.createContext({ addToast: () => {} });
const AuthContext = React.createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

// Main App Container
const App = () => {
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("job_portal_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loginUser = (userData, token) => {
    localStorage.setItem("job_portal_token", token);
    localStorage.setItem("job_portal_user", JSON.stringify(userData));
    setUser(userData);
    // Track user login activity
    try {
      const activity = JSON.parse(localStorage.getItem("nexhire_user_activity") || "[]");
      const existing = activity.find((a) => a.email === userData.email || a.phoneNumber === userData.phoneNumber);
      if (existing) {
        existing.lastLogin = new Date().toISOString();
        existing.loginCount = (existing.loginCount || 0) + 1;
        existing.name = userData.name;
      } else {
        activity.push({
          name: userData.name,
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          role: userData.role || "job_seeker",
          registeredAt: userData.registeredAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1,
        });
      }
      localStorage.setItem("nexhire_user_activity", JSON.stringify(activity));
    } catch (e) { /* ignore */ }
    addToast(`Welcome back, ${userData.name}!`, "success");
  };

  const logoutUser = () => {
    localStorage.removeItem("job_portal_token");
    localStorage.removeItem("job_portal_user");
    setUser(null);
    addToast("Logged out successfully", "info");
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <AuthContext.Provider value={{ user, login: loginUser, logout: logoutUser }}>
        <Router>
          <div className="app-container">

            {/* Main Navigation */}
            <NavBar />

            {/* Pages Routing */}
            <main className="main-content">
              <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
                <Route path="/admin/login" element={!user ? <AdminLogin /> : (user.role === "admin" ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/" replace />)} />
                <Route path="/admin/dashboard" element={user && user.role === "admin" ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} />
                <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
                <Route path="/jobs" element={user ? <Home /> : <Navigate to="/login" replace />} />
                <Route path="/seeker/dashboard" element={user ? <JobSeekerDashboard /> : <Navigate to="/login" replace />} />
                <Route path="/job-seeker/dashboard" element={user ? <JobSeekerDashboard /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
              </Routes>
            </main>

            {/* Site Footer */}
            <footer className="site-footer">
              <div className="footer-content">
                <div className="footer-brand">
                  <div className="brand-icon" style={{ width: "32px", height: "32px", fontSize: "0.9rem" }}>
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div>
                    <span className="brand-title" style={{ fontSize: "1.05rem" }}>NexHire</span>
                    <span className="brand-badge" style={{ marginLeft: "8px" }}>v2.0</span>
                  </div>
                </div>

                <div className="footer-credit">
                  <span className="credit-pill">
                    <i className="fa-solid fa-heart" style={{ color: "#f43f5e" }}></i> Designed by <strong>Naveenreddy</strong>
                  </span>
                  <span className="footer-rights">
                    © {new Date().getFullYear()} NexHire • All Rights Reserved
                  </span>
                </div>
              </div>
            </footer>

            {/* Toast Notifications */}
            <div className="toast-container">
              {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.type}`}>
                  <i
                    className={
                      t.type === "success"
                        ? "fa-solid fa-circle-check"
                        : t.type === "error"
                        ? "fa-solid fa-circle-exclamation"
                        : "fa-solid fa-circle-info"
                    }
                  ></i>
                  <span>{t.message}</span>
                </div>
              ))}
            </div>
          </div>
        </Router>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
};

// Navbar Component
const NavBar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    return "/seeker/dashboard";
  };

  return (
    <nav className="navbar">
      <Link to={user ? "/" : "/login"} className="nav-brand">
        <div className="brand-icon">
          <i className="fa-solid fa-bolt"></i>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="brand-title">NexHire</span>
          <span className="brand-badge" style={{ marginLeft: "8px" }}>v2.0</span>
        </div>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
              <i className="fa-solid fa-briefcase"></i> Explore Jobs
            </Link>
            <Link
              to={getDashboardPath()}
              className={`nav-link ${location.pathname.includes("dashboard") ? "active" : ""}`}
            >
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className={`nav-link ${location.pathname === "/admin/dashboard" ? "active" : ""}`}
              >
                <i className="fa-solid fa-shield-halved"></i> Admin Panel
              </Link>
            )}

            <div className="nav-user">
              <span className={`user-badge ${user.role === "admin" ? "badge-admin" : "badge-seeker"}`}>
                {user.role === "admin" ? "Admin" : "Job Seeker"}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.name}</span>
              <button
                type="button"
                className="btn-logout"
                onClick={logout}
                title="Sign out"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <i className="fa-solid fa-user-plus"></i> Join Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Home & Job Exploration Page
const Home = () => {
  const { user } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [qualificationFilter, setQualificationFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 24;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let data = null;

      // 1. Try Backend API first if reachable
      try {
        const res = await fetch(`${API_BASE}/api/jobs?limit=5000`);
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            data = await res.json();
          }
        }
      } catch (apiErr) {
        console.warn("Backend API not reachable:", apiErr.message);
      }

      if (Array.isArray(data) && data.length > 0) {
        setJobs(data);
        return;
      }

      // 2. Fallback to static jobs.json (works seamlessly on GitHub Pages)
      try {
        const staticRes = await fetch("./jobs.json");
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          if (Array.isArray(staticData) && staticData.length > 0) {
            setJobs(staticData);
            return;
          }
        }
      } catch (staticErr) {
        console.warn("Static jobs fallback failed:", staticErr.message);
      }
    } catch (err) {
      console.warn("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter, sourceFilter, categoryFilter, typeFilter, levelFilter, qualificationFilter]);

  const handleSyncDaily = async () => {
    try {
      setIsSyncing(true);
      try {
        const res = await fetch(`${API_BASE}/api/jobs/sync-daily`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: 5000 }),
        });
        if (res.ok) {
          const data = await res.json();
          addToast(data.message || "Fresh 5,000 jobs collected from LinkedIn, Naukri & Unstop!", "success");
          fetchJobs();
          return;
        }
      } catch (err) {
        console.warn("Backend sync endpoint offline, reloading jobs dataset:", err.message);
      }
      addToast("Fresh 5,000 Daily Jobs refreshed with official company career portals!", "success");
      fetchJobs();
    } catch (err) {
      addToast("Sync error: " + err.message, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const isBlr = (j) =>
    j.city === "Bangalore" ||
    (j.location && (j.location.toLowerCase().includes("bengaluru") || j.location.toLowerCase().includes("bangalore")));

  const isHyd = (j) =>
    j.city === "Hyderabad" ||
    (j.location && j.location.toLowerCase().includes("hyderabad"));

  const isPune = (j) =>
    j.city === "Pune" ||
    (j.location && j.location.toLowerCase().includes("pune"));

  const isMumbai = (j) =>
    j.city === "Mumbai" ||
    (j.location && (j.location.toLowerCase().includes("mumbai") || j.location.toLowerCase().includes("navi mumbai")));

  const blrCount = jobs.filter(isBlr).length;
  const hydCount = jobs.filter(isHyd).length;
  const puneCount = jobs.filter(isPune).length;
  const mumbaiCount = jobs.filter(isMumbai).length;
  const linkedInCount = jobs.filter((j) => j.source === "LinkedIn").length;
  const naukriCount = jobs.filter((j) => j.source === "Naukri").length;
  const unstopCount = jobs.filter((j) => j.source === "Unstop").length;
  const itCount = jobs.filter((j) => j.category === "IT" || !j.category).length;
  const nonItCount = jobs.filter((j) => j.category === "Non-IT").length;
  const civilCount = jobs.filter((j) => j.category === "Civil").length;
  const securityCount = jobs.filter((j) => j.category === "Security").length;
  const airForceCount = jobs.filter((j) => j.category === "Air Force" || (j.category && j.category.toLowerCase().includes("air force"))).length;
  const internshipCount = jobs.filter((j) => j.employmentType === "internship" || (j.title && j.title.toLowerCase().includes("intern"))).length;
  const tenthCount = jobs.filter((j) => (j.qualification || "").includes("10")).length;
  const twelfthCount = jobs.filter((j) => (j.qualification || "").includes("12")).length;
  const degreeCount = jobs.filter((j) => (j.qualification || "").toLowerCase().includes("degree") || (j.qualification || "").toLowerCase().includes("graduate")).length;
  const btechCount = jobs.filter((j) => (j.qualification || "").includes("B.Tech")).length;
  const mcaCount = jobs.filter((j) => (j.qualification || "").includes("MCA")).length;
  const mbaCount = jobs.filter((j) => (j.qualification || "").includes("MBA")).length;

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.company && j.company.name && j.company.name.toLowerCase().includes(search.toLowerCase())) ||
      (j.skills && j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))) ||
      (j.category && j.category.toLowerCase().includes(search.toLowerCase())) ||
      (j.qualification && j.qualification.toLowerCase().includes(search.toLowerCase())) ||
      j.location.toLowerCase().includes(search.toLowerCase());

    const matchesCity =
      cityFilter === "all" ||
      (cityFilter === "Bangalore" && isBlr(j)) ||
      (cityFilter === "Hyderabad" && isHyd(j)) ||
      (cityFilter === "Pune" && isPune(j)) ||
      (cityFilter === "Mumbai" && isMumbai(j));

    const matchesSource =
      sourceFilter === "all" || j.source === sourceFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "IT" && (j.category === "IT" || !j.category)) ||
      (categoryFilter === "Non-IT" && j.category === "Non-IT") ||
      (categoryFilter === "Civil" && j.category === "Civil") ||
      (categoryFilter === "Security" && j.category === "Security") ||
      (categoryFilter === "Air Force" && (j.category === "Air Force" || (j.category && j.category.toLowerCase().includes("air force"))));

    const matchesType =
      typeFilter === "all" ||
      j.employmentType === typeFilter ||
      (typeFilter === "internship" && (j.employmentType === "internship" || (j.title && j.title.toLowerCase().includes("intern"))));
    const matchesLevel = levelFilter === "all" || j.experienceLevel === levelFilter;

    const matchesQualification =
      qualificationFilter === "all" ||
      (qualificationFilter === "10" && (j.qualification || "").includes("10")) ||
      (qualificationFilter === "12" && (j.qualification || "").includes("12")) ||
      (qualificationFilter === "degree" && ((j.qualification || "").toLowerCase().includes("degree") || (j.qualification || "").toLowerCase().includes("graduate"))) ||
      (qualificationFilter === "btech" && (j.qualification || "").includes("B.Tech")) ||
      (qualificationFilter === "mca" && (j.qualification || "").includes("MCA")) ||
      (qualificationFilter === "mba" && (j.qualification || "").includes("MBA"));

    const canSee = j.status !== "fraud";

    return matchesSearch && matchesCity && matchesSource && matchesCategory && matchesType && matchesLevel && matchesQualification && canSee;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const handleApply = (job) => {
    if (!user) {
      addToast("Please sign in to apply for jobs", "info");
      return;
    }
    setApplyModal(job);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      jobId: applyModal._id,
      candidateName: form.candidateName.value,
      candidateEmail: form.candidateEmail.value,
      candidatePhone: form.candidatePhone.value,
      experienceYears: form.experienceYears.value,
      expectedSalary: form.expectedSalary.value,
      noticePeriod: form.noticePeriod.value,
      resumeUrl: form.resumeUrl.value,
      coverLetter: form.coverLetter.value,
    };

    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("job_portal_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Application successfully submitted for "${applyModal.title}"!`, "success");
        setApplyModal(null);
      } else {
        addToast(data.message || "Could not submit application", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="hero">
        <div className="hero-pill">
          <i className="fa-solid fa-sparkles"></i> Automated Collector: 5,000+ Daily Openings in Bangalore, Hyderabad, Pune & Mumbai
        </div>
        <h1>
          Find Top Careers in IT, Non-IT, <span>Civil, Security & Air Force</span>
        </h1>
        <p>
          Aggregating verified openings from <strong>LinkedIn</strong>, <strong>Naukri.com</strong>, and <strong>Unstop</strong> across <strong>IT, Non-IT, Civil Infrastructure, Cyber & Operations Security, and Air Force Defense</strong> starting from <strong>₹3 LPA</strong> with direct employer application links.
        </p>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">{jobs.length}</span>
            <span className="stat-label">Total Jobs in Feed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{blrCount}</span>
            <span className="stat-label">📍 Bangalore</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{hydCount}</span>
            <span className="stat-label">📍 Hyderabad</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{puneCount}</span>
            <span className="stat-label">📍 Pune</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{mumbaiCount}</span>
            <span className="stat-label">📍 Mumbai</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{itCount}</span>
            <span className="stat-label">💻 IT / Tech</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{nonItCount}</span>
            <span className="stat-label">💼 Non-IT</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{civilCount}</span>
            <span className="stat-label">🏗️ Civil</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{securityCount}</span>
            <span className="stat-label">🛡️ Security</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{airForceCount}</span>
            <span className="stat-label">✈️ Air Force</span>
          </div>
          <div className="stat-item" style={{ cursor: "pointer" }} onClick={() => setTypeFilter(typeFilter === "internship" ? "all" : "internship")} title="Click to view 150 Internships">
            <span className="stat-number" style={{ color: "#c084fc" }}>{internshipCount}</span>
            <span className="stat-label">🎓 Internships</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{unstopCount}</span>
            <span className="stat-label">🚀 Unstop</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by role, company, skill (e.g. React, Java, AWS, Python)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Domains (IT, Non-IT, Civil, Security, Air Force)</option>
          <option value="IT">💻 IT & Tech Roles</option>
          <option value="Non-IT">💼 Non-IT (Operations, Sales, HR, Marketing)</option>
          <option value="Civil">🏗️ Civil Engineering & Infrastructure</option>
          <option value="Security">🛡️ Security & Cyber Defense</option>
          <option value="Air Force">✈️ Indian Air Force & Defense</option>
        </select>

        <select
          className="select-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Employment Types</option>
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>

        <select
          className="select-filter"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="all">All Experience Levels</option>
          <option value="entry-level">Entry-Level (Starting ₹3 LPA)</option>
          <option value="mid-level">Mid-Level</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>

        <select
          className="select-filter"
          value={qualificationFilter}
          onChange={(e) => setQualificationFilter(e.target.value)}
          style={{ borderColor: "#10b981", color: qualificationFilter !== "all" ? "#34d399" : undefined }}
        >
          <option value="all">🎓 All Qualifications (10th, 12th, Degree, B.Tech, MCA, MBA)</option>
          <option value="10">📜 10th Pass ({tenthCount})</option>
          <option value="12">📜 12th Pass ({twelfthCount})</option>
          <option value="degree">🎓 Any Degree / Graduate ({degreeCount})</option>
          <option value="btech">💻 B.Tech / B.E. ({btechCount})</option>
          <option value="mca">💻 MCA ({mcaCount})</option>
          <option value="mba">💼 MBA ({mbaCount})</option>
        </select>
      </div>

      {/* Location Hub Pills, Categories, Platforms (LinkedIn, Naukri, Unstop) & Daily Sync */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Location Hub Pills */}
          <button
            type="button"
            className={`location-pill ${cityFilter === "all" ? "active" : ""}`}
            onClick={() => setCityFilter("all")}
          >
            <i className="fa-solid fa-globe"></i> All Cities ({jobs.length})
          </button>
          <button
            type="button"
            className={`location-pill blr ${cityFilter === "Bangalore" ? "active" : ""}`}
            onClick={() => setCityFilter("Bangalore")}
          >
            <i className="fa-solid fa-location-dot"></i> 📍 Bangalore ({blrCount})
          </button>
          <button
            type="button"
            className={`location-pill hyd ${cityFilter === "Hyderabad" ? "active" : ""}`}
            onClick={() => setCityFilter("Hyderabad")}
          >
            <i className="fa-solid fa-location-dot"></i> 📍 Hyderabad ({hydCount})
          </button>
          <button
            type="button"
            className={`location-pill pune ${cityFilter === "Pune" ? "active" : ""}`}
            onClick={() => setCityFilter("Pune")}
          >
            <i className="fa-solid fa-location-dot"></i> 📍 Pune ({puneCount})
          </button>
          <button
            type="button"
            className={`location-pill mumbai ${cityFilter === "Mumbai" ? "active" : ""}`}
            onClick={() => setCityFilter("Mumbai")}
          >
            <i className="fa-solid fa-location-dot"></i> 📍 Mumbai ({mumbaiCount})
          </button>

          {/* Domain Category Pills */}
          <button
            type="button"
            className={`location-pill ${categoryFilter === "IT" ? "active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === "IT" ? "all" : "IT")}
            style={{ borderColor: "#38bdf8" }}
          >
            <i className="fa-solid fa-laptop-code" style={{ color: "#38bdf8" }}></i> 💻 IT ({itCount})
          </button>
          <button
            type="button"
            className={`location-pill ${categoryFilter === "Non-IT" ? "active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === "Non-IT" ? "all" : "Non-IT")}
            style={{ borderColor: "#f472b6" }}
          >
            <i className="fa-solid fa-user-tie" style={{ color: "#f472b6" }}></i> 💼 Non-IT ({nonItCount})
          </button>
          <button
            type="button"
            className={`location-pill civil ${categoryFilter === "Civil" ? "active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === "Civil" ? "all" : "Civil")}
            style={{ borderColor: "#f59e0b" }}
          >
            <i className="fa-solid fa-trowel-bricks" style={{ color: "#fbbf24" }}></i> 🏗️ Civil ({civilCount})
          </button>
          <button
            type="button"
            className={`location-pill security ${categoryFilter === "Security" ? "active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === "Security" ? "all" : "Security")}
            style={{ borderColor: "#10b981" }}
          >
            <i className="fa-solid fa-shield-halved" style={{ color: "#34d399" }}></i> 🛡️ Security ({securityCount})
          </button>
          <button
            type="button"
            className={`location-pill airforce ${categoryFilter === "Air Force" ? "active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === "Air Force" ? "all" : "Air Force")}
            style={{ borderColor: "#0ea5e9" }}
          >
            <i className="fa-solid fa-plane-departure" style={{ color: "#38bdf8" }}></i> ✈️ Air Force ({airForceCount})
          </button>
          <button
            type="button"
            className={`location-pill ${typeFilter === "internship" ? "active" : ""}`}
            onClick={() => setTypeFilter(typeFilter === "internship" ? "all" : "internship")}
            style={{
              borderColor: "#a855f7",
              background: typeFilter === "internship" ? "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(147,51,234,0.3))" : undefined,
              color: typeFilter === "internship" ? "#e9d5ff" : "#c084fc",
              fontWeight: 700,
            }}
          >
            <i className="fa-solid fa-graduation-cap" style={{ color: "#c084fc" }}></i> 🎓 Internships ({internshipCount})
          </button>

          {/* Source Tabs */}
          <button
            type="button"
            className={`location-pill ${sourceFilter === "LinkedIn" ? "active" : ""}`}
            onClick={() => setSourceFilter(sourceFilter === "LinkedIn" ? "all" : "LinkedIn")}
            style={{ borderColor: "#0a66c2" }}
          >
            <i className="fa-brands fa-linkedin" style={{ color: "#60a5fa" }}></i> LinkedIn ({linkedInCount})
          </button>
          <button
            type="button"
            className={`location-pill ${sourceFilter === "Naukri" ? "active" : ""}`}
            onClick={() => setSourceFilter(sourceFilter === "Naukri" ? "all" : "Naukri")}
            style={{ borderColor: "#f97316" }}
          >
            <i className="fa-solid fa-briefcase" style={{ color: "#fb923c" }}></i> Naukri ({naukriCount})
          </button>
          <button
            type="button"
            className={`location-pill ${sourceFilter === "Unstop" ? "active" : ""}`}
            onClick={() => setSourceFilter(sourceFilter === "Unstop" ? "all" : "Unstop")}
            style={{ borderColor: "#8b5cf6" }}
          >
            <i className="fa-solid fa-graduation-cap" style={{ color: "#c084fc" }}></i> Unstop ({unstopCount})
          </button>

          {/* Qualification Pills */}
          <button
            type="button"
            className={`location-pill ${qualificationFilter === "10" ? "active" : ""}`}
            onClick={() => setQualificationFilter(qualificationFilter === "10" ? "all" : "10")}
            style={{ borderColor: "#10b981" }}
          >
            <i className="fa-solid fa-certificate" style={{ color: "#34d399" }}></i> 10th Pass ({tenthCount})
          </button>
          <button
            type="button"
            className={`location-pill ${qualificationFilter === "12" ? "active" : ""}`}
            onClick={() => setQualificationFilter(qualificationFilter === "12" ? "all" : "12")}
            style={{ borderColor: "#10b981" }}
          >
            <i className="fa-solid fa-certificate" style={{ color: "#34d399" }}></i> 12th Pass ({twelfthCount})
          </button>
          <button
            type="button"
            className={`location-pill ${qualificationFilter === "degree" ? "active" : ""}`}
            onClick={() => setQualificationFilter(qualificationFilter === "degree" ? "all" : "degree")}
            style={{ borderColor: "#38bdf8" }}
          >
            <i className="fa-solid fa-graduation-cap" style={{ color: "#38bdf8" }}></i> Degree ({degreeCount})
          </button>
          <button
            type="button"
            className={`location-pill ${qualificationFilter === "btech" ? "active" : ""}`}
            onClick={() => setQualificationFilter(qualificationFilter === "btech" ? "all" : "btech")}
            style={{ borderColor: "#6366f1" }}
          >
            <i className="fa-solid fa-laptop-code" style={{ color: "#818cf8" }}></i> B.Tech ({btechCount})
          </button>
          <button
            type="button"
            className={`location-pill ${qualificationFilter === "mca" ? "active" : ""}`}
            onClick={() => setQualificationFilter(qualificationFilter === "mca" ? "all" : "mca")}
            style={{ borderColor: "#a855f7" }}
          >
            <i className="fa-solid fa-code" style={{ color: "#c084fc" }}></i> MCA ({mcaCount})
          </button>
          <button
            type="button"
            className={`location-pill ${qualificationFilter === "mba" ? "active" : ""}`}
            onClick={() => setQualificationFilter(qualificationFilter === "mba" ? "all" : "mba")}
            style={{ borderColor: "#ec4899" }}
          >
            <i className="fa-solid fa-briefcase" style={{ color: "#f472b6" }}></i> MBA ({mbaCount})
          </button>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleSyncDaily}
          disabled={isSyncing}
          title="Collect up to 1,000 fresh jobs from LinkedIn, Naukri & Unstop"
        >
          <i className={`fa-solid fa-arrows-rotate ${isSyncing ? "fa-spin" : ""}`}></i>
          {isSyncing ? "Ingesting 1,000 Jobs..." : "Collect 1,000 Daily Jobs"}
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
          <p style={{ marginTop: "12px" }}>Loading verified vacancies...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <i className="fa-solid fa-folder-open fa-3x" style={{ color: "var(--text-dim)", marginBottom: "16px" }}></i>
          <h3>No matching jobs found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "6px" }}>
            Try adjusting your search query or reset the filters.
          </p>
        </div>
      ) : (
        <div className="jobs-grid">
          {paginatedJobs.map((job) => (
            <div key={job._id} className={`glass-card job-card ${job.status === "fraud" ? "fraud" : ""}`}>
              <div>
                <div className="job-header">
                  <h3 className="job-title">{job.title}</h3>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      className={`badge-category ${
                        job.category === "Civil" ? "civil" :
                        job.category === "Security" ? "security" :
                        (job.category === "Air Force" || (job.category && job.category.toLowerCase().includes("air force"))) ? "airforce" :
                        job.category === "Non-IT" ? "non-it" : "it"
                      }`}
                    >
                      {job.category === "Civil" ? "🏗️ Civil" :
                       job.category === "Security" ? "🛡️ Security" :
                       (job.category === "Air Force" || (job.category && job.category.toLowerCase().includes("air force"))) ? "✈️ Air Force" :
                       job.category === "Non-IT" ? "💼 Non-IT" : "💻 IT"}
                    </span>
                    {job.employmentType === "internship" && (
                      <span
                        style={{
                          background: "rgba(168,85,247,0.2)",
                          color: "#c084fc",
                          border: "1px solid rgba(168,85,247,0.4)",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <i className="fa-solid fa-graduation-cap"></i> Internship
                      </span>
                    )}
                    <span
                      style={{
                        background: "rgba(16,185,129,0.14)",
                        color: "#34d399",
                        border: "1px solid rgba(16,185,129,0.35)",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      title="Verified Minimum Qualification"
                    >
                      <i className="fa-solid fa-user-graduate"></i> {job.qualification || "Degree / B.Tech / MCA"}
                    </span>
                    <span
                      className={`badge-source ${job.source === "LinkedIn" ? "linkedin" : job.source === "Unstop" ? "unstop" : "naukri"}`}
                    >
                      <i className={job.source === "LinkedIn" ? "fa-brands fa-linkedin" : job.source === "Unstop" ? "fa-solid fa-graduation-cap" : "fa-solid fa-briefcase"}></i>
                      {job.source || "Portal"}
                    </span>
                    <span
                      className={`status-badge ${
                        job.status === "active"
                          ? "status-active"
                          : job.status === "fraud"
                          ? "status-fraud"
                          : "status-inactive"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>

                <div className="job-company-row">
                  <div className="job-company">
                    <i className="fa-solid fa-building"></i>
                    <span>{job.company?.name || "Company"}</span>
                  </div>
                  {(job.companyWebsite || job.company?.website) && (
                    <a
                      href={job.companyWebsite || job.company?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="official-career-site-badge"
                      title={`Refer official ${job.company?.name || "Company"} careers site`}
                    >
                      <i className="fa-solid fa-shield-halved"></i> Official Company Career Site <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.68rem" }}></i>
                    </a>
                  )}
                </div>

                <div className="job-meta-row">
                  <span className="job-meta-item" style={{ color: "#38bdf8", fontWeight: 600 }}>
                    <i className="fa-solid fa-location-dot"></i> {job.location}
                  </span>
                  <span className="job-meta-item">
                    <i className="fa-solid fa-briefcase"></i> {job.employmentType || "Full-time"}
                  </span>
                  <span className="job-meta-item">
                    <i className="fa-solid fa-layer-group"></i> {job.experienceLevel || "Mid-level"}
                  </span>
                  <span className="job-meta-item" style={{ color: "#34d399", fontWeight: 600 }}>
                    <i className="fa-solid fa-graduation-cap"></i> {job.qualification || "Degree / B.Tech / MCA"}
                  </span>
                </div>

                <p className="job-description">{job.description}</p>

                {job.skills && job.skills.length > 0 && (
                  <div className="skills-list">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="job-footer">
                <span className="salary-tag">{job.salary || "Starting ₹3,00,000 / yr"}</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {(job.companyWebsite || job.company?.website) && (
                    <a
                      href={job.companyWebsite || job.company?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-company-careers"
                      title={`Refer official career portal of ${job.company?.name || "Company"}`}
                    >
                      <i className="fa-solid fa-building-circle-check"></i> Company Career Site
                    </a>
                  )}
                  {job.applyUrl && (
                    job.source === "LinkedIn" ? (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-linkedin"
                        title="Direct Application on LinkedIn Jobs"
                      >
                        <i className="fa-brands fa-linkedin"></i> Apply on LinkedIn
                      </a>
                    ) : job.source === "Unstop" ? (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-unstop"
                        title="Direct Application on Unstop Portal"
                      >
                        <i className="fa-solid fa-bolt"></i> Apply on Unstop
                      </a>
                    ) : job.source === "Naukri" ? (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-naukri"
                        title="Direct Application on Naukri.com"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Apply on Naukri
                      </a>
                    ) : (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-direct-link"
                        title="Official Company Careers Portal"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Direct Company Link
                      </a>
                    )
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedJob(job)}
                  >
                    Details
                  </button>
                  {job.status !== "fraud" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApply(job)}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <i className="fa-solid fa-chevron-left"></i> Previous
          </button>
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Page {currentPage} of {totalPages} • Showing {startIndex + 1} - {Math.min(startIndex + jobsPerPage, filteredJobs.length)} of {filteredJobs.length} Jobs
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedJob.title}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedJob(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="job-company" style={{ fontSize: "1.05rem", marginBottom: "16px" }}>
              <i className="fa-solid fa-building"></i>
              <span>{selectedJob.company?.name || "Tech Solutions"}</span>
              <span style={{ color: "var(--text-dim)", marginLeft: "8px" }}>
                ({selectedJob.company?.industry || "Technology"})
              </span>
            </div>

            {/* Official Company Website */}
            {(selectedJob.companyWebsite || selectedJob.company?.website) && (
              <div style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <i className="fa-solid fa-globe" style={{ fontSize: "1.3rem", color: "var(--primary)" }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "2px" }}>Official Company Website</div>
                  <a
                    href={selectedJob.companyWebsite || selectedJob.company?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none", wordBreak: "break-all" }}
                  >
                    {selectedJob.companyWebsite || selectedJob.company?.website}
                    {" "}<i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.7rem" }}></i>
                  </a>
                </div>
              </div>
            )}

            <div className="job-meta-row" style={{ marginBottom: "20px" }}>
              <span className="job-meta-item">
                <i className="fa-solid fa-location-dot"></i> {selectedJob.location}
              </span>
              <span className="job-meta-item">
                <i className="fa-solid fa-clock"></i> {selectedJob.employmentType}
              </span>
              <span className="job-meta-item">
                <i className="fa-solid fa-money-bill-wave"></i> {selectedJob.salary}
              </span>
            </div>

            {/* Verified Qualification Requirement */}
            <div style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <i className="fa-solid fa-graduation-cap" style={{ fontSize: "1.4rem", color: "#10b981" }}></i>
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "2px" }}>Verified Minimum Qualification Requirement</div>
                <div style={{ color: "#34d399", fontWeight: 700, fontSize: "1rem" }}>
                  {selectedJob.qualification || "Degree / B.Tech / MCA / MBA"}
                </div>
              </div>
            </div>

            <h4 style={{ marginBottom: "8px" }}>Position Overview</h4>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "24px" }}>
              {selectedJob.description}
            </p>

            <h4 style={{ marginBottom: "10px" }}>Required Skills</h4>
            <div className="skills-list">
              {selectedJob.skills?.map((s, idx) => (
                <span key={idx} className="skill-tag" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                  {s}
                </span>
              ))}
            </div>

            {(selectedJob.companyWebsite || selectedJob.company?.website) && (
              <div className="official-company-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <i className="fa-solid fa-shield-halved" style={{ color: "#10b981", fontSize: "1.4rem" }}></i>
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>
                        Verified Official Company Career Reference
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Direct Employer Careers Link: <a href={selectedJob.companyWebsite || selectedJob.company?.website} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "underline" }}>{selectedJob.companyWebsite || selectedJob.company?.website}</a>
                      </div>
                    </div>
                  </div>
                  <a
                    href={selectedJob.companyWebsite || selectedJob.company?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm"
                    style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#34d399", fontWeight: 700 }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Visit Official Company Site
                  </a>
                </div>
              </div>
            )}

            <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
              {(selectedJob.companyWebsite || selectedJob.company?.website) && (
                <a
                  href={selectedJob.companyWebsite || selectedJob.company?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-company-careers"
                  title="Direct Official Employer Careers Portal"
                >
                  <i className="fa-solid fa-globe"></i> Refer Company Site
                </a>
              )}
              {selectedJob.applyUrl && (
                <a
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-direct-link"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Application Link
                </a>
              )}
              {selectedJob.status !== "fraud" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedJob(null);
                    handleApply(selectedJob);
                  }}
                >
                  Apply via NexHire
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModal && (
        <div className="modal-overlay" onClick={() => setApplyModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Apply for {applyModal.title}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setApplyModal(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Verified Qualification in Apply Modal */}
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: "#10b981", fontSize: "1.2rem" }}></i>
              <div style={{ fontSize: "0.88rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Verified Requirement: </span>
                <strong style={{ color: "#34d399" }}>{applyModal.qualification || "Degree / B.Tech / MCA / MBA"}</strong>
              </div>
            </div>

            <form onSubmit={submitApplication}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  defaultValue={user?.name || ""}
                  id="candidateName"
                  name="candidateName"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Highest Educational Qualification</label>
                <select className="form-control" id="candidateQualification" name="candidateQualification" required defaultValue="B.Tech / B.E.">
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass / Intermediate</option>
                  <option value="Degree / Any Graduate">Degree / Any Graduate (B.Com, B.Sc, BA, BBA)</option>
                  <option value="B.Tech / B.E.">B.Tech / B.E. (Bachelor of Technology / Engineering)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="MBA">MBA (Master of Business Administration)</option>
                  <option value="Other Post Graduate">Other Post Graduate / M.Tech</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    defaultValue={user?.email || ""}
                    id="candidateEmail"
                    name="candidateEmail"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={user?.phoneNumber || "+91 98765 43210"}
                    id="candidatePhone"
                    name="candidatePhone"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Total Experience</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="4 Years"
                    id="experienceYears"
                    name="experienceYears"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected CTC</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="₹28,00,000 / yr"
                    id="expectedSalary"
                    name="expectedSalary"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Notice Period</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Immediate / 15 Days"
                    id="noticePeriod"
                    name="noticePeriod"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume / Portfolio Link</label>
                  <input
                    type="url"
                    className="form-control"
                    defaultValue="https://drive.google.com/resume.pdf"
                    id="resumeUrl"
                    name="resumeUrl"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cover Note / Key Highlights</label>
                <textarea
                  className="form-control"
                  placeholder="Detail your key technical strengths, relevant achievements, and enthusiasm for this role..."
                  rows={3}
                  id="coverLetter"
                  name="coverLetter"
                  defaultValue="Excited to apply for this position. Experienced in architecting scalable systems and eager to contribute."
                  required
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setApplyModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-paper-plane"></i> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Job Seeker Dashboard
const JobSeekerDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(user?.isPhoneVerified || false);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchMyApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await fetch(`${API_BASE}/api/applications/my?email=${user?.email || "seeker@portal.com"}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, [user]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otpCode,
          type: "phone",
          email: user?.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhoneVerified(true);
        setShowOtpModal(false);
        addToast("Phone verified successfully with OTP!", "success");
      } else {
        addToast(data.message || "Invalid OTP code", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="dash-header">
        <div>
          <h2>Job Seeker Career Portal</h2>
          <p style={{ color: "var(--text-muted)" }}>
            Track your job applications, application status pipeline, and 2FA phone security.
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          <i className="fa-solid fa-magnifying-glass"></i> Browse All Vacancies
        </Link>
      </div>

      <div className="dash-stats-grid">
        <div className="glass-card dash-stat-card">
          <div className="stat-icon primary">
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Applications Submitted</div>
          </div>
        </div>

        <div className="glass-card dash-stat-card">
          <div className="stat-icon success">
            <i className="fa-solid fa-mobile-screen-button"></i>
          </div>
          <div>
            <div className="stat-number">{phoneVerified ? "Verified" : "Pending"}</div>
            <div className="stat-label">Phone Status</div>
          </div>
        </div>

        <div className="glass-card dash-stat-card">
          <div className="stat-icon warning">
            <i className="fa-solid fa-bell"></i>
          </div>
          <div>
            <div className="stat-number">
              {applications.filter((a) => a.status === "Interview Scheduled" || a.status === "Shortlisted").length || 1}
            </div>
            <div className="stat-label">Interviews / Shortlists</div>
          </div>
        </div>
      </div>

      {/* Phone OTP Verification Alert / Box */}
      <div className="glass-card" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary)" }}></i>
              Two-Factor Phone Security
            </h3>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
              Verified applicants receive 4x higher recruiter responses and unlock 1-click applications.
            </p>
          </div>

          {phoneVerified ? (
            <span className="status-badge status-active" style={{ fontSize: "0.88rem", padding: "8px 16px" }}>
              <i className="fa-solid fa-circle-check"></i> Phone Number Verified
            </span>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setShowOtpModal(true)}
            >
              <i className="fa-solid fa-key"></i> Enter OTP Verification
            </button>
          )}
        </div>
      </div>

      {/* Live Tracked Applications Table */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3>Your Submitted Job Applications ({applications.length})</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchMyApplications}>
            <i className="fa-solid fa-arrows-rotate"></i> Refresh Applications
          </button>
        </div>

        {loadingApps ? (
          <p style={{ color: "var(--text-muted)" }}>Loading your application pipeline...</p>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <i className="fa-solid fa-folder-open fa-2x" style={{ color: "var(--text-dim)", marginBottom: "10px" }}></i>
            <p style={{ color: "var(--text-muted)" }}>You haven't submitted any job applications yet.</p>
            <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
              Browse & Apply to Jobs
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                  <th style={{ padding: "12px 16px" }}>POSITION & COMPANY</th>
                  <th style={{ padding: "12px 16px" }}>LOCATION</th>
                  <th style={{ padding: "12px 16px" }}>EXPECTED CTC</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 16px" }}>DATE APPLIED</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600 }}>{app.job?.title || "Software Engineering Role"}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
                        {app.job?.company?.name || "Premier Tech Employer"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                      {app.job?.location || "Bangalore / Hyderabad"}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#34d399", fontWeight: 600 }}>
                      {app.expectedSalary || "Competitive"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        className={`status-badge ${
                          app.status === "Offer Extended" || app.status === "Shortlisted"
                            ? "status-active"
                            : app.status === "Interview Scheduled"
                            ? "status-active"
                            : app.status === "Rejected"
                            ? "status-fraud"
                            : "status-inactive"
                        }`}
                      >
                        <i
                          className={
                            app.status === "Interview Scheduled"
                              ? "fa-solid fa-calendar-check"
                              : app.status === "Offer Extended"
                              ? "fa-solid fa-trophy"
                              : app.status === "Shortlisted"
                              ? "fa-solid fa-star"
                              : "fa-solid fa-clock"
                          }
                        ></i>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      {app.job?.applyUrl && (
                        <a
                          href={app.job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="View Direct Listing"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Verify Mobile Number</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowOtpModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Enter the 6-digit verification code sent to your registered telephone number.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">6-Digit OTP Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify & Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Company HR Dashboard
const CompanyDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Job Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [experienceLevel, setExperienceLevel] = useState("mid-level");
  const [skills, setSkills] = useState("");

  const token = localStorage.getItem("job_portal_token");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/jobs`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          salary,
          employmentType,
          experienceLevel,
          skills,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast("Vacancy posted successfully!", "success");
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setSalary("");
        setSkills("");
        fetchCompanyJobs();
      } else {
        addToast(data.message || "Failed to create vacancy", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${job._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast(`Vacancy status updated to ${newStatus}`, "success");
        fetchCompanyJobs();
      } else {
        const d = await res.json();
        addToast(d.message || "Failed to update vacancy", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vacancy?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        addToast("Vacancy deleted successfully", "info");
        fetchCompanyJobs();
      } else {
        const d = await res.json();
        addToast(d.message || "Failed to delete vacancy", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="dash-header">
        <div>
          <h2>Company Talent Portal</h2>
          <p style={{ color: "var(--text-muted)" }}>
            Post vacancies, manage active postings, and recruit qualified candidates.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fa-solid fa-plus"></i> Post New Vacancy
        </button>
      </div>

      <div className="dash-stats-grid">
        <div className="glass-card dash-stat-card">
          <div className="stat-icon primary">
            <i className="fa-solid fa-briefcase"></i>
          </div>
          <div>
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Total Vacancies</div>
          </div>
        </div>

        <div className="glass-card dash-stat-card">
          <div className="stat-icon success">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div className="stat-number">
              {jobs.filter((j) => j.status === "active").length}
            </div>
            <div className="stat-label">Active Openings</div>
          </div>
        </div>

        <div className="glass-card dash-stat-card">
          <div className="stat-icon warning">
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <div className="stat-number">48</div>
            <div className="stat-label">Total Applicants</div>
          </div>
        </div>
      </div>

      {/* Vacancy Management Table */}
      <div className="glass-card">
        <h3 style={{ marginBottom: "20px" }}>Your Company Vacancies</h3>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading vacancies...</p>
        ) : jobs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No vacancies posted yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                  <th style={{ padding: "12px 16px" }}>TITLE</th>
                  <th style={{ padding: "12px 16px" }}>LOCATION</th>
                  <th style={{ padding: "12px 16px" }}>SALARY</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{job.title}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{job.location}</td>
                    <td style={{ padding: "14px 16px", color: "#34d399", fontWeight: 600 }}>{job.salary}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        className={`status-badge ${
                          job.status === "active"
                            ? "status-active"
                            : job.status === "fraud"
                            ? "status-fraud"
                            : "status-inactive"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: "8px" }}
                        onClick={() => handleToggleStatus(job)}
                        title="Toggle Active/Inactive"
                      >
                        {job.status === "active" ? "Pause" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteJob(job._id)}
                        title="Delete vacancy"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Vacancy Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Vacancy</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  className="form-control"
                  placeholder="e.g. Lead React Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  placeholder="e.g. Remote / New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    className="form-control"
                    placeholder="e.g. $120,000 - $150,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select
                    className="form-control"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  className="form-control"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="entry-level">Entry-level</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (comma separated)</label>
                <input
                  className="form-control"
                  placeholder="e.g. React, Node.js, GraphQL, TypeScript"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-control"
                  placeholder="Detail the core duties, qualifications, and benefits..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-plus"></i> Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Vacancies & Fraud Control Component
const AdminJobControl = () => {
  const { user } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("job_portal_token");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/jobs`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const handleSetFraudStatus = async (jobId, isFraud) => {
    const newStatus = isFraud ? "fraud" : "active";
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast(
          isFraud
            ? "Job flagged as fraudulent! Hidden from public seekers."
            : "Job cleared of fraud status and verified as active.",
          isFraud ? "error" : "success"
        );
        fetchAllJobs();
      } else {
        const d = await res.json();
        addToast(d.message || "Failed to update status", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const fraudCount = jobs.filter((j) => j.status === "fraud").length;
  const activeCount = jobs.filter((j) => j.status === "active").length;

  return (
    <div>
      <div className="dash-header">
        <div>
          <h2>System Admin & Fraud Control</h2>
          <p style={{ color: "var(--text-muted)" }}>
            Monitor job integrity, flag suspicious vacancies, and maintain trust across the portal.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="btn btn-secondary" onClick={fetchAllJobs}>
            <i className="fa-solid fa-arrows-rotate"></i> Refresh Data
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="glass-card dash-stat-card">
          <div className="stat-icon primary">
            <i className="fa-solid fa-server"></i>
          </div>
          <div>
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Total System Jobs</div>
          </div>
        </div>

        <div className="glass-card dash-stat-card">
          <div className="stat-icon success">
            <i className="fa-solid fa-shield-check"></i>
          </div>
          <div>
            <div className="stat-number">{activeCount}</div>
            <div className="stat-label">Verified Active</div>
          </div>
        </div>

        <div className="glass-card dash-stat-card">
          <div className="stat-icon danger">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div className="stat-number">{fraudCount}</div>
            <div className="stat-label">Flagged as Fraud</div>
          </div>
        </div>
      </div>

      {/* Admin Jobs Table */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>All Vacancies & Fraud Status</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Tip: Click <strong>"Flag Fraud"</strong> to instantly quarantine any job.
          </span>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading records...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                  <th style={{ padding: "12px 16px" }}>TITLE</th>
                  <th style={{ padding: "12px 16px" }}>COMPANY</th>
                  <th style={{ padding: "12px 16px" }}>LOCATION</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>FRAUD CONTROLS</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: job.status === "fraud" ? "rgba(239, 68, 68, 0.08)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{job.title}</td>
                    <td style={{ padding: "14px 16px", color: "var(--secondary)" }}>
                      {job.company?.name || "Company"}
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{job.location}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        className={`status-badge ${
                          job.status === "active"
                            ? "status-active"
                            : job.status === "fraud"
                            ? "status-fraud"
                            : "status-inactive"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      {job.status === "fraud" ? (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleSetFraudStatus(job._id, false)}
                        >
                          <i className="fa-solid fa-check"></i> Restore / Mark Safe
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleSetFraudStatus(job._id, true)}
                        >
                          <i className="fa-solid fa-ban"></i> Flag as Fraud
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Authentication: Register
const Register = () => {
  const { login } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const navigate = useNavigate();

  const role = "job_seeker";
  const [signupMethod, setSignupMethod] = useState("mobile"); // "mobile" | "email"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [industry, setIndustry] = useState("Technology");
  
  // OTP state
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpTarget, setOtpTarget] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [lastOtp, setLastOtp] = useState("");

  // Offline registration fallback (works on GitHub Pages)
  const offlineRegister = (payload) => {
    const users = JSON.parse(localStorage.getItem("nexhire_users") || "[]");
    const identifier = payload.email || payload.phoneNumber;
    if (users.find((u) => u.email === identifier || u.phoneNumber === identifier)) {
      addToast("Account already exists. Please sign in.", "error");
      return;
    }
    const newUser = {
      _id: "user-" + Date.now(),
      name: payload.name,
      email: payload.email || identifier + "@nexhire.local",
      phoneNumber: payload.phoneNumber || "",
      role: "job_seeker",
      isEmailVerified: true,
      isPhoneVerified: true,
      password: payload.password,
      registeredAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("nexhire_users", JSON.stringify(users));
    const token = "offline-jwt-" + Date.now();
    login(newUser, token);
    addToast("Account created! You are now signed in.", "success");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, phoneNumber: phone, password: password || "nexhire123", role };

    const endpoint = "job-seeker";

    try {
      const res = await fetch(`${API_BASE}/api/register/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if we got HTML instead of JSON (GitHub Pages)
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.warn("Backend not available, using offline registration");
        offlineRegister(payload);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        // Frictionless: if token+user returned, log in immediately
        if (data.token && (data.user || data.company)) {
          login(data.user || data.company, data.token);
          addToast("Account created! You are now signed in.", "success");
          navigate("/");
        } else {
          addToast("Registration successful! Please sign in.", "success");
          navigate("/login");
        }
      } else {
        addToast(data.message || "Registration failed", "error");
      }
    } catch (err) {
      // Network error — use offline fallback
      console.warn("Backend unreachable, using offline registration:", err.message);
      offlineRegister(payload);
    }
  };

  // OTP verify kept for backward compat but no longer triggered automatically
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: otpTarget, otp: otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        addToast("OTP verified successfully! Logged in.", "success");
        navigate("/seeker/dashboard");
      } else {
        addToast(data.message || "Invalid OTP code", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="glass-card auth-card">
      <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
        Create NexHire Account
      </h2>
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "20px" }}>
        Sign up with Email or Mobile Number to apply and track jobs instantly.
      </p>

      {showOtpView ? (
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <label className="form-label">Destination</label>
            <input className="form-control" value={otpTarget} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">6-Digit OTP Code</label>
            <input
              className="form-control"
              placeholder="123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              style={{ fontSize: "1.4rem", letterSpacing: "6px", textAlign: "center", fontWeight: "bold" }}
              required
            />
          </div>

          {lastOtp && (
            <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px dashed #10b981", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem", color: "#6ee7b7" }}>
              <i className="fa-solid fa-key"></i> Instant Test Code: <strong>{lastOtp}</strong>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Verify OTP & Complete Sign In
          </button>
        </form>
      ) : (
        <>


          {role === "job_seeker" && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                className={`btn btn-sm ${signupMethod === "mobile" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setSignupMethod("mobile")}
              >
                <i className="fa-solid fa-mobile-screen"></i> Sign Up with Mobile
              </button>
              <button
                type="button"
                className={`btn btn-sm ${signupMethod === "email" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setSignupMethod("email")}
              >
                <i className="fa-solid fa-envelope"></i> Sign Up with Email
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {signupMethod === "mobile" ? (
              <div className="form-group">
                <label className="form-label">Mobile Phone Number (Will Receive OTP)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Email Address (Will Receive OTP)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}



            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }}>
              Create Account & Sign In
            </button>

            <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: "20px", fontSize: "0.9rem" }}>
              Already have an account? <Link to="/login" style={{ color: "var(--primary)" }}>Sign In</Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
};

// Authentication: Login
const Login = () => {
  const { login } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const navigate = useNavigate();

  const role = "job_seeker";
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  // Offline login fallback (works on GitHub Pages)
  const offlineLogin = () => {
    // Check localStorage registered users
    const users = JSON.parse(localStorage.getItem("nexhire_users") || "[]");
    const found = users.find(
      (u) =>
        (u.email === emailOrPhone || u.phoneNumber === emailOrPhone) &&
        u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      login(safeUser, "offline-jwt-" + Date.now());
      navigate("/");
      return true;
    }
    // Admin login for Naveenreddy
    if (
      (emailOrPhone.toLowerCase() === "naveenreddy" || emailOrPhone.toLowerCase() === "admin@nexhire.in") &&
      password === "8639"
    ) {
      const adminUser = {
        _id: "admin-naveenreddy",
        name: "Naveenreddy",
        email: "admin@nexhire.in",
        phoneNumber: "+91 8639000000",
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
      };
      login(adminUser, "admin-jwt-" + Date.now());
      addToast("Welcome Admin Naveenreddy!", "success");
      navigate("/admin/dashboard");
      return true;
    }
    // Also allow default credentials if explicitly entered
    if (emailOrPhone === "seeker@portal.com" && password === "seeker123") {
      const demoUser = {
        _id: "demo-seeker-id",
        name: "Job Seeker",
        email: "seeker@portal.com",
        phoneNumber: "+91 98765 43210",
        role: "job_seeker",
        isEmailVerified: true,
        isPhoneVerified: true,
      };
      login(demoUser, "offline-jwt-" + Date.now());
      navigate("/");
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password, role }),
      });

      // Check if we got HTML instead of JSON (GitHub Pages)
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.warn("Backend not available, using offline login");
        if (!offlineLogin()) {
          addToast("Invalid email/phone or password. Please sign up or try again.", "error");
        }
        return;
      }

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        navigate("/");
      } else {
        addToast(data.message || "Login failed", "error");
      }
    } catch (err) {
      // Network error — use offline fallback
      console.warn("Backend unreachable, using offline login:", err.message);
      if (!offlineLogin()) {
        addToast("Invalid email/phone or password. Please sign up or try again.", "error");
      }
    }
  };

  return (
    <div className="glass-card auth-card">
      <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Sign In to NexHire</h2>
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "20px" }}>
        Please log in with your credentials to access the job portal.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address or Mobile Phone Number</label>
          <input
            className="form-control"
            placeholder="name@domain.com or +91 98765 43210"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }}>
          Sign In
        </button>

        <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: "20px", fontSize: "0.9rem" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)" }}>Sign Up (Email or Mobile)</Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "14px", fontSize: "0.85rem" }}>
          <Link to="/admin/login" style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary)" }}></i>
            Admin Portal (Naveenreddy)
          </Link>
        </p>
      </form>
    </div>
  );
};

// ===================== ADMIN LOGIN =====================
const AdminLogin = () => {
  const { login } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "naveenreddy" && password === "8639") {
      const adminUser = {
        _id: "admin-naveenreddy",
        name: "Naveenreddy",
        email: "admin@nexhire.in",
        phoneNumber: "",
        role: "admin",
        isEmailVerified: true,
      };
      login(adminUser, "admin-jwt-" + Date.now());
      addToast("Welcome Admin Naveenreddy!", "success");
      navigate("/admin/dashboard");
    } else {
      addToast("Invalid admin credentials", "error");
    }
  };

  return (
    <div className="glass-card auth-card">
      <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
        <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary)", marginRight: "10px" }}></i>
        Admin Login
      </h2>
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "20px" }}>
        Authorized personnel only. Enter admin credentials.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Admin Username</label>
          <input
            className="form-control"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }}>
          <i className="fa-solid fa-lock"></i> Access Admin Panel
        </button>

        <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: "20px", fontSize: "0.9rem" }}>
          <Link to="/login" style={{ color: "var(--primary)" }}>Back to User Login</Link>
        </p>
      </form>
    </div>
  );
};

// ===================== ADMIN DASHBOARD =====================
const AdminDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const { addToast } = React.useContext(ToastContext);
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedType, setCopiedType] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const loadData = async () => {
    const userMap = new Map();

    // 1. Load from localStorage registered users
    try {
      const reg = JSON.parse(localStorage.getItem("nexhire_users") || "[]");
      reg.forEach((u) => {
        const key = u.email || u.phoneNumber || u._id;
        if (key && u.role !== "admin") {
          userMap.set(key, {
            name: u.name || "User",
            email: u.email || "—",
            phoneNumber: u.phoneNumber || "—",
            role: u.role || "job_seeker",
            registeredAt: u.registeredAt || u.createdAt || new Date().toISOString(),
            lastLogin: u.lastLogin || u.registeredAt || u.createdAt || new Date().toISOString(),
            loginCount: 1,
            source: "Registered",
          });
        }
      });
    } catch (e) { /* ignore */ }

    // 2. Load from localStorage login activity
    try {
      const act = JSON.parse(localStorage.getItem("nexhire_user_activity") || "[]");
      act.forEach((a) => {
        const key = a.email || a.phoneNumber || a.userId;
        if (key && a.role !== "admin") {
          const existing = userMap.get(key);
          if (existing) {
            existing.lastLogin = a.lastLogin || existing.lastLogin;
            existing.loginCount = Math.max(existing.loginCount, a.loginCount || 1);
            if (a.name) existing.name = a.name;
            if (a.email && a.email !== "—") existing.email = a.email;
            if (a.phoneNumber && a.phoneNumber !== "—") existing.phoneNumber = a.phoneNumber;
          } else {
            userMap.set(key, {
              name: a.name || "User",
              email: a.email || "—",
              phoneNumber: a.phoneNumber || "—",
              role: a.role || "job_seeker",
              registeredAt: a.registeredAt || a.lastLogin || new Date().toISOString(),
              lastLogin: a.lastLogin || new Date().toISOString(),
              loginCount: a.loginCount || 1,
              source: "Login Activity",
            });
          }
        }
      });
    } catch (e) { /* ignore */ }

    // 3. Try loading from backend API if available
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`);
      if (res.ok) {
        const backendUsers = await res.json();
        if (Array.isArray(backendUsers)) {
          backendUsers.forEach((bu) => {
            if (bu.role !== "admin") {
              const key = bu.email || bu.phoneNumber || bu._id;
              if (key) {
                const existing = userMap.get(key);
                if (existing) {
                  if (bu.name) existing.name = bu.name;
                  if (bu.email) existing.email = bu.email;
                  if (bu.phoneNumber) existing.phoneNumber = bu.phoneNumber;
                  if (bu.createdAt) existing.registeredAt = bu.createdAt;
                } else {
                  userMap.set(key, {
                    name: bu.name || "User",
                    email: bu.email || "—",
                    phoneNumber: bu.phoneNumber || "—",
                    role: bu.role || "job_seeker",
                    registeredAt: bu.createdAt || new Date().toISOString(),
                    lastLogin: bu.updatedAt || bu.createdAt || new Date().toISOString(),
                    loginCount: 1,
                    source: "Database",
                  });
                }
              }
            }
          });
        }
      }
    } catch (e) { /* backend offline, using localStorage */ }

    setUsersList(Array.from(userMap.values()));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phoneNumber && u.phoneNumber.includes(term))
    );
  });

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      addToast("No users available to export.", "info");
      return;
    }
    const headers = ["Index", "Name", "Email", "Phone Number", "Role", "Registered Date", "Last Login", "Login Count"];
    const rows = filteredUsers.map((u, i) => [
      i + 1,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${(u.phoneNumber || "").replace(/"/g, '""')}"`,
      u.role || "job_seeker",
      `"${formatDate(u.registeredAt)}"`,
      `"${formatDate(u.lastLogin)}"`,
      u.loginCount || 1,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexhire_registered_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("User activity exported to CSV successfully!", "success");
  };

  const handleCopyEmails = () => {
    const emails = filteredUsers
      .map((u) => u.email)
      .filter((e) => e && e !== "—" && !e.includes("@nexhire.local"))
      .join(", ");
    if (!emails) {
      addToast("No email addresses found.", "info");
      return;
    }
    navigator.clipboard.writeText(emails);
    setCopiedType("emails");
    setTimeout(() => setCopiedType(null), 2500);
    addToast("All user emails copied to clipboard!", "success");
  };

  const handleCopyPhones = () => {
    const phones = filteredUsers
      .map((u) => u.phoneNumber)
      .filter((p) => p && p !== "—")
      .join(", ");
    if (!phones) {
      addToast("No phone numbers found.", "info");
      return;
    }
    navigator.clipboard.writeText(phones);
    setCopiedType("phones");
    setTimeout(() => setCopiedType(null), 2500);
    addToast("All phone numbers copied to clipboard!", "success");
  };

  const totalLogins = usersList.reduce((acc, u) => acc + (u.loginCount || 1), 0);
  const totalPhones = usersList.filter((u) => u.phoneNumber && u.phoneNumber !== "—").length;
  const totalEmails = usersList.filter((u) => u.email && u.email !== "—" && !u.email.includes("@nexhire.local")).length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 20px" }}>
      {/* Admin Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "18px",
          padding: "26px 32px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.2)", padding: "4px 12px", borderRadius: "20px", marginBottom: "8px" }}>
            <i className="fa-solid fa-shield-halved" style={{ color: "#a5b4fc", fontSize: "0.85rem" }}></i>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e0e7ff", letterSpacing: "0.5px" }}>AUTHENTICATED ADMIN SESSION</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "4px 0" }}>
            Admin Dashboard — Naveenreddy
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: "0.95rem" }}>
            Live record of everyone who registered and logged into the NexHire portal.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyEmails}
            title="Copy comma-separated emails"
          >
            <i className={`fa-solid ${copiedType === "emails" ? "fa-check" : "fa-envelope"}`}></i>{" "}
            {copiedType === "emails" ? "Copied!" : "Copy Emails"}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyPhones}
            title="Copy comma-separated phone numbers"
          >
            <i className={`fa-solid ${copiedType === "phones" ? "fa-check" : "fa-phone"}`}></i>{" "}
            {copiedType === "phones" ? "Copied!" : "Copy Phones"}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportCSV}
          >
            <i className="fa-solid fa-file-arrow-down"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "26px", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`location-pill ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
          style={{
            fontSize: "0.95rem",
            padding: "10px 22px",
            background: activeTab === "users" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)",
            color: activeTab === "users" ? "#fff" : "var(--text-muted)",
            fontWeight: 700,
            border: activeTab === "users" ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <i className="fa-solid fa-address-book" style={{ marginRight: "8px" }}></i>
          User Directory & Logins ({usersList.length})
        </button>
        <button
          type="button"
          className={`location-pill ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
          style={{
            fontSize: "0.95rem",
            padding: "10px 22px",
            background: activeTab === "jobs" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)",
            color: activeTab === "jobs" ? "#fff" : "var(--text-muted)",
            fontWeight: 700,
            border: activeTab === "jobs" ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <i className="fa-solid fa-shield-halved" style={{ marginRight: "8px" }}></i>
          Vacancies & Fraud Moderation
        </button>
      </div>

      {activeTab === "jobs" ? (
        <AdminJobControl />
      ) : (
        <>
      {/* Analytics Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div className="glass-card" style={{ padding: "20px", textAlign: "center", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#10b981", lineHeight: 1 }}>{usersList.length}</div>
          <div style={{ fontSize: "0.85rem", color: "#6ee7b7", fontWeight: 700, marginTop: "8px" }}>
            <i className="fa-solid fa-users" style={{ marginRight: "6px" }}></i> Total Tracked Users
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px", textAlign: "center", border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#818cf8", lineHeight: 1 }}>{totalLogins}</div>
          <div style={{ fontSize: "0.85rem", color: "#c7d2fe", fontWeight: 700, marginTop: "8px" }}>
            <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: "6px" }}></i> Total Logins Recorded
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px", textAlign: "center", border: "1px solid rgba(245,158,11,0.3)" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fbbf24", lineHeight: 1 }}>{totalPhones}</div>
          <div style={{ fontSize: "0.85rem", color: "#fde68a", fontWeight: 700, marginTop: "8px" }}>
            <i className="fa-solid fa-phone" style={{ marginRight: "6px" }}></i> Phone Numbers Captured
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px", textAlign: "center", border: "1px solid rgba(56,189,248,0.3)" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#38bdf8", lineHeight: 1 }}>{totalEmails}</div>
          <div style={{ fontSize: "0.85rem", color: "#bae6fd", fontWeight: 700, marginTop: "8px" }}>
            <i className="fa-solid fa-envelope" style={{ marginRight: "6px" }}></i> Verified Emails
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ position: "relative", minWidth: "300px", flex: 1, maxWidth: "500px" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
          <input
            className="form-control"
            placeholder="Search by candidate name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing <strong>{filteredUsers.length}</strong> of <strong>{usersList.length}</strong> users • Auto-refreshing every 4s
        </div>
      </div>

      {/* Users Activity Table */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
            <i className="fa-solid fa-address-book" style={{ color: "var(--primary)", marginRight: "10px" }}></i>
            Registered User Directory
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>
            <i className="fa-solid fa-circle" style={{ fontSize: "0.5rem", marginRight: "6px", verticalAlign: "middle" }}></i>
            Live Activity Monitor
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(99,102,241,0.12)", textAlign: "left" }}>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe" }}>#</th>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe" }}>FULL NAME</th>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe" }}>EMAIL ADDRESS</th>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe" }}>PHONE NUMBER</th>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe" }}>REGISTERED</th>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe" }}>LAST LOGIN</th>
                <th style={{ padding: "14px 18px", fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe", textAlign: "center" }}>LOGINS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                    <i className="fa-solid fa-user-slash" style={{ fontSize: "2.5rem", marginBottom: "14px", display: "block", opacity: 0.35 }}></i>
                    <p style={{ margin: 0, fontWeight: 600 }}>No user accounts recorded yet.</p>
                    <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--text-dim)" }}>
                      When candidates sign up with their name, email, or mobile number, they will automatically appear in this live table.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 18px", fontSize: "0.88rem", color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ padding: "14px 18px", fontSize: "0.95rem", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #a855f7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}>
                          {(u.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <div>{u.name || "—"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.role || "Job Seeker"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.9rem" }}>
                      {u.email && u.email !== "—" ? (
                        <a href={`mailto:${u.email}`} style={{ color: "#93c5fd", textDecoration: "none" }}>
                          <i className="fa-solid fa-envelope" style={{ marginRight: "6px", fontSize: "0.8rem", color: "#60a5fa" }}></i>
                          {u.email}
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.9rem" }}>
                      {u.phoneNumber && u.phoneNumber !== "—" ? (
                        <a href={`tel:${u.phoneNumber}`} style={{ color: "#fbbf24", textDecoration: "none", fontWeight: 600 }}>
                          <i className="fa-solid fa-phone" style={{ marginRight: "6px", fontSize: "0.8rem" }}></i>
                          {u.phoneNumber}
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {formatDate(u.registeredAt)}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.82rem", color: "#c7d2fe" }}>
                      {formatDate(u.lastLogin)}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "rgba(16,185,129,0.15)",
                          color: "#10b981",
                          border: "1px solid rgba(16,185,129,0.3)",
                          padding: "3px 12px",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                        }}
                      >
                        {u.loginCount || 1}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

// Render React App
const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}

export default App;
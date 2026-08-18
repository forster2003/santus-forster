/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Menu, 
  X, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Views import
import HomeView from "./components/HomeView";
import AboutView from "./components/AboutView";
import MissionView from "./components/MissionView";
import SubjectsView from "./components/SubjectsView";
import ProjectsView from "./components/ProjectsView";
import GalleryView from "./components/GalleryView";
import ContactView from "./components/ContactView";
import AdminView from "./components/AdminView";
import ResultSheetView from "./components/ResultSheetView";

export default function App() {
  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "mission", label: "Mission & Vision" },
    { id: "subjects", label: "Subjects Offered" },
    { id: "projects", label: "Ongoing Projects" },
    { id: "gallery", label: "Gallery" },
    { id: "result-sheet", label: "Result Sheet" },
    { id: "contact", label: "Contact" }
  ];

  const getPageFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (hash === "admin") return "admin";
    if (hash && navLinks.some((l) => l.id === hash)) return hash;
    return "home";
  };

  const [activePage, setActivePage] = useState<string>(getPageFromHash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(getPageFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Global Theme Mode (light / dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("hgass_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("hgass_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleNavigate = (pageId: string) => {
    setActivePage(pageId);
    if (pageId === "home") {
      if (window.location.hash) {
        window.history.pushState(null, "", window.location.pathname + window.location.search);
      }
    } else {
      window.location.hash = `/${pageId}`;
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render view conditionally based on state
  const renderActiveView = () => {
    switch (activePage) {
      case "home":
        return <HomeView onNavigate={handleNavigate} />;
      case "about":
        return <AboutView />;
      case "mission":
        return <MissionView />;
      case "subjects":
        return <SubjectsView />;
      case "projects":
        return <ProjectsView />;
      case "gallery":
        return <GalleryView />;
      case "result-sheet":
        return <ResultSheetView onNavigate={handleNavigate} />;
      case "contact":
        return <ContactView />;
      case "admin":
        return <AdminView />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* 1. TOP MOST ANNOUNCEMENT SLATE BAR */}
      <div className="bg-brand-oxblood text-white py-2 px-4 text-xs font-medium font-sans no-print">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-brand-yellow" />
              +234 (0) 905 414 5339
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-brand-yellow" />
              +234 (0) 706 898 6865
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-brand-yellow" />
              holyghostacademy@gmail.com
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Admissions open for 2026/2027
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <button
              onClick={() => handleNavigate("admin")}
              title="Administrator Portal Login"
              className="hidden sm:inline-flex items-center gap-1 text-brand-yellow hover:text-white transition-colors cursor-pointer font-bold"
            >
              <Lock className="h-3 w-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-40 shadow-sm no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Brand Section */}
          <div 
            onClick={() => handleNavigate("home")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-full border-2 border-brand-yellow bg-brand-green overflow-hidden shadow-md transition-transform group-hover:scale-105 flex items-center justify-center">
              <img 
                src="https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg" 
                alt="Holy Ghost Academy Logo" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-brand-oxblood dark:text-brand-yellow font-display uppercase sm:text-lg">
                HOLY GHOST ACADEMY
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-brand-green font-mono uppercase">
                SECONDARY SCHOOL, KAMALI HOMES AWKA
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activePage === link.id 
                    ? "bg-brand-green text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-oxblood"
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Admin Portal Icon Button (Desktop) */}
            <button
              onClick={() => handleNavigate("admin")}
              title="Administrator Portal"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ml-1 cursor-pointer border ${
                activePage === "admin"
                  ? "bg-brand-oxblood text-white border-brand-oxblood shadow-sm"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Admin</span>
            </button>

            {/* Global Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark Mode" : "Light Mode"}`}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ml-1 cursor-pointer"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>
          </nav>

          {/* Mobile Hamburg Trigger Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Admin Icon Button */}
            <button
              onClick={() => handleNavigate("admin")}
              title="Administrator Portal"
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                activePage === "admin"
                  ? "bg-brand-oxblood text-white border-brand-oxblood"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            >
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark Mode" : "Light Mode"}`}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 cursor-pointer"
            >
              {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden lg:hidden"
            >
              <div className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavigate(link.id)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-between ${
                      activePage === link.id
                        ? "bg-brand-green text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}

                {/* Admin Portal Drawer Button */}
                <button
                  onClick={() => handleNavigate("admin")}
                  className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-between mt-2 border ${
                    activePage === "admin"
                      ? "bg-brand-oxblood text-white border-brand-oxblood"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Admin Portal</span>
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. DYNAMIC TRANSITIONING CONTENT VIEWER */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. COMPREHENSIVE BRANDED FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t-4 border-brand-green no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-slate-800">
          
          {/* Logo & Info Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-green border border-brand-yellow overflow-hidden flex items-center justify-center">
                <img 
                  src="https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg" 
                  alt="Holy Ghost Academy Logo" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-extrabold text-white tracking-wider font-display text-sm uppercase">
                HGASS AWKA
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Providing top-tier secondary education focused on academic rigor, character building, Pentecostal values, and practical innovation since 2001.
            </p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Est. 2001 • Awka, Nigeria
            </p>
          </div>

          {/* Quick links list */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider font-display">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavigate(link.id)}
                  className="text-left hover:text-brand-yellow transition-colors py-0.5 flex items-center gap-1 text-slate-400"
                >
                  <ChevronRight className="h-3 w-3 text-brand-green" />
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavigate("admin")}
                className={`text-left transition-colors py-0.5 flex items-center gap-1 font-semibold ${
                  activePage === "admin" ? "text-brand-yellow" : "text-amber-400/90 hover:text-brand-yellow"
                }`}
              >
                <Lock className="h-3 w-3 text-amber-400" />
                Admin Portal
              </button>
            </div>
          </div>

          {/* Core Campus address */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider font-display">School Campus</h3>
            <div className="space-y-3 text-xs leading-relaxed font-display text-slate-400">
              <div className="flex gap-2.5 items-start">
                <MapPin className="h-4 w-4 text-brand-yellow shrink-0 mt-0.5" />
                <p>
                  Kamali Homes,<br />
                  Ngozika Housing Estate,<br />
                  Awka, Anambra State, Nigeria.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Phone className="h-4 w-4 text-brand-yellow shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span>+234 (0) 905 414 5339</span>
                  <span>+234 (0) 706 898 6865</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admissions guidance circulars */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider font-display">Circulars & Admissions</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-display">
              For administrative inquiries, WhatsApp desk admissions, or physical enrollment queries, connect with us.
            </p>
            <button
              onClick={() => window.open("https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%20Awka,%20I%20am%20interested%20in%20enrolling%20a%20student%20into%20your%20school.", "_blank")}
              className="inline-flex items-center gap-1.5 rounded bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#128C7E] transition-colors shadow-sm font-display"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enroll on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Low copyright brand */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <p>
            © 2026 Holy Ghost Academy Secondary School, Kamali Homes Awka. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Enrollment</span>
            <span>•</span>
            <button
              onClick={() => handleNavigate("admin")}
              className="hover:text-brand-yellow cursor-pointer transition-colors flex items-center gap-1 text-slate-400"
            >
              <Lock className="h-3 w-3 text-amber-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Enroll Now Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => window.open("https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%20Awka,%20I%20am%20interested%20in%20enrolling%20a%20student%20into%20your%20school.", "_blank")}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3.5 rounded-full shadow-2xl font-bold font-display text-sm uppercase tracking-wider transition-colors duration-300 no-print group border border-white/20"
        style={{ boxShadow: "0 10px 25px -5px rgba(37, 211, 102, 0.5)" }}
      >
        <MessageCircle className="h-5 w-5 shrink-0 fill-current" />
        <span className="hidden sm:inline">Enroll Now (WhatsApp)</span>
        <span className="sm:hidden">Enroll Now</span>
      </motion.button>
    </div>
  );
}

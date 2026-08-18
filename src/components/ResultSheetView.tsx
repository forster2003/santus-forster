/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, 
  FileCheck2, 
  Printer, 
  Award, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Key, 
  ArrowRight,
  ExternalLink,
  Lock,
  Unlock
} from "lucide-react";
import { ResultItem } from "../types";
import { searchResults, getResults } from "../lib/db";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { setupSafeGetComputedStyle, sanitizeDocumentForHtml2Canvas } from "../utils/pdfHelper";

interface ResultSheetViewProps {
  onNavigate?: (page: string) => void;
}

export default function ResultSheetView({ onNavigate }: ResultSheetViewProps) {
  // Search Form State
  const [regNumber, setRegNumber] = useState("");
  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState("1st Term");
  const [scratchCardPin, setScratchCardPin] = useState("");

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<ResultItem | null>(null);

  // File Password Lock State
  const [searchPassword, setSearchPassword] = useState("");
  const [showSearchPassword, setShowSearchPassword] = useState(false);
  const [enteredFilePassword, setEnteredFilePassword] = useState("");
  const [filePasswordUnlocked, setFilePasswordUnlocked] = useState(true);
  const [filePasswordError, setFilePasswordError] = useState<string | null>(null);
  const [showEnteredPassword, setShowEnteredPassword] = useState(false);

  useEffect(() => {
    if (activeResult) {
      if (activeResult.resultPassword && activeResult.resultPassword.trim().length > 0) {
        if (searchPassword && searchPassword.trim() === activeResult.resultPassword.trim()) {
          setFilePasswordUnlocked(true);
          setEnteredFilePassword(searchPassword);
          setFilePasswordError(null);
        } else {
          setFilePasswordUnlocked(false);
          setEnteredFilePassword(searchPassword || "");
          setFilePasswordError(null);
        }
      } else {
        setFilePasswordUnlocked(true);
        setFilePasswordError(null);
      }
    }
  }, [activeResult, searchPassword]);

  const handleUnlockFilePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResult) return;
    if (enteredFilePassword.trim() === activeResult.resultPassword?.trim()) {
      setFilePasswordUnlocked(true);
      setFilePasswordError(null);
    } else {
      setFilePasswordError("Incorrect file password / PIN. Please double check with the academic registrar.");
    }
  };

  // All Available Results (for quick demonstration & list)
  const [allResults, setAllResults] = useState<ResultItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Load all available results for client-side search fallback if needed
  useEffect(() => {
    getResults()
      .then((data) => {
        setAllResults(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch initial results:", err);
      })
      .finally(() => {
        setLoadingAll(false);
      });
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regNumber.trim()) {
      setSearchError("Please enter a valid Student Registration Number or Student ID (e.g. HGASS/2026/014).");
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const match = await searchResults(regNumber.trim(), regNumber.trim(), session, term);
      if (match && match.length > 0) {
        setActiveResult(match[0]);
        setSearchError(null);
      } else {
        // Search locally in allResults if exact term/session filter didn't match directly
        const localMatch = allResults.find(
          (r) =>
            r.regNumber?.toLowerCase() === regNumber.trim().toLowerCase() ||
            r.studentId?.toLowerCase() === regNumber.trim().toLowerCase() ||
            r.studentName?.toLowerCase().includes(regNumber.trim().toLowerCase())
        );

        if (localMatch) {
          setActiveResult(localMatch);
          setSearchError(null);
        } else {
          setActiveResult(null);
          setSearchError(`No result sheet found for "${regNumber.trim()}" in ${session} (${term}). Please verify the student registration number.`);
        }
      }
    } catch (err: any) {
      console.error("Error searching result sheet:", err);
      // Fallback local search
      const localMatch = allResults.find(
        (r) =>
          r.regNumber?.toLowerCase() === regNumber.trim().toLowerCase() ||
          r.studentId?.toLowerCase() === regNumber.trim().toLowerCase()
      );
      if (localMatch) {
        setActiveResult(localMatch);
        setSearchError(null);
      } else {
        setSearchError("Could not retrieve result sheet. Please check your network connection or verify the student registration number.");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSelect = (res: ResultItem) => {
    setActiveResult(res);
    setRegNumber(res.regNumber || res.studentId);
    if (res.session) setSession(res.session);
    if (res.term) setTerm(res.term);
    setSearchError(null);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const handlePrint = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    document.body.classList.add("printing-active");
    element.classList.add("print-target-active");

    const cleanup = () => {
      document.body.classList.remove("printing-active");
      element.classList.remove("print-target-active");
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error("Print trigger error:", err);
      } finally {
        setTimeout(cleanup, 2000);
      }
    }, isMobile ? 600 : 250);
  };

  const handleDownloadPDF = async (elementId: string, item: ResultItem) => {
    if (!item) return;
    setIsDownloadingPDF(true);
    const element = document.getElementById(elementId);
    if (!element) {
      setIsDownloadingPDF(false);
      alert("Report sheet element not found.");
      return;
    }

    const restoreGetComputedStyle = setupSafeGetComputedStyle();

    try {
      element.scrollIntoView({ behavior: "instant", block: "start" });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1024,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          sanitizeDocumentForHtml2Canvas(clonedDoc);
          const clonedEl = clonedDoc.getElementById(elementId);
          if (clonedEl) {
            clonedEl.style.width = "1000px";
            clonedEl.style.maxWidth = "none";
          }
        }
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas render produced invalid zero dimensions.");
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeStudentName = item.studentName ? item.studentName.replace(/[^a-zA-Z0-9_-]/g, "_") : "Student";
      const safeClass = (item.classUnit || item.classPlacement || "Class").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeTerm = (item.term || "Term").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `Official_ResultSheet_${safeStudentName}_${safeClass}_${safeTerm}.pdf`;

      try {
        pdf.save(fileName);
      } catch (saveErr) {
        console.warn("pdf.save fallback triggered:", saveErr);
        const pdfBlob = pdf.output("blob");
        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        link.setAttribute("download", fileName);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }
    } catch (err: any) {
      console.error("PDF download failure:", err);
      alert("Could not generate PDF directly. Please use the Print button to print or save as PDF.");
    } finally {
      restoreGetComputedStyle();
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* 1. SECTION HERO & INTRO */}
      <div className="bg-gradient-to-r from-brand-oxblood via-brand-oxblood/95 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-brand-yellow/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-yellow/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-yellow/20 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-yellow border border-brand-yellow/30">
            <ShieldCheck className="h-4 w-4" />
            <span>Official Academic Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display uppercase">
            Online Result Sheet Portal
          </h1>

          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
            Instantly check and print official termly result sheets for students at Holy Ghost Academy Secondary School, Awka. Enter the student's Registration Number and select the academic session below.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Verified Digital Seals
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              High-Res Printable Transcripts
            </span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH FORM & QUICK DEMO SELECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Search className="h-5 w-5 text-brand-green" />
              Check Student Result Sheet
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Enter student Registration Number or Student ID below to search and view result sheet.
            </p>
          </div>
        </div>

        {/* SEARCH INPUT FORM */}
        <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
              Student Reg Number / Student ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. HGASS/2026/014"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-10 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                required
              />
              <FileCheck2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
              Academic Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-green focus:outline-none"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
              Academic Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-green focus:outline-none"
            >
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
          </div>

          {/* FILE PASSWORD / SECURITY PIN INPUT */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-4 bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl">
            <label className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-700" />
                <span>File Protection Password / Security PIN</span>
              </span>
              <span className="text-[10px] text-amber-800 font-sans font-medium">(Required if sheet is protected by Admin)</span>
            </label>
            <div className="relative">
              <input
                type={showSearchPassword ? "text" : "password"}
                value={searchPassword}
                onChange={(e) => setSearchPassword(e.target.value)}
                placeholder="Enter Password or PIN given by Admin (e.g. 849201)"
                className="w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 pl-10 pr-16 text-xs font-mono font-bold text-amber-950 placeholder:text-slate-400 placeholder:font-sans focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <Key className="absolute left-3.5 top-3 h-4 w-4 text-amber-600" />
              <button
                type="button"
                onClick={() => setShowSearchPassword(!showSearchPassword)}
                className="absolute right-2.5 top-1.5 text-[10px] font-bold text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded cursor-pointer uppercase tracking-tight"
              >
                {showSearchPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[10px] text-amber-800 font-sans">
              Enter the security password or 6-digit PIN assigned to your result sheet by the school registrar to unlock and view your grades.
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Key className="h-4 w-4 text-brand-yellow shrink-0" />
              <span>PIN Scratchcard Verification Enabled</span>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="px-8 py-3.5 rounded-xl bg-brand-oxblood hover:bg-brand-oxblood-hover text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
            >
              {searching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Searching Registry...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>View Result Sheet</span>
                </>
              )}
            </button>
          </div>
        </form>



        {/* ERROR NOTIFICATION */}
        {searchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold font-mono uppercase">Search Result Notice:</span>
              <p className="leading-relaxed">{searchError}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE RESULT SHEET DISPLAY */}
      {activeResult ? (
        !filePasswordUnlocked ? (
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-8 sm:p-12 shadow-md max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto border-4 border-amber-200">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono tracking-wider uppercase">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" /> Protected Result Sheet
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Password / Security PIN Required
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                The academic registrar has locked the result sheet for <strong className="text-slate-900 font-bold">{activeResult.studentName}</strong> ({activeResult.regNumber || activeResult.studentId}). Please enter your assigned File Password or PIN to unlock.
              </p>
            </div>

            <form onSubmit={handleUnlockFilePassword} className="space-y-4 max-w-md mx-auto">
              <div className="relative">
                <input
                  type={showEnteredPassword ? "text" : "password"}
                  value={enteredFilePassword}
                  onChange={(e) => setEnteredFilePassword(e.target.value)}
                  placeholder="Enter Password / PIN..."
                  className="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 rounded-xl text-center text-base font-mono font-bold tracking-widest text-amber-950 bg-amber-50/50 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-xs placeholder:font-sans placeholder:tracking-normal"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEnteredPassword(!showEnteredPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-200/60 hover:bg-amber-200 rounded cursor-pointer"
                >
                  {showEnteredPassword ? "Hide" : "Show"}
                </button>
              </div>

              {filePasswordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{filePasswordError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Unlock className="h-4 w-4" />
                <span>Unlock & Access Result Sheet</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              HGASS Academic Records • Security Protected File
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* ACTIONS BAR */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Official Result Sheet - {activeResult.studentName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Class: {activeResult.classPlacement || activeResult.classUnit} • Session: {activeResult.session} ({activeResult.term})
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handlePrint("printable-official-result-sheet")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-oxblood hover:bg-brand-oxblood-hover text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation whitespace-nowrap"
              >
                <Printer className="h-4 w-4 text-white" />
                <span>Print Official Result</span>
              </button>
            </div>
          </div>

          {/* PRINTABLE OFFICIAL RESULT CARD */}
          <div 
            id="printable-official-result-sheet" 
            className="rounded-3xl border-4 border-brand-oxblood bg-white p-6 md:p-10 shadow-lg space-y-8 relative overflow-hidden print-card"
          >
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
              <img 
                crossOrigin="anonymous"
                src={`/api/proxy-image?url=${encodeURIComponent("https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg")}`} 
                alt="Holy Ghost Academy Watermark" 
                className="h-[380px] w-[380px] object-contain rounded-full" 
              />
            </div>

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-brand-yellow pb-6 text-center md:text-left relative">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="h-20 w-20 rounded-full border-4 border-brand-yellow bg-brand-green overflow-hidden flex items-center justify-center shadow-md shrink-0">
                  <img 
                    crossOrigin="anonymous"
                    src={`/api/proxy-image?url=${encodeURIComponent("https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg")}`} 
                    alt="Holy Ghost Academy Logo" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-extrabold tracking-tight text-brand-oxblood font-display md:text-3xl uppercase">
                    HOLY GHOST ACADEMY
                  </h1>
                  <p className="text-xs font-bold tracking-widest text-brand-green font-mono uppercase">
                    SECONDARY SCHOOL, KAMALI HOMES AWKA
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-sm font-sans leading-relaxed">
                    Kamali Homes, Ngozika Housing Estate, Awka, Anambra State, Nigeria.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                <span className="inline-block rounded bg-brand-oxblood/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-oxblood border border-brand-oxblood/20 font-mono">
                  OFFICIAL RESULT SHEET
                </span>
                
                {/* Passport Box */}
                <div className="border-2 border-slate-200 p-1 rounded-lg bg-white shadow-sm flex flex-col items-center">
                  {activeResult.passportPhoto ? (
                    <div className="h-24 w-20 overflow-hidden rounded relative">
                      <img 
                        crossOrigin="anonymous"
                        src={activeResult.passportPhoto.startsWith("data:") ? activeResult.passportPhoto : `/api/proxy-image?url=${encodeURIComponent(activeResult.passportPhoto)}`} 
                        alt="Student Passport" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-20 bg-slate-50 text-slate-400 flex flex-col items-center justify-center rounded border border-dashed border-slate-300">
                      <Camera className="h-6 w-6 text-slate-300 mb-1" />
                      <span className="text-[7px] text-center uppercase font-extrabold tracking-tight">STUDENT</span>
                      <span className="text-[7px] text-center uppercase font-extrabold tracking-tight">PASSPORT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Info Table */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-slate-50 border border-slate-200 p-5 rounded-xl font-sans">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Student Name</span>
                <p className="text-sm font-bold text-slate-900">{activeResult.studentName}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Registration Number</span>
                <p className="text-sm font-mono font-bold text-slate-700">{activeResult.regNumber}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Sex</span>
                <p className="text-sm font-bold text-slate-700 uppercase">{activeResult.sex || "Male"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Class Placement</span>
                <p className="text-sm font-bold text-brand-green">{activeResult.classPlacement || activeResult.classUnit}</p>
              </div>

              <div className="space-y-0.5 border-t sm:border-t-0 sm:pt-0 pt-2 border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Academic Term</span>
                <p className="text-sm font-semibold text-slate-800">{activeResult.term}</p>
              </div>

              <div className="space-y-0.5 border-t sm:border-t-0 sm:pt-0 pt-2 border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Academic Year Session</span>
                <p className="text-sm font-semibold text-slate-800">{activeResult.session}</p>
              </div>

              <div className="space-y-0.5 border-t sm:border-t-0 sm:pt-0 pt-2 border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Terminal Average Score</span>
                <p className="text-sm font-extrabold text-brand-oxblood">{activeResult.terminalAverageScore || `${activeResult.averageScore}%`}</p>
              </div>

              <div className="space-y-0.5 border-t sm:border-t-0 sm:pt-0 pt-2 border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Class Standing</span>
                <p className="text-sm font-bold text-slate-900">
                  {activeResult.classStanding || `${activeResult.position} out of ${activeResult.outOf}`}
                </p>
              </div>
            </div>

            {/* Scores Breakdown Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner bg-slate-50">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-brand-oxblood text-white font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3 text-center">CA 1 (20)</th>
                    <th className="px-4 py-3 text-center">CA 2 (20)</th>
                    <th className="px-4 py-3 text-center">Exam Score (60)</th>
                    <th className="px-4 py-3 text-center">Total Score (100)</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {activeResult.scores.map((score, idx) => {
                    const ca1Val = score.ca1 ?? Math.round((score as any).ca / 2) ?? 0;
                    const ca2Val = score.ca2 ?? Math.round((score as any).ca / 2) ?? 0;
                    return (
                      <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{score.subject}</td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-600">{ca1Val}</td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-600">{ca2Val}</td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-600">{score.exam}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-brand-green">{score.total}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block rounded-md h-7 w-7 text-center leading-7 font-bold text-xs uppercase ${
                            score.grade === "A" ? "bg-brand-green/10 text-brand-green" :
                            score.grade === "B" ? "bg-brand-yellow/20 text-brand-oxblood" :
                            score.grade === "C" ? "bg-slate-100 text-slate-700" :
                            score.grade === "D" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                          }`}>
                            {score.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-500">{score.remark}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-4 pt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Gross Total Marks</span>
                <p className="text-lg font-extrabold text-slate-900">{activeResult.grossTotalMarks || `${activeResult.totalScore} / ${activeResult.scores.length * 100}`}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">GPA / Point Rating</span>
                <p className="text-lg font-extrabold text-brand-green">
                  {activeResult.gradePoint || `${((activeResult.scores.reduce((acc, cur) => acc + (cur.grade === 'A' ? 5 : cur.grade === 'B' ? 4 : cur.grade === 'C' ? 3 : cur.grade === 'D' ? 2 : cur.grade === 'E' ? 1 : 0), 0)) / (activeResult.scores.length || 1)).toFixed(2)} / 5.00`}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Accredited Grade</span>
                <p className="text-xs font-extrabold text-brand-oxblood py-1">
                  {activeResult.accreditedGradeBracket || (activeResult.averageScore >= 80 ? "Distinction (A)" : activeResult.averageScore >= 70 ? "Very Good (B)" : activeResult.averageScore >= 60 ? "Good (C)" : activeResult.averageScore >= 50 ? "Pass (D)" : "Fail (F)")}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Promotion Status</span>
                <p className="text-lg font-extrabold text-brand-oxblood uppercase">{activeResult.promotionStatus || "PASS / PROMOTED"}</p>
              </div>
            </div>

            {/* Grade Scale Legend */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-500 font-sans grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
              <div><span className="font-bold text-slate-700">A (80 - 100):</span> Distinction</div>
              <div><span className="font-bold text-slate-700">B (70 - 79):</span> Very Good</div>
              <div><span className="font-bold text-slate-700">C (60 - 69):</span> Good</div>
              <div><span className="font-bold text-slate-700">D (50 - 59):</span> Pass</div>
              <div><span className="font-bold text-slate-700">E (40 - 49):</span> Fair Pass</div>
              <div><span className="font-bold text-slate-700">F (0 - 39):</span> Fail</div>
            </div>

            {/* Remarks & Signatures */}
            <div className="grid gap-8 md:grid-cols-2 pt-6 border-t-2 border-brand-yellow/30 font-sans">
              <div className="space-y-2 border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono">Manager & Form Teacher Remarks</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl italic">
                  "{activeResult.remarks}"
                </p>
              </div>

              <div className="flex flex-row justify-between items-end pb-2 pt-4">
                <div className="text-center space-y-2">
                  <div className="h-10 w-28 border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500 italic font-mono">
                    [Signature Stamp]
                  </div>
                  <p className="text-[10px] font-bold text-slate-800">Vice Manager (Academics)</p>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400">Academic Registry</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="h-10 w-24 border-2 border-brand-oxblood rounded flex items-center justify-center text-[10px] text-brand-oxblood font-bold font-mono">
                    HGASS SEAL
                  </div>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400">Exam Registry Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )
      ) : (
        /* EMPTY / SEARCH PROMPT STATE */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-brand-green" />
          </div>
          <h3 className="text-lg font-bold font-display text-slate-800">
            Search for a Student Result Sheet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Please enter your Registration Number or Student ID above and click "View Result Sheet" to view and download your official terminal result sheet transcript.
          </p>
        </div>
      )}
    </div>
  );
}

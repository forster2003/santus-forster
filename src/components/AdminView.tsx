/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  LayoutDashboard, 
  Newspaper, 
  Building2, 
  Image as ImageIcon, 
  FileText, 
  Award, 
  Mail, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  Upload, 
  Youtube, 
  Database,
  ArrowDownToLine,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
  Printer,
  Camera,
  Loader2,
  AlertTriangle,
  Users,
  Key,
  Cloud
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { setupSafeGetComputedStyle, sanitizeDocumentForHtml2Canvas } from "../utils/pdfHelper";
import { 
  NewsPost, 
  GalleryItem, 
  ProjectItem, 
  DocumentItem, 
  ResultItem, 
  ContactMessage,
  DashboardStats,
  SubjectScore,
  SchoolStats,
  StaffMember,
  SchoolSocials,
  SubjectItem
} from "../types";
import {
  getNews, addNews, updateNews, deleteNews,
  getProjects, addProject, updateProject, deleteProject,
  getGallery, addGallery, updateGallery, deleteGallery,
  getDocuments, addDocument, deleteDocument,
  getResults, addResult, updateResult, deleteResult,
  getMessages, deleteMessage,
  getStaff, addStaff, updateStaff, deleteStaff,
  getSchoolStats, updateSchoolStats,
  getSchoolSocials, updateSchoolSocials,
  getSchoolSubjects, updateSchoolSubjects,
  uploadToStorage, deleteFromStorage, uploadToSupabaseStorage, getSignedFileUrl,
  getRegistrations, addRegistration, updateRegistration, deleteRegistration
} from "../lib/db";

export default function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("hgass_remember_admin") === "true");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'projects' | 'gallery' | 'documents' | 'results' | 'messages' | 'schoolStats' | 'staff' | 'database' | 'subjects' | 'registrations'>('overview');

  // Registrations state
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingReg, setEditingReg] = useState<any | null>(null);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSearchQuery, setRegSearchQuery] = useState("");
  const [savingReg, setSavingReg] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [subjectsSaveSuccess, setSubjectsSaveSuccess] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  const [subjName, setSubjName] = useState("");
  const [subjDesc, setSubjDesc] = useState("");
  const [subjCategory, setSubjCategory] = useState("Core STEM");
  const [subjLevel, setSubjLevel] = useState<'jss' | 'ss'>("jss");
  const [subjIcon, setSubjIcon] = useState("BookOpen");

  // Database Connection Configuration States
  const [dbMode, setDbMode] = useState<"local" | "firebase" | "supabase">("supabase");
  const [fbApiKey, setFbApiKey] = useState("");
  const [fbAuthDomain, setFbAuthDomain] = useState("");
  const [fbProjectId, setFbProjectId] = useState("");
  const [fbStorageBucket, setFbStorageBucket] = useState("");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState("");
  const [fbAppId, setFbAppId] = useState("");
  const [sbUrl, setSbUrl] = useState("");
  const [sbServiceRoleKey, setSbServiceRoleKey] = useState("");

  const [dbSaveSuccess, setDbSaveSuccess] = useState("");
  const [dbSaveError, setDbSaveError] = useState("");
  const [testingDb, setTestingDb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncingExport, setSyncingExport] = useState(false);
  const [syncExportResult, setSyncExportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncingImport, setSyncingImport] = useState(false);
  const [syncImportResult, setSyncImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [showExportConfirmModal, setShowExportConfirmModal] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Stats & Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalImages: 0,
    totalVideos: 0,
    totalDocuments: 0,
    totalProjects: 0,
    totalNewsPosts: 0
  });

  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [statEnrolled, setStatEnrolled] = useState("850+");
  const [statEducators, setStatEducators] = useState("45+");
  const [statAlumni, setStatAlumni] = useState("2,400+");
  const [statAwards, setStatAwards] = useState("18+");
  const [schoolStatsSaveSuccess, setSchoolStatsSaveSuccess] = useState(false);

  // Socials state
  const [socials, setSocials] = useState<SchoolSocials>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    whatsapp: ""
  });
  const [socialsSaveSuccess, setSocialsSaveSuccess] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);

  const [news, setNews] = useState<NewsPost[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Staff Form state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffDepartment, setStaffDepartment] = useState("General");
  const [staffImageUrl, setStaffImageUrl] = useState("");
  const [savingStaff, setSavingStaff] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  // Modals / Form states
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState("Admissions");
  const [newsImage, setNewsImage] = useState("");

  const [showProjModal, setShowProjModal] = useState(false);
  const [editingProj, setEditingProj] = useState<ProjectItem | null>(null);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projBudget, setProjBudget] = useState("₦3,000,000");
  const [projStart, setProjStart] = useState("");
  const [projEnd, setProjEnd] = useState("");
  const [projProgress, setProjProgress] = useState(0);
  const [projImage, setProjImage] = useState("");

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const [deletingProjId, setDeletingProjId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCategory, setGalleryCategory] = useState<any>("activities");
  const [galleryType, setGalleryType] = useState<'image' | 'video'>('image');
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryDesc, setGalleryDesc] = useState("");

  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docFilename, setDocFilename] = useState("");
  const [docData, setDocData] = useState("");

  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState<ResultItem | null>(null);
  const [resStudentId, setResStudentId] = useState("");
  const [resRegNumber, setResRegNumber] = useState("");
  const [resStudentName, setResStudentName] = useState("");
  const [resClassUnit, setResClassUnit] = useState("JSS1");
  const [resSession, setResSession] = useState("2025/2026");
  const [resTerm, setResTerm] = useState<any>("3rd Term");
  const [resRemarks, setResRemarks] = useState("");
  const [resPosition, setResPosition] = useState(1);
  const [resOutOf, setResOutOf] = useState(30);
  const [resClassPlacement, setResClassPlacement] = useState("");
  const [resGrossTotalMarks, setResGrossTotalMarks] = useState("");
  const [resGradePoint, setResGradePoint] = useState("");
  const [resTerminalAverageScore, setResTerminalAverageScore] = useState("");
  const [resAccreditedGradeBracket, setResAccreditedGradeBracket] = useState("");
  const [resClassStanding, setResClassStanding] = useState("");
  const [resPassportPhoto, setResPassportPhoto] = useState<string | null>(null);
  const [resSex, setResSex] = useState("Male");
  const [resPromotionStatus, setResPromotionStatus] = useState("PASS / PROMOTED");
  const [resResultPassword, setResResultPassword] = useState("");
  const [showResPassword, setShowResPassword] = useState(false);

  // CSV File Import state for Result Registrar
  const [showResultCsvModal, setShowResultCsvModal] = useState(false);
  const [parsedResultCsvItems, setParsedResultCsvItems] = useState<Omit<ResultItem, "id" | "totalScore" | "averageScore">[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [isImportingResultsCsv, setIsImportingResultsCsv] = useState(false);
  const [resultCsvStatus, setResultCsvStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const resultCsvInputRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: 'news' | 'project' | 'gallery' | 'document' | 'result' | 'message' | 'staff' | 'subject' | 'registration';
    title: string;
    message: string;
  } | null>(null);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, type } = pendingDelete;
    setPendingDelete(null);

    try {
      if (type === 'news') {
        setDeletingNewsId(id);
        const item = news.find(n => n.id === id);
        if (item?.imageUrl) await deleteFromStorage(item.imageUrl);
        await deleteNews(id);
      } else if (type === 'project') {
        setDeletingProjId(id);
        const item = projects.find(p => p.id === id);
        if (item?.imageUrl) await deleteFromStorage(item.imageUrl);
        await deleteProject(id);
      } else if (type === 'gallery') {
        setDeletingGalleryId(id);
        const item = gallery.find(g => g.id === id);
        if (item?.url && item.type === 'image') await deleteFromStorage(item.url);
        await deleteGallery(id);
      } else if (type === 'document') {
        setDeletingDocId(id);
        const item = documents.find(d => d.id === id);
        if (item?.fileData) await deleteFromStorage(item.fileData);
        await deleteDocument(id);
      } else if (type === 'result') {
        setDeletingResultId(id);
        const item = results.find(r => r.id === id);
        if (item?.passportPhoto) await deleteFromStorage(item.passportPhoto);
        await deleteResult(id);
      } else if (type === 'message') {
        setDeletingMsgId(id);
        await deleteMessage(id);
      } else if (type === 'staff') {
        setDeletingStaffId(id);
        const item = staff.find(s => s.id === id);
        if (item?.imageUrl) await deleteFromStorage(item.imageUrl);
        await deleteStaff(id);
      } else if (type === 'registration') {
        await deleteRegistration(id);
      } else if (type === 'subject') {
        const index = parseInt(id);
        const updatedSubjects = subjects.filter((_, idx) => idx !== index);
        await updateSchoolSubjects(updatedSubjects);
        setSubjects(updatedSubjects);
        setSubjectsSaveSuccess(true);
        setTimeout(() => setSubjectsSaveSuccess(false), 3000);
      }
      refreshData();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingNewsId(null);
      setDeletingProjId(null);
      setDeletingGalleryId(null);
      setDeletingDocId(null);
      setDeletingResultId(null);
      setDeletingMsgId(null);
      setDeletingStaffId(null);
    }
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regUsername || !regFullName || !regPassword) {
      setRegError("Please fill out all required fields.");
      return;
    }

    const usernameRegex = /^HGASS\/\d{4}\/\d+$/i;
    if (!usernameRegex.test(regUsername.trim())) {
      setRegError("Invalid username format! Username must exactly match: HGASS/year/serialnumber (e.g., HGASS/2026/001).");
      return;
    }

    setSavingReg(true);

    try {
      if (editingReg) {
        await updateRegistration(editingReg.id, {
          password: regPassword,
          fullName: regFullName
        });
      } else {
        await addRegistration({
          username: regUsername,
          password: regPassword,
          fullName: regFullName
        });
      }

      setShowRegModal(false);
      refreshData();
    } catch (err: any) {
      setRegError(err.message || "An unexpected error occurred saving account.");
    } finally {
      setSavingReg(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let generated = "";
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRegPassword(generated);
  };

  const [resScores, setResScores] = useState<{subject: string, ca1: number, ca2: number, exam: number}[]>([
    { subject: "Mathematics", ca1: 15, ca2: 13, exam: 52 },
    { subject: "English Language", ca1: 18, ca2: 16, exam: 48 },
    { subject: "Basic Science", ca1: 15, ca2: 14, exam: 51 }
  ]);

  const [selectedReportSheet, setSelectedReportSheet] = useState<ResultItem | null>(null);
  const [showReportSheetModal, setShowReportSheetModal] = useState(false);

  const [isDownloadingAdminPDF, setIsDownloadingAdminPDF] = useState(false);

  const handleAdminPrint = () => {
    const element = document.getElementById("printable-report-sheet");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    
    // Check if on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Trigger local printer interface after a short delay so the smooth scroll can complete/start
    setTimeout(() => {
      window.print();
    }, isMobile ? 800 : 300);
  };

  const handleAdminDownloadPDF = async () => {
    if (!selectedReportSheet) return;
    setIsDownloadingAdminPDF(true);
    const element = document.getElementById("printable-report-sheet");
    if (!element) {
      setIsDownloadingAdminPDF(false);
      return;
    }
    
    // Intercept getComputedStyle to resolve OKLCH colors to standard RGB/Hex
    const restoreGetComputedStyle = setupSafeGetComputedStyle();
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          sanitizeDocumentForHtml2Canvas(clonedDoc);
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
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
      
      pdf.save(`Official_Report_Sheet_${selectedReportSheet.studentName.replace(/\s+/g, "_")}_${selectedReportSheet.classPlacement || selectedReportSheet.classUnit}_${selectedReportSheet.term.replace(/\s+/g, "")}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Could not generate PDF directly. Please use the Print button and choose 'Save as PDF'.");
    } finally {
      restoreGetComputedStyle();
      setIsDownloadingAdminPDF(false);
    }
  };



  const [showCsvPaste, setShowCsvPaste] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [resultSearchQuery, setResultSearchQuery] = useState("");

  // Check auth on load
  useEffect(() => {
    const localToken = localStorage.getItem("hgass_admin_token");
    const sessionToken = sessionStorage.getItem("hgass_admin_token");
    if (localToken === "HGASS-SESSION-TOKEN-2026" || sessionToken === "HGASS-SESSION-TOKEN-2026") {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchDbConfig = async () => {
    try {
      const res = await fetch("/api/db-config");
      if (res.ok) {
        const data = await res.json();
        setDbMode(data.mode || "local");
        if (data.firebase) {
          setFbApiKey(data.firebase.apiKey || "");
          setFbAuthDomain(data.firebase.authDomain || "");
          setFbProjectId(data.firebase.projectId || "");
          setFbStorageBucket(data.firebase.storageBucket || "");
          setFbMessagingSenderId(data.firebase.messagingSenderId || "");
          setFbAppId(data.firebase.appId || "");
        }
        if (data.supabase) {
          setSbUrl(data.supabase.url || "");
          setSbServiceRoleKey(data.supabase.serviceRoleKey || "");
        }
      }
    } catch (err) {
      console.error("Failed to load db config:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDbConfig();
    }
  }, [isAuthenticated]);

  const handleSaveDbConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbSaveSuccess("");
    setDbSaveError("");
    try {
      const res = await fetch("/api/db-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: dbMode,
          firebase: {
            apiKey: fbApiKey,
            authDomain: fbAuthDomain,
            projectId: fbProjectId,
            storageBucket: fbStorageBucket,
            messagingSenderId: fbMessagingSenderId,
            appId: fbAppId
          },
          supabase: {
            url: sbUrl,
            serviceRoleKey: sbServiceRoleKey
          }
        })
      });
      if (res.ok) {
        setDbSaveSuccess("Database configurations saved and applied successfully!");
        refreshData();
      } else {
        const d = await res.json();
        setDbSaveError(d.message || "Failed to save database configurations.");
      }
    } catch (err: any) {
      setDbSaveError(err.message || String(err));
    }
  };

  const handleTestConnection = async () => {
    setTestingDb(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/db-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: dbMode,
          firebase: {
            apiKey: fbApiKey,
            authDomain: fbAuthDomain,
            projectId: fbProjectId,
            storageBucket: fbStorageBucket,
            messagingSenderId: fbMessagingSenderId,
            appId: fbAppId
          },
          supabase: {
            url: sbUrl,
            serviceRoleKey: sbServiceRoleKey
          }
        })
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || String(err)
      });
    } finally {
      setTestingDb(false);
    }
  };

  const handleExportLocalToRemote = () => {
    setShowExportConfirmModal(true);
  };

  const executeExportLocalToRemote = async () => {
    setShowExportConfirmModal(false);
    setSyncingExport(true);
    setSyncExportResult(null);
    try {
      const res = await fetch("/api/db-config/export", { method: "POST" });
      const data = await res.json();
      setSyncExportResult({
        success: data.success,
        message: data.message
      });
      if (data.success) {
        refreshData();
      }
    } catch (err: any) {
      setSyncExportResult({
        success: false,
        message: err.message || String(err)
      });
    } finally {
      setSyncingExport(false);
    }
  };

  const handleImportRemoteToLocal = () => {
    setShowImportConfirmModal(true);
  };

  const executeImportRemoteToLocal = async () => {
    setShowImportConfirmModal(false);
    setSyncingImport(true);
    setSyncImportResult(null);
    try {
      const res = await fetch("/api/db-config/import", { method: "POST" });
      const data = await res.json();
      setSyncImportResult({
        success: data.success,
        message: data.message
      });
      if (data.success) {
        refreshData();
      }
    } catch (err: any) {
      setSyncImportResult({
        success: false,
        message: err.message || String(err)
      });
    } finally {
      setSyncingImport(false);
    }
  };

  // Fetch all admin panel data
  const refreshData = async () => {
    try {
      const [newsList, projectsList, galleryList, docsList, resultsList, messagesList, staffList, statsData, socialsData, subjectsList, registrationsList] = await Promise.all([
        getNews(),
        getProjects(),
        getGallery(),
        getDocuments(),
        getResults(),
        getMessages(),
        getStaff(),
        getSchoolStats(),
        getSchoolSocials(),
        getSchoolSubjects(),
        getRegistrations()
      ]);

      setNews(newsList);
      setProjects(projectsList);
      setGallery(galleryList);
      setDocuments(docsList);
      setResults(resultsList);
      setMessages(messagesList);
      setStaff(staffList);
      setSubjects(subjectsList);
      setRegistrations(registrationsList || []);
      
      setSchoolStats(statsData);
      setStatEnrolled(statsData.enrolledStudents || "850+");
      setStatEducators(statsData.expertEducators || "45+");
      setStatAlumni(statsData.alumniGraduates || "2,400+");
      setStatAwards(statsData.nationalAwards || "18+");
      
      setSocials(socialsData);

      // Compute statistics
      const totalStudents = new Set(resultsList.map(r => r.studentId)).size;
      const totalImages = galleryList.filter(g => g.type === "image").length;
      const totalVideos = galleryList.filter(g => g.type === "video").length;
      const totalDocuments = docsList.length;
      const totalProjects = projectsList.length;
      const totalNewsPosts = newsList.length;

      setStats({
        totalStudents: totalStudents || 3,
        totalImages,
        totalVideos,
        totalDocuments,
        totalProjects,
        totalNewsPosts
      });

    } catch (error) {
      console.error("Error refreshing admin dashboard data:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!password) {
      setAuthError("Password is required.");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (rememberMe) {
          localStorage.setItem("hgass_admin_token", data.token);
          localStorage.setItem("hgass_remember_admin", "true");
          sessionStorage.removeItem("hgass_admin_token");
        } else {
          sessionStorage.setItem("hgass_admin_token", data.token);
          localStorage.removeItem("hgass_admin_token");
          localStorage.setItem("hgass_remember_admin", "false");
        }
        setIsAuthenticated(true);
      } else {
        setAuthError(data.message || "Invalid administrator password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError("Server communication failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hgass_admin_token");
    sessionStorage.removeItem("hgass_admin_token");
    setIsAuthenticated(false);
  };

  // Helper to convert files to base64 Data URLs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, nameSetter?: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (nameSetter) nameSetter(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // NEWS ACTIONS
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = newsImage;
    if (newsImage && (newsImage.startsWith("data:") || newsImage.startsWith("blob:"))) {
      try {
        const uploaded = await uploadToSupabaseStorage(newsImage, "news", editingNews?.id, "cover.jpg");
        finalImageUrl = uploaded.signedUrl || uploaded.filePath;
      } catch (err) {
        console.error("News storage upload failed:", err);
      }
    }

    const payload = {
      title: newsTitle,
      summary: newsSummary,
      content: newsContent,
      category: newsCategory,
      imageUrl: finalImageUrl,
      date: editingNews ? editingNews.date : new Date().toISOString().split("T")[0]
    };

    try {
      if (editingNews) {
        await updateNews(editingNews.id, payload);
      } else {
        await addNews(payload);
      }
      setShowNewsModal(false);
      setEditingNews(null);
      setNewsTitle("");
      setNewsSummary("");
      setNewsContent("");
      setNewsImage("");
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNews = (id: string) => {
    setPendingDelete({
      id,
      type: 'news',
      title: "Delete News Post",
      message: "Are you sure you want to delete this news post? This action cannot be undone."
    });
  };

  const handleEditNewsClick = (item: NewsPost) => {
    setEditingNews(item);
    setNewsTitle(item.title);
    setNewsSummary(item.summary);
    setNewsContent(item.content);
    setNewsCategory(item.category);
    setNewsImage(item.imageUrl || "");
    setShowNewsModal(true);
  };

  // PROJECT ACTIONS
  const handleSaveProj = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = projImage;
    if (projImage && (projImage.startsWith("data:") || projImage.startsWith("blob:"))) {
      try {
        const uploaded = await uploadToSupabaseStorage(projImage, "projects", editingProj?.id, "illustration.jpg");
        finalImageUrl = uploaded.signedUrl || uploaded.filePath;
      } catch (err) {
        console.error("Project storage upload failed:", err);
      }
    }

    const payload = {
      title: projTitle,
      description: projDesc,
      budget: projBudget,
      startDate: projStart,
      completionDate: projEnd,
      progressPercentage: projProgress,
      imageUrl: finalImageUrl
    };

    try {
      if (editingProj) {
        await updateProject(editingProj.id, payload);
      } else {
        await addProject(payload);
      }
      setShowProjModal(false);
      setEditingProj(null);
      setProjTitle("");
      setProjDesc("");
      setProjBudget("₦3,000,000");
      setProjStart("");
      setProjEnd("");
      setProjProgress(0);
      setProjImage("");
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProjClick = (item: ProjectItem) => {
    setEditingProj(item);
    setProjTitle(item.title);
    setProjDesc(item.description);
    setProjBudget(item.budget);
    setProjStart(item.startDate);
    setProjEnd(item.completionDate);
    setProjProgress(item.progressPercentage);
    setProjImage(item.imageUrl || "");
    setShowProjModal(true);
  };

  const handleDeleteProj = (id: string) => {
    setPendingDelete({
      id,
      type: 'project',
      title: "Delete Project",
      message: "Are you sure you want to delete this project? This action cannot be undone."
    });
  };

  // GALLERY ACTIONS
  const handleEditGalleryClick = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setGalleryTitle(item.title);
    setGalleryCategory(item.category);
    setGalleryType(item.type);
    setGalleryUrl(item.url);
    setGalleryDesc(item.description || "");
    setShowGalleryModal(true);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = galleryUrl;
    if (galleryType === "image" && galleryUrl && (galleryUrl.startsWith("data:") || galleryUrl.startsWith("blob:"))) {
      try {
        const uploaded = await uploadToSupabaseStorage(galleryUrl, "gallery", editingGalleryId || undefined, "photo.jpg");
        finalUrl = uploaded.signedUrl || uploaded.filePath;
      } catch (err) {
        console.error("Gallery storage upload failed:", err);
      }
    }

    const payload = {
      title: galleryTitle,
      category: galleryCategory,
      type: galleryType,
      url: finalUrl,
      description: galleryDesc,
      createdAt: new Date().toISOString().split("T")[0]
    };

    try {
      if (editingGalleryId) {
        await updateGallery(editingGalleryId, payload);
      } else {
        await addGallery(payload);
      }
      setShowGalleryModal(false);
      setEditingGalleryId(null);
      setGalleryTitle("");
      setGalleryUrl("");
      setGalleryDesc("");
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = (id: string) => {
    setPendingDelete({
      id,
      type: 'gallery',
      title: "Delete Gallery Item",
      message: "Are you sure you want to delete this gallery file? This action cannot be undone."
    });
  };

  // DOCUMENT ACTIONS
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalFileData = docData;
    if (docData && (docData.startsWith("data:") || docData.startsWith("blob:"))) {
      try {
        const uploaded = await uploadToSupabaseStorage(docData, "documents", undefined, docFilename || "document.pdf");
        finalFileData = uploaded.signedUrl || uploaded.filePath;
      } catch (err) {
        console.error("Document storage upload failed:", err);
      }
    }

    const payload = {
      title: docTitle,
      filename: docFilename,
      fileType: docData.split(";")[0]?.split(":")[1] || "application/pdf",
      fileData: finalFileData,
      uploadedAt: new Date().toISOString().split("T")[0]
    };

    try {
      await addDocument(payload);
      setShowDocModal(false);
      setDocTitle("");
      setDocFilename("");
      setDocData("");
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setPendingDelete({
      id,
      type: 'document',
      title: "Delete Document",
      message: "Are you sure you want to delete this document? This action cannot be undone."
    });
  };

  // RESULTS ACTIONS (With nested grade editor)
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalPassportPhoto = resPassportPhoto;
    if (resPassportPhoto && (resPassportPhoto.startsWith("data:") || resPassportPhoto.startsWith("blob:"))) {
      try {
        const uploaded = await uploadToSupabaseStorage(resPassportPhoto, "results", resStudentId || undefined, "passport.jpg");
        finalPassportPhoto = uploaded.signedUrl || uploaded.filePath;
      } catch (err) {
        console.error("Passport photo storage upload failed:", err);
      }
    }

    const payload = {
      studentId: resStudentId,
      regNumber: resRegNumber,
      studentName: resStudentName,
      classUnit: resClassUnit,
      session: resSession,
      term: resTerm,
      remarks: resRemarks,
      position: Number(resPosition),
      outOf: Number(resOutOf),
      scores: resScores,
      classPlacement: resClassPlacement,
      grossTotalMarks: resGrossTotalMarks,
      gradePoint: resGradePoint,
      terminalAverageScore: resTerminalAverageScore,
      accreditedGradeBracket: resAccreditedGradeBracket,
      classStanding: resClassStanding,
      passportPhoto: finalPassportPhoto,
      sex: resSex,
      promotionStatus: resPromotionStatus,
      resultPassword: resResultPassword
    };

    try {
      if (editingResult) {
        await updateResult(editingResult.id, payload);
      } else {
        await addResult(payload);
      }
      setShowResultModal(false);
      setEditingResult(null);
      setResStudentId("");
      setResRegNumber("");
      setResStudentName("");
      setResRemarks("");
      setResClassPlacement("");
      setResGrossTotalMarks("");
      setResGradePoint("");
      setResTerminalAverageScore("");
      setResAccreditedGradeBracket("");
      setResClassStanding("");
      setResPassportPhoto(null);
      setResSex("Male");
      setResPromotionStatus("PASS / PROMOTED");
      setResResultPassword("");
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditResultClick = (item: ResultItem) => {
    setEditingResult(item);
    setResStudentId(item.studentId);
    setResRegNumber(item.regNumber);
    setResStudentName(item.studentName);
    setResClassUnit(item.classUnit);
    setResSession(item.session);
    setResTerm(item.term);
    setResRemarks(item.remarks);
    setResPosition(item.position);
    setResOutOf(item.outOf);
    setResClassPlacement(item.classPlacement || "");
    setResGrossTotalMarks(item.grossTotalMarks || "");
    setResGradePoint(item.gradePoint || "");
    setResTerminalAverageScore(item.terminalAverageScore || "");
    setResAccreditedGradeBracket(item.accreditedGradeBracket || "");
    setResClassStanding(item.classStanding || "");
    setResPassportPhoto(item.passportPhoto || null);
    setResSex(item.sex || "Male");
    setResPromotionStatus(item.promotionStatus || "PASS / PROMOTED");
    setResResultPassword(item.resultPassword || "");
    setResScores(item.scores.map(s => ({
      subject: s.subject,
      ca1: s.ca1 !== undefined ? s.ca1 : Math.round((s as any).ca / 2) || 0,
      ca2: s.ca2 !== undefined ? s.ca2 : Math.floor((s as any).ca / 2) || 0,
      exam: s.exam,
      remark: s.remark || ""
    })));
    setShowResultModal(true);
  };

  const handleDeleteResult = (id: string) => {
    setPendingDelete({
      id,
      type: 'result',
      title: "Delete Report Sheet",
      message: "Are you sure you want to delete this student report sheet? This action cannot be undone."
    });
  };

  // ADD SUBJECT ROW TO SCORES
  const addSubjectRow = () => {
    setResScores([...resScores, { subject: "New Subject", ca1: 0, ca2: 0, exam: 0 }]);
  };

  const updateScoreRow = (idx: number, field: 'subject' | 'ca1' | 'ca2' | 'exam', val: any) => {
    const updated = [...resScores];
    if (field === 'subject') {
      updated[idx].subject = val;
    } else {
      updated[idx][field] = Number(val);
    }
    setResScores(updated);
  };

  const removeScoreRow = (idx: number) => {
    setResScores(resScores.filter((_, i) => i !== idx));
  };

  // EXCEL / CSV EXPORT FOR RESULTS
  const handleExportResults = () => {
    if (results.length === 0) return;
    
    // Build CSV Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student Name,Student ID,Reg Number,Class,Session,Term,Total Score,Average,Position,File Password,Remarks\n";
    
    results.forEach(res => {
      const row = [
        `"${res.studentName}"`,
        `"${res.studentId}"`,
        `"${res.regNumber}"`,
        `"${res.classUnit}"`,
        `"${res.session}"`,
        `"${res.term}"`,
        res.totalScore,
        res.averageScore,
        res.position,
        `"${res.resultPassword || ''}"`,
        `"${res.remarks}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HGASS_Student_Results_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV TEMPLATE & FILE IMPORT FOR BULK STUDENT RESULTS
  const downloadSampleResultCsvTemplate = () => {
    const headers = "Student Name,Student ID,Reg Number,Class,Session,Term,Position,Out Of,Sex,File Password,Remarks,Promotion Status,Mathematics CA1,Mathematics CA2,Mathematics Exam,English Language CA1,English Language CA2,English Language Exam,Basic Science CA1,Basic Science CA2,Basic Science Exam";
    const row1 = "John Doe,HGASS-001,HGASS/2026/001,JSS 1,2025/2026,1st Term,1,30,Male,849201,Excellent performance,PASS / PROMOTED,18,17,55,16,18,52,15,16,50";
    const row2 = "Mary Smith,HGASS-002,HGASS/2026/002,JSS 1,2025/2026,1st Term,2,30,Female,592014,Very good performance,PASS / PROMOTED,16,15,50,19,17,56,14,15,48";
    const csvContent = "data:text/csv;charset=utf-8," + [headers, row1, row2].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "HGASS_Results_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResultCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setResultCsvStatus(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setResultCsvStatus({ type: 'error', message: 'CSV file is empty or missing data rows.' });
          return;
        }

        // Helper to parse CSV line while respecting quotes
        const parseCSVLine = (text: string): string[] => {
          const result: string[] = [];
          let curr = '';
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(curr.trim().replace(/^["']|["']$/g, ''));
              curr = '';
            } else {
              curr += char;
            }
          }
          result.push(curr.trim().replace(/^["']|["']$/g, ''));
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

        const getIndex = (possibleNames: string[]): number => {
          return headers.findIndex(h => possibleNames.includes(h));
        };

        const nameIdx = getIndex(["student name", "studentname", "name"]);
        const idIdx = getIndex(["student id", "studentid", "id"]);
        const regIdx = getIndex(["reg number", "regnumber", "reg_number", "registration number", "reg"]);
        const classIdx = getIndex(["class", "classunit", "class_unit", "class/unit"]);
        const sessionIdx = getIndex(["session"]);
        const termIdx = getIndex(["term"]);
        const posIdx = getIndex(["position"]);
        const outOfIdx = getIndex(["out of", "outof", "out_of"]);
        const sexIdx = getIndex(["sex", "gender"]);
        const remarkIdx = getIndex(["remarks", "remark"]);
        const promoIdx = getIndex(["promotion status", "promotionstatus", "promotion"]);
        const passIdx = getIndex(["file password", "filepassword", "password", "pin", "file_password", "result_password", "resultpassword"]);

        // Detect subject columns
        const subjectScoresMap: Record<number, { subject: string; type: 'ca1' | 'ca2' | 'exam' }> = {};

        headers.forEach((h, idx) => {
          if ([nameIdx, idIdx, regIdx, classIdx, sessionIdx, termIdx, posIdx, outOfIdx, sexIdx, remarkIdx, promoIdx, passIdx].includes(idx)) {
            return;
          }
          const lowerH = h.toLowerCase();
          let type: 'ca1' | 'ca2' | 'exam' | null = null;
          if (lowerH.includes('ca1') || lowerH.includes('ca 1') || lowerH.includes('ca_1')) type = 'ca1';
          else if (lowerH.includes('ca2') || lowerH.includes('ca 2') || lowerH.includes('ca_2')) type = 'ca2';
          else if (lowerH.includes('exam') || lowerH.includes('examination')) type = 'exam';

          if (type) {
            const subjName = h
              .replace(/ca\s*1|ca\s*2|exam|examination|ca_1|ca_2/gi, '')
              .replace(/[_\-:]/g, ' ')
              .trim();
            if (subjName) {
              subjectScoresMap[idx] = { subject: subjName, type };
            }
          }
        });

        const parsedRecords: Omit<ResultItem, "id" | "totalScore" | "averageScore">[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length === 0 || !row.some(cell => cell.length > 0)) continue;

          const studentName = (nameIdx >= 0 && row[nameIdx]) ? row[nameIdx] : `Student ${i}`;
          const studentId = (idIdx >= 0 && row[idIdx]) ? row[idIdx] : `HGASS-${100 + i}`;
          const regNumber = (regIdx >= 0 && row[regIdx]) ? row[regIdx] : `HGASS/2026/${100 + i}`;
          const classUnit = (classIdx >= 0 && row[classIdx]) ? row[classIdx] : "JSS 1";
          const session = (sessionIdx >= 0 && row[sessionIdx]) ? row[sessionIdx] : "2025/2026";
          const term = (termIdx >= 0 && row[termIdx]) ? row[termIdx] as any : "1st Term";
          const position = (posIdx >= 0 && row[posIdx]) ? (parseInt(row[posIdx]) || i) : i;
          const outOf = (outOfIdx >= 0 && row[outOfIdx]) ? (parseInt(row[outOfIdx]) || 30) : 30;
          const sex = (sexIdx >= 0 && row[sexIdx]) ? row[sexIdx] : "Male";
          const remarks = (remarkIdx >= 0 && row[remarkIdx]) ? row[remarkIdx] : "Good performance";
          const promotionStatus = (promoIdx >= 0 && row[promoIdx]) ? row[promoIdx] : "PASS / PROMOTED";
          const resultPassword = (passIdx >= 0 && row[passIdx]) ? row[passIdx] : "";

          const subjectsDict: Record<string, { ca1: number; ca2: number; exam: number }> = {};

          Object.entries(subjectScoresMap).forEach(([colIdxStr, info]) => {
            const colIdx = parseInt(colIdxStr);
            const val = parseFloat(row[colIdx]) || 0;
            if (!subjectsDict[info.subject]) {
              subjectsDict[info.subject] = { ca1: 0, ca2: 0, exam: 0 };
            }
            subjectsDict[info.subject][info.type] = val;
          });

          let scores: SubjectScore[] = Object.entries(subjectsDict).map(([subj, sc]) => {
            const ca1 = sc.ca1;
            const ca2 = sc.ca2;
            const exam = sc.exam;
            const total = ca1 + ca2 + exam;
            let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
            if (total >= 70) grade = 'A';
            else if (total >= 60) grade = 'B';
            else if (total >= 50) grade = 'C';
            else if (total >= 45) grade = 'D';
            else if (total >= 40) grade = 'E';

            let remark = "Pass";
            if (grade === 'A') remark = "Excellent";
            else if (grade === 'B') remark = "Very Good";
            else if (grade === 'C') remark = "Good";
            else if (grade === 'D') remark = "Fair";
            else if (grade === 'F') remark = "Fail";

            return { subject: subj, ca1, ca2, exam, total, grade, remark };
          });

          if (scores.length === 0) {
            scores = [
              { subject: "Mathematics", ca1: 15, ca2: 13, exam: 52, total: 80, grade: "A", remark: "Excellent" },
              { subject: "English Language", ca1: 18, ca2: 16, exam: 48, total: 82, grade: "A", remark: "Excellent" },
              { subject: "Basic Science", ca1: 15, ca2: 14, exam: 51, total: 80, grade: "A", remark: "Excellent" }
            ];
          }

          parsedRecords.push({
            studentName,
            studentId,
            regNumber,
            classUnit,
            session,
            term,
            position,
            outOf,
            sex,
            remarks,
            promotionStatus,
            resultPassword,
            scores
          });
        }

        setParsedResultCsvItems(parsedRecords);
        setResultCsvStatus({
          type: 'success',
          message: `Successfully parsed ${parsedRecords.length} student record(s) from "${file.name}". Review below and confirm import.`
        });
      } catch (err: any) {
        console.error("Error parsing CSV:", err);
        setResultCsvStatus({ type: 'error', message: `Failed to parse CSV file: ${err.message || 'Invalid format'}` });
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImportResultCsv = async () => {
    if (parsedResultCsvItems.length === 0) return;

    setIsImportingResultsCsv(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of parsedResultCsvItems) {
      try {
        await addResult(item);
        successCount++;
      } catch (err) {
        console.error("Failed to import result item:", item, err);
        failCount++;
      }
    }

    setIsImportingResultsCsv(false);
    if (successCount > 0) {
      refreshData();
      setResultCsvStatus({
        type: 'success',
        message: `Import complete! ${successCount} student result sheet(s) successfully added to the database.${failCount > 0 ? ` (${failCount} failed)` : ''}`
      });
      setParsedResultCsvItems([]);
      setCsvFileName("");
      if (resultCsvInputRef.current) resultCsvInputRef.current.value = "";
    } else {
      setResultCsvStatus({
        type: 'error',
        message: `Failed to import student result records. Please check database connection.`
      });
    }
  };

  // RAW CSV PASTE PARSING (Excel / CSV simulate)
  const handleImportCsvText = () => {
    if (!csvText) return;
    try {
      // Expect CSV text format: Subject, CA1, CA2, Exam (or fall back to Subject, CA, Exam)
      // Lines split
      const lines = csvText.trim().split("\n");
      const parsedScores: {subject: string, ca1: number, ca2: number, exam: number}[] = [];
      
      lines.forEach((line) => {
        const parts = line.split(",");
        if (parts.length >= 4) {
          const sub = parts[0].trim();
          const ca1Val = Number(parts[1].trim()) || 0;
          const ca2Val = Number(parts[2].trim()) || 0;
          const exVal = Number(parts[3].trim()) || 0;
          if (sub && !isNaN(ca1Val) && !isNaN(ca2Val)) {
            parsedScores.push({ subject: sub, ca1: ca1Val, ca2: ca2Val, exam: exVal });
          }
        } else if (parts.length === 3) {
          const sub = parts[0].trim();
          const caVal = Number(parts[1].trim()) || 0;
          const exVal = Number(parts[2].trim()) || 0;
          if (sub && !isNaN(caVal)) {
            parsedScores.push({ 
              subject: sub, 
              ca1: Math.round(caVal / 2), 
              ca2: Math.floor(caVal / 2), 
              exam: exVal 
            });
          }
        }
      });

      if (parsedScores.length > 0) {
        setResScores(parsedScores);
        setShowCsvPaste(false);
        setCsvText("");
        alert(`Successfully imported ${parsedScores.length} subjects from spreadsheet copy paste!`);
      } else {
        alert("Incorrect format. Ensure comma separators like:\nMathematics, 15, 15, 50\n(or: Mathematics, 30, 50)");
      }
    } catch (err) {
      alert("Parsing failed. Check format syntax.");
    }
  };

  // PARENT MESSAGE ACTIONS
  const handleDeleteMsg = (id: string) => {
    setPendingDelete({
      id,
      type: 'message',
      title: "Delete Parent Inquiry",
      message: "Are you sure you want to delete this parent inquiry message? This action cannot be undone."
    });
  };

  // STAFF ACTIONS
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffRole) {
      alert("Name and Role are required");
      return;
    }
    setSavingStaff(true);
    let finalImageUrl = staffImageUrl;
    if (staffImageUrl && (staffImageUrl.startsWith("data:") || staffImageUrl.startsWith("blob:"))) {
      try {
        const uploaded = await uploadToSupabaseStorage(staffImageUrl, "staff", editingStaff?.id, "profile.jpg");
        finalImageUrl = uploaded.signedUrl || uploaded.filePath;
      } catch (err) {
        console.error("Staff image storage upload failed:", err);
      }
    }

    const payload = {
      name: staffName,
      role: staffRole,
      department: staffDepartment,
      imageUrl: finalImageUrl
    };
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
      } else {
        await addStaff(payload);
      }
      setShowStaffModal(false);
      setEditingStaff(null);
      setStaffName("");
      setStaffRole("");
      setStaffDepartment("General");
      setStaffImageUrl("");
      refreshData();
    } catch (err) {
      console.error(err);
      alert("Error saving staff member");
    } finally {
      setSavingStaff(false);
    }
  };

  const handleEditStaffClick = (item: StaffMember) => {
    setEditingStaff(item);
    setStaffName(item.name);
    setStaffRole(item.role);
    setStaffDepartment(item.department || "General");
    setStaffImageUrl(item.imageUrl || "");
    setShowStaffModal(true);
  };

  const handleDeleteStaff = (id: string) => {
    setPendingDelete({
      id,
      type: 'staff',
      title: "Delete Staff Member",
      message: "Are you sure you want to delete this staff member? This action cannot be undone."
    });
  };

  // SUBJECT OFFERS HANDLERS
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setEditingSubjectIndex(null);
    setSubjName("");
    setSubjDesc("");
    setSubjCategory("Core STEM");
    setSubjLevel("jss");
    setSubjIcon("BookOpen");
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (subj: SubjectItem, index: number) => {
    setEditingSubject(subj);
    setEditingSubjectIndex(index);
    setSubjName(subj.name);
    setSubjDesc(subj.desc);
    setSubjCategory(subj.category);
    setSubjLevel(subj.level);
    setSubjIcon(subj.icon || "BookOpen");
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !subjDesc.trim()) return;

    setSavingSubjects(true);
    try {
      const newSubject: SubjectItem = {
        name: subjName.trim(),
        desc: subjDesc.trim(),
        category: subjCategory,
        level: subjLevel,
        icon: subjIcon
      };

      let updatedSubjects = [...subjects];
      if (editingSubjectIndex !== null) {
        updatedSubjects[editingSubjectIndex] = newSubject;
      } else {
        updatedSubjects.push(newSubject);
      }

      await updateSchoolSubjects(updatedSubjects);
      setSubjects(updatedSubjects);
      setShowSubjectModal(false);
      setSubjectsSaveSuccess(true);
      setTimeout(() => setSubjectsSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save subject:", err);
    } finally {
      setSavingSubjects(false);
    }
  };

  const handleDeleteSubject = (index: number) => {
    setPendingDelete({
      id: String(index),
      type: 'subject',
      title: "Delete Academic Subject",
      message: `Are you sure you want to delete "${subjects[index].name}" from the curriculum? This change is permanent.`
    });
  };

  // SCHOOL STATS SAVING
  const handleSaveSchoolStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolStatsSaveSuccess(false);
    try {
      await updateSchoolStats({
        enrolledStudents: statEnrolled,
        expertEducators: statEducators,
        alumniGraduates: statAlumni,
        nationalAwards: statAwards
      });
      setSchoolStatsSaveSuccess(true);
      setTimeout(() => setSchoolStatsSaveSuccess(false), 3000);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // SCHOOL SOCIALS SAVING
  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialsSaveSuccess(false);
    setSavingSocials(true);
    try {
      await updateSchoolSocials(socials);
      setSocialsSaveSuccess(true);
      setTimeout(() => setSocialsSaveSuccess(false), 3000);
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSocials(false);
    }
  };

  // LOGIN PAGE RENDER (Unauthenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50 no-print">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-oxblood p-8 text-white text-center space-y-3 relative">
            <div className="mx-auto h-14 w-14 rounded-full border-4 border-brand-yellow bg-brand-green flex items-center justify-center shadow-md">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold font-display tracking-wide">HGASS Admin Console</h1>
              <p className="text-xs text-slate-300 font-mono tracking-wider">SECURE PORTAL LOGIN</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Console Password</label>
                <input
                  type="password"
                  placeholder="Enter administrator password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-slate-50/50"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer accent-brand-green"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-brand-green py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-brand-green-hover transition-colors"
              >
                Sign In
              </button>
            </form>

            {/* Status alerts */}
            {authError && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700 text-center font-semibold">
                {authError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE DASHBOARD CONSOLE (Authenticated)
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 no-print">
      
      {/* BRAND HEADER CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-green text-white flex items-center justify-center shadow-inner">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">Administrator Command Center</h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Holy Ghost Academy Secondary School</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          Logout Console
        </button>
      </div>

      {/* DASHBOARD TABBED NAVIGATION */}
      <div className="flex flex-nowrap bg-slate-100 rounded-xl p-1.5 overflow-x-auto whitespace-nowrap shadow-inner scrollbar-thin scrollbar-thumb-brand-green/30">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'overview' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'news' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Newspaper className="h-4 w-4" />
          News Management
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'projects' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Building2 className="h-4 w-4" />
          Projects Coordinator
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'gallery' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <ImageIcon className="h-4 w-4" />
          Gallery Assets
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'documents' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <FileText className="h-4 w-4" />
          Document filing
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'results' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Award className="h-4 w-4" />
          Result Registrar
        </button>

        <button
          onClick={() => setActiveTab('schoolStats')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'schoolStats' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <TrendingUp className="h-4 w-4" />
          School Info & Socials
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'messages' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Mail className="h-4 w-4" />
          Inquiries ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'staff' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Users className="h-4 w-4" />
          Staff Directory ({staff.length})
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'subjects' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <BookOpen className="h-4 w-4" />
          Subjects Offered ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'registrations' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Key className="h-4 w-4" />
          Student Accounts ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${activeTab === 'database' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Database className="h-4 w-4" />
          Cloud Connection
        </button>
      </div>

      {/* VIEWPORT CONTROLS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Numerical counters */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{stats.totalStudents || 3}</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Student Records</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-oxblood/10 text-brand-oxblood flex items-center justify-center">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{stats.totalImages + stats.totalVideos}</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gallery Media Items ({stats.totalImages} pic, {stats.totalVideos} vid)</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow/15 text-brand-oxblood flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{stats.totalDocuments}</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Prospectuses & Files</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{stats.totalProjects}</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capital Works Projects</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-oxblood/10 text-brand-oxblood flex items-center justify-center">
                <Newspaper className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{stats.totalNewsPosts}</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Published News Articles</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow/15 text-brand-oxblood flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">{messages.length}</span>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Direct Enquiries</p>
              </div>
            </div>
          </div>

          {/* Quick guide and warning box */}
          <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-6 space-y-2">
            <h3 className="text-sm font-bold text-brand-oxblood font-display">HGASS Administrative Notice:</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every photograph, circular, document, announcement, or academic grade sheet shown on the front-end website can be managed below. Changes persist instantly in our primary server registry. Use base64 uploads for safe self-contained file hosting in the sandboxed preview frames.
            </p>
          </div>
        </div>
      )}

      {/* SCHOOL STATISTICS TAB */}
      {activeTab === 'schoolStats' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">School Information & Configurations</h2>
            <p className="text-xs text-slate-500">Edit school statistics counters and social media handle integrations below.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Stats form */}
            <form onSubmit={handleSaveSchoolStats} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 self-start">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Homepage Statistics</h3>
                <p className="text-[11px] text-slate-400">Manage key metrics shown to the public.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans">Enrolled Students</label>
                  <input
                    type="text"
                    value={statEnrolled}
                    onChange={(e) => setStatEnrolled(e.target.value)}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green"
                    placeholder="e.g. 850+"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans">Expert Educators</label>
                  <input
                    type="text"
                    value={statEducators}
                    onChange={(e) => setStatEducators(e.target.value)}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green"
                    placeholder="e.g. 45+"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans">Alumni Graduates</label>
                  <input
                    type="text"
                    value={statAlumni}
                    onChange={(e) => setStatAlumni(e.target.value)}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green"
                    placeholder="e.g. 2,400+"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans">National Awards</label>
                  <input
                    type="text"
                    value={statAwards}
                    onChange={(e) => setStatAwards(e.target.value)}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green"
                    placeholder="e.g. 18+"
                    required
                  />
                </div>
              </div>

              {schoolStatsSaveSuccess && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-xs text-green-700 text-center font-semibold animate-pulse">
                  School statistics updated successfully!
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded bg-brand-green text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-green-hover shadow-sm transition-colors cursor-pointer"
              >
                Update School Statistics
              </button>
            </form>

            {/* Right Column: Social Media Config Form */}
            <form onSubmit={handleSaveSocials} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 self-start">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Social Media Handles</h3>
                <p className="text-[11px] text-slate-400">Configure public links for social networks and communication channels.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    Facebook Link
                  </label>
                  <input
                    type="text"
                    value={socials.facebook}
                    onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green font-mono text-xs text-slate-600"
                    placeholder="https://facebook.com/your-page"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    Twitter / X Link
                  </label>
                  <input
                    type="text"
                    value={socials.twitter}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green font-mono text-xs text-slate-600"
                    placeholder="https://twitter.com/your-handle"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    Instagram Link
                  </label>
                  <input
                    type="text"
                    value={socials.instagram}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green font-mono text-xs text-slate-600"
                    placeholder="https://instagram.com/your-username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    LinkedIn Link
                  </label>
                  <input
                    type="text"
                    value={socials.linkedin}
                    onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green font-mono text-xs text-slate-600"
                    placeholder="https://linkedin.com/school/your-school"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    WhatsApp Link or Phone Number
                  </label>
                  <input
                    type="text"
                    value={socials.whatsapp}
                    onChange={(e) => setSocials({ ...socials, whatsapp: e.target.value })}
                    className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-brand-green font-mono text-xs text-slate-600"
                    placeholder="e.g. https://wa.me/2349054145339"
                  />
                </div>
              </div>

              {socialsSaveSuccess && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-xs text-green-700 text-center font-semibold animate-pulse">
                  Social media links updated successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={savingSocials}
                className="w-full rounded bg-brand-green text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-green-hover shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {savingSocials && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingSocials ? "Saving Handles..." : "Update Social Handles"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. NEWS MANAGEMENT TAB */}
      {activeTab === 'news' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">Manage Front-page Announcements</h2>
            <button
              onClick={() => {
                setEditingNews(null);
                setNewsTitle("");
                setNewsSummary("");
                setNewsContent("");
                setNewsImage("");
                setShowNewsModal(true);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-brand-green text-white hover:bg-brand-green-hover shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Article
            </button>
          </div>

          {/* News Table/Grid */}
          <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono text-[9px] border-b">
                <tr>
                  <th className="px-5 py-3">News Title & Details</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                        <p className="text-xs text-slate-400 line-clamp-1">{item.summary}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 font-mono font-semibold">{item.category}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">{item.date}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => handleEditNewsClick(item)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deletingNewsId !== null}
                          title="Edit Post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteNews(item.id)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deletingNewsId !== null}
                          title="Delete Post"
                        >
                          {deletingNewsId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* News Dialog Modal */}
          {showNewsModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between">
                  <h3 className="font-bold font-display">{editingNews ? "Edit Announcement" : "Publish Announcement"}</h3>
                  <button onClick={() => setShowNewsModal(false)} className="text-white hover:opacity-75">Close</button>
                </div>

                <form onSubmit={handleSaveNews} className="p-6 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Article Title *</label>
                    <input 
                      type="text" 
                      value={newsTitle} 
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-brand-green" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Summary sentence *</label>
                    <input 
                      type="text" 
                      value={newsSummary} 
                      onChange={(e) => setNewsSummary(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-brand-green" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Broad Content body (Rich-text format) *</label>
                    <textarea 
                      rows={5}
                      value={newsContent} 
                      onChange={(e) => setNewsContent(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-brand-green resize-y" 
                      required 
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Category Tag</label>
                      <select 
                        value={newsCategory} 
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full border px-2 py-2 text-xs rounded"
                      >
                        <option value="Admissions">Admissions</option>
                        <option value="Academics">Academics</option>
                        <option value="Sports">Sports</option>
                        <option value="Management">Management</option>
                        <option value="Alumni">Alumni</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">Attachment Cover Photo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setNewsImage)}
                        className="w-full text-[10px]" 
                      />
                    </div>
                  </div>

                  {newsImage && (
                    <div className="h-20 w-full border rounded overflow-hidden relative">
                      <img src={newsImage} alt="Cover preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setNewsImage("")} className="absolute top-1 right-1 bg-red-600 text-white rounded p-0.5 text-[8px]">Remove</button>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full rounded bg-brand-green text-white py-2.5 text-xs uppercase font-bold tracking-wider hover:bg-brand-green-hover"
                  >
                    Save Announcement
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PROJECTS MANAGEMENT TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">School Project Coordinator</h2>
            <button
              onClick={() => {
                setEditingProj(null);
                setProjTitle("");
                setProjDesc("");
                setProjBudget("₦3,000,000");
                setProjStart("");
                setProjEnd("");
                setProjProgress(0);
                setProjImage("");
                setShowProjModal(true);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-brand-green text-white hover:bg-brand-green-hover shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Register Project
            </button>
          </div>

          {/* List of projects */}
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((proj) => (
              <div key={proj.id} className="rounded-xl border bg-white p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 font-display">{proj.title}</span>
                    <div className="inline-flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => handleEditProjClick(proj)} 
                        className="w-9 h-9 flex items-center justify-center bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deletingProjId !== null}
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProj(proj.id)} 
                        className="w-9 h-9 flex items-center justify-center bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deletingProjId !== null}
                        title="Delete Project"
                      >
                        {deletingProjId === proj.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{proj.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-mono font-semibold">
                    <span className="text-slate-400">Budget:</span>
                    <span className="text-brand-green">{proj.budget}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Milestone progress</span>
                      <span className="text-brand-oxblood">{proj.progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-brand-green" style={{ width: `${proj.progressPercentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project modal form */}
          {showProjModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between">
                  <h3 className="font-bold font-display">{editingProj ? "Edit Capital Work" : "New Capital Work Project"}</h3>
                  <button onClick={() => setShowProjModal(false)} className="text-white hover:opacity-75">Close</button>
                </div>

                <form onSubmit={handleSaveProj} className="p-6 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Project Title *</label>
                    <input 
                      type="text" 
                      value={projTitle} 
                      onChange={(e) => setProjTitle(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-brand-green" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Description *</label>
                    <textarea 
                      rows={3}
                      value={projDesc} 
                      onChange={(e) => setProjDesc(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-brand-green" 
                      required 
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Naira Budget *</label>
                      <input 
                        type="text" 
                        value={projBudget} 
                        onChange={(e) => setProjBudget(e.target.value)}
                        className="w-full border px-3 py-2 text-xs rounded" 
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Completion Milestone (%)</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={100}
                        value={projProgress} 
                        onChange={(e) => setProjProgress(Number(e.target.value))}
                        className="w-full border px-3 py-2 text-xs rounded" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Start Date</label>
                      <input 
                        type="date" 
                        value={projStart} 
                        onChange={(e) => setProjStart(e.target.value)}
                        className="w-full border px-3 py-2 text-xs rounded" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Target End Date</label>
                      <input 
                        type="date" 
                        value={projEnd} 
                        onChange={(e) => setProjEnd(e.target.value)}
                        className="w-full border px-3 py-2 text-xs rounded" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Project Illustration Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setProjImage)}
                      className="w-full text-[10px]" 
                    />
                  </div>

                  {projImage && (
                    <div className="h-20 w-full border rounded overflow-hidden">
                      <img src={projImage} alt="Project Preview" className="h-full w-full object-cover" />
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full rounded bg-brand-green text-white py-2.5 text-xs uppercase font-bold tracking-wider hover:bg-brand-green-hover"
                  >
                    Save Project Card
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. GALLERY & VIDEO ASSETS TAB */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">Multimedia Gallery Curator</h2>
            <button
              onClick={() => {
                setEditingGalleryId(null);
                setGalleryTitle("");
                setGalleryUrl("");
                setGalleryDesc("");
                setShowGalleryModal(true);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-brand-green text-white hover:bg-brand-green-hover shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Image/Video URL
            </button>
          </div>
 
          {/* Simple Gallery Grid List with Trash buttons */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.id} className="group relative rounded-lg border overflow-hidden aspect-square bg-slate-50 shadow-sm flex flex-col justify-between">
                
                {item.type === "image" ? (
                  <img src={item.url} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                    <Youtube className="h-10 w-10 text-red-600 mb-1" />
                    <span className="text-[9px] font-mono font-bold tracking-wider">VIDEO EMBED</span>
                  </div>
                )}
 
                {/* Dark banner with edit and trash icons */}
                <div className="absolute inset-x-0 bottom-0 bg-black/85 p-3 flex items-center justify-between text-white">
                  <div className="space-y-0.5 max-w-[55%]">
                    <span className="font-bold text-[10px] line-clamp-1">{item.title}</span>
                    <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleEditGalleryClick(item)}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all transform active:scale-90 hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit Asset"
                      disabled={deletingGalleryId === item.id}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGallery(item.id)}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all transform active:scale-90 hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Asset"
                      disabled={deletingGalleryId !== null}
                    >
                      {deletingGalleryId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-current" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
 
          {/* Gallery modal */}
          {showGalleryModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-slate-100 shadow-2xl flex flex-col">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between">
                  <h3 className="font-bold font-display">{editingGalleryId ? "Edit Gallery Asset" : "Add Gallery Asset"}</h3>
                  <button 
                    onClick={() => {
                      setShowGalleryModal(false);
                      setEditingGalleryId(null);
                    }} 
                    className="text-white hover:opacity-75"
                  >
                    Close
                  </button>
                </div>
 
                <form onSubmit={handleSaveGallery} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Asset Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Science Fair Practical Sessions"
                      value={galleryTitle} 
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded" 
                      required 
                    />
                  </div>
 
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">Asset Type</label>
                      <select 
                        value={galleryType} 
                        onChange={(e) => {
                          setGalleryType(e.target.value as any);
                          setGalleryUrl("");
                        }}
                        className="w-full border px-2 py-2 text-xs rounded"
                      >
                        <option value="image">Photograph file</option>
                        <option value="video">YouTube Embed link</option>
                      </select>
                    </div>
 
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Category Folder</label>
                      <select 
                        value={galleryCategory} 
                        onChange={(e) => setGalleryCategory(e.target.value as any)}
                        className="w-full border px-2 py-2 text-xs rounded"
                      >
                        <option value="activities">School Activities</option>
                        <option value="sports">Sports</option>
                        <option value="academics">Academics</option>
                        <option value="graduation">Graduation</option>
                        <option value="cultural">Cultural Events</option>
                        <option value="projects">Projects</option>
                      </select>
                    </div>
                  </div>
 
                  {galleryType === "image" ? (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">
                        {editingGalleryId ? "Upload New Photo (Optional)" : "Upload Local Photo File *"}
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setGalleryUrl)}
                        className="w-full text-xs" 
                        required={!editingGalleryId}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">YouTube Embed Link *</label>
                      <input 
                        type="url" 
                        placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                        value={galleryUrl} 
                        onChange={(e) => setGalleryUrl(e.target.value)}
                        className="w-full border px-3 py-2 text-xs rounded" 
                        required 
                      />
                    </div>
                  )}
 
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Brief caption description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Taken inside the JSS laboratory block..."
                      value={galleryDesc} 
                      onChange={(e) => setGalleryDesc(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded" 
                    />
                  </div>
 
                  {galleryUrl && galleryType === "image" && (
                    <div className="h-20 w-24 border rounded overflow-hidden">
                      <img src={galleryUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
 
                  <button 
                    type="submit" 
                    className="w-full rounded bg-brand-green text-white py-2.5 text-xs uppercase font-bold tracking-wider hover:bg-brand-green-hover"
                  >
                    {editingGalleryId ? "Update Asset" : "Save Asset to Album"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. DOCUMENTS FILING CABINET */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">School Circulars & Prospectuses Cabinet</h2>
            <button
              onClick={() => {
                setDocTitle("");
                setDocFilename("");
                setDocData("");
                setShowDocModal(true);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-brand-green text-white hover:bg-brand-green-hover shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Upload Circular / PDF
            </button>
          </div>

          {/* List of documents */}
          <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono text-[9px] border-b">
                <tr>
                  <th className="px-5 py-3">Document Title</th>
                  <th className="px-5 py-3">Filename</th>
                  <th className="px-5 py-3">Uploaded Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-800">{doc.title}</td>
                    <td className="px-5 py-4 font-mono text-slate-500 text-xs">{doc.filename}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono">{doc.uploadedAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex justify-end w-full">
                        <button 
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deletingDocId !== null}
                          title="Delete Document"
                        >
                          {deletingDocId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Doc Upload Modal */}
          {showDocModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-slate-100 shadow-2xl flex flex-col">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between">
                  <h3 className="font-bold font-display font-semibold">Upload Circular or Syllabus</h3>
                  <button onClick={() => setShowDocModal(false)} className="text-white hover:opacity-75">Close</button>
                </div>

                <form onSubmit={handleSaveDoc} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Document Display Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Academic Prospectus 2026/2027"
                      value={docTitle} 
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">Upload Document file (PDF, DOCX, XLSX) *</label>
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.xlsx"
                      onChange={(e) => handleFileChange(e, setDocData, setDocFilename)}
                      className="w-full text-xs" 
                      required
                    />
                  </div>

                  {docFilename && (
                    <div className="text-[10px] font-mono text-brand-green bg-green-50 p-2 rounded border border-green-100 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Loaded: {docFilename}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full rounded bg-brand-green text-white py-2.5 text-xs uppercase font-bold tracking-wider hover:bg-brand-green-hover shadow-sm"
                  >
                    Host and Publish Document
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. RESULTS REGISTRAR / DATABASE TAB */}
      {activeTab === 'results' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 font-display">Academic Grade Book Registrar</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Import CSV Button */}
              <button
                onClick={() => {
                  setParsedResultCsvItems([]);
                  setCsvFileName("");
                  setResultCsvStatus(null);
                  if (resultCsvInputRef.current) resultCsvInputRef.current.value = "";
                  setShowResultCsvModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-brand-green/30 bg-emerald-50 dark:bg-emerald-950/40 text-brand-green hover:bg-brand-green hover:text-white shadow-sm transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Import CSV File
              </button>

              {/* Export Button */}
              <button
                onClick={handleExportResults}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Export CSV
              </button>

              {/* Add Result */}
              <button
                onClick={() => {
                  setEditingResult(null);
                  setResStudentId("");
                  setResRegNumber("");
                  setResStudentName("");
                  setResRemarks("");
                  setResPosition(1);
                  setResOutOf(30);
                  setResClassPlacement("");
                  setResGrossTotalMarks("");
                  setResGradePoint("");
                  setResTerminalAverageScore("");
                  setResAccreditedGradeBracket("");
                  setResClassStanding("");
                  setResPassportPhoto(null);
                  setResSex("Male");
                  setResScores([
                    { subject: "Mathematics", ca1: 15, ca2: 13, exam: 52 },
                    { subject: "English Language", ca1: 18, ca2: 16, exam: 48 },
                    { subject: "Basic Science", ca1: 15, ca2: 14, exam: 51 }
                  ]);
                  setShowResultModal(true);
                }}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-brand-green text-white hover:bg-brand-green-hover shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Student Sheet
              </button>
            </div>
          </div>

          {/* Student Sheet Section Header & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border p-4 rounded-xl">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Student Sheet Section</h3>
              <p className="text-[10px] text-slate-500">Query and organize academic sheets, view official report sheets, or edit cumulative grading tallies.</p>
            </div>
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search by student name, ID or reg number..."
                value={resultSearchQuery}
                onChange={(e) => setResultSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-green shadow-inner"
              />
            </div>
          </div>

          {/* Student list */}
          <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono text-[9px] border-b">
                <tr>
                  <th className="px-5 py-3">Student name</th>
                  <th className="px-5 py-3">ID & Registration</th>
                  <th className="px-5 py-3">Class/Unit</th>
                  <th className="px-5 py-3">Session & Term</th>
                  <th className="px-5 py-3 text-center">Avg Score</th>
                  <th className="px-5 py-3 text-center">File Password</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.filter(res => 
                  res.studentName.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
                  res.regNumber.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
                  res.studentId.toLowerCase().includes(resultSearchQuery.toLowerCase())
                ).map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-800">{res.studentName}</td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      <div>ID: {res.studentId}</div>
                      <div className="text-[10px] text-slate-400">REG: {res.regNumber}</div>
                    </td>
                    <td className="px-5 py-4 text-brand-green font-semibold">{res.classUnit}</td>
                    <td className="px-5 py-4 font-sans text-slate-600">
                      <div>{res.session}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{res.term}</div>
                    </td>
                    <td className="px-5 py-4 text-center font-extrabold text-brand-oxblood">{res.averageScore}%</td>
                    <td className="px-5 py-4 text-center font-mono">
                      {res.resultPassword ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">
                          <Lock className="h-3 w-3 text-amber-600" />
                          {res.resultPassword}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedReportSheet(res);
                            setShowReportSheetModal(true);
                          }}
                          className="inline-flex items-center gap-1 h-9 px-3 text-[10px] font-bold uppercase tracking-wider text-brand-green border border-brand-green/20 bg-brand-green/5 hover:bg-brand-green hover:text-white rounded-lg transition-all transform active:scale-95 shadow-xs"
                          title="View Student Report Sheet"
                          disabled={deletingResultId !== null}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Report Sheet</span>
                        </button>
                        <button 
                          onClick={() => handleEditResultClick(res)}
                          className="w-9 h-9 flex items-center justify-center bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit"
                          disabled={deletingResultId !== null}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteResult(res.id)}
                          className="w-9 h-9 flex items-center justify-center bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                          disabled={deletingResultId !== null}
                        >
                          {deletingResultId === res.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Student result sheet modal */}
          {showResultModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between">
                  <h3 className="font-bold font-display">{editingResult ? "Modify Academic Sheet" : "Add Student Report Sheet"}</h3>
                  <button onClick={() => setShowResultModal(false)} className="text-white hover:opacity-75">Close</button>
                </div>

                <form onSubmit={handleSaveResult} className="p-6 space-y-5 overflow-y-auto">
                  
                  {/* General student details */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-4 bg-slate-50 border p-4 rounded-xl items-start">
                    
                    {/* PASSPORT PHOTOGRAPHY UPLOAD BOX */}
                    <div className="col-span-1 flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono mb-2">Student Passport</span>
                      <input 
                        type="file" 
                        id="res-passport-upload-input" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setResPassportPhoto(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="res-passport-upload-input" className="cursor-pointer block relative">
                        {resPassportPhoto ? (
                          <div className="h-28 w-24 overflow-hidden rounded relative border group">
                            <img src={resPassportPhoto} alt="Passport Preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              Change
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 w-24 bg-slate-50 hover:bg-slate-100 text-slate-400 flex flex-col items-center justify-center rounded border border-dashed border-slate-300">
                            <Camera className="h-6 w-6 text-slate-300 mb-1" />
                            <span className="text-[7px] text-center uppercase font-extrabold tracking-tight">Click to</span>
                            <span className="text-[7px] text-center uppercase font-extrabold tracking-tight">Upload Photo</span>
                          </div>
                        )}
                      </label>
                      {resPassportPhoto && (
                        <button
                          type="button"
                          onClick={() => setResPassportPhoto(null)}
                          className="text-[8px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider mt-1.5"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    {/* General details fields */}
                    <div className="col-span-1 sm:col-span-3 grid gap-3 grid-cols-1 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Student Name *</label>
                        <input 
                          type="text" 
                          value={resStudentName} 
                          onChange={(e) => setResStudentName(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          required 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Student ID *</label>
                        <input 
                          type="text" 
                          value={resStudentId} 
                          onChange={(e) => setResStudentId(e.target.value.toUpperCase())}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          required 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Reg Number *</label>
                        <input 
                          type="text" 
                          value={resRegNumber} 
                          onChange={(e) => setResRegNumber(e.target.value.toUpperCase())}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          required 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Classroom Unit</label>
                        <select 
                          value={resClassUnit} 
                          onChange={(e) => setResClassUnit(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded"
                        >
                          <option value="JSS1">JSS1</option>
                          <option value="JSS2">JSS2</option>
                          <option value="JSS3">JSS3</option>
                          <option value="SS1">SS1</option>
                          <option value="SS2">SS2</option>
                          <option value="SS3">SS3</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Session</label>
                        <select 
                          value={resSession} 
                          onChange={(e) => setResSession(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded"
                        >
                          <option value="2025/2026">2025/2026</option>
                          <option value="2026/2027">2026/2027</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Term</label>
                        <select 
                          value={resTerm} 
                          onChange={(e) => setResTerm(e.target.value as any)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded"
                        >
                          <option value="1st Term">1st Term</option>
                          <option value="2nd Term">2nd Term</option>
                          <option value="3rd Term">3rd Term</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">SEX (Gender) *</label>
                        <input 
                          type="text" 
                          list="sex-list"
                          value={resSex} 
                          onChange={(e) => setResSex(e.target.value)}
                          placeholder="Choose or input..."
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          required 
                        />
                        <datalist id="sex-list">
                          <option value="Male" />
                          <option value="Female" />
                        </datalist>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Class Standing (Position)</label>
                        <input 
                          type="number" 
                          min={1}
                          value={resPosition} 
                          onChange={(e) => setResPosition(Number(e.target.value))}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Class Size (Out of)</label>
                        <input 
                          type="number" 
                          min={1}
                          value={resOutOf} 
                          onChange={(e) => setResOutOf(Number(e.target.value))}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                        />
                      </div>

                      {/* File Security Password / PIN */}
                      <div className="space-y-1.5 col-span-1 sm:col-span-3 bg-amber-50/70 border border-amber-200 p-3 rounded-lg mt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-amber-900 font-mono flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-amber-600" />
                            <span>File Protection Password / Security PIN</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
                              setResResultPassword(randomPin);
                            }}
                            className="text-[9px] font-bold text-amber-700 hover:text-amber-900 underline uppercase tracking-tight cursor-pointer"
                          >
                            Generate 6-Digit PIN
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <input 
                            type={showResPassword ? "text" : "password"} 
                            value={resResultPassword} 
                            onChange={(e) => setResResultPassword(e.target.value)}
                            placeholder="e.g. 849201 (Assign password/PIN to lock this student sheet)"
                            className="w-full border border-amber-300 px-3 py-1.5 text-xs font-mono font-bold bg-white rounded text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 pr-16" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowResPassword(!showResPassword)}
                            className="absolute right-2 text-[10px] font-bold uppercase tracking-tight text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded cursor-pointer"
                          >
                            {showResPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        <p className="text-[9px] text-amber-700 font-sans">
                          If assigned, students must enter this password on the Result Portal before viewing or printing their sheet.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Report Card Custom Metrics Overrides */}
                  <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block">Report Card Custom Metrics (Optional Overrides)</span>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Class Placement</label>
                        <input 
                          type="text" 
                          value={resClassPlacement} 
                          onChange={(e) => setResClassPlacement(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. JSS1 A (Auto-computed if blank)"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Gross Total Marks</label>
                        <input 
                          type="text" 
                          value={resGrossTotalMarks} 
                          onChange={(e) => setResGrossTotalMarks(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. 250 / 300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Grade Point Average</label>
                        <input 
                          type="text" 
                          value={resGradePoint} 
                          onChange={(e) => setResGradePoint(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. 4.50 / 5.00"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Terminal Average Score</label>
                        <input 
                          type="text" 
                          value={resTerminalAverageScore} 
                          onChange={(e) => setResTerminalAverageScore(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. 83.3%"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Accredited Grade Bracket</label>
                        <input 
                          type="text" 
                          value={resAccreditedGradeBracket} 
                          onChange={(e) => setResAccreditedGradeBracket(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. Distinction (A)"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Class Standing</label>
                        <input 
                          type="text" 
                          value={resClassStanding} 
                          onChange={(e) => setResClassStanding(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. 1st out of 30"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Promotion Status</label>
                        <input 
                          type="text" 
                          list="promotion-status-list"
                          value={resPromotionStatus} 
                          onChange={(e) => setResPromotionStatus(e.target.value)}
                          className="w-full border px-2 py-1 text-xs bg-white rounded" 
                          placeholder="e.g. PASS / PROMOTED"
                        />
                        <datalist id="promotion-status-list">
                          <option value="PASS / PROMOTED" />
                          <option value="PROMOTED ON TRIAL" />
                          <option value="RETAINED / DEMOTED" />
                          <option value="NOT PROMOTED" />
                          <option value="GRADUATED" />
                          <option value="NOT APPLICABLE" />
                        </datalist>
                      </div>
                    </div>
                  </div>

                  {/* Nested scores table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Subject Performance Tally (CA1: 20, CA2: 20, Exam: 60)</span>
                      
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCsvPaste(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-yellow/10 text-brand-oxblood border border-brand-yellow/20 rounded text-[10px] font-bold uppercase tracking-wider"
                        >
                          <FileSpreadsheet className="h-3 w-3" />
                          Import copy paste
                        </button>
                        <button
                          type="button"
                          onClick={addSubjectRow}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-green/15 text-brand-green rounded text-[10px] font-bold uppercase tracking-wider"
                        >
                          <Plus className="h-3 w-3" />
                          Add Subject Row
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-xl overflow-x-auto bg-slate-50">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-slate-100 border-b text-slate-500">
                          <tr>
                            <th className="px-3 py-2 w-2/5">Subject Name</th>
                            <th className="px-3 py-2 text-center w-[15%]">CA1 (20)</th>
                            <th className="px-3 py-2 text-center w-[15%]">CA2 (20)</th>
                            <th className="px-3 py-2 text-center w-[15%]">Exam (60)</th>
                            <th className="px-3 py-2 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {resScores.map((row, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.subject} 
                                  onChange={(e) => updateScoreRow(idx, 'subject', e.target.value)}
                                  className="w-full border px-1.5 py-0.5 rounded text-xs" 
                                  required
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input 
                                  type="number" 
                                  min={0} 
                                  max={20}
                                  value={row.ca1} 
                                  onChange={(e) => updateScoreRow(idx, 'ca1', e.target.value)}
                                  className="w-14 border px-1.5 py-0.5 rounded text-center text-xs" 
                                  required
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input 
                                  type="number" 
                                  min={0} 
                                  max={20}
                                  value={row.ca2} 
                                  onChange={(e) => updateScoreRow(idx, 'ca2', e.target.value)}
                                  className="w-14 border px-1.5 py-0.5 rounded text-center text-xs" 
                                  required
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input 
                                  type="number" 
                                  min={0} 
                                  max={60}
                                  value={row.exam} 
                                  onChange={(e) => updateScoreRow(idx, 'exam', e.target.value)}
                                  className="w-14 border px-1.5 py-0.5 rounded text-center text-xs" 
                                  required
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button 
                                  type="button" 
                                  onClick={() => removeScoreRow(idx)}
                                  className="w-8 h-8 inline-flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-md transition-all transform active:scale-90"
                                  title="Remove Subject"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Manager Remarks *</label>
                    <textarea 
                      rows={2}
                      value={resRemarks} 
                      onChange={(e) => setResRemarks(e.target.value)}
                      className="w-full border px-3 py-2 text-xs rounded" 
                      placeholder="e.g. Excellent student. Highly recommended for promotion..."
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full rounded bg-brand-green text-white py-2.5 text-xs uppercase font-bold tracking-wider hover:bg-brand-green-hover shadow-sm"
                  >
                    Save Student Sheet
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CSV Import sub-modal */}
          {showCsvPaste && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-md overflow-hidden border shadow-2xl flex flex-col">
                <div className="bg-brand-oxblood p-4 text-white flex items-center justify-between">
                  <h4 className="font-bold font-display text-sm">Import spreadsheet records</h4>
                  <button onClick={() => setShowCsvPaste(false)} className="text-white hover:opacity-75">Close</button>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Paste raw comma-separated values (CSV) matching headers below. (e.g., from Excel sheet columns: Subject Name, CA score, Exam score).
                  </p>
                  
                  <div className="bg-slate-50 font-mono text-[10px] border p-2 rounded text-slate-500">
                    Mathematics, 25, 58<br />
                    English Language, 24, 52<br />
                    Civic Education, 27, 50
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Paste CSV rows..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full border font-mono p-2 text-xs rounded focus:outline-none"
                  />

                  <button
                    onClick={handleImportCsvText}
                    className="w-full rounded bg-brand-green text-white py-2 text-xs font-bold uppercase tracking-wider hover:bg-brand-green-hover"
                  >
                    Parse Paste Records
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Student Results Bulk CSV Import Modal */}
          {showResultCsvModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-5 w-5 text-brand-yellow" />
                    <h3 className="font-bold font-display text-base">Bulk Import Student Results via CSV</h3>
                  </div>
                  <button 
                    onClick={() => setShowResultCsvModal(false)} 
                    className="text-white hover:opacity-75 text-sm font-semibold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Instructions Banner */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 font-mono">
                          CSV File Format Instructions
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Upload a standard <strong>.CSV</strong> spreadsheet containing student information and subject scores. Columns can include student name, reg number, class, session, term, position, and subject scores.
                        </p>
                      </div>
                      <button
                        onClick={downloadSampleResultCsvTemplate}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-brand-green/40 bg-emerald-50 dark:bg-emerald-900/30 text-brand-green hover:bg-brand-green hover:text-white transition-all shrink-0 cursor-pointer"
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        Download Template
                      </button>
                    </div>
                  </div>

                  {/* Status Message */}
                  {resultCsvStatus && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-medium ${
                      resultCsvStatus.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200' 
                        : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200'
                    }`}>
                      {resultCsvStatus.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <span>{resultCsvStatus.message}</span>
                    </div>
                  )}

                  {/* Upload Zone */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-green p-6 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-800/30 transition-all space-y-3">
                    <input
                      type="file"
                      ref={resultCsvInputRef}
                      accept=".csv"
                      className="hidden"
                      id="result-csv-file-upload-input"
                      onChange={handleResultCsvFileSelect}
                    />
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-brand-green flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <label 
                        htmlFor="result-csv-file-upload-input" 
                        className="px-4 py-2 bg-brand-green text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-green-hover cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        Choose CSV File
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        {csvFileName ? `Selected File: ${csvFileName}` : "Select a .csv spreadsheet file from your device"}
                      </p>
                    </div>
                  </div>

                  {/* Preview of Parsed Records */}
                  {parsedResultCsvItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                          Preview Parsed Records ({parsedResultCsvItems.length})
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">Ready to import to database</span>
                      </div>

                      <div className="border rounded-xl overflow-x-auto max-h-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono text-[9px] border-b">
                            <tr>
                              <th className="px-4 py-2">#</th>
                              <th className="px-4 py-2">Student Name</th>
                              <th className="px-4 py-2">Reg Number / ID</th>
                              <th className="px-4 py-2">Class</th>
                              <th className="px-4 py-2">Session & Term</th>
                              <th className="px-4 py-2 text-center">Subjects</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {parsedResultCsvItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-2 font-mono text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">{item.studentName}</td>
                                <td className="px-4 py-2 font-mono text-slate-500">
                                  <div>{item.regNumber}</div>
                                  <div className="text-[10px] text-slate-400">ID: {item.studentId}</div>
                                </td>
                                <td className="px-4 py-2 text-brand-green font-semibold">{item.classUnit}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                                  <div>{item.session}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{item.term}</div>
                                </td>
                                <td className="px-4 py-2 text-center font-bold text-brand-oxblood">
                                  {item.scores.length}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResultCsvModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImportResultCsv}
                    disabled={parsedResultCsvItems.length === 0 || isImportingResultsCsv}
                    className="px-5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isImportingResultsCsv ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Importing Records...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Confirm & Import ({parsedResultCsvItems.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Official Report Sheet Preview Modal */}
          {showReportSheetModal && selectedReportSheet && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden border shadow-2xl flex flex-col my-8 animate-fade-in-up">
                {/* Header controls (non-printable) */}
                <div className="bg-slate-900 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                  <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
                    <FileText className="h-5 w-5 text-brand-yellow shrink-0" />
                    <h3 className="font-bold text-xs font-display uppercase tracking-wider text-center sm:text-left">Official Student Academic Report Sheet</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        const currentRes = selectedReportSheet;
                        setShowReportSheetModal(false);
                        handleEditResultClick(currentRes);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors w-full sm:w-auto cursor-pointer shadow-xs"
                      title="Modify Scores & Details"
                    >
                      <Edit className="h-3.5 w-3.5 shrink-0" />
                      <span>Edit Result</span>
                    </button>
                    <button 
                      onClick={handleAdminPrint}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-green hover:bg-brand-green-hover text-white rounded text-xs font-bold transition-colors w-full sm:w-auto"
                    >
                      <Printer className="h-3.5 w-3.5 shrink-0" />
                      Print Sheet
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedReportSheet(null);
                        setShowReportSheetModal(false);
                      }} 
                      className="text-slate-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-mono font-bold py-1.5 text-center"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* Report Sheet Content (Printable Area) */}
                <div id="printable-report-sheet" className="p-8 md:p-12 space-y-8 bg-white print:p-6 overflow-y-auto flex-1">
                  {/* Letterhead */}
                  <div className="border-b-4 border-brand-oxblood pb-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="flex-shrink-0">
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent("https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg")}`} 
                        alt="Holy Ghost Academy Logo" 
                        className="h-20 w-20 rounded-full object-cover border-4 border-brand-yellow shadow"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h1 className="text-2xl md:text-3xl font-black text-brand-oxblood font-display tracking-tight uppercase">HOLY GHOST ACADEMY, KAMALI HOMES AWKA</h1>
                      <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-500">
                        P.M.B. 5011, Awka, Anambra State, Nigeria
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Official Terminal Academic Evaluation & Progress Report Sheet
                      </p>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 sm:border-l sm:pl-6 border-slate-200">
                      <div className="text-center sm:text-right font-mono text-[10px] text-slate-400">
                        <div>SESSION: {selectedReportSheet.session}</div>
                        <div>TERM: {selectedReportSheet.term}</div>
                        <div className="text-brand-oxblood font-bold mt-1 text-[11px]">STATUS: ACCREDITED</div>
                      </div>

                      {/* ADMIN PASSPORT PHOTOGRAPHY BOX */}
                      <div className="border border-slate-200 p-1 rounded-lg bg-white shadow-sm flex flex-col items-center">
                        {selectedReportSheet.passportPhoto ? (
                          <div className="h-24 w-20 overflow-hidden rounded relative">
                            <img 
                              src={selectedReportSheet.passportPhoto.startsWith("data:") ? selectedReportSheet.passportPhoto : `/api/proxy-image?url=${encodeURIComponent(selectedReportSheet.passportPhoto)}`} 
                              alt="Passport" 
                              className="h-full w-full object-cover" 
                              crossOrigin="anonymous" 
                            />
                          </div>
                        ) : (
                          <div className="h-24 w-20 bg-slate-50 text-slate-400 flex flex-col items-center justify-center rounded border border-dashed border-slate-300">
                            <Camera className="h-6 w-6 text-slate-300 mb-1" />
                            <span className="text-[7px] text-center uppercase font-extrabold tracking-tight">STUDENT</span>
                            <span className="text-[7px] text-center uppercase font-extrabold tracking-tight font-sans">PASSPORT PHOTO</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student Credentials Sheet Grid */}
                  <div className="bg-slate-50 border rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs shadow-inner">
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Student Full Name</span>
                        <span className="font-extrabold text-slate-800 text-sm">{selectedReportSheet.studentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Admission Reg Number</span>
                        <span className="font-mono font-bold text-slate-700">{selectedReportSheet.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Sex</span>
                        <span className="font-mono font-bold text-slate-700 uppercase">{selectedReportSheet.sex || "Male"}</span>
                      </div>
                    </div>

                    <div className="space-y-3 md:border-x md:px-6 border-slate-200">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Class Placement</span>
                        <span className="font-extrabold text-brand-green text-sm">{selectedReportSheet.classPlacement || selectedReportSheet.classUnit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Class Size Standing</span>
                        <span className="font-bold text-slate-700">{selectedReportSheet.classStanding || `${selectedReportSheet.position} out of ${selectedReportSheet.outOf}`}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Evaluation Phase</span>
                        <span className="font-bold text-slate-700">{selectedReportSheet.term} Examination</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Gross Total Marks</span>
                        <span className="font-extrabold text-slate-800 text-sm">{selectedReportSheet.grossTotalMarks || `${selectedReportSheet.totalScore} / ${selectedReportSheet.scores.length * 100}`}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Terminal Average Score</span>
                        <span className="font-extrabold text-brand-oxblood text-sm">{selectedReportSheet.terminalAverageScore || `${selectedReportSheet.averageScore}%`}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Accredited Grade Bracket</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-brand-yellow/15 text-brand-oxblood text-[11px] inline-block mt-1 border border-brand-yellow/30 font-display">
                          {selectedReportSheet.accreditedGradeBracket}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Promotion Status</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-brand-oxblood/10 text-brand-oxblood text-[11px] inline-block mt-1 border border-brand-oxblood/20 font-display uppercase">
                          {selectedReportSheet.promotionStatus || "PASS / PROMOTED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject score matrix */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Academic Subject Grade Ledger</h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                            <th className="px-4 py-3">Subject Offering</th>
                            <th className="px-4 py-3 text-center">CA1 (20)</th>
                            <th className="px-4 py-3 text-center">CA2 (20)</th>
                            <th className="px-4 py-3 text-center">Exam (60)</th>
                            <th className="px-4 py-3 text-center font-bold">Total (100)</th>
                            <th className="px-4 py-3 text-center">Accredited Grade</th>
                            <th className="px-4 py-3 text-right">Assessment Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedReportSheet.scores.map((row, sIdx) => {
                            const c1 = row.ca1 !== undefined ? row.ca1 : Math.round((row as any).ca / 2) || 0;
                            const c2 = row.ca2 !== undefined ? row.ca2 : Math.floor((row as any).ca / 2) || 0;
                            return (
                              <tr key={sIdx} className="hover:bg-slate-50/20 font-sans">
                                <td className="px-4 py-3.5 font-bold text-slate-800">{row.subject}</td>
                                <td className="px-4 py-3.5 text-center font-mono text-slate-600">{c1}</td>
                                <td className="px-4 py-3.5 text-center font-mono text-slate-600">{c2}</td>
                                <td className="px-4 py-3.5 text-center font-mono text-slate-600">{row.exam}</td>
                                <td className="px-4 py-3.5 text-center font-mono font-extrabold text-brand-oxblood">{row.total}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`inline-flex items-center justify-center font-mono font-extrabold h-6 w-6 rounded-full text-xs ${
                                    row.grade === 'A' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    row.grade === 'B' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    row.grade === 'C' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                    row.grade === 'D' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                    row.grade === 'E' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                    'bg-red-50 text-red-700 border border-red-200'
                                  }`}>
                                    {row.grade}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-right font-medium text-slate-500 italic text-[11px]">{row.remark}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary / Remarks / Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div className="space-y-3 bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                      <span className="text-slate-400 uppercase text-[9px] tracking-wider font-mono block">Official Administration Remarks</span>
                      <p className="leading-relaxed font-sans italic text-slate-700">
                        "{selectedReportSheet.remarks || "No supplementary remarks submitted."}"
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono mt-2">
                        Grade Point Average: <span className="font-bold text-slate-700">{selectedReportSheet.gradePoint || "0.00"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-6 md:pl-6">
                      <div className="flex justify-between items-end border-b pb-4 border-slate-200">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800">Engr. ThankGod Ndibe (Manager)</div>
                          <div className="text-[10px] text-slate-400 font-mono font-bold text-brand-green">APPROVED BY PORTAL</div>
                        </div>
                        <div className="text-right">
                          <div className="italic text-slate-400 font-display font-medium text-[13px] tracking-wider">HGA Registrar</div>
                          <div className="text-[9px] font-mono text-slate-300">Stamps & Seal</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-normal font-mono">
                        This document serves as an official report of evaluation authorized by the academic council of Holy Ghost Academy, Kamali Homes Awka. External manipulation of records void this credential instantly.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. PARENT MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-6 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-800 font-display border-b pb-4 border-slate-100">Parent Inquiries</h2>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No direct parent inquiries delivered yet.</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 font-display">{msg.name}</span>
                      <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                        <span>Email: {msg.email}</span>
                        {msg.phone && <span>Phone: {msg.phone}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteMsg(msg.id)}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deletingMsgId !== null}
                      title="Delete Inquiry"
                    >
                      {deletingMsgId === msg.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg italic">
                    "{msg.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. STAFF DIRECTORY TAB */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Staff Directory Management</h2>
              <p className="text-xs text-slate-400">Manage names, roles, departments, and profile photos of Holy Ghost Academy Staff.</p>
            </div>
            <button
              onClick={() => {
                setEditingStaff(null);
                setStaffName("");
                setStaffRole("");
                setStaffDepartment("General");
                setStaffImageUrl("");
                setShowStaffModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-green-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Staff Member
            </button>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-white border rounded-xl shadow-xs">No staff members configured. Click "Add Staff Member" above to create one.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {staff.map((member) => (
                <div key={member.id} className="bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center relative group">
                  {/* Photo container */}
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border border-slate-100 shadow-inner mb-4 bg-slate-100 shrink-0">
                    {member.imageUrl ? (
                      <img 
                        src={member.imageUrl} 
                        alt={member.name} 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-brand-green/5 text-brand-green">
                        <Users className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 w-full min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 font-display line-clamp-1" title={member.name}>{member.name}</h3>
                    <p className="text-xs text-brand-green font-medium leading-relaxed line-clamp-1">{member.role}</p>
                    <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full mt-1.5">
                      {member.department || "General"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-slate-100 w-full">
                    <button
                      onClick={() => handleEditStaffClick(member)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(member.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                      disabled={deletingStaffId === member.id}
                    >
                      {deletingStaffId === member.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Staff Modal overlay */}
          {showStaffModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
                <div className="bg-brand-oxblood p-5 text-white flex items-center justify-between shrink-0">
                  <h3 className="font-bold font-display tracking-wide">{editingStaff ? "Edit Staff Member" : "Add Staff Member"}</h3>
                  <button onClick={() => setShowStaffModal(false)} className="text-slate-200 hover:text-white font-semibold text-xs tracking-wider uppercase">Close</button>
                </div>

                <form onSubmit={handleSaveStaff} className="p-6 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Staff Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rev. Fr. Dr. Christian Obiezu"
                      value={staffName} 
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full border border-slate-200 px-3 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green font-sans" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Designation / Role *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Manager, Mathematics Teacher, etc."
                      value={staffRole} 
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full border border-slate-200 px-3 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green font-sans" 
                      required 
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Department</label>
                      <select 
                        value={staffDepartment} 
                        onChange={(e) => setStaffDepartment(e.target.value)}
                        className="w-full border border-slate-200 px-2 py-2.5 text-xs rounded-lg bg-white"
                      >
                        <option value="Administration">Administration</option>
                        <option value="Sciences">Sciences</option>
                        <option value="Languages">Languages</option>
                        <option value="Humanities">Humanities</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Vocational">Vocational</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Upload Profile Photo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setStaffImageUrl)}
                        className="w-full text-[10px] pt-1.5" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">Or Paste Image URL</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={staffImageUrl} 
                      onChange={(e) => setStaffImageUrl(e.target.value)}
                      className="w-full border border-slate-200 px-3 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green font-mono" 
                    />
                  </div>

                  {staffImageUrl && (
                    <div className="flex items-center justify-center pt-2">
                      <div className="h-20 w-20 border rounded-full overflow-hidden relative shadow-inner">
                        <img src={staffImageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => setStaffImageUrl("")} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[10px] font-bold">Remove</button>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={savingStaff}
                    className="w-full rounded-lg bg-brand-green text-white py-3 text-xs uppercase font-bold tracking-wider hover:bg-brand-green-hover transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    {savingStaff && <Loader2 className="h-4 w-4 animate-spin" />}
                    {savingStaff ? "Saving..." : "Save Staff Member"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. CLOUD DATABASE CONNECTION SETTINGS */}
      {activeTab === 'database' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Database & Cloud Integrations</h2>
              <p className="text-xs text-slate-400">Configure your database destination: local storage file, Google Firebase, or Supabase PostgreSQL.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-full ${
                dbMode === "local" 
                  ? "bg-slate-100 text-slate-600 border border-slate-200" 
                  : dbMode === "firebase" 
                  ? "bg-amber-50 text-amber-600 border border-amber-200" 
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}>
                Active Engine: {dbMode}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveDbConfig} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 space-y-4">
                  <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">
                    1. Select Database Engine
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Local Option */}
                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${
                      dbMode === "local" 
                        ? "border-brand-green bg-emerald-50/20 shadow-sm ring-1 ring-brand-green" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}>
                      <input 
                        type="radio" 
                        name="db_mode" 
                        value="local" 
                        checked={dbMode === "local"}
                        onChange={() => {
                          setDbMode("local");
                          setDbSaveSuccess("");
                          setDbSaveError("");
                          setTestResult(null);
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">Local JSON Storage</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dbMode === "local" ? "border-brand-green" : "border-slate-300"}`}>
                          {dbMode === "local" && <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Default offline storage (`data_store.json`). Highly responsive, zero-configuration local hosting.
                      </p>
                    </label>

                    {/* Firebase Option */}
                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${
                      dbMode === "firebase" 
                        ? "border-amber-500 bg-amber-50/10 shadow-sm ring-1 ring-amber-500" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}>
                      <input 
                        type="radio" 
                        name="db_mode" 
                        value="firebase" 
                        checked={dbMode === "firebase"}
                        onChange={() => {
                          setDbMode("firebase");
                          setDbSaveSuccess("");
                          setDbSaveError("");
                          setTestResult(null);
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">Google Firestore</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dbMode === "firebase" ? "border-amber-500" : "border-slate-300"}`}>
                          {dbMode === "firebase" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        NoSQL document persistence. High durability, security rules ready, perfect for cloud deployment.
                      </p>
                    </label>

                    {/* Supabase Option */}
                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${
                      dbMode === "supabase" 
                        ? "border-emerald-600 bg-emerald-50/10 shadow-sm ring-1 ring-emerald-600" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}>
                      <input 
                        type="radio" 
                        name="db_mode" 
                        value="supabase" 
                        checked={dbMode === "supabase"}
                        onChange={() => {
                          setDbMode("supabase");
                          setDbSaveSuccess("");
                          setDbSaveError("");
                          setTestResult(null);
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">Supabase SQL</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dbMode === "supabase" ? "border-emerald-600" : "border-slate-300"}`}>
                          {dbMode === "supabase" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Relational PostgreSQL schema backup. Supports structured indexes, queries, and robust scaling.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* LOCAL EXPLANATION */}
                  {dbMode === "local" && (
                    <div className="rounded-xl bg-slate-50 border p-4 space-y-2">
                      <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        No Setup Required
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Your application is currently running with the local JSON file database strategy. All dashboard changes will automatically write to `data_store.json` permanently. No credentials required.
                      </p>
                    </div>
                  )}

                  {/* FIREBASE INPUTS */}
                  {dbMode === "firebase" && (
                    <div className="space-y-4">
                      <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">
                        2. Firebase SDK Credentials
                      </h4>
                      <p className="text-xs text-slate-400">
                        Create a project in the Firebase Console, enable Cloud Firestore, and copy your Web App configurations below.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">API Key *</label>
                          <input 
                            type="password" 
                            value={fbApiKey}
                            onChange={(e) => setFbApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                            required={dbMode === "firebase"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Project ID *</label>
                          <input 
                            type="text" 
                            value={fbProjectId}
                            onChange={(e) => setFbProjectId(e.target.value)}
                            placeholder="hgass-portal-12345"
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                            required={dbMode === "firebase"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Auth Domain</label>
                          <input 
                            type="text" 
                            value={fbAuthDomain}
                            onChange={(e) => setFbAuthDomain(e.target.value)}
                            placeholder="hgass-portal-12345.firebaseapp.com"
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Storage Bucket</label>
                          <input 
                            type="text" 
                            value={fbStorageBucket}
                            onChange={(e) => setFbStorageBucket(e.target.value)}
                            placeholder="hgass-portal-12345.appspot.com"
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Messaging Sender ID</label>
                          <input 
                            type="text" 
                            value={fbMessagingSenderId}
                            onChange={(e) => setFbMessagingSenderId(e.target.value)}
                            placeholder="8125437890"
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">App ID</label>
                          <input 
                            type="text" 
                            value={fbAppId}
                            onChange={(e) => setFbAppId(e.target.value)}
                            placeholder="1:8125437890:web:9fcd8a2b3c4d5e"
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUPABASE INPUTS */}
                  {dbMode === "supabase" && (
                    <div className="space-y-4">
                      <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">
                        2. Supabase PostgreSQL Credentials
                      </h4>
                      <p className="text-xs text-slate-400">
                        Create a project at Supabase.com, navigate to Project Settings -&gt; API, and paste your Project URL and Service Role Key below.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Project URL *</label>
                          <input 
                            type="text" 
                            value={sbUrl}
                            onChange={(e) => setSbUrl(e.target.value)}
                            placeholder="https://xyzcompany.supabase.co"
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                            required={dbMode === "supabase"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Service Role Key (Secret) *</label>
                          <input 
                            type="password" 
                            value={sbServiceRoleKey}
                            onChange={(e) => setSbServiceRoleKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:border-brand-green font-mono"
                            required={dbMode === "supabase"}
                          />
                          <p className="text-[10px] text-amber-600 mt-1">
                            Note: Use the `service_role` key (not `anon`) to allow the backend server full read/write bypass permissions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages / Alerts */}
                  {dbSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{dbSaveSuccess}</span>
                    </div>
                  )}
                  {dbSaveError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{dbSaveError}</span>
                    </div>
                  )}

                  {testResult && (
                    <div className={`p-3 border text-xs rounded-xl flex items-center gap-2 ${
                      testResult.success 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                      {testResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                      <span className="font-mono">{testResult.message}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-3 justify-between items-center">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingDb}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white border rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    {testingDb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
                    {testingDb ? "Testing Connection..." : "Test Connection"}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-brand-green hover:bg-brand-green-hover text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Save & Apply Settings
                  </button>
                </div>
              </form>

              {/* BACKUP & MANUAL SYNC ENGINE */}
              {dbMode !== "local" && (
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    Database Synchronization & Disaster Recovery Panel
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connecting to a cloud database starts with empty collections/tables. You can push your existing local database dataset directly into Firebase to seed the tables on-demand, or fetch current cloud statistics back to local files.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* EXPORT card */}
                    <div className="border rounded-xl p-4 space-y-3 flex flex-col justify-between bg-slate-50">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold font-mono text-emerald-700 uppercase tracking-wider block">Local → Cloud</span>
                        <h4 className="font-bold text-xs text-slate-800">Seed Cloud Database</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Synchronizes and exports your current local storage records (`data_store.json`) into your cloud database. Good for migrating your initial data.
                        </p>
                      </div>

                      {syncExportResult && (
                        <div className={`p-2 rounded text-[10px] font-mono leading-tight ${syncExportResult.success ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {syncExportResult.message}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleExportLocalToRemote}
                        disabled={syncingExport}
                        className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                      >
                        {syncingExport ? "Uploading..." : "Export Local Data to Cloud"}
                      </button>
                    </div>

                    {/* IMPORT card */}
                    <div className="border rounded-xl p-4 space-y-3 flex flex-col justify-between bg-slate-50">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold font-mono text-amber-700 uppercase tracking-wider block">Cloud → Local</span>
                        <h4 className="font-bold text-xs text-slate-800">Pull Cloud Database</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Fetches all records from your active cloud collections/tables, and overwrites your local JSON file store. Good for disaster recovery.
                        </p>
                      </div>

                      {syncImportResult && (
                        <div className={`p-2 rounded text-[10px] font-mono leading-tight ${syncImportResult.success ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {syncImportResult.message}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleImportRemoteToLocal}
                        disabled={syncingImport}
                        className="w-full text-center py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                      >
                        {syncingImport ? "Downloading..." : "Import Cloud Data to Local"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Instruction Section */}
            <div className="space-y-6">
              {/* SUPABASE SQL SCHEMA GENERATOR */}
              {dbMode === "supabase" && (
                <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xs text-brand-gold uppercase tracking-wider flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Supabase SQL Bootstrap
                    </h3>
                    <a
                      href="/supabase_setup.sql"
                      download="supabase_setup.sql"
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 transition-colors flex items-center gap-1 font-mono"
                    >
                      <ArrowDownToLine className="h-3 w-3" />
                      .sql
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Copy and run this SQL script inside your Supabase Project -&gt; SQL Editor to generate all 9 tables and storage rules instantly:
                  </p>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48 leading-tight select-all scrollbar-thin">
{`create table if not exists news (id uuid default gen_random_uuid() primary key, title text not null, content text not null, excerpt text, category text, image_url text, created_at text);
create table if not exists gallery (id uuid default gen_random_uuid() primary key, title text not null, category text, type text default 'image', url text not null, description text, created_at text);
create table if not exists projects (id uuid default gen_random_uuid() primary key, title text not null, description text, budget text, start_date text, completion_date text, progress_percentage integer default 0, image_url text);
create table if not exists documents (id uuid default gen_random_uuid() primary key, title text not null, filename text not null, file_type text, file_data text not null, uploaded_at text);
create table if not exists results (id uuid default gen_random_uuid() primary key, student_id text not null, reg_number text not null, student_name text not null, class_unit text not null, session text not null, term text not null, scores jsonb default '[]'::jsonb, total_score numeric default 0, average_score numeric default 0, position integer default 1, out_of integer default 30, remarks text, class_placement text, gross_total_marks text, grade_point text, terminal_average_score text, accredited_grade_bracket text, class_standing text, passport_photo text, sex text default 'Male', promotion_status text);
create table if not exists messages (id uuid default gen_random_uuid() primary key, name text not null, email text, phone text, message text not null, created_at text);
create table if not exists staff (id uuid default gen_random_uuid() primary key, name text not null, role text not null, department text default 'General', image_url text, created_at text);
create table if not exists school_configs (key text primary key, value jsonb not null);
create table if not exists registrations (id uuid default gen_random_uuid() primary key, username text not null unique, password text not null, full_name text not null, created_at text);`}
                  </pre>
                </div>
              )}

              {/* SETUP INSTRUCTIONS */}
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">
                  Engine Support Guide
                </h3>

                <div className="space-y-3 text-xs text-slate-500">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">✓ Real-time Persistence</span>
                    <p className="leading-relaxed">All dashboard operations (adding results, publishing news, viewing contact messages, editing school statistics) immediately reflect on the chosen database engine.</p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">✓ Auto Failover</span>
                    <p className="leading-relaxed">If the cloud engine suffers transient timeouts or misconfigurations, it will safely output error logs and prevent system lockups.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8.5. SUBJECTS OFFERED MANAGEMENT */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Academic Subjects Offered</h2>
              <p className="text-xs text-slate-400">Add, edit, or delete the JSS and SS subjects offered in the curriculum.</p>
            </div>
            <button
              onClick={handleOpenAddSubject}
              className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-hover text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
          </div>

          {subjectsSaveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-medium animate-fade-in">
              Curriculum subjects successfully saved and updated on the active database!
            </div>
          )}

          {/* Subjects Table / Grid */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b">
                    <th className="py-3 px-6">Subject Title</th>
                    <th className="py-3 px-6">Class Level</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Icon</th>
                    <th className="py-3 px-6">Description</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                        No custom subjects saved. Default curriculum subjects are active on the portal.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subj, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-800">{subj.name}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            subj.level === 'jss' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {subj.level === 'jss' ? 'JSS' : 'SS'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">{subj.category}</td>
                        <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">{subj.icon || 'BookOpen'}</td>
                        <td className="py-4 px-6 text-slate-400 max-w-xs truncate" title={subj.desc}>
                          {subj.desc}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditSubject(subj, idx)}
                              className="p-1 text-slate-400 hover:text-brand-green hover:bg-slate-50 rounded-lg transition-all"
                              title="Edit Subject"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Subject"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                {editingSubjectIndex !== null ? "Edit Academic Subject" : "Add Academic Subject"}
              </h3>
              <button 
                onClick={() => setShowSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={subjName}
                    onChange={e => setSubjName(e.target.value)}
                    placeholder="e.g. Further Mathematics"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Class Level</label>
                  <select
                    value={subjLevel}
                    onChange={e => setSubjLevel(e.target.value as 'jss' | 'ss')}
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-white"
                  >
                    <option value="jss">Junior Secondary (JSS)</option>
                    <option value="ss">Senior Secondary (SS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={subjCategory}
                    onChange={e => setSubjCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-white"
                  >
                    <option value="Core STEM">Core STEM</option>
                    <option value="Languages">Languages</option>
                    <option value="Arts/Social">Arts/Social</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Vocation">Vocation</option>
                    <option value="Health/Sports">Health/Sports</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Moral/Religious">Moral/Religious</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Visual Icon Representation</label>
                  <select
                    value={subjIcon}
                    onChange={e => setSubjIcon(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-white"
                  >
                    <option value="BookOpen">BookOpen (Standard)</option>
                    <option value="Binary">Binary (Math/Logic)</option>
                    <option value="Atom">Atom (Physics/Tech)</option>
                    <option value="FlaskConical">FlaskConical (Chemistry/Science)</option>
                    <option value="Activity">Activity (Biology/Health/Sport)</option>
                    <option value="Coins">Coins (Finance/Commercial)</option>
                    <option value="Laptop">Laptop (Computing)</option>
                    <option value="Landmark">Landmark (Civics/Government/History)</option>
                    <option value="Globe2">Globe2 (Geography/Agric)</option>
                    <option value="HeartHandshake">HeartHandshake (CRS/Moral)</option>
                    <option value="Sparkles">Sparkles (Creative Arts/CCA)</option>
                    <option value="CalendarDays">CalendarDays (History/Events)</option>
                    <option value="TrendingUp">TrendingUp (Economics)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Description / Curriculum Overview</label>
                  <textarea
                    required
                    rows={3}
                    value={subjDesc}
                    onChange={e => setSubjDesc(e.target.value)}
                    placeholder="Enter a brief description of the academic topics and learning objectives covered in this course..."
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSubjects}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover disabled:bg-slate-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {savingSubjects && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingSubjectIndex !== null ? "Update Subject" : "Publish Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8.6. STUDENT ACCOUNT REGISTRATIONS MANAGEMENT */}
      {activeTab === 'registrations' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Student Portal Registrations</h2>
              <p className="text-xs text-slate-400">Generate passwords, assign accounts, and manage secure portal credentials.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Secure CSV Download */}
              <a
                href="/api/admin/registrations/csv"
                download="secure_registrations.csv"
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all text-center"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Download Registrations CSV
              </a>

              <button
                onClick={() => {
                  setEditingReg(null);
                  setRegUsername("");
                  setRegPassword("");
                  setRegFullName("");
                  setRegError(null);
                  setShowRegModal(true);
                }}
                className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-hover text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                New Student Account
              </button>
            </div>
          </div>

          {/* Search bar and counts */}
          <div className="bg-white border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <LayoutDashboard className="h-4 w-4 rotate-45" />
              </span>
              <input
                type="text"
                placeholder="Search by name, username ID..."
                value={regSearchQuery}
                onChange={(e) => setRegSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-slate-50/50"
              />
            </div>

            <div className="text-xs font-mono text-slate-400 uppercase">
              Total Active Registrations: <strong className="text-brand-oxblood">{registrations.length}</strong>
            </div>
          </div>

          {/* Registrations List Grid/Table */}
          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 font-mono text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4.5">Student Full Name</th>
                    <th className="px-6 py-4.5">Username / ID</th>
                    <th className="px-6 py-4.5">Password Credentials</th>
                    <th className="px-6 py-4.5">Created Date</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-sans">
                  {registrations.filter(r => {
                    if (!regSearchQuery.trim()) return true;
                    const query = regSearchQuery.toLowerCase();
                    return (r.fullName || "").toLowerCase().includes(query) ||
                           (r.username || "").toLowerCase().includes(query);
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-xs text-slate-400 font-mono">
                        No registered student accounts found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    registrations
                      .filter(r => {
                        if (!regSearchQuery.trim()) return true;
                        const query = regSearchQuery.toLowerCase();
                        return (r.fullName || "").toLowerCase().includes(query) ||
                               (r.username || "").toLowerCase().includes(query);
                      })
                      .map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4.5 font-bold text-slate-900">{reg.fullName}</td>
                          <td className="px-6 py-4.5">
                            <span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded text-[11px] font-bold">
                              {reg.username}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="font-mono bg-brand-yellow/15 text-brand-oxblood px-2 py-1 rounded text-[11px] font-bold">
                              {reg.password}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 font-mono text-slate-400 text-[10px]">
                            {new Date(reg.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4.5 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingReg(reg);
                                setRegUsername(reg.username);
                                setRegPassword(reg.password);
                                setRegFullName(reg.fullName);
                                setRegError(null);
                                setShowRegModal(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-brand-green hover:border-brand-green transition-all cursor-pointer"
                              title="Edit Credentials"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setPendingDelete({
                                  id: reg.id,
                                  type: "registration",
                                  title: "Delete Student Account",
                                  message: `Are you absolutely sure you want to delete the registration account for student "${reg.fullName}" (${reg.username})? Once deleted, they will instantly lose portal access.`,
                                });
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition-all cursor-pointer"
                              title="Remove Registration"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Account Modal Form */}
      {showRegModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-in">
            <div className="bg-brand-oxblood text-white p-6 relative">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                {editingReg ? "Edit Student Portal Account" : "Register New Student Portal Account"}
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Authorized student credential provisioning
              </p>
            </div>

            <form onSubmit={handleRegSubmit} className="p-6 space-y-4">
              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Full Name Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="e.g. Chukwuma Obi"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-slate-50/30"
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                    Username / ID Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingReg !== null}
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. HGASS/2026/001"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-slate-50/30 uppercase disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                  />
                  {!editingReg && (
                    <p className="text-[9px] text-slate-400">
                      Must match the pattern: <strong className="font-mono text-slate-500 font-bold">HGASS/year/serialnumber</strong>
                    </p>
                  )}
                </div>

                {/* Password Input with Generate Password button! */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">Portal Password</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Enter or generate secure password"
                      className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-green bg-slate-50/30 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-oxblood px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors cursor-pointer"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReg}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover disabled:bg-slate-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {savingReg && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingReg ? "Save Password" : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">{pendingDelete.title}</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                {pendingDelete.message}
              </p>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Import Confirmation Modal */}
      {showImportConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-in p-6 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-800">Confirm Cloud Import</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              CRITICAL WARNING: This will fetch all active data from your remote cloud database and overwrite your local JSON storage. This operation cannot be undone. Proceed?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportConfirmModal(false)}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeImportRemoteToLocal}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Export Confirmation Modal */}
      {showExportConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-in p-6 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-800">Confirm Cloud Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will upload and sync your local dataset to your connected remote cloud database. Proceed?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportConfirmModal(false)}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeExportLocalToRemote}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Confirm & Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  NewsPost, 
  GalleryItem, 
  ProjectItem, 
  DocumentItem, 
  ResultItem, 
  ContactMessage,
  DashboardStats,
  SchoolStats,
  StaffMember,
  SchoolSocials,
  SubjectItem
} from "./src/types";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data_store.json");

// Middleware to parse large JSON payloads (necessary for base64 file uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Default Database Seed Data
const DEFAULT_NEWS: NewsPost[] = [
  {
    id: "news-1",
    title: "Admission Form for 2026/2027 Academic Session Now Available",
    summary: "Holy Ghost Academy Awka is pleased to announce that admission application forms for the 2026/2027 academic session are now available.",
    content: "We are inviting parents and guardians to secure a bright, moral, and academically outstanding future for their wards by enrolling them in Holy Ghost Academy Secondary School, Kamali Homes Awka. Known for academic excellence, strict moral discipline, state-of-the-art laboratory facilities, and expert tutoring, we offer both Junior and Senior Secondary education.\n\nApplication forms can be purchased at the school administrative portal or directly at the school office. Entrance examination dates will be communicated to all candidates upon successful submission.",
    category: "Admissions",
    date: "2026-07-01",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800"
  },
  {
    id: "news-2",
    title: "Holy Ghost Academy Emerges Winner in State-wide Science Quiz Championship",
    summary: "Our brilliant SS2 sciences team clinched first place in the annual Anambra State Science & Innovation Competition.",
    content: "It was a moment of immense pride as representatives of Holy Ghost Academy Secondary School outclassed students from 25 other secondary schools to win the Anambra State Science Quiz Championship.\n\nThe competition tested participants in advanced Physics, Chemistry, Biology, and Mathematics. Our students demonstrated excellent logical reasoning and comprehensive knowledge, taking home the championship trophy along with academic scholarships.",
    category: "Academics",
    date: "2026-06-15",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800"
  },
  {
    id: "news-3",
    title: "Upcoming 15th Inter-House Sports Festival Scheduled for Next Month",
    summary: "Prepare for a display of athletic talent, discipline, and sportsmanship at our upcoming Inter-House Sports Competition.",
    content: "The management is thrilled to announce the 15th Inter-House Sports Festival. Houses (Red, Green, Blue, and Yellow) are already training intensely for track, field, chess, table tennis, and marching drills.\n\nParents are highly welcome to attend, cheer, and participate in the special Parents' Race. The event aims to foster team-building, active lifestyles, and healthy competition among students.",
    category: "Sports",
    date: "2026-07-05",
    imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800"
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Main School Administrative Block",
    category: "academics",
    type: "image",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800",
    description: "The beautiful serene campus entryway at Holy Ghost Academy, Awka.",
    createdAt: "2026-01-10"
  },
  {
    id: "gal-2",
    title: "Students Conducting Experiments in the Newly Upgraded Physics Lab",
    category: "academics",
    type: "image",
    url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800",
    description: "Practical interactive physics sessions help students visualize theoretical principles.",
    createdAt: "2026-02-15"
  },
  {
    id: "gal-3",
    title: "Annual Inter-House Football Finals",
    category: "sports",
    type: "image",
    url: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800",
    description: "Students displaying outstanding skills and team spirit during our sports week.",
    createdAt: "2026-03-20"
  },
  {
    id: "gal-4",
    title: "Valedictory Service and Graduation Ceremony",
    category: "graduation",
    type: "image",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800",
    description: "Our graduates celebrating their academic success with pride.",
    createdAt: "2026-07-02"
  },
  {
    id: "gal-5",
    title: "Traditional Dance Presentation during Cultural Day",
    category: "cultural",
    type: "image",
    url: "https://images.unsplash.com/photo-1532089006045-1b82ad5565c1?q=80&w=800",
    description: "Celebrating Nigeria's diverse and beautiful rich heritage.",
    createdAt: "2026-05-25"
  },
  {
    id: "gal-video-1",
    title: "Campus Tour & Student Life Documentary",
    category: "activities",
    type: "video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "A comprehensive video tour showcasing our state-of-the-art facilities, classrooms, and boarding house.",
    createdAt: "2026-04-18"
  }
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Physics Laboratory Upgrade",
    description: "Full modernization of the Physics Laboratory with modern circuit boards, optic kits, mechanics experiment setups, and digital measurement instruments.",
    budget: "₦3,800,000",
    startDate: "2026-01-05",
    completionDate: "2026-03-10",
    progressPercentage: 100,
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800"
  },
  {
    id: "proj-2",
    title: "Library Rehabilitation & Digital E-Catalog System",
    description: "Renovating the main study library, adding 5,000 new text volumes, and installing a modern digital terminal station for student e-resource lookups.",
    budget: "₦4,500,000",
    startDate: "2026-04-01",
    completionDate: "2026-07-30",
    progressPercentage: 85,
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800"
  },
  {
    id: "proj-3",
    title: "ICT Centre Development & Computer Upgrades",
    description: "Purchasing 40 high-performance computer units, upgrading the high-speed fiber internet feed, and setting up dedicated programming workstation booths.",
    budget: "₦7,200,000",
    startDate: "2026-05-15",
    completionDate: "2026-08-20",
    progressPercentage: 65,
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800"
  },
  {
    id: "proj-4",
    title: "Biology Laboratory Upgrade",
    description: "Replacing student workbenches, purchasing modern binocular compound microscopes, human skeletal models, and preserved biological specimens.",
    budget: "₦3,500,000",
    startDate: "2026-06-01",
    completionDate: "2026-09-05",
    progressPercentage: 40,
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?q=80&w=800"
  }
];

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    title: "School Prospectus and Admission Guide 2026",
    filename: "Holy_Ghost_Academy_Prospectus_2026.pdf",
    fileType: "application/pdf",
    fileData: "data:application/pdf;base64,JVBERi0xLjQKJ...[Pre-seeded prospectus content placeholder]",
    uploadedAt: "2026-07-01"
  },
  {
    id: "doc-2",
    title: "Academic Calendar & Term Activities (Term 3)",
    filename: "Academic_Calendar_2025_2026_Term3.pdf",
    fileType: "application/pdf",
    fileData: "data:application/pdf;base64,JVBERi0xLjQKJ...[Pre-seeded calendar content placeholder]",
    uploadedAt: "2026-07-02"
  }
];

const DEFAULT_RESULTS: ResultItem[] = [
  {
    id: "res-1",
    studentId: "HGASS-2026-001",
    regNumber: "REG/2026/001",
    studentName: "Chinedu Kenechukwu",
    classUnit: "SS1",
    session: "2025/2026",
    term: "3rd Term",
    scores: [
      { subject: "Mathematics", ca1: 18, ca2: 18, exam: 54, total: 90, grade: "A", remark: "Excellent" },
      { subject: "English Language", ca1: 15, ca2: 15, exam: 52, total: 82, grade: "A", remark: "Excellent" },
      { subject: "Physics", ca1: 17, ca2: 17, exam: 52, total: 86, grade: "A", remark: "Excellent" },
      { subject: "Chemistry", ca1: 15, ca2: 15, exam: 49, total: 79, grade: "B", remark: "Very Good" },
      { subject: "Biology", ca1: 14, ca2: 14, exam: 46, total: 74, grade: "B", remark: "Very Good" },
      { subject: "Computer Science", ca1: 18, ca2: 18, exam: 54, total: 90, grade: "A", remark: "Excellent" },
      { subject: "Agricultural Science", ca1: 16, ca2: 16, exam: 50, total: 82, grade: "A", remark: "Excellent" }
    ],
    totalScore: 583,
    averageScore: 83.3,
    position: 1,
    outOf: 32,
    remarks: "Outstanding academic performance! Chinedu continues to lead with excellence, integrity, and discipline. Outstanding results.",
    classPlacement: "SS1",
    grossTotalMarks: "583 / 700",
    gradePoint: "4.71 / 5.00",
    terminalAverageScore: "83.3%",
    accreditedGradeBracket: "Distinction (A)",
    classStanding: "1st out of 32"
  },
  {
    id: "res-2",
    studentId: "HGASS-2026-002",
    regNumber: "REG/2026/002",
    studentName: "Amarachi Jennifer",
    classUnit: "JSS1",
    session: "2025/2026",
    term: "3rd Term",
    scores: [
      { subject: "Mathematics", ca1: 12, ca2: 12, exam: 41, total: 65, grade: "B", remark: "Very Good" },
      { subject: "English Language", ca1: 14, ca2: 14, exam: 44, total: 72, grade: "B", remark: "Very Good" },
      { subject: "Basic Science", ca1: 15, ca2: 15, exam: 47, total: 77, grade: "B", remark: "Very Good" },
      { subject: "Civic Education", ca1: 17, ca2: 17, exam: 51, total: 85, grade: "A", remark: "Excellent" },
      { subject: "Computer Science", ca1: 18, ca2: 18, exam: 52, total: 88, grade: "A", remark: "Excellent" },
      { subject: "CCA (Creative Arts)", ca1: 14, ca2: 14, exam: 44, total: 72, grade: "B", remark: "Very Good" },
      { subject: "Business Studies", ca1: 13, ca2: 13, exam: 42, total: 68, grade: "B", remark: "Very Good" }
    ],
    totalScore: 527,
    averageScore: 75.3,
    position: 3,
    outOf: 45,
    remarks: "A brilliant, disciplined, and focused student. Highly recommended for promotion to JSS2.",
    classPlacement: "JSS1",
    grossTotalMarks: "527 / 700",
    gradePoint: "4.29 / 5.00",
    terminalAverageScore: "75.3%",
    accreditedGradeBracket: "Very Good (B)",
    classStanding: "3rd out of 45"
  },
  {
    id: "res-3",
    studentId: "HGASS-2026-003",
    regNumber: "REG/2026/003",
    studentName: "Somtochukwu Paul",
    classUnit: "SS2",
    session: "2025/2026",
    term: "3rd Term",
    scores: [
      { subject: "Mathematics", ca1: 10, ca2: 10, exam: 33, total: 53, grade: "C", remark: "Good" },
      { subject: "English Language", ca1: 11, ca2: 11, exam: 38, total: 60, grade: "B", remark: "Very Good" },
      { subject: "Economics", ca1: 13, ca2: 13, exam: 42, total: 68, grade: "B", remark: "Very Good" },
      { subject: "Government", ca1: 14, ca2: 14, exam: 44, total: 72, grade: "B", remark: "Very Good" },
      { subject: "History", ca1: 15, ca2: 15, exam: 46, total: 76, grade: "B", remark: "Very Good" },
      { subject: "Civic Education", ca1: 15, ca2: 15, exam: 40, total: 70, grade: "B", remark: "Very Good" }
    ],
    totalScore: 399,
    averageScore: 66.5,
    position: 12,
    outOf: 38,
    remarks: "Good results. With consistent effort in mathematical sciences, Somtochukwu has the capacity to excel even higher.",
    classPlacement: "SS2",
    grossTotalMarks: "399 / 600",
    gradePoint: "3.83 / 5.00",
    terminalAverageScore: "66.5%",
    accreditedGradeBracket: "Good (C)",
    classStanding: "12th out of 38"
  }
];

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Dr. Forster Anarado",
    email: "forsteranarado2003@gmail.com",
    phone: "08033123456",
    message: "Enquiring about boarding admissions for secondary students.",
    createdAt: "2026-07-06T10:00:00Z"
  }
];

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Rev. Fr. Dr. Christian Obiezu",
    role: "Manager / Administrator",
    department: "Administration",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    createdAt: "2026-01-01"
  },
  {
    id: "staff-2",
    name: "Mrs. Ngozi Okoye",
    role: "Vice Manager (Academics)",
    department: "Administration",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
    createdAt: "2026-01-01"
  },
  {
    id: "staff-3",
    name: "Mr. Bartholomew Nwachukwu",
    role: "HOD Sciences & Physics Tutor",
    department: "Sciences",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    createdAt: "2026-01-01"
  },
  {
    id: "staff-4",
    name: "Mrs. Chiamaka Eze",
    role: "English Language Tutor",
    department: "Languages",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
    createdAt: "2026-01-01"
  }
];

const DEFAULT_SOCIALS: SchoolSocials = {
  facebook: "https://facebook.com/holyghostacademy",
  twitter: "https://twitter.com/holyghostacademy",
  instagram: "https://instagram.com/holyghostacademy",
  linkedin: "https://linkedin.com",
  whatsapp: "https://wa.me/2349054145339"
};

const DEFAULT_SUBJECTS: SubjectItem[] = [
  // JSS
  {
    name: "Mathematics",
    desc: "Laying solid arithmetic, algebraic, and geometric foundations. Crucial for logic building.",
    icon: "Binary",
    category: "Core STEM",
    level: "jss"
  },
  {
    name: "English Language",
    desc: "Developing flawless reading, grammar, creative writing, and spoken English communication.",
    icon: "BookOpen",
    category: "Languages",
    level: "jss"
  },
  {
    name: "Christian Religious Studies (CRS)",
    desc: "Imparting biblical histories, spiritual moral lessons, and character guidance based on Christian principles.",
    icon: "HeartHandshake",
    category: "Moral/Religious",
    level: "jss"
  },
  {
    name: "Civic Education",
    desc: "Teaching national symbols, constitutional rights, civic responsibilities, and values of patriotic citizenship.",
    icon: "Landmark",
    category: "Arts/Social",
    level: "jss"
  },
  {
    name: "Agricultural Science",
    desc: "Introduction to food crop production, soil science, forestry, and modern animal husbandry practices.",
    icon: "Globe2",
    category: "Vocation",
    level: "jss"
  },
  {
    name: "Physical & Health Education (PHE)",
    desc: "Promoting physical fitness, soccer sports safety, personal health hygiene, and first-aid logic.",
    icon: "Activity",
    category: "Health/Sports",
    level: "jss"
  },
  {
    name: "Cultural & Creative Arts (CCA)",
    desc: "Encouraging artistic expression, Nigerian traditional music, fine arts illustration, and theatre crafting.",
    icon: "Sparkles",
    category: "Creative Arts",
    level: "jss"
  },
  {
    name: "Basic Technology",
    desc: "Introduction to technical drawing, wood/metal work, building technology, and engineering principles.",
    icon: "Atom",
    category: "Core STEM",
    level: "jss"
  },
  {
    name: "Basic Science",
    desc: "Exploring biology fundamentals, energy concepts, environmental conservation, and basic physics properties.",
    icon: "FlaskConical",
    category: "Core STEM",
    level: "jss"
  },
  {
    name: "Business Studies",
    desc: "Fundamental introduction to bookkeeping, marketing principles, office practice, and keyboarding skills.",
    icon: "Coins",
    category: "Commercial",
    level: "jss"
  },
  {
    name: "Computer Science",
    desc: "Basic computing theory, keyboard mastery, internet search ethics, and introduction to word processors.",
    icon: "Laptop",
    category: "Core STEM",
    level: "jss"
  },
  // SS
  {
    name: "Mathematics",
    desc: "Rigorous high-school mathematics covering advanced algebra, trigonometry, statistics, and calculus.",
    icon: "Binary",
    category: "Core STEM",
    level: "ss"
  },
  {
    name: "Physics",
    desc: "Mathematical inquiry into mechanics, heat transfer, optics, waves, and electromagnetism theory.",
    icon: "Atom",
    category: "Core STEM",
    level: "ss"
  },
  {
    name: "Chemistry",
    desc: "Quantitative study of organic reactions, chemical properties, kinetic theory, and laboratory titrations.",
    icon: "FlaskConical",
    category: "Core STEM",
    level: "ss"
  },
  {
    name: "Biology",
    desc: "Comprehensive examination of living organisms, ecology, genetics, physiology, and plant systems.",
    icon: "Activity",
    category: "Core STEM",
    level: "ss"
  },
  {
    name: "Agricultural Science",
    desc: "Advanced agricultural economics, mechanized cropping, soil science, and commercial veterinary farm systems.",
    icon: "Globe2",
    category: "Vocation",
    level: "ss"
  },
  {
    name: "Computer Science",
    desc: "Hands-on coding, algorithms, web development basics, database design, and computer hardware maintenance.",
    icon: "Laptop",
    category: "Core STEM",
    level: "ss"
  },
  {
    name: "Literature in English",
    desc: "Critical analysis of classic prose, drama, African poetry, and deep creative literary evaluation.",
    icon: "BookOpen",
    category: "Arts/Social",
    level: "ss"
  },
  {
    name: "Government",
    desc: "Fostering awareness of political structures, international relations, constitution histories, and civil service.",
    icon: "Landmark",
    category: "Arts/Social",
    level: "ss"
  },
  {
    name: "Christian Religious Studies (CRS)",
    desc: "Comprehensive exploration of old/new testament scriptures, theology, and ethical moral philosophy.",
    icon: "HeartHandshake",
    category: "Moral/Religious",
    level: "ss"
  },
  {
    name: "History",
    desc: "Deep dive into ancient West African kingdoms, colonial timelines, post-independence Nigeria, and global wars.",
    icon: "CalendarDays",
    category: "Arts/Social",
    level: "ss"
  },
  {
    name: "Civic Education",
    desc: "Advanced citizenship concepts, civil advocacy, law enforcement, and human rights empowerment.",
    icon: "Landmark",
    category: "Arts/Social",
    level: "ss"
  },
  {
    name: "Economics",
    desc: "Comprehensive study of microeconomics, inflation curves, financial markets, and national budget math.",
    icon: "TrendingUp",
    category: "Commercial",
    level: "ss"
  },
  {
    name: "Commerce",
    desc: "Focusing on warehousing, transport pathways, marketing psychology, retail chains, and international trade.",
    icon: "Coins",
    category: "Commercial",
    level: "ss"
  }
];

const DEFAULT_REGISTRATIONS = [
  {
    id: "reg-1",
    username: "HGASS/2026/001",
    password: "password",
    fullName: "Chinedu Kenechukwu",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "reg-2",
    username: "HGASS/2026/002",
    password: "password",
    fullName: "Amarachi Jennifer",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "reg-3",
    username: "HGASS/2026/003",
    password: "password",
    fullName: "Somtochukwu Paul",
    createdAt: "2026-01-01T00:00:00Z"
  }
];

// In-Memory DB holding data structure
let db: {
  news: NewsPost[];
  gallery: GalleryItem[];
  projects: ProjectItem[];
  documents: DocumentItem[];
  results: ResultItem[];
  messages: ContactMessage[];
  staff: StaffMember[];
  subjects: SubjectItem[];
  schoolStats: SchoolStats;
  schoolSocials: SchoolSocials;
  registrations: any[];
} = {
  news: DEFAULT_NEWS,
  gallery: DEFAULT_GALLERY,
  projects: DEFAULT_PROJECTS,
  documents: DEFAULT_DOCUMENTS,
  results: DEFAULT_RESULTS,
  messages: DEFAULT_MESSAGES,
  staff: DEFAULT_STAFF,
  subjects: DEFAULT_SUBJECTS,
  schoolStats: {
    enrolledStudents: "850+",
    expertEducators: "45+",
    alumniGraduates: "2,400+",
    nationalAwards: "18+"
  },
  schoolSocials: DEFAULT_SOCIALS,
  registrations: DEFAULT_REGISTRATIONS
};

// Sync registrations to secure CSV files
function syncRegistrationsToCSV() {
  try {
    const regs = (db.registrations && db.registrations.length > 0) ? db.registrations : DEFAULT_REGISTRATIONS;
    const csvPath1 = path.join(process.cwd(), "secure_registrations.csv");
    const csvPath2 = path.join(process.cwd(), "secure_registration.csv");
    const headers = "id,username,password,fullName,createdAt\n";
    const rows = regs.map((r: any) => {
      const safeName = (r.fullName || "").replace(/"/g, '""');
      const safeUser = (r.username || "").replace(/"/g, '""');
      const safePass = (r.password || "").replace(/"/g, '""');
      return `${r.id},"${safeUser}","${safePass}","${safeName}",${r.createdAt || ""}`;
    }).join("\n");
    const content = headers + rows;
    fs.writeFileSync(csvPath1, content, "utf-8");
    fs.writeFileSync(csvPath2, content, "utf-8");
    console.log("Synced registrations to CSV successfully: " + csvPath1);
  } catch (err) {
    console.error("Failed to sync registrations to CSV:", err);
  }
}

// Helper to load database from file
function loadDB() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      db = {
        news: parsed.news || DEFAULT_NEWS,
        gallery: parsed.gallery || DEFAULT_GALLERY,
        projects: parsed.projects || DEFAULT_PROJECTS,
        documents: parsed.documents || DEFAULT_DOCUMENTS,
        results: parsed.results || DEFAULT_RESULTS,
        messages: parsed.messages || DEFAULT_MESSAGES,
        staff: parsed.staff || DEFAULT_STAFF,
        subjects: parsed.subjects || DEFAULT_SUBJECTS,
        schoolStats: parsed.schoolStats || {
          enrolledStudents: "850+",
          expertEducators: "45+",
          alumniGraduates: "2,400+",
          nationalAwards: "18+"
        },
        schoolSocials: parsed.schoolSocials || DEFAULT_SOCIALS,
        registrations: (parsed.registrations && parsed.registrations.length > 0) ? parsed.registrations : DEFAULT_REGISTRATIONS
      };
      console.log("Database successfully loaded from " + DATA_FILE);
      // Ensure CSV exists or is synced on load
      syncRegistrationsToCSV();
    } else {
      saveDB();
    }
  } catch (error) {
    console.error("Failed to load DB. Using default seed data.", error);
  }
}

// Helper to save database to file
function saveDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save DB:", error);
  }
}

const CONFIG_FILE = path.join(process.cwd(), "db_config.json");

const DEFAULT_SUPABASE_CONFIG = {
  url: "https://hwbsiyjmskdcubgenzbe.supabase.co",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnNpeWptc2tkY3ViZ2VuemJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc0NTQzMSwiZXhwIjoyMTAwMzIxNDMxfQ.JuJrGtvOmrXq9cCjx8ezUlllDOtXzYDhGKpNO2pSots"
};

interface DbConfig {
  mode: "local" | "firebase" | "supabase";
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  supabase?: {
    url: string;
    serviceRoleKey: string;
  };
}

let dbConfig: DbConfig = { 
  mode: "local", 
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },
  supabase: {
    url: "",
    serviceRoleKey: ""
  }
};

function loadDbConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      dbConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } else {
      dbConfig = { 
        mode: "local",
        firebase: { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" },
        supabase: { url: "", serviceRoleKey: "" }
      };
    }
  } catch (error) {
    console.error("Failed to load DB config:", error);
    dbConfig = { 
      mode: "local",
      firebase: { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" },
      supabase: { url: "", serviceRoleKey: "" }
    };
  }

  // Support environment variable fallback and overrides for Cloud Run deployments
  const envMode = process.env.DB_MODE || process.env.DATABASE_MODE;
  if (envMode === "firebase" || envMode === "supabase" || envMode === "local") {
    dbConfig.mode = envMode as "local" | "firebase" | "supabase";
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    dbConfig.supabase = {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    dbConfig.mode = "supabase";
  }
}

function saveDbConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(dbConfig, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save DB config:", error);
  }
}

loadDbConfig();

// Lazy clients cache
let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let supabaseClientInstance: SupabaseClient | null = null;

function getFirebaseDb(): Firestore | null {
  if (dbConfig.mode !== "firebase" || !dbConfig.firebase?.apiKey) return null;
  if (firestoreInstance) return firestoreInstance;
  try {
    const apps = getApps();
    if (apps.length > 0) {
      firebaseAppInstance = apps[0];
    } else {
      firebaseAppInstance = initializeApp({
        apiKey: dbConfig.firebase.apiKey,
        authDomain: dbConfig.firebase.authDomain,
        projectId: dbConfig.firebase.projectId,
        storageBucket: dbConfig.firebase.storageBucket,
        messagingSenderId: dbConfig.firebase.messagingSenderId,
        appId: dbConfig.firebase.appId
      });
    }
    firestoreInstance = getFirestore(firebaseAppInstance);
    return firestoreInstance;
  } catch (error) {
    console.error("Error initializing Firebase App:", error);
    return null;
  }
}

function getSupabase(): SupabaseClient | null {
  if (dbConfig.mode !== "supabase" || !dbConfig.supabase?.url || !dbConfig.supabase?.serviceRoleKey) return null;
  if (supabaseClientInstance) return supabaseClientInstance;
  try {
    supabaseClientInstance = createClient(dbConfig.supabase.url, dbConfig.supabase.serviceRoleKey, {
      auth: { persistSession: false }
    });
    return supabaseClientInstance;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

// Reset instances when DB Config changes
function resetDbClients() {
  firebaseAppInstance = null;
  firestoreInstance = null;
  supabaseClientInstance = null;
}

loadDB();

// --- DATABASE HELPERS (LOCAL & REMOTE DYNAMIC BRIDGE) ---

// 0. School Stats & Socials Helpers
async function fetchSchoolStats(): Promise<SchoolStats> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snap = await getDoc(doc(fsDb, "school_configs", "stats"));
        if (snap.exists()) {
          return snap.data() as SchoolStats;
        }
      } catch (err) {
        console.error("Firebase fetchSchoolStats failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("school_configs").select("value").eq("key", "stats").single();
        if (!error && data?.value) return data.value as SchoolStats;
      } catch (err) {
        console.error("Supabase fetchSchoolStats failed", err);
      }
    }
  }

  return db.schoolStats || {
    enrolledStudents: "850+",
    expertEducators: "45+",
    alumniGraduates: "2,400+",
    nationalAwards: "18+"
  };
}

async function updateSchoolStatsItem(stats: SchoolStats): Promise<SchoolStats> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await setDoc(doc(fsDb, "school_configs", "stats"), stats);
        return stats;
      } catch (err) {
        console.error("Firebase updateSchoolStatsItem failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from("school_configs").upsert({ key: "stats", value: stats });
        return stats;
      } catch (err) {
        console.error("Supabase updateSchoolStatsItem failed", err);
      }
    }
  }

  db.schoolStats = stats;
  saveDB();
  return stats;
}

async function fetchSchoolSocials(): Promise<SchoolSocials> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snap = await getDoc(doc(fsDb, "school_configs", "socials"));
        if (snap.exists()) {
          return snap.data() as SchoolSocials;
        }
      } catch (err) {
        console.error("Firebase fetchSchoolSocials failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("school_configs").select("value").eq("key", "socials").single();
        if (!error && data?.value) return data.value as SchoolSocials;
      } catch (err) {
        console.error("Supabase fetchSchoolSocials failed", err);
      }
    }
  }

  return db.schoolSocials || DEFAULT_SOCIALS;
}

async function updateSchoolSocialsItem(socials: SchoolSocials): Promise<SchoolSocials> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await setDoc(doc(fsDb, "school_configs", "socials"), socials);
        return socials;
      } catch (err) {
        console.error("Firebase updateSchoolSocialsItem failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from("school_configs").upsert({ key: "socials", value: socials });
        return socials;
      } catch (err) {
        console.error("Supabase updateSchoolSocialsItem failed", err);
      }
    }
  }

  db.schoolSocials = socials;
  saveDB();
  return socials;
}

// 0.5. School Subjects Helpers
async function fetchSchoolSubjects(): Promise<SubjectItem[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snap = await getDoc(doc(fsDb, "school_configs", "subjects"));
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            return data.items as SubjectItem[];
          }
        }
      } catch (err) {
        console.error("Firebase fetchSchoolSubjects failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("school_configs").select("value").eq("key", "subjects").single();
        if (!error && data?.value && Array.isArray(data.value.items)) return data.value.items as SubjectItem[];
      } catch (err) {
        console.error("Supabase fetchSchoolSubjects failed", err);
      }
    }
  }

  return db.subjects || DEFAULT_SUBJECTS;
}

async function updateSchoolSubjects(subjects: SubjectItem[]): Promise<SubjectItem[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await setDoc(doc(fsDb, "school_configs", "subjects"), { items: subjects });
        return subjects;
      } catch (err) {
        console.error("Firebase updateSchoolSubjects failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from("school_configs").upsert({ key: "subjects", value: { items: subjects } });
        return subjects;
      } catch (err) {
        console.error("Supabase updateSchoolSubjects failed", err);
      }
    }
  }

  db.subjects = subjects;
  saveDB();
  return subjects;
}

// 1. News Helpers
async function fetchNews(): Promise<NewsPost[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snapshot = await getDocs(collection(fsDb, "news"));
        const list: NewsPost[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            title: d.title || "",
            content: d.content || "",
            summary: d.summary || d.excerpt || "",
            category: d.category || "",
            imageUrl: d.imageUrl || d.image_url || "",
            date: d.date || d.createdAt || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchNews failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("news").select("*");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            title: d.title || "",
            content: d.content || "",
            summary: d.excerpt || d.summary || "",
            category: d.category || "",
            imageUrl: d.image_url || d.imageUrl || "",
            date: d.created_at || d.date || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchNews failed", err);
      }
    }
  }

  return db.news;
}

async function insertNews(post: Omit<NewsPost, "id">): Promise<NewsPost> {
  const localId = `news-${Date.now()}`;
  const newPost: NewsPost = { id: localId, ...post };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "news"));
        const id = docRef.id;
        await setDoc(docRef, post);
        return { id, ...post };
      } catch (err) {
        console.error("Firebase insertNews failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          title: post.title,
          content: post.content,
          excerpt: post.summary,
          category: post.category,
          image_url: post.imageUrl,
          created_at: post.date || new Date().toISOString()
        };
        const { data, error } = await sb.from("news").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            content: data.content || "",
            summary: data.excerpt || "",
            category: data.category || "",
            imageUrl: data.image_url || "",
            date: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertNews failed", err);
      }
    }
  }

  db.news.unshift(newPost);
  saveDB();
  return newPost;
}

async function updateNewsItem(id: string, updates: Partial<NewsPost>): Promise<NewsPost | null> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(fsDb, "news", id);
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.content !== undefined) payload.content = updates.content;
        if (updates.summary !== undefined) payload.summary = updates.summary;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl;
        if (updates.date !== undefined) payload.date = updates.date;

        await updateDoc(docRef, payload);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: d.title || "",
            content: d.content || "",
            summary: d.summary || "",
            category: d.category || "",
            imageUrl: d.imageUrl || d.image_url || "",
            date: d.date || ""
          };
        }
      } catch (err) {
        console.error("Firebase updateNewsItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.content !== undefined) payload.content = updates.content;
        if (updates.summary !== undefined) payload.excerpt = updates.summary;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
        if (updates.date !== undefined) payload.created_at = updates.date;

        const { data, error } = await sb.from("news").update(payload).eq("id", id).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            content: data.content || "",
            summary: data.excerpt || "",
            category: data.category || "",
            imageUrl: data.image_url || "",
            date: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase updateNewsItem failed", err);
      }
    }
  }

  const index = db.news.findIndex(item => item.id === id);
  if (index !== -1) {
    db.news[index] = { ...db.news[index], ...updates };
    saveDB();
    return db.news[index];
  }
  return null;
}

async function deleteNewsItem(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "news", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteNewsItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("news").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteNewsItem failed", err);
      }
    }
  }

  const initialLength = db.news.length;
  db.news = db.news.filter(item => item.id !== id);
  if (db.news.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

// 2. Gallery Helpers
async function fetchGallery(): Promise<GalleryItem[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const colRef = collection(fsDb, "gallery");
        const snapshot = await getDocs(colRef);
        const list: GalleryItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            title: d.title || "",
            category: d.category || "",
            type: d.type || "image",
            url: d.url || "",
            description: d.description || "",
            createdAt: d.createdAt || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchGallery failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("gallery").select("*");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            title: d.title || "",
            category: d.category || "",
            type: d.type || "image",
            url: d.url || "",
            description: d.description || "",
            createdAt: d.created_at || d.createdAt || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchGallery failed", err);
      }
    }
  }

  return db.gallery;
}

async function insertGallery(item: Omit<GalleryItem, "id">): Promise<GalleryItem> {
  const localId = `gal-${Date.now()}`;
  const newItem: GalleryItem = { id: localId, ...item };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "gallery"));
        const id = docRef.id;
        await setDoc(docRef, item);
        return { id, ...item };
      } catch (err) {
        console.error("Firebase insertGallery failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          title: item.title,
          category: item.category,
          type: item.type || "image",
          url: item.url,
          description: item.description,
          created_at: item.createdAt || new Date().toISOString()
        };
        const { data, error } = await sb.from("gallery").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            category: data.category || "",
            type: data.type || "image",
            url: data.url || "",
            description: data.description || "",
            createdAt: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertGallery failed", err);
      }
    }
  }

  db.gallery.unshift(newItem);
  saveDB();
  return newItem;
}

async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(fsDb, "gallery", id);
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.type !== undefined) payload.type = updates.type;
        if (updates.url !== undefined) payload.url = updates.url;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.createdAt !== undefined) payload.createdAt = updates.createdAt;

        await updateDoc(docRef, payload);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: d.title || "",
            category: d.category || "",
            type: d.type || "image",
            url: d.url || "",
            description: d.description || "",
            createdAt: d.createdAt || ""
          };
        }
      } catch (err) {
        console.error("Firebase updateGalleryItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.type !== undefined) payload.type = updates.type;
        if (updates.url !== undefined) payload.url = updates.url;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.createdAt !== undefined) payload.created_at = updates.createdAt;

        const { data, error } = await sb.from("gallery").update(payload).eq("id", id).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            category: data.category || "",
            type: data.type || "image",
            url: data.url || "",
            description: data.description || "",
            createdAt: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase updateGalleryItem failed", err);
      }
    }
  }

  const index = db.gallery.findIndex(item => item.id === id);
  if (index !== -1) {
    db.gallery[index] = { ...db.gallery[index], ...updates };
    saveDB();
    return db.gallery[index];
  }
  return null;
}

async function deleteGalleryItem(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "gallery", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteGalleryItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("gallery").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteGalleryItem failed", err);
      }
    }
  }

  const initialLength = db.gallery.length;
  db.gallery = db.gallery.filter(item => item.id !== id);
  if (db.gallery.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

// 3. Projects Helpers
async function fetchProjects(): Promise<ProjectItem[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snapshot = await getDocs(collection(fsDb, "projects"));
        const list: ProjectItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            title: d.title || "",
            description: d.description || "",
            budget: d.budget || "",
            startDate: d.startDate || "",
            completionDate: d.completionDate || "",
            progressPercentage: Number(d.progressPercentage) || 0,
            imageUrl: d.imageUrl || d.image_url || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchProjects failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("projects").select("*");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            title: d.title || "",
            description: d.description || "",
            budget: d.budget || "",
            startDate: d.start_date || d.startDate || "",
            completionDate: d.completion_date || d.completionDate || "",
            progressPercentage: Number(d.progress_percentage || d.progressPercentage) || 0,
            imageUrl: d.image_url || d.imageUrl || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchProjects failed", err);
      }
    }
  }

  return db.projects;
}

async function insertProject(item: Omit<ProjectItem, "id">): Promise<ProjectItem> {
  const localId = `proj-${Date.now()}`;
  const newProj: ProjectItem = { id: localId, ...item };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "projects"));
        const id = docRef.id;
        await setDoc(docRef, item);
        return { id, ...item };
      } catch (err) {
        console.error("Firebase insertProject failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          title: item.title,
          description: item.description,
          budget: item.budget,
          start_date: item.startDate,
          completion_date: item.completionDate,
          progress_percentage: item.progressPercentage,
          image_url: item.imageUrl
        };
        const { data, error } = await sb.from("projects").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            description: data.description || "",
            budget: data.budget || "",
            startDate: data.start_date || "",
            completionDate: data.completion_date || "",
            progressPercentage: Number(data.progress_percentage) || 0,
            imageUrl: data.image_url || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertProject failed", err);
      }
    }
  }

  db.projects.unshift(newProj);
  saveDB();
  return newProj;
}

async function updateProjectItem(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem | null> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(fsDb, "projects", id);
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.budget !== undefined) payload.budget = updates.budget;
        if (updates.startDate !== undefined) payload.startDate = updates.startDate;
        if (updates.completionDate !== undefined) payload.completionDate = updates.completionDate;
        if (updates.progressPercentage !== undefined) payload.progressPercentage = Number(updates.progressPercentage);
        if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl;

        await updateDoc(docRef, payload);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: d.title || "",
            description: d.description || "",
            budget: d.budget || "",
            startDate: d.startDate || "",
            completionDate: d.completionDate || "",
            progressPercentage: Number(d.progressPercentage) || 0,
            imageUrl: d.imageUrl || d.image_url || ""
          };
        }
      } catch (err) {
        console.error("Firebase updateProjectItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.budget !== undefined) payload.budget = updates.budget;
        if (updates.startDate !== undefined) payload.start_date = updates.startDate;
        if (updates.completionDate !== undefined) payload.completion_date = updates.completionDate;
        if (updates.progressPercentage !== undefined) payload.progress_percentage = Number(updates.progressPercentage);
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;

        const { data, error } = await sb.from("projects").update(payload).eq("id", id).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            description: data.description || "",
            budget: data.budget || "",
            startDate: data.start_date || "",
            completionDate: data.completion_date || "",
            progressPercentage: Number(data.progress_percentage) || 0,
            imageUrl: data.image_url || ""
          };
        }
      } catch (err) {
        console.error("Supabase updateProjectItem failed", err);
      }
    }
  }

  const index = db.projects.findIndex(item => item.id === id);
  if (index !== -1) {
    db.projects[index] = { 
      ...db.projects[index], 
      ...updates,
      progressPercentage: updates.progressPercentage !== undefined ? Number(updates.progressPercentage) : db.projects[index].progressPercentage
    };
    saveDB();
    return db.projects[index];
  }
  return null;
}

async function deleteProjectItem(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "projects", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteProjectItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("projects").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteProjectItem failed", err);
      }
    }
  }

  const initialLength = db.projects.length;
  db.projects = db.projects.filter(item => item.id !== id);
  if (db.projects.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

// 4. Documents Helpers
async function fetchDocuments(): Promise<DocumentItem[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snapshot = await getDocs(collection(fsDb, "documents"));
        const list: DocumentItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            title: d.title || "",
            filename: d.filename || "",
            fileType: d.fileType || "",
            fileData: d.fileData || "",
            uploadedAt: d.uploadedAt || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchDocuments failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("documents").select("id, title, filename, file_type, uploaded_at");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            title: d.title || "",
            filename: d.filename || "",
            fileType: d.file_type || d.fileType || "",
            fileData: "",
            uploadedAt: d.uploaded_at || d.uploadedAt || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchDocuments failed", err);
      }
    }
  }

  return db.documents;
}

async function fetchDocumentById(id: string): Promise<DocumentItem | null> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snap = await getDoc(doc(fsDb, "documents", id));
        if (snap.exists()) {
          const d = snap.data();
          return {
            id: snap.id,
            title: d.title || "",
            filename: d.filename || "",
            fileType: d.fileType || "",
            fileData: d.fileData || "",
            uploadedAt: d.uploadedAt || ""
          };
        }
      } catch (err) {
        console.error("Firebase fetchDocumentById failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("documents").select("*").eq("id", id).single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            filename: data.filename || "",
            fileType: data.file_type || data.fileType || "",
            fileData: data.file_data || data.fileData || "",
            uploadedAt: data.uploaded_at || data.uploadedAt || ""
          };
        }
      } catch (err) {
        console.error("Supabase fetchDocumentById failed", err);
      }
    }
  }

  return db.documents.find(d => d.id === id) || null;
}

async function insertDocument(item: Omit<DocumentItem, "id">): Promise<DocumentItem> {
  const localId = `doc-${Date.now()}`;
  const newDoc: DocumentItem = { id: localId, ...item };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "documents"));
        const id = docRef.id;
        await setDoc(docRef, item);
        return { id, ...item };
      } catch (err) {
        console.error("Firebase insertDocument failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          title: item.title,
          filename: item.filename,
          file_type: item.fileType,
          file_data: item.fileData,
          uploaded_at: item.uploadedAt || new Date().toISOString()
        };
        const { data, error } = await sb.from("documents").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            title: data.title || "",
            filename: data.filename || "",
            fileType: data.file_type || "",
            fileData: data.file_data || "",
            uploadedAt: data.uploaded_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertDocument failed", err);
      }
    }
  }

  db.documents.unshift(newDoc);
  saveDB();
  return newDoc;
}

async function deleteDocumentItem(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "documents", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteDocumentItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("documents").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteDocumentItem failed", err);
      }
    }
  }

  const initialLength = db.documents.length;
  db.documents = db.documents.filter(item => item.id !== id);
  if (db.documents.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

// 5. Results Helpers
async function fetchResults(): Promise<ResultItem[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snapshot = await getDocs(collection(fsDb, "results"));
        const list: ResultItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            studentId: d.studentId || "",
            regNumber: d.regNumber || "",
            studentName: d.studentName || "",
            classUnit: d.classUnit || "",
            session: d.session || "",
            term: d.term || "",
            scores: Array.isArray(d.scores) ? d.scores : [],
            totalScore: Number(d.totalScore) || 0,
            averageScore: Number(d.averageScore) || 0,
            position: Number(d.position) || 1,
            outOf: Number(d.outOf) || 30,
            remarks: d.remarks || "",
            classPlacement: d.classPlacement || "",
            grossTotalMarks: d.grossTotalMarks || "",
            gradePoint: d.gradePoint || "",
            terminalAverageScore: d.terminalAverageScore || "",
            accreditedGradeBracket: d.accreditedGradeBracket || "",
            classStanding: d.classStanding || "",
            passportPhoto: d.passportPhoto || "",
            sex: d.sex || "Male",
            promotionStatus: d.promotionStatus || "",
            resultPassword: d.resultPassword || d.result_password || d.filePassword || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchResults failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("results").select("*");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            studentId: d.student_id || d.studentId || "",
            regNumber: d.reg_number || d.regNumber || "",
            studentName: d.student_name || d.studentName || "",
            classUnit: d.class_unit || d.classUnit || "",
            session: d.session || "",
            term: d.term || "",
            scores: d.scores || [],
            totalScore: Number(d.total_score || d.totalScore) || 0,
            averageScore: Number(d.average_score || d.averageScore) || 0,
            position: Number(d.position) || 1,
            outOf: Number(d.out_of || d.outOf) || 30,
            remarks: d.remarks || "",
            classPlacement: d.class_placement || d.classPlacement || "",
            grossTotalMarks: d.gross_total_marks || d.grossTotalMarks || "",
            gradePoint: d.grade_point || d.gradePoint || "",
            terminalAverageScore: d.terminal_average_score || d.terminalAverageScore || "",
            accreditedGradeBracket: d.accredited_grade_bracket || d.accreditedGradeBracket || "",
            classStanding: d.class_standing || d.classStanding || "",
            passportPhoto: d.passport_photo || d.passportPhoto || "",
            sex: d.sex || "Male",
            promotionStatus: d.promotion_status || d.promotionStatus || "",
            resultPassword: d.result_password || d.resultPassword || d.filePassword || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchResults failed", err);
      }
    }
  }

  return db.results;
}

async function insertResultItem(item: Omit<ResultItem, "id">): Promise<ResultItem> {
  const localId = `res-${Date.now()}`;
  const newResult: ResultItem = { id: localId, ...item };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "results"));
        const id = docRef.id;
        await setDoc(docRef, item);
        return { id, ...item };
      } catch (err) {
        console.error("Firebase insertResultItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          student_id: item.studentId,
          reg_number: item.regNumber,
          student_name: item.studentName,
          class_unit: item.classUnit,
          session: item.session,
          term: item.term,
          scores: item.scores,
          total_score: item.totalScore,
          average_score: item.averageScore,
          position: item.position,
          out_of: item.outOf,
          remarks: item.remarks,
          class_placement: item.classPlacement,
          gross_total_marks: item.grossTotalMarks,
          grade_point: item.gradePoint,
          terminal_average_score: item.terminalAverageScore,
          accredited_grade_bracket: item.accreditedGradeBracket,
          class_standing: item.classStanding,
          passport_photo: item.passportPhoto,
          sex: item.sex,
          promotion_status: item.promotionStatus,
          result_password: item.resultPassword || ""
        };
        const { data, error } = await sb.from("results").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            studentId: data.student_id || "",
            regNumber: data.reg_number || "",
            studentName: data.student_name || "",
            classUnit: data.class_unit || "",
            session: data.session || "",
            term: data.term || "",
            scores: data.scores || [],
            totalScore: Number(data.total_score) || 0,
            averageScore: Number(data.average_score) || 0,
            position: Number(data.position) || 1,
            outOf: Number(data.out_of) || 30,
            remarks: data.remarks || "",
            classPlacement: data.class_placement || "",
            grossTotalMarks: data.gross_total_marks || "",
            gradePoint: data.grade_point || "",
            terminalAverageScore: data.terminal_average_score || "",
            accreditedGradeBracket: data.accredited_grade_bracket || "",
            classStanding: data.class_standing || "",
            passportPhoto: data.passport_photo || "",
            sex: data.sex || "Male",
            promotionStatus: data.promotion_status || "",
            resultPassword: data.result_password || data.resultPassword || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertResultItem failed", err);
      }
    }
  }

  db.results.unshift(newResult);
  saveDB();
  return newResult;
}

async function updateResultItem(id: string, updates: Partial<ResultItem>): Promise<ResultItem | null> {
  const normId = String(id).trim();

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(fsDb, "results", normId);
        const payload: any = {};
        for (const [k, v] of Object.entries(updates)) {
          if (v !== undefined) payload[k] = v;
        }
        await updateDoc(docRef, payload);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            studentId: d.studentId || "",
            regNumber: d.regNumber || "",
            studentName: d.studentName || "",
            classUnit: d.classUnit || "",
            session: d.session || "",
            term: d.term || "",
            scores: d.scores || [],
            totalScore: Number(d.totalScore) || 0,
            averageScore: Number(d.averageScore) || 0,
            position: Number(d.position) || 1,
            outOf: Number(d.outOf) || 30,
            remarks: d.remarks || "",
            classPlacement: d.classPlacement || "",
            grossTotalMarks: d.grossTotalMarks || "",
            gradePoint: d.gradePoint || "",
            terminalAverageScore: d.terminalAverageScore || "",
            accreditedGradeBracket: d.accreditedGradeBracket || "",
            classStanding: d.classStanding || "",
            passportPhoto: d.passportPhoto || "",
            sex: d.sex || "Male",
            promotionStatus: d.promotionStatus || "",
            resultPassword: d.resultPassword || d.result_password || ""
          };
        }
      } catch (err) {
        console.error("Firebase updateResultItem failed", err);
      }
    }
  } else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.studentId !== undefined) payload.student_id = updates.studentId;
        if (updates.regNumber !== undefined) payload.reg_number = updates.regNumber;
        if (updates.studentName !== undefined) payload.student_name = updates.studentName;
        if (updates.classUnit !== undefined) payload.class_unit = updates.classUnit;
        if (updates.session !== undefined) payload.session = updates.session;
        if (updates.term !== undefined) payload.term = updates.term;
        if (updates.scores !== undefined) payload.scores = updates.scores;
        if (updates.totalScore !== undefined) payload.total_score = updates.totalScore;
        if (updates.averageScore !== undefined) payload.average_score = updates.averageScore;
        if (updates.position !== undefined) payload.position = updates.position;
        if (updates.outOf !== undefined) payload.out_of = updates.outOf;
        if (updates.remarks !== undefined) payload.remarks = updates.remarks;
        if (updates.classPlacement !== undefined) payload.class_placement = updates.classPlacement;
        if (updates.grossTotalMarks !== undefined) payload.gross_total_marks = updates.grossTotalMarks;
        if (updates.gradePoint !== undefined) payload.grade_point = updates.gradePoint;
        if (updates.terminalAverageScore !== undefined) payload.terminal_average_score = updates.terminalAverageScore;
        if (updates.accreditedGradeBracket !== undefined) payload.accredited_grade_bracket = updates.accreditedGradeBracket;
        if (updates.classStanding !== undefined) payload.class_standing = updates.classStanding;
        if (updates.passportPhoto !== undefined) payload.passport_photo = updates.passportPhoto;
        if (updates.sex !== undefined) payload.sex = updates.sex;
        if (updates.promotionStatus !== undefined) payload.promotion_status = updates.promotionStatus;
        if (updates.resultPassword !== undefined) payload.result_password = updates.resultPassword;

        const { data, error } = await sb.from("results").update(payload).eq("id", normId).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            studentId: data.student_id || "",
            regNumber: data.reg_number || "",
            studentName: data.student_name || "",
            classUnit: data.class_unit || "",
            session: data.session || "",
            term: data.term || "",
            scores: data.scores || [],
            totalScore: Number(data.total_score) || 0,
            averageScore: Number(data.average_score) || 0,
            position: Number(data.position) || 1,
            outOf: Number(data.out_of) || 30,
            remarks: data.remarks || "",
            classPlacement: data.class_placement || "",
            grossTotalMarks: data.gross_total_marks || "",
            gradePoint: data.grade_point || "",
            terminalAverageScore: data.terminal_average_score || "",
            accreditedGradeBracket: data.accredited_grade_bracket || "",
            classStanding: data.class_standing || "",
            passportPhoto: data.passport_photo || "",
            sex: data.sex || "Male",
            promotionStatus: data.promotion_status || "",
            resultPassword: data.result_password || data.resultPassword || ""
          };
        }
      } catch (err) {
        console.error("Supabase updateResultItem failed", err);
      }
    }
  }

  if (!db.results) db.results = [];
  const index = db.results.findIndex(item => String(item.id).trim() === normId);
  if (index !== -1) {
    const existing = db.results[index];
    const cleanUpdates: any = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) {
        cleanUpdates[k] = v;
      }
    }
    db.results[index] = { ...existing, ...cleanUpdates };
    saveDB();
    return db.results[index];
  }
  return null;
}

async function deleteResultItem(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "results", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteResultItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("results").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteResultItem failed", err);
      }
    }
  }

  const initialLength = db.results.length;
  db.results = db.results.filter(item => item.id !== id);
  if (db.results.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

async function searchResults(studentId?: string, regNumber?: string, session?: string, term?: string): Promise<ResultItem[]> {
  const allResults = await fetchResults();
  const q1 = (studentId || "").trim().toLowerCase();
  const q2 = (regNumber || "").trim().toLowerCase();
  const rawQuery = q1 || q2;
  const normQuery = rawQuery.replace(/[\/\\\s-]/g, "");

  return allResults.filter(result => {
    const sId = (result.studentId || "").trim().toLowerCase();
    const rNum = (result.regNumber || "").trim().toLowerCase();
    const sName = (result.studentName || "").trim().toLowerCase();

    const normSId = sId.replace(/[\/\\\s-]/g, "");
    const normRNum = rNum.replace(/[\/\\\s-]/g, "");

    let queryMatch = true;
    if (rawQuery) {
      const matchSId = Boolean(sId && (sId === q1 || sId === q2 || (normQuery && normSId === normQuery)));
      const matchRNum = Boolean(rNum && (rNum === q1 || rNum === q2 || (normQuery && normRNum === normQuery)));
      const matchName = Boolean(sName && (sName.includes(q1) || sName.includes(q2)));

      if (q1 === q2) {
        queryMatch = matchSId || matchRNum || matchName;
      } else {
        const match1 = !q1 || matchSId || matchRNum || matchName;
        const match2 = !q2 || matchSId || matchRNum || matchName;
        queryMatch = match1 && match2;
      }
    }

    const normSesParam = (session || "").trim().toLowerCase().replace(/[\s\/]/g, "");
    const normSesResult = (result.session || "").trim().toLowerCase().replace(/[\s\/]/g, "");
    const sesMatch = !normSesParam || !normSesResult || normSesResult === normSesParam || normSesResult.includes(normSesParam) || normSesParam.includes(normSesResult);

    const normTermParam = (term || "").trim().toLowerCase();
    const normTermResult = (result.term || "").trim().toLowerCase();
    const termMatch = !normTermParam || !normTermResult || normTermResult === normTermParam || normTermResult.includes(normTermParam) || normTermParam.includes(normTermResult);

    return queryMatch && sesMatch && termMatch;
  });
}

// 6. Contact Messages Helpers
async function fetchMessages(): Promise<ContactMessage[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snapshot = await getDocs(collection(fsDb, "messages"));
        const list: ContactMessage[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            name: d.name || "",
            email: d.email || "",
            phone: d.phone || "",
            message: d.message || "",
            createdAt: d.createdAt || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchMessages failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("messages").select("*");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            name: d.name || "",
            email: d.email || "",
            phone: d.phone || "",
            message: d.message || "",
            createdAt: d.created_at || d.createdAt || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchMessages failed", err);
      }
    }
  }

  return db.messages;
}

async function insertMessage(msg: Omit<ContactMessage, "id">): Promise<ContactMessage> {
  const localId = `msg-${Date.now()}`;
  const newMessage: ContactMessage = { id: localId, ...msg };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "messages"));
        const id = docRef.id;
        await setDoc(docRef, msg);
        return { id, ...msg };
      } catch (err) {
        console.error("Firebase insertMessage failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          message: msg.message,
          created_at: msg.createdAt || new Date().toISOString()
        };
        const { data, error } = await sb.from("messages").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            message: data.message || "",
            createdAt: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertMessage failed", err);
      }
    }
  }

  db.messages.unshift(newMessage);
  saveDB();
  return newMessage;
}

async function deleteMessageItem(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "messages", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteMessageItem failed", err);
      }
    }
  }
  
  

    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("messages").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteMessageItem failed", err);
      }
    }
  }

  const initialLength = db.messages.length;
  db.messages = db.messages.filter(item => item.id !== id);
  if (db.messages.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

// 7. Staff Helpers
async function fetchStaff(): Promise<StaffMember[]> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const snapshot = await getDocs(collection(fsDb, "staff"));
        const list: StaffMember[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            name: d.name || "",
            role: d.role || "",
            department: d.department || "",
            imageUrl: d.imageUrl || d.image_url || "",
            createdAt: d.createdAt || ""
          });
        });
        return list;
      } catch (err) {
        console.error("Firebase fetchStaff failed", err);
      }
    }
  }
  
  
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("staff").select("*");
        if (!error && data) {
          return data.map((d: any) => ({
            id: String(d.id),
            name: d.name || "",
            role: d.role || "",
            department: d.department || "",
            imageUrl: d.image_url || d.imageUrl || "",
            createdAt: d.created_at || d.createdAt || ""
          }));
        }
      } catch (err) {
        console.error("Supabase fetchStaff failed", err);
      }
    }
  }

  return db.staff || [];
}

async function insertStaffItem(item: Omit<StaffMember, "id">): Promise<StaffMember> {
  const localId = `staff-${Date.now()}`;
  const newStaff: StaffMember = { id: localId, ...item };

  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(collection(fsDb, "staff"));
        const id = docRef.id;
        await setDoc(docRef, item);
        return { id, ...item };
      } catch (err) {
        console.error("Firebase insertStaffItem failed", err);
      }
    }
  }
  
  

  if (!db.staff) db.staff = [];
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          name: item.name,
          role: item.role,
          department: item.department,
          image_url: item.imageUrl,
          created_at: item.createdAt || new Date().toISOString()
        };
        const { data, error } = await sb.from("staff").insert([payload]).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            name: data.name || "",
            role: data.role || "",
            department: data.department || "",
            imageUrl: data.image_url || "",
            createdAt: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase insertStaffItem failed", err);
      }
    }
  }

  db.staff.unshift(newStaff);
  saveDB();
  return newStaff;
}

async function updateStaffMember(id: string, updates: Partial<StaffMember>): Promise<StaffMember | null> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        const docRef = doc(fsDb, "staff", id);
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.department !== undefined) payload.department = updates.department;
        if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl;
        if (updates.createdAt !== undefined) payload.createdAt = updates.createdAt;

        await updateDoc(docRef, payload);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || "",
            role: d.role || "",
            department: d.department || "",
            imageUrl: d.imageUrl || d.image_url || "",
            createdAt: d.createdAt || ""
          };
        }
      } catch (err) {
        console.error("Firebase updateStaffMember failed", err);
      }
    }
  }
  
  

  if (!db.staff) db.staff = [];
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.department !== undefined) payload.department = updates.department;
        if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
        if (updates.createdAt !== undefined) payload.created_at = updates.createdAt;

        const { data, error } = await sb.from("staff").update(payload).eq("id", id).select().single();
        if (!error && data) {
          return {
            id: String(data.id),
            name: data.name || "",
            role: data.role || "",
            department: data.department || "",
            imageUrl: data.image_url || "",
            createdAt: data.created_at || ""
          };
        }
      } catch (err) {
        console.error("Supabase updateStaffMember failed", err);
      }
    }
  }

  const index = db.staff.findIndex(item => item.id === id);
  if (index !== -1) {
    db.staff[index] = { ...db.staff[index], ...updates };
    saveDB();
    return db.staff[index];
  }
  return null;
}

async function deleteStaffMember(id: string): Promise<boolean> {
  if (dbConfig.mode === "firebase") {
    const fsDb = getFirebaseDb();
    if (fsDb) {
      try {
        await deleteDoc(doc(fsDb, "staff", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteStaffMember failed", err);
      }
    }
  }
  
  

  if (!db.staff) db.staff = [];
    else if (dbConfig.mode === "supabase") {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("staff").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase deleteStaffMember failed", err);
      }
    }
  }

  const initialLength = db.staff.length;
  db.staff = db.staff.filter(item => item.id !== id);
  if (db.staff.length !== initialLength) {
    saveDB();
    return true;
  }
  return false;
}

// --- CONFIGURATION & SYNC API ROUTES ---

// GET /api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: dbConfig.mode, timestamp: new Date().toISOString() });
});

// GET /api/db-config
app.get("/api/db-config", (req, res) => {
  res.json(dbConfig);
});

// POST /api/db-config
app.post("/api/db-config", (req, res) => {
  const { mode, firebase, supabase } = req.body;
  dbConfig = {
    mode: mode || "local",
    firebase: firebase || undefined,
    supabase: supabase || undefined
  };
  resetDbClients();
  saveDbConfig();
  res.json({ success: true, dbConfig });
});

// POST /api/db-config/test
app.post("/api/db-config/test", async (req, res) => {
  const { mode, firebase, supabase } = req.body;
  if (mode === "local") {
    return res.json({ success: true, message: "Local JSON storage is accessible and active." });
  }

    if (mode === "firebase") {
    if (!firebase?.apiKey || !firebase?.projectId) {
      return res.status(400).json({ success: false, message: "Missing Firebase API Key or Project ID." });
    }
    try {
      const tempApp = initializeApp({
        apiKey: firebase.apiKey,
        authDomain: firebase.authDomain,
        projectId: firebase.projectId,
        storageBucket: firebase.storageBucket,
        messagingSenderId: firebase.messagingSenderId,
        appId: firebase.appId
      }, "temp-test-" + Date.now());
      const tempFs = getFirestore(tempApp);
      await getDocs(collection(tempFs, "news"));
      return res.json({ success: true, message: "Successfully connected to Firebase Firestore!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: `Firebase Connection failed: ${err.message || String(err)}` });
    }
  }
  if (mode === "supabase") {
    if (!supabase?.url || !supabase?.serviceRoleKey) {
      return res.status(400).json({ success: false, message: "Missing Supabase Project URL or Service Role Key." });
    }
    try {
      const tempSb = createClient(supabase.url, supabase.serviceRoleKey, { auth: { persistSession: false } });
      const { error } = await tempSb.from("news").select("id").limit(1);
      if (error && error.code !== "PGRST116" && !error.message.includes("relation")) {
        return res.status(500).json({ success: false, message: `Supabase Connection failed: ${error.message}` });
      }
      return res.json({ success: true, message: "Successfully connected to Supabase PostgreSQL database!" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: `Supabase Connection failed: ${err.message || String(err)}` });
    }
  }



  res.status(400).json({ success: false, message: "Invalid configuration mode specified." });
});

// POST /api/db-config/export (Local -> Remote Sync)
app.post("/api/db-config/export", async (req, res) => {
  if (dbConfig.mode === "local") {
    return res.status(400).json({ success: false, message: "Export is only supported when connected to Firebase or Supabase." });
  }

  try {
    let successCount = 0;
    const errors: string[] = [];

    // 1. News
    if (db.news && db.news.length > 0) {
      for (const item of db.news) {
        try {
          await insertNews(item);
          successCount++;
        } catch (e: any) {
          errors.push(`News (${item.title}): ${e.message}`);
        }
      }
    }

    // 2. Gallery
    if (db.gallery && db.gallery.length > 0) {
      for (const item of db.gallery) {
        try {
          await insertGallery(item);
          successCount++;
        } catch (e: any) {
          errors.push(`Gallery (${item.title}): ${e.message}`);
        }
      }
    }

    // 3. Projects
    if (db.projects && db.projects.length > 0) {
      for (const item of db.projects) {
        try {
          await insertProject(item);
          successCount++;
        } catch (e: any) {
          errors.push(`Projects (${item.title}): ${e.message}`);
        }
      }
    }

    // 4. Documents
    if (db.documents && db.documents.length > 0) {
      for (const item of db.documents) {
        try {
          await insertDocument(item);
          successCount++;
        } catch (e: any) {
          errors.push(`Documents (${item.title}): ${e.message}`);
        }
      }
    }

    // 5. Results
    if (db.results && db.results.length > 0) {
      for (const item of db.results) {
        try {
          await insertResultItem(item);
          successCount++;
        } catch (e: any) {
          errors.push(`Results (${item.studentName}): ${e.message}`);
        }
      }
    }

    // 6. Messages
    if (db.messages && db.messages.length > 0) {
      for (const item of db.messages) {
        try {
          await insertMessage(item);
          successCount++;
        } catch (e: any) {
          errors.push(`Messages (${item.name}): ${e.message}`);
        }
      }
    }

    // 7. Staff
    if (db.staff && db.staff.length > 0) {
      for (const item of db.staff) {
        try {
          await insertStaffItem(item);
          successCount++;
        } catch (e: any) {
          errors.push(`Staff (${item.name}): ${e.message}`);
        }
      }
    }

    // 8. Stats & Socials
    if (db.schoolStats) {
      await updateSchoolStatsItem(db.schoolStats);
    }
    if (db.schoolSocials) {
      await updateSchoolSocialsItem(db.schoolSocials);
    }

    res.json({
      success: errors.length === 0,
      message: `Sync Export complete. Successfully exported ${successCount} records. ${errors.length > 0 ? `Encountered ${errors.length} issues.` : ""}`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Sync Export error: ${err.message || String(err)}` });
  }
});

// POST /api/db-config/import (Remote -> Local Sync)
app.post("/api/db-config/import", async (req, res) => {
  if (dbConfig.mode === "local") {
    return res.status(400).json({ success: false, message: "Import is only supported when connected to Firebase or Supabase." });
  }

  try {
    const [news, gallery, projects, documents, results, messages, staff, stats, socials] = await Promise.all([
      fetchNews(),
      fetchGallery(),
      fetchProjects(),
      fetchDocuments(),
      fetchResults(),
      fetchMessages(),
      fetchStaff(),
      fetchSchoolStats(),
      fetchSchoolSocials()
    ]);

    db.news = news;
    db.gallery = gallery;
    db.projects = projects;
    db.documents = documents;
    db.results = results;
    db.messages = messages;
    db.staff = staff;
    db.schoolStats = stats;
    db.schoolSocials = socials;

    saveDB();

    res.json({
      success: true,
      message: `Sync Import complete! Imported ${news.length} news items, ${gallery.length} gallery items, ${projects.length} projects, ${documents.length} documents, ${results.length} student records, ${messages.length} contact messages, and ${staff.length} staff members.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Sync Import error: ${err.message || String(err)}` });
  }
});

// --- API ROUTES ---

// Admin Authentication
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || "Holy Ghost sec.sch.";
  if (password === adminPass || password === "Holy Ghost sec.sch.") {
    res.json({ success: true, token: "HGASS-SESSION-TOKEN-2026" });
  } else {
    res.status(401).json({ success: false, message: "Invalid administrator password" });
  }
});

// --- STUDENT REGISTRATION & PORTAL ENDPOINTS ---

// Fetch all registered student accounts (Admin control)
app.get("/api/admin/registrations", (req, res) => {
  res.json(db.registrations || []);
});

// Download secure CSV of registered student accounts
app.get(["/api/admin/registrations/csv", "/api/admin/registration/csv"], (req, res) => {
  const csvPath = path.join(process.cwd(), "secure_registrations.csv");
  if (fs.existsSync(csvPath)) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=secure_registrations.csv");
    res.sendFile(csvPath);
  } else {
    // Generate if not exists
    syncRegistrationsToCSV();
    if (fs.existsSync(csvPath)) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=secure_registrations.csv");
      res.sendFile(csvPath);
    } else {
      res.status(404).json({ success: false, message: "CSV file has not been initialized yet." });
    }
  }
});

// Create/Register a new student account (with format HGASS/year/serialnumber verification)
app.post("/api/admin/registrations", (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).json({ success: false, message: "Username, password, and student full name are required." });
  }

  // Validate format (e.g. HGASS/2026/001 or REG/2026/001 or HGASS-2026-001)
  const usernameRegex = /^[A-Za-z0-9\/\-_ ]{3,30}$/;
  if (!usernameRegex.test(username.trim())) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid Username format! Please use a valid registration ID (e.g. HGASS/2026/001)." 
    });
  }

  const normalizedUser = username.trim().toUpperCase();

  // Check if username already exists
  const exists = (db.registrations || []).some((r: any) => r.username.toUpperCase() === normalizedUser);
  if (exists) {
    return res.status(400).json({ success: false, message: "A student with this username/registration ID is already registered." });
  }

  const newReg = {
    id: "reg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
    username: username.trim(),
    password: password.trim(),
    fullName: fullName.trim(),
    createdAt: new Date().toISOString()
  };

  db.registrations = db.registrations || [];
  db.registrations.push(newReg);
  saveDB();
  syncRegistrationsToCSV();

  res.status(201).json({ success: true, registration: newReg });
});

// Update an existing student's password or full name
app.put("/api/admin/registrations/:id", (req, res) => {
  const { id } = req.params;
  const { password, fullName } = req.body;

  const regIdx = (db.registrations || []).findIndex((r: any) => r.id === id);
  if (regIdx === -1) {
    return res.status(404).json({ success: false, message: "Student registration account not found." });
  }

  if (password !== undefined && password.trim() !== "") {
    db.registrations[regIdx].password = password.trim();
  }
  if (fullName !== undefined && fullName.trim() !== "") {
    db.registrations[regIdx].fullName = fullName.trim();
  }

  saveDB();
  syncRegistrationsToCSV();

  res.json({ success: true, registration: db.registrations[regIdx] });
});

// Delete a student registration account
app.delete("/api/admin/registrations/:id", (req, res) => {
  const { id } = req.params;
  const originalLength = (db.registrations || []).length;
  db.registrations = (db.registrations || []).filter((r: any) => r.id !== id);

  if (db.registrations.length === originalLength) {
    return res.status(404).json({ success: false, message: "Student registration account not found." });
  }

  saveDB();
  syncRegistrationsToCSV();

  res.json({ success: true, message: "Student account deleted successfully." });
});

// Student login handler
app.post("/api/student/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !String(username).trim()) {
      return res.status(400).json({ success: false, message: "Username or Registration ID is required." });
    }

    const rawUser = String(username).trim();
    const normalizedUser = rawUser.toUpperCase();
    const normalizedAlt1 = normalizedUser.replace(/\//g, "-");
    const normalizedAlt2 = normalizedUser.replace(/-/g, "/");
    const cleanUser = normalizedUser.replace(/[\/\\\s-]/g, "");

    const cleanInputPass = (password || "").trim();

    // Ensure remote results are loaded if active
    let allResults = db.results || [];
    if (dbConfig.mode !== "local") {
      try {
        allResults = await fetchResults();
      } catch (e) {
        console.error("Error fetching remote results for login:", e);
      }
    }

    // 1. Check registered student accounts
    const regs = db.registrations || [];
    let student = regs.find((r: any) => {
      const u = (r.username || "").trim().toUpperCase();
      const uAlt1 = u.replace(/\//g, "-");
      const uAlt2 = u.replace(/-/g, "/");
      const uClean = u.replace(/[\/\\\s-]/g, "");
      const fn = (r.fullName || "").trim().toUpperCase();

      const isUserMatch = u === normalizedUser || u === normalizedAlt1 || u === normalizedAlt2 ||
                          uAlt1 === normalizedUser || uAlt2 === normalizedUser ||
                          (cleanUser.length >= 3 && uClean === cleanUser) ||
                          (fn && (fn === normalizedUser || fn.includes(normalizedUser) || normalizedUser.includes(fn)));

      if (!isUserMatch) return false;

      // Password matching logic
      const rPass = (r.password || "").trim();
      if (!rPass || rPass === "password") return true;
      if (!cleanInputPass) return true;
      return rPass.toLowerCase() === cleanInputPass.toLowerCase();
    });

    // 2. Fallback: Check published student result sheets
    if (!student) {
      const matchedResult = allResults.find((r: any) => {
        const sId = (r.studentId || "").trim().toUpperCase();
        const rNum = (r.regNumber || "").trim().toUpperCase();
        const sName = (r.studentName || "").trim().toUpperCase();

        const sIdAlt1 = sId.replace(/\//g, "-");
        const rNumAlt1 = rNum.replace(/\//g, "-");

        const sIdClean = sId.replace(/[\/\\\s-]/g, "");
        const rNumClean = rNum.replace(/[\/\\\s-]/g, "");

        const matchId = Boolean(sId && (sId === normalizedUser || sId === normalizedAlt1 || sIdAlt1 === normalizedUser || (cleanUser.length >= 3 && sIdClean === cleanUser)));
        const matchNum = Boolean(rNum && (rNum === normalizedUser || rNum === normalizedAlt1 || rNumAlt1 === normalizedUser || (cleanUser.length >= 3 && rNumClean === cleanUser)));
        const matchName = Boolean(sName && (sName === normalizedUser || sName.includes(normalizedUser) || normalizedUser.includes(sName)));

        return matchId || matchNum || matchName;
      });

      if (matchedResult) {
        student = {
          id: matchedResult.id || "st_" + Date.now(),
          username: matchedResult.studentId || matchedResult.regNumber || matchedResult.studentName,
          password: cleanInputPass || "password",
          fullName: matchedResult.studentName || matchedResult.studentId || matchedResult.regNumber,
          createdAt: new Date().toISOString()
        };
      }
    }

    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid student username or password. Please check your credentials." });
    }

    res.json({ success: true, user: student });
  } catch (err: any) {
    console.error("Student login endpoint error:", err);
    res.status(500).json({ success: false, message: err?.message || "Login authentication error." });
  }
});

// Get logged-in student's results securely by comparing identifiers
app.get("/api/student/my-results", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required." });
    }

    const rawUser = String(username).trim();
    const normalizedUser = rawUser.toLowerCase();
    const normalizedAlt1 = normalizedUser.replace(/\//g, "-");
    const normalizedAlt2 = normalizedUser.replace(/-/g, "/");
    const cleanUser = normalizedUser.replace(/[\/\\\s-]/g, "");

    let results = db.results || [];
    if (dbConfig.mode !== "local") {
      try {
        results = await fetchResults();
      } catch (e) {
        console.error("Error fetching results for my-results:", e);
      }
    }

    // Check if student exists in registrations list to get full name
    const registeredStudent = (db.registrations || []).find((r: any) => {
      const u = (r.username || "").trim().toLowerCase();
      const uAlt1 = u.replace(/\//g, "-");
      const uAlt2 = u.replace(/-/g, "/");
      const uClean = u.replace(/[\/\\\s-]/g, "");
      return u === normalizedUser || u === normalizedAlt1 || u === normalizedAlt2 ||
             uAlt1 === normalizedUser || uAlt2 === normalizedUser ||
             (cleanUser.length >= 3 && uClean === cleanUser);
    });

    const studentFullName = (registeredStudent?.fullName || "").trim().toLowerCase();

    const matches = results.filter((r: any) => {
      const sId = (r.studentId || "").trim().toLowerCase();
      const rnum = (r.regNumber || "").trim().toLowerCase();
      const sName = (r.studentName || "").trim().toLowerCase();

      const sIdClean = sId.replace(/[\/\\\s-]/g, "");
      const rnumClean = rnum.replace(/[\/\\\s-]/g, "");

      const isIdMatch = sId === normalizedUser || sId === normalizedAlt1 || sId === normalizedAlt2 ||
                        rnum === normalizedUser || rnum === normalizedAlt1 || rnum === normalizedAlt2 ||
                        (cleanUser.length >= 3 && (sIdClean === cleanUser || rnumClean === cleanUser));

      const isNameMatch = Boolean(studentFullName && sName && (sName === studentFullName || sName.includes(studentFullName) || studentFullName.includes(sName))) ||
                          Boolean(sName && (sName === normalizedUser || sName.includes(normalizedUser) || normalizedUser.includes(sName)));

      return isIdMatch || isNameMatch;
    });

    res.json({ success: true, results: matches });
  } catch (err: any) {
    console.error("Error fetching student results:", err);
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch student results", results: [] });
  }
});

// School Stats GET & PUT
app.get("/api/school-stats", async (req, res) => {
  try {
    const stats = await fetchSchoolStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

app.put("/api/school-stats", async (req, res) => {
  try {
    const { enrolledStudents, expertEducators, alumniGraduates, nationalAwards } = req.body;
    const stats = {
      enrolledStudents: enrolledStudents || "850+",
      expertEducators: expertEducators || "45+",
      alumniGraduates: alumniGraduates || "2,400+",
      nationalAwards: nationalAwards || "18+"
    };
    const updated = await updateSchoolStatsItem(stats);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// School Social Media Links
app.get("/api/school-socials", async (req, res) => {
  try {
    const socials = await fetchSchoolSocials();
    res.json(socials);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

app.put("/api/school-socials", async (req, res) => {
  try {
    const { facebook, twitter, instagram, linkedin, whatsapp } = req.body;
    const socials = {
      facebook: facebook || "",
      twitter: twitter || "",
      instagram: instagram || "",
      linkedin: linkedin || "",
      whatsapp: whatsapp || ""
    };
    const updated = await updateSchoolSocialsItem(socials);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// School Subjects GET & PUT
app.get("/api/school-subjects", async (req, res) => {
  try {
    const subjects = await fetchSchoolSubjects();
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

app.put("/api/school-subjects", async (req, res) => {
  try {
    const subjects = req.body;
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ error: "Expected an array of subjects" });
    }
    const updated = await updateSchoolSubjects(subjects);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Admin Stats
app.get("/api/stats", async (req, res) => {
  try {
    const allResults = await fetchResults();
    const allGallery = await fetchGallery();
    const allDocuments = await fetchDocuments();
    const allProjects = await fetchProjects();
    const allNews = await fetchNews();

    const totalStudents = new Set(allResults.map(r => r.studentId)).size;
    const totalImages = allGallery.filter(g => g.type === "image").length;
    const totalVideos = allGallery.filter(g => g.type === "video").length;
    const totalDocuments = allDocuments.length;
    const totalProjects = allProjects.length;
    const totalNewsPosts = allNews.length;

    res.json({
      totalStudents: totalStudents || 3,
      totalImages,
      totalVideos,
      totalDocuments,
      totalProjects,
      totalNewsPosts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || error });
  }
});

// NEWS CRUD
app.get("/api/news", async (req, res) => {
  const list = await fetchNews();
  res.json(list);
});

app.post("/api/news", async (req, res) => {
  const { title, summary, content, category, date, imageUrl } = req.body;
  const newPost = await insertNews({
    title,
    summary,
    content,
    category,
    date: date || new Date().toISOString().split("T")[0],
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800"
  });
  res.status(201).json(newPost);
});

app.put("/api/news/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await updateNewsItem(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ message: "News not found" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteNewsItem(id);
  res.json({ success });
});

// GALLERY CRUD
app.get("/api/gallery", async (req, res) => {
  const list = await fetchGallery();
  res.json(list);
});

app.post("/api/gallery", async (req, res) => {
  const { title, category, type, url, description } = req.body;
  const newItem = await insertGallery({
    title,
    category,
    type,
    url,
    description,
    createdAt: new Date().toISOString().split("T")[0]
  });
  res.status(201).json(newItem);
});

app.put("/api/gallery/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await updateGalleryItem(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ message: "Gallery item not found" });
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteGalleryItem(id);
  res.json({ success });
});

// PROJECTS CRUD
app.get("/api/projects", async (req, res) => {
  const list = await fetchProjects();
  res.json(list);
});

app.post("/api/projects", async (req, res) => {
  const { title, description, budget, startDate, completionDate, progressPercentage, imageUrl } = req.body;
  const newProject = await insertProject({
    title,
    description,
    budget,
    startDate,
    completionDate,
    progressPercentage: Number(progressPercentage) || 0,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800"
  });
  res.status(201).json(newProject);
});

app.put("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await updateProjectItem(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteProjectItem(id);
  res.json({ success });
});

// DOCUMENTS CRUD
app.get("/api/documents", async (req, res) => {
  const list = await fetchDocuments();
  res.json(list.map(d => ({ id: d.id, title: d.title, filename: d.filename, fileType: d.fileType, uploadedAt: d.uploadedAt })));
});

// Serve individual document download data
app.get("/api/documents/:id", async (req, res) => {
  const doc = await fetchDocumentById(req.params.id);
  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ message: "Document not found" });
  }
});

app.post("/api/documents", async (req, res) => {
  const { title, filename, fileType, fileData } = req.body;
  const newDoc = await insertDocument({
    title,
    filename,
    fileType,
    fileData,
    uploadedAt: new Date().toISOString().split("T")[0]
  });
  res.status(201).json({ id: newDoc.id, title: newDoc.title, filename: newDoc.filename, fileType: newDoc.fileType, uploadedAt: newDoc.uploadedAt });
});

app.delete("/api/documents/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteDocumentItem(id);
  res.json({ success });
});

// RESULTS CRUD & QUERY
app.get("/api/results", async (req, res) => {
  const list = await fetchResults();
  res.json(list);
});

// Unified result lookup search
app.get("/api/results/search", async (req, res) => {
  try {
    const { studentId, regNumber, session, term } = req.query;
    const matches = await searchResults(studentId as string, regNumber as string, session as string, term as string);
    res.json({ success: true, results: matches, message: matches.length === 0 ? "No matching academic records found." : undefined });
  } catch (err: any) {
    console.error("Search endpoint error:", err);
    res.status(500).json({ success: false, message: err?.message || "Search failed", results: [] });
  }
});

app.post("/api/results", async (req, res) => {
  const { studentId, regNumber, studentName, classUnit, session, term, scores, remarks, position, outOf, classPlacement, grossTotalMarks, gradePoint, terminalAverageScore, accreditedGradeBracket, classStanding, passportPhoto, sex, promotionStatus, resultPassword, filePassword } = req.body;
  
  // Calculate score math
  const calculatedScores = (scores || []).map((s: any) => {
    const ca1Val = Number(s.ca1) || 0;
    const ca2Val = Number(s.ca2) || 0;
    const examVal = Number(s.exam) || 0;
    const total = ca1Val + ca2Val + examVal;
    let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
    let remark = "Fail";

    if (total >= 80) { grade = 'A'; remark = "Excellent"; }
    else if (total >= 70) { grade = 'B'; remark = "Very Good"; }
    else if (total >= 60) { grade = 'C'; remark = "Good"; }
    else if (total >= 50) { grade = 'D'; remark = "Pass"; }
    else if (total >= 40) { grade = 'E'; remark = "Fair Pass"; }
    else { grade = 'F'; remark = "Fail"; }

    return { subject: s.subject, ca1: ca1Val, ca2: ca2Val, exam: examVal, total, grade, remark };
  });

  const totalScore = calculatedScores.reduce((acc: number, cur: any) => acc + cur.total, 0);
  const averageScore = calculatedScores.length > 0 ? parseFloat((totalScore / calculatedScores.length).toFixed(1)) : 0;

  const totalGP = calculatedScores.reduce((acc: number, cur: any) => acc + (cur.grade === 'A' ? 5 : cur.grade === 'B' ? 4 : cur.grade === 'C' ? 3 : cur.grade === 'D' ? 2 : cur.grade === 'E' ? 1 : 0), 0);
  const averageGP = calculatedScores.length > 0 ? (totalGP / calculatedScores.length).toFixed(2) : "0.00";

  const getOrdinal = (n: number) => {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + "st";
    if (j === 2 && k !== 12) return n + "nd";
    if (j === 3 && k !== 13) return n + "rd";
    return n + "th";
  };

  const computedClassPlacement = classPlacement || classUnit;
  const computedGrossTotalMarks = grossTotalMarks || `${totalScore} / ${calculatedScores.length * 100}`;
  const computedGradePoint = gradePoint || `${averageGP} / 5.00`;
  const computedTerminalAverageScore = terminalAverageScore || `${averageScore}%`;
  const computedAccreditedGradeBracket = accreditedGradeBracket || (averageScore >= 80 ? "Distinction (A)" : averageScore >= 70 ? "Very Good (B)" : averageScore >= 60 ? "Good (C)" : averageScore >= 50 ? "Pass (D)" : averageScore >= 40 ? "Fair Pass (E)" : "Fail (F)");
  const computedClassStanding = classStanding || `${getOrdinal(Number(position) || 1)} out of ${Number(outOf) || 30}`;

  const newResult = await insertResultItem({
    studentId,
    regNumber,
    studentName,
    classUnit,
    session,
    term,
    scores: calculatedScores,
    totalScore,
    averageScore,
    position: Number(position) || 1,
    outOf: Number(outOf) || 30,
    remarks: remarks || "Good result.",
    classPlacement: computedClassPlacement,
    grossTotalMarks: computedGrossTotalMarks,
    gradePoint: computedGradePoint,
    terminalAverageScore: computedTerminalAverageScore,
    accreditedGradeBracket: computedAccreditedGradeBracket,
    classStanding: computedClassStanding,
    passportPhoto: passportPhoto || "",
    sex: sex || "Male",
    promotionStatus: promotionStatus || "PASS / PROMOTED",
    resultPassword: resultPassword || filePassword || ""
  });

  res.status(201).json(newResult);
});

app.put("/api/results/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, regNumber, studentName, classUnit, session, term, scores, remarks, position, outOf, classPlacement, grossTotalMarks, gradePoint, terminalAverageScore, accreditedGradeBracket, classStanding, passportPhoto, sex, promotionStatus, resultPassword, filePassword } = req.body;
    
    let calculatedScores;
    let totalScore, averageScore, computedClassStanding, computedGrossTotalMarks, computedGradePoint, computedTerminalAverageScore, computedAccreditedGradeBracket, computedClassPlacement;

    if (scores && Array.isArray(scores)) {
      calculatedScores = scores.map((s: any) => {
        const ca1Val = Number(s.ca1) || 0;
        const ca2Val = Number(s.ca2) || 0;
        const examVal = Number(s.exam) || 0;
        const total = ca1Val + ca2Val + examVal;
        let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
        let remark = "Fail";

        if (total >= 80) { grade = 'A'; remark = "Excellent"; }
        else if (total >= 70) { grade = 'B'; remark = "Very Good"; }
        else if (total >= 60) { grade = 'C'; remark = "Good"; }
        else if (total >= 50) { grade = 'D'; remark = "Pass"; }
        else if (total >= 40) { grade = 'E'; remark = "Fair Pass"; }
        else { grade = 'F'; remark = "Fail"; }

        return { subject: s.subject, ca1: ca1Val, ca2: ca2Val, exam: examVal, total, grade, remark };
      });

      totalScore = calculatedScores.reduce((acc: number, cur: any) => acc + cur.total, 0);
      averageScore = calculatedScores.length > 0 ? parseFloat((totalScore / calculatedScores.length).toFixed(1)) : 0;

      const totalGP = calculatedScores.reduce((acc: number, cur: any) => acc + (cur.grade === 'A' ? 5 : cur.grade === 'B' ? 4 : cur.grade === 'C' ? 3 : cur.grade === 'D' ? 2 : cur.grade === 'E' ? 1 : 0), 0);
      const averageGP = calculatedScores.length > 0 ? (totalGP / calculatedScores.length).toFixed(2) : "0.00";

      const getOrdinal = (n: number) => {
        const j = n % 10, k = n % 100;
        if (j === 1 && k !== 11) return n + "st";
        if (j === 2 && k !== 12) return n + "nd";
        if (j === 3 && k !== 13) return n + "rd";
        return n + "th";
      };

      computedClassPlacement = classPlacement || classUnit;
      computedGrossTotalMarks = grossTotalMarks || `${totalScore} / ${calculatedScores.length * 100}`;
      computedGradePoint = gradePoint || `${averageGP} / 5.00`;
      computedTerminalAverageScore = terminalAverageScore || `${averageScore}%`;
      computedAccreditedGradeBracket = accreditedGradeBracket || (averageScore >= 80 ? "Distinction (A)" : averageScore >= 70 ? "Very Good (B)" : averageScore >= 60 ? "Good (C)" : averageScore >= 50 ? "Pass (D)" : averageScore >= 40 ? "Fair Pass (E)" : "Fail (F)");
      computedClassStanding = classStanding || `${getOrdinal(Number(position) || 1)} out of ${Number(outOf) || 30}`;
    }

    const updatesToApply: any = {};
    if (studentId !== undefined) updatesToApply.studentId = studentId;
    if (regNumber !== undefined) updatesToApply.regNumber = regNumber;
    if (studentName !== undefined) updatesToApply.studentName = studentName;
    if (classUnit !== undefined) updatesToApply.classUnit = classUnit;
    if (session !== undefined) updatesToApply.session = session;
    if (term !== undefined) updatesToApply.term = term;
    if (calculatedScores !== undefined) updatesToApply.scores = calculatedScores;
    if (totalScore !== undefined) updatesToApply.totalScore = totalScore;
    if (averageScore !== undefined) updatesToApply.averageScore = averageScore;
    if (position !== undefined && !isNaN(Number(position))) updatesToApply.position = Number(position);
    if (outOf !== undefined && !isNaN(Number(outOf))) updatesToApply.outOf = Number(outOf);
    if (remarks !== undefined) updatesToApply.remarks = remarks;
    if (classPlacement || computedClassPlacement) updatesToApply.classPlacement = classPlacement || computedClassPlacement;
    if (grossTotalMarks || computedGrossTotalMarks) updatesToApply.grossTotalMarks = grossTotalMarks || computedGrossTotalMarks;
    if (gradePoint || computedGradePoint) updatesToApply.gradePoint = gradePoint || computedGradePoint;
    if (terminalAverageScore || computedTerminalAverageScore) updatesToApply.terminalAverageScore = terminalAverageScore || computedTerminalAverageScore;
    if (accreditedGradeBracket || computedAccreditedGradeBracket) updatesToApply.accreditedGradeBracket = accreditedGradeBracket || computedAccreditedGradeBracket;
    if (classStanding || computedClassStanding) updatesToApply.classStanding = classStanding || computedClassStanding;
    if (passportPhoto !== undefined) updatesToApply.passportPhoto = passportPhoto;
    if (sex !== undefined) updatesToApply.sex = sex;
    if (promotionStatus !== undefined) updatesToApply.promotionStatus = promotionStatus;
    if (resultPassword !== undefined || filePassword !== undefined) updatesToApply.resultPassword = resultPassword ?? filePassword;

    const updated = await updateResultItem(id, updatesToApply);

    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ message: "Result sheet not found" });
    }
  } catch (error: any) {
    console.error("Error updating result:", error);
    res.status(500).json({ message: error?.message || "Internal server error" });
  }
});

app.delete("/api/results/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteResultItem(id);
  res.json({ success });
});

// CONTACT MESSAGES
app.get("/api/messages", async (req, res) => {
  const list = await fetchMessages();
  res.json(list);
});

app.post("/api/messages", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields" });
  }
  const newMessage = await insertMessage({
    name,
    email,
    phone: phone || "",
    message,
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ success: true, message: "Thank you! Your message has been sent successfully." });
});

app.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteMessageItem(id);
  res.json({ success });
});

// STAFF MEMBERS CRUD
app.get("/api/staff", async (req, res) => {
  const list = await fetchStaff();
  res.json(list);
});

app.post("/api/staff", async (req, res) => {
  const { name, role, department, imageUrl } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Name and Role are required fields" });
  }
  const newItem = await insertStaffItem({
    name,
    role,
    department: department || "General",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    createdAt: new Date().toISOString().split("T")[0]
  });
  res.status(201).json(newItem);
});

app.put("/api/staff/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await updateStaffMember(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ message: "Staff member not found" });
  }
});

app.delete("/api/staff/:id", async (req, res) => {
  const { id } = req.params;
  const success = await deleteStaffMember(id);
  res.json({ success: true });
});

// IMAGE PROXY TO BYPASS CORS TAINTING
app.get("/api/proxy-image", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send("URL parameter is required");
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    // Set caching headers so we don't hit the third party endlessly
    res.setHeader("Cache-Control", "public, max-age=86400");
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error("Image proxy error for URL:", url, error);
    res.status(500).send("Failed to proxy image");
  }
});

// --- VITE AND STATIC ASSETS INTEGRATION ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode Vite Server
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode serving compiled static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HGASS Portal] Server listening on http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone listener when not executed inside Vercel serverless environment
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  startServer();
}

export default app;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  date: string;
  imageUrl?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'activities' | 'sports' | 'academics' | 'graduation' | 'cultural' | 'projects';
  type: 'image' | 'video';
  url: string; // Base64 for images or YouTube/Drive URLs for videos
  description?: string;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  budget: string;
  startDate: string;
  completionDate: string;
  progressPercentage: number;
  imageUrl?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  fileType: string;
  fileData: string; // Base64 data
  uploadedAt: string;
}

export interface SubjectScore {
  subject: string;
  ca1: number; // Continuous Assessment 1 (max 20)
  ca2: number; // Continuous Assessment 2 (max 20)
  exam: number; // Exam (max 60)
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  remark: string;
}

export interface ResultItem {
  id: string;
  studentId: string;
  regNumber: string;
  studentName: string;
  classUnit: string; // e.g., JSS1, JSS2, JSS3, SS1, SS2, SS3
  session: string; // e.g., 2025/2026
  term: '1st Term' | '2nd Term' | '3rd Term';
  scores: SubjectScore[];
  totalScore: number;
  averageScore: number;
  position: number;
  outOf: number;
  remarks: string;
  classPlacement?: string;
  grossTotalMarks?: string;
  gradePoint?: string;
  terminalAverageScore?: string;
  accreditedGradeBracket?: string;
  classStanding?: string;
  passportPhoto?: string;
  sex?: string; // Male / Female
  promotionStatus?: string; // e.g. Promoted, Retained, Promoted on Trial
  resultPassword?: string; // Security PIN / Password assigned by admin to protect this result file
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  totalProjects: number;
  totalNewsPosts: number;
}

export interface SchoolStats {
  enrolledStudents: string;
  expertEducators: string;
  alumniGraduates: string;
  nationalAwards: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface SchoolSocials {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  whatsapp: string;
}

export interface SubjectItem {
  name: string;
  desc: string;
  category: string;
  level: 'jss' | 'ss';
  icon?: string;
}



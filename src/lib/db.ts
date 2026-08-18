import { 
  NewsPost, 
  GalleryItem, 
  ProjectItem, 
  DocumentItem, 
  ResultItem, 
  ContactMessage,
  SchoolStats,
  StaffMember,
  SchoolSocials,
  SubjectItem
} from "../types";

// Dynamic Product type to satisfy "Manage products" requirement
export interface ProductItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: string; // "Uniforms", "Books", "Stationery", "Lab Kits"
  imageUrl: string;
  inStock: boolean;
  createdAt?: string;
}

import { 
  uploadToSupabaseStorage, 
  deleteFromSupabaseStorage, 
  getSignedFileUrl,
  BUCKET_NAME 
} from "./supabaseStorage";

export { uploadToSupabaseStorage, deleteFromSupabaseStorage, getSignedFileUrl, BUCKET_NAME };

// ------------------ FILE UPLOAD HELPER (Supabase Storage) ------------------
export async function uploadToStorage(
  fileOrBase64: File | string,
  folder: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (onProgress) onProgress(30);
  try {
    const res = await uploadToSupabaseStorage(fileOrBase64, folder, undefined, filename);
    if (onProgress) onProgress(100);
    return res.signedUrl || res.filePath;
  } catch (err) {
    console.error("Supabase Storage upload failed, fallback to data URL:", err);
    if (typeof fileOrBase64 === "string") {
      if (onProgress) onProgress(100);
      return fileOrBase64;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }
}

export async function deleteFromStorage(url: string) {
  if (!url) return;
  await deleteFromSupabaseStorage(url);
}

// ------------------ SCHOOL STATS & SOCIALS ------------------
export async function getSchoolStats(): Promise<SchoolStats> {
  const res = await fetch("/api/school-stats");
  if (!res.ok) throw new Error("Failed to fetch school stats");
  return await res.json();
}

export async function updateSchoolStats(stats: SchoolStats): Promise<void> {
  const res = await fetch("/api/school-stats", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stats)
  });
  if (!res.ok) throw new Error("Failed to update school stats");
}

export async function getSchoolSocials(): Promise<SchoolSocials> {
  const res = await fetch("/api/school-socials");
  if (!res.ok) throw new Error("Failed to fetch school socials");
  return await res.json();
}

export async function updateSchoolSocials(socials: SchoolSocials): Promise<void> {
  const res = await fetch("/api/school-socials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(socials)
  });
  if (!res.ok) throw new Error("Failed to update school socials");
}

// ------------------ SCHOOL SUBJECTS ------------------
export async function getSchoolSubjects(): Promise<SubjectItem[]> {
  const res = await fetch("/api/school-subjects");
  if (!res.ok) throw new Error("Failed to fetch school subjects");
  return await res.json();
}

export async function updateSchoolSubjects(subjects: SubjectItem[]): Promise<void> {
  const res = await fetch("/api/school-subjects", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subjects)
  });
  if (!res.ok) throw new Error("Failed to update school subjects");
}

// ------------------ NEWS COLLECTION ------------------
export async function getNews(): Promise<NewsPost[]> {
  const res = await fetch("/api/news");
  if (!res.ok) throw new Error("Failed to fetch news");
  return await res.json();
}

export async function addNews(item: Omit<NewsPost, "id">): Promise<string> {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add news item");
  const data = await res.json();
  return data.id;
}

export async function updateNews(id: string, item: Partial<NewsPost>): Promise<void> {
  const res = await fetch(`/api/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update news item");
}

export async function deleteNews(id: string): Promise<void> {
  const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete news item");
}

// ------------------ GALLERY COLLECTION ------------------
export async function getGallery(): Promise<GalleryItem[]> {
  const res = await fetch("/api/gallery");
  if (!res.ok) throw new Error("Failed to fetch gallery");
  return await res.json();
}

export async function addGallery(item: Omit<GalleryItem, "id">): Promise<string> {
  const res = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add gallery item");
  const data = await res.json();
  return data.id;
}

export async function updateGallery(id: string, item: Partial<GalleryItem>): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update gallery item");
}

export async function deleteGallery(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete gallery item");
}

// ------------------ PROJECTS COLLECTION ------------------
export async function getProjects(): Promise<ProjectItem[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return await res.json();
}

export async function addProject(item: Omit<ProjectItem, "id">): Promise<string> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add project");
  const data = await res.json();
  return data.id;
}

export async function updateProject(id: string, item: Partial<ProjectItem>): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update project");
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}

// ------------------ DOCUMENTS COLLECTION ------------------
export async function getDocuments(): Promise<Omit<DocumentItem, "fileData">[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  return await res.json();
}

export async function getDocumentById(id: string): Promise<DocumentItem | null> {
  const res = await fetch(`/api/documents/${id}`);
  if (!res.ok) throw new Error("Failed to fetch document by ID");
  return await res.json();
}

export async function addDocument(item: Omit<DocumentItem, "id">): Promise<string> {
  const res = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add document");
  const data = await res.json();
  return data.id;
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
}

// ------------------ RESULTS COLLECTION ------------------
export async function getResults(): Promise<ResultItem[]> {
  const res = await fetch("/api/results");
  if (!res.ok) throw new Error("Failed to fetch results");
  return await res.json();
}

export async function searchResults(studentId: string, regNumber: string, session?: string, term?: string): Promise<ResultItem[]> {
  try {
    const queryParams = new URLSearchParams({
      studentId: (studentId || "").trim(),
      regNumber: (regNumber || "").trim()
    });
    if (session) queryParams.append("session", session);
    if (term) queryParams.append("term", term);

    const res = await fetch(`/api/results/search?${queryParams.toString()}`);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error("Failed to search results");
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("searchResults API call failed:", err);
    return [];
  }
}

export async function addResult(item: Omit<ResultItem, "id" | "totalScore" | "averageScore">): Promise<string> {
  const res = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add result");
  const data = await res.json();
  return data.id;
}

export async function updateResult(id: string, item: Partial<ResultItem>): Promise<void> {
  const res = await fetch(`/api/results/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update result");
}

export async function deleteResult(id: string): Promise<void> {
  const res = await fetch(`/api/results/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete result");
}

// ------------------ CONTACT MESSAGES ------------------
export async function getMessages(): Promise<ContactMessage[]> {
  const res = await fetch("/api/messages");
  if (!res.ok) throw new Error("Failed to fetch messages");
  return await res.json();
}

export async function addMessage(item: Omit<ContactMessage, "id">): Promise<string> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add message");
  const data = await res.json();
  return data.id;
}

export async function deleteMessage(id: string): Promise<void> {
  const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete message");
}

// ------------------ STAFF MEMBERS ------------------
export async function getStaff(): Promise<StaffMember[]> {
  const res = await fetch("/api/staff");
  if (!res.ok) throw new Error("Failed to fetch staff");
  return await res.json();
}

export async function addStaff(item: Omit<StaffMember, "id">): Promise<string> {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add staff member");
  const data = await res.json();
  return data.id;
}

export async function updateStaff(id: string, item: Partial<StaffMember>): Promise<void> {
  const res = await fetch(`/api/staff/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update staff member");
}

export async function deleteStaff(id: string): Promise<void> {
  const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete staff member");
}

// ------------------ PRODUCTS ------------------
export async function getProducts(): Promise<ProductItem[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return await res.json();
}

export async function addProduct(item: Omit<ProductItem, "id">): Promise<string> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add product");
  const data = await res.json();
  return data.id;
}

export async function updateProduct(id: string, item: Partial<ProductItem>): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update product");
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}

// --- STUDENT PORTAL REGISTRATION HELPERS ---
export async function getRegistrations(): Promise<any[]> {
  const res = await fetch("/api/admin/registrations");
  if (!res.ok) throw new Error("Failed to fetch student registrations");
  return await res.json();
}

export async function addRegistration(item: { username: string; password?: string; fullName: string }): Promise<any> {
  const res = await fetch("/api/admin/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add registration");
  return await res.json();
}

export async function updateRegistration(id: string, item: { password?: string; fullName?: string }): Promise<any> {
  const res = await fetch(`/api/admin/registrations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update registration");
  return await res.json();
}

export async function deleteRegistration(id: string): Promise<void> {
  const res = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete registration");
}

export async function studentLogin(credentials: { username: string; password?: string }): Promise<any> {
  const res = await fetch("/api/student/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Login failed");
  }
  return await res.json();
}

export async function getStudentResults(username: string): Promise<any> {
  const res = await fetch(`/api/student/my-results?username=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error("Failed to fetch student results");
  return await res.json();
}

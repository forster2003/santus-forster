import { supabase } from "../supabaseClient";

export const BUCKET_NAME = "HOLYGHOST ACADEMYKAMALI";

/**
 * Retrieves the current authenticated user ID from Supabase Auth,
 * or falls back to a default user UUID to ensure all file paths start with ${auth.uid()}/...
 */
export async function getAuthUserId(): Promise<string> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      return userData.user.id;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      return sessionData.session.user.id;
    }
  } catch (err) {
    console.warn("Could not retrieve Supabase user ID:", err);
  }
  return "00000000-0000-0000-0000-000000000000";
}

/**
 * Helper to convert a Base64 data URL string to a File object.
 */
export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Uploads a file (File object or base64 Data URL) to Supabase Storage bucket "HOLYGHOST ACADEMYKAMALI".
 * File path follows rule: ${userId}/${featureName}/${itemId}/${uuid}.${extension}
 */
export async function uploadToSupabaseStorage(
  fileOrBase64: File | string,
  featureName: "news" | "projects" | "gallery" | "documents" | "results" | "staff" | "products" | string,
  itemId?: string,
  customFileName?: string
): Promise<{ filePath: string; signedUrl: string }> {
  if (!fileOrBase64) {
    throw new Error("No file or data provided for upload");
  }

  // If already a remote URL (http/https), return as is
  if (typeof fileOrBase64 === "string" && (fileOrBase64.startsWith("http://") || fileOrBase64.startsWith("https://"))) {
    return { filePath: fileOrBase64, signedUrl: fileOrBase64 };
  }

  const userId = await getAuthUserId();
  const actualItemId = itemId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10));

  let fileToUpload: File;
  let extension = "bin";

  if (fileOrBase64 instanceof File) {
    fileToUpload = fileOrBase64;
    const parts = fileToUpload.name.split(".");
    if (parts.length > 1) {
      extension = parts.pop() || "bin";
    }
  } else if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
    const mimeMatch = fileOrBase64.match(/data:([^;]+);/);
    const mime = mimeMatch ? mimeMatch[1] : "";
    if (mime.includes("png")) extension = "png";
    else if (mime.includes("jpeg") || mime.includes("jpg")) extension = "jpg";
    else if (mime.includes("pdf")) extension = "pdf";
    else if (mime.includes("webp")) extension = "webp";
    else if (mime.includes("gif")) extension = "gif";
    else if (mime.includes("word") || mime.includes("docx")) extension = "docx";
    else if (mime.includes("sheet") || mime.includes("xlsx")) extension = "xlsx";

    const name = customFileName || `upload_${Date.now()}.${extension}`;
    fileToUpload = dataURLtoFile(fileOrBase64, name);
  } else {
    throw new Error("Invalid file format provided for upload");
  }

  const randomUuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10);
  const fileName = customFileName ? customFileName.replace(/[^a-zA-Z0-9_.-]/g, "_") : `${randomUuid}.${extension}`;

  // Path rule: ${userId}/${featureName}/${itemId}/${uuid}.${extension}
  const filePath = `${userId}/${featureName}/${actualItemId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileToUpload, {
      cacheControl: "3600",
      upsert: true,
      contentType: fileToUpload.type
    });

  if (error) {
    console.error(`Supabase Storage upload error for ${filePath}:`, error);
    throw new Error(`Failed to upload to Supabase Storage bucket "${BUCKET_NAME}": ${error.message}`);
  }

  // Create signed URL for display (60 * 60 * 24 * 7 = 7 days validity)
  const { data: signedData, error: signedErr } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(data.path, 604800);

  if (signedErr) {
    console.warn("Could not generate signed URL:", signedErr);
  }

  return {
    filePath: data.path,
    signedUrl: signedData?.signedUrl || data.path
  };
}

/**
 * Gets a signed URL for a file stored in private Supabase Storage bucket "HOLYGHOST ACADEMYKAMALI".
 */
export async function getSignedFileUrl(filePathOrUrl: string, expiresInSeconds = 604800): Promise<string> {
  if (!filePathOrUrl) return "";
  if (filePathOrUrl.startsWith("data:")) return filePathOrUrl;

  let storagePath = filePathOrUrl;
  if (storagePath.includes(`${BUCKET_NAME}/`)) {
    storagePath = storagePath.split(`${BUCKET_NAME}/`)[1]?.split("?")[0] || storagePath;
  }

  // If it's a full http/https URL and doesn't belong to our bucket, return as is
  if ((storagePath.startsWith("http://") || storagePath.startsWith("https://")) && !storagePath.includes(BUCKET_NAME)) {
    return storagePath;
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return filePathOrUrl;
    }
    return data.signedUrl;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return filePathOrUrl;
  }
}

/**
 * Deletes a file from Supabase Storage bucket "HOLYGHOST ACADEMYKAMALI".
 */
export async function deleteFromSupabaseStorage(filePathOrUrl: string): Promise<boolean> {
  if (!filePathOrUrl) return false;

  let storagePath = filePathOrUrl;
  if (storagePath.includes(`${BUCKET_NAME}/`)) {
    storagePath = storagePath.split(`${BUCKET_NAME}/`)[1]?.split("?")[0] || storagePath;
  }

  if (storagePath.startsWith("data:") || ((storagePath.startsWith("http://") || storagePath.startsWith("https://")) && !storagePath.includes(BUCKET_NAME))) {
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error(`Failed to delete file from Supabase Storage (${storagePath}):`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error deleting file from Supabase Storage:", err);
    return false;
  }
}

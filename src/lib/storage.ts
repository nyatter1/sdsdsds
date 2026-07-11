import { supabase, app } from './supabase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase Storage
const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage.
 * Returns the public URL.
 */
export async function uploadImageToStorage(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;

  try {
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    });
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (err) {
    console.error("Firebase Storage failed:", err);
    throw err;
  }
}

/**
 * Uploads an audio file to Firebase Storage.
 * Returns the public URL.
 */
export async function uploadAudioToStorage(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;

  try {
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file, {
      contentType: file.type || 'audio/mpeg',
      cacheControl: 'public, max-age=31536000',
    });
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (err) {
    console.error("Firebase Storage failed for audio:", err);
    throw err;
  }
}


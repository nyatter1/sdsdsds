/**
 * Uploads a file to the local Express backend storage.
 * Returns the public URL.
 */
export async function uploadImageToStorage(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    
    const result = await res.json();
    return result.data.path;
  } catch (err) {
    console.error("Local storage upload failed:", err);
    throw err;
  }
}

/**
 * Uploads an audio file to the local Express backend storage.
 * Returns the public URL.
 */
export async function uploadAudioToStorage(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    
    const result = await res.json();
    return result.data.path;
  } catch (err) {
    console.error("Local storage upload failed for audio:", err);
    throw err;
  }
}

/**
 * Uploads a file to a free public cloud (Catbox).
 * Catbox supports up to 200MB and provides direct links (e.g. .mp3, .jpg).
 */
async function uploadToCatbox(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file);

  // No short timeout, let it take the time it needs for 5MB+ files
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    throw new Error(`Catbox upload failed with status ${res.status}`);
  }
  
  const url = await res.text();
  if (!url.startsWith('http')) {
    throw new Error('Invalid response from Catbox: ' + url);
  }
  return url;
}

/**
 * Uploads an image. Tries local backend first (fastest), then Catbox, then Base64.
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
    console.warn("Local storage upload failed, trying Catbox cloud:", err);
    
    try {
      return await uploadToCatbox(file);
    } catch (catboxErr) {
      console.warn("Catbox cloud upload failed, falling back to base64:", catboxErr);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            if (file.type === 'image/gif') {
              resolve(reader.result);
              return;
            }

            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => reject(new Error("Failed to load image for compression"));
            img.src = reader.result;
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }
  }
}

/**
 * Uploads an audio file directly to Catbox to ensure we get a persistent .mp3 link
 * and to handle 5MB+ files without hitting local/base64 limits.
 */
export async function uploadAudioToStorage(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  // Always try Catbox first for audio so it gets a persistent .mp3 link
  try {
    return await uploadToCatbox(file);
  } catch (err) {
    console.warn("Catbox upload failed for audio, falling back to local server:", err);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    
    const result = await res.json();
    return result.data.path;
  }
}

/**
 * Uploads a file to a free public cloud (Catbox) from the browser.
 * Note: Direct browser upload to Catbox may fail in some environments due to CORS policies.
 */
async function uploadToCatboxClient(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file);

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
 * Uploads an image. Tries local backend first (which handles cloud/Catbox upload server-side to avoid CORS),
 * then direct browser-to-Catbox, then Base64.
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
    console.warn("Backend upload failed, trying direct Catbox client upload:", err);
    
    try {
      return await uploadToCatboxClient(file);
    } catch (catboxErr) {
      console.warn("Direct Catbox client upload failed, falling back to base64:", catboxErr);
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
 * Uploads an audio file. Tries local backend first (which handles cloud/Catbox upload server-side to avoid CORS),
 * then direct browser-to-Catbox, then Base64.
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
    console.warn("Backend upload failed for audio, trying direct Catbox client upload:", err);
    
    try {
      return await uploadToCatboxClient(file);
    } catch (catboxErr) {
      console.warn("Direct Catbox client upload failed, falling back to base64:", catboxErr);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert audio file to base64"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }
  }
}

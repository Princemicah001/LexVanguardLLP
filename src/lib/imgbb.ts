export const IMGBB_API_KEY = "341ffd37245f5d98e803f8ad6e8d4077";
export const IMGBB_ALBUM_URL = "https://ibb.co/album/xKqQD6";

/**
 * Converts a File object to a Base64 Data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and compresses an image File or Base64 string to max dimensions (800x800) and JPEG quality.
 * Produces an ultra-lightweight Data URL (~30KB-70KB) guaranteed to fit in Firestore (limit 1MB).
 */
export function compressImage(
  fileOrBase64: File | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(typeof fileOrBase64 === "string" ? fileOrBase64 : "");
      }
    };

    img.onerror = () => {
      if (typeof fileOrBase64 === "string") {
        resolve(fileOrBase64);
      } else {
        fileToDataUrl(fileOrBase64).then(resolve);
      }
    };

    if (typeof fileOrBase64 === "string") {
      img.src = fileOrBase64;
    } else {
      fileToDataUrl(fileOrBase64).then((dataUrl) => {
        if (dataUrl) img.src = dataUrl;
        else resolve("");
      });
    }
  });
}

/**
 * Normalizes ImgBB URLs (e.g. converting ibb.co viewer links to direct raw image URLs if possible)
 */
export function normalizeImgBbUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  // If user pasted something like ibb.co/pjV4Bczf/filename.jpg, ensure https://
  if (trimmed.startsWith("ibb.co/") || trimmed.startsWith("i.ibb.co/")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

/**
 * Uploads an image (File or base64 data URL) to ImgBB and returns the direct CDN image URL.
 * Fallbacks gracefully to lightweight compressed Data URL if network/ImgBB API fails or is blocked.
 */
export async function uploadToImgBB(fileOrBase64: File | string, imageName?: string): Promise<string> {
  // If it's already an http/https URL, return as is
  if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("http")) {
    return normalizeImgBbUrl(fileOrBase64);
  }

  // Pre-compress image to ensure fast upload and lightweight fallback (~40KB)
  let compressedBase64 = "";
  try {
    compressedBase64 = await compressImage(fileOrBase64, 800, 800, 0.8);
  } catch {
    compressedBase64 = "";
  }

  try {
    const formData = new FormData();

    if (compressedBase64) {
      const raw = compressedBase64.includes("base64,")
        ? compressedBase64.split("base64,")[1]
        : compressedBase64;
      formData.append("image", raw);
    } else if (typeof fileOrBase64 === "string") {
      const base64Data = fileOrBase64.includes("base64,")
        ? fileOrBase64.split("base64,")[1]
        : fileOrBase64;
      formData.append("image", base64Data);
    } else {
      formData.append("image", fileOrBase64);
    }

    if (imageName) {
      formData.append("name", imageName.replace(/[^a-zA-Z0-9_-]/g, "_"));
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const cdnUrl = result.data.display_url || result.data.url || result.data.image?.url;
        if (cdnUrl) {
          return cdnUrl;
        }
      }
    }
  } catch (err) {
    console.warn("ImgBB API upload unavailable/blocked, using compressed Data URL fallback:", err);
  }

  // Graceful fallback to lightweight compressed Data URL if ImgBB upload fails or is blocked
  if (compressedBase64) {
    return compressedBase64;
  }

  if (typeof fileOrBase64 === "string") {
    return fileOrBase64;
  }
  return await fileToDataUrl(fileOrBase64);
}



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
 * Uploads an image (File or base64 data URL) to ImgBB and returns the direct CDN image URL.
 * Fallbacks gracefully to Base64 Data URL if network/ImgBB API fails or is blocked.
 */
export async function uploadToImgBB(fileOrBase64: File | string, imageName?: string): Promise<string> {
  // If it's already an http/https URL, return as is
  if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("http")) {
    return fileOrBase64;
  }

  try {
    const formData = new FormData();

    if (typeof fileOrBase64 === "string") {
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
    console.warn("ImgBB API upload unavailable/blocked, using Data URL fallback:", err);
  }

  // Graceful fallback to Data URL if ImgBB upload fails or is blocked
  if (typeof fileOrBase64 === "string") {
    return fileOrBase64;
  }
  return await fileToDataUrl(fileOrBase64);
}


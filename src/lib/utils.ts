export const getMediaUrl = (url: string, isEmbed = false) => {
  if (!url) return "";
  const trimmedUrl = url.trim();

  // YouTube
  if (trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be")) {
    let id = "";
    if (trimmedUrl.includes("v=")) {
      id = trimmedUrl.split("v=")[1]?.split("&")[0];
    } else if (trimmedUrl.includes("youtu.be/")) {
      id = trimmedUrl.split("youtu.be/")[1]?.split("?")[0];
    } else if (trimmedUrl.includes("/embed/")) {
      id = trimmedUrl.split("/embed/")[1]?.split("?")[0];
    }
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&enablejsapi=1` : trimmedUrl;
  }

  // Google Drive
  if (trimmedUrl.includes("drive.google.com") || trimmedUrl.includes("drive.usercontent.google.com")) {
    const match = trimmedUrl.match(/[-\w]{25,}/);
    const fileId = match ? match[0] : "";
    if (fileId) {
      if (isEmbed) return `https://drive.google.com/file/d/${fileId}/preview`;
      return `https://drive.google.com/uc?id=${fileId}`;
    }
  }

  // Cloudinary Optimization (Auto WebP / Quality)
  if (trimmedUrl.includes("res.cloudinary.com") && trimmedUrl.includes("/image/upload/")) {
    if (!trimmedUrl.includes("/f_auto") && !trimmedUrl.includes("/q_auto")) {
      return trimmedUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
    }
  }

  return trimmedUrl;
};

// Utility to detect if a URL points to a video or image
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.webm', '.mp4', '.mov', '.avi', '.mkv', '.m4v', '.ogv'];
  const lowerUrl = url.toLowerCase();
  
  // Check if URL ends with video extension
  return videoExtensions.some(ext => lowerUrl.endsWith(ext)) || 
         lowerUrl.includes('/video/') ||
         lowerUrl.match(/\.(webm|mp4|mov|avi|mkv|m4v|ogv)(\?|$)/i) !== null;
};

export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  
  // Check if URL ends with image extension
  return imageExtensions.some(ext => lowerUrl.endsWith(ext)) || 
         lowerUrl.includes('/image/') ||
         lowerUrl.match(/\.(webp|jpg|jpeg|png|gif|svg|bmp)(\?|$)/i) !== null;
};

export const getMediaType = (url: string): 'image' | 'video' => {
  return isVideoUrl(url) ? 'video' : 'image';
};


// WebP conversion utility
export const convertToWebP = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if file is already WebP
    if (file.type === 'image/webp') {
      resolve(file);
      return;
    }

    // Check if file is a supported image type (including JFIF files)
    const isSupportedType = file.type.match(/^image\/(jpeg|jpg|png|webp)$/) || 
                           file.name.toLowerCase().match(/\.(jfif|jpe)$/);
    
    if (!isSupportedType) {
      reject(new Error('Unsupported file type. Please upload PNG, JPG, or JFIF images.'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with WebP extension
            const webpFile = new File([blob], file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};


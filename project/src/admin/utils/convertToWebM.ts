// Video conversion utility - Convert videos to WebM (AV1) format with optimized compression
export const convertToWebM = (file: File, quality: number = 0.85): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if file is already WebM
    if (file.type === 'video/webm') {
      resolve(file);
      return;
    }

    // Check if file is a supported video type
    const isSupportedType = file.type.match(/^video\//) || 
                           file.name.toLowerCase().match(/\.(mp4|mov|avi|mkv)$/);
    
    if (!isSupportedType) {
      reject(new Error('Unsupported file type. Please upload MP4, MOV, AVI, or MKV videos.'));
      return;
    }

    // Create video element to load the video
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = false; // Keep audio unmuted to preserve it
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // Prefer AV1 for maximum storage efficiency, fallback to VP9, then VP8
    // Include audio codec support (Opus is standard for WebM)
    const getCodec = (hasAudio: boolean = false): string => {
      // AV1 provides 30-50% better compression than VP9 at same quality
      const audioCodec = hasAudio ? ';codecs=opus' : '';
      
      if (MediaRecorder.isTypeSupported('video/webm;codecs=av01,opus') || 
          MediaRecorder.isTypeSupported('video/webm;codecs=av01')) {
        return hasAudio ? 'video/webm;codecs=av01,opus' : 'video/webm;codecs=av01';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') || 
                 MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        return hasAudio ? 'video/webm;codecs=vp9,opus' : 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') || 
                 MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        return hasAudio ? 'video/webm;codecs=vp8,opus' : 'video/webm;codecs=vp8';
      }
      return 'video/webm'; // Fallback
    };

    // Will be determined after checking for audio
    let codec = getCodec(false);
    let mediaRecorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];
    let videoStream: MediaStream | null = null;

    // Calculate optimal bitrate based on resolution and quality
    const calculateOptimalBitrate = (width: number, height: number, quality: number): number => {
      const pixels = width * height;
      const baseBitrate = pixels * 0.1; // Base bitrate per pixel (very conservative)
      
      // Adjust based on quality (0.5 = smaller file, 0.9 = higher quality)
      const qualityMultiplier = 0.5 + (quality * 0.5); // Range: 0.5 to 1.0
      
      // AV1 is 30-50% more efficient than VP9, so we can use lower bitrates
      // while maintaining the same visual quality and smoothness
      const codecMultiplier = codec.includes('av01') ? 0.65 : codec.includes('vp9') ? 0.85 : 1.0;
      
      // Calculate final bitrate
      let bitrate = baseBitrate * qualityMultiplier * codecMultiplier;
      
      // Cap bitrates for reasonable file sizes
      // 480p: ~500 kbps - 1.5 Mbps
      // 720p: ~1 Mbps - 2.5 Mbps
      // 1080p: ~2 Mbps - 4 Mbps
      // 4K: ~5 Mbps - 10 Mbps
      
      // AV1-optimized bitrates: Lower than VP9 but sufficient for smooth playback
      // AV1 achieves same quality at 30-40% lower bitrates, so we can use less while maintaining smoothness
      if (pixels <= 640 * 480) {
        // For AV1: 700k-1.8Mbps (vs VP9: 800k-2Mbps) - smaller files, same smoothness
        bitrate = Math.min(bitrate, 1800000); // Max 1.8 Mbps for 480p
        bitrate = Math.max(bitrate, 700000); // Min 700 kbps (AV1 can be lower than VP9)
      } else if (pixels <= 1280 * 720) {
        // For AV1: 1.2M-3Mbps (vs VP9: 1.5M-3.5Mbps)
        bitrate = Math.min(bitrate, 3000000); // Max 3 Mbps for 720p
        bitrate = Math.max(bitrate, 1200000); // Min 1.2 Mbps
      } else if (pixels <= 1920 * 1080) {
        // For AV1: 2.5M-5Mbps (vs VP9: 3M-6Mbps) - significant storage savings
        bitrate = Math.min(bitrate, 5000000); // Max 5 Mbps for 1080p
        bitrate = Math.max(bitrate, 2500000); // Min 2.5 Mbps
      } else {
        // For AV1: 6M-12Mbps (vs VP9: 8M-15Mbps)
        bitrate = Math.min(bitrate, 12000000); // Max 12 Mbps for 4K
        bitrate = Math.max(bitrate, 6000000); // Min 6 Mbps
      }
      
      return Math.round(bitrate);
    };

    // Calculate optimal frame rate (cap at 30fps for better compression)
    const calculateOptimalFrameRate = (originalFps: number): number => {
      // For web, 30fps is usually sufficient and reduces file size
      return Math.min(originalFps, 30);
    };

    const cleanup = () => {
      if (video.src) {
        URL.revokeObjectURL(video.src);
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      video.pause();
      video.src = '';
    };

    video.onloadedmetadata = () => {
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        // Calculate optimal settings
        const optimalBitrate = calculateOptimalBitrate(width, height, quality);
        const optimalFps = calculateOptimalFrameRate(30); // Default to 30fps
        
        console.log(`Video conversion settings: ${width}x${height}, ${optimalBitrate/1000}kbps, ${optimalFps}fps, quality: ${quality}`);

        // Create canvas for video capture
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const canvasStream = canvas.captureStream(optimalFps);
        
        // Get audio tracks from the video element
        // Use captureStream() on video element to get both video and audio
        let audioTracks: MediaStreamTrack[] = [];
        let hasAudio = false;
        
        // Try to capture audio from video element using captureStream
        try {
          // Check if video has audio by trying to access audio tracks
          if ((video as any).captureStream) {
            const videoMediaStream = (video as any).captureStream();
            audioTracks = videoMediaStream.getAudioTracks();
            hasAudio = audioTracks.length > 0;
          } else if ((video as any).mozCaptureStream) {
            // Firefox fallback
            const videoMediaStream = (video as any).mozCaptureStream();
            audioTracks = videoMediaStream.getAudioTracks();
            hasAudio = audioTracks.length > 0;
          }
        } catch (e) {
          console.warn('Could not capture audio from video element (CORS or browser limitation):', e);
          // Audio capture may fail due to CORS restrictions
        }
        
        // Combine video stream from canvas with audio tracks
        const stream = new MediaStream();
        
        // Add video track from canvas
        canvasStream.getVideoTracks().forEach(track => {
          stream.addTrack(track);
        });
        
        // Add audio tracks if available
        if (hasAudio && audioTracks.length > 0) {
          audioTracks.forEach(track => {
            stream.addTrack(track);
          });
          console.log(`Audio detected: ${audioTracks.length} audio track(s) will be included`);
        } else {
          console.warn('No audio tracks found. Video will be converted without audio.');
        }
        
        videoStream = stream;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Get codec with audio support if audio is available
        const codecWithAudio = getCodec(hasAudio);

        // Create MediaRecorder with optimized settings for smooth playback
        const recorderOptions: MediaRecorderOptions = {
          mimeType: codecWithAudio,
          videoBitsPerSecond: optimalBitrate,
          // Audio bitrate for good quality audio (128kbps is standard for web)
          audioBitsPerSecond: hasAudio ? 128000 : undefined
        };

        mediaRecorder = new MediaRecorder(stream, recorderOptions);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const originalSize = file.size;
          const newSize = blob.size;
          const compressionRatio = ((originalSize - newSize) / originalSize * 100).toFixed(1);
          
          console.log(`Video compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);
          
          const webmFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webm'), {
            type: 'video/webm',
            lastModified: Date.now()
          });
          cleanup();
          resolve(webmFile);
        };

        mediaRecorder.onerror = (event) => {
          cleanup();
          reject(new Error('Failed to convert video to WebM'));
        };

        // Start recording
        mediaRecorder.start();

        // Draw video frames to canvas
        let lastFrameTime = 0;
        const targetFrameInterval = 1000 / optimalFps; // ms per frame
        
        const drawFrame = (currentTime: number) => {
          if (video.ended || video.paused || !mediaRecorder || mediaRecorder.state === 'inactive') {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            return;
          }
          
          // Throttle frame rate
          if (currentTime - lastFrameTime >= targetFrameInterval) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            lastFrameTime = currentTime;
          }
          
          requestAnimationFrame(drawFrame);
        };

        video.play().then(() => {
          requestAnimationFrame(drawFrame);
        }).catch((err) => {
          cleanup();
          reject(new Error('Failed to play video: ' + err.message));
        });
      } catch (error) {
        cleanup();
        reject(new Error('Failed to initialize conversion: ' + (error as Error).message));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for conversion'));
    };

    video.onended = () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };

    // Load the video
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
  });
};


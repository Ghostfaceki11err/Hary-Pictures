import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent, useRef, useCallback, memo } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Category, Picture, ToastType, ToastItem, AdminSection, SortMode, StorageUsage, ActivityItem } from './types';
import { convertToWebP } from './utils/convertToWebP';
import { STORAGE_BUCKET, STORAGE_PREFIX } from './utils/constants';
import { AdminMenuBar } from './components/AdminMenuBar';
import { OverviewSection } from './components/OverviewSection';
import { DashboardSection } from './components/DashboardSection';
import { MediaUploadSection } from './components/MediaUploadSection';
import { CategoryManagement } from './components/CategoryManagement';
import { GalleryView } from './components/GalleryView';
import { ProfilePictureManager } from './components/ProfilePictureManager';
import { HeroImageManager } from './components/HeroImageManager';
import { ToastContainer } from './components/ToastContainer';
import { DeleteModals } from './components/DeleteModals';

interface AdminPanelProps { initialSection?: AdminSection }

const AdminPanel: React.FC<AdminPanelProps> = memo(({ initialSection = 'dashboard' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [selectedFilterCategoryId, setSelectedFilterCategoryId] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [newCategoryAm, setNewCategoryAm] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [customLightboxSlides, setCustomLightboxSlides] = useState<Array<{ src: string; title?: string; description?: string }> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgresses, setUploadProgresses] = useState<{ [key: string]: number }>({});
  const [deletingPictureId, setDeletingPictureId] = useState<string | null>(null);
  const [useUrlUpload, setUseUrlUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetCategoryId, setDeleteTargetCategoryId] = useState<string | null>(null);
  const [deleteTargetInfo, setDeleteTargetInfo] = useState<{ name_am: string; slug: string } | null>(null);
  const [deleteAlsoImages, setDeleteAlsoImages] = useState(false);
  const [deleteImageCount, setDeleteImageCount] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeletePicModalOpen, setIsDeletePicModalOpen] = useState(false);
  const [deleteTargetPictureId, setDeleteTargetPictureId] = useState<string | null>(null);
  const [deleteTargetPictureUrl, setDeleteTargetPictureUrl] = useState<string | null>(null);
  const [deletePicLoading, setDeletePicLoading] = useState(false);

  // Profile picture category protection states
  const [isProfileDeleteConfirmOpen, setIsProfileDeleteConfirmOpen] = useState(false);
  const [profileDeleteStep, setProfileDeleteStep] = useState(1); // 1 or 2 for double confirmation

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Storage usage state
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    used: 0,
    total: 1024 * 1024 * 1024, // 1GB in bytes
    loading: true,
    error: null
  });

  // About Me State
  const [profilePictureLoading, setProfilePictureLoading] = useState(false);
  const [profilePictureCategory, setProfilePictureCategory] = useState<Category | null>(null);
  const [showCreateProfileCategory, setShowCreateProfileCategory] = useState(false);
  const [showAboutMeDeleteModal, setShowAboutMeDeleteModal] = useState(false);
  const [aboutMeImageToDelete, setAboutMeImageToDelete] = useState<string | null>(null);

  // Profile Picture Upload State
  const [profileUploadFiles, setProfileUploadFiles] = useState<File[]>([]);
  const [profileUploadTitle, setProfileUploadTitle] = useState('');
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [profileUploadProgress, setProfileUploadProgress] = useState<{ [key: string]: number }>({});
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Hero State
  const [heroPictureLoading, setHeroPictureLoading] = useState(false);
  const [heroCategory, setHeroCategory] = useState<Category | null>(null);
  const [showCreateHeroCategory, setShowCreateHeroCategory] = useState(false);
  // no separate modal state for hero delete; we use confirm()

  // Hero Upload State
  const [heroUploadFiles, setHeroUploadFiles] = useState<File[]>([]);
  const [heroUploadTitle, setHeroUploadTitle] = useState('');
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  // progress UI not shown for hero; keep simple
  const [showHeroUpload, setShowHeroUpload] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // WebP conversion states
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<{ [key: string]: number }>({});
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [filesToConvert, setFilesToConvert] = useState<File[]>([]);
  const [webpFiles, setWebpFiles] = useState<File[]>([]);

  // Authentication state
  const [userEmail, setUserEmail] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Admin navigation (menu bar + bottom nav)
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);

  // Activity tracking
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const openCustomLightbox = useCallback((images: Array<{ src: string; title?: string; description?: string }>, startIndex: number = 0) => {
    setCustomLightboxSlides(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  }, []);

  const handleDeleteClick = useCallback((pictureId: string, imageUrl: string) => {
    setIsDeletePicModalOpen(true);
    setDeleteTargetPictureId(pictureId);
    setDeleteTargetPictureUrl(imageUrl);
  }, []);

  const handleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedFilterCategoryId(categoryId);
  }, []);

  const handleSortChange = useCallback((sort: SortMode) => {
    setSortMode(sort);
  }, []);


  // Authentication check function
  const checkAuthentication = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Authentication failed:', error);
        // Redirect to login by clearing session
        await supabase.auth.signOut();
        window.location.href = '/admin';
        return false;
      }

      setUserEmail(user.email || '');
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      await supabase.auth.signOut();
      window.location.href = '/admin';
      return false;
    }
  }, []);

  // Logout function
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      showToast('info', 'You have been logged out');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('error', 'Logout failed');
    }
  }, [showToast]);




  const uploadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories, pictures, and storage usage on load
  useEffect(() => {
    fetchCategories();
    fetchPictures();
    fetchStorageUsage();
    fetchAboutMeCategory();
    fetchHeroCategory();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('id,name_am,slug');
    if (error) console.error(error);
    else setCategories(data || []);
  }

  async function loadCategoryImageCount(categoryId: string) {
    const { count, error } = await supabase
      .from('pictures')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);
    if (error) {
      console.error('Count pictures error:', error);
      return null;
    }
    return count ?? 0;
  }

  async function fetchPictures() {
    const { data, error } = await supabase
      .from('pictures')
      .select('id, title, image_url, categories(id, name_am, slug)');
    if (error) console.error(error);
    else {
      // Transform pictures data to handle Supabase's array return for categories
      const transformedPictures = (data || []).map(picture => ({
        ...picture,
        categories: Array.isArray(picture.categories) ? picture.categories[0] || null : picture.categories
      }));
      setPictures(transformedPictures);
    }
  }

  async function fetchStorageUsage() {
    try {
      setStorageUsage(prev => ({ ...prev, loading: true, error: null }));
      
      // List all files in the bucket
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(STORAGE_PREFIX, {
          limit: 1000, // Adjust based on your needs
          offset: 0,
        });

      if (error) {
        throw new Error(`Failed to fetch storage data: ${error.message}`);
      }

      // Calculate total size by summing file sizes
      let totalSize = 0;
      if (files && files.length > 0) {
        // Get file metadata for each file to get size
        const filePromises = files.map(async (file) => {
          const { data: fileData, error: fileError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(`${STORAGE_PREFIX}/${file.name}`, {
              limit: 1000,
              offset: 0,
            });
          
          if (!fileError && fileData) {
            return fileData.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
          }
          return 0;
        });

        const folderSizes = await Promise.all(filePromises);
        totalSize = folderSizes.reduce((sum, size) => sum + size, 0);
      }

      setStorageUsage({
        used: totalSize,
        total: 1024 * 1024 * 1024, // 1GB
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      setStorageUsage(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch storage usage'
      }));
    }
  }

  // Helper functions for storage usage
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };


  // Helper function to check if a category is the About Me category
  const isAboutMeCategory = (category: Category): boolean => {
    return category.name_am === 'About Me' && category.slug === 'about-me';
  };
  // Helper function to check if a category is the Hero category
  const isHeroCategory = (category: Category): boolean => {
    return category.name_am === 'Hero' && category.slug === 'hero';
  };

  // About Me Image Functions
  const fetchAboutMeCategory = async () => {
    try {
      setProfilePictureLoading(true);
      
      // Check if About Me category exists
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name_am, slug')
        .eq('name_am', 'About Me')
        .eq('slug', 'about-me')
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') {
        console.error('Error fetching about me category:', categoryError);
        return;
      }

      if (categoryData) {
        setProfilePictureCategory(categoryData);
        setShowCreateProfileCategory(false);
      } else {
        setProfilePictureCategory(null);
        setShowCreateProfileCategory(true);
      }
    } catch (err) {
      console.error('Error fetching about me category:', err);
    } finally {
      setProfilePictureLoading(false);
    }
  };

  const createAboutMeCategory = async () => {
    try {
      setProfilePictureLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name_am: 'About Me', // Fixed name, cannot be changed
          slug: 'about-me'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfilePictureCategory(data);
      setShowCreateProfileCategory(false);
      setCategories(prev => [...prev, data]);
      showToast('success', 'About Me category created successfully!');
    } catch (err) {
      console.error('Error creating about me category:', err);
      showToast('error', 'Failed to create about me category');
    } finally {
      setProfilePictureLoading(false);
    }
  };

  // Hero Image Functions
  const fetchHeroCategory = async () => {
    try {
      setHeroPictureLoading(true);
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name_am, slug')
        .eq('name_am', 'Hero')
        .eq('slug', 'hero')
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') {
        console.error('Error fetching hero category:', categoryError);
        return;
      }

      if (categoryData) {
        setHeroCategory(categoryData);
        setShowCreateHeroCategory(false);
      } else {
        setHeroCategory(null);
        setShowCreateHeroCategory(true);
      }
    } catch (err) {
      console.error('Error fetching hero category:', err);
    } finally {
      setHeroPictureLoading(false);
    }
  };

  const createHeroCategory = async () => {
    try {
      setHeroPictureLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert({ name_am: 'Hero', slug: 'hero' })
        .select()
        .single();

      if (error) throw error;

      setHeroCategory(data);
      setShowCreateHeroCategory(false);
      setCategories(prev => [...prev, data]);
      showToast('success', 'Hero category created successfully!');
    } catch (err) {
      console.error('Error creating hero category:', err);
      showToast('error', 'Failed to create hero category');
    } finally {
      setHeroPictureLoading(false);
    }
  };


  // Profile Picture Upload Functions
  const handleProfileFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      // Validate each file for supported formats
      for (const file of selectedFiles) {
        const isSupportedType = file.type.match(/^image\/(jpeg|jpg|png|webp)$/) || 
                               file.name.toLowerCase().match(/\.(jfif|jpe)$/);
        
        if (!isSupportedType) {
          showToast('error', `File "${file.name}" is not a supported image format. Profile pictures must be PNG, JPG, JFIF, or WebP format.`);
          continue;
        }
        validFiles.push(file);
      }
      
      if (validFiles.length === 0) {
        e.target.value = '';
        return;
      }
      
      setProfileUploadFiles(validFiles);
    }
  };

  const handleAboutMeUpload = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!profilePictureCategory) {
      showToast('error', 'About Me category not found');
      return;
    }

    if (profileUploadFiles.length === 0) {
      showToast('error', 'Please select a WebP image');
      return;
    }

    // Only allow one image for About Me
    if (profileUploadFiles.length > 1) {
      showToast('error', 'Only one image is allowed for About Me section');
      return;
    }

    // Check if About Me category already has images
    if (aboutMePictures.length > 0) {
      showToast('error', 'About Me section already has an image. Please delete the existing image first.');
      return;
    }


    setIsProfileUploading(true);
    setProfileUploadProgress({});

    try {
      const file = profileUploadFiles[0];
      const fileKey = `${file.name}-0`;
      
      // Upload to Supabase Storage
      const filePath = `${STORAGE_PREFIX}/${profilePictureCategory.slug}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Insert into database
      const { error: dbError } = await supabase
        .from('pictures')
        .insert({
          title: profileUploadTitle || file.name.replace('.webp', ''),
          image_url: publicUrl,
          category_id: profilePictureCategory.id
        });

      if (dbError) {
        throw new Error(`Failed to save ${file.name} to database: ${dbError.message}`);
      }

      // Update progress
      setProfileUploadProgress(prev => ({
        ...prev,
        [fileKey]: 100
      }));


      // Refresh data
      await fetchPictures();
      await fetchStorageUsage();
      
      // Clear form
      setProfileUploadFiles([]);
      setProfileUploadTitle('');
      setShowProfileUpload(false);
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = '';
      }

      showToast('success', 'About Me image updated successfully!');
    } catch (err) {
      console.error('About me upload error:', err);
      showToast('error', err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsProfileUploading(false);
      setProfileUploadProgress({});
    }
  };

  // Handle About Me image delete confirmation
  const handleAboutMeDeleteClick = (pictureId: string) => {
    setAboutMeImageToDelete(pictureId);
    setShowAboutMeDeleteModal(true);
  };

  // Delete specific About Me image
  const deleteSpecificAboutMeImage = async (pictureId: string) => {
    try {
      setProfilePictureLoading(true);
      
      // First, get the image URL from database to extract the file path
      const { data: pictureData, error: fetchError } = await supabase
        .from('pictures')
        .select('image_url')
        .eq('id', pictureId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch image data: ${fetchError.message}`);
      }

      // Extract file path from the image URL
      const imageUrl = pictureData.image_url;
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      const filePath = `${STORAGE_PREFIX}/${folderPath}/${fileName}`;

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('pictures')
        .delete()
        .eq('id', pictureId);

      if (deleteError) {
        throw new Error(`Failed to delete from database: ${deleteError.message}`);
      }

      await fetchPictures();
      await fetchStorageUsage();
      
      showToast('success', 'About Me image deleted successfully!');
      setShowAboutMeDeleteModal(false);
      setAboutMeImageToDelete(null);
    } catch (err) {
      console.error('Error deleting about me image:', err);
      showToast('error', 'Failed to delete about me image');
    } finally {
      setProfilePictureLoading(false);
    }
  };

  // Hero Upload Functions
  const handleHeroFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      for (const file of selectedFiles) {
        const isSupportedType = file.type.match(/^image\/(jpeg|jpg|png|webp)$/) || 
                               file.name.toLowerCase().match(/\.(jfif|jpe)$/);
        if (!isSupportedType) {
          showToast('error', `File "${file.name}" is not a supported image format. Hero images must be PNG, JPG, JFIF, or WebP format.`);
          continue;
        }
        validFiles.push(file);
      }
      if (validFiles.length === 0) {
        e.target.value = '';
        return;
      }
      setHeroUploadFiles(validFiles);
    }
  };

  const handleHeroUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!heroCategory) {
      showToast('error', 'Hero category not found');
      return;
    }
    if (heroUploadFiles.length === 0) {
      showToast('error', 'Please select an image');
      return;
    }
    if (heroUploadFiles.length > 1) {
      showToast('error', 'Only one image is allowed for the Hero section');
      return;
    }
    if (heroPictures.length > 0) {
      showToast('error', 'Hero section already has an image. Please delete the existing image first.');
      return;
    }

    setIsHeroUploading(true);
    try {
      const file = heroUploadFiles[0];
      // Convert to WebP if needed (uses the same utility as main upload)
      const fileForUpload = await convertToWebP(file, 0.8).catch(() => file);
      const webpName = file.name.replace(/\.(jpg|jpeg|png|jfif|jpe)$/i, '.webp');
      const filePath = `${STORAGE_PREFIX}/${heroCategory.slug}/${Date.now()}-${webpName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileForUpload, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('pictures')
        .insert({
          title: heroUploadTitle || webpName.replace('.webp', ''),
          image_url: publicUrl,
          category_id: heroCategory.id
        });
      if (dbError) throw new Error(`Failed to save ${file.name} to database: ${dbError.message}`);

      await fetchPictures();
      await fetchStorageUsage();
      setHeroUploadFiles([]);
      setHeroUploadTitle('');
      setShowHeroUpload(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
      showToast('success', 'Hero image updated successfully!');
    } catch (err) {
      console.error('Hero upload error:', err);
      showToast('error', err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsHeroUploading(false);
    }
  };

  const handleHeroDeleteClick = (pictureId: string) => {
    // Simple confirm for now
    if (window.confirm('Delete this Hero image?')) {
      deleteSpecificHeroImage(pictureId);
    }
  };

  const deleteSpecificHeroImage = async (pictureId: string) => {
    try {
      setHeroPictureLoading(true);
      const { data: pictureData, error: fetchError } = await supabase
        .from('pictures')
        .select('image_url')
        .eq('id', pictureId)
        .single();
      if (fetchError) throw new Error(`Failed to fetch image data: ${fetchError.message}`);

      const imageUrl = pictureData.image_url;
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      const filePath = `${STORAGE_PREFIX}/${folderPath}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      const { error: deleteError } = await supabase
        .from('pictures')
        .delete()
        .eq('id', pictureId);
      if (deleteError) throw new Error(`Failed to delete from database: ${deleteError.message}`);

      await fetchPictures();
      await fetchStorageUsage();
      showToast('success', 'Hero image deleted successfully!');
    } catch (err) {
      console.error('Error deleting hero image:', err);
      showToast('error', 'Failed to delete hero image');
    } finally {
      setHeroPictureLoading(false);
    }
  };

  // Get pictures from About Me category only
  const aboutMePictures = useMemo(() => {
    if (!profilePictureCategory) return [];
    return pictures.filter(pic => pic.categories?.id === profilePictureCategory.id);
  }, [pictures, profilePictureCategory]);

  // Get pictures from Hero category only
  const heroPictures = useMemo(() => {
    if (!heroCategory) return [];
    return pictures.filter(pic => pic.categories?.id === heroCategory.id);
  }, [pictures, heroCategory]);

  // Derived maps for counts and previews (excluding About Me category)
  const categoryIdToCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const pic of pictures) {
      const cid = pic.categories?.id;
      if (!cid || isAboutMeCategory(pic.categories)) continue;
      map[cid] = (map[cid] || 0) + 1;
    }
    return map;
  }, [pictures]);

  const categoryIdToPreview = useMemo(() => {
    const map: Record<string, string> = {};
    for (const pic of pictures) {
      const cid = pic.categories?.id;
      if (!cid || isAboutMeCategory(pic.categories) || map[cid]) continue;
      map[cid] = pic.image_url;
    }
    return map;
  }, [pictures]);

  // Memoized filtered pictures for gallery
  const filteredPictures = useMemo(() => {
    return pictures
      .filter(pic => {
        // Filter out pictures from About Me category
        if (pic.categories && (isAboutMeCategory(pic.categories) || isHeroCategory(pic.categories))) {
          return false;
        }
        // Apply category filter
        return !selectedFilterCategoryId || pic.categories?.id === selectedFilterCategoryId;
      })
      .sort((a, b) => {
        if (sortMode === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [pictures, selectedFilterCategoryId, sortMode]);

  // Memoized lightbox slides

  // URL sync (persist selection, search, sort)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedFilterCategoryId) params.set('cat', selectedFilterCategoryId); else params.delete('cat');
    if (sortMode && sortMode !== 'newest') params.set('sort', sortMode); else params.delete('sort');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedFilterCategoryId, sortMode]);

  // Initialize authentication check
  useEffect(() => {
    // Check authentication on component mount
    checkAuthentication();

    // Set up periodic authentication check (every 30 seconds)
    const authCheckInterval = setInterval(() => {
      checkAuthentication();
    }, 30000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setUserEmail('');
        window.location.href = '/admin';
      } else if (event === 'SIGNED_IN' && session) {
        setUserEmail(session.user?.email || '');
        setIsAuthenticated(true);
      }
    });

    return () => {
      clearInterval(authCheckInterval);
      subscription.unsubscribe();
    };
  }, [checkAuthentication]);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const sort = (params.get('sort') as 'newest' | 'oldest' | 'title') || 'newest';
    if (cat) setSelectedFilterCategoryId(cat);
    setSortMode(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add new category (name_am + slug)
  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    const am = newCategoryAm.trim();
    const slug = newCategorySlug.trim().toLowerCase();
    if (!am || !slug) return showToast('error', 'Please provide both Amharic name and file name');
    if (!/^[a-z0-9-]+$/.test(slug)) return showToast('error', 'File name can only contain lowercase letters, numbers, and dashes');

    setIsAddingCategory(true);

    if (editingCategoryId) {
      const { error } = await supabase
        .from('categories')
        .update({ name_am: am, slug })
        .eq('id', editingCategoryId);
      if (error) {
        console.error(error);
        showToast('error', 'Error updating category: ' + error.message);
      } else {
        addActivity({
          type: 'category_update',
          description: `Updated category "${am}"`,
          categoryName: am,
        });
        setEditingCategoryId(null);
        setNewCategoryAm('');
        setNewCategorySlug('');
        fetchCategories();
        showToast('success', 'Category updated');
      }
      setIsAddingCategory(false);
      return;
    }

    const { error } = await supabase.from('categories').insert([{ name_am: am, slug }]);
    if (error) {
      console.error(error);
      showToast('error', 'Error adding category: ' + error.message);
    } else {
      addActivity({
        type: 'category_create',
        description: `Created category "${am}"`,
        categoryName: am,
      });
      setNewCategoryAm('');
      setNewCategorySlug('');
      fetchCategories();
      showToast('success', 'Category added');
    }
    setIsAddingCategory(false);
  }

  // Handle file input - Multiple files (PNG, JPG, JFIF, WebP)
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      // Validate each file
      for (const file of selectedFiles) {
        const isSupportedType = file.type.match(/^image\/(jpeg|jpg|png|webp)$/) || 
                               file.name.toLowerCase().match(/\.(jfif|jpe)$/);
        
        if (!isSupportedType) {
          const isAboutMeCategory = selectedCategory === profilePictureCategory?.id;
          const message = isAboutMeCategory 
            ? `File "${file.name}" is not a supported image format. About Me images must be PNG, JPG, JFIF, or WebP format.`
            : `File "${file.name}" is not a supported image format. Only PNG, JPG, JFIF, and WebP images are allowed.`;
          showToast('error', message);
          continue;
        }
        validFiles.push(file);
      }
      
      if (validFiles.length === 0) {
        e.target.value = '';
        setFiles([]);
        return;
      }
      
      if (validFiles.length < selectedFiles.length) {
        showToast('info', `Selected ${validFiles.length} valid WebP files out of ${selectedFiles.length} total files.`);
      }
      
      setFiles(validFiles);
    }
  }

  // Validate UUID format
  function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  function extractObjectPathFromPublicUrl(imageUrl: string): string | null {
    try {
      const marker = '/storage/v1/object/public/' + STORAGE_BUCKET + '/';
      const idx = imageUrl.indexOf(marker);
      if (idx === -1) return null;
      const pathPart = imageUrl.substring(idx + marker.length);
      return decodeURIComponent(pathPart);
    } catch {
      return null;
    }
  }

  // Upload pictures (WebP-only, path: public/<slug>/<timestamp>.webp)
  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if ((!useUrlUpload && files.length === 0) || (useUrlUpload && !imageUrl) || !selectedCategory) {
      showToast('error', 'Please provide all required fields: files or URL and a category');
      return;
    }


    if (!isValidUUID(selectedCategory)) {
      showToast('error', 'Please select a valid category');
      setSelectedCategory('');
      return;
    }

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) {
      showToast('error', 'Selected category does not exist. Please refresh and try again.');
      setSelectedCategory('');
      return;
    }

    // URL upload path (WebP-only)
    if (useUrlUpload) {
      try {
        const trimmedUrl = imageUrl.trim();
        try { new URL(trimmedUrl); } catch { showToast('error', 'Please provide a valid image URL'); return; }
        if (!trimmedUrl.toLowerCase().endsWith('.webp')) {
          showToast('error', 'Only WebP image URLs are allowed (.webp)');
          return;
        }

        console.log('Uploading picture with (URL mode):', {
          title,
          fileName: null,
          category_id: selectedCategory,
          publicUrl: trimmedUrl
        });

        const { error } = await supabase.from('pictures').insert([{
          title: (title.trim() || category.name_am),
          image_url: trimmedUrl,
          category_id: selectedCategory
        }]);

        if (error) {
          console.error('Supabase DB insert error (URL mode):', error);
          throw new Error(error.message || 'Unknown DB error');
        }

        addActivity({
          type: 'upload',
          description: `Uploaded picture "${title.trim() || category.name_am}" to ${category.name_am}`,
          categoryName: category.name_am,
          pictureTitle: title.trim() || category.name_am,
        });
        setTitle('');
        setImageUrl('');
        setSelectedCategory('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchPictures();
        fetchStorageUsage(); // Refresh storage usage after URL upload
        showToast('success', 'Picture added successfully from URL');
        return;
      } catch (error) {
        const err = error as any;
        const msg = err?.message || JSON.stringify(err);
        console.error('Upload (URL mode) failed:', err);
        showToast('error', 'Upload failed: ' + msg);
        return;
      }
    }

    // File upload path - Check file types and show conversion prompt
    if (files.length === 0) { showToast('error', 'Please select image files'); return; }

    // Separate WebP files from files that need conversion
    const webpFiles = files.filter(file => file.type === 'image/webp');
    const filesToConvert = files.filter(file => 
      file.type.match(/^image\/(jpeg|jpg|png)$/) || 
      file.name.toLowerCase().match(/\.(jfif|jpe)$/)
    );
    const unsupportedFiles = files.filter(file => 
      !file.type.match(/^image\/(jpeg|jpg|png|webp)$/) && 
      !file.name.toLowerCase().match(/\.(jfif|jpe)$/)
    );

    // Show error for unsupported files
    if (unsupportedFiles.length > 0) {
      showToast('error', `Unsupported file format(s): ${unsupportedFiles.map(f => f.name).join(', ')}. Only PNG, JPG, JFIF, and WebP files are allowed.`);
      return;
    }

    // If there are files to convert, show confirmation prompt
    if (filesToConvert.length > 0) {
      setFilesToConvert(filesToConvert);
      setWebpFiles(webpFiles);
      setShowConversionPrompt(true);
      return;
    }

    // If only WebP files, proceed with upload
    await proceedWithUpload(webpFiles);
  };

  const handleConversionConfirm = async () => {
    setShowConversionPrompt(false);
    setIsConverting(true);
    setConversionProgress({});
    
    try {
      const convertedFiles: File[] = [];
      
      // Convert each file to WebP
      for (let i = 0; i < filesToConvert.length; i++) {
        const file = filesToConvert[i];
        const fileKey = `${file.name}-${i}`;
        
        setConversionProgress(prev => ({ ...prev, [fileKey]: 50 }));
        showToast('info', `Converting ${file.name} to WebP format...`);
        
        try {
          const convertedFile = await convertToWebP(file, 0.8);
          convertedFiles.push(convertedFile);
          setConversionProgress(prev => ({ ...prev, [fileKey]: 100 }));
          showToast('success', `Successfully converted ${file.name} to WebP`);
        } catch (conversionError) {
          console.error('Conversion error for', file.name, ':', conversionError);
          showToast('error', `Failed to convert ${file.name} to WebP. Skipping.`);
        }
      }
      
      // Combine converted files with existing WebP files
      const allFiles = [...webpFiles, ...convertedFiles];
      
      // Proceed with upload
      await proceedWithUpload(allFiles);
      
    } catch (error) {
      console.error('Conversion process failed:', error);
      showToast('error', 'Conversion process failed');
    } finally {
      setIsConverting(false);
      setConversionProgress({});
      setFilesToConvert([]);
      setWebpFiles([]);
    }
  };

  const handleConversionCancel = () => {
    setShowConversionPrompt(false);
    setFilesToConvert([]);
    setWebpFiles([]);
    showToast('info', 'Upload cancelled');
  };

  const proceedWithUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    // Get the selected category
    const selectedCategoryData = categories.find(c => c.id === selectedCategory);
    if (!selectedCategoryData) {
      showToast('error', 'Selected category not found');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadProgresses({});
    
    try {
      const uploadResults = [];
      const totalFiles = filesToUpload.length;
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileKey = `${file.name}-${i}`;

      // Upload file to Supabase storage under slug folder
        const finalFileName = `${Date.now()}-${i}.webp`;
      const objectPath = `${STORAGE_PREFIX}/${selectedCategoryData.slug}/${finalFileName}`;
        
        // Set initial progress for this file
        setUploadProgresses(prev => ({ ...prev, [fileKey]: 0 }));
      
      const progressInterval = setInterval(() => {
          setUploadProgresses(prev => {
            const current = prev[fileKey] || 0;
            if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
            return { ...prev, [fileKey]: current + Math.random() * 15 };
        });
      }, 200);
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, file, { upsert: true });

        console.log('Upload response for', file.name, ':', fileData, uploadError);

      clearInterval(progressInterval);
        setUploadProgresses(prev => ({ ...prev, [fileKey]: 100 }));

      if (uploadError || !fileData || !fileData.path) {
        const message = uploadError?.message || 'Upload failed: no file path returned.';
          console.error('Supabase Storage upload error for', file.name, ':', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${message}`);
      }

      // Get public URL for the same object path
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(objectPath);

        console.log('Public URL for', file.name, ':', publicUrl);

      if (typeof publicUrl !== 'string' || publicUrl.trim().length === 0) {
          throw new Error(`Failed to retrieve a valid public URL for ${file.name}.`);
        }

        const derivedTitle = title.trim() || selectedCategoryData.name_am || (file.name.replace(/\.[^.]+$/, '')) || `Picture ${Date.now()}-${i}`;

      const { error } = await supabase.from('pictures').insert([{
        title: derivedTitle,
        image_url: publicUrl,
          category_id: selectedCategoryData.id
      }]);

      if (error) {
          console.error('Supabase DB insert error for', file.name, ':', error);
          throw new Error(`Failed to save ${file.name} to database: ${error.message || 'Unknown DB error'}`);
        }

        uploadResults.push({ fileName: file.name, success: true });
        
        // Update overall progress
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      // Clear form
      setTitle('');
      setFiles([]);
      setSelectedCategory('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPictures();
      fetchStorageUsage(); // Refresh storage usage after upload
      
      const successCount = uploadResults.length;
      // Add activity for successful uploads
      if (successCount > 0) {
        addActivity({
          type: 'upload',
          description: `Uploaded ${successCount > 1 ? `${successCount} pictures` : '1 picture'} to ${selectedCategoryData.name_am}`,
          categoryName: selectedCategoryData.name_am,
        });
      }
      if (successCount === totalFiles) {
        showToast('success', `All ${successCount} pictures uploaded successfully!`);
      } else {
        showToast('success', `${successCount} out of ${totalFiles} pictures uploaded successfully.`);
      }
    } catch (error) {
      const err = error as any;
      const msg = err?.message || JSON.stringify(err);
      console.error('Upload failed:', err);
      showToast('error', 'Upload failed: ' + msg);
    } finally {
      setIsUploading(false);
      setIsConverting(false);
      setUploadProgress(0);
      setUploadProgresses({});
      setConversionProgress({});
    }
  }

  // Delete picture (called from modal)
  async function handleDeletePicture(pictureId: string, imageUrl: string) {
    setDeletingPictureId(pictureId);
    
    
    try {
      // Derive object path from the public URL
      const objectPath = extractObjectPathFromPublicUrl(imageUrl);
      const removePaths = objectPath ? [objectPath] : (() => {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        // Fallback to default prefix without slug (best effort)
        return [`${STORAGE_PREFIX}/${fileName}`];
      })();
      
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(removePaths);

      if (storageError) {
        console.error('Storage error:', storageError);
      }

      const { error } = await supabase
        .from('pictures')
        .delete()
        .eq('id', pictureId);

      if (error) {
        throw error;
      }

      const deletedPicture = pictures.find(p => p.id === pictureId);
      addActivity({
        type: 'delete',
        description: `Deleted picture "${deletedPicture?.title || 'Untitled'}"`,
        categoryName: deletedPicture?.categories?.name_am,
        pictureTitle: deletedPicture?.title,
      });
      fetchPictures();
      fetchStorageUsage(); // Refresh storage usage after deletion
      showToast('success', 'Picture deleted successfully');
    } catch (error) {
      console.error(error);
      showToast('error', 'Error deleting picture: ' + (error as Error).message);
    } finally {
      setDeletingPictureId(null);
    }
  }

  // Delete entire category: remove files under slug folder, delete pictures rows, then category
  /**
   * Deletes a category and all its images from Supabase Storage and DB.
   * @param categoryId The ID of the category to delete
   * @param categorySlug The slug of the category (used as folder name)
   */
  async function handleDeleteCategory(categoryId: string, categorySlug?: string) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return showToast('error', 'Category not found');

    const slugToUse = categorySlug || category.slug;
    if (!categoryId || !slugToUse) {
      showToast('error', 'Category ID and slug are required');
      return;
    }

    setDeletingCategoryId(categoryId);
    try {
      // 1️⃣ List all files under the folder public/<slug>
      const folderPath = `${STORAGE_PREFIX}/${slugToUse}`;
      const { data: files, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folderPath, { limit: 1000 });

      if (listError) throw listError;

      // 2️⃣ Build full object paths to remove
      const pathsToRemove = (files || []).map(file => `${folderPath}/${file.name}`);

      // 3️⃣ Remove files in storage if any
      if (pathsToRemove.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(pathsToRemove);
        if (removeError) throw removeError;
      }

      // 4️⃣ Delete pictures rows in DB
      const { error: picsError } = await supabase
        .from('pictures')
        .delete()
        .eq('category_id', categoryId);
      if (picsError) throw picsError;

      // 5️⃣ Delete category row in DB
      const { error: catError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      if (catError) throw catError;

      console.log(`Category "${slugToUse}" and its images deleted successfully.`);
      showToast('success', `Category "${category.name_am}" and its images deleted successfully.`);

      // Refresh UI
      await fetchCategories();
      await fetchPictures();
    } catch (err) {
      console.error('Delete category failed:', err);
      showToast('error', 'Delete failed: ' + ((err as any)?.message || JSON.stringify(err)));
    } finally {
      setDeletingCategoryId(null);
    }
  }

  // Show loading state while initializing session
  if (!isAuthenticated) {
  return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initializing Session</h2>
          <p className="text-gray-400">Starting your admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements - Reduced on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="hidden sm:block absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="hidden sm:block absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-pink-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Menu Bar */}
      <div className="pt-2">
        <AdminMenuBar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Layout */}
      <section ref={uploadRef} className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main content */}
          <div className="space-y-8">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <OverviewSection
                  categories={categories}
                  pictures={pictures}
                  storageUsage={storageUsage}
                  categoryIdToCount={categoryIdToCount}
                  categoryIdToPreview={categoryIdToPreview}
                  onSectionChange={(section) => setActiveSection(section)}
                  onNewCategory={() => setEditingCategoryId(null)}
                  onUploadClick={() => {
                    setActiveSection('media');
                    setTimeout(() => {
                      uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                />
              )}

              {/* Dashboard Section */}
              {activeSection === 'dashboard' && (
                <DashboardSection
                  categories={categories}
                  pictures={pictures}
                  storageUsage={storageUsage}
                  categoryIdToCount={categoryIdToCount}
                  activities={activities}
                />
              )}

              {/* Enhanced Category Management - Categories */}
              {activeSection === 'categories' && (
                <CategoryManagement
                  categories={categories}
                  newCategoryAm={newCategoryAm}
                  setNewCategoryAm={setNewCategoryAm}
                  newCategorySlug={newCategorySlug}
                  setNewCategorySlug={setNewCategorySlug}
                  editingCategoryId={editingCategoryId}
                  setEditingCategoryId={setEditingCategoryId}
                  isAddingCategory={isAddingCategory}
                  handleAddCategory={handleAddCategory}
                  deletingCategoryId={deletingCategoryId}
                  categoryIdToCount={categoryIdToCount}
                  onDeleteCategory={async (category) => {
                    setIsDeleteModalOpen(true);
                    setDeleteTargetCategoryId(category.id);
                    setDeleteTargetInfo({ name_am: category.name_am, slug: category.slug });
                    setDeleteAlsoImages(false);
                    setDeleteImageCount(null);
                    const count = await loadCategoryImageCount(category.id);
                    setDeleteImageCount(count);
                  }}
                  onDeleteProfileCategory={(category) => {
                    setIsProfileDeleteConfirmOpen(true);
                    setDeleteTargetCategoryId(category.id);
                    setDeleteTargetInfo({ name_am: category.name_am, slug: category.slug });
                    setProfileDeleteStep(1);
                  }}
                  loadCategoryImageCount={loadCategoryImageCount}
                />
              )}

              {/* Mobile bottom nav */}
              <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%]">
                <div className="flex items-center justify-around bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-2">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'media', label: 'Media' },
                    { id: 'categories', label: 'Categories' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium ${
                        activeSection === item.id ? 'bg-white/20 text-white' : 'text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile section - Media */}
              {activeSection === 'media' && (
                <ProfilePictureManager
                  profilePictureLoading={profilePictureLoading}
                  showCreateProfileCategory={showCreateProfileCategory}
                  profilePictureCategory={profilePictureCategory}
                  aboutMePictures={aboutMePictures}
                  onCreateCategory={createAboutMeCategory}
                  onCancelCreate={() => setShowCreateProfileCategory(false)}
                  onShowUpload={() => setShowProfileUpload(true)}
                  onImageClick={openCustomLightbox}
                  onDeleteClick={handleAboutMeDeleteClick}
                  showToast={showToast}
                />
              )}

              {/* Hero section - Media */}
              {activeSection === 'media' && (
                <>
                  <HeroImageManager
                    heroPictureLoading={heroPictureLoading}
                    showCreateHeroCategory={showCreateHeroCategory}
                    heroCategory={heroCategory}
                    heroPictures={heroPictures}
                    onCreateCategory={createHeroCategory}
                    onCancelCreate={() => setShowCreateHeroCategory(false)}
                    onShowUpload={() => setShowHeroUpload(true)}
                    onImageClick={openCustomLightbox}
                    onDeleteClick={handleHeroDeleteClick}
                    showToast={showToast}
                  />

                  {/* Upload Drawer */}
                  {showHeroUpload && heroCategory && (
                    <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                      <form onSubmit={handleHeroUpload} className="space-y-3">
                        <input
                          ref={heroFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleHeroFileChange}
                          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                        />
                        <input
                          type="text"
                          value={heroUploadTitle}
                          onChange={(e) => setHeroUploadTitle(e.target.value)}
                          placeholder="Optional title"
                          className="w-full px-3 py-2 rounded-lg bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isHeroUploading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            {isHeroUploading ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowHeroUpload(false)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}

              {/* Enhanced Upload Section - Media only */}
              {activeSection === 'media' && (
                <MediaUploadSection
                  title={title}
                  setTitle={setTitle}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                  files={files}
                  setFiles={setFiles}
                  handleFileChange={handleFileChange}
                  useUrlUpload={useUrlUpload}
                  setUseUrlUpload={setUseUrlUpload}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  handleUpload={handleUpload}
                  isUploading={isUploading}
                  isConverting={isConverting}
                  uploadProgress={uploadProgress}
                  uploadProgresses={uploadProgresses}
                  conversionProgress={conversionProgress}
                  profilePictureCategory={profilePictureCategory}
                  isValidUUID={isValidUUID}
                />
              )}

              {/* Enhanced Gallery - Gallery only */}
              {activeSection === 'gallery' && (
                <GalleryView
                  pictures={pictures}
                  categories={categories}
                  filteredPictures={filteredPictures}
                  selectedFilterCategoryId={selectedFilterCategoryId}
                  sortMode={sortMode}
                  onCategoryFilter={handleCategoryFilter}
                  onSortChange={handleSortChange}
                  categoryIdToCount={categoryIdToCount}
                  categoryIdToPreview={categoryIdToPreview}
                  lightboxOpen={lightboxOpen}
                  lightboxIndex={lightboxIndex}
                  customLightboxSlides={customLightboxSlides}
                  onImageClick={handleImageClick}
                  onCloseLightbox={() => { setLightboxOpen(false); setCustomLightboxSlides(null); }}
                  onDeleteClick={handleDeleteClick}
                  deletingPictureId={deletingPictureId}
                />
              )}
          </div>
        </div>
      </section>

      <DeleteModals
        isDeletePicModalOpen={isDeletePicModalOpen}
        deleteTargetPictureId={deleteTargetPictureId}
        deleteTargetPictureUrl={deleteTargetPictureUrl}
        deletePicLoading={deletePicLoading}
        onCloseDeletePicModal={() => { setIsDeletePicModalOpen(false); setDeleteTargetPictureId(null); setDeleteTargetPictureUrl(null); }}
        onConfirmDeletePicture={async () => {
          if (!deleteTargetPictureId || !deleteTargetPictureUrl) return;
          setDeletePicLoading(true);
          try {
            await handleDeletePicture(deleteTargetPictureId, deleteTargetPictureUrl);
            setIsDeletePicModalOpen(false);
            setDeleteTargetPictureId(null);
            setDeleteTargetPictureUrl(null);
          } finally {
            setDeletePicLoading(false);
          }
        }}
        isDeleteModalOpen={isDeleteModalOpen}
        deleteTargetCategoryId={deleteTargetCategoryId}
        deleteTargetInfo={deleteTargetInfo}
        deleteImageCount={deleteImageCount}
        deleteAlsoImages={deleteAlsoImages}
        setDeleteAlsoImages={setDeleteAlsoImages}
        deleteLoading={deleteLoading}
        categories={categories}
        onCloseDeleteCategoryModal={() => { setIsDeleteModalOpen(false); setDeleteTargetCategoryId(null); setDeleteTargetInfo(null); }}
        onConfirmDeleteCategory={async () => {
          if (deleteImageCount && deleteImageCount > 0 && !deleteAlsoImages) {
            showToast('info', 'This category has images. Check the box to also delete images, or cancel.');
            return;
          }
          setDeleteLoading(true);
          try {
            const catId = deleteTargetCategoryId;
            const cat = categories.find(c => c.id === catId);
            if (!cat) throw new Error('Category not found');

            if (deleteAlsoImages) {
              const listPath = `${STORAGE_PREFIX}/${cat.slug}`;
              const { data: files, error: listError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .list(listPath, { limit: 1000 });
              if (listError) throw listError;
              const pathsToRemove = (files || [])
                .filter(item => item && item.name)
                .map(item => `${listPath}/${item.name}`);
              if (pathsToRemove.length > 0) {
                const { error: rmErr } = await supabase.storage
                  .from(STORAGE_BUCKET)
                  .remove(pathsToRemove);
                if (rmErr) throw rmErr;
              }
              const { error: picsErr } = await supabase
                .from('pictures')
                .delete()
                .eq('category_id', catId);
              if (picsErr) throw picsErr;
            }

            const { error: catErr } = await supabase
              .from('categories')
              .delete()
              .eq('id', catId);
            if (catErr) throw catErr;

            addActivity({
              type: 'category_delete',
              description: `Deleted category "${deleteTargetInfo.name_am}"${deleteAlsoImages ? ` with ${deleteImageCount} pictures` : ''}`,
              categoryName: deleteTargetInfo.name_am,
            });
            await fetchCategories();
            await fetchPictures();
            setIsDeleteModalOpen(false);
            setDeleteTargetCategoryId(null);
            setDeleteTargetInfo(null);
            showToast('success', 'Category deleted successfully');
          } catch (err) {
            console.error('Delete category failed:', err);
            showToast('error', 'Delete failed: ' + ((err as any)?.message || JSON.stringify(err)));
          } finally {
            setDeleteLoading(false);
          }
        }}
        showToast={showToast}
        isProfileDeleteConfirmOpen={isProfileDeleteConfirmOpen}
        profileDeleteStep={profileDeleteStep}
        setProfileDeleteStep={setProfileDeleteStep}
        onCloseProfileDeleteModal={() => {
          setIsProfileDeleteConfirmOpen(false);
          setDeleteTargetCategoryId(null);
          setDeleteTargetInfo(null);
          setProfileDeleteStep(1);
        }}
        onConfirmDeleteProfileCategory={async () => {
          setDeleteLoading(true);
          try {
            await handleDeleteCategory(deleteTargetCategoryId!, deleteTargetInfo!.slug);
            setProfilePictureCategory(null);
            setShowCreateProfileCategory(true);
            setIsProfileDeleteConfirmOpen(false);
            setDeleteTargetCategoryId(null);
            setDeleteTargetInfo(null);
            setProfileDeleteStep(1);
            showToast('success', 'Profile picture category deleted. You no longer have a profile picture.');
          } catch (err) {
            console.error('Delete profile category failed:', err);
            showToast('error', 'Delete failed: ' + ((err as any)?.message || 'Unknown error'));
          } finally {
            setDeleteLoading(false);
          }
        }}
        showAboutMeDeleteModal={showAboutMeDeleteModal}
        aboutMeImageToDelete={aboutMeImageToDelete}
        profilePictureLoading={profilePictureLoading}
        onCloseAboutMeDeleteModal={() => {
          setShowAboutMeDeleteModal(false);
          setAboutMeImageToDelete(null);
        }}
        onConfirmDeleteAboutMeImage={() => {
          if (aboutMeImageToDelete) {
            deleteSpecificAboutMeImage(aboutMeImageToDelete);
          }
        }}
      />

      {/* Profile Picture Upload Modal */}
      {showProfileUpload && profilePictureCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Upload About Me Image
              </h3>
              <button
                onClick={() => {
                  setShowProfileUpload(false);
                  setProfileUploadFiles([]);
                  setProfileUploadTitle('');
                  if (profileFileInputRef.current) {
                    profileFileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAboutMeUpload} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Picture Title (Optional):</label>
                <input
                  type="text"
                  value={profileUploadTitle}
                  onChange={(e) => setProfileUploadTitle(e.target.value)}
                  placeholder="e.g., Professional Headshot"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Select WebP Images:</label>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  onChange={handleProfileFileChange}
                  accept=".webp,.jpg,.jpeg,.png,.jfif,.jpe,image/webp,image/jpeg,image/png"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, JFIF, and WebP images are supported. Images will be automatically converted to WebP format. Only one image is allowed.
                </p>
              </div>

              {/* Display selected files */}
              {profileUploadFiles.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-sm text-gray-300 mb-2">Selected files ({profileUploadFiles.length}):</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {profileUploadFiles.map((file, index) => {
                      const fileKey = `${file.name}-${index}`;
                      const progress = profileUploadProgress[fileKey] || 0;
                      return (
                        <div key={fileKey} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-300 truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-slate-800/50 rounded-full h-1 border border-slate-700/50">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileUpload(false);
                    setProfileUploadFiles([]);
                    setProfileUploadTitle('');
                    if (profileFileInputRef.current) {
                      profileFileInputRef.current.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProfileUploading || profileUploadFiles.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isProfileUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <ToastContainer toasts={toasts} />

      {/* Conversion Confirmation Modal */}
      {showConversionPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Convert Images to WebP</h3>
              <p className="text-gray-300 mb-4">
                You have selected {filesToConvert.length} image(s) that need to be converted to WebP format before uploading.
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 mb-2">Files to convert:</p>
                <div className="space-y-1">
                  {filesToConvert.map((file, index) => (
                    <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      {file.name} ({file.type})
                    </div>
                  ))}
                </div>
                {webpFiles.length > 0 && (
                  <>
                    <p className="text-sm text-gray-300 mb-2 mt-3">WebP files (ready to upload):</p>
                    <div className="space-y-1">
                      {webpFiles.map((file, index) => (
                        <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400">
                WebP format provides better compression and faster loading times. The conversion will happen automatically.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleConversionCancel}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConversionConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Convert & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AdminPanel.displayName = 'AdminPanel';

export default AdminPanel;

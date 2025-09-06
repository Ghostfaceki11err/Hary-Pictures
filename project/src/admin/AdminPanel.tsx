import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Camera, Upload, Plus, X, Edit, Trash2 } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import { supabase } from './supabaseClient';

const STORAGE_BUCKET = 'pictures';
const STORAGE_PREFIX = 'public';

interface Category {
  id: string;
  name_am: string;
  slug: string;
}

interface Picture {
  id: string;
  title: string;
  image_url: string;
  categories: Category;
}

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; type: ToastType; message: string }

const AdminPanel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [selectedFilterCategoryId, setSelectedFilterCategoryId] = useState<string>('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [newCategoryAm, setNewCategoryAm] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgresses, setUploadProgresses] = useState<{ [key: string]: number }>({});
  const [deletingPictureId, setDeletingPictureId] = useState<string | null>(null);
  const [useUrlUpload, setUseUrlUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedNameAm, setEditedNameAm] = useState('');
  const [editedSlug, setEditedSlug] = useState('');
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
  const [storageUsage, setStorageUsage] = useState<{
    used: number; // in bytes
    total: number; // in bytes (1GB = 1024^3 bytes)
    loading: boolean;
    error: string | null;
  }>({
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

  function showToast(type: ToastType, message: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }

  const headerRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories, pictures, and storage usage on load
  useEffect(() => {
    fetchCategories();
    fetchPictures();
    fetchStorageUsage();
    fetchAboutMeCategory();
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

  const getStorageUsagePercentage = (): number => {
    return (storageUsage.used / storageUsage.total) * 100;
  };

  // Helper function to check if a category is the About Me category
  const isAboutMeCategory = (category: Category): boolean => {
    return category.name_am === 'About Me' && category.slug === 'about-me';
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


  // Profile Picture Upload Functions
  const handleProfileFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      // Validate each file for WebP format
      for (const file of selectedFiles) {
        if (file.type !== 'image/webp') {
          showToast('error', `File "${file.name}" is not a WebP image. Profile pictures must be in WebP format.`);
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

  // Get pictures from About Me category only
  const aboutMePictures = useMemo(() => {
    if (!profilePictureCategory) return [];
    return pictures.filter(pic => pic.categories?.id === profilePictureCategory.id);
  }, [pictures, profilePictureCategory]);

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

  // URL sync (persist selection, search, sort)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedFilterCategoryId) params.set('cat', selectedFilterCategoryId); else params.delete('cat');
    if (sortMode && sortMode !== 'newest') params.set('sort', sortMode); else params.delete('sort');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedFilterCategoryId, sortMode]);

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
      setNewCategoryAm('');
      setNewCategorySlug('');
      fetchCategories();
      showToast('success', 'Category added');
    }
    setIsAddingCategory(false);
  }

  // Handle file input (WebP only) - Multiple files
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      // Validate each file
      for (const file of selectedFiles) {
        if (file.type !== 'image/webp') {
          const isAboutMeCategory = selectedCategory === profilePictureCategory?.id;
          const message = isAboutMeCategory 
            ? `File "${file.name}" is not a WebP image. About Me images must be in WebP format.`
            : `File "${file.name}" is not a WebP image. Only WebP images are allowed.`;
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

    // File upload path (WebP-only) - Multiple files
    if (files.length === 0) { showToast('error', 'Please select WebP files'); return; }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadProgresses({});
    
    try {
      const uploadResults = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}-${i}`;
        
        // Validate file
        if (file.type !== 'image/webp') { 
          showToast('error', `File "${file.name}" is not a WebP image. Skipping.`); 
          continue; 
        }
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (fileExt !== 'webp') { 
          showToast('error', `File "${file.name}" is not a .webp file. Skipping.`); 
          continue; 
        }

      // Upload file to Supabase storage under slug folder
        const fileName = `${Date.now()}-${i}.webp`;
      const objectPath = `${STORAGE_PREFIX}/${category.slug}/${fileName}`;
        
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

        const derivedTitle = title.trim() || category.name_am || (file.name.replace(/\.[^.]+$/, '')) || `Picture ${Date.now()}-${i}`;

      const { error } = await supabase.from('pictures').insert([{
        title: derivedTitle,
        image_url: publicUrl,
        category_id: selectedCategory
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
      setUploadProgress(0);
      setUploadProgresses({});
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

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <section 
        ref={headerRef}
        className="py-16 text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Admin Panel
          </h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Manage categories and upload new pictures
          </p>
        </div>
      </section>

      

      {/* Layout */}
      <section ref={uploadRef} className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setEditingCategoryId(null)} className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition">New Category</button>
                  <button onClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition">Upload Picture</button>
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-white font-semibold mb-3">Stats</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex justify-between"><span>Categories</span><span className="text-white">{categories.length}</span></div>
                  <div className="flex justify-between"><span>Pictures</span><span className="text-white">{pictures.length}</span></div>
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-white font-semibold mb-2">Tips</h3>
                <p className="text-sm text-gray-300">Use the Amharic name for display and the English file name as a safe storage folder.</p>
              </div>
              
              {/* Storage Usage Indicator */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Storage Usage
                </h3>
                
                {storageUsage.loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-300">Loading...</span>
                  </div>
                ) : storageUsage.error ? (
                  <div className="text-center py-4">
                    <p className="text-red-400 text-sm mb-2">Error loading storage data</p>
                    <button 
                      onClick={fetchStorageUsage}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Storage Label */}
                    <div className="text-center">
                      <p className="text-sm text-gray-300">
                        Storage Usage: <span className="text-white font-medium">
                          {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
                        </span>
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full">
                      <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            getStorageUsagePercentage() >= 90 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : getStorageUsagePercentage() >= 75 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(getStorageUsagePercentage(), 100)}%` }}
                        ></div>
                      </div>
                      
                      {/* Usage Percentage */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {getStorageUsagePercentage().toFixed(1)}% used
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatBytes(storageUsage.total - storageUsage.used)} remaining
                        </span>
                      </div>
                    </div>
                    
                    {/* Storage Status */}
                    <div className="text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getStorageUsagePercentage() >= 90 
                          ? 'bg-red-500/20 text-red-400' 
                          : getStorageUsagePercentage() >= 75 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}>
                        {getStorageUsagePercentage() >= 90 
                          ? 'Storage Almost Full' 
                          : getStorageUsagePercentage() >= 75 
                            ? 'Storage Getting Full'
                            : 'Storage Healthy'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* About Me Image Section */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  About Me Image
                </h3>
                
                {profilePictureLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    <span className="ml-2 text-sm text-gray-300">Loading...</span>
                  </div>
                ) : showCreateProfileCategory ? (
                  /* Create About Me Category */
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-300 mb-4">
                        No "About Me" category found. Create one to manage About Me images.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Category Name:</label>
                        <div className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm flex items-center justify-between">
                          <span className="text-white">About Me</span>
                          <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded">Fixed</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Category name cannot be changed</p>
                      </div>
                      
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Slug (file name):</p>
                        <p className="text-sm text-purple-400 font-mono">about-me</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={createAboutMeCategory}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Create Category
                        </button>
                        <button
                          onClick={() => setShowCreateProfileCategory(false)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : profilePictureCategory && aboutMePictures.length === 0 ? (
                  /* Category exists but no images */
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-300 mb-2">
                        "About Me" category exists but has no images.
                      </p>
                      <p className="text-xs text-gray-400">
                        Upload a WebP image to this category to use as About Me image.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowProfileUpload(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload About Me Image
                    </button>
                  </div>
                ) : (
                  /* Display About Me images from category */
                  <div className="space-y-4">
                    {/* About Me Images Grid */}
                    <div className="grid grid-cols-1 gap-3">
                      {aboutMePictures.map((picture) => (
                        <div key={picture.id} className="relative group">
                          <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-white/20 bg-slate-800">
                            <img 
                              src={picture.image_url} 
                              alt={picture.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleAboutMeDeleteClick(picture.id)}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                              title="Delete this image"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 text-center">{picture.title}</p>
                        </div>
                      ))}
                    </div>

                    {/* Upload More Button - Disabled when images exist */}
                    <button
                      onClick={() => {
                        if (aboutMePictures.length > 0) {
                          showToast('info', 'Please delete existing About Me images before uploading new ones. Only one image is allowed in the About Me section.');
                        } else {
                          setShowProfileUpload(true);
                        }
                      }}
                      disabled={aboutMePictures.length > 0}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        aboutMePictures.length > 0 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {aboutMePictures.length > 0 ? 'Delete Existing Image First' : 'Upload Image'}
                    </button>
                    
                    {aboutMePictures.length > 0 && (
                      <p className="text-xs text-gray-400 text-center mt-2">
                        Only one image is allowed in the About Me section. Delete the current image to upload a new one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* Main content */}
            <div className="space-y-8">
              {/* Category Card */}
              <div className="relative rounded-3xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20" />
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"><Plus className="w-6 h-6" />{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
                  </div>
                  <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" value={newCategoryAm} onChange={(e) => setNewCategoryAm(e.target.value)} placeholder="Category name (Amharic)" className="px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition" required />
                    <input type="text" value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} placeholder="File name (english, e.g. wedding)" className="px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition" required />
                    <div className="flex gap-3">
                      <button type="submit" disabled={isAddingCategory} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-blue-900 disabled:to-cyan-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-800/30">{editingCategoryId ? (isAddingCategory ? 'Saving...' : 'Save Changes') : (isAddingCategory ? 'Adding...' : 'Add Category')}</button>
                      {editingCategoryId && (
                        <button type="button" onClick={() => { setEditingCategoryId(null); setNewCategoryAm(''); setNewCategorySlug(''); }} className="px-6 py-3 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white transition">Cancel</button>
                      )}
                    </div>
                  </form>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50">
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 text-gray-300 text-sm border-b border-white/10">
                      <div className="col-span-5">Name (Amharic)</div>
                      <div className="col-span-5">File name</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {categories.map((cat) => (
                      <div key={cat.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-white/5 last:border-b-0">
                        <div className="col-span-5"><span className="text-white">{cat.name_am}</span></div>
                        <div className="col-span-5"><span className="text-gray-300">{cat.slug}</span></div>
                        <div className="col-span-2 text-right flex justify-end gap-2">
                          {isAboutMeCategory(cat) ? (
                            <button 
                              disabled 
                              className="px-3 py-2 rounded-lg bg-gray-600 cursor-not-allowed text-gray-400 flex items-center gap-1 text-sm"
                              title="About Me category cannot be edited"
                            >
                              <Edit className="w-4 h-4" /> Protected
                            </button>
                          ) : (
                          <button onClick={() => { setEditingCategoryId(cat.id); setNewCategoryAm(cat.name_am); setNewCategorySlug(cat.slug); }} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 text-sm"><Edit className="w-4 h-4" /> Edit</button>
                          )}
                          <button 
                            onClick={() => { 
                              if (isAboutMeCategory(cat)) {
                                setIsProfileDeleteConfirmOpen(true);
                                setDeleteTargetCategoryId(cat.id);
                                setDeleteTargetInfo({ name_am: cat.name_am, slug: cat.slug });
                                setProfileDeleteStep(1);
                              } else {
                                setIsDeleteModalOpen(true); 
                                setDeleteTargetCategoryId(cat.id); 
                                setDeleteTargetInfo({ name_am: cat.name_am, slug: cat.slug }); 
                                setDeleteAlsoImages(false); 
                                setDeleteImageCount(null); 
                                loadCategoryImageCount(cat.id).then((count) => setDeleteImageCount(count));
                              }
                            }} 
                            disabled={deletingCategoryId === cat.id} 
                            className={`px-3 py-2 rounded-lg text-white flex items-center gap-1 text-sm ${deletingCategoryId === cat.id ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                          >
                            {deletingCategoryId === cat.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" /> Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload Card */}
              <div className="relative rounded-3xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl blur opacity-20" />
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2"><Upload className="w-6 h-6" /> Upload Picture</h2>
                  <form onSubmit={handleUpload} className="space-y-5">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Picture title (optional)" className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition" />
                    <select value={selectedCategory} onChange={(e) => { const value = e.target.value; if (value === '' || isValidUUID(value)) { setSelectedCategory(value); } }} className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition" required>
                      <option value="">Select Category</option>
                      {categories.filter(cat => !isAboutMeCategory(cat)).map(cat => (<option key={cat.id} value={cat.id}>{cat.name_am} ({cat.slug})</option>))}
                    </select>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">Upload via URL (WebP only)</span>
                        <label htmlFor="useUrlUpload" className="inline-flex items-center cursor-pointer select-none">
                          <input
                            id="useUrlUpload"
                            type="checkbox"
                            checked={useUrlUpload}
                            onChange={(e) => setUseUrlUpload(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-700/80 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 transition-colors relative">
                            <span className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-5" />
                          </div>
                        </label>
                      </div>
                      {useUrlUpload ? (
                        <>
                          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.webp" className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition" required />
                          <p className="text-xs text-gray-400 mt-1">Must be a direct .webp image URL</p>
                        </>
                      ) : (
                        <>
                          <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} accept=".webp,image/webp" className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700" required />
                          <p className="text-xs text-gray-400 mt-1">
                            {selectedCategory === profilePictureCategory?.id 
                              ? "About Me images must be in WebP format. Only one image is allowed."
                              : "Only WebP format images are allowed. You can select multiple files."
                            }
                          </p>
                          
                          {/* Display selected files */}
                          {files.length > 0 && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                              <p className="text-sm text-gray-300 mb-2">Selected files ({files.length}):</p>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {files.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                                    <div className="flex items-center space-x-2">
                                      <Camera size={16} className="text-emerald-400" />
                                      <span className="text-sm text-gray-200 truncate">{file.name}</span>
                                      <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newFiles = files.filter((_, i) => i !== index);
                                        setFiles(newFiles);
                                        if (newFiles.length === 0 && fileInputRef.current) {
                                          fileInputRef.current.value = '';
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {isUploading && !useUrlUpload && (
                      <div className="w-full space-y-3">
                        {/* Overall progress */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-300">Overall Progress</span>
                            <span className="text-sm text-gray-300">{Math.round(uploadProgress)}%</span>
                          </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        </div>
                        
                        {/* Individual file progress */}
                        {files.length > 1 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-400">Individual files:</p>
                            {files.map((file, index) => {
                              const fileKey = `${file.name}-${index}`;
                              const progress = uploadProgresses[fileKey] || 0;
                              return (
                                <div key={fileKey} className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-300 truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-800/50 rounded-full h-1 border border-slate-700/50">
                                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                      </div>
                    )}
                      </div>
                    )}
                    <button type="submit" disabled={isUploading || !selectedCategory || (!useUrlUpload && files.length === 0) || (useUrlUpload && !imageUrl)} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-emerald-900 disabled:to-teal-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-800/30">{isUploading && !useUrlUpload ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Uploading...</>) : (<><Upload className="w-4 h-4" />{useUrlUpload ? 'Add from URL' : files.length > 1 ? `Upload ${files.length} Pictures` : 'Upload Picture'}</>)}</button>
                  </form>
                </div>
              </div>

              {/* Gallery */}
              <div ref={gridRef} className="relative rounded-3xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-3xl blur opacity-10" />
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-white">Gallery ({pictures.length})</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as any)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800/70 text-white border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="title">Title A–Z</option>
                      </select>
                    </div>
                  </div>
                  {/* Category Filters inside Gallery */}
                  <div className="mb-6 flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => setSelectedFilterCategoryId('')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedFilterCategoryId === ''
                          ? 'bg-blue-600/90 text-white border-blue-500 shadow-lg'
                          : 'bg-slate-800/70 text-gray-200 border-slate-700 hover:bg-slate-700/70'
                      }`}
                    >
                      All ({pictures.filter(pic => !pic.categories || !isAboutMeCategory(pic.categories)).length})
                    </button>
                    {categories.filter(cat => !isAboutMeCategory(cat)).map((cat) => {
                      const preview = categoryIdToPreview[cat.id] || '';
                      const count = categoryIdToCount[cat.id] || 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedFilterCategoryId(cat.id)}
                          className={`group relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 ${
                            selectedFilterCategoryId === cat.id
                              ? 'bg-blue-600/90 text-white border-blue-500 shadow-lg'
                              : 'bg-slate-800/70 text-gray-200 border-slate-700 hover:bg-slate-700/70'
                          }`}
                          title={cat.name_am}
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-blue-600/40 to-cyan-500/40 border border-white/10">
                            {preview ? (
                              <img src={preview} alt={cat.name_am} className="h-full w-full object-cover" />
                            ) : (
                              <Camera className="h-3.5 w-3.5 text-blue-300" />
                            )}
                          </span>
                          <span className="truncate max-w-[10rem]">{cat.name_am} ({count})</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pictures
                      .filter(pic => {
                        // Filter out pictures from About Me category
                        if (pic.categories && isAboutMeCategory(pic.categories)) {
                          return false;
                        }
                        // Apply category filter
                        return !selectedFilterCategoryId || pic.categories?.id === selectedFilterCategoryId;
                      })
                      .sort((a, b) => {
                        if (sortMode === 'title') return a.title.localeCompare(b.title);
                        // Newest/Oldest fallback by id/time-based UUID ordering is unreliable; keep as-is
                        return 0;
                      })
                      .map((pic, index) => (
                      <div key={pic.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur hover:border-white/20 transition-all duration-300 shadow hover:shadow-2xl" onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}>
                        <img src={pic.image_url} alt={pic.title} className="aspect-square w-full h-full object-cover transition-all duration-300 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-all duration-300"></div>
                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">{pic.title}</h3>
                          <p className="text-gray-200/90 text-sm line-clamp-1">{pic.categories?.name_am}</p>
                        </div>
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium">{pic.categories?.name_am}</div>
                        <button onClick={(e) => { e.stopPropagation(); setIsDeletePicModalOpen(true); setDeleteTargetPictureId(pic.id); setDeleteTargetPictureUrl(pic.image_url); }} disabled={deletingPictureId === pic.id} className={`absolute top-3 right-3 text-white p-2 rounded-full transition-all duration-300 ${deletingPictureId === pic.id ? 'bg-red-800/80 cursor-not-allowed' : 'bg-red-600/80 hover:bg-red-700/80'} shadow`}>{deletingPictureId === pic.id ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>) : (<Trash2 className="w-4 h-4" />)}</button>
                      </div>
                    ))}
                  </div>
                  {pictures.length === 0 && (
                    <div className="text-center py-12">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No pictures uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={pictures.map(pic => ({ 
            src: pic.image_url, 
            title: pic.title, 
            description: pic.categories?.name_am 
          }))}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
          plugins={[Fullscreen, Zoom, Slideshow]}
          slideshow={{ delay: 8000 }}
          render={{
            slideHeader: () => (
              <div className="absolute top-4 left-4 z-50">
                <div className="text-white text-sm sm:text-base font-semibold bg-black/60 rounded px-3 py-1">
                  {lightboxIndex + 1} / {pictures.length}
                </div>
              </div>
            )
          }}
        />
      )}

      {/* Confirm Delete Picture Modal */}
      {isDeletePicModalOpen && deleteTargetPictureId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Delete Picture</h3>
            <p className="text-gray-300 mb-4">Are you sure you want to delete this picture? This action cannot be undone.</p>
            {deleteTargetPictureUrl && (
              <div className="mb-4 overflow-hidden rounded-lg border border-white/10">
                <img src={deleteTargetPictureUrl} alt="To delete" className="w-full h-40 object-cover" />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsDeletePicModalOpen(false); setDeleteTargetPictureId(null); setDeleteTargetPictureUrl(null); }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
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
                disabled={deletePicLoading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white"
              >
                {deletePicLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && deleteTargetCategoryId && deleteTargetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Delete Category</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete "{deleteTargetInfo.name_am}" (<span className="text-gray-400">{deleteTargetInfo.slug}</span>)?
            </p>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 mb-4 text-sm text-gray-300">
              {deleteImageCount === null ? 'Checking images in this category...' : (
                deleteImageCount > 0 ? (
                  <>
                    <div>This category contains <span className="text-white font-semibold">{deleteImageCount}</span> image(s).</div>
                    <label className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deleteAlsoImages}
                        onChange={(e) => setDeleteAlsoImages(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>Also delete all images from storage</span>
                    </label>
                  </>
                ) : (
                  <div>No images found in this category.</div>
                )
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeleteTargetCategoryId(null); setDeleteTargetInfo(null); }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteImageCount && deleteImageCount > 0 && !deleteAlsoImages) {
                    showToast('info', 'This category has images. Check the box to also delete images, or cancel.');
                    return;
                  }
                  setDeleteLoading(true);
                  // If deleting images too, call existing handleDeleteCategory logic; otherwise skip storage removal
                  try {
                    const catId = deleteTargetCategoryId;
                    const cat = categories.find(c => c.id === catId);
                    if (!cat) throw new Error('Category not found');

                    if (deleteAlsoImages) {
                      // List and remove files under public/<slug>
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
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Category Double Confirmation Modal */}
      {isProfileDeleteConfirmOpen && deleteTargetCategoryId && deleteTargetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            {profileDeleteStep === 1 ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">⚠️ Delete About Me Category</h3>
                  <p className="text-gray-300 mb-4">
                    You are about to delete the <span className="text-red-400 font-semibold">"About Me"</span> category.
                  </p>
                </div>
                
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <h4 className="text-red-400 font-semibold mb-2">⚠️ Important Warning:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• You will <span className="text-red-400 font-semibold">lose your About Me image</span></li>
                    <li>• The website will have <span className="text-red-400 font-semibold">no About Me image</span> to display</li>
                    <li>• All images in this category will be deleted</li>
                    <li>• You'll need to recreate the category and upload new images</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsProfileDeleteConfirmOpen(false);
                      setDeleteTargetCategoryId(null);
                      setDeleteTargetInfo(null);
                      setProfileDeleteStep(1);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setProfileDeleteStep(2)}
                    className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    I Understand, Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Final Confirmation</h3>
                  <p className="text-gray-300 mb-4">
                    Are you absolutely sure you want to delete the <span className="text-red-400 font-semibold">"Profile picture"</span> category?
                  </p>
                </div>

                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-sm text-center">
                    This action cannot be undone. You will lose your profile picture and need to recreate everything.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setProfileDeleteStep(1)}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={async () => {
                      setDeleteLoading(true);
                      try {
                        // Delete the category and all its images
                        await handleDeleteCategory(deleteTargetCategoryId, deleteTargetInfo.slug);
                        

                        // Reset about me category state
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
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white"
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete Forever'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                  accept=".webp,image/webp"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                <p className="text-xs text-gray-400 mt-1">
                  About Me images must be in WebP format. Only one image is allowed.
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

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-xs px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-[fadeIn_.2s_ease-out] text-sm
              ${t.type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200' : ''}
              ${t.type === 'error' ? 'bg-red-500/15 border-red-400/30 text-red-200' : ''}
              ${t.type === 'info' ? 'bg-blue-500/15 border-blue-400/30 text-blue-200' : ''}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Modern About Me Delete Confirmation Modal */}
      {showAboutMeDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete About Me Image</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-300 mb-3">
                  Are you sure you want to delete this About Me image?
                </p>
                <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <p className="text-sm text-gray-400">
                    💡 <strong>Tip:</strong> You can upload a new image after deletion to replace it.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAboutMeDeleteModal(false);
                    setAboutMeImageToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => aboutMeImageToDelete && deleteSpecificAboutMeImage(aboutMeImageToDelete)}
                  disabled={profilePictureLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {profilePictureLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Delete Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

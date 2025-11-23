import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Category } from '../types';

interface DeleteModalsProps {
  // Delete Picture Modal
  isDeletePicModalOpen: boolean;
  deleteTargetPictureId: string | null;
  deleteTargetPictureUrl: string | null;
  deletePicLoading: boolean;
  onCloseDeletePicModal: () => void;
  onConfirmDeletePicture: () => void;

  // Delete Category Modal
  isDeleteModalOpen: boolean;
  deleteTargetCategoryId: string | null;
  deleteTargetInfo: { name_am: string; slug: string } | null;
  deleteImageCount: number | null;
  deleteAlsoImages: boolean;
  setDeleteAlsoImages: (value: boolean) => void;
  deleteLoading: boolean;
  categories: Category[];
  onCloseDeleteCategoryModal: () => void;
  onConfirmDeleteCategory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;

  // Profile Delete Confirmation Modal
  isProfileDeleteConfirmOpen: boolean;
  profileDeleteStep: number;
  setProfileDeleteStep: (step: number) => void;
  onCloseProfileDeleteModal: () => void;
  onConfirmDeleteProfileCategory: () => void;

  // About Me Image Delete Modal
  showAboutMeDeleteModal: boolean;
  aboutMeImageToDelete: string | null;
  profilePictureLoading: boolean;
  onCloseAboutMeDeleteModal: () => void;
  onConfirmDeleteAboutMeImage: () => void;
}

export const DeleteModals: React.FC<DeleteModalsProps> = ({
  // Delete Picture
  isDeletePicModalOpen,
  deleteTargetPictureId,
  deleteTargetPictureUrl,
  deletePicLoading,
  onCloseDeletePicModal,
  onConfirmDeletePicture,

  // Delete Category
  isDeleteModalOpen,
  deleteTargetCategoryId,
  deleteTargetInfo,
  deleteImageCount,
  deleteAlsoImages,
  setDeleteAlsoImages,
  deleteLoading,
  categories,
  onCloseDeleteCategoryModal,
  onConfirmDeleteCategory,
  showToast,

  // Profile Delete
  isProfileDeleteConfirmOpen,
  profileDeleteStep,
  setProfileDeleteStep,
  onCloseProfileDeleteModal,
  onConfirmDeleteProfileCategory,

  // About Me Delete
  showAboutMeDeleteModal,
  aboutMeImageToDelete,
  profilePictureLoading,
  onCloseAboutMeDeleteModal,
  onConfirmDeleteAboutMeImage,
}) => {
  return (
    <>
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
                onClick={onCloseDeletePicModal}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDeletePicture}
                disabled={deletePicLoading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white"
              >
                {deletePicLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Category Modal */}
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
                onClick={onCloseDeleteCategoryModal}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteImageCount && deleteImageCount > 0 && !deleteAlsoImages) {
                    showToast('info', 'This category has images. Check the box to also delete images, or cancel.');
                    return;
                  }
                  onConfirmDeleteCategory();
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
                    onClick={onCloseProfileDeleteModal}
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
                    onClick={onConfirmDeleteProfileCategory}
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
                  onClick={onCloseAboutMeDeleteModal}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmDeleteAboutMeImage}
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
    </>
  );
};


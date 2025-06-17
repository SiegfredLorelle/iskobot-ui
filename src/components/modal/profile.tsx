// components/ProfileSettingsModal.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  IconX,
  IconUser,
  IconCamera,
  IconLoader2,
  IconUpload,
  IconTrash,
  IconDeviceFloppy as IconSave,
} from "@tabler/icons-react";

type User = {
  id: string;
  email: string;
  display_name?: string;
  full_name?: string;
  role?: string;
  profile_icon?: string;
  profile_image?: string;
};

type ProfileSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: Partial<User>, imageFile: File | null) => Promise<void>; // Passes actual File for upload
};

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  onSave,
}: ProfileSettingsModalProps) {
  const [displayName, setDisplayName] = useState(
    user.display_name || user.full_name || "",
  );
  const [profileImage, setProfileImage] = useState<string | undefined>(
    user.profile_image,
  );
  const [imageFile, setImageFile] = useState<File | null>(null); // Actual file for backend upload
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handles modal closing on outside clicks or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Resets form state when user data changes
  useEffect(() => {
    setDisplayName(user.display_name || user.full_name || "");
    setProfileImage(user.profile_image);
    setImageFile(null);
    setImageError(null);
    setShowValidationErrors(false);
  }, [user]);

  // Validates and sets new profile image for preview and upload
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setImageError(null);

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setImageError("Please select a valid image file (JPG, PNG, GIF).");
        return;
      }

      const MAX_FILE_SIZE_MB = 5;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setImageError(`Image size must be less than ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Clears current profile image selection
  const handleRemoveImage = useCallback(() => {
    setProfileImage(undefined);
    setImageFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Validates display name
  const isDisplayNameValid = useCallback(
    () => displayName.trim().length > 0,
    [displayName],
  );

  // Checks overall form validity
  const isFormValid = useCallback(
    () => isDisplayNameValid(),
    [isDisplayNameValid],
  );

  // Detects if any changes have been made to the form
  const hasChanges = useCallback(() => {
    const initialDisplayName = user.display_name || user.full_name || "";
    const nameChanged = displayName.trim() !== initialDisplayName;
    const imageChanged =
      profileImage !== user.profile_image || imageFile !== null;
    return nameChanged || imageChanged;
  }, [displayName, profileImage, imageFile, user]);

  // Handles saving profile changes, including image upload
  const handleSave = async () => {
    setShowValidationErrors(true);

    if (!isFormValid()) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Partial<User> = {};

      if (displayName.trim()) {
        updateData.display_name = displayName.trim();
      }

      // Determines profile image update strategy
      if (profileImage && (imageFile || user.profile_image)) {
        updateData.profile_image = profileImage;
        updateData.profile_icon = undefined;
      } else {
        updateData.profile_icon = "default";
        updateData.profile_image = undefined;
      }

      await onSave(updateData, imageFile);
      onClose();
    } catch (error) {
      console.error("Failed to save profile settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Renders profile image or default icon
  const renderProfilePreview = () => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover mx-auto"
        />
      );
    } else {
      return (
        <div className="w-16 h-16 bg-[var(--accent-clr)] rounded-full flex items-center justify-center mx-auto">
          <IconUser className="h-8 w-8 text-text-clr" />
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-primary-clr rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-background-clr/20">
          <h2 className="text-xl font-semibold text-text-clr">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-text-clr/70 hover:text-text-clr hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
            aria-label="Close modal"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content area */}
        <div className="p-6 space-y-6">
          {/* User profile preview and basic info */}
          <div className="text-center">
            <div className="mb-2">{renderProfilePreview()}</div>
            <div className="text-text-clr/70 text-sm">{user.email}</div>
            <div className="text-text-clr/50 text-xs capitalize mt-1">
              {user.role?.replace("_", " ")}
            </div>
          </div>

          {/* Display Name input field */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-text-clr mb-2"
            >
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-background-clr border border-background-clr/20 rounded-md text-black placeholder-text-black focus:outline-none focus:ring-2 focus:ring-[var(--accent-clr)] focus:border-transparent transition duration-200"
              placeholder="Enter your display name"
              maxLength={50}
            />
            {showValidationErrors && !isDisplayNameValid() && (
              <p className="text-red-400 text-xs mt-1">
                Display name is required.
              </p>
            )}
          </div>

          {/* Profile Picture upload section */}
          <div>
            <label className="block text-sm font-medium text-text-clr mb-3">
              <IconCamera className="h-4 w-4 inline mr-1" />
              Profile Picture
            </label>

            <div className="flex items-center gap-3 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-background-clr text-[var(--hover-clr)] rounded-md transition duration-200 text-sm"
              >
                <IconUpload className="h-4 w-4" />
                {profileImage ? "Change Image" : "Upload Image"}
              </button>

              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-md hover:bg-red-600/30 transition duration-200 text-sm"
                >
                  <IconTrash className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>

            {imageError && (
              <p className="text-red-400 text-xs mb-2">{imageError}</p>
            )}

            <p className="text-text-clr/50 text-xs">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>

          {/* Read-only account information */}
          <div className="pt-4 border-t border-background-clr/20">
            <h3 className="text-sm font-medium text-text-clr mb-3">
              Account Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-clr/70">Email:</span>
                <span className="text-text-clr">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-clr/70">Role:</span>
                <span className="text-text-clr capitalize">
                  {user.role?.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer with action buttons */}
        <div className="flex items-center justify-between p-6 border-t border-background-clr/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-clr/70 hover:text-text-clr hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !hasChanges() || !isFormValid()}
            className="px-4 py-2 bg-[var(--accent-clr)] text-text-clr rounded-md hover:bg-[var(--accent-clr)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-clr)]/50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconSave className="h-4 w-4" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

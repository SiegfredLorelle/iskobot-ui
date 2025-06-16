export type UserType = {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  email_confirmed: boolean;
  created_at?: string;
  role: string;
  profile_icon?: 'default';
  profile_image?: string; // URL or base64 string for uploaded image
};

// For the profile modal updates
export interface UpdateUserRequest {
  display_name?: string;
  profile_icon?: 'default';
  profile_image?: string;
}
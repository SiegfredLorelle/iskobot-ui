export type UserType = {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  email_confirmed: boolean;
  created_at?: string;
  role: string;
  profile_icon?: "default" | string;
  profile_image?: string;
};

// For the profile modal updates
export type UpdateUserRequest = {
  display_name?: string;
  profile_icon?: "default";
  profile_image?: string;
};

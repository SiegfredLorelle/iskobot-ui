import type { UserType } from "./UserType";

export type AuthStateType = {
  user: UserType | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

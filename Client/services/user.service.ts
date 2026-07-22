import { apiFetch } from './api';

export interface BackendUserProfile {
  id: number;
  user: number;
  onboarding_step: number;
  is_onboarding_complete: boolean;
  language: string;
  primary_region: string;
  country: string;
  measurement_system: 'METRIC' | 'IMPERIAL';
  referral_source: string;
  dietary_preferences: string[];
  allergies: string[];
  disliked_ingredients: string[];
  cooking_frequency: string;
  skill_level: string;
  preferred_cooking_time: string;
  household_size: string;
  preferred_cuisines: string[];
  kitchen_equipment: string[];
  meal_planning_preference: string;
  notifications_enabled: boolean;
  health_goals: string[];
  activity_level: string;
  weight_goal: string;
  current_weight: string;
  target_weight: string;
  current_height: string;
  date_of_birth: string;
  gender: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface BackendUser {
  id: number;
  email: string;
  username: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_picture: string | null;
}

export const userService = {
  getProfile: () =>
    apiFetch<BackendUserProfile>('/profile/me/'),

  updateProfile: (data: Partial<BackendUserProfile>) =>
    apiFetch<BackendUserProfile>('/profile/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateOnboardingStep: (step: number) =>
    apiFetch<BackendUserProfile>('/profile/me/', {
      method: 'PATCH',
      body: JSON.stringify({ onboarding_step: step }),
    }),
};

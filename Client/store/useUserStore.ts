import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { userService, BackendUserProfile, BackendUser } from '../services/user.service';
import { clearAuthTokens, ApiError } from '../services/api';

export interface UserProfile {
  name: string;
  email: string;
  language: string;
  region: string;
  country: string;
  measurementSystem: 'Metric' | 'Imperial';
  referralSource: string;
  dietaryProfile: string[];
  allergies: string[];
  dislikes: string[];
  cookingSkill: string;
  cookingTime: string;
  cookingFrequency: string;
  cookingFor: string;
  favoriteCuisines: string[];
  kitchenEquipment: string[];
  mealPlanPreference: string;
  notifications: string[];
  goals: string[];
  gender: string;
  dob: string;
  weight: string;
  height: string;
  activityLevel: string;
  weightGoal: string;
  isPremium: boolean;
}

interface UserStore {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  onboardingStep: number;
  authChecked: boolean;
  currentUserId: number | null;
  currentUsername: string;
  profile: UserProfile;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string; detail?: string }>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string; detail?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; detail?: string }>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  confirmPasswordReset: (email: string, token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  fetchUserData: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  syncProfileToBackend: () => Promise<{ success: boolean; error?: string }>;
  saveProfileProgress: (step: number, customFields?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<BackendUserProfile>) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  saveOnboardingStep: (step: number) => Promise<void>;

  setProfile: (data: Partial<UserProfile>) => void;
  toggleDietaryProfile: (diet: string) => void;
  toggleAllergy: (allergy: string) => void;
  toggleDislike: (dislike: string) => void;
  addDislike: (dislike: string) => void;
  removeDislike: (dislike: string) => void;
  toggleCuisine: (cuisine: string) => void;
  toggleEquipment: (item: string) => void;
  toggleGoal: (goal: string) => void;
  toggleNotification: (key: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialProfile: UserProfile = {
  name: '',
  email: '',
  language: 'English',
  region: '',
  country: '',
  measurementSystem: 'Imperial',
  referralSource: '',
  dietaryProfile: [],
  allergies: [],
  dislikes: [],
  cookingSkill: '',
  cookingTime: '',
  cookingFrequency: '',
  cookingFor: '',
  favoriteCuisines: [],
  kitchenEquipment: [],
  mealPlanPreference: '',
  notifications: [],
  goals: [],
  gender: '',
  dob: '',
  weight: '',
  height: '',
  activityLevel: '',
  weightGoal: '',
  isPremium: false,
};

function mapBackendProfileToFrontend(backend: BackendUserProfile, user: BackendUser): Partial<UserProfile> {
  return {
    name: user.username,
    email: user.email,
    language: backend.language || 'English',
    region: backend.primary_region || '',
    country: backend.country || '',
    measurementSystem: backend.measurement_system === 'IMPERIAL' ? 'Imperial' : 'Metric',
    referralSource: backend.referral_source || '',
    dietaryProfile: backend.dietary_preferences || [],
    allergies: backend.allergies || [],
    dislikes: backend.disliked_ingredients || [],
    cookingSkill: backend.skill_level || '',
    cookingTime: backend.preferred_cooking_time || '',
    cookingFrequency: backend.cooking_frequency || '',
    cookingFor: backend.household_size || '',
    favoriteCuisines: backend.preferred_cuisines || [],
    kitchenEquipment: backend.kitchen_equipment || [],
    mealPlanPreference: backend.meal_planning_preference || '',
    notifications: backend.notifications_enabled ? ['all'] : [],
    goals: backend.health_goals || [],
    gender: backend.gender || '',
    dob: backend.date_of_birth || '',
    weight: backend.current_weight || '',
    height: backend.current_height || '',
    activityLevel: backend.activity_level || '',
    weightGoal: backend.weight_goal || '',
  };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isOnboarded: false,
      onboardingStep: 1,
      authChecked: false,
      currentUserId: null,
      currentUsername: '',
      profile: initialProfile,

      checkAuth: async () => {
        try {
          const user: BackendUser = await authService.getCurrentUser();
          set({
            isAuthenticated: true,
            currentUserId: user.id,
            currentUsername: user.username,
            profile: { ...get().profile, name: user.username, email: user.email },
          });
          await get().fetchProfile();
          set({ authChecked: true });
        } catch {
          set({ isAuthenticated: false, authChecked: true });
        }
      },

      login: async (email, password) => {
        try {
          await authService.login({ email, password });
          await get().checkAuth();
          if (get().isAuthenticated) {
            await get().fetchUserData();
            await get().fetchProfile();
          }
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Login failed' };
        }
      },

      register: async (email, username, password) => {
        try {
          const res = await authService.register({ email, username, password });
          return { success: true, detail: (res as any)?.detail };
        } catch (err: any) {
          return { success: false, error: err.message || 'Registration failed' };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (_) {}
        clearAuthTokens();
        set({ isAuthenticated: false, authChecked: true, profile: initialProfile, isOnboarded: false, onboardingStep: 1 });
      },

      verifyOtp: async (email, otp) => {
        try {
          await authService.verifyOtp({ email, otp });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'OTP verification failed' };
        }
      },

      resendOtp: async (email) => {
        try {
          const res = await authService.resendOtp(email);
          return { success: true, detail: (res as any)?.detail };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to resend OTP' };
        }
      },

      requestPasswordReset: async (email) => {
        try {
          const res = await authService.requestPasswordReset(email);
          return { success: true, detail: (res as any)?.detail };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to request password reset' };
        }
      },

      verifyPasswordResetOtp: async (email, otp) => {
        try {
          const res = await authService.verifyPasswordResetOtp({ email, otp });
          return { success: true, resetToken: res.password_reset_token };
        } catch (err: any) {
          return { success: false, error: err.message || 'OTP verification failed' };
        }
      },

      confirmPasswordReset: async (email, token, newPassword, confirmPassword) => {
        try {
          await authService.confirmPasswordReset({ email, token, new_password: newPassword, confirm_password: confirmPassword });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to reset password' };
        }
      },

      fetchUserData: async () => {
        try {
          const user: BackendUser = await authService.getCurrentUser();
          set((state) => ({
            profile: { ...state.profile, name: user.username, email: user.email },
          }));
        } catch (_) {}
      },

      fetchProfile: async () => {
        try {
          const backendProfile = await userService.getProfile();
          const { profile } = get();
          const mapped = mapBackendProfileToFrontend(backendProfile, {
            id: backendProfile.user,
            username: profile.name,
            email: profile.email,
            is_verified: true,
            created_at: backendProfile.created_at,
            updated_at: backendProfile.updated_at,
            profile_picture: null,
          });
          set((state) => ({
            profile: { ...state.profile, ...mapped },
            isOnboarded: backendProfile.is_onboarding_complete,
            onboardingStep: backendProfile.onboarding_step || 1,
          }));
        } catch (_) {}
      },

      updateProfile: async (data) => {
        try {
          await userService.updateProfile(data);
          await get().fetchProfile();
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to update profile' };
        }
      },

      syncProfileToBackend: async () => {
        try {
          const { profile } = get();
          await userService.updateProfile({
            language: profile.language,
            primary_region: profile.region,
            country: profile.country,
            measurement_system: profile.measurementSystem === 'Imperial' ? 'IMPERIAL' : 'METRIC',
            referral_source: profile.referralSource,
            dietary_preferences: profile.dietaryProfile,
            allergies: profile.allergies,
            disliked_ingredients: profile.dislikes,
            skill_level: profile.cookingSkill,
            preferred_cooking_time: profile.cookingTime,
            cooking_frequency: profile.cookingFrequency,
            household_size: profile.cookingFor,
            preferred_cuisines: profile.favoriteCuisines,
            kitchen_equipment: profile.kitchenEquipment,
            meal_planning_preference: profile.mealPlanPreference,
            notifications_enabled: profile.notifications.includes('all'),
            health_goals: profile.goals,
            gender: profile.gender as any,
            date_of_birth: profile.dob,
            current_weight: profile.weight,
            current_height: profile.height,
            activity_level: profile.activityLevel as any,
            weight_goal: profile.weightGoal as any,
            is_onboarding_complete: true,
            onboarding_step: 22,
          });
          set({ isOnboarded: true });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to sync profile' };
        }
      },

      saveProfileProgress: async (step, customFields) => {
        try {
          if (customFields) {
            get().setProfile(customFields);
          }
          const { profile } = get();
          
          const backendData: Partial<BackendUserProfile> = {
            onboarding_step: step,
            is_onboarding_complete: false,
            language: profile.language,
            primary_region: profile.region,
            country: profile.country,
            measurement_system: profile.measurementSystem === 'Imperial' ? 'IMPERIAL' : 'METRIC',
            referral_source: profile.referralSource,
            dietary_preferences: profile.dietaryProfile,
            allergies: profile.allergies,
            disliked_ingredients: profile.dislikes,
            skill_level: profile.cookingSkill,
            preferred_cooking_time: profile.cookingTime,
            cooking_frequency: profile.cookingFrequency,
            household_size: profile.cookingFor,
            preferred_cuisines: profile.favoriteCuisines,
            kitchen_equipment: profile.kitchenEquipment,
            meal_planning_preference: profile.mealPlanPreference,
            notifications_enabled: profile.notifications.includes('all'),
            health_goals: profile.goals,
            gender: profile.gender || undefined,
            date_of_birth: profile.dob || undefined,
            current_weight: profile.weight || undefined,
            current_height: profile.height || undefined,
            activity_level: profile.activityLevel || undefined,
            weight_goal: profile.weightGoal || undefined,
          };

          const cleanBackendData = Object.fromEntries(
            Object.entries(backendData).filter(([_, v]) => v !== undefined && v !== '')
          );

          await userService.updateProfile(cleanBackendData);
          set({ onboardingStep: step });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Failed to save progress' };
        }
      },

      setProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      toggleDietaryProfile: (diet) =>
        set((state) => {
          const diets = state.profile.dietaryProfile.includes(diet)
            ? state.profile.dietaryProfile.filter((d) => d !== diet)
            : [...state.profile.dietaryProfile, diet];
          return { profile: { ...state.profile, dietaryProfile: diets } };
        }),

      toggleAllergy: (allergy) =>
        set((state) => {
          const allergies = state.profile.allergies.includes(allergy)
            ? state.profile.allergies.filter((a) => a !== allergy)
            : [...state.profile.allergies, allergy];
          return { profile: { ...state.profile, allergies } };
        }),

      toggleDislike: (dislike) =>
        set((state) => {
          const dislikes = state.profile.dislikes.includes(dislike)
            ? state.profile.dislikes.filter((d) => d !== dislike)
            : [...state.profile.dislikes, dislike];
          return { profile: { ...state.profile, dislikes } };
        }),

      addDislike: (dislike) =>
        set((state) => {
          if (state.profile.dislikes.includes(dislike)) return {};
          return { profile: { ...state.profile, dislikes: [...state.profile.dislikes, dislike] } };
        }),

      removeDislike: (dislike) =>
        set((state) => ({
          profile: {
            ...state.profile,
            dislikes: state.profile.dislikes.filter((d) => d !== dislike),
          },
        })),

      toggleCuisine: (cuisine) =>
        set((state) => {
          const cuisines = state.profile.favoriteCuisines.includes(cuisine)
            ? state.profile.favoriteCuisines.filter((c) => c !== cuisine)
            : [...state.profile.favoriteCuisines, cuisine];
          return { profile: { ...state.profile, favoriteCuisines: cuisines } };
        }),

      toggleEquipment: (item) =>
        set((state) => {
          const equipment = state.profile.kitchenEquipment.includes(item)
            ? state.profile.kitchenEquipment.filter((e) => e !== item)
            : [...state.profile.kitchenEquipment, item];
          return { profile: { ...state.profile, kitchenEquipment: equipment } };
        }),

      toggleGoal: (goal) =>
        set((state) => {
          const goals = state.profile.goals.includes(goal)
            ? state.profile.goals.filter((g) => g !== goal)
            : [...state.profile.goals, goal];
          return { profile: { ...state.profile, goals } };
        }),

      toggleNotification: (key) =>
        set((state) => {
          const notifications = state.profile.notifications.includes(key)
            ? state.profile.notifications.filter((n) => n !== key)
            : [...state.profile.notifications, key];
          return { profile: { ...state.profile, notifications } };
        }),

      saveOnboardingStep: async (step: number) => {
        set({ onboardingStep: step });
        try {
          await userService.updateOnboardingStep(step);
        } catch (_) {}
      },

      completeOnboarding: () => set({ isOnboarded: true, onboardingStep: 22 }),

      resetOnboarding: () =>
        set(() => ({
          isOnboarded: false,
          onboardingStep: 1,
          profile: initialProfile,
        })),
    }),
    {
      name: 'cooked-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

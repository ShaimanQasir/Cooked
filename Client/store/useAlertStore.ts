import { create } from 'zustand';

export interface AlertOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertStore {
  visible: boolean;
  options: AlertOptions | null;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  visible: false,
  options: null,
  showAlert: (options) => set({ visible: true, options }),
  hideAlert: () => set({ visible: false, options: null }),
}));

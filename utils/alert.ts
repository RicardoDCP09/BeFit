import { showCustomAlert } from '@/components/CustomAlert';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export const showAlert = (
  title: string,
  message: string,
  buttons: AlertButton[] = [{ text: 'OK' }],
  type?: 'info' | 'success' | 'warning' | 'error'
) => {
  showCustomAlert(title, message, buttons, type);
};

// Convenience methods for different alert types
export const showSuccess = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }], 'success');
};

export const showError = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }], 'error');
};

export const showWarning = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }], 'warning');
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
) => {
  showAlert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ],
    'warning'
  );
};

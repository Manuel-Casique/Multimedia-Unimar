import Swal from 'sweetalert2';

const ToastMixin = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: 'rounded-xl shadow-xl text-sm',
  },
});

const toast = {
  success: (title: string, text?: string) =>
    ToastMixin.fire({ icon: 'success', title, text }),
  error: (title: string, text?: string) =>
    ToastMixin.fire({ icon: 'error', title, text }),
  warning: (title: string, text?: string) =>
    ToastMixin.fire({ icon: 'warning', title, text }),
  info: (title: string, text?: string) =>
    ToastMixin.fire({ icon: 'info', title, text }),
};

export default toast;

// Re-export Swal for confirmation dialogs that need centered modals
export { Swal };

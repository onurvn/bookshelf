import toast from "react-hot-toast";

export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      icon: "⚠️",
      duration: 4000,
      position: "top-right",
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      icon: "ℹ️",
      duration: 3000,
      position: "top-right",
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      position: "top-right",
    });
  };

  const dismiss = (toastId?: string) => {
    toast.dismiss(toastId);
  };

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss,
  };
};

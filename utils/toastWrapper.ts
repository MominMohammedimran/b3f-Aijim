
import { useToast } from "@/hooks/use-toast";

let toastFn: any = null;

export const initializeToast = (toast: any) => {
  toastFn = toast;
};

export const toast = {
  success: (message: string, options?: any) => {
    if (toastFn) {
      toastFn({
        title: "Success",
        description: message,
        ...options
      });
    }
  },
  error: (message: string, options?: any) => {
    if (toastFn) {
      toastFn({
        title: "Error",
        description: message,
        variant: "destructive",
        ...options
      });
    }
  },
  info: (message: string, options?: any) => {
    if (toastFn) {
      toastFn({
        title: "Info", 
        description: message,
        ...options
      });
    }
  }
};

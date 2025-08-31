'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Toast Provider Component
interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      style={{ zIndex: 9999 }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-200 transform";
    const visibilityStyles = isVisible && !isExiting 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    
    switch (toast.type) {
      case 'success':
        return <Check className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600 dark:text-red-400`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600 dark:text-yellow-400`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
      default:
        return <Info className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        )}
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Hook to use toasts
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

// Convenience functions for different toast types
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, message, ...options }),
  };
}

// Global toast function for use outside React components
let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function setGlobalToastFunction(addToast: (toast: Omit<Toast, 'id'>) => void) {
  globalAddToast = addToast;
}

export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    if (globalAddToast) {
      globalAddToast({ type: 'success', title, message, ...options });
    }
  },
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    if (globalAddToast) {
      globalAddToast({ type: 'error', title, message, ...options });
    }
  },
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    if (globalAddToast) {
      globalAddToast({ type: 'warning', title, message, ...options });
    }
  },
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    if (globalAddToast) {
      globalAddToast({ type: 'info', title, message, ...options });
    }
  },
};

// Setup global toast function
export function initializeGlobalToast() {
  if (typeof window !== 'undefined' && globalAddToast === null) {
    // This would be called from the ToastProvider
    return setGlobalToastFunction;
  }
  return null;
}
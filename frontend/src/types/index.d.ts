import { ReactNode } from 'react';

declare module 'react-hot-toast' {
  interface Toast {
    id: string;
    type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    message: ReactNode;
    icon?: ReactNode;
    duration?: number;
    pauseDuration: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }

  interface ToastOptions {
    duration?: number;
    position?: Toast['position'];
    id?: string;
    icon?: ReactNode;
    style?: React.CSSProperties;
    className?: string;
    success?: Partial<Toast>;
    error?: Partial<Toast>;
    loading?: Partial<Toast>;
  }

  export const toast: {
    (message: ReactNode, options?: ToastOptions): string;
    success(message: ReactNode, options?: ToastOptions): string;
    error(message: ReactNode, options?: ToastOptions): string;
    loading(message: ReactNode, options?: ToastOptions): string;
    custom(message: ReactNode, options?: ToastOptions): string;
    dismiss(toastId?: string): void;
    remove(toastId?: string): void;
    promise<T>(
      promise: Promise<T>,
      msgs: {
        loading: ReactNode;
        success: ReactNode | ((data: T) => ReactNode);
        error: ReactNode | ((error: any) => ReactNode);
      },
      opts?: ToastOptions
    ): Promise<T>;
  };

  export const Toaster: React.FC<{
    position?: Toast['position'];
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    gutter?: number;
  }>;
}

declare module '@headlessui/react' {
  export const Dialog: React.FC<any>;
  export const Menu: React.FC<any> & {
    Button: React.FC<any>;
    Items: React.FC<any>;
    Item: React.FC<any>;
  };
  export const Transition: React.FC<any> & {
    Child: React.FC<any>;
    Root: React.FC<any>;
  };
}

declare module '@heroicons/react/24/outline' {
  export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Bars3Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module 'chart.js/auto';
declare module 'react-chartjs-2' {
  export const Bar: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Line: React.FC<any>;
  export const Doughnut: React.FC<any>;
} 
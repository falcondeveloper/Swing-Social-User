import { toast, ToastOptions, TypeOptions } from 'react-toastify';

// Brand-consistent toast configuration
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  style: {
    background: "#1e1e1e",
    color: "#ffffff",
    borderRadius: "12px",
    border: "1px solid rgba(255, 27, 107, 0.2)",
    backdropFilter: "blur(10px)",
  },
};

const mobileOptions: ToastOptions = {
  ...defaultOptions,
  position: "top-center",
  autoClose: 3000,
  style: {
    ...defaultOptions.style,
    margin: "10px",
    width: "calc(100vw - 20px)",
    maxWidth: "400px",
  },
};

// Check if mobile device
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

// Custom notification service following SwingSocial branding
export const notify = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    const config = isMobile() ? mobileOptions : defaultOptions;
    return toast.success(message, {
      ...config,
      style: {
        ...config.style,
        borderColor: "#4CAF50",
        background: "linear-gradient(135deg, #1e1e1e 0%, rgba(76, 175, 80, 0.1) 100%)",
      },
      ...options,
    });
  },

  error: (message: string, options?: Partial<ToastOptions>) => {
    const config = isMobile() ? mobileOptions : defaultOptions;
    return toast.error(message, {
      ...config,
      autoClose: 5000, // Keep errors visible longer
      style: {
        ...config.style,
        borderColor: "#FF1B6B",
        background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255, 27, 107, 0.1) 100%)",
      },
      ...options,
    });
  },

  warning: (message: string, options?: Partial<ToastOptions>) => {
    const config = isMobile() ? mobileOptions : defaultOptions;
    return toast.warning(message, {
      ...config,
      style: {
        ...config.style,
        borderColor: "#FFC107",
        background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255, 193, 7, 0.1) 100%)",
      },
      ...options,
    });
  },

  info: (message: string, options?: Partial<ToastOptions>) => {
    const config = isMobile() ? mobileOptions : defaultOptions;
    return toast.info(message, {
      ...config,
      style: {
        ...config.style,
        borderColor: "#03dac5",
        background: "linear-gradient(135deg, #1e1e1e 0%, rgba(3, 218, 197, 0.1) 100%)",
      },
      ...options,
    });
  },

  // Custom branded notification
  swingSocial: (message: string, options?: Partial<ToastOptions>) => {
    const config = isMobile() ? mobileOptions : defaultOptions;
    return toast(message, {
      ...config,
      style: {
        ...config.style,
        borderColor: "#FF1B6B",
        background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255, 27, 107, 0.15) 100%)",
        boxShadow: "0 4px 15px rgba(255, 27, 107, 0.2)",
      },
      ...options,
    });
  },

  // Geolocation specific notifications
  location: {
    denied: () => {
      const config = isMobile() ? mobileOptions : defaultOptions;
      return toast.error("Location access denied. Please enable location services in your browser settings to see nearby matches.", {
        ...config,
        autoClose: 7000,
        style: {
          ...config.style,
          borderColor: "#FF1B6B",
          background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255, 27, 107, 0.1) 100%)",
        },
      });
    },

    unavailable: () => {
      const config = isMobile() ? mobileOptions : defaultOptions;
      return toast.warning("Location service is unavailable. Using default location for matches.", {
        ...config,
        autoClose: 5000,
        style: {
          ...config.style,
          borderColor: "#FFC107",
          background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255, 193, 7, 0.1) 100%)",
        },
      });
    },

    timeout: () => {
      const config = isMobile() ? mobileOptions : defaultOptions;
      return toast.warning("Location request timed out. Using default location for matches.", {
        ...config,
        autoClose: 5000,
        style: {
          ...config.style,
          borderColor: "#FFC107",
          background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255, 193, 7, 0.1) 100%)",
        },
      });
    },

    notSupported: () => {
      const config = isMobile() ? mobileOptions : defaultOptions;
      return toast.info("Your browser doesn't support location services. Using default location for matches.", {
        ...config,
        autoClose: 5000,
        style: {
          ...config.style,
          borderColor: "#03dac5",
          background: "linear-gradient(135deg, #1e1e1e 0%, rgba(3, 218, 197, 0.1) 100%)",
        },
      });
    },

    success: (locationName: string) => {
      const config = isMobile() ? mobileOptions : defaultOptions;
      return toast.success(`Location updated to ${locationName}`, {
        ...config,
        autoClose: 3000,
        style: {
          ...config.style,
          borderColor: "#4CAF50",
          background: "linear-gradient(135deg, #1e1e1e 0%, rgba(76, 175, 80, 0.1) 100%)",
        },
      });
    },
  },

  // Dismiss all toasts
  dismissAll: () => toast.dismiss(),
};

// Geolocation error handler
export const handleGeolocationError = (error: GeolocationPositionError) => {
        /// removed
  /* console.warn("Geolocation error:", error);
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      notify.location.denied();
      break;
    case error.POSITION_UNAVAILABLE:
      notify.location.unavailable();
      break;
    case error.TIMEOUT:
      notify.location.timeout();
      break;
    default:
      notify.error("An error occurred while getting your location.");
      break;
  } */
};

// Check geolocation support
export const checkGeolocationSupport = () => {
  if (!navigator.geolocation) {
    notify.location.notSupported();
    return false;
  }
  return true;
};
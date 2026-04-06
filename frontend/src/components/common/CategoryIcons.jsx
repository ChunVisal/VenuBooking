// src/components/icons/CategoryIcons.jsx
import React from "react";

export const AllIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const TrendingIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L15 7H9L12 2Z" />
    <path d="M17 9L22 12L17 15V9Z" />
    <path d="M7 9V15L2 12L7 9Z" />
    <path d="M12 22L9 17H15L12 22Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const MusicIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5L19 3V16" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="16" cy="16" r="3" />
    <path d="M9 8L19 6" />
  </svg>
);

export const SportsIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4L12 20" />
    <path d="M4 12L20 12" />
    <path d="M7.5 7.5L16.5 16.5" />
    <path d="M7.5 16.5L16.5 7.5" />
  </svg>
);

export const ArtsIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 19L19 5" />
    <path d="M12 3L3 12" />
    <path d="M21 12L12 21" />
    <path d="M12 21L21 12" />
    <circle cx="12" cy="12" r="3" />
    <path d="M16 8L8 16" />
  </svg>
);

export const NetworkingIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M9 7L7 16" />
    <path d="M15 7L17 16" />
    <path d="M12 9L12 12" />
    <circle cx="12" cy="14" r="1.5" />
  </svg>
);

export const FoodIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3V9M12 9C10.5 9 9 7.5 9 6M12 9C13.5 9 15 7.5 15 6" />
    <path d="M7 7L8 12L6 19" />
    <path d="M17 7L16 12L18 19" />
    <path d="M8 13H16" />
    <path d="M10 19L14 19" />
    <path d="M12 13V19" />
  </svg>
);

export const TechIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="M8 3L12 6L16 3" />
    <circle cx="12" cy="12" r="2" />
    <path d="M7 12H4" />
    <path d="M20 12H17" />
    <path d="M12 8V7" />
    <path d="M12 17V16" />
  </svg>
);

export const TicketsIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9L21 9" />
    <path d="M3 15L21 15" />
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 7L7 17" />
    <path d="M17 7L17 17" />
    <circle cx="10" cy="12" r="1" />
    <circle cx="14" cy="12" r="1" />
  </svg>
);

export const ShoppingIcon = ({ className = "h-8 w-8", isActive = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 7L7 18H17L18 7H6Z" />
    <path d="M9 7V5C9 3.5 10 3 12 3C14 3 15 3.5 15 5V7" />
    <circle cx="9" cy="11" r="1" />
    <circle cx="15" cy="11" r="1" />
    <path d="M7 15H17" />
  </svg>
);

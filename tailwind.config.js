/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0f1117",
          secondary: "#1a1d27",
          tertiary: "#242834",
        },
        border: {
          DEFAULT: "#2e3345",
          hover: "#3d4359",
        },
        text: {
          primary: "#e8eaed",
          secondary: "#9aa0ad",
          muted: "#6b7280",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          light: "#60a5fa",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#06b6d4",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

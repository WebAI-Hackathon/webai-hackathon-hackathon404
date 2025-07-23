import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff7ed" },
          100: { value: "#ffedd5" },
          200: { value: "#fed7aa" },
          300: { value: "#fdba74" },
          400: { value: "#fb923c" },
          500: { value: "#f97316" }, // Primary orange
          600: { value: "#ea580c" },
          700: { value: "#c2410c" },
          800: { value: "#9a3412" },
          900: { value: "#7c2d12" },
        },
        gray: {
          50: { value: "#f9fafb" },
          100: { value: "#f3f4f6" },
          200: { value: "#e5e7eb" },
          300: { value: "#d1d5db" },
          400: { value: "#9ca3af" },
          500: { value: "#6b7280" },
          600: { value: "#4b5563" },
          700: { value: "#374151" },
          800: { value: "#1f2937" },
          900: { value: "#111827" },
          950: { value: "#0a0a0a" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: "{colors.gray.950}" },
          secondary: { value: "{colors.gray.900}" },
          tertiary: { value: "{colors.gray.800}" },
        },
        text: {
          primary: { value: "{colors.gray.50}" },
          secondary: { value: "{colors.gray.300}" },
          muted: { value: "{colors.gray.500}" },
        },
        border: {
          DEFAULT: { value: "{colors.gray.700}" },
          secondary: { value: "{colors.gray.600}" },
        },
        accent: {
          primary: { value: "{colors.brand.500}" },
          secondary: { value: "{colors.brand.600}" },
          hover: { value: "{colors.brand.400}" },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: "bg",
      color: "text.primary",
    },
  },
});

export const system = createSystem(defaultConfig, config);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
 ],
  safelist: [
    // Light bg classes
    "bg-blue-100",
    "bg-pink-100",
    "bg-emerald-100",
    "bg-purple-100",
    "bg-amber-100",
    "bg-rose-100",
    "bg-lime-100",
    "bg-cyan-100",
    // Dark bg classes
    "bg-blue-950",
    "bg-pink-700",
    "bg-emerald-900",
    "bg-purple-800",
    "bg-blue-800",
    "bg-amber-800",
    "bg-rose-900",
    "bg-lime-800",
    "bg-cyan-800",
    "bg-emerald-700",
    "bg-rose-800",
    "bg-[#2c1332]",
    "bg-pink-600",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

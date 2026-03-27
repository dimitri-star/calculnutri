/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#F5F5F5',
        card: '#FFFFFF',
        ink: '#1A1A1A',
        muted: '#757575',
        accent: '#FF7A00',
        'accent-soft': 'rgba(255, 122, 0, 0.12)',
        'accent-border': 'rgba(255, 122, 0, 0.35)',
        line: 'rgba(26, 26, 26, 0.08)',
        pastelBlue: '#E3F2FD',
        pastelGreen: '#E8F5E9',
        pastelPink: '#FCE4EC',
        pastelOrange: '#FFF3E0',
        macroBlue: '#1E88E5',
        macroGreen: '#43A047',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '26px',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(26, 26, 26, 0.06), 0 1px 3px rgba(26, 26, 26, 0.04)',
        'soft-lg': '0 8px 32px rgba(26, 26, 26, 0.08), 0 2px 8px rgba(26, 26, 26, 0.04)',
      },
    },
  },
  plugins: [],
}

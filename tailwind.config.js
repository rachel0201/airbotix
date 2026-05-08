/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Airbotix K-12 design system v2 (see DESIGN.md) ===
        brand: {
          coral:     '#FF7A66',  // AI Coding · primary CTA
          bubblegum: '#FF6BA9',  // Hackathons · joy
          sunshine:  '#FFD43B',  // Robotics · creativity
          sky:       '#5DAEFF',  // Schools · trust
          mint:      '#3DD9A9',  // Progress · success
        },
        // Pale section wash backgrounds (alternate adjacent sections)
        wash: {
          coral:     '#FFEFE9',
          bubblegum: '#FFEAF3',
          sunshine:  '#FFF7D6',
          sky:       '#E8F2FF',
          mint:      '#DCF6EC',
        },
        ink: {
          DEFAULT: '#1F1B2D',  // primary headings & body — warmer than pure black
          soft:    '#3D3851',  // body & long-form
        },
        canvas: {
          DEFAULT: '#FFFEF7',  // warm canvas (3% off white) — KEY to K-12 feel
          pure:    '#FFFFFF',  // for cards & modals
        },
        surface: {
          DEFAULT: '#FFF8EE',  // soft cream wash
          soft:    '#FFF1DE',
        },
        hairline: {
          DEFAULT: '#EFE8DA',
          soft:    '#F5EFE3',
        },
        slate2: '#6B6478',     // secondary text — warm tone (Tailwind's slate is cool)
        steel:  '#9C95AB',
        stone2: '#C7C0D5',

        // === Legacy tokens — kept until all pages migrate ===
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        secondary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e',
        },
        charcoal: '#374151', // legacy
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
      borderRadius: {
        hero: '40px',  // bumped from 32px — more rounded for K-12
        xl: '20px',    // override Tailwind default 12px
        '2xl': '24px', // override Tailwind default 16px
        '3xl': '32px',
      },
      backgroundImage: {
        'grad-coral':     'linear-gradient(135deg, #FF9A80 0%, #FF5B7E 100%)',
        'grad-bubblegum': 'linear-gradient(135deg, #FF8FBE 0%, #FF4F8F 100%)',
        'grad-sunshine':  'linear-gradient(135deg, #FFE26B 0%, #FFB638 100%)',
        'grad-sky':       'linear-gradient(135deg, #7FC2FF 0%, #3D8FFF 100%)',
        'grad-mint':      'linear-gradient(135deg, #6BE7BF 0%, #1FC692 100%)',
      },
      boxShadow: {
        'brand-coral':     '0 16px 40px -8px rgba(255, 122, 102, 0.40)',
        'brand-bubblegum': '0 16px 40px -8px rgba(255, 107, 169, 0.40)',
        'brand-sunshine':  '0 16px 40px -8px rgba(255, 212, 59, 0.45)',
        'brand-sky':       '0 16px 40px -8px rgba(93, 174, 255, 0.40)',
        'brand-mint':      '0 16px 40px -8px rgba(61, 217, 169, 0.40)',
        'card-soft':       '0 8px 24px -6px rgba(31, 27, 45, 0.10)',
        'sticker':         '4px 4px 0 0 rgba(31, 27, 45, 0.95)',
      },
      letterSpacing: {
        'hero': '-0.025em',
      },
    },
  },
  plugins: [],
}

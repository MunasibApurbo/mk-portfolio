/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        fontFamily: {
            sans: ['Space Grotesk', 'system-ui', 'sans-serif'], // Techno/Sci-fi vibe
            display: ['Erica One', 'cursive'], // Bold Headers
            script: ['Caveat', 'cursive'], // Decorative handwritten elements
            mono: ['ui-monospace', 'monospace'], // Tech/Stats
        },
        extend: {
            colors: {
                violet: {
                    DEFAULT: '#8b5cf6', // Standard violet/purple
                    900: '#2e1065',
                    950: '#1a0636', // Deep Purple Background
                },
                neon: '#22d3ee', // Cyan (replacing Neon Green)
                // Aliasing for backward compatibility or ease of switch
                primary: '#22d3ee',
                background: '#1a0636',
                // Inverse of violet background - used for all "white" text
                lime: '#E5F9C9',
                white: '#E5F9C9', // Override default white with inverse lime

                cyan: {
                    DEFAULT: '#22d3ee', // Updated to match Neon/Cyan theme
                    400: '#22d3ee',
                },

                dark: {
                    50: '#f4f4f5',
                    100: '#e4e4e7',
                    200: '#d4d4d8',
                    300: '#a1a1aa',
                    400: '#71717a',
                    500: '#52525b',
                    600: '#3f3f46',
                    700: '#27272a',
                    800: '#18181b',
                    900: '#0f0518', // Secondary Violet (was standard black)
                    950: '#1a0636', // Kept for existing references
                },
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
            },
        },
    },
    plugins: [],
}

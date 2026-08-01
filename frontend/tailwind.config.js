/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e8edf5',
                    100: '#c5d0e5',
                    200: '#9eb1d0',
                    300: '#7791bb',
                    400: '#5a79ab',
                    500: '#0F1B2D',
                    600: '#0d1826',
                    700: '#0a1220',
                    800: '#070d18',
                    900: '#04080f',
                },
                accent: {
                    50: '#e8f5e9',
                    100: '#c8e6c9',
                    200: '#a5d6a7',
                    300: '#81c784',
                    400: '#66bb6a',
                    500: '#4CAF50',
                    600: '#43A047',
                    700: '#388E3C',
                    800: '#2E7D32',
                    900: '#1B5E20',
                },
                success: { 500: '#22c55e', 600: '#16a34a' },
                warning: { 500: '#f59e0b', 600: '#d97706' },
                danger: { 500: '#ef4444', 600: '#dc2626' },
            },
            fontFamily: {
                sans: ['Montserrat', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'body': ['1.125rem', { lineHeight: '1.75rem' }],
                'body-lg': ['1.25rem', { lineHeight: '2rem' }],
                'heading': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
                'heading-lg': ['2.5rem', { lineHeight: '3rem', fontWeight: '800' }],
                'heading-xl': ['3rem', { lineHeight: '3.5rem', fontWeight: '800' }],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 20px rgba(76, 175, 80, 0.3)',
            },
        },
    },
    plugins: [],
};

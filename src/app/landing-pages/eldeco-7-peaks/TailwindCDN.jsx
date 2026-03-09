'use client';

import { useEffect } from 'react';

export default function TailwindCDN() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('tailwind-config-eldeco')) return;

    const config = document.createElement('script');
    config.id = 'tailwind-config-eldeco';
    config.textContent = `
      tailwind.config = {
        theme: {
          screens: {
            'xs': '375px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
          },
          extend: {
            fontFamily: {
              montserrat: ['Montserrat', 'sans-serif'],
              opensans: ['Open Sans', 'sans-serif'],
            },
          },
        },
      };
    `;
    document.head.appendChild(config);

    const tw = document.createElement('script');
    tw.src = 'https://cdn.tailwindcss.com';
    tw.async = true;
    document.head.appendChild(tw);

    return () => {
      config.remove();
      tw.remove();
    };
  }, []);

  return null;
}

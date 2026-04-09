'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] text-[var(--foreground)] hover:scale-110 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6 flex items-center justify-center">
                {/* Sun Icon */}
                <Sun
                    className={`absolute transition-all duration-500 transform ${theme === 'light'
                            ? 'rotate-0 scale-100 opacity-100 text-amber-500'
                            : 'rotate-90 scale-0 opacity-0'
                        }`}
                    size={20}
                />
                {/* Moon Icon */}
                <Moon
                    className={`absolute transition-all duration-500 transform ${theme === 'dark'
                            ? 'rotate-0 scale-100 opacity-100 text-blue-400'
                            : '-rotate-90 scale-0 opacity-0'
                        }`}
                    size={20}
                />
            </div>

            {/* Background Glow Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${theme === 'light' ? 'bg-amber-400' : 'bg-blue-400'
                }`} />
        </button>
    );
};

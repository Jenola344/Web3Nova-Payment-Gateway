'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ChristmasPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkChristmas = () => {
            const today = new Date();
            // Check if it's December 25th
            // Month is 0-indexed, so 11 is December
            const isChristmas = today.getMonth() === 11 && today.getDate() === 25;

            // For testing purposes, uncomment the line below to force show
            // const isChristmas = true;

            if (isChristmas) {
                const lastShown = localStorage.getItem('christmasPopupShown');
                const todayString = today.toDateString();

                if (lastShown !== todayString) {
                    // Slight delay for better UX
                    setTimeout(() => setIsVisible(true), 1500);
                }
            }
        };

        // Only run on client side and maybe not on login page? 
        // User requested "upon successful sign-in" essentially implying dashboard
        // But layout covers everything. Let's show it on Dashboard or Admin pages essentially.
        // Or generally everywhere but not interrupt login flow?
        // Let's just run it. If they are on login page on Xmas, why not?
        // But maybe better on dashboard.
        if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
            checkChristmas();
        }

    }, [pathname]);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('christmasPopupShown', new Date().toDateString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative bg-gradient-to-br from-red-900 to-green-900 p-1 rounded-3xl shadow-2xl max-w-md w-full animate-bounce-in">
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-6xl">
                    🎅
                </div>
                <div className="bg-blue-950 rounded-[22px] p-8 text-center border border-white/10 relative overflow-hidden">
                    {/* Snow effect (simulated with simple dots/CSS or just decorative elements) */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                        {/* Simple CSS Snowflakes */}
                        <div className="absolute top-2 left-4 text-white text-xs">*</div>
                        <div className="absolute top-8 left-1/4 text-white text-sm">❄</div>
                        <div className="absolute top-4 right-10 text-white text-xs">❄</div>
                        <div className="absolute bottom-10 right-4 text-white text-sm">*</div>
                        <div className="absolute bottom-4 left-10 text-white text-xs">❄</div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 mt-4 font-serif text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-green-400">
                        Merry Christmas!
                    </h2>
                    <p className="text-blue-200 mb-6">
                        Sending you warm wishes and holiday cheer from all of us at Web3Nova Academy. May your code be bug-free and your holidays be bright! 🎄✨
                    </p>

                    <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-white text-red-900 font-bold rounded-xl hover:bg-red-50 transition-all shadow-lg transform hover:-translate-y-1"
                    >
                        Thank You!
                    </button>
                </div>
            </div>
            {/* Confetti or simple sparkles could be added here if allowed external libs, but plain CSS is safer */}
        </div>
    );
}

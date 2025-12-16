'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    const numNodes = 80;

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(147, 51, 234, 0.6)';
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date('2025-12-31T23:59:59').getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden p-4">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute top-0 right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-6xl w-full text-center flex flex-col items-center gap-8">
          <div>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <span className="text-3xl">🚀</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4 animate-fade-in">
              Web3Nova
            </h1>
          </div>

          {/* Countdown Timer */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">⏰ Payment Deadline</h2>
            <p className="text-purple-200 mb-6">All students must pay ₦20,000 by December 31, 2025</p>
            <div className="flex justify-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 min-w-[90px] shadow-lg">
                <div className="text-xl font-bold text-white">{countdown.days}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 min-w-[90px] shadow-lg">
                <div className="text-xl font-bold text-white">{countdown.hours}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 min-w-[90px] shadow-lg">
                <div className="text-xl font-bold text-white">{countdown.minutes}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 min-w-[90px] shadow-lg">
                <div className="text-xl font-bold text-white">{countdown.seconds}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
            <Link
              href="/login"
              className="group px-6 py-3 rounded-4xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transform"
            >
              <div className="flex items-center gap-3">
                <span>🎓</span>
                <span>Student Portal</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
            <Link
              href="/tracker"
              className="group px-6 py-3 bg-white/10 backdrop-blur-lg border-2 border-white/50 text-white rounded-4xl font-bold text-xl hover:bg-white hover:text-purple-900 transition-all duration-300 shadow-2xl hover:shadow-white/50 hover:scale-105 transform"
            >
              <div className="flex items-center gap-3">
                <span>📊</span>
                <span>Payment Tracker</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
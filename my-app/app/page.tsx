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

      // Blue connections
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'; // blue-500 equivalent with opacity
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

      // White/Blue nodes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
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
    <div className="min-h-screen bg-blue-950 relative overflow-hidden p-4 font-sans text-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'none' }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[128px] opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-6xl w-full text-center flex flex-col items-center gap-5">
          <div>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                <span className="text-4xl">🚀</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-6 animate-fade-in drop-shadow-lg">
              Web3Nova
            </h1>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Payment Deadline</h2>
              <p className="text-blue-200 text-sm">December 31, 2025</p>
            </div>

            <div className="bg-blue-900/40 backdrop-blur-md rounded-xl p-4 border border-blue-700/30 flex items-center gap-4">
              {Object.entries(countdown).map(([unit, value], idx) => (
                <div key={unit} className="flex items-center">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-mono font-bold text-white leading-none">
                      {value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-blue-300 uppercase tracking-wider mt-1">{unit}</div>
                  </div>
                  {idx < 3 && <div className="text-blue-500/50 text-xl font-bold mx-2 md:mx-3 -mt-3">:</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-center w-full max-w-md mx-auto">
            <Link
              href="/login"
              className="w-full group px-8 py-4 rounded-2xl bg-white text-blue-950 font-bold text-xs hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <span>Student Portal</span>
              </div>
            </Link>
            <Link
              href="/tracker"
              className="w-full group px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-bold text-xs hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <span>Payment Tracker</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
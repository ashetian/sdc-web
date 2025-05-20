'use client';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="home" className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      <InteractiveBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      <div className={`relative z-10 w-full text-center px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            KTÜ Yazılım Geliştirme Kulübü
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Yazılım geliştirme tutkusuyla bir araya gelen öğrenciler için
          inovasyon ve öğrenme merkezi
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-64 sm:w-auto px-8 py-3 bg-primary-500 text-white rounded-full font-medium 
                     hover:bg-primary-600 transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-primary-500/50"
          >
            Bizi Tanıyın
          </button>
          
          <button
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-64 sm:w-auto px-8 py-3 bg-white/10 text-white rounded-full font-medium 
                     backdrop-blur-sm hover:bg-white/20 transform hover:scale-105 
                     transition-all duration-300 border border-white/30"
          >
            İletişime Geçin
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <Stat number="60+" text="Üye" />
          <Stat number="2" text="Proje" />
          <Stat number="5" text="Etkinlik" />
          <Stat number="0" text="Workshop" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, text }: { number: string; text: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white mb-2">{number}</div>
      <div className="text-gray-300">{text}</div>
    </div>
  );
}

function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function resize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
    const colors = ['#a855f7', '#f472b6', '#38bdf8', '#facc15'];
    const PARTICLE_COUNT = Math.max(40, Math.floor(window.innerWidth / 30));

    function initParticles() {
      particles = [];
      const c = canvasRef.current!;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          size: 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    let mouse = { x: -1000, y: -1000 };
    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    function draw() {
      const c = canvasRef.current;
      const context = c?.getContext('2d');
      if (!c || !context) return;
      context.clearRect(0, 0, c.width, c.height);
      const grad = context.createLinearGradient(0, 0, c.width, c.height);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      context.fillStyle = grad;
      context.fillRect(0, 0, c.width, c.height);

      // Particles
      for (let p of particles) {
        // Mouse yakınsa büyüt
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        let size = p.size;
        if (dist < 80) size += (80 - dist) * 0.08;
        context.beginPath();
        context.arc(p.x, p.y, size, 0, Math.PI * 2);
        context.fillStyle = p.color + 'cc';
        context.shadowColor = p.color;
        context.shadowBlur = 12;
        context.fill();
        context.shadowBlur = 0;
      }

      // Bağlantı çizgileri
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            context.save();
            context.globalAlpha = 0.12 + (1 - dist / 120) * 0.18;
            context.strokeStyle = a.color;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
            context.globalAlpha = 1;
            context.restore();
          }
        }
      }

      // Hareket
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > c!.width) p.vx *= -1;
        if (p.y < 0 || p.y > c!.height) p.vy *= -1;
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    initParticles();
    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 w-full h-full block"
      style={{ zIndex: 0 }}
    />
  );
}
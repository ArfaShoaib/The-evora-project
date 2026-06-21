'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ── Particle Network ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function initParticles() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      }));
    }

    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(201,169,110,0.6)';
        ctx!.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(201,169,110,${0.15 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0d0d0d' }}
    />
  );
}

// ── Concentric Rings ─────────────────────────────────────────────────────────
function ConcentricRings() {
  const rings = [0, 1, 2];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {rings.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#c9a96e]/20"
          style={{
            width: `${280 + i * 120}px`,
            height: `${280 + i * 120}px`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
}

// ── Brand Block ──────────────────────────────────────────────────────────────
const brandVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

function BrandBlock() {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center text-center px-8"
      variants={brandVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo link */}
      <motion.div variants={fadeUp}>
        <Link href="/">
          <span className="font-serif text-4xl font-bold tracking-[0.25em] text-[#c9a96e]">
            EVORA
          </span>
        </Link>
      </motion.div>

      {/* Gold divider */}
      <motion.div
        className="w-24 h-px bg-[#c9a96e] my-6 origin-center"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      />

      {/* Tagline */}
      <motion.p
        variants={fadeUp}
        className="font-serif italic text-lg text-[#c9a96e]/80 tracking-wide"
      >
        The Art of Everyday Luxury
      </motion.p>

      {/* Quote */}
      <motion.p
        variants={fadeUp}
        className="mt-8 max-w-xs text-sm italic text-white/40 leading-relaxed"
      >
        &ldquo;Luxury must be comfortable, otherwise it is not luxury.&rdquo;
      </motion.p>
    </motion.div>
  );
}

// ── Exported Panel ───────────────────────────────────────────────────────────
export function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex items-center justify-center overflow-hidden" style={{ background: '#0d0d0d' }}>
      <ParticleCanvas />
      <ConcentricRings />
      <BrandBlock />
    </div>
  );
}

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

const COLORS = [
  "hsl(199 89% 48%)",   // cyan
  "hsl(172 66% 50%)",   // teal
  "hsl(38 92% 50%)",    // amber
  "hsl(262 83% 58%)",   // violet
  "hsl(160 84% 39%)",   // emerald
];

export function TaskCelebration({
  show,
  onComplete,
}: {
  show: boolean;
  onComplete: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) return;

    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      color: COLORS[i % COLORS.length],
      size: Math.random() * 4 + 3,
      angle: (i * 30) + Math.random() * 15,
      speed: Math.random() * 30 + 20,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete();
    }, 600);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <span className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.speed;
        const ty = Math.sin(rad) * p.speed;

        return (
          <span
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animation: "particle-burst 0.6s ease-out forwards",
              ["--tx" as string]: `${tx}px`,
              ["--ty" as string]: `${ty}px`,
            }}
          />
        );
      })}
    </span>
  );
}

import { Target } from "lucide-react";

export type LogoProps = {
  size?: "sm" | "md";
  animated?: boolean;
};

export const Logo = ({ size = "md", animated = false }: LogoProps) => {
  const iconSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const textSize = size === "sm" ? "text-sm" : "text-lg";
  const pulseClass = animated ? "animate-pulse" : "";

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="bg-[color:var(--accent-dim)] p-1.5 rounded border border-[color:var(--accent-glow)]">
        <Target className={`${iconSize} text-[color:var(--accent)] ${pulseClass}`} />
      </div>
      <h1 className={`${textSize} font-bold tracking-wider uppercase font-sans text-[color:var(--text-primary)]`}>
        Meeting <span className="text-[color:var(--accent)]">Killer</span>
      </h1>
    </div>
  );
};

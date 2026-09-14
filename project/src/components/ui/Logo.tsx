interface LogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
  light?: boolean;
}

export function Logo({ className = '', size = 40, showTagline = false, light = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative overflow-hidden rounded-lg bg-white shadow-md flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src="/images/image.png"
          alt="Copper & Crown logo"
          className="h-full w-full scale-[2.25] object-cover object-center"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-crown-900'}`}>
          Copper <span className="text-copper-500">&amp;</span> Crown
        </span>
        {showTagline ? (
          <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-copper-500 mt-0.5">
            The Royal Standard of Electrical Craftsmanship
          </span>
        ) : (
          <span className={`text-[10px] font-medium uppercase tracking-widest ${light ? 'text-crown-400' : 'text-crown-400'}`}>
            Electrical Co.
          </span>
        )}
      </div>
    </div>
  );
}

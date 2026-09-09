import React from 'react';

/**
 * Ornate Victorian/Gothic filigree corner bracket for card edges
 */
export function CardCornerFlourish({ className = "w-6 h-6 text-amber-400" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M2 38V12C2 6.47715 6.47715 2 12 2H38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M6 34V14C6 9.58172 9.58172 6 14 6H34"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path
        d="M12 20C12 15.5817 15.5817 12 20 12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="28" cy="6" r="1.5" fill="currentColor" />
      <circle cx="6" cy="28" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Order of the Phoenix blazing fiery crest (Crimson & Gold)
 */
export function PhoenixCrest({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <radialGradient id="phoenixGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="phoenixGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#phoenixGlow)" />
      {/* Sunburst ring */}
      <circle cx="50" cy="50" r="44" stroke="url(#phoenixGold)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="38" stroke="url(#phoenixGold)" strokeWidth="2" opacity="0.9" />
      {/* Phoenix wings & body */}
      <path
        d="M50 20C48 24 45 28 40 33C33 39 22 43 14 47C24 49 33 46 39 42C33 48 25 56 18 64C28 63 36 57 41 51C37 61 31 70 24 80C34 74 41 65 45 56C47 67 48 78 50 88C52 78 53 67 55 56C59 65 66 74 76 80C69 70 63 61 59 51C64 57 72 63 82 64C75 56 67 48 61 42C67 46 76 49 86 47C78 43 67 39 60 33C55 28 52 24 50 20Z"
        fill="url(#phoenixGold)"
      />
      {/* Head / Flame crest */}
      <path
        d="M50 14C48 17 46 22 50 25C54 22 52 17 50 14Z"
        fill="#fef08a"
      />
      <circle cx="50" cy="38" r="4" fill="#ef4444" stroke="#fef08a" strokeWidth="1" />
    </svg>
  );
}

/**
 * Death Eaters Dark Mark crest (Skull & Serpent) (Emerald & Silver)
 */
export function DarkMarkCrest({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <radialGradient id="markGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#047857" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="markSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="50%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#markGlow)" />
      <circle cx="50" cy="50" r="44" stroke="url(#markSilver)" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.6" />
      <circle cx="50" cy="50" r="38" stroke="url(#markSilver)" strokeWidth="2" opacity="0.9" />
      
      {/* Skull */}
      <path
        d="M34 32C34 22 41 16 50 16C59 16 66 22 66 32C66 38 64 42 61 45C60 49 59 52 59 55H41C41 52 40 49 39 45C36 42 34 38 34 32Z"
        fill="url(#markSilver)"
      />
      {/* Eye Sockets */}
      <ellipse cx="43" cy="34" rx="4.5" ry="5.5" fill="#022c22" />
      <ellipse cx="57" cy="34" rx="4.5" ry="5.5" fill="#022c22" />
      {/* Nose Hole */}
      <path d="M49 41L50 39L51 41Z" fill="#022c22" />
      
      {/* Serpent winding from mouth */}
      <path
        d="M45 53C45 57 42 62 48 67C54 71 61 68 59 76C57 82 48 84 45 87C42 89 44 92 48 91C56 89 67 84 66 74C65 63 52 64 52 58C52 55 54 53 55 53"
        stroke="url(#markSilver)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Forked tongue */}
      <path d="M44 89L38 92M44 89L39 86" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Deathly Hallows iconic triangle, stone & wand
 */
export function DeathlyHallowsSymbol({ className = "w-8 h-8 text-amber-400" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <polygon points="50,10 90,85 10,85" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="50" cy="60" r="25" stroke="currentColor" strokeWidth="4" />
      <line x1="50" y1="10" x2="50" y2="85" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 3D Embossed Wax Seal (Red / Gold / Emerald)
 */
export function WaxSeal({
  variant = 'red',
  letter = 'P',
  size = 'md',
  className = ""
}: {
  variant?: 'red' | 'gold' | 'emerald';
  letter?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const bgGrad = {
    red: 'from-red-600 via-rose-800 to-red-950 text-amber-200 border-red-500/50',
    gold: 'from-amber-400 via-yellow-600 to-amber-900 text-amber-100 border-amber-400/60',
    emerald: 'from-emerald-500 via-teal-700 to-emerald-950 text-emerald-100 border-emerald-400/50',
  }[variant];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-serif font-black select-none border-2 bg-gradient-to-br ${bgGrad} ${sizeMap[size]} ${className}`}
    >
      <div className="absolute inset-1 rounded-full border border-dashed border-white/30" />
      <span className="tracking-tighter">{letter}</span>
    </div>
  );
}

/**
 * Ornate Card Back Art for deluxe board game card flip
 */
export function CardBackArt({ faction = 'ORDER_OF_PHOENIX' }: { faction?: 'ORDER_OF_PHOENIX' | 'DEATH_EATERS' | 'NEUTRAL' }) {
  const isDeathEaters = faction === 'DEATH_EATERS';
  const primaryGlow = isDeathEaters ? '#059669' : '#dc2626';
  const borderTone = isDeathEaters ? 'border-emerald-500/60' : 'border-amber-500/60';
  const innerBg = isDeathEaters 
    ? 'bg-gradient-to-b from-emerald-950 via-[#031d17] to-gray-950'
    : 'bg-gradient-to-b from-red-950 via-[#230808] to-gray-950';

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden p-3 border-2 ${borderTone} ${innerBg} flex flex-col items-center justify-between select-none`}>
      {/* Background celestial damask pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Corner Filigrees */}
      <CardCornerFlourish className="absolute top-2 left-2 w-7 h-7 text-amber-400/80" />
      <CardCornerFlourish className="absolute top-2 right-2 w-7 h-7 text-amber-400/80 -scale-x-100" />
      <CardCornerFlourish className="absolute bottom-2 left-2 w-7 h-7 text-amber-400/80 -scale-y-100" />
      <CardCornerFlourish className="absolute bottom-2 right-2 w-7 h-7 text-amber-400/80 -scale-x-100 -scale-y-100" />

      {/* Outer Border Ring */}
      <div className="absolute inset-4 rounded-xl border border-amber-400/30 pointer-events-none" />
      <div className="absolute inset-5 rounded-lg border border-dashed border-amber-400/20 pointer-events-none" />

      {/* Top Banner */}
      <div className="pt-4 text-center z-10">
        <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-amber-300/80 font-serif">
          The Battle of the
        </span>
        <h4 className="text-xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
          SEVEN POTTERS
        </h4>
      </div>

      {/* Centerpiece Emblem */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Pulsing ring */}
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: primaryGlow }}
          />
          <div className="absolute inset-2 rounded-full border-2 border-amber-400/40" />
          <div className="absolute inset-4 rounded-full border border-dashed border-amber-400/30" />
          
          {isDeathEaters ? (
            <DarkMarkCrest className="w-24 h-24" />
          ) : (
            <PhoenixCrest className="w-24 h-24" />
          )}
        </div>
        <div className="mt-2 text-center">
          <DeathlyHallowsSymbol className="w-6 h-6 mx-auto text-amber-400/70" />
          <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono mt-1 block">
            PRIVET DRIVE TO THE BURROW
          </span>
        </div>
      </div>

      {/* Bottom Seal & Edition */}
      <div className="pb-3 text-center z-10 w-full flex items-center justify-between px-4 border-t border-amber-500/20 pt-2">
        <span className="text-[9px] text-amber-400/70 font-mono">HOGWARTS 1997</span>
        <WaxSeal variant={isDeathEaters ? 'emerald' : 'red'} letter={isDeathEaters ? 'M' : 'P'} size="sm" />
        <span className="text-[9px] text-amber-400/70 font-mono">COLLECTOR CARD</span>
      </div>
    </div>
  );
}

/**
 * Golden Chocolate Frog emblem for card header & back
 */
export function ChocolateFrogLogo({ className = "w-6 h-6 text-amber-400" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50 15C42 15 36 21 34 27C30 25 24 28 24 35C24 43 30 48 35 48C34 54 36 62 42 66C36 70 30 76 22 80C20 81 22 84 25 84C35 84 45 76 48 70C49 70 51 70 52 70C55 76 65 84 75 84C78 84 80 81 78 80C70 76 64 70 58 66C64 62 66 54 65 48C70 48 76 43 76 35C76 28 70 25 66 27C64 21 58 15 50 15ZM38 32C40 32 42 34 42 36C42 38 40 40 38 40C36 40 34 38 34 36C34 34 36 32 38 32ZM62 32C64 32 66 34 66 36C66 38 64 40 62 40C60 40 58 38 58 36C58 34 60 32 62 32Z" />
    </svg>
  );
}

/**
 * Dynamic Badge Icon corresponding to character's role
 */
export function BadgeIcon({
  badge,
  className = "w-5 h-5 text-amber-400"
}: {
  badge?: string;
  className?: string;
}) {
  switch (badge) {
    case 'lightning':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'phoenix':
      return <PhoenixCrest className={className} />;
    case 'dark_mark':
      return <DarkMarkCrest className={className} />;
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'wand':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M15 4l6 2-2 6" />
          <path d="M19 6L5 20" />
          <circle cx="5" cy="20" r="1" fill="currentColor" />
        </svg>
      );
    case 'potion':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M9 3h6M10 3v4l-5 9a3 3 0 0 0 2.5 4.5h9a3 3 0 0 0 2.5-4.5l-5-9V3" />
        </svg>
      );
    case 'dagger':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M4 20l4-4M14 4l6 6-8 8-6-6 8-8z" />
          <path d="M19 9l-4-4" />
        </svg>
      );
    case 'snake':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M12 2C8 2 6 5 6 7c0 3 4 4 6 5 3 1.5 5 3 5 5s-2 3-5 3-4-1-5-2" />
          <circle cx="12" cy="4" r="1" fill="currentColor" />
        </svg>
      );
    case 'wolf':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M4 4l4 6 4-3 4 3 4-6-2 10-6 4-6-4L4 4z" />
        </svg>
      );
    case 'mask':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <path d="M3 11c0 5 4 9 9 9s9-4 9-9V7l-9-3-9 3v4z" />
          <ellipse cx="8.5" cy="11.5" rx="1.5" ry="2" fill="currentColor" />
          <ellipse cx="15.5" cy="11.5" rx="1.5" ry="2" fill="currentColor" />
        </svg>
      );
    case 'ring':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <circle cx="12" cy="14" r="8" />
          <path d="M12 2l3 4h-6l3-4z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

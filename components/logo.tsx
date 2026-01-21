export function Logo({ className = "w-32 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 150"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x="50"
        y="40"
        width="18"
        height="70"
        rx="4"
        fill="url(#logo-grad)"
        filter="url(#glow)"
      />
      <path
        d="M125 40c-22 0-40 16-40 35s18 35 40 35 40-16 40-35-18-35-40-35zm0 52c-12 0-22-8-22-17s10-17 22-17 22 8 22 17-10 17-22 17z"
        fill="url(#logo-grad)"
        filter="url(#glow)"
      />
      <path
        d="M185 40v40c0 15 12 25 28 25s28-10 28-25v-40h-15v40c0 8-6 13-13 13s-13-5-13-13v-40h-15z"
        fill="url(#logo-grad)"
        filter="url(#glow)"
      />
      <rect
        x="200"
        y="85"
        width="60"
        height="40"
        rx="6"
        transform="rotate(-10 230 105)"
        fill="url(#logo-grad)"
        filter="url(#glow)"
      />
      <rect
        x="202"
        y="95"
        width="56"
        height="8"
        transform="rotate(-10 230 105)"
        fill="white"
        opacity="0.8"
      />
    </svg>
  );
}

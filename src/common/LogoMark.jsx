import { useId } from "react";

const TRACE =
  "M16 46 V18 H27.5 L31.5 22 V27.5 L27.5 31.5 H16 M50 18 H40.5 L37 21.5 V28 L40.5 31.5 H46.5 L50 35 V42.5 L46.5 46 H37";

/* The PS monogram: P and S drawn as one glowing circuit trace, starting
   at a ring node and ending in a spark. Same mark as the favicon, without
   the tile. `animated` draws the trace in and keeps the spark pulsing. */
export default function LogoMark({ size = 28, animated = false, className = "", title }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="11 12 44 40"
      width={size}
      height={(size * 40) / 44}
      className={`${animated ? "logo-mark--animated" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      <defs>
        <linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1="15" y1="47" x2="50" y2="17">
          <stop offset="0" stopColor="#5fe6ff" />
          <stop offset="0.48" stopColor="#e9fbff" />
          <stop offset="1" stopColor="#ff9a3d" />
        </linearGradient>
        <filter id={`${id}g`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <radialGradient id={`${id}k`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor="#ffb46b" />
          <stop offset="1" stopColor="#ff9a3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="none" stroke={`url(#${id}s)`} strokeLinecap="round" strokeLinejoin="round">
        <path d={TRACE} strokeWidth="4.6" strokeOpacity="0.5" filter={`url(#${id}g)`} className="logo-mark__trace" pathLength="1" />
        <path d={TRACE} strokeWidth="3.8" className="logo-mark__trace" pathLength="1" />
      </g>
      <circle cx="16" cy="46" r="3.1" fill="#050506" stroke="#5fe6ff" strokeWidth="1.8" />
      <circle cx="50" cy="18" r="6" fill={`url(#${id}k)`} className="logo-mark__spark" />
      <circle cx="50" cy="18" r="2.2" fill="#fff" />
    </svg>
  );
}

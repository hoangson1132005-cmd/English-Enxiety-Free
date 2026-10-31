'use client';

import React from 'react';

const COUNT = 18;
const COLORS = [
  ['#FFE3EA', '#F4A7B9'],
  ['#FFD1DC', '#F29BB0'],
  ['#FFF0F4', '#F7B8C8'],
];

// Giá trị giả ngẫu nhiên cố định theo chỉ số: server và client render giống nhau (không lệch hydration).
function rnd(i: number, k: number) {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Lớp hoa đào rơi phủ toàn trang, không chặn thao tác chuột. Tự tắt khi người dùng chọn "giảm chuyển động".
export function SakuraPetals() {
  const petals = Array.from({ length: COUNT }, (_, i) => {
    const size = 12 + Math.round(rnd(i, 1) * 14);
    return {
      key: i,
      left: `${Math.round(rnd(i, 2) * 100)}%`,
      size,
      dur: `${(11 + rnd(i, 3) * 10).toFixed(1)}s`,
      delay: `${(-rnd(i, 4) * 20).toFixed(1)}s`, // delay âm: hoa đã rơi giữa chừng ngay khi vào trang
      sway: `${(2.2 + rnd(i, 5) * 2.6).toFixed(1)}s`,
      drift: `${Math.round((rnd(i, 6) - 0.4) * 220)}px`,
      spin: `${Math.round(240 + rnd(i, 7) * 480)}deg`,
      colors: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="sakura-layer" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.key}
          className="sakura-petal"
          style={
            {
              left: p.left,
              '--dur': p.dur,
              '--delay': p.delay,
              '--sway': p.sway,
              '--drift': p.drift,
              '--spin': p.spin,
            } as React.CSSProperties
          }
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`petal-${p.key}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={p.colors[0]} />
                <stop offset="100%" stopColor={p.colors[1]} />
              </linearGradient>
            </defs>
            <path d="M12 1.5 C 17.5 5, 21 12, 14.2 22 L 12 19.2 L 9.8 22 C 3 12, 6.5 5, 12 1.5 Z" fill={`url(#petal-${p.key})`} />
          </svg>
        </span>
      ))}
    </div>
  );
}

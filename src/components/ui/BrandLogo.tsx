'use client';

import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface LogoData {
  logoImageBase64: string | null;
  logoMimeType: string | null;
}

export function BrandLogo({ className = 'w-10 h-10 rounded-2xl' }: { className?: string }) {
  const [logo, setLogo] = useState<LogoData | null>(null);

  useEffect(() => {
    fetch('/api/site-content')
      .then((r) => r.json())
      .then(setLogo)
      .catch(() => {});
  }, []);

  if (logo?.logoImageBase64 && logo?.logoMimeType) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:${logo.logoMimeType};base64,${logo.logoImageBase64}`}
        alt="Logo"
        className={`${className} object-contain bg-white flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${className} bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white flex-shrink-0`}>
      <GraduationCap className="w-1/2 h-1/2" />
    </div>
  );
}

'use client';

import Image from 'next/image';

export function HeroSlider() {
  return (
    <section className="relative w-full h-[250px] sm:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden bg-slate-100">
      <Image
        src="/medpharma.jpg"
        alt="MedPharma Plus - ჯანსაღი კვების პროდუქტები"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </section>
  );
}

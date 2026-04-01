'use client';

import Image from 'next/image';

export function HeroSlider() {
  return (
    <section className="hero-section relative w-full h-[250px] sm:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden bg-slate-100">
      <Image
        src="/medpharma.jpg"
        alt="MedPharma Plus - ჯანსაღი კვების პროდუქტები"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center drop-shadow-lg">
          მედფარმა პლუსი
        </h1>
      </div>
    </section>
  );
}

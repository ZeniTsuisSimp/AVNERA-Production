'use client';

import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white">
      {/* Clean Background Image with Subtle Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Luxury Fashion Collection"
          fill
          className="object-cover opacity-20"
          priority
          sizes="100vw"
        />
        {/* Subtle White Overlay */}
        <div className="absolute inset-0 bg-white/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-black px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Brand Welcome */}
        <div className="mb-16">
          <h1 className="brand-font text-6xl md:text-7xl lg:text-8xl mb-8 text-black">
            AVNERA
          </h1>
          <div className="mb-12">
            <p className="brand-text text-lg md:text-xl text-gray-700 font-light uppercase tracking-[0.2em]">
              Luxury Fashion
            </p>
          </div>
        </div>
        
        {/* Main Message */}
        <div className="space-y-8 mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.1em] text-black uppercase">
            Craft Meets Couture
          </h2>
          
          <p className="text-lg md:text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our exclusive collection of premium fashion pieces crafted for the modern connoisseur
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/products"
            className="minimal-button px-8 py-4 font-medium text-sm uppercase tracking-[0.1em] transition-all duration-200"
          >
            Explore Collection
          </Link>
          <Link
            href="/about"
            className="minimal-button-outline px-8 py-4 font-medium text-sm uppercase tracking-[0.1em] transition-all duration-200"
          >
            Our Story
          </Link>
        </div>
        
        {/* Gold Accent Line */}
        <div className="mt-16">
          <div className="w-16 h-0.5 bg-primary-gold mx-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

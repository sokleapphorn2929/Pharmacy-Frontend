import React, { useState, useEffect, useCallback } from "react";

export default function Carousel({
  autoSlide = true,
  autoSlideInterval = 4000,
}) {
  const slides = [
    {
      url: "https://i.guim.co.uk/img/media/20491572b80293361199ca2fc95e49dfd85e1f42/0_236_5157_3094/master/5157.jpg?width=700&quality=85&auto=format&fit=max&s=75467b37e566112a23646eeb8cbc9a26",
      title: "Essential Medicines",
      description: "Get 20% off on all prescription refills this week.",
    },
    {
      url: "https://www.medicare.org/wp-content/uploads/2025/03/medicare-step-therapy-explained-750x420.jpg",
      title: "Daily Vitamins & Supplements",
      description: "Boost your immune system with our premium health products.",
    },
    {
      url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop",
      title: "Expert Pharmacist Care",
      description:
        "Consult with our licensed specialists online or in-store 24/7.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, nextSlide]);

  return (
    <div className="w-full mx-auto my-8 md:px-30 px-3">
      <div className="relative h-75 sm:h-100 md:h-120 w-full group overflow-hidden rounded-4xl border border-gray-100 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full h-full shrink-0 relative">
              <img
                src={slide.url}
                alt={slide.title}
                className="w-full h-full object-cover brightness-[0.7] dark:brightness-[0.6] select-none"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16 bg-linear-to-t from-black/70 via-black/20 to-transparent">
                <div className="max-w-xl text-white">
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide mb-2 sm:mb-3 drop-shadow-sm">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-200 font-medium drop-shadow-sm leading-relaxed">
                    {slide.description}
                  </p>
                  <button className="mt-4 sm:mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-md text-xs sm:text-sm tracking-wide transition-all duration-150">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 rounded-xl p-3 bg-white/30 hover:bg-white/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 backdrop-blur-md text-white transition-all duration-200 outline-none"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 rounded-xl p-3 bg-white/30 hover:bg-white/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 backdrop-blur-md text-white transition-all duration-200 outline-none"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* Bottom Navigation Dots Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 dark:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {slides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === slideIndex
                  ? "w-6 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

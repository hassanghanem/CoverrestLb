import { Banner } from "@/types/api.interfaces";
import { getText } from "@/utils/getText";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface BannerSliderProps {
  banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const { i18n } = useTranslation();
    const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto Play
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(distance) >= threshold) {
      distance > 0 ? nextSlide() : prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full">
        {/* Desktop Slides */}
        <div className="hidden md:block">
          {banners.map((slide, index) => (
            <div
              key={`desktop-${slide.id}`}
              className={`
                transition-opacity duration-700
                ${index === currentSlide ? "opacity-100" : "opacity-0 absolute inset-0"}
              `}
            >
              <img
                src={banners[currentSlide].image}
                alt=""
                className="w-full h-auto cursor-pointer"
                onClick={() => {
                  if (banners[currentSlide].link) {
                    
                    navigate(banners[currentSlide].link);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Mobile Slides */}
        <div className="block md:hidden">
          {banners.map((slide, index) => (
            <div
              key={`mobile-${slide.id}`}
              className={`
                transition-opacity duration-700
                ${index === currentSlide ? "opacity-100" : "opacity-0 absolute inset-0"}
              `}
            >
              <img
                src={banners[currentSlide].image_mobile}
                alt=""
                className="w-full h-auto cursor-pointer"
                onClick={() => {
                  if (banners[currentSlide].link) {
                    
                    navigate(banners[currentSlide].link);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Text Content */}
        <div 
          className="absolute inset-0 z-20 flex items-center cursor-pointer"
          onClick={() => {
            if (banners[currentSlide].link) {
              
              navigate(banners[currentSlide].link);
            }
          }}
        >
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
              <div className="space-y-8 text-white max-w-xl">
                <h2 className="text-lg sm:text-xl font-medium opacity-90">
                  {getText(banners[currentSlide].subtitle, i18n.language)}
                </h2>

                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  {getText(banners[currentSlide].title, i18n.language)}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"}
              `}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default BannerSlider;

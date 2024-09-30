import React, { useState, useCallback } from 'react';

function Banner({ banners }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  return (
    <div className="bg-orange-600 text-white py-8 px-6 relative">
      <div className="container mx-auto max-w-6xl flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-4">
          <button 
            onClick={prevSlide} 
            className="text-white hover:text-orange-200 transition duration-300 text-3xl font-bold"
            aria-label="Previous slide"
          >
            &#8249;
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold">{banners[currentSlide].title}</h2>
            <p className="text-xl mt-2">{banners[currentSlide].content}</p>
          </div>
          <button 
            onClick={nextSlide} 
            className="text-white hover:text-orange-200 transition duration-300 text-3xl font-bold"
            aria-label="Next slide"
          >
            &#8250;
          </button>
        </div>
        <div className="flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? 'bg-white' : 'bg-orange-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Banner;
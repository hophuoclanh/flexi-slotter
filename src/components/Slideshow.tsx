import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideshowProps {
  images: string[];
  interval?: number; // Interval in milliseconds
}

export default function Slideshow({ images, interval = 5000 }: SlideshowProps) {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Automatically change slide at a set interval
  useEffect(() => {
    const autoSlide = setInterval(() => {
      nextSlide();
    }, interval);

    // Clear the interval when component unmounts or when dependencies change
    return () => clearInterval(autoSlide);
  }, [interval, images]);

  return (
    <>
      <div className="rounded-xl relative w-full h-[400px] xl:h-[590px] flex overflow-hidden">
        {images.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt={`Slide ${index}`}
              className="w-full h-[400px] xl:h-[590px] object-cover"
            />
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-2 rounded-full shadow-md"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-2 rounded-full shadow-md"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="w-full flex justify-center mt-4">
        {images.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrent(index)}
            className={`cursor-pointer mx-1 rounded-full transition-colors ${
              index === current ? "bg-white" : "bg-gray-400"
            }`}
            style={{ height: "10px", width: "10px", display: "inline-block" }}
          ></span>
        ))}
      </div>
    </>
  );
}

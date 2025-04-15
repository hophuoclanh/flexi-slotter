import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "single_pod.jpg",
  "double_pod.jpg",
  "meeting_6.jpg",
  "meeting_10.jpg",
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      {/* Slideshow container */}
      <div className="relative w-full h-[500px] flex overflow-hidden">
        {/* Slides */}
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
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Left arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-2 rounded-full shadow-md"
        >
          <ChevronLeft />
        </button>

        {/* Right arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-2 rounded-full shadow-md"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Dot indicators placed below the slideshow */}
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

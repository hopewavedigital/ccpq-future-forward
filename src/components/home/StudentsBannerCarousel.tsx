import { useEffect, useState } from "react";
import studentsLearning1 from "@/assets/students-learning-1.jpg";
import studentsLearning2 from "@/assets/students-learning-2.jpg";
import studentsLearning3 from "@/assets/students-learning-3.jpg";
import studentsLearning4 from "@/assets/students-learning-4.jpg";

const images = [
  { src: studentsLearning1, alt: "Students collaborating in a virtual classroom" },
  { src: studentsLearning2, alt: "Professional woman studying online from home" },
  { src: studentsLearning3, alt: "Students connecting via video call" },
  { src: studentsLearning4, alt: "Business professional taking online course" },
];

const StudentsBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full overflow-hidden bg-muted/30">
      <div className="relative w-full" style={{ aspectRatio: "3/1" }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        
        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentsBannerCarousel;

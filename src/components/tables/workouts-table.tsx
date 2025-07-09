"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { useWorkouts } from "@/hooks/use-workouts";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function WorkoutsTable() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { workouts, isLoading } = useWorkouts();

  // Configuración responsiva del carousel
  const getCardsPerView = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3; // lg - 3 cards
    if (window.innerWidth >= 768) return 2; // md - 2 cards
    return 1; // mobile - 1 card
  }, []);

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      const newCardsPerView = getCardsPerView();
      setCardsPerView(newCardsPerView);

      // Ajustar el slide actual para que no se salga del rango
      const newTotalSlides = Math.ceil(workouts.length / newCardsPerView);
      setCurrentSlide((prev) => Math.min(prev, newTotalSlides - 1));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getCardsPerView, workouts.length]);

  // Ordenar workouts por fecha de creación (más recientes primero)
  const sortedWorkouts = workouts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalSlides = Math.ceil(sortedWorkouts.length / cardsPerView);

  const handleViewDetails = (workout: Workout) => {
    router.push(`/dashboard/workout/${workout.id}`);
  };

  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      setCurrentSlide(slideIndex);

      // Reset transition flag after animation
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [isTransitioning],
  );

  const handlePrevious = useCallback(() => {
    if (totalSlides <= 1) return;

    const newSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    goToSlide(newSlide);
  }, [currentSlide, totalSlides, goToSlide]);

  const handleNext = useCallback(() => {
    if (totalSlides <= 1) return;

    const newSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    goToSlide(newSlide);
  }, [currentSlide, totalSlides, goToSlide]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalSlides <= 1 || !e.touches[0]) return;

    setIsDragging(true);
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || totalSlides <= 1 || !e.touches[0]) return;
    
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || totalSlides <= 1) return;

    const deltaX = startX - currentX;
    const threshold = 50; // Minimum swipe distance
    const velocity = Math.abs(deltaX);

    if (velocity > threshold) {
      if (deltaX > 0) {
        // Swipe left - next
        handleNext();
      } else {
        // Swipe right - previous
        handlePrevious();
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  }, [isDragging, startX, currentX, totalSlides, handleNext, handlePrevious]);

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (totalSlides <= 1) return;

    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || totalSlides <= 1) return;

    e.preventDefault();
    setCurrentX(e.clientX);
  };

  const handleMouseUp = useCallback(() => {
    if (!isDragging || totalSlides <= 1) return;

    const deltaX = startX - currentX;
    const threshold = 50;
    const velocity = Math.abs(deltaX);

    if (velocity > threshold) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  }, [isDragging, startX, currentX, totalSlides, handleNext, handlePrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalSlides <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, totalSlides]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="hidden lg:flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border animate-pulse flex items-center justify-center"
            >
              <div className="w-32 h-6 bg-muted/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedWorkouts.length === 0) {
    return (
      <div className="justify-center py-16 items-center flex flex-col">
        <h3 className="text-sm font-medium">No hay rutinas creadas.</h3>
        <p className="text-muted-foreground text-xs">
          Crea tu primera rutina para comenzar.
        </p>
      </div>
    );
  }

  // Crear grupos de cards para cada slide
  const createSlides = () => {
    const slides = [];
    for (let i = 0; i < sortedWorkouts.length; i += cardsPerView) {
      slides.push(sortedWorkouts.slice(i, i + cardsPerView));
    }
    return slides;
  };

  const slides = createSlides();

  // Calcular el offset del drag para feedback visual (solo en desktop)
  const dragOffset =
    isDragging && window.innerWidth >= 768 && containerRef.current
      ? ((currentX - startX) / containerRef.current.clientWidth) * 100
      : 0;

  return (
    <div className="space-y-4">
      {/* Navigation Controls - Only on desktop */}
      <div className="flex items-center justify-between">
        {totalSlides > 1 && (
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:bg-primary/10"
            >
              <ArrowLeft01Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={isTransitioning}
              className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:bg-primary/10"
            >
              <ArrowRight01Icon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden -mx-2 pt-4 pb-6">
        <div
          ref={containerRef}
          className="md:cursor-grab md:active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100 + dragOffset}%)`,
              transitionDuration: isDragging ? "0ms" : "300ms",
            }}
          >
            {slides.map((slideWorkouts, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slideWorkouts.map((workout) => (
                    <Card
                      key={workout.id}
                      className="h-40 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 hover:border-border cursor-pointer group select-none"
                      onClick={() => handleViewDetails(workout)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      <div className="relative h-full flex items-center justify-center">
                        <CardTitle className="text-xl font-semibold text-center tracking-heading px-4">
                          {workout.name}
                        </CardTitle>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators - Only on mobile */}
      {totalSlides > 1 && (
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

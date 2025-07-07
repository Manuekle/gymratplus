"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, Dumbbell01Icon } from "hugeicons-react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { workouts, isLoading } = useWorkouts();

  // Configuración responsiva del carousel
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3; // lg - 3 cards
    if (window.innerWidth >= 768) return 2;  // md - 2 cards
    return 1; // mobile - 1 card
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
      setCurrentSlide(0); // Reset to first slide on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ordenar workouts por fecha de creación (más recientes primero)
  const sortedWorkouts = workouts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalSlides = Math.ceil(sortedWorkouts.length / cardsPerView);

  const handleViewDetails = (workout: Workout) => {
    router.push(`/dashboard/workout/${workout.id}`);
  };

  const handlePrevious = () => {
    if (currentSlide === 0) {
      // Scroll infinito: ir al último slide
      setCurrentSlide(totalSlides - 1);
    } else {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide === totalSlides - 1) {
      // Scroll infinito: ir al primer slide
      setCurrentSlide(0);
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };



  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = startX - currentX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe left - next (con scroll infinito)
        if (currentSlide === totalSlides - 1) {
          setCurrentSlide(0);
        } else {
          setCurrentSlide(prev => prev + 1);
        }
      } else {
        // Swipe right - previous (con scroll infinito)
        if (currentSlide === 0) {
          setCurrentSlide(totalSlides - 1);
        } else {
          setCurrentSlide(prev => prev - 1);
        }
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, totalSlides]);

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
            <div key={index} className="h-40 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border animate-pulse flex items-center justify-center">
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

  return (
    <div className="">
      <div className="flex items-center justify-between">        
        {totalSlides > 1 && (
          <div className="hidden lg:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ArrowLeft01Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ArrowRight01Icon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div 
          ref={containerRef}
          className=""
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {slides.map((slideWorkouts, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slideWorkouts.map((workout) => (
                    <Card
                      key={workout.id}
                      className="h-40 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50 hover:border-border cursor-pointer group z-10"
                      onClick={() => handleViewDetails(workout)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                      
                      <div className="relative h-full flex items-center justify-center z-20">
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


    </div>
  );
}

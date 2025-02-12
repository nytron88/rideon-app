import React, { useState, useEffect, useRef } from "react";
import { SearchPanel, LiveTracking, RideOptions } from "../components";
import { Menu, X } from "lucide-react";
import gsap from "gsap";

function UserDashboard() {
  const [showPanel, setShowPanel] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dashboardRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const dragStartY = useRef(0);
  const currentY = useRef(0);

  const SPRING_CONFIG = {
    stiffness: 300,
    damping: 30,
    mass: 1,
  };

  // Initial animations
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      dashboardRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    if (bottomSheetRef.current) {
      tl.fromTo(
        bottomSheetRef.current,
        { y: "100%" },
        { y: 0, duration: 0.5, ease: "power4.out" },
        "-=0.3"
      );
    }
  }, []);

  // Handle mobile bottom sheet interactions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const bottomSheet = bottomSheetRef.current;
    if (!bottomSheet) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      currentY.current = 0;
      setIsDragging(true);

      // Remove transition during drag
      bottomSheet.style.transition = "none";

      // Add class for visual feedback
      bottomSheet.classList.add("grabbing");
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - dragStartY.current;

      // Enhanced damping for smoother drag
      const dampingFactor = 0.5;
      const dampenedDelta =
        Math.sign(deltaY) * Math.pow(Math.abs(deltaY), dampingFactor);

      // Limit the drag range
      const maxDrag = window.innerHeight * 0.3;
      const clampedDelta = Math.max(Math.min(dampenedDelta, maxDrag), -maxDrag);

      currentY.current = deltaY;

      // Smooth animation during drag
      gsap.to(bottomSheet, {
        y: clampedDelta,
        duration: 0.1,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      bottomSheet.classList.remove("grabbing");

      const velocity = Math.abs(currentY.current) / 100;
      const threshold = window.innerHeight * 0.2;
      const shouldClose =
        currentY.current > threshold ||
        (currentY.current > threshold * 0.5 && velocity > 0.5);

      if (shouldClose) {
        gsap.to(bottomSheet, {
          y: "100%",
          duration: 0.5,
          ease: "expo.out",
          onComplete: () => setShowPanel(false),
        });
      } else {
        gsap.to(bottomSheet, {
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.75)",
        });
      }
    };

    // Add event listeners
    bottomSheet.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    bottomSheet.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    bottomSheet.addEventListener("touchend", handleTouchEnd);

    // Cleanup
    return () => {
      bottomSheet.removeEventListener("touchstart", handleTouchStart);
      bottomSheet.removeEventListener("touchmove", handleTouchMove);
      bottomSheet.removeEventListener("touchend", handleTouchEnd);
    };
  }, [showPanel, isDragging]);

  // Handle panel toggle
  const togglePanel = () => {
    const bottomSheet = bottomSheetRef.current;
    if (!bottomSheet) return;

    if (!showPanel) {
      setShowPanel(true);
      gsap.fromTo(
        bottomSheet,
        { y: "100%" },
        {
          y: 0,
          duration: 0.6,
          ease: "expo.out",
        }
      );
    } else {
      gsap.to(bottomSheet, {
        y: "100%",
        duration: 0.5,
        ease: "expo.out",
        onComplete: () => setShowPanel(false),
      });
    }
  };

  return (
    <div ref={dashboardRef} className="min-h-screen bg-black">
      <div className="relative h-[calc(100vh-64px)]">
        <div className="absolute inset-0">
          <MapPreview />
        </div>

        {/* Mobile Search Button */}
        {!showPanel && (
          <button
            onClick={togglePanel}
            className="absolute top-4 left-4 right-4 z-10 md:hidden p-4 bg-black/90 
                     backdrop-blur-xl rounded-full shadow-lg text-white border 
                     border-white/10 hover:border-white/20 transition-all duration-300 
                     flex items-center gap-3 cursor-pointer transform hover:scale-[0.98] 
                     active:scale-95"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Where to?</span>
          </button>
        )}

        {/* Bottom Sheet for Mobile / Side Panel for Desktop */}
        <div
          ref={bottomSheetRef}
          className={`fixed md:absolute ${
            showPanel
              ? "bottom-0 md:bottom-auto"
              : "-bottom-full md:bottom-auto"
          } left-0 right-0 md:left-0 md:w-[400px] z-20 h-[85vh] md:h-full
          will-change-transform backdrop-blur-lg
          ${
            isDragging
              ? "transition-none touch-none"
              : "transition-transform duration-500 ease-out"
          }`}
        >
          <div
            className="h-full bg-black/95 backdrop-blur-xl shadow-2xl flex 
                       flex-col rounded-t-3xl md:rounded-none"
          >
            {/* Drag Handle */}
            <div className="md:hidden w-full p-3 flex justify-center">
              <div
                className={`w-12 h-1.5 bg-white/20 rounded-full transition-opacity 
                           duration-200 ${isDragging ? "opacity-50" : ""}`}
              />
            </div>

            {/* Close Button - Mobile Only */}
            <div className="p-4 border-b border-white/10 md:hidden">
              <button
                onClick={togglePanel}
                className="p-2 hover:bg-white/10 rounded-full transition-colors 
                         cursor-pointer transform hover:scale-[0.98] active:scale-95"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-auto p-4 space-y-6 custom-scrollbar 
                         overscroll-contain"
            >
              <SearchPanel />
              <RideOptions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

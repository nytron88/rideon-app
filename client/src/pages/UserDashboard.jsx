import React, { useState, useEffect, useRef } from "react";
import { SearchPanel, UserLiveTracking } from "../components";
import { Menu, X } from "lucide-react";
import gsap from "gsap";

function UserDashboard() {
  const [showPanel, setShowPanel] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dashboardRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const dragStartY = useRef(0);
  const currentY = useRef(0);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Reset panel state and position when switching between mobile and desktop
      if (!mobile && bottomSheetRef.current) {
        setShowPanel(true);
        setIsDragging(false);
        gsap.set(bottomSheetRef.current, { clearProps: "all" });
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial animations
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      dashboardRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    if (bottomSheetRef.current && isMobile) {
      tl.fromTo(
        bottomSheetRef.current,
        { y: "100%" },
        { y: 0, duration: 0.5, ease: "power4.out" },
        "-=0.3"
      );
    }
  }, [isMobile]);

  // Handle mobile bottom sheet interactions
  useEffect(() => {
    if (!isMobile || !bottomSheetRef.current) return;

    const bottomSheet = bottomSheetRef.current;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      currentY.current = 0;
      setIsDragging(true);
      bottomSheet.style.transition = "none";
      bottomSheet.classList.add("grabbing");
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - dragStartY.current;

      // Only allow downward drag when sheet is open
      if (deltaY < 0 && showPanel) return;

      // Only allow upward drag when sheet is closed
      if (deltaY > 0 && !showPanel) return;

      const dampingFactor = 0.5;
      const dampenedDelta =
        Math.sign(deltaY) * Math.pow(Math.abs(deltaY), dampingFactor);
      const maxDrag = window.innerHeight * 0.3;
      const clampedDelta = Math.max(Math.min(dampenedDelta, maxDrag), -maxDrag);

      currentY.current = deltaY;

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

    bottomSheet.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    bottomSheet.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    bottomSheet.addEventListener("touchend", handleTouchEnd);

    return () => {
      bottomSheet.removeEventListener("touchstart", handleTouchStart);
      bottomSheet.removeEventListener("touchmove", handleTouchMove);
      bottomSheet.removeEventListener("touchend", handleTouchEnd);
    };
  }, [showPanel, isDragging, isMobile]);

  const togglePanel = () => {
    if (!isMobile || !bottomSheetRef.current) return;

    const bottomSheet = bottomSheetRef.current;

    if (!showPanel) {
      setShowPanel(true);
      gsap.fromTo(
        bottomSheet,
        { y: "100%" },
        { y: 0, duration: 0.6, ease: "expo.out" }
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
      {/* Changed this div's height class */}
      <div className="relative h-screen">
        {/* Map View */}
        <div className="absolute inset-0">
          <UserLiveTracking />
        </div>

        {/* Mobile Search Button - Fixed positioning in viewport */}
        {!showPanel && isMobile && (
          <div className="absolute top-4 left-0 right-0 px-4 z-10">
            <button
              onClick={togglePanel}
              className="w-full bg-black/90 backdrop-blur-xl rounded-full shadow-lg 
                     border border-white/10 hover:border-white/20 transition-all 
                     duration-300 flex items-center gap-3 p-4 cursor-pointer 
                     transform hover:scale-[0.98] active:scale-95"
            >
              <Menu className="w-5 h-5 text-white cursor-pointer" />
              <span className="text-sm text-white font-medium cursor-pointer">
                Where to?
              </span>
            </button>
          </div>
        )}

        {/* Bottom Sheet / Side Panel - Updated classes */}
        <div
          ref={bottomSheetRef}
          className={`fixed md:absolute ${
            showPanel ? "bottom-0 md:bottom-0" : "-bottom-full md:bottom-0"
          } left-0 right-0 md:left-0 md:w-[400px] md:top-0 z-20 
          will-change-transform backdrop-blur-lg
          ${isMobile ? "h-[75vh]" : "h-screen"}
          ${
            isMobile
              ? isDragging
                ? "transition-none touch-none"
                : "transition-transform duration-500 ease-out"
              : ""
          }`}
          style={{ transform: !isMobile ? "none" : undefined }}
        >
          <div className="flex flex-col h-full bg-black/95 backdrop-blur-xl shadow-2xl rounded-t-3xl md:rounded-none">
            {/* Drag Handle - Mobile Only */}
            {isMobile && (
              <div className="w-full p-3 flex justify-center shrink-0">
                <div
                  className={`w-12 h-1.5 bg-white/20 rounded-full transition-opacity duration-200 ${
                    isDragging ? "opacity-50" : ""
                  }`}
                />
              </div>
            )}

            {/* Close Button - Mobile Only */}
            {isMobile && (
              <div className="p-4 border-b border-white/10 shrink-0">
                <button
                  onClick={togglePanel}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer transform hover:scale-[0.98] active:scale-95"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            )}

            {/* Content Area - Updated to ensure full height */}
            <div className="flex-1 overflow-hidden h-full">
              <SearchPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

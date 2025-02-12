import React, { useEffect, useRef } from "react";
import { Car, Truck, Users, Clock, Star } from "lucide-react";
import gsap from "gsap";

function RideOptions() {
  const containerRef = useRef(null);
  const optionsRef = useRef([]);

  const options = [
    {
      icon: <Car className="w-6 h-6" />,
      name: "Regular",
      price: "$12-15",
      time: "3 min away",
      rating: "4.8",
      color: "from-blue-600 to-blue-400",
    },
    {
      icon: <Users className="w-6 h-6" />,
      name: "Premium",
      price: "$18-22",
      time: "5 min away",
      rating: "4.9",
      color: "from-purple-600 to-purple-400",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      name: "Van",
      price: "$25-30",
      time: "8 min away",
      rating: "4.7",
      color: "from-pink-600 to-pink-400",
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    const options = optionsRef.current;

    gsap.fromTo(
      container,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2 }
    );

    gsap.fromTo(
      options,
      { opacity: 0, x: -20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.4, 
        stagger: 0.1, 
        ease: "power2.out",
        delay: 0.4 
      }
    );
  }, []);

  return (
    <div 
      ref={containerRef}
      className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full border border-white/10 shadow-2xl"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Choose your ride</h3>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            ref={el => optionsRef.current[index] = el}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 
                     border border-white/10 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${option.color} group-hover:scale-110 
                           transition-transform duration-300 shadow-lg`}>
                {option.icon}
              </div>
              <div>
                <p className="font-medium text-white">{option.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{option.time}</span>
                  <span className="text-gray-600">•</span>
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{option.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium text-white">{option.price}</span>
              <div className="text-sm text-gray-400">Best price</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RideOptions;
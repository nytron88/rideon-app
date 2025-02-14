import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Car, Wallet, AlertTriangle, ArrowRight } from "lucide-react";
import { addRole } from "../../store/slices/userSlice";
import { toast } from "react-toastify";
import gsap from "gsap";

function InactiveCaptain({ user, onActivate }) {
  const containerRef = useRef(null);
  const stepsRef = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );

    tl.fromTo(
      stepsRef.current,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.3"
    );
  }, []);

  const getSetupSteps = () => {
    const steps = [];

    if (!user.vehicle) {
      steps.push({
        id: "vehicle",
        title: "Add Vehicle Details",
        description: "Register your vehicle to start accepting rides",
        icon: <Car className="w-6 h-6 text-blue-400" />,
        link: "/captain/vehicle",
        cta: "Add Vehicle",
        color: "blue",
      });
    }

    if (!user.stripeAccountId) {
      steps.push({
        id: "stripe",
        title: "Connect Payment Account",
        description: "Set up your Stripe account to receive payments",
        icon: <Wallet className="w-6 h-6 text-purple-400" />,
        link: "/captain/onboarding",
        cta: "Connect Stripe",
        color: "purple",
      });
    }

    if (user.vehicle && user.stripeAccountId) {
      steps.push({
        id: "activate",
        title: "Activate Account",
        description: "Start accepting rides by activating your account",
        icon: <AlertTriangle className="w-6 h-6 text-green-400" />,
        isStatus: true,
        color: "green",
      });
    }

    return steps;
  };

  const handleSwitchToUser = async () => {
    try {
      await dispatch(addRole({ role: "user" })).unwrap();
      toast.success("Successfully switched to rider mode");
      navigate("/"); // Redirect to home/dashboard
    } catch (error) {
      toast.error(error?.message || "Failed to switch to rider mode");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black flex items-center justify-center p-6">
      <div ref={containerRef} className="max-w-4xl w-full space-y-4">
        <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-400 mb-8">
            Follow these steps to start accepting rides
          </p>

          <div className="space-y-4">
            {getSetupSteps().map((step, index) => (
              <div
                key={step.id}
                ref={(el) => (stepsRef.current[index] = el)}
                className="group bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 
                         transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`p-4 bg-${step.color}-500/20 rounded-xl 
                               group-hover:scale-110 transition-transform duration-300`}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{step.description}</p>
                    {step.isStatus ? (
                      <button
                        onClick={onActivate}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r 
                                 from-green-500 to-green-600 text-white rounded-xl font-medium 
                                 hover:from-green-600 hover:to-green-700 transition-all 
                                 transform hover:scale-[0.98] active:scale-95 cursor-pointer"
                      >
                        Become Active
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <Link
                        to={step.link}
                        className={`inline-flex items-center gap-2 px-6 py-3 
                                  bg-gradient-to-r from-${step.color}-500 
                                  to-${step.color}-600 text-white rounded-xl font-medium 
                                  hover:from-${step.color}-600 hover:to-${step.color}-700 
                                  transition-all transform hover:scale-[0.98] active:scale-95 cursor-pointer`}
                      >
                        {step.cta}
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revert to User Option */}
        <div
          className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl 
                     hover:bg-black/90 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Want to enjoy rides instead?
              </h3>
              <p className="text-gray-400">
                Switch back to rider mode and experience amazing rides
              </p>
            </div>
            <button
              onClick={handleSwitchToUser}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl 
                     font-medium transition-all transform hover:scale-[0.98] 
                     active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              Switch to Rider
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InactiveCaptain;

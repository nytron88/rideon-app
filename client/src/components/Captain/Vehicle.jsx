import React from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Car, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Van"];

function Vehicle() {
  const { user, loading } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = React.useState(!user?.vehicle);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      color: user?.vehicle?.color || "",
      plate: user?.vehicle?.plate || "",
      capacity: user?.vehicle?.capacity || "",
      vehicleType: user?.vehicle?.vehicleType || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // TODO: Implement vehicle update logic
      console.log("Vehicle data to update:", data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  const handleCancel = () => {
    if (user?.vehicle) {
      setIsEditing(false);
      reset();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/10 rounded-full">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user?.vehicle ? "Vehicle Details" : "Add Vehicle Details"}
              </h1>
              <p className="text-gray-400">
                {user?.vehicle
                  ? "View and manage your vehicle information"
                  : "Complete your captain profile by adding vehicle details"}
              </p>
            </div>
          </div>

          {/* Vehicle Form */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {!isEditing && user?.vehicle ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(user.vehicle).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="block text-sm text-gray-400 capitalize">
                          {key}
                        </label>
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Details
                  </button>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  {/* Color Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vehicle Color
                    </label>
                    <input
                      {...register("color", {
                        required: "Color is required",
                        minLength: {
                          value: 3,
                          message: "Color must be at least 3 characters",
                        },
                      })}
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="e.g., Black"
                    />
                    {errors.color && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.color.message}
                      </p>
                    )}
                  </div>

                  {/* License Plate Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      License Plate
                    </label>
                    <input
                      {...register("plate", {
                        required: "License plate is required",
                        minLength: {
                          value: 3,
                          message:
                            "License plate must be at least 3 characters",
                        },
                      })}
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="e.g., ABC123"
                    />
                    {errors.plate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.plate.message}
                      </p>
                    )}
                  </div>

                  {/* Vehicle Type Select */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vehicle Type
                    </label>
                    <select
                      {...register("vehicleType", {
                        required: "Vehicle type is required",
                      })}
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      <option value="">Select vehicle type</option>
                      {VEHICLE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.vehicleType.message}
                      </p>
                    )}
                  </div>

                  {/* Capacity Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Passenger Capacity
                    </label>
                    <input
                      type="number"
                      {...register("capacity", {
                        required: "Capacity is required",
                        min: {
                          value: 1,
                          message: "Capacity must be at least 1",
                        },
                        max: {
                          value: 8,
                          message: "Capacity cannot exceed 8",
                        },
                      })}
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="e.g., 4"
                    />
                    {errors.capacity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.capacity.message}
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {user?.vehicle ? "Save Changes" : "Add Vehicle"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-700/50 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vehicle;

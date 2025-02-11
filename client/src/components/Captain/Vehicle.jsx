import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Car, Edit2, Save, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerVehicle, deleteVehicle } from "../../store/slices/userSlice";
import { toast } from "react-toastify";
import { ToastContainer } from "../index";

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Van"];

const INITIAL_FORM_STATE = {
  color: "",
  plate: "",
  capacity: "",
  vehicleType: "",
};

function Vehicle() {
  const { user, loading } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: useMemo(
      () => ({
        color: user?.vehicle?.color || "",
        plate: user?.vehicle?.plate || "",
        capacity: user?.vehicle?.capacity || "",
        vehicleType: user?.vehicle?.vehicleType || "",
      }),
      [user?.vehicle]
    ),
  });

  // Reset form when user vehicle changes
  useEffect(() => {
    if (user?.vehicle) {
      reset({
        color: user.vehicle.color,
        plate: user.vehicle.plate,
        capacity: user.vehicle.capacity,
        vehicleType: user.vehicle.vehicleType,
      });
    } else {
      reset(INITIAL_FORM_STATE);
    }
  }, [user?.vehicle, reset]);

  // Set initial editing state based on whether vehicle exists
  useEffect(() => {
    setIsEditing(!user?.vehicle);
  }, [user?.vehicle]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerVehicle(data)).unwrap();
      toast.success("Vehicle details updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Failed to update vehicle details");
    }
  };

  const handleCancel = () => {
    if (user?.vehicle) {
      setIsEditing(false);
      reset({
        color: user.vehicle.color,
        plate: user.vehicle.plate,
        capacity: user.vehicle.capacity,
        vehicleType: user.vehicle.vehicleType,
      });
    } else {
      navigate("/");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteVehicle()).unwrap();
      toast.success("Vehicle deleted successfully");
      setShowDeleteDialog(false);
      setIsEditing(true);
      reset(INITIAL_FORM_STATE);
    } catch (error) {
      toast.error(error.message || "Failed to delete vehicle");
    }
  };

  const formatFieldValue = (key, value) => {
    if (key === "capacity") return parseInt(value).toString();
    return value;
  };

  const DeleteConfirmationDialog = () => {
    if (!showDeleteDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Delete Vehicle?</h2>
          <p className="text-gray-300 mb-6">
            This action cannot be undone. This will permanently delete your
            vehicle information from your profile.
          </p>
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-gray-700 cursor-pointer hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <ToastContainer />
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
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 shadow-xl">
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
                        <div className="p-3 bg-gray-700/50 rounded-lg font-medium">
                          {formatFieldValue(key, value)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Vehicle
                    </button>
                  </div>
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
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g., 4"
                    />
                    {errors.capacity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.capacity.message}
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Save className="w-5 h-5" />
                      {user?.vehicle ? "Save Changes" : "Add Vehicle"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-gray-600"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <DeleteConfirmationDialog />
    </div>
  );
}

export default Vehicle;

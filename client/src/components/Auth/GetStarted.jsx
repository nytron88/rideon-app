import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { auth, googleProvider, githubProvider } from "../../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { googleAuth } from "../../store/slices/authSlice";
import { ArrowLeft, Github } from "lucide-react";
import { Link } from "react-router-dom";

function GetStarted() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProviderAuth = async (provider) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await dispatch(
        googleAuth({
          idToken,
          email: result.user.email,
          name: result.user.displayName,
          photo: result.user.photoURL,
        })
      ).unwrap();

      navigate("/");
    } catch (error) {
      setError(error?.message || "Authentication failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-white flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col">
        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center mt-6">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold">Get Started</h1>
            <p className="text-gray-400">
              Sign in or create an account to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleProviderAuth(googleProvider)}
              disabled={loading}
              className="w-full bg-white text-black px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group cursor-pointer"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="group-hover:scale-[0.98] transition-transform">
                Continue with Google
              </span>
            </button>

            <button
              onClick={() => handleProviderAuth(githubProvider)}
              disabled={loading}
              className="w-full bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group cursor-pointer"
            >
              <Github className="w-5 h-5" />
              <span className="group-hover:scale-[0.98] transition-transform">
                Continue with GitHub
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetStarted;

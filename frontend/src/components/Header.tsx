import { Pizza, LogIn, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="backdrop-blur-md bg-white/70 border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-50 shadow-inner group-hover:scale-105 transition-transform">
            <Pizza className="h-7 w-7 text-orange-500 drop-shadow-sm" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
              GoodFoods
            </h1>
            <p className="text-xs text-gray-500 tracking-wide">
              Your AI Dining Companion
            </p>
          </div>
        </Link>

        {/* Right: Navigation / Auth */}
        <nav className="flex items-center gap-5">
          <Link
            to="/chat"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium hidden sm:inline">Chat</span>
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition-all"
            >
              <User className="h-5 w-5" />
              <span className="font-medium">{user?.name || "Profile"}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 border border-gray-200 transition-all"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-medium">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

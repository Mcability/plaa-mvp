import { BookOpenText, LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";

export function Navbar({ onLogoClick }: { onLogoClick: () => void }) {
  const { user, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-navy text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 font-display text-lg sm:text-xl tracking-wide"
        >
          <BookOpenText className="w-6 h-6 text-gold" />
          <span>
            PLAA <span className="hidden sm:inline text-white/60 font-body text-sm font-normal">Publishing &amp; Layout Assistant</span>
          </span>
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-white/80">{user.name || user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="bg-gold hover:bg-gold-light text-navy-dark font-semibold text-sm px-4 py-2 rounded-md transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

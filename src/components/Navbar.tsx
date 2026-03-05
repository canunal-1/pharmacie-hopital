import { Link, useLocation } from "react-router-dom";
import { Pill, Phone, MapPin, Menu, X, LogIn, UserPlus, LogOut, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isSubscribed, logout } = useAuth();

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Nos Conseils", path: "/conseils" },
    { name: "Tarifs", path: "/tarifs" },
    { name: "Contact & Accès", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="bg-emerald-600 text-white text-sm py-2 px-4 justify-between items-center hidden md:flex">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>123 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Phone className="h-4 w-4" />
            <span>01 48 47 12 34</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Pill className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Pharmacie<br />de l'Hôpital</h1>
              <p className="text-xs text-slate-500 hidden sm:block">La Fourche - Les Pavillons-sous-Bois</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600",
                  location.pathname === link.path ? "text-emerald-600" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                {isSubscribed && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    Premium
                  </span>
                )}
                <span className="text-sm text-slate-500">{user.nom}</span>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/connexion"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  S'inscrire
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "block px-3 py-3 rounded-md text-base font-medium",
                  location.pathname === link.path
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile auth */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="text-sm font-medium text-slate-900">{user.nom}</span>
                    {isSubscribed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/connexion"
                    className="flex items-center gap-2 px-3 py-3 text-slate-700 hover:bg-slate-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="flex items-center gap-2 px-3 py-3 bg-emerald-50 text-emerald-700 rounded-md font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 px-3 py-2 text-slate-600">
                <Phone className="h-5 w-5 text-emerald-600" />
                <span>01 48 47 12 34</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 text-slate-600">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">123 Av. Aristide Briand, Les Pavillons-sous-Bois</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

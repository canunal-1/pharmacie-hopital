import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Pill } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-600/20 p-2 rounded-lg">
                <Pill className="h-6 w-6 text-emerald-500" />
              </div>
              <span className="text-xl font-bold text-white">Pharmacie de l'Hôpital</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Votre partenaire santé aux Pavillons-sous-Bois. Conseils personnalisés, phytothérapie, et accompagnement au quotidien.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm">123 Avenue Aristide Briand<br />93320 Les Pavillons-sous-Bois</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm">01 48 47 12 34</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                <a href="mailto:contact@pharmacie-hopital.fr" className="text-sm hover:text-white transition-colors">
                  contact@pharmacie-hopital.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Horaires</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Lundi - Vendredi</span>
                <span className="text-white">08:30 - 20:00</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Samedi</span>
                <span className="text-white">09:00 - 19:30</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span>Dimanche</span>
                <span className="text-emerald-400 font-medium">Fermé (sauf garde)</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg mt-4">
              <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
              <p>Pour les urgences en dehors des horaires d'ouverture, composez le 15 ou le 3237.</p>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-emerald-400 transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/conseils" className="text-sm hover:text-emerald-400 transition-colors">Nos Conseils Santé</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-emerald-400 transition-colors">Plan d'accès</Link>
              </li>
              <li>
                <a href="https://www.ameli.fr/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-emerald-400 transition-colors">Ameli.fr</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Pharmacie de l'Hôpital. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link to="#" className="hover:text-white transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { MapPin, Phone, Mail, Clock, Car, Bus, AlertTriangle } from "lucide-react";

export default function Contact() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Contact & Accès</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Notre équipe est à votre disposition pour répondre à vos questions et vous accompagner dans votre parcours de soins. Retrouvez-nous facilement aux Pavillons-sous-Bois.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Coordonnées */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Adresse</h2>
            <p className="text-slate-600 mb-2">Pharmacie de l'Hôpital</p>
            <p className="text-slate-600 font-medium">123 Avenue Aristide Briand</p>
            <p className="text-slate-600">93320 Les Pavillons-sous-Bois</p>
            <div className="mt-6 pt-6 border-t border-slate-100 w-full">
              <p className="text-sm text-slate-500 mb-3 flex items-center justify-center gap-2">
                <Car className="w-4 h-4" /> Parking à proximité
              </p>
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                <Bus className="w-4 h-4" /> Bus 146, 234 - Arrêt La Fourche
              </p>
            </div>
          </div>

          {/* Horaires */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Horaires d'ouverture</h2>
            <ul className="w-full space-y-3 text-slate-600">
              <li className="flex justify-between items-center pb-3 border-b border-slate-50">
                <span>Lundi au Vendredi</span>
                <span className="font-medium text-slate-900">08:30 - 20:00</span>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-slate-50">
                <span>Samedi</span>
                <span className="font-medium text-slate-900">09:00 - 19:30</span>
              </li>
              <li className="flex justify-between items-center pt-1">
                <span>Dimanche</span>
                <span className="font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">Fermé</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
              <Phone className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Nous joindre</h2>
            <div className="space-y-6 w-full">
              <a href="tel:0148471234" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
                <span className="text-sm text-slate-500 mb-1">Téléphone</span>
                <span className="text-xl font-bold text-emerald-600 group-hover:text-emerald-700">01 48 47 12 34</span>
              </a>
              <a href="mailto:contact@pharmacie-hopital.fr" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
                <span className="text-sm text-slate-500 mb-1">Email</span>
                <span className="text-base font-medium text-slate-700 group-hover:text-emerald-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> contact@pharmacie-hopital.fr
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Urgences & Garde */}
        <div className="bg-amber-50 rounded-3xl p-8 lg:p-12 border border-amber-100 mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Urgences et Pharmacies de Garde</h2>
              <p className="text-amber-800 leading-relaxed mb-4">
                En dehors de nos heures d'ouverture, pour trouver la pharmacie de garde la plus proche de chez vous :
              </p>
              <ul className="space-y-2 text-amber-900 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm">1</span>
                  Composez le <strong>3237</strong> (0,35€/min)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm">2</span>
                  Consultez le site web <a href="https://www.3237.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-700">www.3237.fr</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm">3</span>
                  En cas d'urgence vitale, composez le <strong>15</strong> (SAMU)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Carte (Placeholder interactif) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Plan d'accès</h2>
          </div>
          <div className="relative h-[400px] bg-slate-200 w-full flex items-center justify-center">
            {/* Ici on mettrait une vraie iframe Google Maps. Pour l'instant, un placeholder stylisé. */}
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/600')] opacity-50 object-cover mix-blend-multiply"></div>
            <div className="relative z-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center max-w-sm mx-4">
              <MapPin className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Pharmacie de l'Hôpital</h3>
              <p className="text-sm text-slate-600 mb-4">123 Avenue Aristide Briand<br/>93320 Les Pavillons-sous-Bois</p>
              <a 
                href="https://maps.google.com/?q=Pharmacie+de+l'Hôpital+Les+Pavillons-sous-Bois" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Ouvrir dans Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, HeartPulse, Clock, Leaf, BookOpen, FileText } from "lucide-react";
import { fetchCategories, fetchConseils } from "@/data/api";
import type { Categorie, Conseil } from "@/data/api";

export default function Home() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [recentConseils, setRecentConseils] = useState<Conseil[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchConseils().then((data) => setRecentConseils(data.slice(0, 6)));
  }, []);

  const categoryIcons: Record<string, typeof HeartPulse> = {
    "Médicaments": HeartPulse,
    "Parapharmacie": ShieldCheck,
    "Matériel Médical": ShieldCheck,
    "Bébé & Maman": HeartPulse,
    "Compléments Alimentaires": Leaf,
  };

  const categoryColors: Record<string, string> = {
    "Médicaments": "bg-pink-100 text-pink-600",
    "Parapharmacie": "bg-purple-100 text-purple-600",
    "Matériel Médical": "bg-blue-100 text-blue-600",
    "Bébé & Maman": "bg-rose-100 text-rose-600",
    "Compléments Alimentaires": "bg-green-100 text-green-600",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-emerald-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/pharmacy/1920/1080?blur=4"
            alt="Intérieur de la pharmacie"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 to-emerald-50/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              Votre santé, notre priorité
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Bienvenue à la <span className="text-emerald-600">Pharmacie de l'Hôpital</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Située au cœur des Pavillons-sous-Bois (La Fourche), notre équipe de pharmaciens et préparateurs vous accueille, vous conseille et vous accompagne au quotidien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/conseils"
                className="inline-flex justify-center items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
              >
                Découvrir nos conseils
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex justify-center items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                Voir les horaires
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Conseil Personnalisé</h3>
              <p className="text-slate-600">Une équipe à votre écoute pour vous guider vers les meilleurs traitements et soins adaptés à vos besoins.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Large Amplitude</h3>
              <p className="text-slate-600">Ouvert du lundi au samedi sans interruption pour vous assurer un accès continu à vos soins.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Phytothérapie</h3>
              <p className="text-slate-600">Une sélection rigoureuse de plantes médicinales avec fiches conseils rédigées par nos pharmaciens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories from API */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Nos univers santé & bien-être</h2>
              <p className="text-slate-600">Découvrez nos fiches conseils rédigées par nos pharmaciens pour prendre soin de vous au naturel.</p>
            </div>
            <Link to="/conseils" className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
              Voir tous les conseils <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((cat) => {
              const IconComponent = categoryIcons[cat.nom_categorie] || BookOpen;
              const colorClass = categoryColors[cat.nom_categorie] || "bg-slate-100 text-slate-600";
              return (
                <Link
                  key={cat.id_categorie}
                  to={`/conseils?categorie=${cat.id_categorie}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col h-full"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{cat.nom_categorie}</h3>
                  <p className="text-sm text-slate-500 mt-auto">{cat.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Conseils */}
      {recentConseils.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Derniers conseils ajoutés</h2>
                <p className="text-slate-600">Les dernières fiches et recommandations de notre équipe.</p>
              </div>
              <Link to="/conseils" className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                Voir tous les conseils <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentConseils.map((conseil) => (
                <Link
                  key={conseil.id_conseil}
                  to={`/conseil/${conseil.id_conseil}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col"
                >
                  <div className={`h-2 ${conseil.lien?.endsWith('.pdf') ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}></div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                        {conseil.nom_categorie}
                      </span>
                      {conseil.lien?.endsWith('.pdf') && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          <FileText className="w-3 h-3" /> PDF
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {conseil.lien?.endsWith('.pdf') && <Leaf className="w-4 h-4 inline mr-1.5 text-emerald-500" />}
                      {conseil.titre}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 flex-1">{conseil.contenu}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team/Trust Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-600 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-16 flex flex-col justify-center text-white">
                <h2 className="text-3xl font-bold mb-6">Une équipe de professionnels à votre service</h2>
                <p className="text-emerald-50 text-lg mb-8 leading-relaxed">
                  Notre équipe est composée de pharmaciens diplômés et de préparateurs en pharmacie expérimentés. Nous suivons régulièrement des formations pour vous apporter les conseils les plus justes et actualisés.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <span>Délivrance sécurisée d'ordonnances</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <span>Entretiens pharmaceutiques personnalisés</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <span>Mise à jour de la carte vitale</span>
                  </li>
                </ul>
                <div>
                  <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors">
                    Nous contacter
                  </Link>
                </div>
              </div>
              <div className="relative h-64 lg:h-auto">
                <img
                  src="https://picsum.photos/seed/pharmacist/800/800"
                  alt="Pharmacien au comptoir"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

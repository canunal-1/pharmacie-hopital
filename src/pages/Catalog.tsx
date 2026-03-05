import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronRight, Leaf, ExternalLink, FileText, BookOpen } from "lucide-react";
import { fetchCategories, fetchConseils, fetchSousCategories } from "@/data/api";
import type { Categorie, Conseil, SousCategorie } from "@/data/api";

export default function Conseils() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorieParam = searchParams.get("categorie");
  const sousCatParam = searchParams.get("sous_categorie");

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
  const [conseils, setConseils] = useState<Conseil[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(categorieParam ? Number(categorieParam) : null);
  const [selectedSousCat, setSelectedSousCat] = useState<number | null>(sousCatParam ? Number(sousCatParam) : null);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategorie) {
      fetchSousCategories(selectedCategorie).then(setSousCategories);
    } else {
      fetchSousCategories().then(setSousCategories);
    }
  }, [selectedCategorie]);

  // Load conseils
  useEffect(() => {
    setLoading(true);
    fetchConseils({
      categorie: selectedCategorie || undefined,
      sous_categorie: selectedSousCat || undefined,
      search: searchQuery || undefined,
    }).then((data) => {
      setConseils(data);
      setLoading(false);
    });
  }, [selectedCategorie, selectedSousCat, searchQuery]);

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategorie) params.set("categorie", String(selectedCategorie));
    if (selectedSousCat) params.set("sous_categorie", String(selectedSousCat));
    setSearchParams(params, { replace: true });
  }, [selectedCategorie, selectedSousCat, setSearchParams]);

  const isPdf = (lien: string) => lien?.endsWith('.pdf');

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            Conseils santé par nos pharmaciens
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nos Conseils Santé</h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Retrouvez nos fiches conseils rédigées par nos pharmaciens : phytothérapie, soins du quotidien, et bien-être naturel.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un conseil..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold">
                <Filter className="h-5 w-5 text-emerald-600" />
                <h2>Catégories</h2>
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => { setSelectedCategorie(null); setSelectedSousCat(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategorie
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    Toutes les catégories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id_categorie}>
                    <button
                      onClick={() => { setSelectedCategorie(cat.id_categorie); setSelectedSousCat(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedCategorie === cat.id_categorie
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      {cat.nom_categorie}
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                        {cat.nb_sous_categories}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subcategories */}
            {sousCategories.length > 0 && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <h2>Sous-catégories</h2>
                </div>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setSelectedSousCat(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedSousCat
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      Toutes
                    </button>
                  </li>
                  {sousCategories.map((sc) => (
                    <li key={sc.id_sous_categorie}>
                      <button
                        onClick={() => setSelectedSousCat(sc.id_sous_categorie)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedSousCat === sc.id_sous_categorie
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        {sc.nom_sous_categorie}
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                          {sc.nb_conseils}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Conseils Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : conseils.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {conseils.map((conseil) => (
                  <Link
                    key={conseil.id_conseil}
                    to={`/conseil/${conseil.id_conseil}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col"
                  >
                    {/* Top color bar */}
                    <div className={`h-2 ${isPdf(conseil.lien) ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}></div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                          {conseil.nom_categorie}
                        </span>
                        {isPdf(conseil.lien) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            <FileText className="w-3 h-3" />
                            PDF
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {isPdf(conseil.lien) && <Leaf className="w-4 h-4 inline mr-1.5 text-emerald-500" />}
                        {conseil.titre}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                        {conseil.contenu}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <span className="text-xs text-slate-400">{conseil.nom_sous_categorie}</span>
                        <span className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                          Lire <ChevronRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun conseil trouvé</h3>
                <p className="text-slate-500">
                  Essayez de modifier votre recherche ou de sélectionner une autre catégorie.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategorie(null);
                    setSelectedSousCat(null);
                  }}
                  className="mt-6 text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, Leaf, BookOpen, Calendar, Tag, Lock, Crown } from "lucide-react";
import { fetchConseilById } from "@/data/api";
import type { Conseil } from "@/data/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ConseilDetail() {
    const { id } = useParams();
    const [conseil, setConseil] = useState<Conseil | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { user, isSubscribed } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchConseilById(Number(id))
            .then((data) => {
                setConseil(data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [id]);

    const handlePdfDownload = async () => {
        if (!conseil?.lien) return;
        const filename = conseil.lien.replace('/lien/', '');
        const token = localStorage.getItem('user_token');

        try {
            const res = await fetch(`/api/pdf/${encodeURIComponent(filename)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Erreur');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Erreur lors du téléchargement du PDF");
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="bg-white rounded-3xl p-10 space-y-6">
                            <div className="h-8 bg-slate-200 rounded w-2/3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !conseil) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Conseil introuvable</h1>
                <Link to="/conseils" className="text-emerald-600 hover:underline flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Retour aux conseils
                </Link>
            </div>
        );
    }

    const isPdf = conseil.lien?.endsWith('.pdf');
    const formattedDate = new Date(conseil.date_ajout).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/conseils" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Retour aux conseils
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header gradient */}
                    <div className={`h-3 ${isPdf ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500' : 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500'}`}></div>

                    <div className="p-8 lg:p-12">
                        {/* Breadcrumb tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <Link
                                to={`/conseils?categorie=${conseil.id_categorie}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full hover:bg-emerald-100 transition-colors"
                            >
                                <Tag className="w-3.5 h-3.5" />
                                {conseil.nom_categorie}
                            </Link>
                            <span className="text-slate-300">›</span>
                            <Link
                                to={`/conseils?sous_categorie=${conseil.id_sous_categorie}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 transition-colors"
                            >
                                {conseil.nom_sous_categorie}
                            </Link>
                            {isPdf && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                                    <FileText className="w-3.5 h-3.5" />
                                    Fiche PDF
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 flex items-start gap-3">
                            {isPdf && <Leaf className="w-8 h-8 text-emerald-500 shrink-0 mt-1" />}
                            {conseil.titre}
                        </h1>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                            <Calendar className="w-4 h-4" />
                            Publié le {formattedDate}
                        </div>

                        {/* Content */}
                        <div className="prose max-w-none mb-8">
                            <div className="bg-emerald-50 rounded-2xl p-6 lg:p-8 border border-emerald-100">
                                <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-emerald-600" />
                                    Conseil du Pharmacien
                                </h3>
                                <p className="text-emerald-800 leading-relaxed text-lg">{conseil.contenu}</p>
                            </div>
                        </div>

                        {/* Link / PDF button */}
                        {conseil.lien && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                {isPdf ? (
                                    // PDF: check subscription
                                    isSubscribed ? (
                                        <>
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                                                📄 Fiche complète à télécharger
                                            </h3>
                                            <button
                                                onClick={handlePdfDownload}
                                                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl font-medium text-white transition-all shadow-sm hover:shadow-md bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                            >
                                                <FileText className="w-5 h-5" />
                                                Télécharger la fiche {conseil.titre}
                                            </button>
                                        </>
                                    ) : (
                                        // Not subscribed — show premium CTA
                                        <div className="text-center py-4">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-lg shadow-amber-200">
                                                <Lock className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Contenu Premium 🔒</h3>
                                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                                Cette fiche PDF est réservée aux abonnés Premium. Accédez à toutes nos fiches de plantes médicinales pour seulement 4,99€/mois.
                                            </p>
                                            <button
                                                onClick={() => navigate(user ? "/tarifs" : "/inscription")}
                                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-200"
                                            >
                                                <Crown className="w-5 h-5" />
                                                {user ? "Voir les tarifs" : "Créer un compte"}
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    // External link: always accessible
                                    <>
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                                            🔗 En savoir plus
                                        </h3>
                                        <a
                                            href={conseil.lien}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl font-medium text-white transition-all shadow-sm hover:shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            Consulter la source
                                        </a>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
                            <strong>⚠️ Avertissement :</strong> Ces informations sont données à titre indicatif et ne remplacent pas l'avis de votre pharmacien ou médecin. N'hésitez pas à venir nous consulter en pharmacie pour un conseil personnalisé.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Leaf, FileText, Shield, RefreshCw, Sparkles, Lock, MessageCircle } from "lucide-react";
import { createCheckoutSession } from "@/data/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
    const { user, isSubscribed } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubscribe = async () => {
        if (!user) {
            navigate("/inscription");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const { url } = await createCheckoutSession();
            if (url) {
                window.location.href = url;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: MessageCircle, text: "Accès illimité à PharmaBot (IA Santé 24/7)" },
        { icon: FileText, text: "Accès à toutes les fiches PDF de plantes médicinales" },
        { icon: Leaf, text: "Plus de 60 fiches rédigées par nos pharmaciens" },
        { icon: RefreshCw, text: "Nouvelles fiches ajoutées régulièrement" },
        { icon: Shield, text: "Contenu vérifié et validé scientifiquement" },
        { icon: Sparkles, text: "Téléchargement illimité de tous les PDF" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-6 border border-amber-100">
                        <Crown className="w-4 h-4" />
                        Abonnement Premium
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Accédez à <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">toutes nos fiches</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Nos fiches de plantes médicinales, rédigées par nos pharmaciens, sont disponibles en téléchargement avec l'abonnement Premium.
                    </p>
                </div>

                {/* Pricing card */}
                <div className="max-w-lg mx-auto">
                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-emerald-100/50 border-2 border-emerald-200 overflow-hidden">
                        {/* Top gradient */}
                        <div className="h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>

                        {/* Badge */}
                        <div className="absolute top-6 right-6">
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                                Populaire
                            </span>
                        </div>

                        <div className="p-8 md:p-10">
                            {/* Plan name */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Premium</h2>
                                    <p className="text-sm text-slate-500">Accès complet</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-bold text-slate-900">4,99€</span>
                                <span className="text-slate-500 text-lg">/mois</span>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-8">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-slate-700 text-sm">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            {isSubscribed ? (
                                <div className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-semibold text-center border border-emerald-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Vous êtes abonné Premium ✨
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 mb-4">
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {user ? <Crown className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                                {user ? "S'abonner maintenant" : "Créer un compte pour s'abonner"}
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            <p className="text-center text-xs text-slate-400 mt-4">
                                Annulable à tout moment • Paiement sécurisé via Stripe
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center gap-8 mt-12 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Paiement sécurisé
                    </div>
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Annulable à tout moment
                    </div>
                    <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5" />
                        Contenu expert
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Leaf, FileText, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PaymentSuccess() {
    const { refreshSubscription } = useAuth();

    useEffect(() => {
        // Refresh subscription status after successful payment
        refreshSubscription();
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
            <div className="max-w-lg w-full text-center">
                {/* Success animation */}
                <div className="relative inline-flex items-center justify-center mb-8">
                    <div className="absolute w-32 h-32 rounded-full bg-emerald-100 animate-ping opacity-20"></div>
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4 border border-amber-100">
                    <Crown className="w-4 h-4" />
                    Premium activé
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Paiement réussi ! 🎉
                </h1>
                <p className="text-lg text-slate-600 mb-8">
                    Votre abonnement Premium est maintenant actif. Vous avez accès à toutes nos fiches de plantes médicinales en PDF.
                </p>

                {/* What's included */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 text-left">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                        Votre accès inclut :
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                            Plus de 60 fiches de plantes médicinales en PDF
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                            Téléchargement illimité
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600">
                            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                            Nouvelles fiches ajoutées régulièrement
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <Link
                    to="/conseils"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    Découvrir les fiches
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}

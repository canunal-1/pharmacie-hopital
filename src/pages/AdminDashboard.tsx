import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, Leaf, FileText, ExternalLink, X, Save, AlertCircle } from "lucide-react";
import { fetchConseils, fetchCategories, fetchSousCategories, createConseil, updateConseil, deleteConseil } from "@/data/api";
import type { Conseil, Categorie, SousCategorie } from "@/data/api";

interface ConseilForm {
    titre: string;
    contenu: string;
    lien: string;
    id_sous_categorie: number;
}

const emptyForm: ConseilForm = { titre: "", contenu: "", lien: "", id_sous_categorie: 0 };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [conseils, setConseils] = useState<Conseil[]>([]);
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ConseilForm>(emptyForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const adminUser = JSON.parse(localStorage.getItem("admin_user") || "null");

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            navigate("/admin/login");
            return;
        }
        loadData();
    }, [navigate]);

    async function loadData() {
        setLoading(true);
        try {
            const [conseilsData, catsData, subCatsData] = await Promise.all([
                fetchConseils(),
                fetchCategories(),
                fetchSousCategories(),
            ]);
            setConseils(conseilsData);
            setCategories(catsData);
            setSousCategories(subCatsData);
        } catch {
            setError("Erreur lors du chargement des données");
        }
        setLoading(false);
    }

    function handleLogout() {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        navigate("/admin/login");
    }

    function openCreateForm() {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
        setError("");
    }

    function openEditForm(conseil: Conseil) {
        setForm({
            titre: conseil.titre,
            contenu: conseil.contenu,
            lien: conseil.lien,
            id_sous_categorie: conseil.id_sous_categorie,
        });
        setEditingId(conseil.id_conseil);
        setShowForm(true);
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.titre || !form.id_sous_categorie) {
            setError("Titre et sous-catégorie obligatoires");
            return;
        }

        try {
            if (editingId) {
                await updateConseil(editingId, form);
                setSuccess("Conseil mis à jour !");
            } else {
                await createConseil(form);
                setSuccess("Conseil créé !");
            }
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
            await loadData();
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'enregistrement");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce conseil ?")) return;
        try {
            await deleteConseil(id);
            setSuccess("Conseil supprimé !");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la suppression");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <div className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">🏥 Administration</h1>
                        <p className="text-sm text-slate-400">Connecté en tant que {adminUser?.nom || "Admin"}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/40 rounded-lg transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Notifications */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
                        <span>✅ {success}</span>
                        <button onClick={() => setSuccess("")} className="text-emerald-600 hover:text-emerald-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between">
                        <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</span>
                        <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <p className="text-sm text-slate-500 mb-1">Total Conseils</p>
                        <p className="text-3xl font-bold text-slate-900">{conseils.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <p className="text-sm text-slate-500 mb-1">Catégories</p>
                        <p className="text-3xl font-bold text-slate-900">{categories.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <p className="text-sm text-slate-500 mb-1">Sous-catégories</p>
                        <p className="text-3xl font-bold text-slate-900">{sousCategories.length}</p>
                    </div>
                </div>

                {/* Header + Add button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Gestion des Conseils</h2>
                    <button
                        onClick={openCreateForm}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau Conseil
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingId ? "Modifier le conseil" : "Nouveau conseil"}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Titre *</label>
                                    <input
                                        type="text"
                                        value={form.titre}
                                        onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Ex: Bienfaits du Curcuma"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contenu</label>
                                    <textarea
                                        value={form.contenu}
                                        onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                        placeholder="Description détaillée du conseil..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Lien (URL ou chemin PDF)</label>
                                    <input
                                        type="text"
                                        value={form.lien}
                                        onChange={(e) => setForm({ ...form, lien: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Ex: /lien/CURCUMA.pdf ou https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sous-catégorie *</label>
                                    <select
                                        value={form.id_sous_categorie}
                                        onChange={(e) => setForm({ ...form, id_sous_categorie: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        required
                                    >
                                        <option value={0}>Choisir une sous-catégorie...</option>
                                        {sousCategories.map((sc) => (
                                            <option key={sc.id_sous_categorie} value={sc.id_sous_categorie}>
                                                {sc.nom_categorie} › {sc.nom_sous_categorie}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingId ? "Mettre à jour" : "Créer"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Conseils Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Conseil</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Catégorie</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Lien</th>
                                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {conseils.map((conseil) => (
                                    <tr key={conseil.id_conseil} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${conseil.lien?.endsWith('.pdf') ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                    {conseil.lien?.endsWith('.pdf') ? (
                                                        <Leaf className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <ExternalLink className="w-4 h-4 text-blue-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{conseil.titre}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{conseil.contenu}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                                                {conseil.nom_sous_categorie}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {conseil.lien ? (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    {conseil.lien.endsWith('.pdf') ? <FileText className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                                                    <span className="truncate max-w-[200px]">{conseil.lien}</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditForm(conseil)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(conseil.id_conseil)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

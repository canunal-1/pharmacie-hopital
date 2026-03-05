const API_BASE = '/api';

// ============================================
// Types
// ============================================

export interface Categorie {
    id_categorie: number;
    nom_categorie: string;
    description: string;
    nb_sous_categories: number;
}

export interface SousCategorie {
    id_sous_categorie: number;
    nom_sous_categorie: string;
    id_categorie: number;
    nom_categorie?: string;
    nb_conseils: number;
}

export interface Conseil {
    id_conseil: number;
    titre: string;
    contenu: string;
    lien: string;
    date_ajout: string;
    id_sous_categorie: number;
    nom_sous_categorie: string;
    nom_categorie: string;
    id_categorie: number;
}

export interface LoginResponse {
    token: string;
    user: { id: number; nom: string; email: string };
}

export interface SubscriptionStatus {
    subscribed: boolean;
    status: string;
    date_debut?: string;
    subscription_id?: string;
}

// ============================================
// Public API
// ============================================

export async function fetchCategories(): Promise<Categorie[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
}

export async function fetchSousCategories(categorieId?: number): Promise<SousCategorie[]> {
    if (categorieId) {
        const res = await fetch(`${API_BASE}/categories/${categorieId}/sous-categories`);
        return res.json();
    }
    const res = await fetch(`${API_BASE}/sous-categories`);
    return res.json();
}

export async function fetchConseils(filters?: {
    sous_categorie?: number;
    categorie?: number;
    search?: string;
}): Promise<Conseil[]> {
    const params = new URLSearchParams();
    if (filters?.sous_categorie) params.set('sous_categorie', String(filters.sous_categorie));
    if (filters?.categorie) params.set('categorie', String(filters.categorie));
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`${API_BASE}/conseils?${params.toString()}`);
    return res.json();
}

export async function fetchConseilById(id: number): Promise<Conseil> {
    const res = await fetch(`${API_BASE}/conseils/${id}`);
    if (!res.ok) throw new Error('Conseil non trouvé');
    return res.json();
}

// ============================================
// User Auth API
// ============================================

export async function registerUser(nom: string, email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'inscription");
    }
    return res.json();
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de connexion');
    }
    return res.json();
}

// ============================================
// Stripe API
// ============================================

function getUserAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('user_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export async function createCheckoutSession(): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: getUserAuthHeaders(),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de paiement');
    }
    return res.json();
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const res = await fetch(`${API_BASE}/stripe/subscription-status`, {
        headers: getUserAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de vérification');
    return res.json();
}

export async function cancelSubscription(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/stripe/cancel-subscription`, {
        method: 'POST',
        headers: getUserAuthHeaders(),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'annulation");
    }
    return res.json();
}

export function getPdfUrl(filename: string): string {
    const token = localStorage.getItem('user_token');
    // We return the API route; the token will be sent via header in the fetch
    return `${API_BASE}/pdf/${encodeURIComponent(filename)}`;
}

// ============================================
// Admin API
// ============================================

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de connexion');
    }
    return res.json();
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export async function createConseil(data: {
    titre: string;
    contenu: string;
    lien: string;
    id_sous_categorie: number;
}): Promise<{ id: number }> {
    const res = await fetch(`${API_BASE}/admin/conseils`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la création');
    return res.json();
}

export async function updateConseil(id: number, data: {
    titre: string;
    contenu: string;
    lien: string;
    id_sous_categorie: number;
}): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/conseils/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour');
}

export async function deleteConseil(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/conseils/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression');
}

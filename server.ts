import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { initDatabase, seedDatabase } from './db/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pharmacie-hopital-secret-key-2026';

// Stripe config
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_VOTRE_CLE_ICI';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_VOTRE_CLE_ICI';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_VOTRE_PRICE_ID_ICI';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const stripe = new Stripe(STRIPE_SECRET_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

// Init database
const db = initDatabase();
seedDatabase(db);

// ============================================
// MIDDLEWARE
// ============================================

// Stripe webhook needs raw body — MUST be before express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    let event: Stripe.Event;

    try {
        const sig = req.headers['stripe-signature'] as string;
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id;
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;

            if (userId) {
                // Update stripe_customer_id on user
                db.prepare('UPDATE utilisateur_public SET stripe_customer_id = ? WHERE id = ?')
                    .run(customerId, userId);

                // Create or update subscription
                const existing = db.prepare('SELECT * FROM abonnement WHERE id_utilisateur = ?').get(userId);
                if (existing) {
                    db.prepare('UPDATE abonnement SET stripe_subscription_id = ?, statut = ?, date_debut = CURRENT_TIMESTAMP WHERE id_utilisateur = ?')
                        .run(subscriptionId, 'active', userId);
                } else {
                    db.prepare('INSERT INTO abonnement (id_utilisateur, stripe_subscription_id, statut, date_debut) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
                        .run(userId, subscriptionId, 'active');
                }
                console.log(`✅ Abonnement activé pour user ${userId}`);
            }
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const status = subscription.status === 'active' ? 'active' : subscription.status;
            db.prepare('UPDATE abonnement SET statut = ? WHERE stripe_subscription_id = ?')
                .run(status, subscription.id);
            console.log(`🔄 Abonnement mis à jour: ${subscription.id} → ${status}`);
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            db.prepare('UPDATE abonnement SET statut = ?, date_fin = CURRENT_TIMESTAMP WHERE stripe_subscription_id = ?')
                .run('canceled', subscription.id);
            console.log(`❌ Abonnement annulé: ${subscription.id}`);
            break;
        }
    }

    res.json({ received: true });
});

// Standard middleware (after webhook route)
app.use(cors());
app.use(express.json());

// ============================================
// PUBLIC ROUTES
// ============================================

// GET all categories
app.get('/api/categories', (_req, res) => {
    const categories = db.prepare(`
    SELECT c.*, COUNT(sc.id_sous_categorie) as nb_sous_categories 
    FROM categorie c 
    LEFT JOIN sous_categorie sc ON c.id_categorie = sc.id_categorie 
    GROUP BY c.id_categorie
  `).all();
    res.json(categories);
});

// GET subcategories of a category
app.get('/api/categories/:id/sous-categories', (req, res) => {
    const sousCategories = db.prepare(`
    SELECT sc.*, COUNT(co.id_conseil) as nb_conseils
    FROM sous_categorie sc
    LEFT JOIN conseil co ON sc.id_sous_categorie = co.id_sous_categorie
    WHERE sc.id_categorie = ?
    GROUP BY sc.id_sous_categorie
  `).all(req.params.id);
    res.json(sousCategories);
});

// GET all subcategories
app.get('/api/sous-categories', (_req, res) => {
    const sousCategories = db.prepare(`
    SELECT sc.*, c.nom_categorie, COUNT(co.id_conseil) as nb_conseils
    FROM sous_categorie sc
    JOIN categorie c ON sc.id_categorie = c.id_categorie
    LEFT JOIN conseil co ON sc.id_sous_categorie = co.id_sous_categorie
    GROUP BY sc.id_sous_categorie
  `).all();
    res.json(sousCategories);
});

// GET all conseils (with optional filter by sous_categorie or categorie)
app.get('/api/conseils', (req, res) => {
    const { sous_categorie, categorie, search } = req.query;

    let query = `
    SELECT co.*, sc.nom_sous_categorie, c.nom_categorie, c.id_categorie
    FROM conseil co
    JOIN sous_categorie sc ON co.id_sous_categorie = sc.id_sous_categorie
    JOIN categorie c ON sc.id_categorie = c.id_categorie
  `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (sous_categorie) {
        conditions.push('co.id_sous_categorie = ?');
        params.push(sous_categorie);
    }

    if (categorie) {
        conditions.push('c.id_categorie = ?');
        params.push(categorie);
    }

    if (search) {
        conditions.push('(co.titre LIKE ? OR co.contenu LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY co.date_ajout DESC';

    const conseils = db.prepare(query).all(...params);
    res.json(conseils);
});

// GET single conseil
app.get('/api/conseils/:id', (req, res) => {
    const conseil = db.prepare(`
    SELECT co.*, sc.nom_sous_categorie, c.nom_categorie, c.id_categorie
    FROM conseil co
    JOIN sous_categorie sc ON co.id_sous_categorie = sc.id_sous_categorie
    JOIN categorie c ON sc.id_categorie = c.id_categorie
    WHERE co.id_conseil = ?
  `).get(req.params.id);

    if (!conseil) {
        return res.status(404).json({ error: 'Conseil non trouvé' });
    }
    res.json(conseil);
});

// ============================================
// PUBLIC USER AUTH ROUTES
// ============================================

// POST register
app.post('/api/register', (req, res) => {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
        return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM utilisateur_public WHERE email = ?').get(email);
    if (existing) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const result = db.prepare(
        'INSERT INTO utilisateur_public (nom, email, password) VALUES (?, ?, ?)'
    ).run(nom, email, hashedPassword);

    const token = jwt.sign(
        { id: result.lastInsertRowid, email, type: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(201).json({
        token,
        user: { id: result.lastInsertRowid, nom, email }
    });
});

// POST login (public user)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = db.prepare('SELECT * FROM utilisateur_public WHERE email = ?').get(email) as any;

    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, type: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        token,
        user: { id: user.id, nom: user.nom, email: user.email }
    });
});

// ============================================
// ADMIN AUTH
// ============================================

// POST admin login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = db.prepare('SELECT * FROM utilisateur WHERE email = ? AND is_admin = 1').get(email) as any;

    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
        { id: user.id_u, email: user.email, is_admin: user.is_admin },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id_u, nom: user.nom_utilisateur, email: user.email } });
});

// ============================================
// AUTH MIDDLEWARES
// ============================================

function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Token invalide' });
    }
}

function userAuthMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Connexion requise' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'user') {
            return res.status(403).json({ error: 'Accès réservé aux utilisateurs' });
        }
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}

// ============================================
// STRIPE ROUTES (authenticated user)
// ============================================

// POST create checkout session
app.post('/api/stripe/create-checkout-session', userAuthMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const user = db.prepare('SELECT * FROM utilisateur_public WHERE id = ?').get(userId) as any;

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Create or reuse Stripe customer
        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.nom,
                metadata: { user_id: String(userId) }
            });
            customerId = customer.id;
            db.prepare('UPDATE utilisateur_public SET stripe_customer_id = ? WHERE id = ?')
                .run(customerId, userId);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price: STRIPE_PRICE_ID,
                quantity: 1,
            }],
            success_url: `${CLIENT_URL}/paiement-succes?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/tarifs`,
            metadata: { user_id: String(userId) },
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe checkout error:', err.message);
        res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
    }
});

// GET subscription status
app.get('/api/stripe/subscription-status', userAuthMiddleware, (req: any, res) => {
    const userId = req.user.id;
    const abo = db.prepare(
        'SELECT * FROM abonnement WHERE id_utilisateur = ? ORDER BY date_debut DESC LIMIT 1'
    ).get(userId) as any;

    if (!abo || abo.statut !== 'active') {
        return res.json({ subscribed: false, status: abo?.statut || 'none' });
    }

    res.json({
        subscribed: true,
        status: abo.statut,
        date_debut: abo.date_debut,
        subscription_id: abo.stripe_subscription_id
    });
});

// POST cancel subscription
app.post('/api/stripe/cancel-subscription', userAuthMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const abo = db.prepare(
            'SELECT * FROM abonnement WHERE id_utilisateur = ? AND statut = ?'
        ).get(userId, 'active') as any;

        if (!abo) {
            return res.status(404).json({ error: 'Aucun abonnement actif' });
        }

        // Cancel at period end (user keeps access until end of billing period)
        await stripe.subscriptions.update(abo.stripe_subscription_id, {
            cancel_at_period_end: true
        });

        res.json({ message: 'Abonnement sera annulé à la fin de la période' });
    } catch (err: any) {
        console.error('Cancel subscription error:', err.message);
        res.status(500).json({ error: "Erreur lors de l'annulation" });
    }
});

// ============================================
// PROTECTED PDF ROUTE
// ============================================

app.get('/api/pdf/:filename', userAuthMiddleware, (req: any, res) => {
    const userId = req.user.id;

    // Check subscription
    const abo = db.prepare(
        'SELECT * FROM abonnement WHERE id_utilisateur = ? AND statut = ?'
    ).get(userId, 'active') as any;

    if (!abo) {
        return res.status(403).json({ error: 'Abonnement requis pour accéder à ce contenu' });
    }

    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.resolve(__dirname, 'lien', filename);

    // Security: prevent path traversal
    if (!filePath.startsWith(path.resolve(__dirname, 'lien'))) {
        return res.status(400).json({ error: 'Chemin invalide' });
    }

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ error: 'Fichier non trouvé' });
        }
    });
});

// ============================================
// CHATBOT ROUTE (Protected)
// ============================================

app.post('/api/chat', userAuthMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Check subscription
        const abo = db.prepare(
            'SELECT * FROM abonnement WHERE id_utilisateur = ? AND statut = ?'
        ).get(userId, 'active') as any;

        if (!abo) {
            return res.status(403).json({ error: 'Abonnement requis pour utiliser le chatbot' });
        }

        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message requis' });
        }

        const systemPrompt = `Tu es un assistant virtuel en pharmacie appelé "PharmaBot". 
Tu dois aider les utilisateurs avec des informations sanitaires générales et des conseils bien-être. 
Règles importantes :
- Ne donne pas de diagnostic médical précis.
- Conseille toujours de consulter un médecin ou un pharmacien en cas de doute persistant.
- Sois bref, clair, poli et rassurant.
- Ton rôle est de fournir des informations fiables basées sur la médecine générale et la phytothérapie.`;

        // Format history for Gemini
        const formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemPrompt,
            }
        });

        // if history is provided, we simulate the history state (the new SDK handles history locally in the `chat` object or via passing message history)
        // A simple way is to send the history as context in the first message if needed, or just send the current message
        // Due to the new SDK structure, we'll send the new message directly.

        // Re-construct history if needed (simplified for this implementation)
        const fullPrompt = `${history ? "Contexte précédent : " + JSON.stringify(history) + "\n\n" : ""}Nouvelle question de l'utilisateur : ${message}`;

        const response = await chat.sendMessage({ message: fullPrompt });

        res.json({ reply: response.text });
    } catch (error: any) {
        console.error('Erreur Chatbot:', error);
        res.status(500).json({ error: 'Erreur lors de la communication avec l\'IA' });
    }
});

// ============================================
// PROTECTED ADMIN ROUTES
// ============================================

// POST create conseil
app.post('/api/admin/conseils', authMiddleware, (req: any, res) => {
    const { titre, contenu, lien, id_sous_categorie } = req.body;

    if (!titre || !id_sous_categorie) {
        return res.status(400).json({ error: 'Titre et sous-catégorie requis' });
    }

    const result = db.prepare(
        'INSERT INTO conseil (titre, contenu, lien, id_sous_categorie) VALUES (?, ?, ?, ?)'
    ).run(titre, contenu || null, lien || null, id_sous_categorie);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Conseil créé' });
});

// PUT update conseil
app.put('/api/admin/conseils/:id', authMiddleware, (req: any, res) => {
    const { titre, contenu, lien, id_sous_categorie } = req.body;

    const existing = db.prepare('SELECT * FROM conseil WHERE id_conseil = ?').get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: 'Conseil non trouvé' });
    }

    db.prepare(
        'UPDATE conseil SET titre = ?, contenu = ?, lien = ?, id_sous_categorie = ? WHERE id_conseil = ?'
    ).run(titre, contenu, lien, id_sous_categorie, req.params.id);

    res.json({ message: 'Conseil mis à jour' });
});

// DELETE conseil
app.delete('/api/admin/conseils/:id', authMiddleware, (req: any, res) => {
    const existing = db.prepare('SELECT * FROM conseil WHERE id_conseil = ?').get(req.params.id);
    if (!existing) {
        return res.status(404).json({ error: 'Conseil non trouvé' });
    }

    db.prepare('DELETE FROM conseil WHERE id_conseil = ?').run(req.params.id);
    res.json({ message: 'Conseil supprimé' });
});

// POST create category
app.post('/api/admin/categories', authMiddleware, (req: any, res) => {
    const { nom_categorie, description } = req.body;
    const result = db.prepare('INSERT INTO categorie (nom_categorie, description) VALUES (?, ?)').run(nom_categorie, description);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Catégorie créée' });
});

// POST create sous-category
app.post('/api/admin/sous-categories', authMiddleware, (req: any, res) => {
    const { nom_sous_categorie, id_categorie } = req.body;
    const result = db.prepare('INSERT INTO sous_categorie (nom_sous_categorie, id_categorie) VALUES (?, ?)').run(nom_sous_categorie, id_categorie);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Sous-catégorie créée' });
});

// ============================================
// START SERVER & STATIC FILES
// ============================================

// Serve static files from the React app in production
// process.cwd() ensures it points to the root directory whether we run with tsx or node from the dist-server folder.
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// For any other route, send the React index.html
app.get('*', (req, res) => {
    // Only intercept GET requests that do not start with /api and do not start with /lien
    if (!req.path.startsWith('/api') && !req.path.startsWith('/lien')) {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🏥 Pharmacie API server running on http://localhost:${PORT}`);
    console.log(`💳 Stripe mode: ${STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'PRODUCTION'}`);
    console.log(`📁 PDFs served via protected route /api/pdf/:filename`);
});

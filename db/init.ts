import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
// If in production on Render, save db to the persistent disk mount path. Otherwise, local root.
const DB_PATH = isProduction
  ? '/opt/render/project/src/data/pharmacie.db'
  : path.resolve(__dirname, '..', 'pharmacie.db');

export function initDatabase(): Database.Database {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorie (
      id_categorie INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_categorie VARCHAR(50),
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS sous_categorie (
      id_sous_categorie INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_sous_categorie VARCHAR(100) NOT NULL,
      id_categorie INTEGER NOT NULL,
      FOREIGN KEY (id_categorie) REFERENCES categorie(id_categorie) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conseil (
      id_conseil INTEGER PRIMARY KEY AUTOINCREMENT,
      titre VARCHAR(255) NOT NULL,
      contenu TEXT,
      lien VARCHAR(500),
      date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
      id_sous_categorie INTEGER NOT NULL,
      FOREIGN KEY (id_sous_categorie) REFERENCES sous_categorie(id_sous_categorie) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS utilisateur (
      id_u INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_utilisateur VARCHAR(50) NOT NULL,
      email VARCHAR(250),
      password VARCHAR(255) NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS utilisateur_public (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom VARCHAR(100) NOT NULL,
      email VARCHAR(250) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      stripe_customer_id VARCHAR(255),
      date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS abonnement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_utilisateur INTEGER NOT NULL,
      stripe_subscription_id VARCHAR(255) UNIQUE,
      statut VARCHAR(50) DEFAULT 'inactive',
      date_debut DATETIME,
      date_fin DATETIME,
      FOREIGN KEY (id_utilisateur) REFERENCES utilisateur_public(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export function seedDatabase(db: Database.Database) {
  // Check if data already exists
  const count = db.prepare('SELECT COUNT(*) as c FROM categorie').get() as { c: number };
  if (count.c > 0) return;

  // Insert categories
  const insertCat = db.prepare('INSERT INTO categorie (id_categorie, nom_categorie, description) VALUES (?, ?, ?)');
  insertCat.run(1, 'Médicaments', 'Produits pharmaceutiques sur et sans ordonnance');
  insertCat.run(2, 'Parapharmacie', 'Hygiène, beauté et soins');
  insertCat.run(3, 'Matériel Médical', 'Orthopédie, premiers secours et diagnostic');
  insertCat.run(4, 'Bébé & Maman', 'Laits, couches, soins grossesse');
  insertCat.run(5, 'Compléments Alimentaires', 'Vitamines, minéraux et probiotiques');

  // Insert subcategories
  const insertSub = db.prepare('INSERT INTO sous_categorie (id_sous_categorie, nom_sous_categorie, id_categorie) VALUES (?, ?, ?)');
  insertSub.run(1, 'Douleurs et Fièvre', 1);
  insertSub.run(2, 'Digestion et Transit', 1);
  insertSub.run(3, 'Dermatologie', 2);
  insertSub.run(4, 'Hygiène Bucco-dentaire', 2);
  insertSub.run(5, 'Premiers Secours', 3);
  insertSub.run(6, 'Orthopédie', 3);
  insertSub.run(7, 'Vitamines et Tonus', 5);
  insertSub.run(8, 'Phytothérapie', 5);

  // Insert admin user (password: AdminPharma_!2026)
  const hashedPassword = bcryptjs.hashSync('AdminPharma_!2026', 10);
  db.prepare('INSERT INTO utilisateur (nom_utilisateur, email, password, is_admin) VALUES (?, ?, ?, ?)').run(
    'admin_pharma', 'admin@hopital-pharma.fr', hashedPassword, 1
  );

  // Insert conseils — Fiches plantes médicinales (PDFs from lien/ folder)
  const insertConseil = db.prepare('INSERT INTO conseil (titre, contenu, lien, id_sous_categorie) VALUES (?, ?, ?, ?)');

  const plantesConseils = [
    { titre: 'Alchémille', contenu: "L'alchémille est une plante traditionnellement utilisée pour réguler le cycle menstruel et apaiser les douleurs menstruelles. Elle possède également des propriétés astringentes.", lien: '/lien/ALCHEMILLE.pdf', sous_cat: 8 },
    { titre: 'Artichaut', contenu: "L'artichaut est reconnu pour ses bienfaits sur la digestion et le foie. Il favorise la sécrétion de bile et aide à éliminer les toxines.", lien: '/lien/ARTICHAUT.pdf', sous_cat: 2 },
    { titre: 'Astragale', contenu: "L'astragale est une plante adaptogène qui renforce le système immunitaire et aide l'organisme à résister au stress.", lien: '/lien/ASTRAGALE.pdf', sous_cat: 7 },
    { titre: 'Aubépine', contenu: "L'aubépine est la plante du cœur par excellence. Elle aide à réguler le rythme cardiaque et possède des propriétés calmantes.", lien: '/lien/AUBEPINE.pdf', sous_cat: 8 },
    { titre: 'Bardane', contenu: "La bardane est connue pour ses vertus purifiantes. Elle est utilisée pour les problèmes de peau comme l'acné et l'eczéma.", lien: '/lien/BARDANE.pdf', sous_cat: 3 },
    { titre: 'Busserole', contenu: "La busserole est une plante utilisée pour le confort urinaire. Elle possède des propriétés antiseptiques naturelles.", lien: '/lien/BUSSEROLE.pdf', sous_cat: 8 },
    { titre: 'Canneberge', contenu: "La canneberge (cranberry) est reconnue pour prévenir les infections urinaires en empêchant les bactéries d'adhérer aux parois de la vessie.", lien: '/lien/CANNEBERGE.pdf', sous_cat: 8 },
    { titre: 'Cannelle', contenu: "La cannelle est une épice aux propriétés antioxydantes et anti-inflammatoires. Elle aide à réguler la glycémie.", lien: '/lien/CANNELLE.pdf', sous_cat: 2 },
    { titre: 'Caralluma', contenu: "Le caralluma est un coupe-faim naturel utilisé traditionnellement pour aider à la gestion du poids.", lien: '/lien/CARALLUMA.pdf', sous_cat: 7 },
    { titre: 'Cassis', contenu: "Le cassis est un puissant anti-inflammatoire naturel. Ses feuilles sont utilisées pour soulager les douleurs articulaires.", lien: '/lien/CASSIS.pdf', sous_cat: 1 },
    { titre: 'Chardon Marie', contenu: "Le chardon marie est le protecteur du foie par excellence. Il aide à régénérer les cellules hépatiques et à détoxifier l'organisme.", lien: '/lien/CHARDON MARIE.pdf', sous_cat: 2 },
    { titre: 'Chrysanthellum', contenu: "Le chrysanthellum est reconnu pour son action protectrice sur le foie et sa capacité à améliorer la microcirculation.", lien: '/lien/CHRYSANTHELLUM.pdf', sous_cat: 8 },
    { titre: 'Clou de Girofle', contenu: "Le clou de girofle est un puissant antiseptique et analgésique naturel, traditionnellement utilisé pour les douleurs dentaires.", lien: '/lien/CLOU DE GIROFLE.pdf', sous_cat: 4 },
    { titre: 'Curcuma', contenu: "Le curcuma est un anti-inflammatoire et antioxydant majeur. La curcumine qu'il contient aide à soulager les douleurs articulaires.", lien: '/lien/CURCUMA.pdf', sous_cat: 1 },
    { titre: 'Cyprès', contenu: "Le cyprès est utilisé pour améliorer la circulation veineuse et soulager les jambes lourdes.", lien: '/lien/CYPRES.pdf', sous_cat: 8 },
    { titre: 'Desmodium', contenu: "Le desmodium est la plante de référence pour la protection et la régénération du foie.", lien: '/lien/DESMODIUM.pdf', sous_cat: 2 },
    { titre: 'Échinacée', contenu: "L'échinacée stimule les défenses naturelles de l'organisme. Elle est idéale pour prévenir les infections hivernales.", lien: '/lien/ECHINACEE.pdf', sous_cat: 7 },
    { titre: 'Eschscholtzia', contenu: "L'eschscholtzia (pavot de Californie) favorise l'endormissement et améliore la qualité du sommeil de manière naturelle.", lien: '/lien/ESCHSCHOLTZIA.pdf', sous_cat: 8 },
    { titre: 'Fumeterre', contenu: "La fumeterre régule la production de bile et aide à maintenir un bon fonctionnement digestif.", lien: '/lien/FUMETERRE.pdf', sous_cat: 2 },
    { titre: 'Gattilier', contenu: "Le gattilier est la plante de référence pour l'équilibre hormonal féminin. Il aide à réguler le cycle menstruel.", lien: '/lien/GATTILIER.pdf', sous_cat: 8 },
    { titre: 'Gentiane', contenu: "La gentiane est une plante amère qui stimule l'appétit et favorise la digestion.", lien: '/lien/GENTIANE.pdf', sous_cat: 2 },
    { titre: 'Gingembre', contenu: "Le gingembre est reconnu pour ses propriétés anti-nauséeuses. Il aide également à la digestion et possède des vertus anti-inflammatoires.", lien: '/lien/GINGEMBRE.pdf', sous_cat: 2 },
    { titre: 'Ginkgo', contenu: "Le ginkgo biloba améliore la circulation sanguine cérébrale et aide à maintenir une bonne mémoire et concentration.", lien: '/lien/GINKGO.pdf', sous_cat: 7 },
    { titre: 'Ginseng', contenu: "Le ginseng est un adaptogène puissant qui combat la fatigue, stimule l'énergie et renforce les défenses immunitaires.", lien: '/lien/GINSENG.pdf', sous_cat: 7 },
    { titre: 'Grande Camomille', contenu: "La grande camomille est traditionnellement utilisée pour prévenir les migraines et réduire leur fréquence.", lien: '/lien/GRANDE CAMOMILLE.pdf', sous_cat: 1 },
    { titre: 'Griffonia', contenu: "Le griffonia est riche en 5-HTP, un précurseur de la sérotonine. Il aide à améliorer l'humeur et favorise le sommeil.", lien: '/lien/GRIFFONIA.pdf', sous_cat: 8 },
    { titre: 'Guarana', contenu: "Le guarana est un stimulant naturel riche en caféine. Il aide à combattre la fatigue physique et intellectuelle.", lien: '/lien/GUARANA.pdf', sous_cat: 7 },
    { titre: 'Hamamélis', contenu: "L'hamamélis est la plante de la circulation veineuse. Elle tonifie les veines et réduit la sensation de jambes lourdes.", lien: '/lien/HAMAMELIS.pdf', sous_cat: 8 },
    { titre: 'Harpagophytum', contenu: "L'harpagophytum (griffe du diable) est un anti-inflammatoire naturel puissant, utilisé pour les douleurs articulaires et musculaires.", lien: '/lien/HARPAGOPHYTUM.pdf', sous_cat: 1 },
    { titre: 'Houblon', contenu: "Le houblon possède des propriétés sédatives naturelles. Il aide à l'endormissement et à réduire l'anxiété.", lien: '/lien/HOUBLON.pdf', sous_cat: 8 },
    { titre: 'Marjolaine', contenu: "La marjolaine est une plante calmante qui aide à réduire l'anxiété et favorise un sommeil de qualité.", lien: '/lien/MARJOLAINE.pdf', sous_cat: 8 },
    { titre: 'Maté', contenu: "Le maté est une boisson énergisante naturelle, riche en antioxydants, qui stimule la vigilance sans les effets secondaires du café.", lien: '/lien/MATE.pdf', sous_cat: 7 },
    { titre: 'Mélilot', contenu: "Le mélilot favorise la circulation veineuse et lymphatique. Il est utilisé pour soulager les jambes lourdes.", lien: '/lien/MELILOT.pdf', sous_cat: 8 },
    { titre: 'Mélisse', contenu: "La mélisse apaise le stress, l'anxiété et les troubles digestifs d'origine nerveux. Elle favorise la détente.", lien: '/lien/MELISSE.pdf', sous_cat: 2 },
    { titre: 'Millepertuis', contenu: "Le millepertuis est utilisé pour ses effets positifs sur l'humeur et les états dépressifs légers à modérés. Attention aux interactions médicamenteuses.", lien: '/lien/MILLEPERTUIS.pdf', sous_cat: 8 },
    { titre: 'Mucuna', contenu: "Le mucuna est une plante riche en L-Dopa, un précurseur de la dopamine. Il contribue au bien-être mental et à la motivation.", lien: '/lien/MUCUNA.pdf', sous_cat: 8 },
    { titre: 'Noyer', contenu: "Le noyer possède des propriétés astringentes et antiseptiques. Il est utilisé en usage externe pour les affections cutanées.", lien: '/lien/NOYER.pdf', sous_cat: 3 },
    { titre: 'Olivier', contenu: "Les feuilles d'olivier aident à réguler la tension artérielle et le taux de cholestérol. Elles possèdent des vertus antioxydantes.", lien: '/lien/OLIVIER.pdf', sous_cat: 8 },
    { titre: 'Ortie Racine', contenu: "La racine d'ortie est utilisée pour le confort urinaire masculin, notamment en cas d'hypertrophie bénigne de la prostate.", lien: '/lien/ORTIE RACINE.pdf', sous_cat: 8 },
    { titre: 'Passiflore', contenu: "La passiflore est la plante de la relaxation par excellence. Elle réduit l'anxiété et favorise un sommeil paisible.", lien: '/lien/PASSIFLORE.pdf', sous_cat: 8 },
    { titre: 'Pensée Sauvage', contenu: "La pensée sauvage est utilisée pour purifier la peau et aider à traiter l'eczéma, l'acné et d'autres affections cutanées.", lien: '/lien/PENSEE SAUVAGE.pdf', sous_cat: 3 },
    { titre: 'Pervenche', contenu: "La pervenche améliore la circulation cérébrale et aide à maintenir de bonnes fonctions cognitives, notamment la mémoire.", lien: '/lien/PERVENCHE.pdf', sous_cat: 7 },
    { titre: 'Piloselle', contenu: "La piloselle est un puissant draineur rénal. Elle favorise l'élimination de l'eau et aide en cas de rétention d'eau.", lien: '/lien/PILOSELLE.pdf', sous_cat: 8 },
    { titre: 'Pin Sylvestre', contenu: "Le pin sylvestre est utilisé pour dégager les voies respiratoires et soulager la toux.", lien: '/lien/PIN SYLVESTRE.pdf', sous_cat: 1 },
    { titre: 'Pissenlit', contenu: "Le pissenlit est un excellent dépuratif. Il stimule le foie, les reins et favorise l'élimination des toxines.", lien: '/lien/PISSENLIT.pdf', sous_cat: 2 },
    { titre: 'Plantain', contenu: "Le plantain est apaisant pour les voies respiratoires et possède des propriétés anti-inflammatoires et antihistaminiques.", lien: '/lien/PLANTAIN.pdf', sous_cat: 1 },
    { titre: 'Prêle', contenu: "La prêle est riche en silicium. Elle renforce les os, les ongles et les cheveux, et favorise la reminéralisation.", lien: '/lien/PRELE.pdf', sous_cat: 7 },
    { titre: 'Radis Noir', contenu: "Le radis noir est le grand draineur hépatique. Il stimule la production de bile et aide le foie à éliminer les toxines.", lien: '/lien/RADIS NOIR.pdf', sous_cat: 2 },
    { titre: 'Réglisse', contenu: "La réglisse adoucit les voies respiratoires et aide à la digestion. Attention en cas d'hypertension.", lien: '/lien/REGLISSE.pdf', sous_cat: 2 },
    { titre: 'Reine des Prés', contenu: "La reine des prés est un anti-inflammatoire naturel (contient des dérivés salicylés). Elle soulage les douleurs articulaires et musculaires.", lien: '/lien/REINE DES PRES.pdf', sous_cat: 1 },
    { titre: 'Rhodiole', contenu: "La rhodiole est un adaptogène qui aide l'organisme à s'adapter au stress physique et émotionnel, tout en réduisant la fatigue.", lien: '/lien/RHODIOLE.pdf', sous_cat: 7 },
    { titre: 'Romarin', contenu: "Le romarin stimule la digestion, protège le foie et possède des propriétés antioxydantes et tonifiantes.", lien: '/lien/ROMARIN.pdf', sous_cat: 2 },
    { titre: 'Safran', contenu: "Le safran est reconnu pour ses effets positifs sur l'humeur. Il aide à maintenir un bon équilibre émotionnel.", lien: '/lien/SAFRAN.pdf', sous_cat: 8 },
    { titre: 'Saule', contenu: "L'écorce de saule contient de la salicine, un précurseur naturel de l'aspirine. Elle soulage les douleurs et la fièvre.", lien: '/lien/SAULE.pdf', sous_cat: 1 },
    { titre: 'Scrofulaire', contenu: "La scrofulaire est utilisée pour ses propriétés anti-inflammatoires et dépuratives, notamment pour les problèmes de peau.", lien: '/lien/SCROFULAIRE.pdf', sous_cat: 3 },
    { titre: 'Sureau', contenu: "Le sureau est utilisé pour combattre le rhume et la grippe. Il renforce l'immunité et aide à faire baisser la fièvre.", lien: '/lien/SUREAU.pdf', sous_cat: 1 },
    { titre: 'Thym', contenu: "Le thym est un puissant antiseptique des voies respiratoires. Il apaise la toux et aide à combattre les infections ORL.", lien: '/lien/THYM.pdf', sous_cat: 1 },
    { titre: 'Tilleul', contenu: "Le tilleul est une plante aux vertus apaisantes et sédatives. Il favorise le sommeil et aide à réduire le stress.", lien: '/lien/TILLEUL.pdf', sous_cat: 8 },
    { titre: 'Tribulus', contenu: "Le tribulus terrestris est utilisé pour soutenir la vitalité et l'énergie. Il est traditionnellement associé à la performance physique.", lien: '/lien/TRIBULUS.pdf', sous_cat: 7 },
    { titre: 'Valériane', contenu: "La valériane est l'une des plantes les plus connues pour favoriser le sommeil. Elle réduit le temps d'endormissement et améliore la qualité du sommeil.", lien: '/lien/VALERIANE.pdf', sous_cat: 8 },
    { titre: 'Vigne Rouge', contenu: "La vigne rouge est la plante de référence pour la circulation veineuse. Elle tonifie les vaisseaux et soulage les jambes lourdes.", lien: '/lien/VIGNE ROUGE.pdf', sous_cat: 8 },
  ];

  // General health advice
  const conseilsGeneraux = [
    { titre: 'Comment soulager la fièvre ?', contenu: "Découvrez les bons gestes à adopter en cas de fièvre et comment bien utiliser le paracétamol. Boire beaucoup d'eau, ne pas trop se couvrir, et surveiller la température régulièrement.", lien: 'https://www.ameli.fr/assure/sante/themes/fievre', sous_cat: 1 },
    { titre: 'Les bons réflexes pour les plaies superficielles', contenu: "Nettoyage, désinfection et protection : les étapes pour une bonne cicatrisation. Utilisez de l'eau et du savon, puis un antiseptique adapté.", lien: 'https://www.ameli.fr/assure/sante/bons-gestes/soins/soigner-plaie', sous_cat: 5 },
    { titre: 'Bien se brosser les dents', contenu: "Un brossage efficace dure au minimum 2 minutes, 2 fois par jour. Utilisez une brosse à dents souple et du dentifrice fluoré.", lien: 'https://www.ameli.fr/assure/sante/bons-gestes/quotidien/hygiene-bucco-dentaire', sous_cat: 4 },
    { titre: 'Reconnaître une entorse bénigne', contenu: "Douleur, gonflement, difficulté à bouger : voici comment réagir face à une entorse légère et quand consulter un médecin.", lien: 'https://www.ameli.fr/assure/sante/themes/entorse-cheville', sous_cat: 6 },
    { titre: 'Prendre soin de sa peau au quotidien', contenu: "Hydratation, protection solaire, nettoyage doux : les gestes essentiels pour une peau saine et protégée.", lien: 'https://www.ameli.fr/assure/sante/themes/eczema-atopique', sous_cat: 3 },
  ];

  const insertMany = db.transaction(() => {
    for (const c of plantesConseils) {
      insertConseil.run(c.titre, c.contenu, c.lien, c.sous_cat);
    }
    for (const c of conseilsGeneraux) {
      insertConseil.run(c.titre, c.contenu, c.lien, c.sous_cat);
    }
  });

  insertMany();
}

// Run if called directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url).includes(path.basename(process.argv[1]));
if (isMainModule) {
  const db = initDatabase();
  seedDatabase(db);
  console.log('✅ Base de données initialisée et remplie avec succès !');
  db.close();
}

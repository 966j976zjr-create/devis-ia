# Devis IA V1 — Installation sur iPhone, sans Mac ni abonnement

Version : 1.0 (prototype personnel). Le fonctionnement de base ne nécessite aucune API payante.

## Ce que contient cette première version

- Saisie textuelle ou dictée avec le microphone du clavier iOS.
- Reconnaissance locale par règles métier (CAVI, contrôle d’accès, intrusion, SSI) ; **ce n'est pas un modèle d'IA générative**.
- Catalogue d'exemple de 19 références fictives, modifiable et importable en CSV.
- Édition de devis, calcul achat / vente / pose / marge / HT / TVA / TTC.
- Devis sauvegardés **localement sur l’iPhone** dans le stockage de l’application web.
- Impression de devis avec possibilité d’enregistrer le document en PDF via iOS.
- Liaison facultative à un Raccourci Apple utilisant le modèle IA « Sur l'appareil ».
- Aucun serveur de devis, aucun compte client, aucun suivi d'utilisation, aucun abonnement requis.

## 1. Installer gratuitement l'application depuis l'iPhone

La procédure fiable consiste à publier le code statique sur GitHub Pages : **le code de l'application sera public**, mais **les devis et les catalogues importés dans l'application ne sont jamais envoyés sur GitHub**.

1. Télécharge le paquet `DevisIA_V1_site.zip` sur l'iPhone et retrouve-le dans **Fichiers > Téléchargements**.
2. Dans Fichiers, touche le ZIP pour le décompresser. Ouvre le dossier obtenu ; ses fichiers doivent être à la racine du futur dépôt GitHub.
3. Depuis Safari sur l'iPhone, crée un compte gratuit sur <https://github.com> si tu n'en as pas.
4. Va sur <https://github.com/new> et crée un dépôt appelé `devis-ia` avec visibilité **Public** (nécessaire pour utiliser GitHub Pages gratuitement). Initialise-le éventuellement avec un README.
5. Dans le dépôt, touche **Add file > Upload files**. Sélectionne **tous les fichiers du site** depuis Fichiers (notamment `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js` et les images d'icône), puis confirme par **Commit changes**. Si le menu est difficile à atteindre depuis iOS, dans Safari demande **Version pour ordinateur**.
6. Dans ton dépôt GitHub, ouvre **Settings > Pages**. Sous **Build and deployment**, choisis **Deploy from a branch** ; branche **main**, répertoire **/(root)**, puis **Save**.
7. Attends la première publication (elle peut prendre quelques minutes). L'adresse du site est de la forme : `https://TON-PSEUDO.github.io/devis-ia/`.
8. Ouvre cette adresse dans **Safari** de ton iPhone. Touche **Partager > Sur l'écran d'accueil**, puis, si l'option apparaît, active **Ouvrir comme app web** et touche **Ajouter**.
9. Utilise désormais l'icône **Devis IA** de l'écran d'accueil. Le service worker permet l'usage hors ligne après chargement initial complet.

**Important :** n'ajoute jamais des données de clients, une grille de prix confidentielle ou des sauvegardes réelles au dépôt GitHub public. L'import de catalogues se fait uniquement dans l'application installée.

## 2. Premier test (2 minutes)

1. Ouvre l'onglet **Nouveau**.
2. Touche **Utiliser un exemple** puis **Analyser le besoin et créer le devis**.
3. Le devis propose : 4 caméras extérieures, 8 caméras non qualifiées, un NVR, 2 postes de visualisation, un switch PoE et un poste de stockage. Les équipements non explicitement décrits sont marqués **Proposition à confirmer**.
4. Modifie une quantité et constate la mise à jour des totaux.
5. Dans l'onglet **Devis**, renseigne un client puis touche **Enregistrer dans l'historique**.
6. Touche **Exporter en PDF / Imprimer**. Dans la feuille d'impression iOS, ouvre l'aperçu imprimable en PDF (agrandis-le à deux doigts si nécessaire), puis utilise **Partager > Enregistrer dans Fichiers**. Les menus peuvent varier selon la version d'iOS.
7. Dans **Réglages**, exporte une sauvegarde JSON pour éviter toute perte de données.

**Attention : les 19 références, leurs coûts, prix et temps de pose sont FICTIFS. Ne pas envoyer le PDF issu de cet exemple à un client.**

## 3. Importer tes propres tarifs (CSV)

Dans l’onglet **Catalogue > Modèle CSV vide** tu peux récupérer le format requis :

```csv
code;famille;designation;unite;prix_achat_ht;prix_vente_ht;temps_pose_h
CAM-IP-EXT-01;Vidéosurveillance;Caméra IP extérieure;u;200;330;2
```

Les nombres et références de cet exemple sont fictifs. Modifie le fichier avec l'outil de ton choix, puis utilise **Importer CSV**. L’import ajoute ou remplace par code. Tu peux supprimer les articles de démonstration après avoir importé des références adaptées.

La reconnaissance métier fonctionne avec le catalogue de démo et cherche aussi les articles réels par désignation. Si plusieurs références semblent correspondre, la V1 demande une sélection manuelle plutôt que de choisir un matériel arbitrairement.

## 4. Option : ajouter la compréhension IA gratuite via Raccourcis

*Cette option est indépendante de la V1 de base et nécessite que le modèle Apple Intelligence « Sur l'appareil » soit disponible dans Raccourcis sur ton iPhone.*

### Créer le raccourci une seule fois

1. Ouvre **Raccourcis** sur l’iPhone et crée un nouveau raccourci nommé **`Devis IA - Analyse`** (respecte exactement les espaces et le tiret).
2. Ajoute l'action **Obtenir le presse-papiers**.
3. Ajoute l'action **Utiliser le modèle** (ou son intitulé équivalent selon iOS). Sélectionne le modèle **Sur l’appareil**.
4. Dans le champ de demande du modèle, insère la variable renvoyée par **Obtenir le presse-papiers** : le contenu contient déjà toutes les instructions, le besoin et la liste des codes articles.
5. Ajoute l'action **Copier dans le presse-papiers** et choisis comme contenu la **Réponse** du modèle.
6. Facultativement, ajoute **Afficher une notification** avec « Réponse Devis IA prête à coller ».
7. Exécute une fois le raccourci depuis Raccourcis pour valider l'autorisation du presse-papiers.

### Utilisation

1. Dans Devis IA > **Nouveau**, saisis un besoin.
2. Touche **1 · Copier la demande pour Apple Intelligence**.
3. Touche **2 · Lancer « Devis IA - Analyse » dans Raccourcis** ; si l'URL n’ouvre pas l’app, ouvre manuellement Raccourcis et lance-le.
4. Après exécution, reviens dans Devis IA. Touche **Coller le presse-papiers** (ou colle manuellement avec un appui long) puis **Importer les lignes IA**.
5. Vérifie chaque référence, quantité, question et temps de pose. Les références absentes du catalogue sont rejetées.

Le moteur Apple peut se tromper ou ne pas retourner un JSON valide. En cas d’erreur, retente ou utilise l'analyse locale. La V1 n'envoie aucune demande à une API externe ; le raccourci utilise exclusivement le modèle **Sur l'appareil** si tu le sélectionnes.

## 5. Sauvegardes et limites

- **Sauvegarde :** dans Réglages > Télécharger la sauvegarde JSON. À refaire régulièrement et avant toute mise à jour.
- **Restauration :** Réglages > Restaurer une sauvegarde JSON.
- **Stockage :** les données ne sont ni sauvegardées sur iCloud par cette application, ni synchronisées entre Safari et l’app installée ; utiliser le même accès et sauvegarder.
- **Hors ligne :** fonctionne après première visite complète et installation de la web app. Certains accès iOS au presse-papiers ou à Raccourcis peuvent demander des permissions.
- **Confidentialité :** les données sont locales, mais accessibles à quiconque détient l'accès à l'iPhone déverrouillé ; il ne s'agit pas d'un coffre-fort de données sensibles.
- **Chiffrage :** les calculs sont locaux et automatiques, mais la V1 ne dimensionne pas les réseaux, les enregistrements, les ouvrages ni la conformité SSI.
- **PDF :** le document est produit par le dialogue d'impression iOS ; ce n’est pas un générateur PDF serveur.
- **Hébergement :** GitHub Pages est gratuit pour un dépôt public selon les conditions actuelles de GitHub ; des modifications de conditions ou de fonctionnalités sont possibles.

## 6. Fichiers à publier à la racine GitHub Pages

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`

Pas de compilation, pas de Node.js, pas de Mac, pas de clé API.

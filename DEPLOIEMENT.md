# Guide de déploiement — FTK Merch

Stack : React/Vite (Vercel) + Node/Express + PostgreSQL (Railway)

---

## Étape 1 — Préparer le repo Git

Si ce n'est pas encore fait, initialisez un repo Git et poussez sur GitHub.

```bash
# À la racine du projet
git init
git add .
git commit -m "initial commit"
```

Créez un repo sur github.com, puis :

```bash
git remote add origin https://github.com/VOUS/ftk-merch.git
git push -u origin main
```

**Important** : vérifiez que `.env` ne figure PAS dans git :
```bash
git status   # .env ne doit pas apparaître
```

---

## Étape 2 — Railway (Backend + Base de données)

### 2a. Créer le projet

1. Allez sur [railway.app](https://railway.app) → **New Project**
2. **Add PostgreSQL** → Railway crée une base, notez la `DATABASE_URL` (onglet Variables)

"postgresql://postgres:OzaAOdHfgyiDsJqcKkeLgIEvmTnrWzws@postgres.railway.internal:5432/railway"

### 2b. Importer le schéma

Dans Railway → PostgreSQL → **Query** (ou connectez-vous avec psql) :

Collez le contenu de `backend/migrations/schema.sql` et exécutez.

```bash
# Alternative avec psql local (remplacez DATABASE_URL par la valeur Railway)
psql "postgresql://..." -f backend/migrations/schema.sql
```

### 2c. Déployer le backend

1. Railway → **New Service** → **GitHub Repo**
2. Sélectionnez votre repo, **Root Directory** = `backend`
3. Railway détecte Node.js automatiquement
4. Le `npm start` lance `migrate.js` puis `server.js` ✅

### 2d. Variables d'environnement Railway (backend)

Dans Railway → votre service backend → **Variables** :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Copiez depuis le service PostgreSQL Railway |
| `JWT_SECRET` | Une chaîne aléatoire longue (ex: `openssl rand -base64 48`) |
| `FRONTEND_URL` | L'URL Vercel (à compléter après l'étape 3) |
| `STRIPE_SECRET_KEY` | Votre clé **live** Stripe : `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Créé à l'étape 4 |
| `PORT` | Laissez vide (Railway l'injecte automatiquement) |

Notez l'URL publique de votre backend Railway (ex: `https://ftk-merch-backend.railway.app`).

---

## Étape 3 — Vercel (Frontend)

1. Allez sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importez votre repo GitHub, **Root Directory** = `frontend`
3. Framework : **Vite** (détecté automatiquement)
4. **Environment Variables** :

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | `https://ftk-merch-backend.railway.app/api` |

5. Cliquez **Deploy** → notez votre URL Vercel

6. **Retournez sur Railway** → mettez à jour `FRONTEND_URL` avec l'URL Vercel.

Le fichier `frontend/vercel.json` gère automatiquement le routing React (toutes les URLs → `index.html`).

---

## Étape 4 — Stripe Webhooks en production

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com) → **Développeurs** → **Webhooks**
2. **Ajouter un endpoint** :
   - URL : `https://ftk-merch-backend.railway.app/api/payments/webhook`
   - Événements à écouter : `checkout.session.completed`
3. Copiez le **Signing secret** (`whsec_...`)
4. Mettez à jour `STRIPE_WEBHOOK_SECRET` sur Railway

---

## Étape 5 — Passer en mode Stripe Live

Stripe a deux modes : **Test** (sk_test_...) et **Live** (sk_live_...).

1. Sur dashboard.stripe.com, désactivez **Mode test** (bouton en haut à droite)
2. Dans **Développeurs → Clés API** → copiez `sk_live_...`
3. Mettez à jour `STRIPE_SECRET_KEY` sur Railway avec la clé live
4. Recréez le webhook en mode live (étape 4) → nouveau `STRIPE_WEBHOOK_SECRET`

---

## Étape 6 — Générer un JWT_SECRET sécurisé

```bash
# Dans un terminal (Git Bash, PowerShell, ou terminal en ligne Railway)
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Utilisez la valeur générée comme `JWT_SECRET` sur Railway.

---

## Vérification finale

- [ ] Frontend accessible sur votre URL Vercel
- [ ] Login / inscription fonctionnels
- [ ] Produits affichés (API Railway répond)
- [ ] Paiement Stripe complet (mode live)
- [ ] Commande bien enregistrée après paiement (webhook OK)
- [ ] Admin accessible (`/admin`)

---

## En cas de problème

- **Logs backend** : Railway → votre service → onglet **Logs**
- **CORS error** : vérifiez que `FRONTEND_URL` sur Railway correspond exactement à l'URL Vercel
- **Webhook 400** : vérifiez `STRIPE_WEBHOOK_SECRET` (doit correspondre au endpoint Stripe live)
- **Base de données** : vérifiez que le schéma a bien été importé (Railway → PostgreSQL → Query)

# 🌸 CycleTracker — Backend API

Backend Express.js pour l'application de suivi de cycle menstruel.  
Compatible **React JS (web)** et **React Native (mobile)** — même API pour les deux.

---

## 📁 Structure des dossiers

```
backend/
│
├── server.js              ← Point d'entrée : démarre tout (connexion BDD, cron, serveur)
├── app.js                 ← Configuration Express (middlewares, routes, erreurs)
├── package.json           ← Dépendances npm du projet
├── .env.example           ← Modèle des variables d'environnement (à copier en .env)
├── .sequelizerc           ← Config de l'outil CLI Sequelize
├── .gitignore             ← Fichiers à exclure de Git
│
├── config/
│   └── database.js        ← Configuration MySQL (dev / test / production)
│
├── models/
│   ├── index.js           ← Initialise Sequelize + toutes les associations
│   ├── User.js            ← Table "users" : comptes des utilisatrices
│   ├── Cycle.js           ← Table "cycles" : règles enregistrées
│   ├── Prediction.js      ← Table "predictions" : prévisions calculées
│   ├── Symptom.js         ← Table "symptoms" : carnet de bord quotidien
│   ├── PartnerShare.js    ← Table "partner_shares" : partage avec partenaire
│   └── Notification.js   ← Table "notifications" : rappels et alertes
│
├── controllers/
│   ├── authController.js      ← Inscription, connexion, profil
│   ├── cycleController.js     ← CRUD cycles + tableau de bord
│   ├── symptomController.js   ← CRUD symptômes
│   ├── statsController.js     ← Statistiques, calendrier, historique
│   ├── partnerController.js   ← Invitation et accès partenaire
│   └── notificationController.js ← Notifications utilisateur
│
├── routes/
│   ├── authRoutes.js          ← /api/v1/auth/*
│   ├── cycleRoutes.js         ← /api/v1/cycles/*
│   ├── symptomRoutes.js       ← /api/v1/symptoms/*
│   ├── statsRoutes.js         ← /api/v1/stats/*
│   ├── partnerRoutes.js       ← /api/v1/partner/*
│   └── notificationRoutes.js  ← /api/v1/notifications/*
│
├── middleware/
│   ├── authMiddleware.js       ← Vérification du token JWT
│   ├── errorMiddleware.js      ← Gestion centralisée des erreurs
│   └── validationMiddleware.js ← Validation des données (express-validator)
│
├── services/
│   ├── predictionService.js    ← Algorithme de prédiction du cycle
│   ├── emailService.js         ← Envoi d'emails (Nodemailer)
│   └── cronService.js          ← Tâches planifiées (rappels automatiques)
│
├── migrations/
│   ├── 001-create-users.js           ← Crée la table users
│   └── 002-create-remaining-tables.js ← Crée les 5 autres tables
│
├── seeders/
│   └── 001-demo-user.js        ← Données de test (utilisatrice Miora)
│
└── utils/
    └── logger.js               ← Système de logs colorés (dev) / JSON (prod)
```

---

## 🚀 Installation et démarrage

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-repo>
cd backend
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
# Éditez .env et remplissez vos vraies valeurs
```

### 3. Créer la base de données MySQL

```sql
-- Dans MySQL Workbench ou le terminal MySQL :
CREATE DATABASE cycle_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Appliquer les migrations

```bash
npx sequelize-cli db:migrate
```

### 5. (Optionnel) Insérer les données de test

```bash
npx sequelize-cli db:seed:all
# Compte de test : miora.test@cycletracker.mg / Test1234!
```

### 6. Démarrer le serveur

```bash
npm run dev     # Mode développement (avec rechargement automatique)
npm start       # Mode production
```

---

## 📡 Routes de l'API

### Authentification (`/api/v1/auth`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/register` | Créer un compte | Non |
| POST | `/login` | Se connecter | Non |
| GET | `/me` | Voir son profil | Oui |
| PUT | `/me` | Modifier son profil | Oui |
| POST | `/forgot-password` | Demander un reset MDP | Non |
| POST | `/reset-password/:token` | Réinitialiser le MDP | Non |
| POST | `/change-password` | Changer son MDP | Oui |

### Cycles (`/api/v1/cycles`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/dashboard` | Données du tableau de bord | Oui |
| GET | `/predictions` | Prédictions futures | Oui |
| GET | `/` | Lister ses cycles | Oui |
| POST | `/` | Enregistrer un cycle | Oui |
| GET | `/:id` | Détail d'un cycle | Oui |
| PUT | `/:id` | Modifier un cycle | Oui |
| DELETE | `/:id` | Supprimer un cycle | Oui |

### Symptômes (`/api/v1/symptoms`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Symptômes sur une période | Oui |
| POST | `/` | Ajouter un symptôme | Oui |
| GET | `/date/:date` | Symptômes d'un jour | Oui |
| PUT | `/:id` | Modifier un symptôme | Oui |
| DELETE | `/:id` | Supprimer un symptôme | Oui |

### Statistiques (`/api/v1/stats`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/overview` | Vue globale des statistiques | Oui |
| GET | `/calendar/:year/:month` | Calendrier mensuel annoté | Oui |
| GET | `/cycles-history` | Historique pour graphiques | Oui |

---

## 🔐 Authentification

Toutes les routes protégées nécessitent un header :

```
Authorization: Bearer <votre_token_jwt>
```

Le token est reçu lors du login et dure 7 jours.

---

## 🔁 Réutilisation pour React Native

Le backend est identique pour le web et le mobile.  
Dans React Native, utilisez Axios exactement comme dans React JS :

```javascript
// services/api.js (partageable entre web et mobile)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Mobile
// ou localStorage pour le web

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token'); // Mobile
  // const token = localStorage.getItem('token');   // Web
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```
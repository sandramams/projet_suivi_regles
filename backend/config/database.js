// ============================================================
// FICHIER : config/database.js
// RÔLE    : Configuration de la connexion Sequelize → MySQL.
//           Sequelize est l'ORM (Object-Relational Mapper) qui
//           permet d'écrire du JavaScript au lieu de SQL brut.
//           Ce fichier est aussi lu par sequelize-cli pour les migrations.
// ============================================================

require('dotenv').config();

module.exports = {
  // Configuration pour le développement local
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cycle_tracker_db',
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    dialect:  'mysql',            // On utilise MySQL

    // Pool de connexions : évite d'ouvrir une nouvelle connexion à chaque requête
    pool: {
      max: 10,     // Maximum 10 connexions simultanées
      min: 0,      // Minimum 0 connexion inactive
      acquire: 30000, // Attendre max 30s pour obtenir une connexion
      idle: 10000,    // Fermer une connexion inactive après 10s
    },

    // Désactive les logs SQL en dev (mettre true pour déboguer les requêtes)
    logging: false,

    define: {
      // Ajoute automatiquement createdAt et updatedAt à tous les modèles
      timestamps: true,
      // Noms de colonnes en snake_case dans MySQL (ex: created_at)
      underscored: true,
      // Ne modifie pas automatiquement le nom de la table (ex: Users → users)
      freezeTableName: true,
    },
  },

  // Configuration pour les tests automatisés
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME + '_test' || 'cycle_tracker_test',
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    dialect:  'mysql',
    logging:  false,
    define:   { timestamps: true, underscored: true, freezeTableName: true },
  },

  // Configuration pour la production (serveur en ligne)
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 3306,
    dialect:  'mysql',
    logging:  false,
    pool: { max: 20, min: 2, acquire: 60000, idle: 10000 },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Adapter selon le fournisseur cloud MySQL
      },
    },
    define: { timestamps: true, underscored: true, freezeTableName: true },
  },
};
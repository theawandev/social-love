// backend/src/config/constants.js
const { sequelize, connectDB } = require('./database');
const redis = require('./redis');
const passport = require('./passport');

module.exports = {
  database: { sequelize, connectDB },
  redis,
  passport
};




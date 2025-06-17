// backend/src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    { expiresIn: '7d' }
  );
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const createUser = async (userData) => {
  const { username, email, password, googleId, firstName, lastName, profileImage } = userData;

  let passwordHash = null;
  if (password) {
    passwordHash = await hashPassword(password);
  }

  return await User.create({
    username,
    email,
    password_hash: passwordHash,
    google_id: googleId,
    first_name: firstName,
    last_name: lastName,
    profile_image: profileImage
  });
};

const findUserByEmail = async (email) => {
  return await User.findOne({
    where: { email, is_active: true }
  });
};

const findUserByGoogleId = async (googleId) => {
  return await User.findOne({
    where: { google_id: googleId, is_active: true }
  });
};

const findUserById = async (id) => {
  return await User.findByPk(id, {
    where: { is_active: true }
  });
};

const checkUserExists = async (username, email) => {
  const existingUser = await User.findOne({
    where: {
      $or: [{ username }, { email }],
      is_active: true
    }
  });

  return !!existingUser;
};

module.exports = {
  generateToken,
  hashPassword,
  verifyPassword,
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  checkUserExists
};












const bcrypt = require('bcrypt');
const { getCollection } = require('../db');
const { ObjectId } = require('mongodb');

class User {
  constructor(data) {
    this.id = data._id ? data._id.toString() : null;
    this.name = data.name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role || 'user';
    this.is_verified = data.is_verified || false;
    this.last_login = data.last_login || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Create a new user with hashed password
   * @param {Object} userData - User data { name, email, password, role? }
   * @returns {Promise<User>}
   */
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;

    // Validate required fields
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user document
    const now = new Date();
    const userDoc = {
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      is_verified: false,
      last_login: null,
      created_at: now,
      updated_at: now
    };

    const collection = await getCollection('users');
    const result = await collection.insertOne(userDoc);

    return new User({ ...userDoc, _id: result.insertedId });
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  static async findByEmail(email) {
    const collection = await getCollection('users');
    const userDoc = await collection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    return userDoc ? new User(userDoc) : null;
  }

  /**
   * Find user by ID
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  static async findById(id) {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const collection = await getCollection('users');
    const userDoc = await collection.findOne({ 
      _id: new ObjectId(id) 
    });
    
    return userDoc ? new User(userDoc) : null;
  }

  /**
   * Verify password
   * @param {string} password - Plain text password
   * @returns {Promise<boolean>}
   */
  async verifyPassword(password) {
    if (!this.password_hash) {
      return false;
    }
    return await bcrypt.compare(password, this.password_hash);
  }

  /**
   * Update user fields
   * @param {Object} updates - Fields to update
   * @returns {Promise<User>}
   */
  async update(updates) {
    if (!this.id) {
      throw new Error('Cannot update user without ID');
    }

    // Don't allow updating password_hash directly (use changePassword method)
    const { password_hash, ...safeUpdates } = updates;
    
    const updateDoc = {
      ...safeUpdates,
      updated_at: new Date()
    };

    const collection = await getCollection('users');
    await collection.updateOne(
      { _id: new ObjectId(this.id) },
      { $set: updateDoc }
    );

    // Update local instance
    Object.assign(this, updateDoc);
    return this;
  }

  /**
   * Change user password
   * @param {string} newPassword - New plain text password
   * @returns {Promise<User>}
   */
  async changePassword(newPassword) {
    if (!this.id) {
      throw new Error('Cannot change password without ID');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    return await this.update({ password_hash });
  }

  /**
   * Update last login timestamp
   * @returns {Promise<User>}
   */
  async updateLastLogin() {
    return await this.update({ last_login: new Date() });
  }

  /**
   * Convert user to JSON (exclude password_hash)
   * @returns {Object}
   */
  toJSON() {
    const { password_hash, ...user } = this;
    return user;
  }

  /**
   * Convert user to safe object for API responses
   * @returns {Object}
   */
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      is_verified: this.is_verified,
      created_at: this.created_at,
      last_login: this.last_login
    };
  }
}

module.exports = { User };


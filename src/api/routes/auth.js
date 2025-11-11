const router = require('express').Router();
const { User } = require('../../models');

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: at least 8 characters
 */
function isValidPassword(password) {
  return password && password.length >= 8;
}

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Body: {
 *   name: string (required),
 *   email: string (required, valid email),
 *   password: string (required, min 8 characters),
 *   role: string (optional, defaults to 'user')
 * }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Name, email, and password are required'
      });
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid name',
        details: 'Name must be at least 2 characters long'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        details: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: 'Invalid password',
        details: 'Password must be at least 8 characters long'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role: role || 'user'
    });

    // Return user data (without password_hash)
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Email already registered',
        details: 'An account with this email already exists'
      });
    }

    // Handle other errors
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (placeholder for when auth middleware is added)
 */
router.get('/me', async (req, res) => {
  // TODO: Implement authentication middleware
  res.status(501).json({
    error: 'Not implemented',
    details: 'Authentication middleware required'
  });
});

module.exports = router;


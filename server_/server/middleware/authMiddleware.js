import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    if (req.originalUrl && req.originalUrl.includes('/file')) {
      console.log('[PDF VIEW] Authentication failed: Missing token in header or query');
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'collegeai_super_secret_jwt_key_2026_nxtwave'
    );

    const userId = decoded.userId || decoded.id;
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      if (req.originalUrl && req.originalUrl.includes('/file')) {
        console.log('[PDF VIEW] Authentication failed: User not found in database');
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    return next();
  } catch (error) {
    if (req.originalUrl && req.originalUrl.includes('/file')) {
      console.log(`[PDF VIEW] Authentication failed: ${error.message}`);
    }
    console.error('[AuthMiddleware] Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'collegeai_super_secret_jwt_key_2026_nxtwave',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

export default generateToken;

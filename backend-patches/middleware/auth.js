const jwt = require('jsonwebtoken');
const { prisma, isDemoMode } = require('../prismaClient');
const { isSessionRevoked, touchSession } = require('../services/sessionRegistry.service');
const { getTokenFromRequest } = require('../utils/authCookies');

const auth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const segments = String(token).split('.');
    if (segments.length !== 3) {
      return res.status(401).json({ error: 'Token is not a valid JWT' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.jti && isSessionRevoked(decoded.jti)) {
      return res.status(401).json({ error: 'Session révoquée. Reconnectez-vous.' });
    }

    if (typeof decoded.id === 'string' && decoded.id.startsWith('demo_')) {
      if (!isDemoMode()) {
        return res.status(401).json({ error: 'Session démo non autorisée en production.' });
      }
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        jti: decoded.jti || null,
      };
      if (decoded.jti) touchSession(decoded.jti);
      return next();
    }

    if (isDemoMode()) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        jti: decoded.jti || null,
      };
      if (decoded.jti) touchSession(decoded.jti);
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    req.user = user;
    req.user.jti = decoded.jti || null;
    if (decoded.jti) touchSession(decoded.jti);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
};

const isVetOrAdmin = (req) => {
  const role = req.user?.role;
  return role === 'admin' || role === 'vet';
};

const vetAuth = (req, res, next) => {
  if (!req.user || !isVetOrAdmin(req)) {
    return res.status(403).json({ error: 'Veterinarian role required' });
  }
  next();
};

const livreurAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'livreur') {
    return res.status(403).json({ error: 'Livreur role required' });
  }
  next();
};

const adminOrLivreurAuth = (req, res, next) => {
  if (!req.user || !['admin', 'livreur'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin or livreur role required' });
  }
  next();
};

const vendorAuth = (req, res, next) => {
  if (!req.user || !['vendor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Vendor role required' });
  }
  next();
};

const moderatorAuth = (req, res, next) => {
  if (!req.user || !['moderator', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Moderator role required' });
  }
  next();
};

module.exports = {
  auth,
  adminAuth,
  vetAuth,
  livreurAuth,
  adminOrLivreurAuth,
  vendorAuth,
  moderatorAuth,
  isVetOrAdmin,
};

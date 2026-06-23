/**
 * Patch CI — backend-petfood référence ce module sans le committer.
 * Copié vers backend/utils/jwtTokens.js par .github/actions/patch-backend-ci
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const jwtOptions = () => ({
  issuer: process.env.JWT_ISSUER || undefined,
  audience: process.env.JWT_AUDIENCE || undefined,
});

const signAccessToken = (payload) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { ...payload, jti },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      ...jwtOptions(),
    }
  );
  return { token, jti };
};

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    ...jwtOptions(),
  });

module.exports = {
  signAccessToken,
  verifyAccessToken,
};

const HTTP_CODES = require('../utils/HTTP_CODES');

module.exports = (allowedRoles) => async (req, _, next) => {
  if (req.user && allowedRoles.includes(req.user.role)) return next();
  const err = new Error('Forbidden');
  err.status = HTTP_CODES.FORBIDDEN;
  return next(err);
};

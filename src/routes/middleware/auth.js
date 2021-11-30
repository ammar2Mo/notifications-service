const HTTP_CODES = require('../utils/HTTP_CODES');

module.exports = ({ }) => ({
  async checkToken(req, res, next) {
    // for monitoring purposes
    res.setHeader('x-env', process.env.NODE_ENV); 

    return next();
  },
});

const express = require('express');
const Joi = require('@hapi/joi');
const validate = require('../utils/validate');
const { userRoles } = require('../models/enums');
const HTTP_CODES = require('./utils/HTTP_CODES');
const permit = require('./middleware/permission');
const { phone } = require('./utils/commonValidations');

Joi.objectId = require('joi-objectid')(Joi);

module.exports = (service) => {
  const router = express.Router();
  router
    .post('/', permit(['ADMIN', 'CUSTOMER_SUPPORT']), async (req, res, next) => {
      const paramsSchema = Joi.object({
        body: Joi.object({
          contents: Joi.object({
            en: Joi.string(),
            ar: Joi.string(),
          }).or('en', 'ar').required(),
          headings: Joi.object({
            en: Joi.string(),
            ar: Joi.string(),
          }).or('en', 'ar').required(),
          photoUrl: Joi.string().uri(),
          redirectionUrl: Joi.string().uri(),
        }).required(),
        roles: Joi.array().min(1).items(Joi.string().valid(...userRoles.filter((role) => role !== 'GUEST'))),
        phones: Joi.array().min(1).items(phone).unique(),
      });
      try {
        const notification = await validate(req.body, paramsSchema);
        const result = await service.notifyUsers(notification);
        return res.status(HTTP_CODES.CREATED).send({ data: { matchingUsers: result } });
      } catch (error) {
        return next(error);
      }
    });
  return router;
};

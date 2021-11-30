/* eslint-disable global-require */
const dataShapeUtil = require('./utils/dataShape')();


const userModel = require('./models/user')({});
const notificationModel = require('./models/notification')({ User: userModel });


module.exports = (config) => () => {
  
  const notificationsUtil = require('./utils/notification')(config.onesignal);

  // will solve this by pub/sub puttern
  const notificationService = require('./services/notification')({ Model: notificationModel, userModel, notificationsUtil, redisClient, config, requestModel, dataShapeUtil });

  const authMiddleware = require('./routes/middleware/auth')({ jwt, userService });
  const notificationRoutes = require('./routes/notification')(notificationService);
  
  const container = {
    userModel,
    notificationsUtil,
    notificationModel,
    notificationService,
    notificationRoutes,
    authMiddleware,
    config,
    dataShapeUtil,
  };
  return container;
};

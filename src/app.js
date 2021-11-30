const express = require('express');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const newrelic = require('newrelic');
const permit = require('./routes/middleware/permission');

const { mongo } = require('./db');
const swaggerDocument = require('./routes/docs.json');

module.exports = async function initApp(deps) {
  const {
    authMiddleware,
    districtRoutes,
    cityRoutes,
    userRoutes,
    requestRoutes,
    notificationRoutes,
    roomRoutes,
    smsRoutes,
    config,
    fileRoutes,
    adRoutes,
    couponRoutes,
    crons,
    redisClient,
    requestModel,
    notificationService,
    paymentRoutes,
    targetedUsersRoutes,
    subscriptionPackageRoute,

  } = deps;
  const cronInstance = crons.instance(redisClient);
  try {
    await mongo(config.db.uri);
    await cronInstance.set();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
  if (config.runCrons) {
    const task = crons.notifications({ instance: cronInstance, requestModel, notificationService });
    task.start();
    // eslint-disable-next-line no-console
    console.info(__filename, 'Notification task scheduled @', task.nextDates().toString());
  }
  app.use((req, res, next) => {
    if (req.url.includes('/api')) req.url = req.url.replace(/\/api/gi, '');
    next();
  });
  app.use(compression());
  app.use(cors({ exposedHeaders: ['authorization'] }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  // eslint-disable-next-line no-unused-vars
  app.use('/', express.Router().get('/', (req, res, next) => res.status(200).end()));
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
  } else if (process.env.NODE_ENV === 'development' && config.env !== 'test') {
    app.use(morgan('dev'));
  }
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(authMiddleware.checkToken);
  app.use('/city', cityRoutes);
  app.use('/district', districtRoutes);
  app.use('/user', userRoutes);
  app.use('/request', requestRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/rooms', roomRoutes);
  app.use('/file', fileRoutes);
  app.use('/admin', permit(['ADMIN', 'CUSTOMER_SUPPORT']), smsRoutes);
  app.use('/ad', adRoutes);
  app.use('/coupon', couponRoutes);
  app.use('/payment', paymentRoutes);
  app.use('/targeted-users', targetedUsersRoutes);
  app.use('/subscribe-package', subscriptionPackageRoute);

  /* please don't remove next param it's used by the error handling lib
   * it's consumed 4 hours debugging
   */
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (!err.status && err.message !== 'validation Failed') {
    // eslint-disable-next-line no-console
      console.error(err);
    }
    let { message } = err;
    if (message === 'validation Failed' && err.info) {
      message = Object.values(err.info).join(', ');
      // eslint-disable-next-line no-param-reassign
      err.status = 400;
    }
    const resBody = { error: { message: message.replace(/["]+/g, '') } };
    const reqBody = {};
    Object.keys(req.body).forEach((key) => {
      reqBody[`request.body.${key}`] = JSON.stringify(req.body[key]);
    });
    newrelic.addCustomAttributes({
      ...reqBody,
      'res.body': JSON.stringify(resBody),
    });
    res.status(err.status || 500).json(resBody);
  });

  return app;
};

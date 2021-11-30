const _ = require('lodash');

const config = {
  development: {
    app: { port: Number(process.env.APP_PORT, 10) || 5000 },

    db: { uri: process.env.MONGODB_URI },

    jwt: { secret: process.env.JWT_SECRET },

    onesignal: {
      apiKey: process.env.ONE_SIGNAL_API_KEY,
      appId: process.env.ONE_SIGNAL_APP_ID,
    },
  },

  test: {
    db: { uri: `${process.env.MONGODB_HOST}:27017/test_notifications` },
    env: 'test',
  },
  staging: { },
  production: { },
};

module.exports = (env = 'development') => _.merge(config.development, config[env]);

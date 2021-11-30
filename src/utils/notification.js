/* eslint-disable no-console */
const OneSignal = require('onesignal-node');

module.exports = (config) => {
  const client = new OneSignal.Client(config.appId, config.apiKey);
  return {
    send: async (playerIds, data = {}) => {
      const {
        contents
      } = data;
      let params = {
        contents,
      };
      try {
        if (playerIds.length) {
          if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
            console.info(__filename, 'sending notification request to onesignal', params);
            const response = await client.createNotification(params);
            console.info(__filename, 'one signal response', response);
            return response;
          }
        }
      } catch (error) {
        console.error(__filename, 'Onesignal error', JSON.stringify(error, null, 2));
      }
      return false;
    },
  };
};

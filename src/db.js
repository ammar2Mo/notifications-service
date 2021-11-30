/* eslint-disable no-console */
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const redis = require('redis');

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

module.exports = {
  mongo: (uri) => new Promise((resolve, reject) => mongoose.connect(uri, {
    useNewUrlParser: true,
    autoIndex: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    poolSize: 100,
    useFindAndModify: false,
  }, (err, instance) => (err ? reject(err) : resolve(instance)))),
};

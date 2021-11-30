const request = require('supertest');

const httpRequest = (server) => (route, verb, auth, data, statusCode) => (
  auth ? request(server)[verb](route)
    .set('Authorization', auth)[verb === 'get' ? 'query' : 'send'](data)
    .expect(statusCode)
    : request(server)[verb](route)[verb === 'get' ? 'query' : 'send'](data).expect(statusCode)
);

const routeRequest = (server, route, verb) => (auth, data, statusCode) => httpRequest(server)(
  route, verb, auth, data, statusCode,
);
const authenticatedRequest = (server, route, verb, auth) => (data, statusCode) => httpRequest(
  server,
)(route, verb, auth, data, statusCode);

const publicRequest = (server, route, verb) => (data, statusCode) => httpRequest(server)(
  route, verb, null, data, statusCode,
);

module.exports = {
  httpRequest,
  routeRequest,
  authenticatedRequest,
  publicRequest,
};

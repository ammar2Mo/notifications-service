const { publicRequest } = require('./httpRequest');
const { otpToken } = require('./cachedData');
const HTTP_CODES = require('../../src/routes/utils/HTTP_CODES');

const { userModel: User, otp } = require('../resources/init');

const USER_ROUTE = '/user';
const REGISTER_ROUTE = `${USER_ROUTE}/register`;
const VERIFY_ROUTE = `${USER_ROUTE}/verify`;
const SKIP_ROUTE = `${USER_ROUTE}/skip`;

module.exports = async (server, userData, type) => {
  if (type && type === 'GUEST') {
    const response = await publicRequest(server, SKIP_ROUTE, 'post')(userData, HTTP_CODES.OK);
    return { authToken: response.header.authorization, userId: response.body.data.id };
  }
  if (userData.role === 'ADMIN') {
    await new User({ ...userData, status: 'ACTIVE' }).save();
    await otp.token(userData.phone);
    const token = await otpToken(userData.phone);
    const response = await publicRequest(server, VERIFY_ROUTE, 'post')({ token, phone: userData.phone }, HTTP_CODES.OK);
    return { authToken: response.header.authorization, userId: response.body.data.id };
  }
  const { body } = await publicRequest(server, REGISTER_ROUTE, 'post')(userData, HTTP_CODES.CREATED);
  const { data } = body;
  const token = await otpToken(data.phone);
  const response = await publicRequest(server, VERIFY_ROUTE, 'post')({ token, phone: data.phone }, HTTP_CODES.OK);
  return { authToken: response.header.authorization, userId: response.body.data.id };
};

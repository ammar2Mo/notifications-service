const { expect } = require('chai');

const { spy } = require('sinon');
const app = require('../../src/app');
const init = require('../resources/init');
const HTTP_CODES = require('../../src/routes/utils/HTTP_CODES');
const { authenticatedRequest, publicRequest } = require('../helpers/httpRequest');
const examples = require('../examples');
const createAuthToken = require('../helpers/createAuthToken');

const { error } = examples;
const { userModel: User, notificationService, notificationModel: Notification } = init;

const ROUTE = '/notifications';

describe(ROUTE, async () => {
  let server;
  before(async () => {
    server = await app(init);
    await User.deleteMany();
    await Notification.deleteMany();

    return server;
  });

  after(async () => {
    await User.deleteMany();
    await Notification.deleteMany();
  });

  describe(`POST ${ROUTE}`, async () => {
    let authenticatedNotificationRequest;
    let adminToken;
    let clientToken;
    let agentToken;
    let bulkNotificationsSpy;
    let userNotificationsSpy;
    const agentPhone = '+966011167418';
    let data;
    const city = '5dd49004af8af4002cbfae33';
    before(async () => {
      adminToken = (await createAuthToken(server, { ...examples.register.request, role: 'ADMIN' })).authToken;
      clientToken = (await createAuthToken(server, { ...examples.register.request, role: 'CLIENT', phone: '+966011167488' })).authToken;
      agentToken = (await createAuthToken(server, { ...examples.register.request, role: 'REAL_STATE_AGENT', phone: agentPhone })).authToken;
      authenticatedNotificationRequest = authenticatedRequest(server, ROUTE, 'post', adminToken);
      data = examples.createNotification.request;
      await authenticatedRequest(server, PROFILE_UPDATE_ROUTE, 'put', agentToken)({ city }, HTTP_CODES.OK);
    });
    beforeEach(async () => {
      bulkNotificationsSpy = spy(notificationService, 'bulkNotifications');
      userNotificationsSpy = spy(notificationService, 'notifyUsers');
    });
    afterEach(async () => {
      bulkNotificationsSpy.restore();
      userNotificationsSpy.restore();
    });
    it('should created notification successfully and find matched user ', async () => {
      const matchedUsers = await authenticatedNotificationRequest(data, HTTP_CODES.CREATED);
      expect(userNotificationsSpy.called).equals(true);
      expect(bulkNotificationsSpy.called).equals(true);
      expect(JSON.parse(JSON.stringify(bulkNotificationsSpy.args[0][1])))
        .to.deep.equals(examples.createNotification.expectedBody);
      return expect(matchedUsers.body.data.matchingUsers).deep.equals(2);
    });
    it('should created notification successfully and find matched user with  city  ', async () => {
      data.cities = [city];
      const matchedUsers = await authenticatedNotificationRequest(data, HTTP_CODES.CREATED);
      expect(userNotificationsSpy.called).equals(true);
      expect(bulkNotificationsSpy.called).equals(true);
      expect(JSON.parse(JSON.stringify(bulkNotificationsSpy.args[0][1])))
        .to.deep.equals(examples.createNotification.expectedBody);
      delete data.cities;
      return expect(matchedUsers.body.data.matchingUsers).deep.equals(1);
    });
    it('should created notification successfully and find matched user matched with role  ', async () => {
      data.roles = ['CLIENT'];
      const matchedUsers = await authenticatedNotificationRequest(data, HTTP_CODES.CREATED);
      expect(userNotificationsSpy.called).equals(true);
      expect(bulkNotificationsSpy.called).equals(true);
      expect(JSON.parse(JSON.stringify(bulkNotificationsSpy.args[0][1])))
        .to.deep.equals(examples.createNotification.expectedBody);
      delete data.roles;
      return expect(matchedUsers.body.data.matchingUsers).deep.equals(1);
    });
    it('should created notification successfully and find matched user matched with phone  ', async () => {
      data.phones = [agentPhone];
      const matchedUsers = await authenticatedNotificationRequest(data, HTTP_CODES.CREATED);
      expect(userNotificationsSpy.called).equals(true);
      expect(bulkNotificationsSpy.called).equals(true);
      expect(JSON.parse(JSON.stringify(bulkNotificationsSpy.args[0][1])))
        .to.deep.equals(examples.createNotification.expectedBody);
      return expect(matchedUsers.body.data.matchingUsers).deep.equals(1);
    });
    it('should return error if send empty body', async () => {
      const response = await authenticatedNotificationRequest({}, HTTP_CODES.BAD_REQUEST);
      return expect(response.body).to.deep.equal(error('body is required'));
    });
    it('should return error if sent without token', async () => {
      const response = await publicRequest(server, ROUTE, 'post')(null, HTTP_CODES.NOT_AUTHENTICATED);
      return expect(response.body).to.deep.equal(error('Auth token is not supplied'));
    });

    it('should return error if called with client token', async () => {
      const response = await authenticatedRequest(server, ROUTE, 'post', clientToken)(null, HTTP_CODES.FORBIDDEN);
      return expect(response.body).to.deep.equal(error('Forbidden'));
    });
  });
});

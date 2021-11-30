const MAX_PLAYER_IDS_PER_API_CALL = 2000;

module.exports = ({
  Model, userModel, notificationsUtil, dataShapeUtil,
}) => ({
  async notifyUsers(data) {
    const query = { };
    if (data.phones) {
      query.phone = { $in: data.phones };
    }
    if (data.roles) {
      query.role = { $in: data.roles };
    }
    return this.bulkNotifications(query, data.body, true);
  },
  async bulkNotifications(query, body, save = false, page = 1) {
    let totalUsersMatched;
    try {
      const filter = { ...query, status: 'ACTIVE' };
      const { data: users, hasNextPage, total } = await userModel.paginated({ query: filter, page, limit: 1000, select: '_id playersIds' });
      totalUsersMatched = total;
      const playersIds = [];
      const notifications = [];
      users.forEach((user) => {
        if (user.playersIds) user.playersIds.forEach((playerId) => playersIds.push(playerId));
        notifications.push({
          body,
          to: user._id,
        });
      });

      if (playersIds.length) {
        if (playersIds.length < MAX_PLAYER_IDS_PER_API_CALL) {
          notificationsUtil.send(playersIds, body);
        } else {
          dataShapeUtil.chunk(playersIds, MAX_PLAYER_IDS_PER_API_CALL)
            .map((segment) => notificationsUtil.send(segment, body));
        }
      }

      if (save) await Model.insertMany(notifications, { lean: true });
      if (hasNextPage) { return this.bulkNotifications(query, body, true, page + 1); }
    } catch (e) {
      console.error(e);
    }
    return totalUsersMatched;
  },
});

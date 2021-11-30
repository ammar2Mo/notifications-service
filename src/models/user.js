const { Schema, model } = require('mongoose');
const MongooseErrors = require('mongoose-errors');
const mongoosePaginate = require('mongoose-paginate-v2');
const _ = require('underscore');

const point = require('./schemas/point');
const { userRoles, notificationMethod, userStatus, phoneRegex } = require('./enums');

module.exports = ({ }) => {
  const schema = new Schema({
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      minlength: 1,
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      match: phoneRegex,
    },
    playersIds: [{ type: String }],
    role: {
      type: String,
      enum: userRoles,
      default: 'GUEST',
      trim: true,
    },
    notificationMethods: [{
      type: String,
      enum: notificationMethod,
    }],
    statusLog: [{
      status: { type: String, enum: userStatus },
      by: { type: Schema.Types.ObjectId, ref: 'User' },
      at: { type: Date, default: Date.now },
      reason: String,
    }],
    status: {
      type: String,
      enum: userStatus,
    }
  }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: false,
    timestamps: true,
  });

  schema.virtual('requestsCount', {
    ref: 'Request',
    localField: '_id',
    foreignField: 'client',
    count: true,
  });
  schema.index({ role: 1, status: 1, createdAt: 1 });
  schema.index({ officeLocation: '2dsphere' });

  schema.plugin(MongooseErrors);
  schema.plugin(mongoosePaginate);

  schema.statics.paginated = function paginated({ query, limit, page, populate = [], select = '- __v', sortBy = 'createdAt', sort = '-1' }) {
    return this.paginate(query, {
      page,
      limit,
      select,
      sort: { [sortBy]: sort },
      populate,
      customLabels: {
        totalDocs: 'total',
        docs: 'data',
      },
      lean: true,
    });
  };

  const user = model('User', schema);

  (async function createIndex() {
    const index = await user.createIndexes();
    return index;
  }());

  return user;
};

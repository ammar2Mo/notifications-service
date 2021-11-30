const { Schema, model } = require('mongoose');
const MongooseErrors = require('mongoose-errors');
const mongoosePaginate = require('mongoose-paginate-v2');

module.exports = ({ }) => {
  const schema = new Schema({
    body: {
      contents: {
        en: { type: String },
        ar: { type: String },
      },
      headings: {
        en: { type: String },
        ar: { type: String },
      },
      photoUrl: { type: String },
      redirectionUrl: { type: String },
    },
    to: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }, {
    autoIndex: false,
    timestamps: true,
  });

  schema.plugin(MongooseErrors);
  schema.plugin(mongoosePaginate);

  const Notification = model('Notification', schema);

  (async function createIndex() {
    const index = await Notification.createIndexes();
    return index;
  }());

  return Notification;
};

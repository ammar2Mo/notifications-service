module.exports = async (data, schema) => {
  let value;
  try {
    value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    const error = new Error(err.details[0].message);
    error.status = 400;
    throw error;
  }
};

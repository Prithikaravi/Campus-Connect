// usage: throw fail(res, 400, 'Message')
module.exports = (res, code, message) => {
  res.status(code);
  return new Error(message);
};

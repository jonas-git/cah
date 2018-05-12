const config = require('config');

module.exports = function (name) {
  return config.has(name) ? config.get(name) : undefined;
}

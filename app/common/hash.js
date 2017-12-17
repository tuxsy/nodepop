'use strict';
const crypto = require('crypto');

module.exports = {
  createHash: function (clave) {
    return crypto
      .createHmac('sha256', Buffer.from(process.env.JWT_SECRET, 'utf8'))
      .update(clave)
      .digest('hex');
  }
};
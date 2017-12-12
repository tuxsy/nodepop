'use strict';

const mongoose = require('mongoose');
const conn = mongoose.connection;
const url = process.env.MONGO_DB_URL;

mongoose.Promise = global.Promise;

conn.on('error', err => {
  console.log('Error!', err);
  process.exit(1);
});

conn.once('open', () => {
  console.log(`Conectado a MongoDB en ${mongoose.connection.name}`);
});

mongoose.connect(url, {
  useMongoClient: true
});

module.exports = { mongoose: mongoose, conn: conn };

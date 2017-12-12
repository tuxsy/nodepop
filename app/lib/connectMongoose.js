'use strict';

const mongoose = require('mongoose');
const conn = mongoose.connection;

mongoose.Promise = global.Promise;

conn.on('error', err => {
  console.log('Error!', err);
  process.exit(1);
});

conn.once('open', () => {
  console.log(`Conectado a MongoDB en ${mongoose.connection.name}`);
});

mongoose.connect('mongodb://localhost/cursonode', {
  useMongoClient: true
});

module.exports = { mongoose: mongoose, conn: conn };

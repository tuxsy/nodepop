'use strict';

const mongoose = require('mongoose');

// primero creamos el schema
const usuarioSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    index: { unique: true }
  },
  email: {
    type: String,
    required: true,
    index: { unique: true }
  },
  clave: {
    type: String,
    required: true
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
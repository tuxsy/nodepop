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
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
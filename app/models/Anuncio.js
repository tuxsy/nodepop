'use strict';

const mongoose = require('mongoose');

// primero creamos el esquema
const anuncioSchema = mongoose.Schema({
  nombre: String,
  venta: Boolean,
  precio: Number,
  foto: String,
  tags: [ String ]
});

// Creamos un método estático
anuncioSchema.statics.list = function (filters, limit, skip, sort, fields) {
  // obtenemos la query sin ejecutarla
  const query = Anuncio.find(filters);
  query.limit(limit);
  query.skip(skip);
  query.sort(sort);
  query.select(fields);
  // ejecutamos la query y devolvemos una promesa
  return query.exec();
};

// y por último creamos el modelo
const Anuncio = mongoose.model('Anuncio', anuncioSchema);

// y lo exportamos
module.exports = Anuncio;

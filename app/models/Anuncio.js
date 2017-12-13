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

/**
 * Obtenemos una lista de Anuncios
 */
anuncioSchema.statics.list = function (filters, limit, skip, sort, fields) {
  
  const query = Anuncio.find(filters);
  query.limit(limit);
  query.skip(skip);
  query.sort(sort);
  query.select(fields);
  // ejecutamos la query y devolvemos una promesa
  return query.exec();
};

function findDistincTags () {
  
  const query = Anuncio.distinct('tags');
  // ejecutamos la query y devolvemos una promesa
  return query.exec();
}

anuncioSchema.statics.listTags = findDistincTags;

anuncioSchema.statics.listTagsAndCountAnuncios = async function () {
  const rows = await findDistincTags();
  const tags = [];
  for (let i = 0; i < rows.length; i++) {
    const count = await Anuncio.find({ tags: rows[i] }).count().exec();
    tags.push({ tag: rows[i], anuncios: count });
  }
  return tags;
};


const Anuncio = mongoose.model('Anuncio', anuncioSchema);

module.exports = Anuncio;

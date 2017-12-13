'use strict';

const express = require('express');
const router = express.Router();
// const jwtAuth = require('../../lib/jwtAuth');

// cargar el modelo de Agente
const Anuncio = require(global.__base + 'app/models/Anuncio');

// si quiero que afecte a todo el router
//router.use(basicAuth(
//  process.env.BASIC_AUTH_USER, 
//  process.env.BASIC_AUTH_PASSWORD));

// router.use(jwtAuth());

/**
 * GET /anuncios
 * Obtener una lista de anuncios
 */
router.get('/', async (req, res, next) => {
  try {
    // const name = req.query.name;
    const limit = parseInt(req.query.limit); // Number(str)
    const skip = parseInt(req.query.skip);
    const sort = req.query.sort;
    const fields = req.query.fields;

    const tag = req.query.tag;
    const venta = req.query.venta;
    const precio = req.query.precio;
    const nombre = req.query.nombre;

    // creo el filtro vacio
    const filter = {};

    if (tag) {
      filter.tags = tag;
    }

    if (venta !== undefined) {
      filter.venta = venta;
    }

    if (precio) {
      const minusPos = precio.indexOf('-');
      if ( minusPos < 0) {
        filter.precio = precio;
      } else {
        if (precio.startsWith('-')) {
          filter.precio = { $lte: precio.replace('-','') };
        } else if (precio.endsWith('-')) {
          filter.precio = { $gte: precio.replace('-','') };
        } else {
          filter.precio = { $gte: precio.split('-')[0], $lte: precio.split('-')[1] };
        }
      }
    }

    if (nombre) {
      filter.nombre = { $regex: '^' + nombre, $options: 'i' };
    }

    const rows = await Anuncio.list(filter, limit, skip, sort, fields);
    res.json({ success: true, result: rows });
  } catch (err) {
    err.i18n = 'Anuncios search error';
    next(err);
  }
});

/**
 * GET /anuncios:id
 * Obtener un anuncio
 */
router.get('/:id', async (req, res, next) => {
  try {
    const _id = req.params.id;
    const anuncio = await Anuncio.findOne({ _id: _id }).exec();
    res.json({ success: true, result: anuncio });
  } catch (err) {
    err.i18n = 'Anuncio not found';
    err.status = 404;
    next(err);
  }
});

module.exports = router;

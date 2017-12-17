'use strict';

const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator/check');

// cargar el modelo de Agente
const Anuncio = require(global.__base + 'app/models/Anuncio');

function canBeNumeric (value) {
  return value && value.match(/^[0-9]*$/);
}
/**
 * Comprueba que un precio tenga un rango válido. Puede ser
 * - un valor exacto (ex: 5)
 * - mayor/igual o menor/igual que un valor (ex: 5- o -5)
 * - entre dos valores (ex: 0-100). En este caso el segundo valor será mayor al primero
 * @param {string} value 
 */
function validatePrecio (value) {
  if (canBeNumeric(value)) { // Si es un valor numérico ok
    return true;
  } else { // Si no es numérico
    const a = value.split('-'); // Separamos  por '-'
    if (a.length >= 1 && a.length <= 2) { // Si el tamaño es 1-2
      a.reduce((prev, curr) => { // comprobamos el contenido del array
        if (curr === '' ||(canBeNumeric(curr) && curr >= prev )) { // números y el segundo valor mayor que el primero
          return curr;
        } else { // Si algo no es número fallamos
          throw new Error();
        }
      }, 0);
      return true; // si el tamaño máximo es 2 y no hay fallos todo ok
    } else { // si el tamaño al separar por '-' no está entre 1-2 fallamos
      throw new Error();
    }
  }
}

/**
 * GET /anuncios
 * Obtener una lista de anuncios
 */
router.get('/', [
  query('limit').optional().isNumeric().withMessage('Limit must be numeric'),
  query('skip').optional().isNumeric().withMessage('skip must be numeric'),
  query('sort').optional().isIn('nombre', 'venta', 'precio', 'foto', 'tags').withMessage('sort is invalid'),
  query('tag').optional().isAlphanumeric().withMessage('tag is invalid'),
  query('precio').optional().custom(validatePrecio).withMessage('precio is invalid'),
  query('venta').optional().isBoolean().withMessage('venta is invalid'),
  query('nombre').optional().isAlphanumeric().withMessage('nombre is invalid')
], async (req, res, next) => {
  try {
    // Primero que nada validamos los parámetros
    const verrors = validationResult(req);
    if (!verrors.isEmpty()) {
      const e = new Error();
      e.validationErrors = verrors.array();
      next(e);
      return;
    }
    // const name = req.query.name;
    const limit = parseInt(req.query.limit); // Number(str)
    const skip = parseInt(req.query.skip);
    const sort = req.query.sort;

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

    const rows = await Anuncio.list(filter, limit, skip, sort);
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

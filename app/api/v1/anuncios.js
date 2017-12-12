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
 * GET /agentes
 * Obtener una lista de agentes
 */
router.get('/', async (req, res, next) => {
  try {
    // const name = req.query.name;
    const limit = parseInt(req.query.limit); // Number(str)
    const skip = parseInt(req.query.skip);
    const sort = req.query.sort;
    const fields = req.query.fields;

    // creo el filtro vacio
    const filter = {};

    /* if (name) {
      filter.name = name;
    } */

    const rows = await Anuncio.list(filter, limit, skip, sort, fields);
    res.json({ success: true, result: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /agentes:id
 * Obtener un agente
 */
router.get('/:id', async (req, res, next) => {
  try {
    const _id = req.params.id;
    const anuncio = await Anuncio.findOne({ _id: _id }).exec();
    res.json({ success: true, result: anuncio });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

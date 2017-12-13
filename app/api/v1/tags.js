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
 * GET /tags
 * Obtener el listado de tags
 */
router.get('/', async (req, res, next) => {
  try {
    const rows = await Anuncio.listTags();
    res.json({ success: true, result: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /tags/count
 * Obtener el listado de tags y cuenta los anuncios de cada tag
 */
router.get('/count', async (req, res, next) => {
  try {
    const rows = await Anuncio.listTagsAndCountAnuncios();
    res.json({ success: true, result: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

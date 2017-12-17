'use strict';

const express = require('express');
const router = express.Router();

const Anuncio = require(global.__base + 'app/models/Anuncio');


/**
 * GET /tags
 * Obtener el listado de tags
 */
router.get('/', async (req, res, next) => {
  try {
    const rows = await Anuncio.listTags();
    res.json({ success: true, result: rows });
  } catch (err) {
    err.i18n = 'Tags list error';
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
    err.i18n = 'Tags list and count error';
    next(err);
  }
});

module.exports = router;

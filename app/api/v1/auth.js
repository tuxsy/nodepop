'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


const Usuario = require(global.__base + 'app/models/Usuario');
const { createHash } = require('../../common/hash');

/**
 * POST /auth/register  
 * Registra un usuario
 */
router.post('/register', (req, res, next) => {
  const nombre = req.body.nombre;
  const clave = req.body.clave;
  const email = req.body.email;

  if (!nombre || !clave || !email) {
    const e = new Error('nombre, email, clave required');
    e.i18n = e.message;
    next(e);
    return;
  }

  const hash = createHash(clave);

  const usuario = new Usuario({
    nombre: nombre,
    email: email,
    clave: hash
  });
  // lo persistimos en la colección de agentes
  usuario.save((err, saved) => {
    if (err) {
      err.i18n = 'Cannot register user';
      next(err);
      return;
    }
    const user = saved.toObject();
    delete user.clave;
    res.json({ success: true, result: user });
  });
});

/**
 * POST /auth/login
 * Devuelve un token para un usuario
 */
router.post('/login', async (req, res, next) => {
  // recogemos las credenciales
  const email = req.body.email;
  const clave = req.body.clave;

  if (!clave || !email) {
    const e = new Error('email, clave required');
    e.i18n = e.message;
    next(e);
    return;
  }

  // Buscamos en la base de datos en usuario
  const usuario = await Usuario.findOne({ email: email }).exec();

  if (!usuario || usuario.clave !== createHash(clave)) {
    const error = new Error();
    error.status = 401;
    error.i18n = 'Invalid Credentials';
    next(error);
    return;
  }

  jwt.sign({ user_id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  }, (err, token) => {
    if (err) {
      err.i18n = 'Token creation error';
      next(err);
      return;
    }

    res.json({ success: true, token: token });
  });

});

module.exports = router;
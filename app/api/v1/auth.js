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

  // Buscamos en la base de datos en usuario
  const usuario = await Usuario.findOne({ email: email }).exec();
  // simulamos que buscamos
  if (!usuario || usuario.clave !== createHash(clave)) {
    const error = new Error();
    error.status = 401;
    error.i18n = 'Invalid Credentials';
    next(error);
    return;
  }

  // si el usuario existe y la password coincide
  // creamos un token
  // no firmar objetos de mongoose, usar mejor un nuevo objeto solo con lo mínimo
  jwt.sign({ user_id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  }, (err, token) => {
    if (err) {
      err.i18n = 'Token creation error';
      next(err);
      return;
    }

    // y lo devolvemos
    res.json({ success: true, token: token });
  });

});

module.exports = router;
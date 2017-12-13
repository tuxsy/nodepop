'use strict';

const jwt = require('jsonwebtoken');
const Usuario = require(global.__base + 'app/models/Usuario');
const INVALID_TOKEN = 'Invalid token';

async function searchUser (decoded) {
  return await Usuario.findOne({ _id: decoded.user_id }).exec();
}

// exportamos un creador de middlewares de autenticación
module.exports = () => {
  return async function (req, res, next) {
    // leer credenciales
    const token = req.body.token || req.query.token || req.get('x-access-token');

    if (!token) {
      const err = new Error('No token provided');
      err.i18n = err.message;
      err.status = 401;
      next(err);
      return;
    }

    // comprobar credenciales
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const error = new Error(INVALID_TOKEN);
        error.i18n = err.message;
        error.status = 401;
        next(error);
        return;
      }
      // continuar
      searchUser(decoded).then(usuario => {
        req.userId = usuario._id; // lo guardamos en el request para los siguientes middlewares
        next();
      }).catch(error => { 
        error.i18n = INVALID_TOKEN;
        error.status = 401;
        next(error);
      });
    });
  };
};
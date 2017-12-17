'use strict';

require('dotenv').config();

const { MongoClient } = require('mongodb');
const { createHash } = require('./app/common/hash');

const url = process.env.MONGO_DB_URL;

/**
 * Esta función elimina una colección de MongoDB
 * @param {string} db 
 * @param {string} col 
 */
function dropCollection (db, col ) {
  return new Promise((resolve, reject) => {
    db.collection(col).find().toArray((err, docs) => {
      if (err) {
        reject(err);
        return;
      }
      if (docs && docs.length > 0) {
        db.collection(col).drop(err => {
          if (err) {
            console.log(`No se ha podido eliminar la colección ${col}`);
            reject(err);
            return;
          }
          console.log(`Colección ${col} eliminada`);
        });
      } else {
        console.log(`La colección de ${col} no existe, no hacemos nada`);
      }
      resolve();
    });
  });
}

/**
 * Esta función crea una dcolección en MongoDB
 * @param {string} db 
 * @param {string} col 
 */
function createCollection (db, col) {
  return new Promise((resolve, reject) => {
    db.createCollection(col, err => {
      if (err) {
        reject();
        return;
      }
      console.log(`La colección ${col} se ha creado correctamente`);
      resolve();
    });
  });
}

/**
 * Esta función puebla una determiada colección de MongoDb con los datos que le pasemos
 * @param {string} db 
 * @param {string} col 
 * @param {array} data 
 * @param {function} transformer
 */
function populateCollection (db, col, data, transformer) {
  return new Promise((resolve, reject) => {
    if (data && data.length > 0) {
      const insertions = [];
      let i = 0;
      for (; i < data.length; i++) {
        insertions.push(insertDocument(db, col, data[i], transformer));
      }
      Promise.all(insertions).then( () => {
        console.log('-------------------------------');
        console.log(`${i} Documentos insertados en ${col}`);
        console.log('-------------------------------');
        console.log('');
        resolve();
      } ).catch((err) => { reject(err); });
    } else {
      console.log(`No hay datos que cargar en ${col}`);
      resolve();
    }
  });
}

/**
 * Esta función inserta un documento en una colección de MongoDb
 * @param {string} db 
 * @param {string} col 
 * @param {json} document 
 * @param {function} transformer
 */
function insertDocument (db, col, document, transformer) {
  return new Promise((resolve, reject) => {
    if (transformer) {
      document = transformer(document);
    }

    db.collection(col).insert(document, err => {
      if (err) {
        console.log(`Error al insertar en $(col)`, document);
        reject(err);
      }
      console.log(`Documento insertado en ${col}`, document);
      resolve();
    });
  });
}

/* ************************** */
/*      MAIN                  */
/* ************************** */
MongoClient.connect(url, async (err, db) => {
  if (err) {
    console.log('Error al conectar con MongoDb', err);
    process.exit(1);
  }

  console.log('Conectado a MongoDb', url);
  try {
    await dropCollection(db, 'usuarios');
    await dropCollection(db, 'anuncios');
    await createCollection(db, 'anuncios');
    await createCollection(db, 'usuarios');
    await populateCollection(db, 'anuncios', require('./example_data/anuncios'));
    await populateCollection(db, 'usuarios', require('./example_data/usuarios'), usuario => {
      const clave = usuario.clave;
      usuario.clave = createHash(clave);
      return usuario;
    });

    console.log('Fin');
    db.close();
  } catch (err) {
    console.log('Error al cargar los datos de prueba', err);
    process.exit(1);
  }
  
});

'use strict';

require('dotenv').config();

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_DB_URL;

/**
 * Esta función elimina una colección de MongoDB
 * @param {*} db 
 * @param {*} col 
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
 * @param {*} db 
 * @param {*} col 
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
 * @param {*} db 
 * @param {*} col 
 * @param {*} data 
 */
function populateCollection (db, col, data) {
  return new Promise((resolve, reject) => {
    if (data && data.length > 0) {
      const insertions = [];
      let i = 0;
      for (; i < data.length; i++) {
        insertions.push(insertDocument(db, col, data[i]));
      }
      Promise.all(insertions).then( () => {
        console.log('-------------------------------');
        console.log(`${i} Documentos insertados en ${col}`);
        resolve();
      } );
    } else {
      console.log(`No hay datos que cargar en ${col}`);
      resolve();
    }
  });
}

/**
 * Esta función inserta un documento en una colección de MongoDb
 * @param {*} db 
 * @param {*} col 
 * @param {*} document 
 */
function insertDocument(db, col, document) {
  return new Promise((resolve, reject) => {
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
    await dropCollection(db, 'anuncios');
    await createCollection(db, 'anuncios');
    await populateCollection(db, 'anuncios', require('./example_data/anuncios'));

    console.log('Fin');
    db.close();
  } catch (err) {
    console.log('Error al cargar los datos de prueba', err);
    process.exit(1);
  }
  
});

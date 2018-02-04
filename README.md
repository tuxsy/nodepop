# nodepop

## Sobre el despliegue de la aplicación.
La aplicación se encuentra desplegada en https://nodepop.tuxsyapps.net.

Para testear la aplicación:
```bash
curl -X POST \
  https://nodepop.tuxsyapps.net/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'email=u1@npop.info&clave=1234'
```
Esta llamada nos devolverá un token que deberemos usar en las siguientes llamadas al API. Consultar la [referencia del API](#referencia-del-api) para probar a fondo la aplicación.

* En la dirección https://tuxsyapps.net o a https://35.176.112.62 se encuentra desplegada una plantilla de ejeplo.
* En la dirección https://nodechat.tuxsyapps.net se encuentra desplegada la aplicación de chat.
* Los recursos estáticos los sirve directamente Nginx y se añade la cabecera de respuesta ```X-Owner: tuxsy```
** ejemplo: https://nodepop.tuxsyapps.net/images/lapicero.jpg

## Índice
1. [Inicio](#inicio)
2. [Referencia del API](#referencia-del-api)
  * [Registro de Usuarios](#registro-de-usuarios)
  * [Login](#login)
  * [Listado de Anuncios](#listado-de-anuncios)
  * [Obtener un Anuncio](#obtener-un-anuncio)
  * [Lista de Tags](#lista-de-tags)
  * [Cantidad de anuncios de cada Tag](#cantidad-de-anuncios-de-cada-tag)
3. [Calidad de código](#calidad-de-cdigo)
4. [Internacionalización](#internacionalizacin)

## Inicio
* *Se requiere una versión de Node.js 8.9.0 o superior*
* *Es necesario tener una Base de Datos MongoDb arrancada*

**Primeros pasos**
```bash
# Instalar las dependencias
npm install

# Crear el fichero .env
cp .env.example .env

# Editar el fichero .env y adaptarlo según necesidades

# Carga inicial de la Base de Datos
npm run initdb

# Convertir README.md a HTML para poder acceder a través de la URL
npm run build-doc

# Arrancar en modo desarrollo
npm run dev
```
**Acceso a la aplicación**

Una vez arrancado en modo desarrollo podremos acceder a la aplicación a través de las siguientes URL
* [http://localhost:3000]()
* [http://localhost:3000/docs](), para consultar on-line el fichero README.md

**Prueba de funcionamiento de la API**

Para comprobar que la API funciona correctamente vamos a hacer un login.
```bash
curl -X POST \
  http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'email=u1%40npop.info&clave=1234'
```

La respuesta debe ser similar a
```
{"success":true,"token":"......"}
```

## Referencia del API
En esta sección describiremos los métodos del API

### Registro de Usuarios

**Llamada**
```bash
curl -X POST \
  http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'nombre=<nombre>3&email=<email>&clave=<clave>'
```

* **nombre** (requerido, único): combre del usuario
* **email** (requerido, único): correo electónio
* **clave** (requerido): contraseña

**Respuesta**
```
{
    "success": true,
    "result": {
        "nombre": "nombre",
        "email": "email",
    }
}
```

* **success**: inidca si la operación ha tenido éxito
* **result**: información del usuario guardado

### Login

**Llamada**
```bash
curl -X POST \
  http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'email=<email>&clave=<clave>'
```

* **email** (requerido): correo electónio
* **clave** (requerido): contraseña

**Respuesta**
```
{
    "success": true,
    "token": "....."
}
```

* **success**: inidca si la operación ha tenido éxito
* **token**: Token JWT (access-token)

### Listado de Anuncios

*Es necesario estar autenticado [Ver login](#login)*

**Llamada**
```bash
curl -X GET \
  http://localhost:3000/api/v1/anuncios \
  -H 'x-access-token: .....'
```
**Es importante especificar la cabecera ```x-access-token```**

**Respuesta**
```
{
    "success": true,
    "result": [
        {
            "_id": "id",
            "nombre": "nombre",
            "venta": true|false,
            "precio": preci,
            "foto": "url_foto",
            "tags": [
                "tag 1",
                "tag 2",
                ...
            ]
        },
        ...
    ]
}
```

* **success**: indica si la operación ha tenido éxito
* **result**: Array de Anuncios
* **_id**: ID del anuncio, permite recuperar uno.
* **nombre**: Nombre del Artículo
* **venta**: true -> anuncio de venta, false -> anuncio de compra
* **foto**: Url que permite descargarse la foto
* **tags**: Array de Tags con los que se ha etiquetado el auncio

**Opciones de filtrado y paginación**
* **limit**: Cantidad máxima de Anuncios a devolver (paginación)
* **skip**: Anuncios que nos queremos saltar (paginación)
* **sort**: Campo por el que queremos ordenar

* **nombre**: Filtrar Anuncios cuyo nombre de Artículo empiece por
* **venta**: Filtrar Anuncios de compra (false) o venta (true)
* **precio**: Filtrar Anuncios por precio (de compra o venta)
* **tag**: Filtrar Anuncios etiquetados con un determinado tag

**Filtrar por precio**
Para filtrar por precio tenemos las siguientes opciones:
* Valor exacto. Ejemplo: ```precio=10```
* Valor mayor o igual que. Ejemplo: ```precio=10-```
* Valor menor o igual que. Ejmplo: ```precio=-10```
* Valor entre un rango. Ejemplo: ```precio=10-30```

Ejemplo
```bash
# Buscamoslos 10 primeros atículos etiquetados por 'lifestyle' cuyo precio no supere los 100€

curl -X GET \
  http://localhost:3000/api/v1/anuncios?limit=10&tag=lifestyle&precio=-100 \
  ...
```


### Obtener un Anuncio

*Es necesario estar autenticado [Ver login](#login)*

**Llamada**
```bash
curl -X GET \
  http://localhost:3000/api/v1/anuncios/:id \
  -H 'x-access-token: .....'
```
**Es importante especificar la cabecera ```x-access-token```**

* **id** (requerido): identificador del Anuncio

**Respuesta**
```
{
    "success": true,
    "result": {
        "_id": "identificadir",
        "nombre": "nombre",
        "venta": true|false,
        "precio": precio,
        "foto": "url foto",
        "tags": [
            "tag 1",
            "tag 2",
            ...
        ]
    }
}
```

* **success**: inidca si la operación ha tenido éxito
* **_id**: ID del anuncio, permite recuperar uno.
* **nombre**: Nombre del Artículo
* **venta**: true -> anuncio de venta, false -> anuncio de compra
* **foto**: Url que permite descargarse la foto
* **tags**: Array de Tags con los que se ha etiquetado el auncio

### Lista de Tags

*Es necesario estar autenticado [Ver login](#login)*

**Llamada**
```bash
curl -X GET \
  http://localhost:3000/api/v1/tags \
  -H 'x-access-token: .....'
```
**Es importante especificar la cabecera ```x-access-token```**

**Respuesta**
```
{
    "success": true,
    "result": [
        "lifestyle",
        "mobile",
        "motor"
    ]
}
```

* **success**: inidca si la operación ha tenido éxito
* **result**: array de tags existentes

### Cantidad de anuncios de cada Tag

*Es necesario estar autenticado [Ver login](#login)*

**Llamada**
```bash
curl -X GET \
  http://localhost:3000/api/v1/tags/count \
  -H 'x-access-token: .....'
```
**Es importante especificar la cabecera ```x-access-token```**

**Respuesta**
```
{
    "success": true,
    "result": [
        {
            "tag": "tag",
            "anuncios": count
        },
        ...
    ]
}
```

* **success**: inidca si la operación ha tenido éxito
* **result**: array de tags existentes
* **tag**: nombre del tag
* **anuncios**: cantidad de anuncios que hay de cada tag

## Calidad de código
Usamos [ESLint](https://eslint.org/) para verificar el código que escribimos. No es necesario instalarlo
como una dependencia global, ya que lo incorporamos en el ```package.json``` en la sección ```devDependencies```

```bash
# Ejecutamos una comprobación de código
npm run lint

# Cuando arrancamos el proyecto en modo desarrollo, cada vez que nodemon reinicia lanza la comprobación de código
npm run dev
```

Las reglas de código se aplican en los sources que cuelgan de ```./app```. Se recomienda poner el código auto-generado fuera (por ejmplo el de *express-generator*).

Estas son las reglas de ESLint que aplicamos:
* reglas de partida: [eslint:recommended](https://eslint.org/docs/rules/)
* saltos de línea estilo Unix [linebreak-style](https://eslint.org/docs/rules/linebreak-style)
* las cadenas se cierran con comillas simples (```'string'```) [quotes](https://eslint.org/docs/rules/quotes)
* las líneas deben terminar con punto y coma [semi](https://eslint.org/docs/rules/semi)
* hay que dejar un espacio entre el nombre de una función y los paréntesis [space-before-function-paren](/eslint.org/docs/rules/space-before-function-paren)
* antes y después de las palabras clave (```if```, ```for```, et ...) hay que dejar espacios [keyword-spacing](https://eslint.org/docs/rules/keyword-spacing)
* hay que dejar espacios anes y después de los corchetes (```[]```) en los arrays [array-bracket-spacing](https://eslint.org/docs/rules/array-bracket-spacing)
* hay que dejar espacios (o saltos de lína) antes y después de las llaves (```{}```) en los objetos [object-curly-spacing](https://eslint.org/docs/rules/object-curly-spacing)
* hay que dejar un espacio antes de la llave de inicio de un bloque de código(```if (..) { ....```) [space-before-blocks](https://eslint.org/docs/rules/space-before-blocks)

## Internacionalización
Las respuesrtas de error del API están internacionalizadas y soportan los idiomas ```en```y ```es```. Un cliente puede seleccionar el idioma de uno de los siguientes modos.

**A) Mediante un parámetro en la queryString**
```bash
curl -X GET \
  http://localhost:3000/api/v1/anuncios?lang=es \
  ...
```

**B)Mediante unla cabecera**

```bash
curl -X GET \
  http://localhost:3000/api/v1/anuncios \
  -H 'Accept-Language: es' \
  ...
```
Para internacionalizar un mensaje de error basta con añadirle la propiedad ```i18n``` al error

```javascript
if (err) {
  err.i18n = 'mi mensaje de error'
  next(err);
  return;
}
```

Los mejsajes traducidos se encuentran el los ficheros ```./locales/en.json``` y ```./locales/es.json```

// Requires
var express = require('express');

// inicializar variables
var app = express();

// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición reali correctamente'
    });
})

module.exports = app;
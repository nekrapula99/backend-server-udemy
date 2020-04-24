var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ===============================
// Busqueda especifica
// ===============================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    console.log('tabla: ' + tabla);
    console.log('busqueda: ' + busqueda);

    switch (tabla) {
        case 'usuarios':
            promesa = busquedaUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = busquedaHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = busquedaMedicos(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla invalido' }
            });

    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});
// ===============================
// Busqueda general
// ===============================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            busquedaHospitales(busqueda, regex),
            busquedaMedicos(busqueda, regex),
            busquedaUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        });

    /* busquedaHospitales(busqueda, regex)
        .then(hospitales => { // then es la salida de la promesa (recivi hospitales)
            res.status(200).json({
                ok: true,
                hospitales: hospitales
            });

        }); */

});

function busquedaHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales ', err);
                } else {
                    resolve(hospitales);
                }

            });
    });

}

function busquedaMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar Medicos ', err);
                } else {
                    resolve(medicos);
                }
            });
    });

}

function busquedaUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('error al cargar usuarios ', err);
                } else {
                    resolve(usuarios);
                }
            })

    });
}

module.exports = app;
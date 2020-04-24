var express = require('express');

var app = express();

//  Encriptar contraseñas
var bcrypt = require('bcryptjs');

var middleware = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

// ===============================
// Obtener todos los Hospitales
// ===============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5) //Paginar registros
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Hospitales!',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        totalHospitales: conteo
                    });
                });


            });


});

// ===============================
// Crear nuevo Hospital
// ===============================

app.post('/', middleware.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitaltoken: req.hospital
        });

    })


});


// ===============================
// Actualizar Hospital
// ===============================

app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital!',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }



        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({ //Puede ser un nmbre vacio oer somehing like thata
                    ok: false,
                    mensaje: 'Error al Actualizar hospital!',
                    errors: err
                });
            }

            // usuarioGuardado.password = '=D';

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });
});


// ===============================
// Eliminar Hospital
// ===============================

app.delete('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar Hospital!',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id ' + id,
                errors: { message: 'No existe un hospital con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });

    });

});


module.exports = app;
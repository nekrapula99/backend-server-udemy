var express = require('express');

var app = express();

//  Encriptar contraseñas
var bcrypt = require('bcryptjs');

var middleware = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

// ===============================
// Obtener todos los medicos
// ===============================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5) //Paginar registros
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Medicos!',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        totalMedicos: conteo
                    });

                });
            });


});

// ===============================
// Crear nuevo medico
// ===============================

app.post('/', middleware.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital,
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Medico!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicotoken: req.medico
        });

    })


});


// ===============================
// Actualizar medico
// ===============================

app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico!',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({ //Puede ser un nmbre vacio oer somehing like thata
                    ok: false,
                    mensaje: 'Error al Actualizar medico!',
                    errors: err
                });
            }

            // usuarioGuardado.password = '=D';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });
});


// ===============================
// Eliminar Medico
// ===============================

app.delete('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico!',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id ' + id,
                errors: { message: 'No existe un medico con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});


module.exports = app;
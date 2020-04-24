// Requires
var express = require('express');

// inicializar variables
var app = express();

//  Encriptar contraseñas
var bcrypt = require('bcryptjs');

var middleware = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');
// ===============================
// Obtener todos los usuarios
// ===============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5) //Paginar registros
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios!',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        totalUsers: conteo
                    });

                });


            });


});

// ===============================
// Actualizar usuario
// ===============================

app.put('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario!',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }



        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.img = body.img;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({ //Puede ser un nmbre vacio oer somehing like thata
                    ok: false,
                    mensaje: 'Error al Actualizar usuario!',
                    errors: err
                });
            }

            usuarioGuardado.password = '=D';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });
})

// ===============================
// Crear nuevo usuario
// ===============================

app.post('/', middleware.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Encriptacion de una sola via
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario!',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    })


});


// ===============================
// Eliminar usuario
// ===============================


app.delete('/:id', middleware.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar usuario!',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id ' + id,
                errors: { message: 'No existe un usuario con el id ' + id }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });


    });

});



module.exports = app;
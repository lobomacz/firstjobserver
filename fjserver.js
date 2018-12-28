
const express = require('express');
const app = express();
const puerto = 3000;

//const fs = require('fs');

var mw = require('./sessions/user-sessions.js');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = "mongodb://localhost:27017";
const dbName = "firstjobdb"

const client = new MongoClient(url);

//Gestion de Usuarios

app.get('/usuarios/:idUsuario', (req, res) => {
	var _uid = req.params.idUsuario;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.statusCode(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').findOne({_id:_uid}, (error, item) => {
				if(!error){
					res.json(item);
				}
			});
		}catch(e){
			res.statusCode(404);
		}
	});
});

app.get('/usuarios/sector/:sector', (req, res) => {

	var _sector = req.params.sector;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('usuarios').find({sector:_sector}).toArray((err, docs) => {
				if(err){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({"datos":docs});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
		}
	});

});

app.post('/usuarios/nuevo', (req, res) => {

	var obj = req.params.usuario;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('usuarios').insertOne(obj, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({"count":r.insertedCount});
			});
		}catch(e){
			console.error("Exception: ".concat(e.message));
			res.statusCode(404);
		}
		
	});

});

app.post('/usuarios/actualizar/:idUsuario', (req, res) => {

	var _uid = req.params.idUsuario;
	var _usuario = req.params.usuario;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('usuarios').updateOne({_id:_uid},{$set:_usuario},(err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json(r);
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});

});

app.post('/usuarios/eliminar/:idUsuario', (req, res) => {

	var _uid = req.params.idUsuario;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('usuarios').deleteOne({_id:_uid}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({"count":r.deletedCount});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});

});

app.get('/usuarios/:idUsuario/documentos/:idDocumento', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.post('/usuarios/:idUsuario/documentos/eliminar/:idDocumento', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.get('/usuarios/:idUsuario/imagenes/:idImagen', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.post('/usuarios/:idUsuario/imagenes/eliminar/:idImagen', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.get('/usuarios/:idUsuario/convocatorias', (req, res) => {

	const _uid = req.params.idUsuario;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('usuarios').find({_id:_uid},{fields:{"convocatorias":true}}, (err, doc) => {
			
		});
	});
});

app.get('/usuarios/:idUsuario/convocatorias/nuevo/:idConvocatoria', (req, res) => {

});

//Gestion de Empleadores

app.get('/empleadores/:idEmpleador', (req, res) => {
	var _id = req.params.idEmpleador;
});

app.post('/empleadores/sector/:sector', (req, res) => {

});

app.post('/empleadores/nuevo', (req, res) => {

});

app.post('/empleadores/actualizar/:idEmpleador', (req, res) => {

});

app.post('/empleadores/eliminar/:idEmpleador', (req, res) => {

});

/*
app.get('/empleadores/:idEmpleador/documentos/:idDocumento', (req, res) => {

});

app.post('/empleadores/:idUsuario/documentos/eliminar/:idDocumento', (req, res) => {

});
*/

app.get('/usuarios/:idUsuario/imagenes/:idImagen', (req, res) => {

});

app.post('/usuarios/:idUsuario/imagenes/eliminar/:idImagen', (req, res) => {

});

//Gestion de Convocatorias

app.get('/convocatorias/abiertas', (req, res) => {

});

app.get('/convocatorias/todas', (req, res) => {
	
});

app.get('/convocatorias/categoria/:idCategoria', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria/usuarios', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria/documento/nuevo', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria/documento/:idDocumento', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria/documento/eliminar/:idDocumento', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria/usuarios/nuevo/:idUsuario', (req, res) => {
	
});

app.post('/convocatorias/nuevo', (req, res) => {

});

app.post('/convocatorias/cerrar/:idConvocatoria', (req, res) => {
	
});

app.post('/convocatorias/eliminar/:idConvocatoria', (req, res) => {

});



//Gestion de Noticias

app.get('/noticias/todas', (req, res) => {

});

app.get('/noticias/categoria/:idCategoria', (req, res) => {

});

app.get('/noticias/fecha/:fechaNoticia', (req, res) => {

});

app.get('/noticias/rango/:fechaInicio/:fechaFinal', (req, res) => {

});

app.get('/noticias/:idNoticia', (req, res) => {
	
});

app.post('/noticias/nuevo', (req, res) => {

});

app.post('/noticias/editar/:idNoticia', (req, res) => {
	
});

app.post('/noticias/eliminar/:idNoticia', (req, res) => {
	
});

//Gestion de sectores y niveles educatvos



app.get('/', (req,res) => {
	res.sendStatus(404);
});



app.listen(puerto);
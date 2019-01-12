
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const puerto = 3000;

const fs = require('fs');

var mw = require('./sessions/user-sessions.js');
var users_dir = '/users_data/';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = "mongodb://localhost:27017";
const dbName = "firstjobdb";

const client = new MongoClient(url, { useNewUrlParser: true });

app.use(bodyParser.json()); //Soporte para datos codificados como json
app.use(bodyParser.urlencoded({ extended:true })); //Soporte para datos codificados

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
});

//Gestion de Usuarios

app.get('/usuarios/uid/:uid', (req, res) => {

	var _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').findOne({'uid':_uid}, (error, item) => {
				if(error){
					console.error(error.message);
					res.sendStatus(404);
				}

				res.json(item);
				
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});
});

app.get('/usuarios/count/:uid', (req, res) => {
	
	var _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').countDocuments({'uid':_uid}, (error, r) => {
				if(error){
					console.error(error.message);
					res.sendStatus(404);
				}

				res.json({'count':r});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
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
				client.close();
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
		}
	});

});

app.post('/usuarios/nuevo', (req, res) => {

	var obj = req.body.usuario;

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

app.post('/usuarios/actualizar/', (req, res) => {

	var _uid = req.body.usuario._id;
	var _usuario = req.body.usuario;

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

app.post('/usuarios/eliminar/', (req, res) => {

	var _uid = req.body.uid;

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

app.get('/usuarios/:idUsuario/fotos/:idImagen', (req, res) => {

	let _uid = req.params.idUsuario;
	let fotoName = req.params.idImagen;
	let dir = __dirname + users_dir;
	let user_img_dir = dir.concat('/',uid,'/fotos');

	if(!fs.existsSync(user_img_dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = user_img_dir.concat('/', fotoName);
		res.sendFile(fotoFile);
	}

});

app.post('/usuarios/fotos/nuevo', (req, res) => {

	let _uid = req.params.idUsuario;
	let foto = req.params.idImagen;
	let dir = __dirname + users_dir;
	let user_img_dir = dir.concat('/',uid,'/fotos');

	if(!fs.existsSync(user_img_dir)){
		fs.mkdir(user_img_dir, 0o750, (err) => {

		});
	}else{

	}

});

app.post('/usuarios/:idUsuario/imagenes/eliminar/:idImagen', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.get('/usuarios/:idUsuario/convocatorias', (req, res) => {

	const _uid = req.params.idUsuario;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('usuarios').find({_id:_uid},{fields:{"convocatorias":true}}, (err, doc) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({"datos":doc});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}

		
	});
});

app.get('/usuarios/:idUsuario/convocatorias/nuevo/:idConvocatoria', (req, res) => {

	const _uid = req.params.idUsuario;
	const _cid = req.params.idConvocatoria;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('usuarios').updateOne({_id:_uid},{$push:{convocatorias:_cid}},(err, r) => {
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

//Gestion de Empleadores

app.get("/empleadores/uid/:uid", (req, res) => {

	var _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection("empleadores").findOne({'uid':_uid}, (err, item) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}
				
				res.json(item);
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});
});

app.get("/empleadores/count/:uid", (req, res) => {

	var _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection("empleadores").countDocuments({'uid':_uid}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}
				
				res.json({'count':r});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});
});

app.get('/empleadores/sector/:sector', (req, res) => {

	const _sector = req.params.sector;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('empleadores').find({sector:_sector}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}
				
				res.json({datos:docs});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});

});

app.post('/empleadores/nuevo', (req, res) => {

	var obj = req.params.empleador;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{
			db.collection('empleadores').insertOne(obj, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}
				
				res.json({count:r.insertedCount});
				client.close();
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});

});

app.post('/empleadores/actualizar/:idEmpleador', (req, res) => {

	const _uid = req.params.idEmpleador;
	var obj = req.params.empleador;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		try{

			db.collection('empleadores').findOneAndUpdate({_id:_uid}, {$set:obj}, {upsert:true}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json(r);
				client.close();
			});

		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});

});

app.post('/empleadores/eliminar/:idEmpleador', (req, res) => {

});

/*
app.get('/empleadores/:idEmpleador/documentos/:idDocumento', (req, res) => {

});

app.post('/empleadores/:idUsuario/documentos/eliminar/:idDocumento', (req, res) => {

});
*/

app.get('/usuarios/:idUsuario/foto', (req, res) => {

	const _uid = req.params.idUsuario;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('usuarios').findOne({_id:_uid}, {fields:{'foto':1}}, (err, doc) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json(doc);
			client.close();
		});
	});


});
/*
app.post('/usuarios/:idUsuario//eliminar/:idImagen', (req, res) => {

});*/

//Gestion de Convocatorias

app.get('/convocatorias/abiertas', (req, res) => {

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('convocatorias').find({'estado':'abierta'}).toArray((err, docs) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json({'datos':docs});
			client.close();
		});
	});

});

app.get('/convocatorias/todas', (req, res) => {
	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('convocatorias').find({}).toArray((err, docs) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json({'datos':docs});
			client.close();
		});
	});
});

app.get('/convocatorias/categoria/:idCategoria/abiertas', (req, res) => {

	const _idCat = req.params.idCategoria;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('convocatorias').find({'estado':'abierta','categoria':_idCat}).toArray((err, docs) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json({'datos':docs});
			client.close();
		});
	});
});

app.get('/convocatorias/categoria/:idCategoria/todas', (req, res) => {

	const _idCat = req.params.idCategoria;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('convocatorias').find({'categoria':_idCat}).toArray((err, docs) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json({'datos':docs});
			client.close();
		});
	});
});

app.get('/convocatorias/:idConvocatoria', (req, res) => {

	const _idConv = req.params.idConvocatoria;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('convocatorias').findOne({_id:_idConv}, (err, r) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json(r);
			client.close();
		});
	});
	
});

app.get('/convocatorias/:idConvocatoria/usuarios', (req, res) => {
	const _idConv = req.params.idConvocatoria;

	client.connect((err, client) => {
		assert.equal(null, err);

		const db = client.db(dbName);

		db.collection('convocatorias').findOne({_id:_idConv}, {fields:{'usuarios':1}}, (err, r) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json({r});
			client.close();
		});
	});
});

app.post('/convocatorias/:idConvocatoria/usuarios/nuevo/:idUsuario', (req, res) => {
	const _idConv = req.params.idConvocatoria;
	const _uid = req.params.idUsuario;

	client.connect((err, client) => {
		assert.equal(null, err, err.message);

		const db = client.db(dbName);

		db.collection('convocatorias').findOneAndUpdate({_id:_idConv}, {$push:{usuarios:_uid}}, {returnOriginal:false}, (err, r) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json(r);
			client.close();
		});
	});
});

/*
app.post('/convocatorias/:idConvocatoria/documento/nuevo', (req, res) => {
	
});*/

app.get('/convocatorias/:idConvocatoria/documento/:idDocumento', (req, res) => {
	
});

app.get('/convocatorias/:idConvocatoria/documento/eliminar/:idDocumento', (req, res) => {
	
});

app.post('/convocatorias/nuevo', (req, res) => {

	var obj = req.params.convocatoria;

	client.connect((err, client) => {
		assert.equal(null, err, err.message);

		const db = client.db(dbName);

		db.collection('convocatorias').insertOne(obj, (err, r) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json({'count':r.insertedCount});
			client.close();
		});
	});
});

app.post('/convocatorias/cerrar/:idConvocatoria', (req, res) => {
	
	const _idConv = req.params.idConvocatoria;

	client.connect((err, client) => {
		assert.equal(null, err, err.message);

		const db = client.db(dbName);

		db.collection('convocatorias').findOneAndUpdate({_id:_idConv}, {$set:{'estado':'cerrada'}}, {returnOriginal:false}, (err, r) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json(r);
			client.close();
		});
	});
});

app.post('/convocatorias/eliminar/:idConvocatoria', (req, res) => {
	const _idConv = req.params.idConvocatoria;

	client.connect((err, client) => {
		assert.equal(null, err, err.message);

		const db = client.db(dbName);

		db.collection('convocatorias').findOneAndDelete({_id:_idConv}, {projection:{_id:1,usuarios:0}}, (err, r) => {
			if(err != null){
				console.error(err.message);
				res.statusCode(404);
			}

			res.json(r);
			client.close();
		});
	});
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


//Gestión de publicidad


//Gestión de contenido de inicio

//Auditoria de usuarios

app.post('/audit/', (req, res ) => {
	console.log('Ejecuta audit');

	const _uid = req.body.idUsuario;
	const accion = req.body.accion;
	console.log({'uid':_uid, 'accion':accion});

	var date = new Date();
	var fecha = date.toDateString();
	var hora = date.toLocaleTimeString();

	/*
	MongoClient.connect(url_db, { useNewUrlParser: true }, (err, db) => {
		
		//let _db = db(dbName);

		try{
			db.collection('audit').insertOne({'uid':_uid, 'accion':accion, 'fecha':fecha, 'hora':hora}, (err, r) => {
				if(err){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.insertedCount});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
		db.close();
	});*/

	
	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('audit').insertOne({'uid':_uid, 'accion':accion, 'fecha':fecha, 'hora':hora}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}
				
				res.json({'count':r.insertedCount});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});
});

app.get('/test', (req, res) => {
	console.log('Hola Node');
	res.send('Hola Node');
});

app.get('/', (req,res) => {
	res.sendStatus(404);
});



app.listen(puerto);
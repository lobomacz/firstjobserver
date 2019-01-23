
const express = require('express');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const app = express();
const puerto = 3000;

const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;

var mw = require('./sessions/user-sessions.js');
var users_dir = '/usuarios/';
var employers_dir = '/empleadores/';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = "mongodb://localhost:27017";
const dbName = "firstjobdb";

const client = new MongoClient(url, { useNewUrlParser: true });

app.use(fileupload());
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
			db.collection('usuarios').findOne({_id:_uid}, (error, item) => {
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
			db.collection('usuarios').countDocuments({_id:_uid}, (error, r) => {
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
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

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
			res.sendStatus(404);
		}
	});

});

app.post('/usuarios/nuevo', (req, res) => {

	var obj = req.body.usuario;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').insertOne(obj, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({"count":r.insertedCount});
			});
		}catch(e){
			console.error("Exception: ".concat(e.message));
			res.sendStatus(404);
		}
		
	});

});

app.post('/usuarios/actualizar/', (req, res) => {

	var _uid = req.body.usuario._id;
	var _usuario = req.body.usuario;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').updateOne({_id:_uid},{$set:_usuario}, {upsert:false},(err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json(r);
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});

});

app.post('/usuarios/eliminar/', (req, res) => {

	var _uid = req.body.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

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
			res.sendStatus(404);
		}
	});

});

app.post('/usuarios/perfil/cerrar', (req, res) => {

	var _uid = req.body.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').findOneAndUpdate({_id:_uid},{$set:{'activo':false}}, {returnOriginal:false}, (error, r) => {
				if(error != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json(r);
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});
});

app.get('/usuarios/:idUsuario/documentos/:idDocumento', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.post('/usuarios/:idUsuario/documentos/eliminar/:idDocumento', (req, res) => {
	//PENDIENTE IMPLEMENTACION CON FILESYSTEM
});

app.post('/usuarios/:uid/img/upload', (req, res) => {
	
	let userId = req.params.uid;
	let fotoFile = req.files.foto;
	let fileName = fotoFile.name;

	
	let users_dirname = __dirname.concat(users_dir);
	let user_img_dir = users_dirname.concat('/', userId, '/fotos');
	let fotoUrl = user_img_dir.concat('/', fileName)

	if(!fs.existsSync(user_img_dir)){
		fs.mkdir(user_img_dir, {recursive:true}, function(err) {
			if(!err){
				fs.appendFile(fotoUrl, fotoFile.data, function(error) {
					if(!error){
						res.json({'count':1});
					}else{
						console.error(error.message);
						res.sendStatus(404);
					}
				});
			}
		})
	}else{
		fs.appendFile(fotoUrl, fotoFile.data, function(error) {
			if(!error){
				res.json({'count':1});
			}else{
				console.error(error.message);
				res.sendStatus(404);
			}
		});
	}

});

app.post('/usuarios/:uid/img/delete', (req, res) => {
	let _uid = req.params.uid;
	let fileName = req.body.foto;
	let fileUrl = __dirname.concat(users_dir, '/', _uid, '/fotos/', fileName);
	
	if (fs.existsSync(fileUrl)) {
		fs.unlink(fileUrl, function(err) {
			if (!err) {
				
				res.json({'count':1});
			}else{
				console.error(error.message);
				res.sendStatus(404);
			}
		})
	}else{
		console.error('Acceso a ruta no valida.');
		res.sendStatus(404);
	}
});

app.get('/usuarios/:uid/img/:foto', (req, res) => {

	let _uid = req.params.uid;
	let fileName = req.params.foto;

	const dir = __dirname.concat(users_dir, '/', _uid, '/fotos');

	if(!fs.existsSync(dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fileName);
		res.sendFile(fotoFile);
	}
});

app.get('/usuarios/img/:foto', (req, res) => {
	
	const dir = __dirname.concat(users_dir, 'img');
	let fileName = req.params.foto;
	

	if(!fs.existsSync(dir)){
		onsole.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{

		let fotoFile = dir.concat('/', fileName);
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
			db.collection("empleadores").findOne({_id:_uid}, (err, item) => {
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
			db.collection("empleadores").countDocuments({_id:_uid}, (err, r) => {
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
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

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

app.get('/empleadores/nombres', (req, res) => {

	const _sector = req.params.sector;

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('empleadores').find({},{projection:{nombreLargo:1,nombreCorto:1}}).toArray((err, docs) => {
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

	var obj = req.body.empleador;

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('empleadores').insertOne(obj, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}
				
				res.json({count:r.insertedCount});
				client.close();
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});

});

app.post('/empleadores/actualizar/', (req, res) => {

	const _uid = req.body.uid;
	var obj = req.body.empleador;

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('empleadores').findOneAndUpdate({_id:_uid}, {$set:obj}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json(r);
				client.close();
			});

		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});

});

app.post('/empleadores/eliminar', (req, res) => {

	const _uid = req.body.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('empleadores').deleteOne({_id:_uid}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.deletedCount});

			});

		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}

	});

});

app.post('/empleadores/perfil/cerrar', (req, res) => {

	var _uid = req.body.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('empleadores').findOneAndUpdate({_id:_uid},{$set:{'activo':false}}, {returnOriginal:false}, (error, r) => {
				if(error != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json(r);
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});
});


app.get('/empleadores/img/:imagen', (req, res) => {

	const dir = __dirname.concat(employers_dir, 'img');
	let fileName = req.params.imagen;

	if(!fs.existsSync(dir)){
		onsole.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fileName);
		res.sendFile(fotoFile);
	}

});

app.get('/empleadores/:uid/img/:imagen', (req, res) => {

	let _uid = req.params.uid;
	let fotoName = req.params.imagen;
	let dir = __dirname.concat(employers_dir, '/', _uid, '/img');
	

	if(!fs.existsSync(dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fotoName);
		res.sendFile(fotoFile);
	}

});

app.post('/empleadores/:uid/img/upload', (req, res) => {
	
	let userId = req.params.uid;
	let fotoFile = req.files.foto;
	let fileName = fotoFile.name;

	
	let employers_dirname = __dirname.concat(employers_dir);
	let employer_img_dir = employers_dirname.concat('/', userId, '/img');
	let fotoUrl = employer_img_dir.concat('/', fileName)

	if(!fs.existsSync(employer_img_dir)){
		fs.mkdir(employer_img_dir, {recursive:true}, function(err) {
			if(!err){
				fs.appendFile(fotoUrl, fotoFile.data, function(error) {
					if(!error){
						res.json({'count':1});
					}else{
						console.error(error.message);
						res.sendStatus(404);
					}
				});
			}
		})
	}else{
		fs.appendFile(fotoUrl, fotoFile.data, function(error) {
			if(!error){
				res.json({'count':1});
			}else{
				console.error(error.message);
				res.sendStatus(404);
			}
		});
	}

});

app.post('/empleadores/:uid/img/delete', (req, res) => {
	let _uid = req.params.uid;
	let fileName = req.body.foto;
	let fileUrl = __dirname.concat(employers_dir, '/', _uid, '/img/', fileName);
	
	if (fs.existsSync(fileUrl)) {
		fs.unlink(fileUrl, function(err) {
			if (!err) {
				
				res.json({'count':1});
			}else{
				console.error(error.message);
				res.sendStatus(404);
			}
		})
	}else{
		console.error('Acceso a ruta no valida.');
		res.sendStatus(404);
	}
});

/*
app.get('/empleadores/:idEmpleador/documentos/:idDocumento', (req, res) => {

});

app.post('/empleadores/:idUsuario/documentos/eliminar/:idDocumento', (req, res) => {

});


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

//Gestion de Plazas

app.get('/plazas/todas', (req, res) => {

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').find({}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'datos':docs});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.get('/plazas/abiertas', (req, res) => {

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').find({'abierta':true}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'datos':docs});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.get('/plazas/:uid/abiertas', (req, res) => {

	let _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').find({'abierta':true, 'idEmpleador':_uid}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'datos':docs});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.get('/plazas/:uid', (req, res) => {

	let _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').find({'idEmpleador':_uid}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'datos':docs});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/plazas/nueva', (req, res) => {

	let obj = req.body.plaza;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').insertOne(obj, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.insertedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/plazas/:id/actualizar', (req, res) => {

	let _uid = req.params.id;
	let oid = new ObjectId(_uid);
	let obj = req.body.plaza;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').updateOne({_id:oid}, {$set:obj}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.updatedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/plazas/cerrar', (req, res) => {

	let _uid = req.body.id;
	let oid = new ObjectId(_uid);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').updateOne({_id:oid}, {$set:{'abierta':false}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.updatedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/plazas/:id/aplicar', (req, res) => {

	let _uid = req.body.uid;

	let oid = new ObjectId(req.params.id);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').updateOne({_id:oid}, {$push:{'aplicantes':_uid}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.updatedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/plazas/:id/retirar', (req, res) => {

	let _uid = req.body.uid;

	let oid = new ObjectId(req.params.id);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').updateOne({_id:oid}, {$pull:{'aplicantes':_uid}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.updatedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.get('/plazas/:id/usuario/:uid', (req, res) => {

	let _uid = req.params.uid;
	let oid = new ObjectId(req.params.id);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').countDocuments({$and:[{_id:oid,},{aplicantes:{$in:[_uid]}}]}, (err, r) => {
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

//

//Gestion de sectores y niveles educatvos

app.get('/nivelesacademicos', (req, res) => {

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('nivelesacademicos').find({}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({'datos':docs});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});
});

app.get('/nivelesacademicos/:id', (req, res) => {

	const uid = req.params.id;
	var oid = new ObjectId(uid);

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('nivelesacademicos').findOne({_id:oid}, {descripcion:1}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({'dato':r});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});
});

app.get('/sectores', (req, res) => {

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("sectores").find({}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({'datos':docs});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});
});

app.get('/sectores/:id', (req, res) => {

	const uid = req.params.id;
	var oid = new ObjectId(uid);

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("sectores").findOne({_id:oid}, {descripcion:1}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({'dato':r});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}
	});
});

app.get('/etnias', (req, res) => {
	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("etnias").find({}).toArray((err, docs) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({'datos':docs});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}

	});
});


app.get('/etnias/:id', (req, res) => {

	const uid = req.params.id;
	var o_id = new ObjectId(uid);

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("etnias").findOne({_id:o_id}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({'dato':r});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.statusCode(404);
		}

	});
});

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

const express = require('express');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const app = express();
const puerto = 3000;

const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;

//var mw = require('./sessions/user-sessions.js');//Middlewear para verificación de token de sesion firebase.
var users_dir = '/usuarios/';
var employers_dir = '/empleadores/';
var public_dir = '/publico/';

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

app.post('/usuarios/aplicantes', (req, res) => {

	var _aplicantes = req.body.aplicantes;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('usuarios').find({_id:{$in:_aplicantes}}).toArray((err, docs) => {
				if(err){
					console.error(err.message);
					res.statusCode(404);
				}

				res.json({"datos":docs});
				
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


app.post('/usuarios/:uid/curriculum/upload', (req, res) => {
	
	let userId = req.params.uid;
	let docFile = req.files.documento;
	let fileName = docFile.name;

	
	let users_dirname = __dirname.concat(users_dir);
	let user_file_dir = users_dirname.concat('/', userId, '/documentos');
	let fileUrl = user_file_dir.concat('/', fileName)

	if(!fs.existsSync(user_file_dir)){
		fs.mkdir(user_file_dir, {recursive:true}, function(err) {
			if(!err){
				fs.appendFile(fileUrl, docFile.data, function(error) {
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
		fs.appendFile(fileUrl, docFile.data, function(error) {
			if(!error){
				res.json({'count':1});
			}else{
				console.error(error.message);
				res.sendStatus(404);
			}
		});
	}

});

app.get('/usuarios/:uid/curriculum/:file', (req, res) => {

	let _uid = req.params.uid;
	let fileName = req.params.file;
	let dir = __dirname.concat(users_dir, '/', _uid, '/documentos');
	

	if(!fs.existsSync(dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let docFile = dir.concat('/', fileName);
		res.sendFile(docFile);
	}

});

app.post('/usuarios/:uid/curriculum/delete', (req, res) => {
	let _uid = req.params.uid;
	let fileName = req.body.documento;
	let fileUrl = __dirname.concat(users_dir, '/', _uid, '/documentos/', fileName);
	
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

app.get('/usuarios/:uid/curriculum', (req, res) => {

	let _uid = req.params.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('curriculums').findOne({_id:_uid}, (err, r) => {
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

//Gestión de Curriculums de Usuarios

app.post('/curriculums/nuevo', (req, res) => {
	console.log('Insertar Curriculum');
	var obj = req.body.curriculum;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('curriculums').insertOne(obj, (err, r) => {
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

app.post('/curriculums/actualizar/', (req, res) => {

	var _uid = req.body.uid;
	var _obj = req.body.curriculum;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('curriculums').updateOne({_id:_uid},{$set:_obj}, {upsert:true},(err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});
		}catch(e){
			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);
		}
	});

});

app.post('/curriculums/eliminar/', (req, res) => {

	var _uid = req.body.uid;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('curriculums').deleteOne({_id:_uid}, (err, r) => {
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

app.post('/empleadores/:uid/documento/upload', (req, res) => {
	
	let userId = req.params.uid;
	let docFile = req.files.documento;
	let fileName = docFile.name;

	
	let employers_dirname = __dirname.concat(employers_dir);
	let employer_file_dir = employers_dirname.concat('/', userId, '/documentos');
	let fileUrl = employer_file_dir.concat('/', fileName)

	if(!fs.existsSync(employer_file_dir)){
		fs.mkdir(employer_file_dir, {recursive:true}, function(err) {
			if(!err){
				fs.appendFile(fileUrl, docFile.data, function(error) {
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
		fs.appendFile(fileUrl, docFile.data, function(error) {
			if(!error){
				res.json({'count':1});
			}else{
				console.error(error.message);
				res.sendStatus(404);
			}
		});
	}

});

app.get('/empleadores/:uid/documento/:file', (req, res) => {

	let _uid = req.params.uid;
	let fileName = req.params.file;
	let dir = __dirname.concat(employers_dir, '/', _uid, '/documentos');
	

	if(!fs.existsSync(dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let docFile = dir.concat('/', fileName);
		res.sendFile(docFile);
	}

});

app.post('/empleadores/:uid/documento/delete', (req, res) => {
	let _uid = req.params.uid;
	let fileName = req.body.documento;
	let fileUrl = __dirname.concat(employers_dir, '/', _uid, '/documentos/', fileName);
	
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

app.get('/plazas/empleador/:uid/abiertas', (req, res) => {

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

app.get('/plazas/empleador/:uid', (req, res) => {

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

app.get('/plazas/:uid', (req, res) => {

	let _uid = req.params.uid;
	let oid = new ObjectId(_uid);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').findOne({_id:oid}, (err, r) => {
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

app.get('/plazas/:uid/aplicantes', (req, res) => {

	let _uid = req.params.uid;
	let oid = new ObjectId(_uid);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('plazas').findOne({_id:oid}, {projection:{aplicantes:1,_id:0}}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'datos':r});
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

				res.json({'count':r.modifiedCount});
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

			db.collection('plazas').updateOne({_id:oid}, {$push:{'aplicantes':_uid}}, {upsert:true}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}
				console.log(r);

				res.json({'count':r.modifiedCount});
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

				res.json({'count':r.modifiedCount});
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

//Gestion de Convocatorias

app.get('/convocatorias/todas', (req, res) => {

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('convocatorias').find({}).sort({'timeStamp':1}).toArray((err, docs) => {
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

app.get('/convocatorias/fechas/:inicio/:final', (req, res) => {

	let fInicio = req.params.inicio;
	let fFinal = req.params.final;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('convocatorias').find({$and:[{'fechaPublicacion':{$gt:fInicio}},{'fechaPublicacion':{$lt:fFinal}}]}).sort({'timeStamp':1}).toArray((err, docs) => {
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

app.get('/convocatorias/:id', (req, res) => {

	let _uid = req.params.id;
	let oid = new ObjectId(_uid);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('convocatorias').findOne({_id:oid}, (err, r) => {
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


app.post('/convocatorias/nueva', (req, res) => {

	let obj = req.body.convocatoria;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('convocatorias').insertOne(obj, (err, r) => {
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

app.post('/convocatorias/:id/actualizar', (req, res) => {

	let _uid = req.params.id;
	let oid = new ObjectId(_uid);
	let obj = req.body.convocatoria;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('convocatorias').updateOne({_id:oid}, {$set:obj}, {upsert:false}, (err, r) => {
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


app.post('/nivelesacademicos/nuevo', (req, res) => {

	let obj = req.body.nivel;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('nivelesacademicos').insertOne(obj, (err, r) => {
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

app.post('/nivelesacademicos/actualizar', (req, res) => {

	let obj = req.body.nivel;
	let oid = new ObjectId(obj._id);
	

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('nivelesacademicos').updateOne({_id:oid}, {$set:{'descripcion':obj.descripcion,'siglas':obj.siglas}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/nivelesacademicos/eliminar', (req, res) => {

	const _id = req.body.nivel._id;
	let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('nivelesacademicos').deleteOne({_id:oid}, (err, r) => {
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


app.post('/sectores/nuevo', (req, res) => {

	let obj = req.body.sector;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('sectores').insertOne(obj, (err, r) => {
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

app.post('/sectores/actualizar', (req, res) => {

	let obj = req.body.sector;
	let _id = obj._id;
	let oid = new ObjectId(_id);
	

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('sectores').updateOne({_id:oid}, {$set:{'descripcion':obj.descripcion,'descripcion_corta':obj.descripcion_corta}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/sectores/eliminar', (req, res) => {

	const _id = req.body.sector._id;
	let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('sectores').deleteOne({_id:oid}, (err, r) => {
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

app.post('/etnias/nueva', (req, res) => {

	let obj = req.body.etnia;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('etnias').insertOne(obj, (err, r) => {
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

app.post('/etnias/:id/actualizar', (req, res) => {

	let _id = req.params.id;
	let oid = new ObjectId(_id);
	let obj = req.body.etnia;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('etnias').updateOne({_id:oid}, {$set:obj}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/etnias/eliminar', (req, res) => {

	const _id = req.body.id;
	let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('etnias').deleteOne({_id:oid}, (err, r) => {
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

app.get('/categorias', (req, res) => {
	
	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("categorias").find({}).toArray((err, docs) => {
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


app.get('/categorias/:id', (req, res) => {

	const uid = req.params.id;
	var o_id = new ObjectId(uid);

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("categorias").findOne({_id:o_id}, (err, r) => {
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

app.post('/categorias/nueva', (req, res) => {

	let obj = req.body.categoria;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('categorias').insertOne(obj, (err, r) => {
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

app.post('/categorias/actualizar', (req, res) => {
	console.log('Actualizar Categoria');

	let obj = req.body.categoria;
	let oid = new ObjectId(obj._id);
	console.log(oid);
	//let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('categorias').updateOne({_id:oid}, {$set:{'descripcion':obj.descripcion, 'descripcion_corta':obj.descripcion_corta}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/categorias/eliminar', (req, res) => {

	const _id = req.body.categoria._id;
	let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('categorias').deleteOne({_id:oid}, (err, r) => {
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

//Gestión de publicidad


app.get('/spots', (req, res) => {
	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("spots").find({}).sort({'bloque':1}).toArray((err, docs) => {
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


app.get('/spots/:id', (req, res) => {

	const uid = req.params.id;
	var o_id = new ObjectId(uid);

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("spots").findOne({_id:o_id}, (err, r) => {
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

app.get('/spots/bloque/:idBloque', (req, res) => {

	const bloque = req.params.idBloque;
	//var o_id = new ObjectId(uid);

	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("spots").findOne({'bloque':bloque}, (err, r) => {

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

app.post('/spots/nuevo', (req, res) => {

	let obj = req.body.spot;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('spots').insertOne(obj, (err, r) => {
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

app.post('/spots/actualizar', (req, res) => {

	let obj = req.body.spot;
	let _id = obj._id;
	let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('spots').updateOne({_id:oid}, {$set:{'bloque':obj.bloque,'propietario':obj.propietario,'imagen':obj.imagen,'activado':obj.activado}}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/spots/eliminar', (req, res) => {

	const _id = req.body.id;
	let oid = new ObjectId(_id);

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('spots').deleteOne({_id:oid}, (err, r) => {
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


app.get('/spots/img/:imagen', (req, res) => {

	const dir = __dirname.concat(public_dir, 'img');
	let fileName = req.params.imagen;

	if(!fs.existsSync(dir)){
		onsole.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fileName);
		res.sendFile(fotoFile);
	}

});

app.get('/spots/:bloque/img/:imagen', (req, res) => {

	let bloque = req.params.bloque;
	let fotoName = req.params.imagen;
	let dir = __dirname.concat(public_dir, '/', bloque, '/img');
	

	if(!fs.existsSync(dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fotoName);
		res.sendFile(fotoFile);
	}

});

app.post('/spots/:bloque/img/upload', (req, res) => {
	
	let bloque = req.params.bloque;
	let fotoFile = req.files.foto;
	let fileName = fotoFile.name;

	
	let public_dirname = __dirname.concat(public_dir);
	let seccion_img_dir = public_dirname.concat('/', bloque, '/img');
	let fotoUrl = seccion_img_dir.concat('/', fileName)

	if(!fs.existsSync(seccion_img_dir)){
		fs.mkdir(seccion_img_dir, {recursive:true}, function(err) {
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

app.post('/spots/:bloque/img/delete', (req, res) => {
	let bloque = req.params.bloque;
	let fileName = req.body.foto;
	let fileUrl = __dirname.concat(public_dir, '/', bloque, '/img/', fileName);
	
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

//Gestión de contenido de inicio

app.get('/secciones', (req, res) => {
	client.connect((err, client) => {
		if(err){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName)

		try{
			db.collection("secciones").find({}).sort({'bloque':1}).toArray((err, docs) => {
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

app.post('/secciones/nueva', (req, res) => {

	let obj = req.body.seccion;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('secciones').insertOne(obj, (err, r) => {
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

app.post('/secciones/:id/actualizar', (req, res) => {

	let _uid = req.params.id;
	let oid = new ObjectId(_uid);
	let obj = req.body.seccion;

	client.connect((err, client) => {
		if(err != null){
			console.error(err.message);
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{

			db.collection('secciones').updateOne({_id:oid}, {$set:obj}, {upsert:false}, (err, r) => {
				if(err != null){
					console.error(err.message);
					res.sendStatus(404);
				}

				res.json({'count':r.modifiedCount});
			});

		}catch(e){

			console.error("Excepcion: ".concat(e.message));
			res.sendStatus(404);

		}

		
	});

});

app.post('/secciones/eliminar', (req, res) => {

	const _uid = req.body.uid;
	let oid = new ObjectId(_uid);

	client.connect((err, client) => {
		if(err != null){
			console.error('Error al conectar con MongoDb');
			res.sendStatus(404);
		}

		const db = client.db(dbName);

		try{
			db.collection('secciones').deleteOne({_id:oid}, (err, r) => {
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

app.get('/secciones/img/:imagen', (req, res) => {

	const dir = __dirname.concat(public_dir, 'img');
	let fileName = req.params.imagen;

	if(!fs.existsSync(dir)){
		onsole.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fileName);
		res.sendFile(fotoFile);
	}

});

app.get('/secciones/:id/img/:imagen', (req, res) => {

	let _id = req.params.id;
	let fotoName = req.params.imagen;
	let dir = __dirname.concat(public_dir, '/', _id, '/img');
	

	if(!fs.existsSync(dir)){
		console.error('Acceso a directorio que no existe.');
		res.sendStatus(404);
	}else{
		let fotoFile = dir.concat('/', fotoName);
		res.sendFile(fotoFile);
	}

});

app.post('/secciones/:id/img/upload', (req, res) => {
	
	let seccionId = req.params.id;
	let fotoFile = req.files.foto;
	let fileName = fotoFile.name;

	
	let public_dirname = __dirname.concat(public_dir);
	let seccion_img_dir = public_dirname.concat('/', seccionId, '/img');
	let fotoUrl = seccion_img_dir.concat('/', fileName)

	if(!fs.existsSync(seccion_img_dir)){
		fs.mkdir(seccion_img_dir, {recursive:true}, function(err) {
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

app.post('/secciones/:id/img/delete', (req, res) => {
	let _id = req.params.id;
	let fileName = req.body.foto;
	let fileUrl = __dirname.concat(public_dir, '/', _id, '/img/', fileName);
	
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


//Auditoria de usuarios

app.post('/audit/', (req, res ) => {

	const _uid = req.body.idUsuario;
	const accion = req.body.accion;

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
	res.send('Hola Node');
});

app.get('/', (req,res) => {
	res.sendStatus(404);
});



app.listen(puerto);
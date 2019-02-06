
var admin = require("firebase-admin");

var serviceAccount = require("./keys/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firstjobapp-ba90d.firebaseio.com"
});

module.exports = function(req, res, next){

	var userToken = req.params.userToken;

	admin.auth().verifyIdToken(userToken).then((decodedToken) => {
		var uid = decodedToken.uid;
		if(uid != undefined){
			next();
		}else{
			res.sendStatus(404);
		}
	}).catch(()=>{
		res.sendStatus(404);
	});
}
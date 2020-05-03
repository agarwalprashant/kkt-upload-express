const express = require('express')
const bodyParser= require('body-parser')
const app = express()
const multer = require('multer');

// const mongoose = require("mongoose");
// const userSchema = require("./userSchema.js");
// const User = mongoose.model("user", userSchema, "user");

// const connectionString = "mongodb+srv://agarwalprashant1408:prashant1408@cluster0-4ohi3.mongodb.net/test?retryWrites=true&w=majority";
// const connectionString = "mongodb://localhost:27017";


// async function createUser(username) {
//   return new User({
//     username,
//     created: Date.now()
//   }).save();
// }

// async function findUser(username) {
//   return await User.findOne({ username });
// }

// (async () => {
//   const connector = mongoose.connect(connectionString);
//   const username = process.argv[2].split("=")[1];

//   let user = await connector.then(async () => {
//     return findUser(username);
//   });

//   if (!user) {
//     user = await createUser(username);
//   }

//   console.log(user);
//   process.exit(0);
// })();


fs = require('fs-extra')
app.use(bodyParser.urlencoded({extended: true}))

const MongoClient = require('mongodb').MongoClient
ObjectId = require('mongodb').ObjectId

const myurl = 'mongodb://localhost:27017';
// const myurl = 'mongodb+srv://agarwalprashant1408:prashant1408@cluster0-4ohi3.mongodb.net/test?retryWrites=true&w=majority';


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })






MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err)
  db = client.db('test') 
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');

});

// upload single file

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)

  }
  db.collection('mycollection').insertOne(file, (err, result) => {
  	console.log(result)

    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  
    
  })

 
    res.send(file)
 
})
//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }

    res.send(files)
 
})


app.post('/uploadphoto', upload.single('picture'), (req, res) => {
	var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database
 
 var finalImg = {
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   };
db.collection('mycollection').insertOne(finalImg, (err, result) => {
  	console.log(result)

    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  
    
  })
})


app.get('/photos', (req, res) => {
db.collection('mycollection').find().toArray((err, result) => {

  	const imgArray= result.map(element => element._id);
			console.log(imgArray);

   if (err) return console.log(err)
   res.send(imgArray)

  
   
  })
});

app.get('/photo/:id', (req, res) => {
var filename = req.params.id;

db.collection('mycollection').findOne({'_id': ObjectId(filename) }, (err, result) => {

    if (err) return console.log(err)

   res.contentType('image/jpeg');
   res.send(result.image.buffer)
  
   
  })
})



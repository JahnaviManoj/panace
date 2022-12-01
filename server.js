const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
var fs = require('fs');
const multer = require('multer');

app.use(bodyParser.json());

//to run stt.py
const spawn = require("child_process").spawn;
const pythonProcess = spawn('python',["stt.py"]);


const mongoose = require("mongoose");

const mongoDB = "mongodb://localhost:27017/speech2text2";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
    console.log("Connected successfully");
  });

const sttSchema = new mongoose.Schema({
  user: String,
  status: String,
  fileid: String,
  gender: String
})

var stt = mongoose.model('stt', sttSchema);
module.exports = stt;

//for creating unique filename
const { v4: uuidv4 } = require('uuid');

var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, __dirname + '/public/uploads/in');
   },
   filename: function (req, file, cb) {
      var file_id = uuidv4();
      var new_name = file_id + '.wav'
      cb(null, new_name);
   }
});

var upload = multer({ storage: storage });

// to upload the file
app.post('/api/stt', upload.single('audio'),(req, res) => {
    file_name = req.file.filename
    file_name = file_name.substring(0, file_name.length - 4)
    var trial = new stt({ user: req.body.user, status: 'new', fileid: file_name, gender: 'to change'});
    trial.save()
  const audio = req.audio;
    res.send(apiResponse({message: 'File uploaded successfully.', audio}));
});


app.get('/api/stt',async (req, res) => {

    var arr = []
    for await (const result of stt.find()) {
        arr.push({
            "user": result.user, 
            "fileid": result.fileid, 
            "status": result.status, 
            "gender": result.gender})
    }
    res.send(apiResponse(arr));
 });

app.get('/api/stt/:id', (req, res) => {
    var file_path = path.join(__dirname+'/public/uploads/out/'+req.params.id+'.txt');
    res.sendFile(file_path)
})

// for previous recordings
app.get('/api/stt/prev/:id',async (req, res) => {
  var arr = []
  for await (const result of stt.find()) {
    if(result.user == req.params.id){
      var file_path = path.join(__dirname+'/public/uploads/out/'+result.fileid+'.txt');
      var data = fs.readFileSync(file_path, 'utf8');
      arr.push(data)
    }
  }
  res.send(apiResponse(arr))
})

function apiResponse(results){
    return JSON.stringify({"status": 200, "error": null, "response": results});
}

app.use(express.static(path.join(__dirname, '/public')));

// default URL for website
app.use('/default', function(req,res){
    res.sendFile(path.join(__dirname+'/views/index.html'));
  });

//Server listening
app.listen(3000,() =>{
   console.log('Server started on port 3000...');
   console.log('Visit http://localhost:3000/default');
 });
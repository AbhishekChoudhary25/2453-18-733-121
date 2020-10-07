// requiring express modules
var express= require('express');
var app=express();

// to intialize middleware
let server= require('./server');
let middleware= require('./middleware');

// requiring bodyParser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//requiring mongodb and connecting to the data base
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement';
let db
MongoClient.connect(url, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

//Hopistal Details
app.get('/hospitalDetails',middleware.checkToken,function(req,res) {
  var data = db.collection('hospitalDetails');
  data.find().toArray(function(err,result) {
    if(!err) {
      res.json(result);
      console.log("Success");
    }
  });
});

//ventilator Details
app.get('/ventilatorDetails',middleware.checkToken,function(req,res) {
  var data = db.collection('ventilatorDetails');
  data.find().toArray(function(err,result) {
    if(!err) {
      res.json(result);
      console.log("Success");
    }
  });
});

//hospitalDetails by name
app.get('/hospitalDetailsByName',middleware.checkToken,function(req,res){
  var data = db.collection('hospitalDetails');
  var hosp = req.query.name;
  data.find({name:hosp}).toArray().then(result => {res.json(result)});
});

// search ventilator by hospital Name
app.get("/ventsByName",middleware.checkToken,function(req,res){
  var data = db.collection('ventilatorDetails');
  var name = req.query.name;
  data.find({name:name}).toArray().then(result => {res.json(result)});
});

//search ventilator by status
app.get('/ventilatorByStatus',middleware.checkToken,function(req,res){
  var data=db.collection('ventilatorDetails');
  var stat = req.query.status;
  data.find({status:stat}).toArray().then(result => {res.json(result)});
});

//Update ventilator Details
app.put('/updateVents',middleware.checkToken,function(req,res){
    console.log("updating data of ventilators collection");
    var v={ventilatorId:req.query.vid};
    var status={$set: {status:req.query.status}};
    db.collection('ventilatorDetails').updateOne(v,status,function(err,res){
        console.log("updated");
    });
    db.collection('ventilators').find().toArray().then(result => res.send(result));
    res.send("data updated");
});

//add ventilator
app.post('/ad',middleware.checkToken,function(req,res){
    console.log("adding data to ventilators collection");
    var v=req.body.vid;
    var status=req.body.status;
    console.log(v);
    var h=req.body.hid;
    var name;
    db.collection('hospitalDetails').find({hId:h},{projection:{ _id:0, name:1 }}).toArray().then(result => {
    var obj={hId:h,ventilatorId:v,status:status,name:result}
    console.log(result);
    db.collection('ventilatorDetails').insertOne(obj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
    });

});
    db.collection('ventilatorDetails').find().toArray().then(result => res.send(result));
    res.send("data posted");
});

//delete ventilator
app.delete('/deleteVent',middleware.checkToken,function(req,res){
    console.log("deleting data of ventilators collection");
    var v={ventilatorId:req.query.vid};
    db.collection('ventilatorDetails').deleteOne(v, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        });
    db.collection('ventilatorDetails').find().toArray().then(result => res.send(result));
});




//Listening to the port
app.listen(3000,function() {
  console.log("server on at 3000");
});

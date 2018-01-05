let express = require("express");
let bodyParser = require("body-parser");
let path=require('path');
let mongodb = require("mongodb");
MONGODB_URI ="mongodb://akhil1672:akhil1672@ds135817.mlab.com:35817/meanapp1672";
let ObjectID = mongodb.ObjectID;
let CONTACTS_COLLECTION = "contacts";

let app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));
var db;
mongodb.MongoClient.connect(MONGODB_URI, function (err, database) {
    if (err) {
        console.log(err);
    }
    db=database;
    console.log("Database connection ready");
    let server = app.listen(process.env.PORT || 8080, function () {
        let port = server.address().port;
        console.log("App now running on port", port);
    });
});

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
}

 app.get('/',function(req,res){
     res.sendFile('index.html', { root: 'src' });
 })

app.get("/api/contacts", function (req, res) {
    mongodb.MongoClient.connect(MONGODB_URI, function (err, db){
    db.collection(CONTACTS_COLLECTION).find({}).toArray(function (err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });
});
});

app.post("/api/contacts", function (req, res) {
    let newContact = req.body;
    newContact.createDate = new Date();

    if (!req.body.name) {
        handleError(res, "Invalid user input", "Must provide a name.", 400);
    }
    mongodb.MongoClient.connect(MONGODB_URI, function (err, db){
    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
});
});

app.get("/api/contacts/:id", function (req, res) {
    db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
});

app.put("/api/contacts/:id", function (req, res) {
    let updateDoc = req.body;
    delete updateDoc._id;

    db.collection(CONTACTS_COLLECTION).updateOne({ _id: new ObjectID(req.params.id) }, updateDoc, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update contact");
        } else {
            updateDoc._id = req.params.id;
            res.status(200).json(updateDoc);
        }
    });
});

app.delete("/api/contacts/:id", function (req, res) {
    db.collection(CONTACTS_COLLECTION).deleteOne({ _id: new ObjectID(req.params.id) }, function (err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(200).json(req.params.id);
        }
    });
});
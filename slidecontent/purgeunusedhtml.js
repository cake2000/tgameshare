// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:3001/meteor';



function purse() {

    var url2 = 'mongodb+srv://upliftingtechnology:ABCD1234!!@tgamesharedplan-b45ae.mongodb.net/tgame?retryWrites=true&w=majority';

  MongoClient.connect(url2, function(err, client) {
    console.log("connectd ");
    var db2 = client.db("tgame");

    console.log("db is " + JSON.stringify(Object.keys(db2)));


    // var users = db1.collection('users');
    var SlideContent = db2.collection('SlideContent');
    // var allchats = UserChat.find({ }, { fields: { 'scenarioId':1, 'userId': 1, 'chats.createdAt': 1, 'chats.actionType': 1 } }).fetch();
  

    SlideContent.find({}, {_id: 1, versionID: 1}).toArray(function(err, slides) {
          if (err) {
              console.log(err);
          } else {
                const files = slides.map((f) => f._id + "-" + (f.versionID) + ".html\n");
                console.log("slides  " + files);
          }
        });
    });
};

purse();
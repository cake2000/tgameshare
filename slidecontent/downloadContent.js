// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:3001/meteor';



function getProdData() {

  url = 'mongodb://upliftingtechnology:AABB1234!@ds159090-a0.mlab.com:59090,ds159090-a1.mlab.com:59090/tgame?replicaSet=rs-ds159090';

  MongoClient.connect(url, function(err, client) {
    console.log("connectd ");
    var db1 = client.db("tgame");

    console.log("db is " + JSON.stringify(Object.keys(db1)));
    // var users = db1.collection('users');
    var SlideContent = db1.collection('SlideContent');
    // var allchats = UserChat.find({ }, { fields: { 'scenarioId':1, 'userId': 1, 'chats.createdAt': 1, 'chats.actionType': 1 } }).fetch();
  

    SlideContent.find({}).toArray(function(err, slides) {
          if (err) {
              console.log(err);
          } else {
            console.log("slides count " + slides.length);

            for (var j=0; j<slides.length; j++) {
                // if (j > 1) continue;
              var slide = slides[j];
              console.log("\n\nlooking at slide " + j + " " + slide._id);
              fs.writeFile('./'+slide._id+".html", slide.content, function(err) {
                if (err) throw err;
                console.log("done writing " + j);
                // console.log(csv);
              });
  
            }

            

          }
        });
    });
};

getProdData();
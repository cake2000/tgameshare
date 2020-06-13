// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');
const { exec } = require('child_process');

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
                const goodfiles = slides.map((f) => f.versionID ? f._id + "-" + (f.versionID) + ".html" : f._id + ".html");
                // console.log("slides  " + goodfiles);



                const files = fs.readdirSync("/home/binyu/dev/tgameshare/slidecontent/");
                var curInd = 0;
                function rmFile() {
                    const fn = files[curInd];
                    if (!goodfiles.includes(fn) && fn.endsWith(".html")) {
                        const cmd = "rm /home/binyu/dev/tgameshare/slidecontent/"+fn+" ";
                        console.log("rm " + curInd + " " + fn);
                        exec(cmd);
                    } else {
                        // console.log("keep " + curInd + " " + fn);
                        console.log(curInd + " ");
                    }
                    curInd ++;
                    if (curInd < files.length)
                    // if (curInd < 2)
                        setTimeout(rmFile, 10);
                }
                rmFile();



          }
        });
    });
};

purse();
// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');

function copyfiles() {

    files = fs.readdirSync("/home/binyu/dev/tgameshare/slidecontent/");
    

  var url2 = 'mongodb://upliftingtechnology:AABB1234!@ds159090-a0.mlab.com:59090,ds159090-a1.mlab.com:59090/tgame?replicaSet=rs-ds159090';

  MongoClient.connect(url2, function(err, client) {
    console.log("connectd ");
    var db2 = client.db("tgame");

    console.log("db is " + JSON.stringify(Object.keys(db2)));


    // var users = db1.collection('users');
    var SlideContent = db2.collection('SlideContent');
    // var allchats = UserChat.find({ }, { fields: { 'scenarioId':1, 'userId': 1, 'chats.createdAt': 1, 'chats.actionType': 1 } }).fetch();
  

    SlideContent.find({}, {content: 0}).toArray(function(err, slides) {
          if (err) {
              console.log(err);
          } else {
            console.log("slides count " + slides.length);



            MongoClient.connect(url, function(err, client) {
                console.log("connectd ");
                var db1 = client.db("meteor");
            
                console.log("db is " + JSON.stringify(Object.keys(db1)));
                var SlideContent = db1.collection('SlideContent');


                for (var j=0; j<slides.length; j++) {
                        // if (j > 1) continue;
                    var slide = slides[j];
                    slide.content = "";

                    const s2 = SlideContent.findOne({_id: slide._id});
                    if (!s2) {
                        console.log("\n\i inesrting at slide " + j + " " + slide._id);
                        SlideContent.insert(slide);
                    }

                }

            });

          }
        });
    });
};

copyfiles();

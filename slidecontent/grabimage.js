// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');
const { execSync } = require('child_process');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:3001/meteor';


var path = require('path');

function fromDir(startPath,filter,callback){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filename.includes(filter)) callback(filename);
    };
};

//https://s3.amazonaws.com/media-p.slid.es/uploads/947564/images/7531452/tianzige3.gif

//https://cdn.jsdelivr.net/gh/cake2000/tgameshare/slidecontent/rawimages/tianzige3.gif


function getOneFile(s) {

    let ind = s.indexOf("https://s3.amazonaws.com/media-p.slid.es/");
    if (ind < 0) return "";
    console.log("slen " + s.length +  " ind " + ind + " " + s.substr(ind, 160));

    let backs = s.substring(ind);
    let ind1 = backs.indexOf(".gif\">");
    let ind2 = backs.indexOf(".png\">");
    let ind3 = backs.indexOf(".jpg\">");
    if (ind1 < 0 && ind2 < 0 && ind3 < 0) return "";
    
    ind = Math.min(ind1 > 0 ? ind1 : 100000000, ind2 > 0 ? ind2 : 100000000, ind3 > 0 ? ind3 : 100000000);
    ind += 4;
    console.log("backs " + backs.substring(0, 100));
    let path = backs.substring("https://s3.amazonaws.com/media-p.slid.es/".length, ind);
    console.log("ind " + ind + " " + ind1 + " " + ind2 + " path " + path); 
    if (path.includes("><")) return "";


    try {
        if (!fs.existsSync("./rawimages/" + path)) {

            let lastslash = path.lastIndexOf("/");
            let pathp = path.substring(0, lastslash+1);

            let cmd = "wget -P ./rawimages/" + pathp + " " + backs.substring(0, ind);
            console.log("execsync " + cmd);
            execSync(cmd);
            // process.exit(0);

        } else {

        }
        return backs.substring(ind);
    } catch(err) {
        console.error(err)
        return "";
    }
}


function grab(idroot) {

    
    fromDir('./',idroot+"-",function(filename){
        console.log('-- found: ',filename);
        var fc = fs.readFileSync(filename, 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);

        let news = getOneFile(fc);
        let cnt = 0;
        while (news != "") {
            console.log("cnt is " + cnt);
            news = getOneFile(news);
            cnt ++;

            // if (cnt > 30)
            //     break;
            // console.log("next news " + news.substring(0, 100))
        }

    });

    return;




    var url2 = 'mongodb+srv://upliftingtechnology:ABCD1234!!@tgamesharedplan-b45ae.mongodb.net/tgame?retryWrites=true&w=majority';

  MongoClient.connect(url2, function(err, client) {
    // console.log("connectd ");
    var db2 = client.db("tgame");

    // console.log("db is " + JSON.stringify(Object.keys(db2)));


    // var users = db1.collection('users');
    var SlideContent = db2.collection('SlideContent');
    // var allchats = UserChat.find({ }, { fields: { 'scenarioId':1, 'userId': 1, 'chats.createdAt': 1, 'chats.actionType': 1 } }).fetch();
  

    SlideContent.find({_id: {$in: [idroot] }}, {_id: 1, versionID: 1}).toArray(function(err, slides) {
          if (err) {
              console.log(err);
          } else {
                const goodfiles = slides.map((f) => f.versionID ? f._id + "-" + (f.versionID) + ".html" : f._id + ".html");
                console.log("slides  " + goodfiles);

                var fc = fs.readFileSync("/home/binyu/dev/tgameshare/slidecontent/" + goodfiles[0], 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);

                let news = getOneFile(fc);
                let cnt = 0;
                while (news != "") {
                    console.log("cnt is " + cnt);
                    news = getOneFile(news);
                    cnt ++;

                    // if (cnt > 30)
                    //     break;
                    // console.log("next news " + news.substring(0, 100))
                }
                process.exit(0);

          }
        });
    });
};


var files=fs.readdirSync("./");
// console.log("files " + files.length + " " + files);
for (let i=0; i<files.length; i++) {
    let fn = files[i];
    if (fn.indexOf("-") > 0) {
        fn = fn.substring(0, fn.indexOf("-"));
        console.log("\n\n\n" + fn);
        grab(fn);
    }
    // break;
}

// grab("tianzige_lesson_1_ch");


// for (let i=1; i<50; i++) {
//     grab("school_a_lesson_" + i);
// }

// for (let i=1; i<50; i++) {
//     grab("school_a_lesson_" + i + "_ch");
// }

// for (let i=1; i<8; i++) {
//     grab("school_b_lesson_" + i);
// }

// for (let i=1; i<8; i++) {
//     grab("school_b_lesson_" + i + "_ch");
// }

// for (let i=0; i<7; i++) {
//     grab("python_lesson_" + i);
// }

// for (let i=0; i<6; i++) {
//     grab("teacher_lesson_" + i + "_ch");
// }

// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');
const { execSync } = require('child_process');

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


// parse scratch project json for image/sound file assets
function getOneFile2(s) {

    let ind = s.indexOf("md5ext");
    if (ind < 0) return "";
    
    // console.log("slen " + s.length +  " ind " + ind + " " + s.substr(ind, 160));
  
    let backs = s.substring(ind+9);
    ind = backs.indexOf("\"");
    // console.log("backs " + backs.substring(0, 100));
    let path = backs.substring(0, ind);
    // console.log("getOneFile2 path " + path);
    try {
        if (!fs.existsSync("/home/binyu/dev/tgameshare/scratchstorage/assets/" + path)) {
  
            let cmd = "wget -O /home/binyu/dev/tgameshare/scratchstorage/assets/" + path + " https://assets.scratch.mit.edu/internalapi/asset/" + path + "/get/";
            console.log("aset asset execsync " + cmd);
            execSync(cmd);
            // process.exit(0);
  
        } else {
  
        }
        return backs.substring(ind + 9);
    } catch(err) {
        console.error(err)
        // return "";
    }
  
    
  }
  
function getOneProject(s) {

    let ind = s.indexOf("#PROJECTID");
    if (ind < 0) return "";
    console.log("slen " + s.length +  " ind " + ind + " " + s.substr(ind, 160));

    let backs = s.substring(ind+10);
    console.log("backs " + backs.substring(0, 100) + "\n\n");

    ind = backs.indexOf("||");
    let ind2 = backs.indexOf("\\n");
    if (ind2 < ind) {
        ind = ind2;
    }
    let projectid = backs.substring(0, ind).trim();
    console.log(" projectid " + projectid + "\n \n"); 

    downloadFile("https://projects.scratch.mit.edu/" + projectid, "/home/binyu/dev/tgameshare/scratchstorage/projects/"+projectid);
    const fcontent = fs.readFileSync("/home/binyu/dev/tgameshare/scratchstorage/projects/"+projectid, 'utf8');
    
    let news = getOneFile2(fcontent);
    let cnt = 0;
    while (news != "") {
        // console.log("cnt is " + cnt);
        news = getOneFile2(news);
        cnt ++;
    }
    return backs.substr(10);
    
}



function downloadFile(url, file) {

    try {
      if (!fs.existsSync(file)) {
  
          let lastslash = file.lastIndexOf("/");
          let pathp = file.substring(0, lastslash+1);
  
          let cmd = "wget -P " + pathp + " " + url;
          console.log("execsync " + cmd);
          execSync(cmd);
  
      } else {
  
      }
  } catch(err) {
      console.error(err)
      // return "";
  }
  
  }

function grab(idroot) {

    
    fromDir('./',idroot+"-",function(filename){
        console.log('-- found: ',filename);
        var fc = fs.readFileSync(filename, 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);

        // find all scratch projects



        let news = getOneProject(fc);
        let cnt = 0;
        while (news != "") {
            // console.log("cnt is " + cnt);
            news = getOneProject(news);
            cnt ++;

            // if (cnt > 30)
            //     break;
            // console.log("next news " + news.substring(0, 100))
        }

    });

};




async function init() {
    

    var files=fs.readdirSync("./");
    // console.log("files " + files.length + " " + files);
    for (let i=0; i<10; i++) {
        let fn = files[i];
        if (fn.indexOf("-") > 0) {
            fn = fn.substring(0, fn.indexOf("-"));
            console.log(i + " " + fn);
            await sleep(60000);
            console.log("\n\n\n" + fn);
            grab(fn);
        }
    }

    
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   
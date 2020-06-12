// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;
const { exec } = require('child_process');
var fs = require('fs');

function copyfiles() {

    files = fs.readdirSync("/home/binyu/dev/temp/");
    var curInd = 0;
    function moveNextFile() {
        const cmd = "mv /home/binyu/dev/temp/"+files[curInd]+" /home/binyu/dev/tgame/private/NewCourses/";
        console.log("" + curInd + " " + cmd);
        exec(cmd);
        curInd ++;
        // if (curInd < 1)
            setTimeout(moveNextFile, 35000);
    }
    moveNextFile();
};

copyfiles();

var fs = require('fs');
const { execSync } = require('child_process');

function warm() {
    var fc = fs.readFileSync("filelist", 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);
    var files = fc.split("\n");
    for (let i=0; i<files.length; i++) {
        const fn = files[i];
        if (fn.length < 4) continue;
        if (fn.includes("/node_modules/")) continue;
        let cmd = "wget -O tmp https://cdn.jsdelivr.net/gh/cake2000/tgameshare/slidecontent/" + fn.substring(2);
        console.log(i + ": " + cmd);
        try {
            execSync(cmd);
        } catch (e) {}
        // break;
    }
};


warm();
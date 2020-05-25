
/* 

This script automatically copies the lesson file from the chrome downloads folder to the local folder, and then uploads it to the local db, overwriting the existing version.

*/

var fs = require('fs');
var execp = require('child_process');
var exec = execp.exec;


var path = '/home/binyu/Downloads/slides-pool_lesson_5.html';

fs.watchFile(path, (curr, prev) => {
  console.log("found file");
  if (fs.existsSync(path) && curr.mtime != prev.mtime) {
    console.log(`\n\n\nthe current mtime is: ${curr.mtime}`);
    console.log(`the previous mtime was: ${prev.mtime}`);
    console.log(`do move!`);
    exec('mv -f ' + path + ' .', (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        console.log(` copy error ! ${err}`);
        return;
      }
    
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      // console.log(`--------------- do upload! -----------`);
      // exec('node uploadLesson.js', (err2, stdout2, stderr2) => {
      //   if (err2) {
      //     // node couldn't execute the command
      //     console.log(` upload error ! ${err2}`);
      //     return;
      //   }
      
      //   // the *entire* stdout and stderr (buffered)
      //   console.log(`stdout2: ${stdout2}`);
      //   console.log(`stderr2: ${stderr2}`);
  
        
      // });    

    });    
  }

});
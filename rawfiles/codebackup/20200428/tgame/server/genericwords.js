const fs = require('fs');
const util = require('util');


Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
      var hash = 0, i, chr;
      for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
  });

/*  
var choices = ["Well done", "Terrific", "That's correct", "Way to go", "Bravo", "You are the best","Not bad", "Excellent", "Marvelous", "Wonderful", "I knew you had it in you", "Awesome", "Remarkable", "Sweet", "I'm impressed", "You're very talented", "Magnificent",  "Brilliant", "Right on", "Great job", "You rock", "Phenomenal", "Exceptional", "Keep up the good work", "Fantastic work", "Very good", "Stupendous", "It couldn't be better", "Good for you", "Spectacular work", "How extraordinary", "You are a winner", "Great effort", "You are a genius", "You are sharp", "You've earned my respect", "Outstanding effort", "Top notch", "Good choice", "Sorry, the correct answer is 'A'", "Sorry, the correct answer is B", "Sorry, the correct answer is C", "Sorry, the correct answer is D", "Sorry, the correct answer is E", "Sorry, the correct answer is F"];
// if (window.currentChosenLocale == "CH") {
//   choices = ["太棒了", "很好", "完全正确", "你真厉害", "做的好", "你真是个天才", "向你致敬", "我很佩服你", "了不起", "你太优秀了", "你太有才了", "你做的很好", "太漂亮了", "你的努力没有白费", "你越做越好了"];
// }

for (let i=0; i<choices.length; i++) {
    const line = choices[i] + "!";
    let fn = "/home/binyu/dev/xunfei/voicefiles/dataen/text-" + "generic-" + line.hashCode();
    console.log("fn is " + fn);
    
    try {
        fs.writeFileSync(fn, line);
    } catch(err) {
        // An error occurred
        console.error(err);
    }
}






var choices2 = ["太棒了", "很好", "完全正确", "你真厉害", "做的好", "你真是个天才", "向你致敬", "我很佩服你", "了不起", "你太优秀了", "你太有才了", "你做的很好", "太漂亮了", "你的努力没有白费", "你越做越好了", "很可惜, 正确的答案是 A","很可惜, 正确的答案是 B","很可惜, 正确的答案是 C","很可惜, 正确的答案是 D","很可惜, 正确的答案是 E","很可惜, 正确的答案是 F"];

for (let i=0; i<choices2.length; i++) {
    const line = choices2[i] + "!";
    let fn = "/home/binyu/dev/xunfei/voicefiles/data/text-" + "generic-ch-" + line.hashCode();
    console.log("fn is " + fn);
    
    try {
        fs.writeFileSync(fn, line);
    } catch(err) {
        // An error occurred
        console.error(err);
    }
}

*/
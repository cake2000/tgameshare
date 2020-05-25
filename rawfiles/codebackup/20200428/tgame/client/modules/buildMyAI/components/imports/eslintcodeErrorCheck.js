/**
 * function scope
 * empty bracket block for for-loop or function or if-else
 */
const NonNodeType = ["String", "Number", "Array", "Boolean", "Null", "Undefined"];

const acorn = require("acorn");
require("acorn/dist/acorn_loose");
const beautify = require('js-beautify').js_beautify;

const keyWords = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export',
  'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
  'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
  'enum', 'let'
]);

const keyWords2 = new Set([
  'getNovaRange', 'get4WayRange', 'get3SplitterRange', 'getTimeLeftInSeconds', 'getWeaponRange',
  'Balls', 'BallDiameter', 'TableHeight', 'TableWidth', 'Pockets', 'Rails', 'Cushions', 'CushionWidth', 'PlayerInfo', 'getSecondsLeft',
  'getAimPosition', 'getNewCommand', 'getRandomNumber', 'extrapolatePoints', "CandidateBallList", 'calculateProbability', 'console', 'MyID', 'world', 'isPathBlocked', 'getCutAngle', 'calculateCutAngle', 'getAngleToSidePocket',
  'calculateEndState', 'calculateEndState2', 'calculateProbability2', 'getDistance', 'Victor', 'getFirstBallTouched', 'Boundaries', 'debugger',
]);

const comparitors = ["==", "<", ">", "<=", ">=", "!=", "===", "!=="];

const keyWordsAll = new Set([...keyWords, ...keyWords2]);

const MathFuncs = new Set([
  'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor',
  'fround', 'hypot', 'imul', 'log', 'log10', 'log1p', 'log2', 'max', 'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt',
  'tan', 'tanh', 'trunc',
]);

const MathConts = new Set([
  'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2',
]);

const consoleFuncs = new Set([
  'assert', 'clear', 'count', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile',
  'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn',
]);

const functionNames = new Set([
  'getNovaRange', 'get4WayRange' ,'get3SplitterRange', 'getTimeLeftInSeconds', 'getWeaponRange',
  'getAimPosition', 'getNewCommand', 'getRandomNumber', 'getCallShot', 'getBreakShot', 'getSecondsLeft', 'getCueBallPlacement', 'isPathBlocked', 'getAngleToSidePocket',
  'getCutAngle', 'calculateCutAngle', 'calculateEndState', 'calculateEndState2', 'calculateProbability', 'calculateProbability2', 'extrapolatePoints'
]);

const arrayFuncs = new Set([
  'length', 'concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find', 'findIndex', 'flat', 'flatMap', 'forEach',
  'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight', 'reverse', 'shift', 'slice',
  'some', 'sort', 'splice', 'toLocaleString', 'toSource', 'toString', 'unshift', 'values',
]);

const consoleConts = new Set([]);

const preDefined = [
  {
    moduleName: 'Math',
    functions: MathFuncs,
    constants: MathConts,
    regex: /Math.([0-9a-z_]*)/gi,
  },
  {
    moduleName: 'console',
    functions: consoleFuncs,
    constants: consoleConts,
    regex: /console.([a-z]*)/gi,
  }
];

let userNodeList = [];
let answerNodeList = [];

const addNodeToUserList = (node, code) => {
  if (!node || !('start' in node) || !('end' in node)) return;
  for (let k=0; k<userNodeList.length; k++) {
    const n = userNodeList[k];
    if (n.type == node.type && n.start == node.start && n.end == node.end) return;
  }
  userNodeList.push(node);
};

const addNodeToAnswerList = (node, code) => {
  if (!node || !('start' in node) || !('end' in node)) return;
  for (let k=0; k<answerNodeList.length; k++) {
    const n = answerNodeList[k];
    if (n.type == node.type && n.start == node.start && n.end == node.end) return;
  }
  answerNodeList.push(node);
};


const isAlphaNum = (s) => { return /^[a-zA-Z0-9]+$/.test(s); };

function getWordAtPos(str, pos) {
  if (pos >= str.length) return '';
  let b = pos;
  if (!isAlphaNum(str.charAt(b))) {
    while (b < str.length && !isAlphaNum(str.charAt(b))) b += 1;
  } else {
    while (b - 1 >= 0 && isAlphaNum(str.charAt(b - 1))) b -= 1;
  }
  let e = b;
  while (e < str.length && isAlphaNum(str.charAt(e))) e += 1;
  return str.substring(b, e);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

const indToPos = (ind, code) => {
  const lines = code.split("\n");
  let cumLetters = 0;
  for (let k=0; k<lines.length; k++) {
    const line = lines[k];
    if (cumLetters + line.length >= ind) {
      return {
        line: k, ch: ind - cumLetters
      };
    }
    cumLetters += line.length + 1;
  }
};

function posToInd(pos, codeArr) {
  let cumInd = 0;
  for (let i=0; i<pos.line; i++) {
    cumInd += codeArr[i].length + 1;
  }
  return cumInd + pos.ch;
}

const strToCharMap = (s) => {
  const smap = {};
  if (!s) return smap;
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (c in smap) smap[c] += 1;
    else smap[c] = 1;
  }
  return smap;
};

const getWordsSimilarity = (w1, w2) => {
  const w1map = strToCharMap(w1);
  const w2map = strToCharMap(w2);
  let score = 0;
  Object.keys(w2map).forEach((c) => {
    if (c === ' ') return;
    const inw1 = (c in w1map) ? w1map[c] : 0;
    const diff = w2map[c] - inw1;
    score += Math.min(inw1, w2map[c]) - Math.abs(diff);
  });
  Object.keys(w1map).forEach((c) => {
    if (c === ' ') return;
    if (!(c in w2map)) score -= w1map[c];
  });
  return score;
};

/**
 * Levenshtein distance 
 * modified from https://gist.github.com/andrei-m/982927
 * 
 */
function getEditDistance(a, b){
  if(!a || a.length == 0) return {length: 10000}; 
  if(!b || b.length == 0) return {length: 10000}; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1000000, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  // derive all operations
  let row = b.length, col = a.length;
  let ops = [];
  while (matrix[row][col] > 0 && row >= 0 && col >= 0) {
    const v = matrix[row][col];
    // const vlefttop = matrix[row-1][col-1];
    // if (vlefttop < v) {
    //   ops = ["R_" + a[col-1] + "_" + b[row-1] + "_" + (col-1)].concat(ops);
    //   row --;
    //   col --;      
    //   continue;
    // }
    const vleft = matrix[row][col-1];
    if (vleft < v) {
      ops = ["D_" + a[col-1] + "_" + (col-1)].concat(ops);
      col --;      
      continue;
    }
    const vtop = matrix[row-1][col];
    if (vtop < v) {
      ops = ["I_" + b[row-1] + "_" + (col)].concat(ops);
      row --;
      continue;
    }
    row --;
    col --;
  }

  for (let k=0; k<ops.length; k++) {
    // console.log("op " + k + ": " + ops[k]);
  }

  //return matrix[b.length][a.length];
  return ops;
}

//getEditDistance("Saturday", "eSaturday") -> I_e_0 insert before 0
//getEditDistance("Saturday","Saturdays")  -> I_s_8 insert before 8



function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

const getElementCleancode = (scenario, chat) => {
  if (!scenario.instructionElements) return "";
  let lastTutorialElementId = '';
  let conditionDone = true;
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT") {
      lastTutorialElementId = c.actionContent;
      if ('condition' in c && c.condition && c.condition.length > 0 && 'conditionDone' in c && c.conditionDone === false) {
        conditionDone = false;
      }
      break;
    }
  }
  let cleancode = '';
  for (let i = 0; i < scenario.instructionElements.length; i++) {
    const e = scenario.instructionElements[i];
    if ((e.elementType === 'Coding' || e.elementType === 'InitialCode') && 'cleancode' in e) {
      cleancode = e.cleancode;
      if (e.elementId === lastTutorialElementId && !conditionDone || e.elementId > lastTutorialElementId) break;
    }
  }
  return cleancode;
};

const getFunctionName = (line) => {
  if (line.indexOf("function") >= 0) {
    let s = line.substring(line.indexOf("function") + 8);
    s = s.substring(0, s.indexOf("(")).trim();
    return s;
  }
  return 'noFuncName';
};

function addToBlock(blocks, funcName, codeStr, lineNum) {
  if (!(funcName in blocks)) {
    blocks[funcName] = [];
  }
  const info = {
    line: lineNum,
    code: codeStr
  };
  blocks[funcName].push(info);
}

const getCodeBlocks = (code) => {
  const lines = code.split('\n');
  const blocks = {};
  let newblock = '';

  let inFunction = false;
  let funcName = '';
  let funcBegin = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // if (line.trim() === '') continue;
    // if (line.trim().indexOf('//') == 0) continue;

    if (inFunction) {
      if (line.indexOf('}') === 0) {
        inFunction = false;
        newblock += line;
        addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
        funcName = '';
        newblock = '';
      } else {
        newblock += line;
        newblock += '\n';
      }
    } else { // not in function
      if (line.indexOf('function') >= 0) {
        // a new block of code!
        if (newblock !== '') {
          addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
          newblock = '';
        }
        inFunction = true;
        funcName = getFunctionName(line);
        funcBegin = i;
      }
      newblock += line;
      newblock += '\n';
    }
  }

  if (newblock.trim() !== '') {
    addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
  }
  if ('' in blocks && blocks[''].length > 0) {
    let outside = '';
    blocks[''].forEach((c) => { outside += c.code; });
    outside = replaceAll(outside, "\n", "").trim();
    if (outside != "") {
      blocks[''] = {
        line: blocks[''][0].line,
        code: [outside]
      };
    } else {
      delete blocks[''];
    }
  }
  return blocks;
};

function getRelativePosition(code, lineNum) {
  const lines = code.split("\n");
  let funcName = '';
  let relativeLineNum = lineNum;
  let userString = lines[lineNum].substring(0, );
  for (let i = lineNum-1; i >= 0; i--) {
    const line = lines[i];
    if (line.indexOf('function') >= 0) {
      funcName = getFunctionName(line);
      relativeLineNum = lineNum - i;
      break;
    }
  }
  return { functionName: funcName, lineNum: relativeLineNum };
}

function getFunctionAndString(code, lineNum, ch) {
  const lines = code.split("\n");
  let funcName = '';
  let relativeLineNum = lineNum;
  let userString = lines[lineNum].substring(0, ch-1).trim();
  for (let i = lineNum-1; i >= 0; i--) {
    const line = lines[i];

    if (line.indexOf('function') >= 0) {
      funcName = getFunctionName(line);
      relativeLineNum = lineNum - i;
    } 
    userString = line + userString;
    if (funcName != '') break;
  }
  return { functionName: funcName, lineNum: relativeLineNum, userString };
}


function removeComment(line) {
  if (!line) return '';
  let left = line;
  // remove comments start with //
  const i10 = line.indexOf('//') < 0 ? line.length : line.indexOf('//');
  const i11 = line.indexOf('\n', i10);
  left = line.substring(0, i10) + (i11 >= 0 ? line.substring(i11 + '\n'.length, line.length) : '');
  // remove comments between /* */
  const i20 = left.indexOf('/*') < 0 ? left.length : left.indexOf('/*');
  const i21 = left.indexOf('*/', i20);
  left = left.substring(0, i20) + (i21 >= 0 ? left.substring(i21 + 2, left.length) : '');
  return left;
}

function getTokens(code) {
  const tokens = [];
  let i = 0;
  let isAlphanumeric = false;
  let token = '';
  while (i < code.length) {
    if (code[i] === ' ' && token === '') {
      i += 1;
      continue;
    }
    if (token === '') isAlphanumeric = isAlphaNum(code[i]) || code[i] === '-';
    if (code[i] !== ' ' && (isAlphaNum(code[i]) || code[i] === '-') === isAlphanumeric) {
      token += code[i];
      i += 1;
    } else {
      tokens.push(token.trim());
      token = '';
    }
  }
  if (token !== '') tokens.push(token.trim());
  return tokens;
}

function wordsToMap(wordArr) {
  const wmap = {};
  wordArr.forEach((w) => {
    if (!(w in wmap)) wmap[w] = 0;
    wmap[w] += 1;
  });
  return wmap;
}

function getSimilarityScore(ans, userCode) {
  if (!userCode || userCode.trim() === '') return 0;
  const ats = getTokens(ans);
  const uts = getTokens(userCode);
  let score = 0;
  const atmap = wordsToMap(ats);
  uts.forEach((ut) => {
    if (ut in atmap && atmap[ut] > 0) {
      score += ut.length;
      atmap[ut] -= 1;
    }
  });
  let total = 0;
  uts.forEach((ut) => { total += ut.length; });
  Object.keys(atmap).forEach((at) => { total += at.length * atmap[at]; });
  return score / total;
}

function getDiffs(ans, userCode, errorPos) {
  const ats = getTokens(ans);
  const uts = getTokens(userCode);
  let pos = -1;
  let i = 0;
  for (; i < ats.length && i < uts.length; i++) {
    const at = ats[i];
    const ut = uts[i];
    pos = userCode.indexOf(ut, pos);
    // both are numbers or equal
    if (!isNaN(at) && !isNaN(ut) || at === ut) continue;
    // only one of them is a number
    if (isNaN(at) && !isNaN(ut) || !isNaN(at) && isNaN(ut)) return { diffs: [at, ut], pos };
    // none of them is a number
    // // both are identifiers
    // if (isAlphaNum(at) && isAlphaNum(ut) && !keyWordsAll.has(at) && !keyWordsAll.has(ut)) continue;
    // // one of them is not a identifier
    return { diffs: [at, ut], pos };
  }
  if (i < ats.length) return { diffs: [ats[i], ''], pos: userCode.length - 1 };
  if (i < uts.length) {
    if (i > 0) {
      pos += uts[i - 1].length;
      while (pos < userCode.length && userCode.charAt(pos) === ' ') pos++;
    }
    return { diffs: ['', uts[i]], pos };
  }
  return null;
}

function generateErrorMsgNPos(answerLine, userErrorLine, errorLineNum, errorPos) {
  const diffsWithPos = getDiffs(answerLine, userErrorLine, errorPos);
  // const dd = getDiffsFromAST(answerLine, userErrorLine, errorPos);
  const diffs = diffsWithPos ? diffsWithPos.diffs : null;
  let message = '';
  let from = errorPos;
  let to = -1;
  if (diffs) {
    const w0 = diffs[0];
    const w1 = diffs[1];
    from = diffsWithPos.pos;
    to = (w1 !== '') ? from + w1.length : from + 1;
    if (w0.length > 0 && w1.length > 0) {
      if (w1.indexOf('?') >= 0) {
        message = `Please change '?' to your code.`;
      } else if (isNaN(w0)) {
        message = `Expected '${w0}' but instead saw '${w1}'.`;
      } else if (!isNaN(w0) && isNaN(w1)) {
        message = `Expected a number but instead saw '${w1}'.`;
      }
    } else if (w0.length > 0) {
      if (isNaN(w0)) message = `Missing '${w0}' at line ${errorLineNum + 1}.`;
      else message = `Missing a number at line ${errorLineNum + 1} pos ${errorPos}.`;
    } else {
      message = `Unexpected '${w1}' at line ${errorLineNum + 1}. Please remove.`;
    }
  }
  return { message, from, to };
}

function getCorrespondingAnswerLine(userCode, errorLineNum, answerBlocks) {
  if (!userCode || userCode.trim === '') return '';
  // try to get corresponding line in clean code.
  const relPos = getRelativePosition(userCode, errorLineNum);
  if (!relPos) return '';
  const userBlocks = getCodeBlocks(userCode);
  if (!(relPos.functionName in userBlocks) || userBlocks[relPos.functionName].length === 0) return '';
  if (!userBlocks[relPos.functionName][0]) return '';
  const userCodeArr = userBlocks[relPos.functionName][0].code.split('\n');
  const userErrorLine = removeComment(userCodeArr[relPos.lineNum]);
  // get user previous line
  let userPreLine = '';
  let iUsr = relPos.lineNum - 1;
  while (iUsr >= 0 && userPreLine === '') {
    userPreLine = removeComment(userCodeArr[iUsr]);
    iUsr--;
  }
  // get user next line
  let userNextLine = '';
  iUsr = relPos.lineNum + 1;
  while (iUsr < userCodeArr.length && userNextLine === '') {
    userNextLine = removeComment(userCodeArr[iUsr]).trim();
    iUsr++;
  }
  // find corresponding answer line.
  let answerLine = '';
  if (relPos.functionName in answerBlocks && answerBlocks[relPos.functionName].length > 0) {
    const funcCode = answerBlocks[relPos.functionName][0].code;
    const funcLines = funcCode.split('\n');
    const trimmed = userErrorLine.trim();

    let preLine = '';
    let curLine = '';
    let nextLine = '';
    let highestScore = 0.5;
    let i = 0;
    while (i <= funcLines.length) {
      if (nextLine === '' && i < funcLines.length) {
        nextLine = removeComment(funcLines[i]).trim();
      } else if (nextLine !== '' && curLine === '') {
        curLine = nextLine;
        nextLine = removeComment(funcLines[i]).trim();
      } else {
        let score = 0;
        score += 0.25 * getSimilarityScore(preLine, userPreLine);
        score += 0.5 * getSimilarityScore(curLine, trimmed);
        score += 0.25 * getSimilarityScore(nextLine, userNextLine);
        if (score > highestScore) {
          highestScore = score;
          answerLine = curLine;
        }
        preLine = curLine;
        curLine = nextLine;
        nextLine = i < funcLines.length ? removeComment(funcLines[i]).trim() : '';
      }
      i += 1;
    }
  }
  return answerLine;
}

function pushToResult(error, results, newMessages) {
  const message = error.message;
  const errorLineNum = error.from.line;
  if (newMessages.has(`${message}---${errorLineNum}`)) return;
  newMessages.add(`${message}---${errorLineNum}`);
  results.push(error);
}

function isErrorCatched(errorLineNum, errorPos, userCode, answerBlocks, error, newMessages, results, includeOrigMsg = false, noEarlyErr = false) {
  const userLines = userCode.split('\n');
  const userErrorLine = removeComment(userLines[errorLineNum]);
  const answerLine = getCorrespondingAnswerLine(userCode, errorLineNum, answerBlocks);
  if (answerLine !== '') {
    const msgAndPos = generateErrorMsgNPos(answerLine, userErrorLine, errorLineNum, errorPos);
    const message = msgAndPos.message;
    if (noEarlyErr && msgAndPos.from < errorPos) return false;
    if (message && message.length > 0) {
      const note = Object.assign({}, error);
      note.from = { line: errorLineNum, ch: msgAndPos.from };
      note.to = { line: errorLineNum, ch: msgAndPos.to === -1 ? error.to.ch : msgAndPos.to };
      if (includeOrigMsg) note.message += ` ${message}`;
      else note.message = message;
      // show same message at the same row only once.
      pushToResult(note, results, newMessages);
      return true;
    }
  }
  return false;
}

// from relative position to AST absolute position
const relativeToAbsolutePos = (line, pos, codeArr) => {
  if (line >= codeArr.length) return -1;
  let result = 0;
  for (let i = 0; i < line; i++) result += codeArr[i].length + 1;
  result += pos;
  return result;
};
// from AST absolute position to error relative position
const absoluteToRelativePos = (apos, codeArr) => {
  let pos = apos;
  let i = 0;
  for (; i < codeArr.length; i++) {
    const line = codeArr[i];
    if (line.length + '\n'.length > pos) { i += 1; break; }
    pos -= line.length + '\n'.length;
  }
  return { line: i - 1, pos };
};

const countChar = (s, ch) => {
  if (!s) return 0;
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) === ch) count += 1;
  }
  return count;
};

const addCodeStr = (node, code) => {
  if (!node || !('start' in node) || !('end' in node)) return;
  node.codeStr = code.substring(node.start, node.end);
};

const countParens = (node, code) => {
  if (!node || !('start' in node) || !('end' in node)) return;
  if (!('codeStr' in node)) {
    node.codeStr = code.substring(node.start, node.end);
  }
  const noCommnets = removeComment(node.codeStr);
  node.parens = (noCommnets.match(/{/g) || []).length - (noCommnets.match(/}/g) || []).length;
};

function splitGaps(gaps, n) {
  const newgaps = [];
  for (let k=0; k<gaps.length; k++) {
    const g = gaps[k];
    if (g[0] == g[1]) continue;
    if (g[0] <= n.start && g[1] >= n.end) {
      if (g[0] < n.start) {
        newgaps.push([g[0], n.start]);
      }
      if (g[1] > n.end) {
        newgaps.push([n.end, g[1]]);
      }
    } else {
      newgaps.push(g);
    }
  }
  return newgaps;
}

function findGaps(node) {
  // console.log("findGaps " + node.start + " " + node.end);
  // if (node.start == 9 && node.end == 21) {
  //   debugger;
  // }
  let gaps = [[node.start, node.end]];
  let hasChildren = false;
  const keylist = Object.keys(node);
  for (let k=0; k<keylist.length; k++) {
    if (keylist[k] == "parent" || keylist[k] == "separators") continue;
    const p = node[keylist[k]];
    if (p == null) continue;
    if (!NonNodeType.includes(p.__proto__.constructor.name)) {
      gaps = splitGaps(gaps, p);
      hasChildren = true;
    } else if (p.__proto__.constructor.name == "Array") {
      for (let j=0; j<p.length; j++) {
        const q = p[j];
        if (!NonNodeType.includes(q.__proto__.constructor.name)) {
          gaps = splitGaps(gaps, q);
          hasChildren = true;
        }   
      }
    }
  }
  if (!hasChildren) return [];

  let finalGaps = [];
  for (let k=0; k<gaps.length; k++) {
    const g = gaps[k];
    if (g[0] == g[1]) continue;
    finalGaps.push(g);
  }
  return finalGaps;
}

function Node(type, start, end) {
  this.type = type;
  this.start = start;
  this.end = end;
}

function findPrevNode(g, node) {
  const keylist = Object.keys(node);
  for (let k=0; k<keylist.length; k++) {
    if (keylist[k] == "parent" || keylist[k] == "separators") continue;
    const p = node[keylist[k]];
    if (p == null) continue;
    if (!NonNodeType.includes(p.__proto__.constructor.name)) {
      if (p.end == g[0]) return p;
    } else if (p.__proto__.constructor.name == "Array") {
      for (let j=0; j<p.length; j++) {
        const q = p[j];
        if (!NonNodeType.includes(q.__proto__.constructor.name)) {
          if (q.end == g[0]) return q;
        }   
      }
    }
  }
  return null;
}

function findNextNode(g, node) {
  const keylist = Object.keys(node);
  for (let k=0; k<keylist.length; k++) {
    if (keylist[k] == "parent" || keylist[k] == "separators") continue;
    const p = node[keylist[k]];
    if (p == null) continue;
    if (!NonNodeType.includes(p.__proto__.constructor.name)) {
      if (p.start == g[1]) return p;
    } else if (p.__proto__.constructor.name == "Array") {
      for (let j=0; j<p.length; j++) {
        const q = p[j];
        if (!NonNodeType.includes(q.__proto__.constructor.name)) {
          if (q.start == g[1]) return q;
        }   
      }
    }
  }
  return null;
}


function fillInSeparators(n) {
  if (!n) return;
  if (n.type == "FunctionDeclaration") {
    // debugger;
  }

  if (!n.separators) {
    const gaps = findGaps(n);
    n.separators = [];
    for (let k=0; k<gaps.length; k++) {
      const g = gaps[k];
      const gstr = n.codeStr.substring(g[0] - n.start, g[1] - n.start).trim();
      const pnode = findPrevNode(g, n);
      const nnode = findNextNode(g, n);
      if (!pnode) {
        n.separators.push(new Node("StartMark", g[0], g[1]));
      } else if (!nnode) {
        n.separators.push(new Node("EndMark", g[0], g[1]));
      } else {
        // if (pnode.value == "prob" || pnode.codeStr.trim() == "prob") {
        //   debugger;
        // }
        let newtype = "SeparatorFor" + pnode.type;
        if (n.type == "VariableDeclarator" && gstr == "=" ) {
          newtype = "AssignmentOperator";
        } else if (n.type == "BinaryExpression" && comparitors.includes(gstr)) {
          newtype = "Comparitor";
        }
        n.separators.push(new Node(newtype, g[0], g[1]));
      }
    }
  }

  if (n.separators.length == 0) return;
  if (typeof(n.separators[0].codeStr) == "undefined") return;
  // assign some more meaningful types
  switch (n.type) {
    case 'Program': break;
    case 'FunctionDeclaration': {
      n.separators[0].type = "keyword 'function'";
      if (n.separators.length == 2) {
        n.separators[1].type = "empty parameter list '()'";
      } else {
        for (let j=1; j<n.separators.length; j++) {
          const c = n.separators[j].codeStr.replace("\n", "").trim();
          if (c == "(") {
            n.separators[j].type = "opening '(' for parameter list ";
          } else if ( c == ")") {
            n.separators[j].type = "closing ')' for parameter list ";
          } else {
            n.separators[j].type = "separator for parameters";
          }
        }
      }
      break;
    }
    case 'BlockStatement': {
      n.separators[0].type = "opening '{' for code block";
      n.separators[n.separators.length-1].type = "closing '{' for code block";
      break;
    }
    case 'VariableDeclaration': {
      n.separators[0].type = "variable kind";
      break;
    }
    case 'CallExpression': {
      if (n.separators.length == 1) {
        n.separators[0].type = "empty argument list '()'";
      } else {
        // console.log("callexpression " + JSON.stringify(n.separators));
        for (let j=0; j<n.separators.length; j++) {
          // console.log("j is " + j + " ");
          const c = n.separators[j].codeStr.replace("\n", "").trim();
          if (c == "(") {
            n.separators[j].type = "opening '(' for argument list ";
          } else if ( c == ")") {
            n.separators[j].type = "closing ')' for argument list ";
          } else {
            n.separators[j].type = "separator for arguments";
          }
        }
      }
      break;
    }
    case 'MemberExpression': {
      for (let j=0; j<n.separators.length; j++) {
        const c = n.separators[j].codeStr.replace("\n", "").trim();
        if (c == "[") {
          n.separators[j].type = "opening '[' for member key";
        } else if ( c == "]") {
          n.separators[j].type = "closing ']' for member key";
        } else if ( c == ".") {
          n.separators[j].type = "'.' for member key";
        } else {
          n.separators[j].type = "separator for members";
        }
      }
      break;
    }
    case 'ObjectExpression': {
      if (n.separators.length == 1) {
        n.separators[0].type = "empty object '{ }'";
      } else {
        for (let j=0; j<n.separators.length; j++) {
          const c = n.separators[j].codeStr.replace("\n", "").trim();
          if (c == "{") {
            n.separators[j].type = "opening '{' for object definition";
          } else if ( c == "}") {
            n.separators[j].type = "closing '}' for object definition";
          } else {
            n.separators[j].type = "separator for object properties";
          }
        }
      }
      break;
    }
    case 'Property': {
      n.separators[0].type = "property assignment symbol ':'";
      break;
    }
    case 'AwaitExpression': {
      n.separators[0].type = "keyword 'await'";
      break;
    }
    case 'AssignmentExpression': {
      n.separators[0].type = "assignment operator '='";
      break;
    }    
    case 'ForStatement': {
      for (let j=0; j<n.separators.length; j++) {
        const c = n.separators[j].codeStr.replace("\n", "").trim();
        if (c.indexOf("for") >= 0) {
          n.separators[j].type = "keyword 'for'";
        } else if ( c.indexOf(")") >= 0 ) {
          n.separators[j].type = "closing ')' of for-loop control statements";
        } else {
          n.separators[j].type = "separator for for-loop control statements";
        }
      }
      break;
    }
    case 'BinaryExpression': {
      n.separators[0].type = "comparison operator";
      break;
    }
    case 'LogicalExpression': {
      n.separators[0].type = "logical operator";
      break;
    }
    case 'UpdateExpression': {
      n.separators[0].type = "update operator";
      break;
    }
    case 'IfStatement': {
      for (let j=0; j<n.separators.length; j++) {
        const c = n.separators[j].codeStr.replace("\n", "").trim();
        if (c.indexOf('if') >= 0) {
          n.separators[j].type = "keyword 'if'";
        } else if (c.indexOf('else') >= 0) {
          n.separators[j].type = "keyword 'else'";
        } else if (c == "}") {
          n.separators[j].type = "closing '}' for if statement";
        } else {
        }
      }
      if (n.separators.length < 2) {
        return;
        // debugger;
      }
      n.separators[0].type = "keyword 'if'";
      n.separators[1].type = "closing ')' for if";
      break;
    }
  }
}

function traverseAST(node, func, code) {
  if (!node) return;
  func(node, code);

  const keylist = Object.keys(node);
  for (let k=0; k<keylist.length; k++) {
    if (keylist[k] == "parent") continue;
    const p = node[keylist[k]];
    if (p == null) continue;
    if (!NonNodeType.includes(p.__proto__.constructor.name)) {
      traverseAST(p, func, code);
    } else if (p.__proto__.constructor.name == "Array") {
      for (let j=0; j<p.length; j++) {
        const q = p[j];
        if (!NonNodeType.includes(q.__proto__.constructor.name)) {
          traverseAST(q, func, code);
        }   
      }
    }
  }
}

// apply given func to every tree node
function traverseASTOld(node, func, code) {
  if (!node) return;
  func(node, code);
  if ('body' in node && Array.isArray(node.body)) {
    node.body.forEach((n) => { traverseAST(n, func, code); });
  } else if (node.type === "ForStatement") {
    traverseAST(node.init, func, code);
    traverseAST(node.test, func, code);
    traverseAST(node.update, func, code);
    traverseAST(node.body, func, code);
  } else if ('body' in node) traverseAST(node.body, func, code);
  else if ('expression' in node) traverseAST(node.expression, func, code);
  else if ('argument' in node) traverseAST(node.argument, func, code);
  else if ('properties' in node) {
    for (let k=0; k<node.properties.length; k++)
      traverseAST(node.properties[k], func, code);
  }
  else if ('consequent' in node) traverseAST(node.consequent, func, code);
  else if ('declarations' in node) traverseAST(node.consequent, func, code);
}


function addPathToAST(node) {
  if (!node) return;
  const keylist = Object.keys(node);
  node.hasChildrenNode = false;
  for (let k=0; k<keylist.length; k++) {
    if (keylist[k] == "parent") continue;
    const p = node[keylist[k]];
    if (p == null) continue;
    if (!NonNodeType.includes(p.__proto__.constructor.name)) {
      p.navipath = node.navipath + "|||" + keylist[k];
      p.parent = node;
      addPathToAST(p);
      node.hasChildrenNode = true;  
    } else if (p.__proto__.constructor.name == "Array") {
      for (let j=0; j<p.length; j++) {
        const q = p[j];
        if (!NonNodeType.includes(q.__proto__.constructor.name)) {
          q.navipath = node.navipath + "|||" + keylist[k] + "###" + q.codeStr.substring(0, 15);
          q.parent = node;
          addPathToAST(q); 
          node.hasChildrenNode = true;  
        }   
      }
    }
  }
}

// add path to all nodes recursively
function addPathToASTOld(node) {
  if (!node) return;
  
  if ('body' in node && Array.isArray(node.body)) {
    for (let k=0; k<node.body.length; k++) {
      const n = node.body[k];
      n.navipath = node.navipath + "|body_" + k;
      addPathToAST(n); 
    };
  } else if (node.type === "ForStatement") {
    node.init.navipath = node.navipath + "|init";
    addPathToAST(node.init);
    node.test.navipath = node.navipath + "|test";
    addPathToAST(node.test, func, code);
    node.update.navipath = node.navipath + "|update";
    addPathToAST(node.update);
    node.body.navipath = node.navipath + "|body";
    addPathToAST(node.body);
  } else if ('properties' in node) {
    for (let k=0; k<node.properties.length; k++) {
      const n = node.properties[k];
      n.navipath = node.navipath + "|properties_" + k;
      addPathToAST(n); 
    };
  } else if (node.type == "Property") {
    node.key.navipath = node.navipath + "|key";
    addPathToAST(node.key);
    node.value.navipath = node.navipath + "|value";
    addPathToAST(node.value);
  } else if ('declarations' in node) {
    for (let k=0; k<node.declarations.length; k++) {
      const n = node.declarations[k];
      n.navipath = node.navipath + "|declarations_" + k;
      addPathToAST(n); 
    };
  } else {
    const attrs = ['body', 'expression', 'argument', 'consequent']
    for (let k=0; k<attrs.length; k++) {
      if (attrs[k] in node) {
        node[attrs[k]].navipath = node.navipath + "|" + attrs[k];
        addPathToAST(node[attrs[k]]);
      }
    }
  } 
}



function findNodeByPath(root, navipath) {
  const steps = navipath.split("|||");
  const attrs = ['body', 'expression', 'argument', 'consequent'];
  const arrays = ['body', 'properties', 'declarations', 'separators'];


  let n = root;
  let pn = root;
  for (let k=1; k<steps.length; k++) {
    if (n == null) return null;
    const p = steps[k];

    if (p.indexOf("###") > 0) {
      // array
      const parts = p.split("###");
      if (arrays.includes(parts[0])) {

        let shortestDist = 100000000000; let bestNode = null;
        if (n[parts[0]] == null) return null;
        if (typeof(n[parts[0]]) == 'undefined') return null;
        for (let j=0; j<n[parts[0]].length; j++) {
          const m = n[parts[0]][j];
          const d = getEditDistance(m.codeStr.substring(0, 15), parts[1]);
          if (d.length < shortestDist) {
            shortestDist = d.length; bestNode = m;
          }
        }

        if (typeof(bestNode) == "undefined") {
          break;
        }
        n = bestNode;
      }
    } else if (typeof(n[p]) != "undefined") {
      n = n[p];
    } else {
      break;      
    }
  }
  return n;
}


// if both nodes are same type, and same number of children, and children are same type as well!
function nodesAreSameType(n1, n2) {
  if (!n1 || !n2) return false;
  
  if ('body' in n1 && Array.isArray(n1.body)) {
    if (! ('body' in n2 && Array.isArray(n2.body)) ) {
      return false;
    } else {
      for (let k=0; k<n1.body.length; k++) {
        const n1c = n1.body[k];
        const n2c = n2.body[k];
        if (!nodesAreSameType(n1c, n2c)) return false;
      }
      return true;
    }
  } else if (n1.type === "ForStatement") {
    if (n2.type != "ForStatement") return false;
    if (!nodesAreSameType(n1.init, n2.init)) return false;
    if (!nodesAreSameType(n1.test, n2.test)) return false;
    if (!nodesAreSameType(n1.update, n2.update)) return false;
    if (!nodesAreSameType(n1.body, n2.body)) return false;
    return true;
  } else if ('properties' in n1) {
    if (! ('properties' in n2)) return false;
    for (let k=0; k<n1.properties.length; k++) {
      const n1c = n1.properties[k];
      const n2c = n2.properties[k];
      if (!nodesAreSameType(n1c, n2c)) return false;
    }
    return true;
  } else if ('declarations' in n1) {
    if (! ('declarations' in n2)) return false;
    for (let k=0; k<n1.declarations.length; k++) {
      const n1c = n1.declarations[k];
      const n2c = n2.declarations[k];
      if (!nodesAreSameType(n1c, n2c)) return false;
    }
    return true;
  } else if (n1.key && n1.value) {
    if (!n2.key || !n2.value) return false;
    return true;
  } else {
    const attrs = ['body', 'expression', 'argument', 'consequent']
    for (let k=0; k<attrs.length; k++) {
      if (attrs[k] in n1) {
        if (! attrs[k] in n2 ) return false;
        return nodesAreSameType(n1[attrs[k]], n2[attrs[k]]);
      }
    }
  }
  console.log("uncomparable? \n\n" + n1.codeStr + "\n\n" + n2.codeStr);
  debugger;
}


function getFuncNodeFromAST(node, funcName) {
  if (!node) return null;
  if (node.type === 'FunctionDeclaration' && node.id.name === funcName) return node.body;
  if ('body' in node && Array.isArray(node.body)) {
    for (let i = 0; i < node.body.length; i++) {
      const n = getFuncNodeFromAST(node.body[i], funcName);
      if (n) return n;
    }
  } else if ('body' in node) return getFuncNodeFromAST(node.body, funcName);
  else if ('expression' in node) return getFuncNodeFromAST(node.expression, funcName);
  else if ('consequent' in node) return getFuncNodeFromAST(node.consequent, funcName);
  return null;
}

// find the user code node missing }
// and if possible the corresponding node in clean code.
function findMissingParenHelper(node, anode) {
  if (!node || !anode || node.parens === 0) return null;
  let cur = node;
  let acur = anode;
  while (cur) {
    if (Array.isArray(cur.body)) {
      let found = false;
      for (let i = 0; i < cur.body.length; i++) {
        if (cur.body[i].parens !== 0) {
          cur = cur.body[i];
          found = true;
          break;
        }
      }
      if (!found) {
        if (acur && Array.isArray(acur.body) && acur.body.length - cur.body.length === -1) {
          return [cur.body[cur.body.length - 1], node]; // return node as a marker to identify this kind of scenario.
        }
        return [cur, acur];
      }
      if (Array.isArray(acur.body)) {
        let aa = acur;
        let highest = 0.5;
        for (let j = 0; j < acur.body.length; j++) {
          if (cur && acur.body[j] && acur.body[j].type === cur.type) {
            const score = getSimilarityScore(cur.codeStr, acur.body[j].codeStr);
            if (score > highest) {
              aa = acur.body[j];
              highest = score;
            }
          }
        }
        // no corresponding node found in clean code
        if (aa === acur) return [cur, null];
        acur = aa;
      }
    } else {
      if (!cur.body || !('body' in cur.body) || cur.body.body.parens === 0) return [cur, acur];
      cur = cur.body;
      acur = acur.body;
    }
  }
  return null;
}

function getMostSimiliarLine(codeArr, target, from = 0) {
  let highest = 0;
  let result = -1;
  for (let i = from; i < codeArr.length; i++) {
    const score = getSimilarityScore(codeArr[i], target);
    if (score > highest) {
      highest = score;
      result = i;
    }
  }
  return result;
}

function findMissingParen(unode, anode, userCodeArr) {
  let msg = '';
  traverseAST(unode, countParens, userCodeArr);
  const results = findMissingParenHelper(unode, anode);
  if (results) {
    const node = results[0];
    const ansn = results[1];
    // user code node includes more statements because of the missing }
    if (node && ansn === unode) {
      let lineNum = absoluteToRelativePos(node.start, userCodeArr).line;
      const line = node.codeStr.split('\n')[0];
      for (let h = lineNum - 3; h < lineNum + 4; h++) {
        if (h >= 0 && h < userCodeArr.length && removeComment(userCodeArr[h]).trim() === removeComment(line).trim()) {
          lineNum = h;
          break;
        }
      }
      lineNum += 1;
      msg = `before line ${lineNum}.`;
    } else if (ansn && ansn.codeStr && node && node.codeStr) {
      // find the exact code block that missing }.
      const anscode = ansn.codeStr.split('\n');
      const usrcode = node.codeStr.split('\n');
      // check each } in clean code and see if a corresponding } can be found in user code.
      // if not, it is the missing one.
      for (let i = 1; i < anscode.length; i++) {
        const line = anscode[i];
        if (line.indexOf('}') < 0) continue;
        // find the previous non-comment line
        let b = i - 1;
        while (b >= 0 && anscode[b].trim() === '') b -= 1;
        const preLine = anscode[b];
        // find the next non-comment line
        let e = i + 1;
        while (e < anscode.length && anscode[e].trim() === '') e += 1;
        const postLine = e >= anscode.length ? '' : anscode[e];
        // count } in answer code block
        let acode = '';
        for (let k = b + 1; k < e; k++) acode += anscode[k];
        const ansCount = countChar(acode, '}');
        // get the corresponding user code
        const userPre = preLine === '' ? 0 : getMostSimiliarLine(usrcode, preLine);
        let userPost = postLine === '' ? Math.min(usrcode.length, userPre + e - b) : getMostSimiliarLine(usrcode, postLine, userPre + 1);
        if (userPost === -1) userPost = Math.min(usrcode.length, userPre + e - b);
        // check if a } is missing
        if (userPre >= 0 && userPost >= 0 && userPost - userPre <= 3 && userPost - userPre >= 0) {
          while (userPost < usrcode.length - 1 && usrcode[userPost].trim() === '') userPost += 1;
          // get code block between userPre and userPost lines
          let codeStr = '';
          for (let k = userPre + 1; k < userPost; k++) codeStr += usrcode[k];
          // count }
          const count = countChar(codeStr, '}');
          if (count < ansCount) {
            // get the exact line number of previous line
            let pre = absoluteToRelativePos(node.start, userCodeArr).line + userPre;
            for (let h = pre - 3; h < pre + 4; h++) {
              if (h >= 0 && h < userCodeArr.length && removeComment(userCodeArr[h]).trim() === removeComment(usrcode[userPre]).trim()) {
                pre = h;
                break;
              }
            }
            pre += 1;
            const post = pre + userPost - userPre;
            if (post - pre === 1) msg = `below line ${pre}. `;
            else msg = `between line ${pre} and line ${post}. `;
            return msg;
          }
        }
      }
    }
    if (msg === '' && node && 'codeStr' in node) {
      // if no clean code node found, just show information from user code AST
      // const codeArr = node.codeStr.split('\n');
      const b = absoluteToRelativePos(node.start, userCodeArr);
      const e = absoluteToRelativePos(node.end, userCodeArr);
      msg = `after or in between lines ${b.line} and ${e.line}.`;
      /*
      if (codeArr.length < 9) {
        msg += `${node.codeStr}`;
      } else {
        // cut lines if code is too long
        for (let i = 0; i < 3; i++) msg += `${codeArr[i]}\n`;
        msg += `...\n`;
        for (let i = 5; i > 0; i--) msg += `${codeArr[codeArr.length - i]}\n`;
      }
      */
    }
  }
  return msg;
}

function removeStrings(text) {
  const ans = [];
  let inDouble = -1;
  let inSingle = -1;
  let inMultiple = -1;
  for (let i = 0; i < text.length; i += 1) {
    if (inDouble < 0 && inSingle < 0 && inMultiple < 0 && 
      text.charAt(i) !== '"' && text.charAt(i) !== "'" && text.charAt(i) !== "`") {
      ans.push(text.charAt(i));
      continue;
    }
    if (text.charAt(i) === '"') {
      if (inDouble < 0) inDouble = i;
      else {
        if (inSingle > inDouble) inSingle = -1;
        if (inMultiple > inDouble) inMultiple = -1;
        inDouble = -1;
      }
    } else if (text.charAt(i) === "'") {
      if (inSingle < 0) inSingle = i;
      else {
        if (inDouble > inSingle) inDouble = -1;
        if (inMultiple > inSingle) inMultiple = -1;
        inSingle = -1;
      }
    } else if (text.charAt(i) === "`") {
      if (inMultiple < 0) inMultiple = i;
      else {
        if (inDouble > inMultiple) inDouble = -1;
        if (inSingle > inMultiple) inSingle = -1;
        inMultiple = -1;
      }
    }
  }
  return ans.join('');
}

function hasQuestionMarkToReplace(str) {
  const noComments = removeComment(str);
  const noStrings = removeStrings(noComments);
  return noStrings.indexOf('?') >= 0;
}

function findNodeContainingInd(nodeList, ind) {
  let minLength = 100000;
  let bestNode = null;
  for (let k=0; k<nodeList.length; k++) {
    const node = nodeList[k];
    if (node.start <= ind && node.end > ind) {
      if (node.end - node.start <= minLength) {
        minLength = node.end - node.start;
        bestNode = node;
      }
    }
  }
  return bestNode;
}

function ToPrint(s) {
  let ns = "";
  for (let k=0; k<s.length; k++) {
    const c = s.substring(k, k+1);
    if (c == c.toUpperCase()) {
      ns += " " + c.toLowerCase();
    } else {
      ns += c;
    }
  }
  return ns;
}


/* newest version using ast!
1. use codestr to find the node in user code ast that's right before problem
2. use user ast path to find corresponding answer ast node
3. look at difference in these 2 nodes, and give error rmessage
4. may add more comments to each node *aimx: 0 -- assign 0 to aimx*
*/

export default function getRichErrorMessages(chat, scenario, errors, userCode) {
  // console.log("getRichErrorMessages");
  if (!userCode || userCode.trim === '') return [];

  const catchedRe = [];
  const origRe = [];
  const updatedRe = [];

  userCode = cleanUpComment(userCode);
  const userCodeArr = userCode.split('\n');

  const answerCode = cleanUpComment(getElementCleancode(scenario, chat));
  
  const answerBlocks = getCodeBlocks(answerCode);
  const newMessages = new Set();
  
  if (userCode.trim === '') return [];
  const userBlocks = getCodeBlocks(userCode);

  let userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
  
  arrayNames = [
    'Balls', 'Pockets', 'Rails', 'Cushions'
  ];
  traverseAST(userAST, getArrNames, userCode);
  variableList = {};
  traverseAST(userAST, getVariableDef, userCode);


  let answerAST = acorn.parse_dammit(answerCode, { ecmaVersion: 8, onComment: [] });

  // run it once so we can use codeStr in fillInSeparators
  traverseAST(answerAST, addCodeStr, answerCode);
  traverseAST(userAST, addCodeStr, userCode);


  // make sure every single letter in code string is part of the tree!
  traverseAST(answerAST, fillInSeparators, answerCode);
  traverseAST(userAST, fillInSeparators, userCode);

  //const userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
  // run it again to add codestr for separators themselves
  traverseAST(answerAST, addCodeStr, answerCode);
  traverseAST(userAST, addCodeStr, userCode);

  traverseAST(answerAST, fillInSeparators, answerCode);
  traverseAST(userAST, fillInSeparators, userCode);


  answerNodeList = [];
  traverseAST(answerAST, addNodeToAnswerList, answerCode);
  userNodeList = [];
  traverseAST(userAST, addNodeToUserList, userCode);

  userAST.navipath = "root";
  addPathToAST(userAST);
  answerAST.navipath = "root";
  addPathToAST(answerAST);


  let qMarkFlag = false;

  errors.forEach((error) => {
    try {
      const origMessage = error.message.toLowerCase().replace("parsing error:", "").trim();
      const userErrorLine = userCodeArr[error.from.line];

      if (hasQuestionMarkToReplace(userErrorLine)) {
        qMarkFlag = true;
        const info = {
          message: `Please change '?' to your code.`,
          severity: "error",
          from: { line: error.from.line, ch: userErrorLine.indexOf('?') },
          to: { line: error.from.line, ch: userErrorLine.indexOf('?') + 1 }
        };
        pushToResult(info, updatedRe, newMessages);
        return;
      } else if (qMarkFlag) return;

      if (origMessage.indexOf("unexpected token") >= 0) {

        // first find node right before error point
        let errorInd = posToInd(error.from, userCodeArr) - 1;
        while (userCode.substring(errorInd, errorInd+1) == " " || userCode.substring(errorInd, errorInd+1) == "\n") {
          errorInd --;
        }
        const errorUserNode = findNodeContainingInd(userNodeList, errorInd);
        const userParent = errorUserNode.hasChildrenNode? errorUserNode : errorUserNode.parent;
        const answerParent = findNodeByPath(answerAST, userParent.navipath);
        if (!answerParent) {
          return;
        }
        const edits = getEditDistance(answerParent.codeStr, userParent.codeStr);
        for (let j=0; j<edits.length; j++) {
          const es = edits[j].split("_");
          if (es[0] == "D" && es[1].replace("\n", "").replace(" ", "") != "") {
            // found what was missing!
            const correctAnswerNode = findNodeContainingInd(answerNodeList, answerParent.start + Number(es[2]));
            // const userWrongNode = findNodeByPath(userAST, correctAnswerNode.navipath);
            let value = replaceAll(correctAnswerNode.codeStr, "\n", "");
            //value = replaceAll(value, " ", "");
            if (correctAnswerNode.type.indexOf("Separator") >= 0) {
              const info = {
                message: `Are you missing a '${value}' as ${ToPrint(correctAnswerNode.type)} here?`,
                severity: "error",
                from: indToPos(userParent.start, userCode),
                to: indToPos(userParent.end, userCode)
              };
              pushToResult(info, updatedRe, newMessages);
            } else {
              const info = {
                message: `It appears the syntax for ${ToPrint(correctAnswerNode.parent.type)} is not correct. Maybe you need to write '${value}' here?`,
                severity: "error",
                from: error.from, //indToPos(userParent.start, userCode),
                to: error.to, //indToPos(Math.max(userParent.start+1, userParent.end), userCode)
              };
              if (correctAnswerNode.parent.type == "Property") {
                info.message = `It appears the property definition has syntax issues. Maybe you need to write '${value}' here?`;
              }
              pushToResult(info, updatedRe, newMessages);
            }
            return;
          }
        }

        // no edit found, so must be next element in answer
        const nextAnswerNode = findNodeContainingInd(answerNodeList, answerParent.end + 1);
        let value = replaceAll(nextAnswerNode.codeStr, "\n", "");
        value = replaceAll(value, " ", "");
        const info = {
          message: `Are you missing a '${value}' as ${ToPrint(nextAnswerNode.type)} here?`,
          severity: "error",
          from: error.from,
          to: error.to
        };
        pushToResult(info, updatedRe, newMessages);


        // const info = {
        //   message: origMessage,
        //   severity: error.severity,
        //   from: error.from,
        //   to: error.to
        // };
        // pushToResult(info, updatedRe, newMessages);
        return;


        /*


        // find what should be expected in answer code using min edit distance
        let userLongString = userCode.substring(0, errorInd).trim();
        while (userLongString[userLongString.length-1] == "\n") {
          userLongString = userLongString.substring(0, userLongString.length-2).trim();
        }
        // userLongString = replaceAll(userLongString, "\n", "");
        // userLongString = replaceAll(userLongString, " ", "");
        let answerFullString = answerCode;
        // answerFullString = replaceAll(answerFullString, "\n", "");
        // answerFullString = replaceAll(answerFullString, " ", "");
        let minDist = 100000000;
        let minStringInd = -1;
        for (let k=answerFullString.length-1; k>=10; k--) {
          const answerString = answerFullString.substring(0, k);
          const d = editDistance(answerString, userLongString);
          if ( d < 8) {
            // debugger;
          }
          if (d < minDist) {
            console.log("new min at k " + k + " with dist " + d);
            console.log("answerString is --" + answerString + "--");
            minDist = d; minStringInd = k;
          }
        }        



        // find the meaning of that word or symbol, and say we are expecting that.
        let answerNode = null;
        const ss = userNodeList;
        for (let r=0; r<answerNodeList.length; r++) {
          const n = answerNodeList[r];
          
          if (!n.hasChildrenNode && n.start <= minStringInd && n.end > minStringInd) {
            answerNode = n;
            break;
            // // found node in answer
            // const actualInd = userLongString.length-1;
            // let sep = n.codeStr.replace("\n", "").replace(" ", "");
            // const info = {
            //   message: `Missing a '${sep}' as ${n.type} here.`,
            //   severity: "error",
            //   from: indToPos(actualInd, userCode),
            //   to: error.to
            // };
            // pushToResult(info, updatedRe, newMessages);
            // return;
          }
        }

        if (!answerNode) {
          const info = {
            message: origMessage,
            severity: error.severity,
            from: error.from,
            to: error.to
          };
          pushToResult(info, updatedRe, newMessages);
          return;
        }

        // get parent of node in user ast and answer ast, and get min edit distance from answer to user



        // not found, so must be a separater symbol?
        let minLength = 1000000;
        let correntNode = null;
        for (let r=0; r<answerNodeList.length; r++) {
          const n = answerNodeList[r];
          
          if (n.start <= minStringInd && n.end > minStringInd) {
            if (n.end - n.start < minLength) {
              minLength = n.end - n.start;
              correntNode = n;
            }
          }
        }


        let symStart = minStringInd;
        for (let j=minStringInd; j<answerFullString.length; j++) {
          const c = answerFullString.substring(j, j+1);
          if (c != " " && c != "\n") {
            minStringInd = j;
            break;
          }
        }


        let symbol = answerFullString.substring(minStringInd, minStringInd+1);
        for (let j=minStringInd+1; j<answerFullString.length; j++) {
          const c = answerFullString.substring(j, j+1);
          if (c == " " || c == "\n") break;
          if (":,;{}[]()!=".indexOf(c) < 0) break;
          symbol += c;
        }

        const actualInd = userLongString.length-1;
        const info = {
          message: `You need to add a ${symbol} after this point to specify a ${correntNode.type.toLowerCase()} correctly.`,
          severity: "error",
          from: indToPos(actualInd, userCode),
          to: indToPos(actualInd+1, userCode)
        };
        pushToResult(info, updatedRe, newMessages);
        return;

        const preUserNode = findNodeContainingInd(userNodeList, errorInd-1);

        const preAnswerNode = findNodeByPath(answerAST, preUserNode.navipath);

        if (nodesAreSameType(preUserNode, preAnswerNode)) {
          // must be a seperator issue
          const info = {
            message: `Are you missing a ',' here?`,
            severity: "error",
            from: { line: error.from.line, ch: userErrorLine.indexOf('?') },
            to: { line: error.from.line, ch: userErrorLine.indexOf('?') + 1 }
          };
          pushToResult(info, updatedRe, newMessages);
          return;
        } else {
          // this user node is missing something 
          const info = {
            message: `Definition not correct`,
            severity: "error",
            from: { line: error.from.line, ch: userErrorLine.indexOf('?') },
            to: { line: error.from.line, ch: userErrorLine.indexOf('?') + 1 }
          };
          if (preUserNode.type == "Property") {
          }
          pushToResult(info, updatedRe, newMessages);
          return;
        }

        const relPos = getFunctionAndString(userCode, error.from.line, error.from.ch);
        
        if (!relPos) return;
        if (!(relPos.functionName in userBlocks) || userBlocks[relPos.functionName].length === 0) return;
        if (!userBlocks[relPos.functionName][0]) return;

        let userLongString = replaceAll(relPos.userString, "\n", "");
        userLongString = replaceAll(userLongString, " ", "");
        let answerFullString = answerBlocks[relPos.functionName][0].code;
        answerFullString = replaceAll(answerFullString, "\n", "");
        answerFullString = replaceAll(answerFullString, " ", "");
        let minDist = 100000000;
        let minStringInd = -1;
        for (let k=answerFullString.length-1; k>=10; k--) {
          const answerString = answerFullString.substring(0, k);
          const d = editDistance(answerString, userLongString);
          if ( d < 3) {
            // debugger;
          }
          if (d < minDist) {
            console.log("new min at k " + k + " with dist " + d);
            console.log("answerString is " + answerString);
            minDist = d; minStringInd = k;
          }
        }

        const info = {
          message: `${error.message}.`,
          severity: "error",
          from: error.from,
          to: error.to
        };
        
        for (let j=minStringInd; j<answerFullString.length; j++) {
          const c = answerFullString.substring(j, j+1);
          if (c !== "" && c != "\n" && ":,;{}[]()!=".indexOf(c) < 0) continue;

          for (let k=j; k<answerFullString.length; k++) {
            const c = answerFullString.substring(k, k+1);
            if (c == "" || c == "\n") continue;

            if (":,;{}[]()!=".indexOf(c) >= 0) {
              info.message += ` Are you missing a '${c}' before it?`;
            }
            break;
          }
          break;
        }
        pushToResult(info, updatedRe, newMessages);

        return;
        */
      } else if (origMessage.indexOf('unrecoverable syntax error') >= 0) {
        // omit this kind errors. no meaning to show it to users.
        return;
      } else if (origMessage.indexOf("'function closure expressions' is only available in mozilla javascript extensions") >= 0) {
        // omit this error
        return;
      } else if (origMessage.indexOf('debugger') >= 0) {
        // allow user debug into the code
        return;
      } else if (origMessage.indexOf("is constant") > 0) {
        const info = {
          message: error.message + " You can't reassign a new value to it.",
          severity: "error",
          from: error.from,
          to: error.to
        };
        
        pushToResult(info, updatedRe, newMessages);

        return;
      } else if (origMessage.indexOf("expected an assignment or function call and instead saw an expression") >= 0) {
        const info = {
          message: `I'm not expecting an expression here. Are you missing '=' for assignment, or '(' for function call?`,
          severity: "error",
          from: error.from,
          to: error.to
        };
        
        pushToResult(info, updatedRe, newMessages);

        return;
      } else  if (origMessage.indexOf("'return' outside of function") >= 0) {
        const info = {
          message: `'return' should only be used inside a function. Maybe you have an extra '}' somewhere above?`,
          severity: "error",
          from: error.from,
          to: error.to
        };
        
        pushToResult(info, updatedRe, newMessages);

        return;
      } else if (origMessage.indexOf("is not defined") >= 0) {
        // try to look for what it could be

        const info = {
          message: error.message,
          severity: "error",
          from: error.from,
          to: error.to
        };
        
        let errorInd = posToInd(error.from, userCodeArr);
        const errorUserNode = findNodeContainingInd(userNodeList, errorInd);
        const answerNode = findNodeByPath(answerAST, errorUserNode.navipath);
        if (0 && answerNode.type == "Identifier") {
          info.message += ` Did you mean to write '${answerNode.name}'?`;
        } else {

          const matched = error.message.match("'(.*)'");
          if (matched && matched.length > 1) {
            const userw = matched[1];
            let highestScore = -1;
            let w = '';
            keyWordsAll.forEach((k) => {
              //const score = similarity(k, userw);
              if (k.toLowerCase().trim() == userw.toLowerCase().trim() ) {
              // if (score > highestScore) {
                highestScore = 1;
                w = k;
              }
            });
            Object.keys(variableList).forEach((k) => {
              if ( k == userw) return;
              const score = similarity(k, userw);
              if (score > highestScore) {
                highestScore = score;
                w = k;
              }
            });
            if (highestScore >= 0.7) {
              info.message += ` Did you mean to write '${w}'?`;
            } else {
              // only give it out if no hope of matching existing variables
              if (answerNode && answerNode.codeStr) {
                const codePreview = answerNode.codeStr.length < 10 ? answerNode.codeStr.substring(0, 10) : answerNode.codeStr.substring(0, 10) + " ...";
                if (codePreview != userw)
                  info.message += ` Did you mean to write '${answerNode.name ? answerNode.name : codePreview}'?`;
              }
            }
    
          }
        }

        
        pushToResult(info, updatedRe, newMessages);

        return;
      } else if (origMessage.indexOf("expected a conditional expression and instead saw an assignment") >= 0) {
        const info = {
          message: `You need to provide a conditional expression as a test, such as 'a == 2', 'b > 3', 'c <= d', 'd != f', etc.`,
          severity: "error",
          from: error.from,
          to: error.to
        };
        pushToResult(info, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf("unexpected constant condition") >= 0) {
        const info = {
          message: `You need to provide a conditional expression as a test, such as 'a == 2', 'b > 3', 'c <= d', 'd != f', etc.`,
          severity: "error",
          from: error.from,
          to: error.to
        };
        pushToResult(info, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf("empty block statement") >= 0) {
        const info = {
          message: `Found an empty block with no code inside. Is this intentional?`,
          severity: "warning",
          from: error.from,
          to: error.to
        };
        
        pushToResult(info, updatedRe, newMessages);
        return;
        
      } else if (origMessage.indexOf("missing semicolon") >= 0) {
        const start = { line: error.from.line, ch: error.from.ch-1 };
        const end = { line: error.to.line, ch: error.to.ch+1 };
        const info = {
          message: error.message,
          severity: "error",
          from: start,
          to: end
        };
        
        pushToResult(info, updatedRe, newMessages);
        return;
      }

      // by default simply pass through error message to output
      
      pushToResult(error, updatedRe, newMessages);
      return;
      // }

    } catch (e) {
      pushToResult(error, origRe, newMessages);
      console.log(e);
    }
  });

  return catchedRe.concat(updatedRe).concat(origRe);
}




// generate more accurate or meaningful error messages for lint error
export function getRichErrorMessagesOld(chat, scenario, errors, userCode) {
  // console.log("getRichErrorMessages");
  const catchedRe = [];
  const origRe = [];
  const updatedRe = [];
  const answerCode = getElementCleancode(scenario, chat);
  const answerBlocks = getCodeBlocks(answerCode);
  const newMessages = new Set();
  userCode = cleanUpComment(userCode);
  const userCodeArr = userCode.split('\n');

  const astucode = userCode;
  const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 8, onComment: [] });
  arrayNames = [
    'Balls', 'Pockets', 'Rails', 'Cushions'
  ];
  traverseAST(userAST, getArrNames, astucode);
  variableList = {};
  traverseAST(userAST, getVariableDef, astucode);


  const answerAST = acorn.parse_dammit(answerCode, { ecmaVersion: 8, onComment: [] });
  //const userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
  traverseAST(answerAST, addCodeStr, answerCode);
  traverseAST(userAST, addCodeStr, userCode);

  let qMarkFlag = false;

  errors.forEach((error) => {
    try {
      const origMessage = error.message.toLowerCase();
      const userErrorLine = userCodeArr[error.from.line];

      if (hasQuestionMarkToReplace(userErrorLine)) {
        qMarkFlag = true;
        const info = {
          message: `Please change '?' to your code.`,
          severity: "error",
          from: { line: error.from.line, ch: userErrorLine.indexOf('?') },
          to: { line: error.from.line, ch: userErrorLine.indexOf('?') + 1 }
        };
        pushToResult(info, updatedRe, newMessages);
        return;
      } else if (qMarkFlag) return;

      // handle mis-match errors
      if (origMessage.indexOf('expected') >= 0) {
        // check whether the error is in the previous line if error is at the beginning of a line
        // or if the error is about a missing ':'
        const toMoveUp = (error.from.ch === 0 || userErrorLine.substring(0, error.from.ch).trim() === '' ||
        origMessage.indexOf(`expected '}' to match '{'`) >= 0);
        if (toMoveUp && error.from.line > 0) {
          // get the last line that is not a comment
          let errorLineNumPre = error.from.line - 1;
          while (errorLineNumPre >= 0 && removeComment(userCodeArr[errorLineNumPre]).trim() === '') errorLineNumPre -= 1;

          if (errorLineNumPre >= 0) {
            const errorPosPre = userCodeArr[errorLineNumPre].length;
            const catched = isErrorCatched(errorLineNumPre, errorPosPre, userCode, answerBlocks, error, newMessages, catchedRe);
            // if nothing wrong in the previous line, it might be a imcompleted object declaration.
            if (!catched) {
              const preLine = removeComment(userCodeArr[errorLineNumPre]);
              if (preLine.indexOf(':') >= 0 && countChar(preLine, '}') === 0) {
                let b = 0;
                while (b < preLine.length && preLine.charAt(b) === ' ') b += 1;
                if (b >= preLine.length) b = 0;
                const info = {
                  message: `Please make sure the object definition is finished with '}'. `,
                  severity: "warning",
                  from: { line: errorLineNumPre, ch: b },
                  to: { line: errorLineNumPre, ch: preLine.length }
                };
                pushToResult(info, updatedRe, newMessages);
              }
            }
          }
        } else {
          // error is not at the beginning of a line or the previous line does not has an error
          const errorLineNum = error.from.line;
          const errorPos = error.from.ch;
          isErrorCatched(errorLineNum, errorPos, userCode, answerBlocks, error, newMessages, catchedRe);
        }
        // remove duplicate error message about '?'
        if (newMessages.has(`Please change '?' to your code.---${error.from.line}`) &&
        error.message.trim() === `Expected an identifier and instead saw '?'.`) return;

        if (error.message === 'Expected a conditional expression and instead saw an assignment.') {
          const note = Object.assign({}, error);
          note.message += ` You need to provide a conditional expression here, such as 'a == 2', 'b >= 3', 'c <= d', 'd != f', etc.`;
          pushToResult(note, updatedRe, newMessages);
          return;
        } else if (origMessage.indexOf('expected an assignment or function call and instead saw an expression') >= 0) {
          const note = Object.assign({}, error);
          if (userErrorLine && userErrorLine.indexOf('==') >= 0) {
            note.message += ` Did you mean '=' instead of '=='? `;
          }
          pushToResult(note, updatedRe, newMessages);
          return;
        }
      } else if (origMessage.indexOf('unrecoverable syntax error') >= 0) {
        // omit this kind errors. no meaning to show it to users.
        return;
      } else if (origMessage.indexOf("'function closure expressions' is only available in mozilla javascript extensions") >= 0) {
        // omit this error
        return;
      } else if (origMessage.indexOf('debugger') >= 0) {
        debugger;
        // allow user debug into the code
        return;
      } else if (origMessage.indexOf('defined') >= 0 && origMessage.indexOf("'undefined'") < 0 || origMessage.indexOf('not defined') >= 0) {
        // check undefined identifiers
        debugger;
        const errorLineNum = error.from.line;
        const errorPos = error.from.ch;
        const catched = isErrorCatched(errorLineNum, errorPos, userCode, answerBlocks, error, newMessages, catchedRe, false, true);
        if (catched) return;
        const matched = error.message.match("'(.*)'");
        if (matched && matched.length > 1) {
          const userw = matched[1];
          let highestScore = -1;
          let w = '';
          keyWordsAll.forEach((k) => {
            const score = similarity(k, userw);
            if (score > highestScore) {
              highestScore = score;
              w = k;
            }
          });
          Object.keys(variableList).forEach((k) => {
            const score = similarity(k, userw);
            if (score > highestScore) {
              highestScore = score;
              w = k;
            }
          });

          const note = Object.assign({}, error);
          note.from.line --;
          note.from.ch --;
          note.to.line --;
          note.to.ch --;

          if (highestScore > 0.6) {
            note.message += ` Did you mean to write '${w}'?`;
          } else {
            //note.message += ` It might be a typo on an existing variable; otherwise, please define it first. Note that it needs to be defined within the current scope, such as the current function or for-loop block.`;
          }
          const pos = userErrorLine.indexOf(userw, errorPos);
          if (pos > errorPos) {
            note.from.ch = pos;
            note.to.ch = pos + userw.length;
          }
          pushToResult(note, catchedRe, newMessages);
          return;
        }
      } else if (origMessage.indexOf('duplicate key') >= 0) {
        const errorLineNum = error.from.line;
        const errorPos = error.from.ch;
        const catched = isErrorCatched(errorLineNum, errorPos, userCode, answerBlocks, error, newMessages, catchedRe, true);
        if (catched) return;
      } else if (origMessage.indexOf('has already been declared') >= 0) {
        const matched = error.message.match("'(.*)'");
        if (matched && matched.length > 1) {
          const userw = matched[1];
          const definedArr = [];
          for (let i = 0; i < error.from.line; i++) {
            if (userCodeArr[i].indexOf(`const ${userw}`) >= 0 ||
            userCodeArr[i].indexOf(`let ${userw}`) >= 0 ||
            userCodeArr[i].indexOf(`var ${userw}`) >= 0) {
              definedArr.push(i);
            }
          }
          const note = Object.assign({}, error);
          if (definedArr.length > 0) {
            note.message = `'${userw}' has already been defined in line ${definedArr[0] + 1}.`;
            // for (let j = 1; j < definedArr.length; j++) note.message += `, ${definedArr[j] + 1}`;
            // note.message += '.';
          }
          note.message += ` If you meant to use the same variable or function, you don't need to define it again. Otherwise, please choose a different name.`;
          pushToResult(note, updatedRe, newMessages);
          return;
        }
      } else if (origMessage.indexOf('array literal notation [] is preferable') >= 0) {
        const note = Object.assign({}, error);
        note.message += ` Please use '[]' instead of 'new Array()'`;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage === 'bad assignment.') {
        const note = Object.assign({}, error);
        note.message = `The left-hand side of an assignment expression has to be a varable. Or, do you mean a conditional expression, such as 'a == 2', 'b >= 3', 'c <= d', 'd != f', etc.?`;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('you might be leaking a variable') >= 0) {
        const note = Object.assign({}, error);
        const matched = error.message.match(/\((.*)\)/);
        if (matched && matched.length > 1) {
          const userw = matched[1];
          note.message += ` Please declare '${userw}' separately first.`;
        }
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage === 'confusing minuses.') {
        const note = Object.assign({}, error);
        note.message += ` You might need to put the operand in parathesis, or delete one minus. `;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage === 'confusing plusses.') {
        const note = Object.assign({}, error);
        note.message += ` You might need to put the operand in parathesis, or delete one plus. `;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('bad escaping of eol') >= 0) {
        const note = Object.assign({}, error);
        note.message = `Please use backticks (\`\`) to enclose your multi-line string. `;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('extra comma.') >= 0) {
        const note = Object.assign({}, error);
        note.message = `Extra comma. Please only have one comma here.`;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('a leading decimal point can be confused with a dot') >= 0) {
        const note = Object.assign({}, error);
        const matched = error.message.match(/'(.*)'/);
        if (matched && matched.length > 1) {
          const userw = matched[1];
          note.message += ` Please use '0${userw}' instead.`;
        }
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('attempting to override') >= 0 && origMessage.indexOf('which is a constant') >= 0) {
        const note = Object.assign({}, error);
        const matched = error.message.match(/'(.*)'/);
        if (matched && matched.length > 1) {
          const userw = matched[1];
          note.message += ` If you did want to change the value of '${userw}', please declare it with 'let' instead of 'const'.`;
        }
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage === 'did you mean to return a conditional instead of an assignment?') {
        const note = Object.assign({}, error);
        note.message = `Did you mean to return a conditional instead of an assignment, such as 'a == 2', 'b >= 3', 'c <= d', 'd != f', etc.?`;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('a trailing decimal point can be confused with a dot') >= 0) {
        const note = Object.assign({}, error);
        note.message += ` Please remove it.`;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('unclosed template literal') >= 0) {
        const note = Object.assign({}, error);
        note.message += ` Please put '\`' at the end of your string. `;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf('unclosed string') >= 0) {
        const note = Object.assign({}, error);
        note.message += ` Please put ' or " at the end of your string. `;
        pushToResult(note, updatedRe, newMessages);
        return;
      } else if (origMessage.indexOf(`unmatched '{'`) >= 0) {
        const note = Object.assign({}, error);
        if (userErrorLine.charAt(note.from.ch) !== '{') {
          note.from.ch = userErrorLine.indexOf('{', note.from.ch);
          note.to.ch = note.from.ch + 1;
        }
        // check if error is in a function definition
        const funcIndex = userErrorLine.indexOf('function');
        if (funcIndex >= 0) {
          const funcName = getWordAtPos(userErrorLine, funcIndex + 8);
          note.message += `Inside function '${funcName}', not all '{' are matched with '}'. `;
        }
        // check from AST
        const relPos = getRelativePosition(userCode, error.from.line);
        let unode = userAST;
        let anode = answerAST;
        if (relPos) {
          unode = getFuncNodeFromAST(userAST, relPos.functionName);
          anode = getFuncNodeFromAST(answerAST, relPos.functionName);
        }
        const msg = findMissingParen(unode, anode, userCodeArr);

        if (msg !== '') note.message += `You might need to insert '}' ${msg}`;
        pushToResult(note, updatedRe, newMessages);
        if (msg.indexOf('between line') >= 0) {
          const msgLine = parseInt(getWordAtPos(msg, msg.indexOf('between line') + 12), 10);
          if (msgLine > error.from.line) {
            const info = {
              message: `'}' might be missing here. `,
              severity: "warning",
              from: { line: msgLine, ch: 0 },
              to: { line: msgLine, ch: userCodeArr[msgLine - 1].length + 1 }
            };
            pushToResult(info, updatedRe, newMessages);
          }
        } else if (msg.indexOf('before line') >= 0) {
          const msgLine = parseInt(getWordAtPos(msg, msg.indexOf('before line') + 11), 10);
          if (msgLine > error.from.line) {
            const info = {
              message: `'}' might be missing before this line. `,
              severity: "warning",
              from: { line: msgLine - 1, ch: 0 },
              to: { line: msgLine - 1, ch: userCodeArr[msgLine - 1].length + 1 }
            };
            pushToResult(info, updatedRe, newMessages);
          }
        } else if (msg.indexOf('below line') >= 0) {
          const msgLine = parseInt(getWordAtPos(msg, msg.indexOf('below line') + 10), 10);
          if (msgLine > error.from.line) {
            const info = {
              message: `'}' might be missing below this line. `,
              severity: "warning",
              from: { line: msgLine - 1, ch: 0 },
              to: { line: msgLine - 1, ch: userCodeArr[msgLine - 1].length + 1 }
            };
            pushToResult(info, updatedRe, newMessages);
          }
        }
        return;
      }
      pushToResult(error, origRe, newMessages);
    } catch (e) {
      pushToResult(error, origRe, newMessages);
      console.log(e);
    }
  });

  return catchedRe.concat(updatedRe).concat(origRe);
}

function getSimilarWord(s, candidates, lowest = -1) {
  let highestScore = lowest;
  let w = '';
  candidates.forEach((k) => {
    const score = getWordsSimilarity(s, k);
    if (score > highestScore) {
      highestScore = score;
      w = k;
    }
  });
  return w;
}

function checkWithPreDefined(userCode) {
  const userCodeArr = userCode.split('\n');
  const results = [];
  for (let i = 0; i < userCodeArr.length; i++) {
    const line = userCodeArr[i];
    preDefined.forEach((mod) => {
      if (line.indexOf(mod.moduleName) < 0) return;

      const regex = mod.regex;
      const matchArr = [];
      let match = regex.exec(line);
      while (match != null) {
        matchArr.push({ name: match[0], index: match.index });
        match = regex.exec(line);
      }
      if (!matchArr) return;
      matchArr.forEach((m) => {
        const name = m.name.substring(mod.moduleName.length + 1);
        const isFunc = line.charAt(m.index + m.name.length) === '(';
        if (isFunc && !mod.functions.has(name) || !isFunc && !mod.constants.has(name)) {
          const candidates = isFunc ? mod.functions : mod.constants;
          const simi = getSimilarWord(name, candidates);
          const isReallyFunc = mod.functions.has(name);
          const m2 = `. If you wanted to call function ${name}, please add ()`;
          let m1 = isFunc ? `function '${name}'` : `constant '${name}'`;
          if (!isFunc && isReallyFunc) m1 += m2;
          const info = {
            message: `${mod.moduleName} does not have ${m1}. `,
            severity: "error",
            from: { line: i, ch: m.index },
            to: { line: i, ch: m.index + m.name.length }
          };
          if (simi !== '') {
            const m3 = isFunc ? 'function' : 'constant';
            info.message += `Did you mean ${m3} '${simi}'? `;
          }
          results.push(info);
        }
      });
    });
  }
  // sort by position.
  results.sort((a, b) => {
    if (a.from.ch > b.from.ch) return 1;
    else if (a.from.ch < b.from.ch) return -1;
    return 0;
  });
  return results;
}

var moreErrors = [];
var arrayNames = [];
const funcReturnsArray = [
  'world.CandidateBallList',
  'calculateEndState', 'calculateEndState2'
];
var variableList = {};

function checkEachLine(userCode, userAST, fnames) {
  const asyncFunc = {
    calculateProbability: true,
    getSecondsLeft: true,
    calculateEndState: true,
    calculateEndState2: true, 
    getFirstBallTouched: true,
    UpdateWorld: true,
    PlotData: true,
    SubmitData: true,
    TrainLinearModel: true,
    LoadData: true,
    WaitForAllBallStop: true,
  };
  
  const userCodeArr = userCode.split('\n');
  const results = [];

  userCodeArr.forEach((line) => {
    if (line.indexOf('async') >= 0 && line.indexOf('function') >= 0) {
      const funcName = getWordAtPos(line, line.indexOf('function') + 8);
      asyncFunc[funcName] = true;
    }
  });

  for (let lineNum = 0; lineNum < userCodeArr.length; lineNum += 1) {
    const line = userCodeArr[lineNum]; //removeStrings(removeComment(userCodeArr[lineNum]));
    const origLine = userCodeArr[lineNum];

    // check missing await
    const keys = Object.keys(asyncFunc);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (line.indexOf(key) >= 0 && line.indexOf('await') < 0 && line.indexOf('function') < 0 && line.indexOf("print") < 0 && line.indexOf("console.log") < 0) {
        const info = {
          message: `The function '${key}' is marked as async, so please add the keyword 'await' before the function name when calling it. `,
          severity: "error",
          from: { line: lineNum, ch: origLine.indexOf(key) },
          to: { line: lineNum, ch: origLine.indexOf(key) + key.length }
        };
        results.push(info);
      }
    }

    // check & in if conditions
    if (line.indexOf('if') >= 0 && line.indexOf('&') >= 0 && line.indexOf('&&') < 0) {
      const info = {
        message: `'&' is used in the if-statement condition though it should be '&&'. `,
        severity: "warning",
        from: { line: lineNum, ch: origLine.indexOf('&') },
        to: { line: lineNum, ch: origLine.indexOf('&') + 1 }
      };
      results.push(info);
    }

    // check for loops
    if (line.indexOf('for') >= 0 && line.indexOf('forEach') < 0 && line.indexOf(' of ') < 0) {
      const b = line.indexOf('(', line.indexOf('for')) + 1;
      const e = line.lastIndexOf(')');
      const tokens = line.substring(b, e).split(';');
      if (tokens.length > 0) {
        const incre = tokens[tokens.length - 1];
        const cleanincre = replaceAll(incre, ' ', '');
        const from = { line: lineNum, ch: origLine.lastIndexOf(incre) };
        const to = { line: lineNum, ch: origLine.lastIndexOf(incre) + incre.length };
        if (incre && incre.indexOf('+') < 0 && incre.indexOf('-') < 0) {
          let loopvar = '';
          if (tokens.length === 3 && tokens[0].length > 0) {
            const cleaned = tokens[0].replace(/const|let|var| /gi, '');
            if (cleaned.indexOf('=') >= 0) {
              loopvar = ` '${cleaned.substring(0, cleaned.indexOf('='))}'`;
            }
          }
          const info = {
            message: `You might need to increase or decrease the value of loop variable${loopvar} here after each iteration. `,
            severity: "warning",
            from,
            to
          };
          results.push(info);
        } else if (cleanincre && cleanincre.indexOf('=+') >= 0) {
          const info = {
            message: `Do you mean '+=' instead of '=+'? `,
            severity: "error",
            from,
            to
          };
          results.push(info);
        } else if (cleanincre.indexOf('=-') >= 0) {
          const info = {
            message: `Do you mean '-=' instead of '=-'? `,
            severity: "error",
            from,
            to
          };
          results.push(info);
        }
      }
    }

    // check misspelled array functions or index
    arrayNames.forEach((arrName) => {
      const ind = line.indexOf(`${arrName}.`);
      if (ind >= 0) {
        const wholeword = getWordAtPos(line, ind);
        if (arrName !== wholeword) return;
        const word = getWordAtPos(line, ind + arrName.length + 1);
        if (word && word.toLowerCase().charAt(0) === 'l' && word !== 'length') {
          const info = {
            message: `Do you mean '${arrName}.length' instead of '${arrName}.${word}'? `,
            severity: "warning",
            from: { line: lineNum, ch: origLine.indexOf(`${arrName}.`) },
            to: { line: lineNum, ch: origLine.indexOf(`${arrName}.`) + `${arrName}.${word}`.length }
          };
          results.push(info);
        } else if (word && !arrayFuncs.has(word)) {
          const maybe = getSimilarWord(word, [...arrayFuncs], 0.5);
          let msg = '';
          if (maybe && maybe.length > 0) msg = `Do you mean '${arrName}.${maybe}' instead of '${arrName}.${word}'?`;
          else msg = `Do you mean '${arrName}[${word}]'?`;
          const info = {
            message: `'${arrName}' is an array and does not has a function or property named '${word}'. ${msg}`,
            severity: "warning",
            from: { line: lineNum, ch: origLine.indexOf(`${arrName}.`) },
            to: { line: lineNum, ch: origLine.indexOf(`${arrName}.`) + `${arrName}.${word}`.length }
          };
          results.push(info);
        }
      }

      // check type of array index
      const ind2 = line.indexOf(`${arrName}[`);
      if (ind2 >= 0) {
        const index = line.substring(ind2 + arrName.length + 1, line.indexOf(']', ind2));
        if (isNaN(index) && index in variableList) {
          const type = variableList[index];
          if (type !== 'int' && type !== 'unknown') {
            const aan = (type === 'object' ? 'an' : 'a');
            const info = {
              message: `Array index number must be an integer, but '${index}' might be ${aan} ${type}.`,
              severity: "warning",
              from: { line: lineNum, ch: origLine.indexOf(`${arrName}[`) },
              to: { line: lineNum, ch: origLine.indexOf(`${arrName}[`) + `${arrName}[${index}]`.length }
            };
            results.push(info);
          }
        }
      }
    });
/*
    // check if function calls followed by (
    fnames.forEach((fn) => {
      const ind = line.indexOf(fn);
      const word = getWordAtPos(line, ind);
      if (ind >= 0 && word === fn) {
        if (line.indexOf("print(") >= 0) return;
        let b = ind + fn.length;
        while (b < line.length && line.charAt(b) === ' ') b += 1;
        if (b === line.length || line.charAt(b) !== '(') {
          const info = {
            // message: `Are you calling function '${fn}'? If yes, please add '()' with parameters after the function name. `,
            message: `You need to append parameter list wrapped by '()' after the function name. `,
            severity: "warning",
            from: { line: lineNum, ch: origLine.indexOf(fn) },
            to: { line: lineNum, ch: origLine.indexOf(fn) + fn.length }
          };
          results.push(info);
        }
      }
    });*/
  }

  return results;
}

function getCodeBlocksFromAST(node, codeArr) {
  if (!node || !node.body) return {};
  const result = {};
  if (!Array.isArray(node.body)) {
    if (node.codeStr) addToBlock(result, '', node.codeStr, 0);
    return result;
  }
  for (let i = 0; i < node.body.length; i++) {
    const cur = node.body[i];
    if (cur.type === "FunctionDeclaration") {
      const funcName = cur.id.name;
      const code = cur.codeStr;
      const funcBegin = absoluteToRelativePos(cur.start, codeArr);
      addToBlock(result, funcName, code, funcBegin.line);
    }
  }
  return result;
}

const checkExtraParen = (node, codeStr) => {
  return;
  if (!node || !node.type || !node.codeStr || node.type !== "EmptyStatement") return;
  if (node.codeStr.trim() === '}') {
    const from = absoluteToRelativePos(node.start, codeStr.split('\n'));
    const to = absoluteToRelativePos(node.end, codeStr.split('\n'));
    from.ch = from.pos;
    to.ch = to.pos;
    const info = {
      message: `Unexpected token '}'. `,
      severity: "error",
      from,
      to
    };
    moreErrors.push(info);
  }
};


const checkPropAssignment = (node, codeStr) => {
  if (!node || !node.type || node.type !== "Property") return;
  const numProps = ['x', 'y', 'aimx', 'aimy', 'strength', 'targetBallID', 'targetPocketID', 'cueballx', 'cuebally', 'spin', 'hspin'];
  if ( numProps.includes(node.key.name) ) {   
    const vkeys = Object.keys(variableList);
    for (let k=0; k<vkeys.length; k++) {
      const vtype = variableList[vkeys[k]];
      const v = vkeys[k];
      if (node.value.name == v && (vtype == "object" || vtype == "array" || vtype == "array of int") ) {
        vtype1 = vtype.split(" ")[0];
        let from = absoluteToRelativePos(node.start, codeStr.split('\n'));
        let to = absoluteToRelativePos(node.end, codeStr.split('\n'));
        from.ch = from.pos;
        to.ch = to.pos;
        const info = {
          message: `'${node.key.name}' should take a number as its value, but '${node.value.name}' is an ${vtype1}. Maybe you meant to read ${vtype1 == "object" ? "a property of " + node.value.name : "an element of " + node.value.name}?`,
          severity: "error", from, to
        };
        moreErrors.push(info);
        return; 
      }
    }
  }
  return;
};

const checkBinaryLogicExpression = (node, codeStr) => {
  if (!node || !node.type || node.type !== "BinaryExpression") return;
  const ops = ["<=", ">=", "<", ">", "=="];
  if (!ops.includes(node.operator)) return;
  if (node.left.type != 'Identifier' || node.right.type != 'Identifier') return;

  const vkeys = Object.keys(variableList);
  for (let k=0; k<vkeys.length; k++) {
    const vtype = variableList[vkeys[k]];
    const v = vkeys[k];
    if (node.right.name == v && (vtype == "array" || vtype == "array of int") ) {
      let from = absoluteToRelativePos(node.start, codeStr.split('\n'));
      let to = absoluteToRelativePos(node.end, codeStr.split('\n'));
      from.ch = from.pos;
      to.ch = to.pos;
      const info = {
        message: `'${node.right.name}' is an ${vtype}, so you can't use it to directly compare with ${node.left.name}. Are you trying to read the number of elements in ${node.right.name} using '${node.right.name}.length'?`,
        severity: "error", from, to
      };
      moreErrors.push(info);
      return; 
    }
  }
  return;
};


const checkBinaryCalcExpression = (node, codeStr) => {
  if (!node || !node.type || node.type !== "BinaryExpression") return;
  const ops = ["+", "-", "*", "/"];
  if (!ops.includes(node.operator)) return;
  if (node.left.type != 'Identifier' && node.right.type != 'Identifier') return;
  const vkeys = Object.keys(variableList);
  for (let k=0; k<vkeys.length; k++) {
    const vtype = variableList[vkeys[k]];
    const v = vkeys[k];
    if (node.left.type == "Identifier" && node.left.name == v && (vtype == "array" || vtype == "array of int") ) {
      let from = absoluteToRelativePos(node.start, codeStr.split('\n'));
      let to = absoluteToRelativePos(node.end, codeStr.split('\n'));
      from.ch = from.pos;
      to.ch = to.pos;
      const info = {
        message: `'${node.left.name}' is an array, so you can't use it in a calculation directly. Perhaps you meant to use '${node.left.name}.length' to get total number of elements in this array? Or read an element of '${node.left.name}' using an index like '${node.left.name}[0]'?`,
        severity: "error", from, to
      };
      moreErrors.push(info);
      return; 
    }

    if (node.right.type == "Identifier" && node.right.name == v && (vtype == "array") ) {
      let from = absoluteToRelativePos(node.start, codeStr.split('\n'));
      let to = absoluteToRelativePos(node.end, codeStr.split('\n'));
      from.ch = from.pos;
      to.ch = to.pos;
      const info = {
        message: `'${node.right.name}' is an array, so you can't use it in a calculation directly. Maybe you meant to write '${node.right.name}.length' to get total number of elements in this array? Or read an element of '${node.right.name}' using an index like '${node.right.name}[0]'?`,
        severity: "error", from, to
      };
      moreErrors.push(info);
      return; 
    }
  }
  return;
};

const checkForLoop = (node, codeStr) => {
  if (!node || !node.type || node.type !== "ForStatement") return;
  if (!node.update) {
    let from = absoluteToRelativePos(node.parent.start, codeStr.split('\n'));
    let to = absoluteToRelativePos(node.parent.end, codeStr.split('\n'));
    from.ch = from.pos;
    to.ch = to.pos;
    const info = {
      message: `missing update statement for for-loop`,
      severity: "error",
      from,
      to
    };
    moreErrors.push(info);
    return; 
  }
  // get loop variables
  //debugger;
  const initId = [];
  if (node.init && node.init.declarations) {
    node.init.declarations.forEach((d) => { initId.push(d.id.name); });
  }
  const testStr = codeStr.substring(node.test.start, node.test.end);
  const updateStr = codeStr.substring(node.update.start, node.update.end);

  // check test conditions
  let from = absoluteToRelativePos(node.test.start, codeStr.split('\n'));
  let to = absoluteToRelativePos(node.test.end, codeStr.split('\n'));
  from.ch = from.pos;
  to.ch = to.pos;
  if (!node.test || node.test.type !== "BinaryExpression" && node.test.type !== "LogicalExpression") {
    const info = {
      message: `'${testStr}' is not a valid stopping condition that evalutes to true or false. `,
      severity: "error",
      from,
      to
    };
    moreErrors.push(info);
    return;
  } 

  // // check for correct test condition.
  // for (let x=0; x<arrayNames.length; x++) {
  //   if (testStr.indexOf(arrayNames[x]) >= 0 && testStr.indexOf(arrayNames[x] + ".length") < 0) {
  //     debugger;
  //     moreErrors.push({
  //       message: `'${testStr}' is not a valid stopping condition since ${arrayNames[x]} is an array, not a number. Maybe you meant to use '${arrayNames[x]}.length'?`,
  //       severity: "error",
  //       from,
  //       to
  //     });
  //     return;
  //   }
  // }
  
  if (initId.length > 0) {
    let found = false;
    initId.forEach((id) => {
      if (testStr.indexOf(id) >= 0) found = true;
    });
    if (!found) {
      const info = {
        message: `'${testStr}' is not a valid stopping condition on the variable ${initId.length === 1 ? initId[0] : ''}. `,
        severity: "error",
        from,
        to
      };
      moreErrors.push(info);
    }
  }
  from = absoluteToRelativePos(node.update.start, codeStr.split('\n'));
  to = absoluteToRelativePos(node.update.end, codeStr.split('\n'));
  from.ch = from.pos;
  to.ch = to.pos;
  if (!node.update || node.update.type !== "UpdateExpression" && node.update.type !== "AssignmentExpression") {
    const info = {
      message: `'${node.update.codeStr}' does not update the value of the index variable ${initId.length === 1 ? initId[0] : ''}, so the loop might run forever. `,
      severity: "error",
      from,
      to
    };
    moreErrors.push(info);
  } else if (node.update.type === "AssignmentExpression" && node.update.operator === '=') {
    const id = node.update.left.name;
    const right = codeStr.substring(node.update.right.start, node.update.right.end);
    if (right.indexOf(id) < 0) {
      const info = {
        message: `'${node.update.codeStr}' is not updating ${initId.length === 1 ? initId[0] : ''} using its own value. Correct syntax is like '${id} = ${id}+1' or '${id} += 1'. `,
        severity: "error",
        from,
        to
      };
      moreErrors.push(info);
    }
  }

  if (updateStr.indexOf('=') >= 0 && updateStr.indexOf('++') >= 0 || updateStr.indexOf('=') >= 0 && updateStr.indexOf('--') >= 0) {
    let msg = '';
    if (updateStr.indexOf('++') >= 0) msg = `You may update the index variable like 'i += 1' or 'i++', but not 'i = i++'.`;
    else msg = `You may update the index variable like 'i -= 1' or 'i--', but not 'i = i--'.`;
    const info = {
      message: `Please double check the third part of for command. ${msg}`,
      severity: "warning",
      from,
      to
    };
    moreErrors.push(info);
  }

  // check '{'
  if (node.codeStr && node.codeStr.indexOf('{') < 0) {
    const info = {
      message: `You might need to enclose all the statements to loop through with '{' and '}'. Please check if '{' is missing here.`,
      severity: "warning",
      from: { line: to.line, ch: to.ch + 1 },
      to: { line: to.line, ch: to.ch + 2 },
    };
    moreErrors.push(info);
  }

  if (updateStr.indexOf('+') >= 0 && testStr.indexOf('<') < 0 || updateStr.indexOf('-') >= 0 && testStr.indexOf('>') < 0) {
    from = absoluteToRelativePos(node.test.start, codeStr.split('\n'));
    from.ch = from.pos;
    let msg = '';
    let indv = initId[0];
    if (updateStr.indexOf('+') >= 0) 
      msg = `If you increase the index variable '${indv}' in the loop, you need to check if '${indv}' is less than some threshold in the test condition, e.g.g 'for (let j = 0; j < 10; j = j+1)'.`;
    else 
      msg = `If you decrease the index variable '${indv}' in the loop, you need to check if '${indv}' is greater than some threshold in the test condition, e.g. 'for (let i = 10; i > 0; i = i-1)'.`;
    const info = {
      message: `${msg}`,
      severity: "warning",
      from,
      to
    };
    moreErrors.push(info);
  }
};

const getArrNames = (node, userCode) => {
  if (!node || !('declarations' in node)) return;
  const declaras = node.declarations;
  const result = [];
  for (let i = 0; i < declaras.length; i++) {
    if (!declaras[i].init) continue;
    if (declaras[i].init.type === 'ArrayExpression') {
      result.push(declaras[i].id.name);
    } else {
      const expression = userCode.substring(declaras[i].init.start, declaras[i].init.end);
      for (let j = 0; j < funcReturnsArray.length; j++) {
        if (expression.indexOf(funcReturnsArray[j]) >= 0) {
          result.push(declaras[i].id.name);
          break;
        }
      }
    }
  }
  result.forEach((r) => {
    if (!arrayNames.includes(r)) arrayNames.push(r);
  });
};

const getVarNames = (node, userCode) => {
  if (!node || !('declarations' in node)) return;
  const declaras = node.declarations;
  const result = [];
  for (let i = 0; i < declaras.length; i++) {
    if (!declaras[i].init) continue;
    if (declaras[i].init.type === 'ArrayExpression') {
      result.push(declaras[i].id.name);
    } else {
      const expression = userCode.substring(declaras[i].init.start, declaras[i].init.end);
      for (let j = 0; j < funcReturnsArray.length; j++) {
        if (expression.indexOf(funcReturnsArray[j]) >= 0) {
          result.push(declaras[i].id.name);
          break;
        }
      }
    }
  }
  result.forEach((r) => {
    if (!varNames.includes(r)) varNames.push(r);
  });
};

const funcReturnType = {
  getNewCommand: 'string',
  getAimPosition: 'object',
  getRandomNumber: 'float',
  extrapolatePoints: 'object',
  isPathBlocked: 'bool',
  getAngleToSidePocket: 'int',
  getCutAngle: 'int',
  calculateCutAngle: 'int',
  calculateEndState: 'object',
  calculateEndState2: 'object', 
  calculateProbability2: 'float',
  calculateProbability: 'float',
  getSecondsLeft: 'int',
};

// not a very strict check of types
// only works in pool tutorials
// and no scope considered
const getVariableDef = (node, codeStr) => {
  if (!node || !node.type || node.type !== "VariableDeclaration") return;
  const decs = node.declarations;
  decs.forEach((d) => {
    const id = d.id.name;
    let type = '';
    if (!d.init || !d.init.type) type = 'unknown';
    else if (d.init.type === "CallExpression") {
      const funcName = d.init.callee.name;
      if (funcName in funcReturnType) type = funcReturnType[funcName];
      else type = 'object';
    } else if (d.init.type === "Literal") {
      if (d.init.raw === "null") type = 'object';
      else if (!isNaN(d.init.raw)) {
        if (d.init.raw.indexOf('.') < 0) type = 'int';
        else type = 'float';
      } else if (d.init.raw === 'true' || d.init.raw === 'false') type = 'bool';
      else type = 'string';
    } else if (d.init.type === "UnaryExpression") {
      type = 'int';
    } else if (d.init.type === "ArrayExpression") {
      type = 'array';
    } else if (d.init.type === "ObjectExpression") type = 'object';
    else if (d.init.type === "BinaryExpression") {
      const left = d.init.left;
      const right = d.init.right;
      const lit = left.type === "Literal" ? left : (right.type === "Literal" ? right: null);
      if (lit) {
        if (isNaN(lit.raw)) type = 'string';
        else if (lit.raw.indexOf('.') < 0) type = 'int';
        else type = 'float';
      } else if (left.name in variableList) type = variableList[left.name];
      else if (right.name in variableList) type = variableList[right.name];
      else type = 'unknown';
    } else if (d.init.type === "Identifier") {
      if (d.init.name in variableList) type = variableList[d.init.name];
      else type = 'unknown';
    } else if (d.init.type === "MemberExpression") {
      const obj = d.init.object.name ? d.init.object.name : codeStr.substring(d.init.object.start, d.init.object.end);
      if (obj === 'world.CandidateBallList' || obj === 'CandidateBallList') type = 'array of int';
      else if (obj === 'calculateEndState') type = 'array of object';
      else if (obj === 'calculateEndState2') type = 'array of object';
      else if (obj in variableList && variableList[obj].startsWith('array of ')) {
        type = variableList[obj].substring('array of '.length);
      } else if (obj === 'Balls' || obj === 'Pockets') {
        type = 'object';
      } else type = 'unknown';
    } else type = 'unknown';

    variableList[id] = type;
  });
};

export function checkParenthesis(chat, scenario, userCode) {
  let results = [];
  try {
    if (!userCode || userCode.trim === '') return [];

    userCode = cleanUpComment(userCode);
    const userCodeArr = userCode.split('\n');
  
    for (let k=0; k<userCodeArr.length; k++) {
      const line = userCodeArr[k];
      const parts = line.split(/[^A-Za-z0-9]/);
      let lineType = "";
      const start = { line: k, ch: 0 };
      const end = { line: k, ch: line.length-1 };
      if (parts.includes("function")) {
        lineType = "function argument list";
        start.ch = line.indexOf("function") + 8;
      } else if (parts.includes("for")) {
        lineType = "for-loop specifications";
        start.ch = line.indexOf("function") + 3;
      } else if (parts.includes("if")) {
        lineType = "if-statement condition";
        start.ch = line.indexOf("function") + 2;
      } else if (parts.includes("while")) {
        lineType = "while-loop condition";
        start.ch = line.indexOf("function") + 5;
      }
      if (lineType != "") {
        const parts = line.split(" ");
        if (parts.includes("?")) {
          continue;
        }
        if (line.indexOf("(") < 0) {
          results.push({
            message: `Missing '(' for the ${lineType}. `,
            severity: "error",
            from: start,
            to: end
          });
          continue;
        } else if (line.indexOf(")") < 0) {
          // start.ch = line.indexOf("(") + 1;
          // results.push({
          //   message: `Missing ')' to pair with '(' for the ${lineType}. `,
          //   severity: "error",
          //   from: start,
          //   to: end
          // });
          // continue;
        }
      }
    }
    return results;

  } catch (e) {
    console.log(e);
    return results;
  }
}



export function checkFunctionCall(chat, scenario, userCode) {
  let results = [];
  try {
    if (!userCode || userCode.trim === '') return [];

    userCode = cleanUpComment(userCode);
    const userCodeArr = userCode.split('\n');
  
    if (userCode.trim === '') return [];
    let userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });

    
    
    for (let k=0; k<userCodeArr.length; k++) {
      const line = userCodeArr[k];
      const parts = line.split(/[^A-Za-z0-9]/);
      for (let j=0; j<parts.length; j++ ) {
        const func = parts[j];
        const start = { line: k, ch: 0 };
        const end = { line: k, ch: line.length-1 };
        if (functionNames.has(func)) {
          const linetail = line.substring(line.indexOf(func) + func.length).trim();
          if (linetail.indexOf("[") == 0 || linetail.indexOf("{") == 0) {
            start.ch = line.indexOf(func) + func.length;
            end.ch = start.ch + 1;
            results.push({
              message: `You need to call the function '${func}' using a pair of parentheses with an optional list of arguments. `,
              severity: "error",
              from: start,
              to: end
            });
            continue;
          } else if (linetail.indexOf("(") == 0 && linetail.indexOf(")") < 0) {
            // start.ch = line.indexOf("(") + 1;
            // results.push({
            //   message: `Missing ')' to pair with '(' for calling the function ${func}. `,
            //   severity: "error",
            //   from: start,
            //   to: end
            // });
            // continue;
          }
        }
      }
    }

    return results;

  } catch (e) {
    console.log(e);
    return results;
  }
}


export function checkArrayAccess(chat, scenario, userCode) {
  let results = [];
  try {
    if (!userCode || userCode.trim === '') return [];

    userCode = cleanUpComment(userCode);
    const userCodeArr = userCode.split('\n');
  
    if (userCode.trim === '') return [];
    let userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
    
    arrayNames = [
      'Balls', 'Pockets', 'Rails', 'Cushions'
    ];
    traverseAST(userAST, getArrNames, userCode);

    for (let k=0; k<userCodeArr.length; k++) {
      const line = userCodeArr[k];
      const parts = line.split(/[^A-Za-z0-9]/);
      for (let j=0; j<parts.length; j++ ) {
        const arr = parts[j];
        const start = { line: k, ch: 0 };
        const end = { line: k, ch: line.length-1 };
        if (arrayNames.includes(arr)) {
          const linetail = line.substring(line.indexOf(arr) + arr.length).trim();
          if (linetail.indexOf("(") == 0 || linetail.indexOf("{") == 0) {
            start.ch = line.indexOf(arr) + arr.length;
            end.ch = start.ch + 1;
            results.push({
              message: `You need to access the array '${arr}' using '['. `,
              severity: "error",
              from: start,
              to: end
            });
            continue;
          } else if (linetail.indexOf("[") == 0 && linetail.indexOf("]") < 0) {
            start.ch = line.indexOf("[") + 1;
            results.push({
              message: `Missing ']' to pair with '[' for reading the elements of the array ${arr}. `,
              severity: "error",
              from: start,
              to: end
            });
            continue;
          }
        }
      }
    }

    return results;

  } catch (e) {
    console.log(e);
    return results;
  }
}

export function moreErrorCheckAST(chat, scenario, userCode) {
  let results = [];
  try {
    if (!userCode || userCode.trim === '') return [];

    userCode = cleanUpComment(userCode);
    const userCodeArr = userCode.split('\n');
  
    const answerCode = cleanUpComment(getElementCleancode(scenario, chat));
    
    const answerBlocks = getCodeBlocks(answerCode);
    const newMessages = new Set();
    
    if (userCode.trim === '') return [];
    const userBlocks = getCodeBlocks(userCode);
  
    let userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
    
    arrayNames = [
      'Balls', 'Pockets', 'Rails', 'Cushions'
    ];
    traverseAST(userAST, getArrNames, userCode);
    variableList = {};
    traverseAST(userAST, getVariableDef, userCode);
  
  
    let answerAST = acorn.parse_dammit(answerCode, { ecmaVersion: 8, onComment: [] });
  
    // run it once so we can use codeStr in fillInSeparators
    traverseAST(answerAST, addCodeStr, answerCode);
    traverseAST(userAST, addCodeStr, userCode);
  
  
    // make sure every single letter in code string is part of the tree!
    traverseAST(answerAST, fillInSeparators, answerCode);
    traverseAST(userAST, fillInSeparators, userCode);
  
    //const userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
    // run it again to add codestr for separators themselves
    traverseAST(answerAST, addCodeStr, answerCode);
    traverseAST(userAST, addCodeStr, userCode);
  
    traverseAST(answerAST, fillInSeparators, answerCode);
    traverseAST(userAST, fillInSeparators, userCode);
  
  
    answerNodeList = [];
    traverseAST(answerAST, addNodeToAnswerList, answerCode);
    userNodeList = [];
    traverseAST(userAST, addNodeToUserList, userCode);
  
    userAST.navipath = "root";
    addPathToAST(userAST);
    answerAST.navipath = "root";
    addPathToAST(answerAST);

    
    // check for loops
    // for (let k=0; k<userNodeList; k++) {
    //   const n = userNodeList[k];
    //   if (n.type == "ForStatement") {
    //     // debugger;
    //     if (!n.update) {
          
    //     }
    //   }
    // }




  } catch (e) {
    console.log(e);
    return results;
  }
}

export function moreErrorChecks(chat, scenario, userCode) {
  let results = [];
  try {
    userCode = cleanUpComment(userCode);
    const astucode = userCode;
    const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 8, onComment: [] });
    traverseAST(userAST, addCodeStr, astucode);
    arrayNames = [
      'Balls', 'Pockets', 'Rails', 'Cushions'
    ];
    traverseAST(userAST, getArrNames, astucode);
    variableList = {};
    traverseAST(userAST, getVariableDef, astucode);

    const answerCode = cleanUpComment(getElementCleancode(scenario, chat));
    if (userCode.indexOf('ResetTable') >= 0 && answerCode.indexOf('ResetTable') < 0 ||
    userCode.indexOf('ResetTable') < 0 && answerCode.indexOf('ResetTable') >= 0 ||
    userCode.indexOf('RemoveAllTanks') >= 0 && answerCode.indexOf('RemoveAllTanks') < 0 ||
    userCode.indexOf('RemoveAllTanks') < 0 && answerCode.indexOf('RemoveAllTanks') >= 0 ||
    userCode.indexOf('RemoveAllSprites') >= 0 && answerCode.indexOf('RemoveAllSprites') < 0 ||
    userCode.indexOf('RemoveAllSprites') < 0 && answerCode.indexOf('RemoveAllSprites') >= 0
    ) {
      // one of them is test code, the other not
      return results;
    }
    const astacode = answerCode;
    const answerAST = acorn.parse_dammit(astacode, { ecmaVersion: 8, onComment: [] });
    traverseAST(answerAST, addCodeStr, astacode);
    const answerBlocks = getCodeBlocksFromAST(answerAST, astacode.split('\n'));
    const userBlocks = getCodeBlocksFromAST(userAST, astucode.split('\n'));
    const fnames = new Set(functionNames);
    Object.keys(userBlocks).forEach((key) => {
      fnames.add(key);
    });

    const lineErrors = checkEachLine(userCode, userAST, fnames);
    results = results.concat(lineErrors);

    moreErrors = [];
    traverseAST(userAST, checkForLoop, astucode);
    traverseAST(userAST, checkExtraParen, astucode);
    results = results.concat(moreErrors);
    moreErrors = [];

    const beginning = { line: 0, ch: 0 };
    // Check if all needed functions are defined.
    Object.keys(answerBlocks).forEach((key) => {
      if (key === '') return;
      let answercode1 = answerBlocks[key][0].code;
      answercode1 = replaceAll(answercode1, " ", "")
      if (answercode1.includes("function?{")) return;
      if (!(key in userBlocks)) {
        results.push({
          message: `Function ${key} is not defined. `,
          severity: "error",
          from: beginning,
          to: beginning
        });
        return;
      }

      if (userBlocks[key].length > 1) {
        const info = {
          message: `Function '${key}' is defined more than once at line ${userBlocks[key][0].line + 1}`,
          severity: "error",
          from: { line: userBlocks[key][1].line, ch: userBlocks[key][1].code.indexOf(key) },
          to: { line: userBlocks[key][1].line, ch: userBlocks[key][1].code.indexOf(key) + key.length }
        };
        for (let i = 1; i < userBlocks[key].length; i++) info.message += `, ${userBlocks[key][i].line + 1}`;
        info.message += '.';
        results.push(info);
      }
    });
    const moreErrs = checkWithPreDefined(userCode);
    return results.concat(moreErrs);
  } catch (e) {
    console.log(e);
    return results;
  }
}


// count of "{" - count of "}"
const leftBR = new RegExp("{", "g");
const rightBR = new RegExp("}", "g");
const getNetBracket = (s) => {
  return (s.match(leftBR) || []).length - (s.match(rightBR) || []).length;
};

//const emptyFuncR = /function\s*\S*\(\S*\)\s*{\s*}/;
const emptyFuncR = /{\s*}/;
const findEmptyBracketBlocks = (userCode) => {
  const results = [];
  let uc = userCode;
  const emptyBlocks = uc.match(emptyFuncR) || [];
  while (emptyBlocks.length > 0) {
    const b = emptyBlocks[0];
    results.push({
      message: `This pair of brackets defines an empty block. Is it intentional?`,
      severity: "warning",
      from: findPos(emptyBlocks.index, uc),
      to: findPos(emptyBlocks.index+ b.length, uc),
    });
    uc = uc.substring(emptyBlocks.index + b.length);
  }
  return results;
}

const findFirstUnclosedFunction = (userCode) => {
  const lines = userCode.split("\n");
  let inComment = false;
  let inFunction = false;
  let inFunctionName = '';
  let outStandingLeftB = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    if (line.indexOf('//') === 0) continue;
    if (inComment) {
      if (line.indexOf("*/") >= 0) {
        inComment = false;
      }
      continue;
    } else {
      if (line.indexOf("/*") == 0) {
        inComment = true;
        continue;
      }
    }

    const lineIsFunc = line.indexOf('function') >= 0 && line.indexOf("(") > 0 && line.indexOf(")") > line.indexOf("(");
    
    if (inFunction) {

      if (lineIsFunc) {
        // problem! a new function inside the current function!
        return [{
          message: `The function '${inFunctionName}' is missing a closing bracket '}'. Consider adding it at or above line ${i}.`,
          severity: "error",
          from: { line: i-1, ch: lines[i-1].length-1 },
          to: { line: i - 1, ch: lines[i-1].length }
        }];
      }

      outStandingLeftB += getNetBracket(line);

      if (line.indexOf('}') === 0 && outStandingLeftB == 0) {
        inFunction = false;
        inFunctionName = '';
        outStandingLeftB = 0;
      }
    } else { 
      outStandingLeftB += getNetBracket(line);
      if (line.indexOf('}') === 0 && outStandingLeftB < 0) {
        return [{
          message: `Unmatched "}" detected.`,
          severity: "error",
          from: { line: i, ch: lines[i].indexOf("}") },
          to: { line: i, ch: lines[i].indexOf("}")+1 }
        }];
      }
      if (lineIsFunc) {
        inFunction = true;
        inFunctionName = line.substring(line.indexOf('function') + 9);
        inFunctionName = inFunctionName.substring(0, inFunctionName.indexOf("("));
        outStandingLeftB = getNetBracket(line);
      }
    }
  }

  if (inFunction) {
    // did not find any new function definition, so simply return the first non empty line
    for (let k=lines.length-1; k >= 1; k--) {
      const line = lines[k].trim();
      if (line != "") {
        return [{
          message: `The function '${inFunctionName}' is missing a closing bracket '}'. Consider adding it at or above line ${k+1+1}.`,
        }];
      }
    }
  }
  

  return [];
};

const cleanUpComment = (userCode, removeIndent) => {
  const lines = userCode.split("\n");
  const outlines = [];
  let inComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inComment) {
      let stop = line.length;
      if (line.indexOf("*/") >= 0) {
        inComment = false;
        stop = line.indexOf("*/") + 2;
      } 
      let newline = ""; 
      for (let k=0; k<stop; k++) {
        newline += " ";
      }
      newline += line.substring(stop);
      outlines.push(newline);
      continue;
    } else {
      if (line.indexOf("/*") >= 0) {
        inComment = true;
        let start = line.indexOf("/*");
        let stop = line.length;
        if (line.indexOf("*/") >= 0) {
          inComment = false;
          stop = line.indexOf("*/")+2;
        } 
        let newline = line.substring(0, start); 
        for (let k=start; k<stop; k++) {
          newline += " ";
        }
        newline += line.substring(stop);
        outlines.push(newline);
        continue;
      }
      if (line.indexOf('//') >= 0) {
        let start = line.indexOf("//");
        let newline = line.substring(0, start); 
        for (let k=start+1; k<=line.length-1; k++) {
          newline += " ";
        }
        outlines.push(newline);
      } else {
        outlines.push(line);
      }
    }
  }
  if (removeIndent) {
    for (let k=0; k<outlines.length; k++) {
      outlines[k] = outlines[k].trim();
    }
  }
  return outlines.join("\n");
};

const hasInvalidBrackets = (code) => {
  // const m1 = code.match(/\{\s*\{/);
  // if (m1) return true;
  if (code.match(/\{\s*\{/)) return true;
  if (code.match(/\{\s*\}/)) return true;


  const bpairs2 = [];
  const unmatched = pairBrackets(code, bpairs2);
  if (unmatched.length > 0) return true;

  return false;
};


const hasInvalidReturn = (nodeList) => {
  // return statement must have function declaration as parent
  for (let k=0; k<nodeList.length; k++) {
    const n = nodeList[k];
    if (n.type == "ReturnStatement") {
      let p = n.parent;
      if (!p) return true;
      while (p.type != "Program") {
        if (p.type == "FunctionDeclaration") break;
        p = p.parent;
      }
      if (p.type == "Program") {
        return true;
      }
    } else if (n.type == "BlockStatement") {
      let p = n.parent;
      if (!p) return true;
      if (p.type == "BlockStatement") return true; // nested!
    }
  }

  // key functions like getCallShot has to have a return statement at the end
  const funcList = ['getCallShot', 'getBreakShot', 'getCueBallPlacement'];
  for (let k=0; k<nodeList.length; k++) {
    const n = nodeList[k];
    if (n.type == "FunctionDeclaration") {
      let found = false;
      for (let j=0; j<funcList.length; j++) {
        if (n.codeStr.indexOf(funcList[j]) >= 0) {
          found = true;
        }
      }
      if (!found) continue; // not the key function that we know for sure will return at the end
      let nodes = n.body.body;
      if (!nodes) return true;
      let lastNode = nodes[nodes.length-1];
      if (lastNode.type != "ReturnStatement") return true;
    }
  }
  return false;
};



const pairBrackets = (code, pairs) => {
  const brackets = [];
  for (let i=0; i < code.length; i++ ) {
    if (code[i] == "{") {
      brackets.push({
        c: "{", ind: i
      });
    } else {
      if (code[i] == "}") {
        if (brackets.length == 0) {
          // extra closing bracket!
          return [{
            c: "}", ind: i
          }];
        } else {
          const matched = brackets.pop();
          pairs.push({
            left: matched, right: {
              c: "}", ind: i
            }
          })
        }
      }
    }
  }
  return brackets;
};


export function checkMisspellErrors(chat, scenario, userCode) {
  let results = [];
  try {
    const cleanUserCode = replaceAll(cleanUpComment(userCode), "\n", " ");
    const words = cleanUserCode.split(/[^A-Za-z0-9]/);
    //const words = cleanUserCode.split(" ");
    let ind = 0;
    //const keywords = Array.from(keyWordsAll); //['const', 'function', 'let', 'for', 'if', 'while', 'else', 'async', 'await', 'return', 'var', 'this'];
    const keywords = ['const', 'function', 'let', 'for', 'if', 'while', 'else', 'async', 'await', 'return', 'var', 'this'];
    for (let k=0; k<words.length; k++) {
      const w = words[k];
      for (let j=0; j<keywords.length; j++) {
        if (w.trim() == keywords[j].trim()) {
          break;
        }
        let foundWord = '';
        if (w.toLowerCase() == keywords[j] ) {
          foundWord = keywords[j];
        } else if (getEditDistance(w, keywords[j]).length <= Math.max(1, keywords[j].length / 4)) {
          foundWord = keywords[j];
        }
        if (foundWord != "") {
          const pos = indToPos(ind, cleanUpComment(userCode));
          return [{
              message: `Did you mean to write '${foundWord}' as opposed to '${w}'?`,
              severity: "error",
              from: pos,
              to: { line: pos.line, ch: pos.ch+1 }
          }];
        } 
      }
      ind += w.length + 1;
    }

  } catch (e) {
    console.log(e);
  }
  return results;
}  



/*
 make sure if a function has await in it, then this function needs to be marked as async
*/
export function checkMissingAsync(userCode) {
  let results = [];
  try {
    // const origUserCode = userCode;
    userCode = cleanUpComment(userCode, false);
    
    if (userCode.trim === '') return [];
    const userBlocks = getCodeBlocks(userCode);
    const fnames = Object.keys(userBlocks);
    for (let z = 0; z < fnames.length; z++) {
      if (fnames[z].trim() == "") continue;
      const b = userBlocks[fnames[z]][0];
      if (b.code.indexOf('await ') >= 0 && b.code.trim().indexOf('async') != 0) {
        results.push({
          message: `You need to add the keyword 'async' before 'function' here since this function contains 'await' calls.`,
          severity: "error",
          from: { line: b.line, ch: 0 },
          to: { line: b.line, ch: 1 }
        });                

      }
    }
  }  catch (e) {
    console.log(e);
  }
  return results;
}



/*
for robot code, check if functions are all well defined with correct open and close brackets
*/
export function checkBracketErrors(chat, scenario, userCode) {
  let results = [];
  try {
    // const origUserCode = userCode;
    userCode = cleanUpComment(userCode, false);

    // //userCode = beautify(userCode, { indent_size: 2, jslint_happy: true });
    let cleanUserCode = userCode;
    // const userCodeArr = userCode.split('\n');
  
    // let answerCode = cleanUpComment(getElementCleancode(scenario, chat), false);

    // answerCode = beautify(answerCode, { indent_size: 2, jslint_happy: true });
    
    // const answerBlocks = getCodeBlocks(answerCode);
    // const newMessages = new Set();
    
    // if (userCode.trim === '') return [];
    // const userBlocks = getCodeBlocks(userCode);
  
    // let userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
    
    // arrayNames = [
    //   'Balls', 'Pockets', 'Rails', 'Cushions'
    // ];
    // traverseAST(userAST, getArrNames, userCode);
    // variableList = {};
    // traverseAST(userAST, getVariableDef, userCode);
  
  
    // let answerAST = acorn.parse_dammit(answerCode, { ecmaVersion: 8, onComment: [] });
  
    // // run it once so we can use codeStr in fillInSeparators
    // traverseAST(answerAST, addCodeStr, answerCode);
    // traverseAST(userAST, addCodeStr, userCode);
  
  
    // // make sure every single letter in code string is part of the tree!
    // traverseAST(answerAST, fillInSeparators, answerCode);
    // traverseAST(userAST, fillInSeparators, userCode);
  
    // //const userAST = acorn.parse_dammit(userCode, { ecmaVersion: 8, onComment: [] });
    // // run it again to add codestr for separators themselves
    // traverseAST(answerAST, addCodeStr, answerCode);
    // traverseAST(userAST, addCodeStr, userCode);
  
    // traverseAST(answerAST, fillInSeparators, answerCode);
    // traverseAST(userAST, fillInSeparators, userCode);
  
  
    // answerNodeList = [];
    // traverseAST(answerAST, addNodeToAnswerList, answerCode);
    // userNodeList = [];
    // traverseAST(userAST, addNodeToUserList, userCode);
  
    // userAST.navipath = "root";
    // addPathToAST(userAST);
    // answerAST.navipath = "root";
    // addPathToAST(answerAST);    

    // console.log("clean user code: \n" + cleanUserCode);
    const bpairs = [];
    const unmatched = pairBrackets(userCode, bpairs);
    const results = [];

    

    if (unmatched.length > 0) {
      const u = unmatched[0];
      const pos = indToPos(u.ind, userCode);
      const cleanLines = userCode.split("\n");
      const errorline = cleanLines[pos.line];
      if (u.c == "{") {

        // unmatched "{"

        // first check if we can add a "}" somewhere below
        let maxTAdding = -1;
        let maxTRemoving = -1;
        let maxScoreAdding = -1;
        let maxScoreRemoving = -1;
        let totalcountsave = 0;
    if ( false ) {        
        for (let t=pos.line+1; t<=cleanLines.length-1; t++) {
          // try to add '}' here
          const oldline = cleanLines[t];
          cleanLines[t] = cleanLines[t] + " }";
          let newUserCode = cleanLines.join("\n");
          if (hasInvalidBrackets(newUserCode)) {
            cleanLines[t] = oldline;
            continue;
          }
          newUserCode = beautify(newUserCode, { indent_size: 2, jslint_happy: true });
          userAST = acorn.parse_dammit(newUserCode, { ecmaVersion: 8, onComment: [] });
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          userNodeList = [];
          traverseAST(userAST, addNodeToUserList, newUserCode);      
          userAST.navipath = "root";
          addPathToAST(userAST);
          if (hasInvalidReturn(userNodeList)) {
            cleanLines[t] = oldline;
            continue;
          }

          if (t == 22 || t == 24) {
            // debugger;
          }
          let score = 0;
          let totalcount = 0;
          for (let u=0; u<answerNodeList.length; u++) {
            const anode = answerNodeList[u];
            if (!['{', '}'].includes(anode.codeStr.trim())) continue;
            totalcount ++;

            const unode = findNodeByPath(userAST, anode.navipath);  
            if (unode && anode.type == unode.type) {
              score ++;
            } else {
              // console.log("adding: can't find match for acode " + anode.codeStr);
            }
          }
          totalcountsave = totalcount;

          if (score > maxScoreAdding) {
            console.log("new max score for { adding t " + t + " score " + score);
            maxScoreAdding = score; maxTAdding = t;
          }

          cleanLines[t] = oldline;
        }        
        

        // try to remove '{' here
        for (let t=pos.line+1; t<=cleanLines.length-1; t++) {
          if (cleanLines[t].trim().indexOf("{") != cleanLines[t].trim().length - 1)       continue;
          const oldline = cleanLines[t];
          cleanLines[t] = oldline.substring(0, oldline.indexOf("{"));
          let newUserCode = cleanLines.join("\n");
          if (hasInvalidBrackets(newUserCode)) {
            cleanLines[t] = oldline;
            continue;
          }
          newUserCode = beautify(newUserCode, { indent_size: 2, jslint_happy: true });

          userAST = acorn.parse_dammit(newUserCode, { ecmaVersion: 8, onComment: [] });
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          userNodeList = [];
          traverseAST(userAST, addNodeToUserList, newUserCode);      
          userAST.navipath = "root";
          addPathToAST(userAST);
          if (hasInvalidReturn(userNodeList)) {
            cleanLines[t] = oldline;
            continue;
          }

          let score = 0;
          let totalcount = 0;
          for (let u=0; u<answerNodeList.length; u++) {
            const anode = answerNodeList[u];
            if (!['{', '}'].includes(anode.codeStr.trim())) continue;
            totalcount ++;

            const unode = findNodeByPath(userAST, anode.navipath);
            if (u == 16) {
              debugger;
            }  
            if (unode && anode.type == unode.type) {
              // console.log("adding score removing for " + u + " " + score);
              score ++;
            }
          }
          totalcountsave = totalcount;

          if (score > maxScoreRemoving) {
            // console.log("new max score removing " + score);
            maxScoreRemoving = score; maxTRemoving = t;
          }

          cleanLines[t] = oldline;
        }        

      }

        let msg = `Unmatched '{' found. Is there an extra '{' somewhere above? Or are you missing a '}' somewhere?`;
        if (maxScoreAdding >= maxScoreRemoving && maxScoreAdding >= 0.9 * totalcountsave) {
          msg = `Unmatched '{' found. Are you missing a '}' around end of line ${maxTAdding+1}?`;
        } else if (maxScoreAdding <= maxScoreRemoving && maxScoreRemoving >= 0.9 * totalcountsave) {
          msg = `Unmatched '{' found. Do you have an extra '{' around line ${maxTRemoving+1}?`;
        } else {
          for (let j=pos.line-2; j>=0; j--) {
            const targetLine = cleanLines[j].trim();
            const targetLineNext = cleanLines[j+1].trim();
            if (targetLine.indexOf("for") == 0 || targetLine.indexOf("function") == 0 || targetLine.indexOf("async") == 0 || targetLine.indexOf("if") == 0  ) {
              if (targetLine.indexOf("{") < 0 && targetLineNext.indexOf("{") < 0) {
                msg = `Unmatched '}' found. Is there an extra '}' somewhere above? Or are you missing a '{' (maybe line ${j+1})?`;
                break;
              }
            }
          }
        }
        // right bracket
        results.push({
          message: msg,
          severity: "error",
          from: pos,
          to: { line: pos.line, ch: pos.ch+1 }
        });                



      } else {

        // unmatched '}' at pos.line

        // first check if we can add a "{" somewhere
        let maxTAdding = -1;
        let maxTRemoving = -1;
        let maxScoreAdding = -1;
        let maxScoreRemoving = -1;
        let totalcountsave = 0;

        if (false ){ 
        for (let t=0; t<=pos.line; t++) {
          // try to add '{' here
          const oldline = cleanLines[t];
          cleanLines[t] = cleanLines[t] + " {";
          let newUserCode = cleanLines.join("\n");
          if (hasInvalidBrackets(newUserCode)) {
            cleanLines[t] = oldline;
            continue;
          }
          newUserCode = beautify(newUserCode, { indent_size: 2, jslint_happy: true });
          userAST = acorn.parse_dammit(newUserCode, { ecmaVersion: 8, onComment: [] });
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          userNodeList = [];
          traverseAST(userAST, addNodeToUserList, newUserCode); 
          userAST.navipath = "root";
          addPathToAST(userAST);
          if (hasInvalidReturn(userNodeList)) {
            cleanLines[t] = oldline;
            continue;
          }     

          if (t == 34) {
            // debugger;
          }
          let score = 0;
          let totalcount = 0;
          for (let u=0; u<answerNodeList.length; u++) {
            const anode = answerNodeList[u];
            if (!['{', '}'].includes(anode.codeStr.trim())) continue;
            totalcount ++;

            const unode = findNodeByPath(userAST, anode.navipath);  
            if (unode && anode.type == unode.type) {
              score ++;
            } else {
              // console.log("adding: can't find match for acode " + anode.codeStr);
            }
          }
          totalcountsave = totalcount;

          if (score > maxScoreAdding) {
            console.log("new max score adding " + score);
            maxScoreAdding = score; maxTAdding = t;
          }

          cleanLines[t] = oldline;
        }        
        

        // try to remove '}' here
        for (let t=0; t<=pos.line; t++) {
          if (cleanLines[t].trim().indexOf("}") != 0) continue;
          const oldline = cleanLines[t];
          cleanLines[t] = oldline.substring(oldline.indexOf("}")+1);
          let newUserCode = cleanLines.join("\n");
          if (hasInvalidBrackets(newUserCode)) {
            cleanLines[t] = oldline;
            continue;
          }
          newUserCode = beautify(newUserCode, { indent_size: 2, jslint_happy: true });

          userAST = acorn.parse_dammit(newUserCode, { ecmaVersion: 8, onComment: [] });
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          traverseAST(userAST, addCodeStr, newUserCode);
          traverseAST(userAST, fillInSeparators, newUserCode);
          userNodeList = [];
          traverseAST(userAST, addNodeToUserList, newUserCode);   
          userAST.navipath = "root";
          addPathToAST(userAST);
          if (hasInvalidReturn(userNodeList)) {
            cleanLines[t] = oldline;
            continue;
          }   

          let score = 0;
          let totalcount = 0;
          for (let u=0; u<answerNodeList.length; u++) {
            const anode = answerNodeList[u];
            if (!['{', '}'].includes(anode.codeStr.trim())) continue;
            totalcount ++;

            const unode = findNodeByPath(userAST, anode.navipath);
            if (u == 16) {
              // debugger;
            }  
            if (unode && anode.type == unode.type) {
              // console.log("adding score removing for " + u + " " + score);
              score ++;
            }
          }
          totalcountsave = totalcount;

          if (score > maxScoreRemoving) {
            // console.log("new max score removing " + score);
            maxScoreRemoving = score; maxTRemoving = t;
          }

          cleanLines[t] = oldline;
        }        

      }

        let msg = `Unmatched '}' found. Is there an extra '}' somewhere above? Or are you missing a '{' somewhere?`;
        if (maxScoreAdding >= maxScoreRemoving && maxScoreAdding >= 0.9 * totalcountsave) {
          msg = `Unmatched '}' found. Are you missing a '{' around end of line ${maxTAdding+1}?`;
        } else if (maxScoreAdding <= maxScoreRemoving && maxScoreRemoving >= 0.9 * totalcountsave) {
          msg = `Unmatched '}' found. Do you have an extra '}' around line ${maxTRemoving+1}?`;
        } else {
          for (let j=pos.line-2; j>=0; j--) {
            const targetLine = cleanLines[j].trim();
            const targetLineNext = cleanLines[j+1].trim();
            if (targetLine.indexOf("for") == 0 || targetLine.indexOf("function") == 0 || targetLine.indexOf("async") == 0 || targetLine.indexOf("if") == 0  ) {
              if (targetLine.indexOf("{") < 0 && targetLineNext.indexOf("{") < 0) {
                msg = `Unmatched '}' found. Is there an extra '}' somewhere above? Or are you missing a '{' (maybe line ${j+1})?`;
                break;
              }
            }
          }
        }
        // right bracket
        results.push({
          message: msg,
          severity: "error",
          from: pos,
          to: { line: pos.line, ch: pos.ch+1 }
        });        
      }
      // when we do have unmatched brackets, also give warning on empty blocks
      for (let k=0; k<bpairs.length; k++) {
        const bp = bpairs[k];
        let content = cleanUserCode.substring(bp.left.ind+1, bp.right.ind);
        content = replaceAll(content, "\n", "");
        content = replaceAll(content, " ", "");
        if (content == "") {
          // found empty pair
          // const posLeft = indToPos(bp.left.ind, cleanUserCode);
          const posRight = indToPos(bp.right.ind, cleanUserCode);
          results.push({
            message: `Found a an empty block with no code inside. Maybe you need to move the '}' down to enclose some code or remove it?`,
            severity: "warning",
            from: posRight,
            to: { line: posRight.line, ch: posRight.ch+1 }
          });
        }
      }


    }


    return results;

    // traverseAST(userAST, addCodeStr, astucode);
    // arrayNames = [
    //   'Balls', 'Pockets', 'Rails', 'Cushions'
    // ];
    // traverseAST(userAST, getArrNames, astucode);
    // variableList = {};
    // traverseAST(userAST, getVariableDef, astucode);

    // const answerCode = getElementCleancode(scenario, chat);
    // if (userCode.indexOf('ResetTable') >= 0 && answerCode.indexOf('ResetTable') < 0 ||
    // userCode.indexOf('ResetTable') < 0 && answerCode.indexOf('ResetTable') >= 0 ||
    // userCode.indexOf('RemoveAllTanks') >= 0 && answerCode.indexOf('RemoveAllTanks') < 0 ||
    // userCode.indexOf('RemoveAllTanks') < 0 && answerCode.indexOf('RemoveAllTanks') >= 0
    // ) {
    //   // one of them is test code, the other not
    //   return results;
    // }
    // const astacode = answerCode;
    // const answerAST = acorn.parse_dammit(astacode, { ecmaVersion: 8, onComment: [] });
    // traverseAST(answerAST, addCodeStr, astacode);
    // const answerBlocks = getCodeBlocksFromAST(answerAST, astacode.split('\n'));
    // const userBlocks = getCodeBlocksFromAST(userAST, astucode.split('\n'));
    // const fnames = new Set(functionNames);
    // Object.keys(userBlocks).forEach((key) => {
    //   fnames.add(key);
    // });

    // const lineErrors = checkEachLine(userCode, userAST, fnames);
    // results = results.concat(lineErrors);

    // moreErrors = [];
    // traverseAST(userAST, checkForLoop, astucode);
    // traverseAST(userAST, checkExtraParen, astucode);
    // results = results.concat(moreErrors);
    // moreErrors = [];

    // const beginning = { line: 0, ch: 0 };
    // // Check if all needed functions are defined.
    // Object.keys(answerBlocks).forEach((key) => {
    //   if (key === '') return;
    //   if (!(key in userBlocks)) {
    //     results.push({
    //       message: `Function ${key} is not defined. `,
    //       severity: "error",
    //       from: beginning,
    //       to: beginning
    //     });
    //     return;
    //   }

    //   if (userBlocks[key].length > 1) {
    //     const info = {
    //       message: `Function '${key}' is defined more than once at line ${userBlocks[key][0].line + 1}`,
    //       severity: "error",
    //       from: { line: userBlocks[key][1].line, ch: userBlocks[key][1].code.indexOf(key) },
    //       to: { line: userBlocks[key][1].line, ch: userBlocks[key][1].code.indexOf(key) + key.length }
    //     };
    //     for (let i = 1; i < userBlocks[key].length; i++) info.message += `, ${userBlocks[key][i].line + 1}`;
    //     info.message += '.';
    //     results.push(info);
    //   }
    // });
    // const moreErrs = checkWithPreDefined(userCode);
    // return results.concat(moreErrs);
  } catch (e) {
    console.log(e);
    return results;
  }
}



// const checkForLoopNew = (node, codeStr) => {
//   if (!node || !node.type || node.type !== "ForStatement" || !node.test || !node.update) return;
//   // get loop variables
//   //debugger;
//   const initId = [];
//   if (node.init && node.init.declarations) {
//     node.init.declarations.forEach((d) => { initId.push(d.id.name); });
//   }

//   const testStr = codeStr.substring(node.test.start, node.test.end);
//   const updateStr = codeStr.substring(node.update.start, node.update.end);

// };

/*
check if the 3 parts of for-loop definitions are correct
*/
export function checkForLoopErrors(chat, scenario, userCode) {
  try {

    const cleanUserCode = cleanUpComment(userCode);
    const astucode = cleanUserCode.replace(/async|await/gi, ' ');
    const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 8, onComment: [] })
    traverseAST(userAST, addCodeStr, astucode);

    arrayNames = [
      'Balls', 'Pockets', 'Rails', 'Cushions'
    ];
    traverseAST(userAST, getArrNames, astucode);
    variableList = {};
    traverseAST(userAST, getVariableDef, astucode);

    moreErrors = [];
    traverseAST(userAST, checkForLoop, astucode);
    return moreErrors;
    
  } catch (e) {
    console.log(e);
    return [];
  }
}


export function checkKnownTypeErrors(chat, scenario, userCode) {
  try {

    const cleanUserCode = cleanUpComment(userCode);
    const astucode = cleanUserCode.replace(/async|await/gi, ' ');
    const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 8, onComment: [] })


    traverseAST(userAST, addCodeStr, astucode);

    arrayNames = [
      'Balls', 'Pockets', 'Rails', 'Cushions'
    ];
    traverseAST(userAST, getArrNames, astucode);
    variableList = {};
    traverseAST(userAST, getVariableDef, astucode);

    moreErrors = [];
    traverseAST(userAST, checkPropAssignment, astucode);
    traverseAST(userAST, checkBinaryLogicExpression, astucode);
    traverseAST(userAST, checkBinaryCalcExpression, astucode);

    
    
    return moreErrors;
    
  } catch (e) {
    console.log(e);
    return [];
  }
}

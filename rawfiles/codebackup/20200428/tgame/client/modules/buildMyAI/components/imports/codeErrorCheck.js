/**
 * function scope
 * empty bracket block for for-loop or function or if-else
 */

const acorn = require("acorn");
require("acorn/dist/acorn_loose");

const keyWords = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export',
  'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
  'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
  'enum', 'let'
]);

const keyWords2 = new Set([
  'getNovaRange', 'get4WayRange' ,'get3SplitterRange', 'getSecondsLeft', 'getWeaponRange',
  'Balls', 'BallDiameter', 'TableHeight', 'TableWidth', 'Pockets', 'Rails', 'Cushions', 'CushionWidth', 'PlayerInfo', 'getSecondsLeft',
  'getAimPosition', 'getNewCommand', 'getRandomNumber', 'extrapolatePoints', "CandidateBallList", 'calculateProbability', 'console', 'MyID', 'world', 'isPathBlocked', 'getCutAngle', 'calculateCutAngle', 'getAngleToSidePocket',
  'calculateEndState', 'calculateEndState2', 'calculateProbability2', 'getDistance', 'Victor', 'getFirstBallTouched', 'Boundaries', 'debugger',
]);

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
  'getNovaRange', 'get4WayRange' ,'get3SplitterRange', 'getWeaponRange',
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
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
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
  for (let i = lineNum; i >= 0; i--) {
    const line = lines[i];
    if (line.indexOf('function') >= 0) {
      funcName = getFunctionName(line);
      relativeLineNum = lineNum - i;
      break;
    }
  }
  return { functionName: funcName, lineNum: relativeLineNum };
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
  if (!userCode || userCode.trim() === '') return '';
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

// apply given func to every tree node
function traverseAST(node, func, code) {
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
  else if ('consequent' in node) traverseAST(node.consequent, func, code);
  else if ('declarations' in node) traverseAST(node.consequent, func, code);
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

// generate more accurate or meaningful error messages for lint error
export default function getRichErrorMessages(chat, scenario, errors, userCode) {
  // console.log("getRichErrorMessages");
  const catchedRe = [];
  const origRe = [];
  const updatedRe = [];
  const answerCode = getElementCleancode(scenario, chat);
  const answerBlocks = getCodeBlocks(answerCode);
  const newMessages = new Set();
  const userCodeArr = userCode.split('\n');

  const answerAST = acorn.parse_dammit(answerCode.replace(/async|await/gi, ''), { ecmaVersion: 6, onComment: [] });
  const userAST = acorn.parse_dammit(userCode.replace(/async|await/gi, ''), { ecmaVersion: 6, onComment: [] });
  traverseAST(answerAST, addCodeStr, answerCode.replace(/async|await/gi, ''));
  traverseAST(userAST, addCodeStr, userCode.replace(/async|await/gi, ''));

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
        // allow user debug into the code
        return;
      } else if (origMessage.indexOf('undefined') >= 0 && origMessage.indexOf("'undefined'") < 0 || origMessage.indexOf('not defined') >= 0) {
        // check undefined identifiers
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
          const note = Object.assign({}, error);
          if (highestScore > 0.6) {
            note.message += ` Did you mean to say '${w}'?`;
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

let moreErrors = [];
let arrayNames = [];
const funcReturnsArray = [
  'world.CandidateBallList',
  'calculateEndState', 'calculateEndState2'
];
let variableList = {};

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
    const line = removeStrings(removeComment(userCodeArr[lineNum]));
    const origLine = userCodeArr[lineNum];

    // check missing await
    const keys = Object.keys(asyncFunc);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (line.indexOf(key) >= 0 && line.indexOf('await') < 0 && line.indexOf('function') < 0 && line.indexOf("print") < 0 && line.indexOf("console.log") < 0) {
        const info = {
          message: `Function '${key}' is defined as async mode, please add 'await' when calling it. `,
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
        message: `'&' is used in if conditions, instead of '&&'. `,
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
              severity: "information",
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

const checkForLoop = (node, codeStr) => {
  if (!node || !node.type || node.type !== "ForStatement" || !node.test || !node.update) return;
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

  // check for correct test condition.
  for (let x=0; x<arrayNames.length; x++) {
    if (testStr.indexOf(arrayNames[x]) >= 0 && testStr.indexOf(arrayNames[x] + ".length") < 0) {
      moreErrors.push({
        message: `'${testStr}' is not a valid stopping condition since ${arrayNames[x]} is an array, not a number. Maybe you meant to use '${arrayNames[x]}.length'?`,
        severity: "error",
        from,
        to
      });
      return;
    }
  }
  
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
      severity: "information",
      from,
      to
    };
    moreErrors.push(info);
  }

  // check '{'
  if (node.codeStr && node.codeStr.indexOf('{') < 0) {
    const info = {
      message: `You might need to enclose all the statements to loop through with '{' and '}'. Please check if '{' is missing here.`,
      severity: "information",
      from: { line: to.line, ch: to.ch + 1 },
      to: { line: to.line, ch: to.ch + 2 },
    };
    moreErrors.push(info);
  }

  if (updateStr.indexOf('+') >= 0 && testStr.indexOf('<') < 0 || updateStr.indexOf('-') >= 0 && testStr.indexOf('>') < 0) {
    from = absoluteToRelativePos(node.test.start, codeStr.split('\n'));
    from.ch = from.pos;
    let msg = '';
    if (updateStr.indexOf('+') >= 0) msg = 'If you increase the index variable in the third part, you might need to test if the index variable is less than some threshold in the second part, such as: for (let i = 0; i < 10; i = i + 1).';
    else msg = 'If you decrease the index variable in the third part, you might need to test if the index variable is greater than some threshold in the second part, such as: for (let i = 10; i > 0; i = i - 1).';
    const info = {
      message: `Please double check the second and third part of for command. ${msg}`,
      severity: "information",
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

const funcReturnType = {
  getAimPosition: 'object',
  getNewCommand: 'string',
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

export function moreErrorChecks(chat, scenario, userCode) {
  let results = [];
  try {
    const astucode = userCode.replace(/async|await/gi, '');
    const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 6, onComment: [] });
    traverseAST(userAST, addCodeStr, astucode);
    arrayNames = [
      'Balls', 'Pockets', 'Rails', 'Cushions'
    ];
    traverseAST(userAST, getArrNames, astucode);
    variableList = {};
    traverseAST(userAST, getVariableDef, astucode);

    const answerCode = getElementCleancode(scenario, chat);
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
    const astacode = answerCode.replace(/async|await/gi, '');
    const answerAST = acorn.parse_dammit(astacode, { ecmaVersion: 6, onComment: [] });
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

const findPos = (index, text) => {

};


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

const cleanUpComment = (userCode) => {
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
  return outlines.join("\n");
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

/*
for robot code, check if functions are all well defined with correct open and close brackets
*/
export function checkBracketErrors(chat, scenario, userCode) {
  let results = [];
  try {

    const cleanUserCode = cleanUpComment(userCode);
    // console.log("clean user code: \n" + cleanUserCode);
    const bpairs = [];
    const unmatched = pairBrackets(cleanUserCode, bpairs);
    const results = [];

    

    if (unmatched.length > 0) {
      const u = unmatched[0];
      const pos = indToPos(u.ind, cleanUserCode);
      const errorline = cleanUserCode.split("\n")[pos.line];
      let msg = `Unmatched '{' found. `;
      if (errorline.indexOf("function ") >= 0  ) {
        const res1 = findFirstUnclosedFunction(cleanUserCode);
        msg = res1[0].message;
      }
      if (u.c == "{") {
        results.push({
          message: msg,
          severity: "error",
          from: pos,
          to: { line: pos.line, ch: pos.ch+1 }
        });
      } else {
        // right bracket
        results.push({
          message: `Unmatched '}' found. Is there an extra '}' somewhere above this line?`,
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
            message: `Found a pair of brackets ("{" and "}") with no code in-between them. Is this intentional?`,
            severity: "warning",
            from: posRight,
            to: { line: posRight.line, ch: posRight.ch+1 }
          });
        }
      }
    }


    return results;

    const res1 = findFirstUnclosedFunction(userCode);
    const res2 = findEmptyBracketBlocks(userCode);
    return results.concat(res1).concat(res2);


    const userCodeArr = userCode.split('\n');

    const codeblocks = getCodeBlocks(userCodeArr);


    const astucode = userCode.replace(/async|await/gi, '').trim();
    const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 6, onComment: [] });

    traverseAST(userAST, addCodeStr, userCode.replace(/async|await/gi, ''));
    const userBlocks = getCodeBlocksFromAST(userAST, astucode.split('\n'));


    for (let k=0; k<userAST.body.length; k++) {
      const n = userAST.body[k];
      if (n.type == "FunctionDeclaration") {
        const funcEnd = n.end;
        const children = n.body.body;
        const childrenEnd = children[children.length-1].end;
        if (funcEnd == childrenEnd) {
          // missing closing bracket

          // first check for next child function's start
          for (let j=0; j<children.length; j++) {
            const c = children[j];
            if (c.type == "FunctionDeclaration") {
              // add '}' before this child function
              // const pos = findFunctionStart()
              // const anchor = posToAnchor(pos, userCode);
              return [
                {
                  message: `Function '${n.id.name}' is missing a closing bracket '}'`,
                  severity: "error",
                  from: { line: userBlocks[c.id.name][1].line - 1, ch: 0 },
                  to: { line: userBlocks[c.id.name][1].line - 1, ch: 0 }
                }
              ];
    
            }
          }

          const key = n.id.name;
          const pos = absoluteToRelativePos(n.end, userCodeArr);
          return [
            {
              message: `Function '${key}' is missing a closing bracket '}'`,
              severity: "error",
              from: { line: pos.line, ch: 0 },
              to: { line: pos.line, ch: 0 }
            }
          ];
        }
      }
    }

    return [];

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
    // const astacode = answerCode.replace(/async|await/gi, '');
    // const answerAST = acorn.parse_dammit(astacode, { ecmaVersion: 6, onComment: [] });
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



const checkForLoopNew = (node, codeStr) => {
  if (!node || !node.type || node.type !== "ForStatement" || !node.test || !node.update) return;
  // get loop variables
  //debugger;
  const initId = [];
  if (node.init && node.init.declarations) {
    node.init.declarations.forEach((d) => { initId.push(d.id.name); });
  }

  const testStr = codeStr.substring(node.test.start, node.test.end);
  const updateStr = codeStr.substring(node.update.start, node.update.end);

};

/*
check if the 3 parts of for-loop definitions are correct
*/
export function checkForLoopErrors(chat, scenario, userCode) {
  try {
    const cleanUserCode = cleanUpComment(userCode);
    const astucode = cleanUserCode.replace(/async|await/gi, ' ');
    const userAST = acorn.parse_dammit(astucode, { ecmaVersion: 6, onComment: [] })
    traverseAST(userAST, addCodeStr, astucode);
    moreErrors = [];
    traverseAST(userAST, checkForLoopNew, astucode);
    return moreErrors;
    
  } catch (e) {
    console.log(e);
    return [];
  }
}

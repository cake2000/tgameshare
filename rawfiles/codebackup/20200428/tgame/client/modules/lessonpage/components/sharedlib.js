
export const get_quick_answer = function(question) {
  let answer = "Sorry no answer is available.";
  switch(question) {
    case "emptyobjectdef": {
      answer = `Please write a pair of curly brackets like this: 
_________________________

{ }
_________________________
`;
      break;
    }
    case "objage12": {
      answer = `You can create the object like this: 
_________________________

{
  age: 12
}
_________________________
`;
      break;
    }

    case "objheight23600": {
      answer = `You can create the object like this: 
_________________________

{
  height: 23600
}
_________________________
`;
      break;
    }
    

    case "objagelinda": {
      answer = `Please create an empty object, then add these 2 new properties between the curly brackets: 
____________________________

{
  age: 12, 
  name: "Linda"
}
____________________________

Don't forget the comma between these 2 properties.
`;
      break;
    }
    case "objvarempty": {
      answer = `You can create the variable like this:
____________________________

var student = { }
____________________________
`;
      break;
    }
    case "objvarage": {
      answer = `Please create the variable like this:
____________________________

var student = {
  age: 12
}
____________________________
`;
      break;
    }
    case "objvarheight": {
      answer = `Please create the variable like this:
____________________________

var mountain = {
  height: 23600, 
  name: "Everest"
};
____________________________
`;
      break;
    }

    case "objvartablelegs": {
      answer = `Please create the variable like this:
____________________________

var table = {
  legs: 4
}
____________________________
`;
      break;
    }

    case "objvaragename": {
      answer = `You can add the new property like this: 
____________________________

student.firstName = "Linda";
____________________________
`;
      break;
    }

    case "objvarmountainlongitude": {
      answer = `You can add the new property like this: 
____________________________

mountain.longitude = 86;
____________________________
`;
      break;
    }

    case "objvartablename": {
      answer = `You can add the new property like this: 
____________________________

table.color = "black";
____________________________
`;
      break;
    }

    case "objvarage13": {
      answer = `You can modify the age property like this: 
____________________________

student.age = 13;
____________________________`;
      break;
    }

    case "objvarheight7200": {
      answer = `You can modify the height property like this: 
____________________________

mountain.height = 7200;
____________________________`;
      break;
    }

    case "objvartableleg3": {
      answer = `You can modify the legs property like this: 
____________________________

table.legs = 3;
____________________________`;
      break;
    }
    case "subtractfunc": {
      answer = `You can define the function like this: 

____________________________

function subtract(m,n) {
  return m-n;
}
____________________________
`;
      break;
    }

    case "halffunctest": {
      answer = `You can define the function like this: 

____________________________

function half(m) {
  return m/2;
}
____________________________
`;
      break;
    }

    case "superAddfunc": {
      answer = `You can define the function like this: 

____________________________

function superAdd(i, j, k) {
  return i + j + k;
}
____________________________
`;
      break;
    }

    case "squareFunc": {
      answer = `You can define the function like this: 

____________________________

function square(m) {
  return m * m;
}
____________________________
`;
      break;
    }

    case "doublefunc": {
      answer = `You can define the function like this: 
____________________________

function double(v) {
  return 2*v;
}
____________________________`;
      break;
    }
    case "runsubtractfunc": {
      answer = `You can run the subtract function like this: 
____________________________

var result2 = subtract(10, 8);
____________________________`;
      break;
    }

    case "runhalffunc": {
      answer = `You can run the half function like this: 
____________________________

var resultHalf = half(12);
____________________________`;
      break;
    }

    case "runAvg": {
      answer = `You can run the average function like this: 
____________________________

var resultAvg = average(10, 8);
____________________________`;
      break;
    }

    case "runProduct": {
      answer = `You can run the product function like this: 
____________________________

var result3 = product(7, 6);
____________________________`;
      break;
    }

    case "rundoublefunc": {
      answer = `You can run the double function like this: 
____________________________

var result3 = double(x);
____________________________`;
      break;
    }

    case "runtriplefunchw": {
      answer = `You can run the triple function like this: 
____________________________

var result4 = triple(x);
____________________________`;
      break;
    }

    case "arrayvar1": {
      answer = `You can create the array like this: 
____________________________

var IDs = [6, 8, 9];
____________________________`;
      break;
    }

    case "arrayvar1hwt": {
      answer = `You can create the array like this: 
____________________________

var colors = ["blue", "red", "green"];
____________________________`;
      break;
    }

    case "arrayvarstring1": {
      answer = `You can create the array like this: 
____________________________

var names = ["Jim", "Mike", "Harry"];
____________________________`;
      break;
    }

    case "arrayvar2": {
      answer = `You can change the array like this: 
____________________________

IDs[1] = 12;
____________________________`;
      break;
    }

    case "arrayvar2hwt": {
      answer = `You can change the array like this: 
____________________________

colors[2] = "white";
____________________________`;
      break;
    }

    case "arrayvarstring2": {
      answer = `You can change the array like this: 
____________________________

names[2] = "Scott";
____________________________`;
      break;
    }

    case "arrayvar3": {
      answer = `You can change Linda's age like this: 
____________________________

students[0].age = 14;
____________________________`;
      break;
    }

    case "arrayvar3hwt": {
      answer = `You can change the second student's name like this: 
____________________________

students[1].name = "John";
____________________________`;
      break;
    }

    case "arrayvarchangename": {
      answer = `You can change the second student's name like this: 
____________________________

students[1].name = "John";
____________________________`;
      break;
    }

    case "arraytanks1": {
      answer = `You can define and set the variable like this: 
____________________________

var lastTankHealth = Tanks[Tanks.length - 1].health;
____________________________`;
      break;
    }

    case "printmsgeasy": {
      answer = `You can print the message like this: 
____________________________

print("This is easy!");
____________________________`;
      break;
    }

    case "printx": {
      answer = `You can print the value of x like this: 
____________________________

print(x);
____________________________`;
      break;
    }
    case "printxyhw": {
      answer = `You can print the value of x and y like this: 
____________________________

print("x is " + x + " y is " + y);
____________________________`;
      break;
    }

    case "printrandom": {
      answer = `You can print the message like this: 
____________________________

print("r is " + r);
____________________________`;
      break;
    }

    case "printpointhw": {
      answer = `You can print the message like this: 
____________________________

print("The second point is (" + points[1].x + ", " + points[1].y + ")");
____________________________`;
      break;
    }

    case "printrandom2": {
      answer = `You can print the message like this: 
______________________________________

print("r is " + r + " and s is " + s);
______________________________________
`;
      break;
    }
    case "ticketprice1": {
      answer = `You can set the ticket price like this: 
____________________________

if (age > 18) {
  ticketPrice = 10;
} else {
  ticketPrice = 5;
}           
____________________________`;
      break;
    }

    case "gradetest1": {
      answer = `You can set the grade like this: 
____________________________

if (score >= 90) {
  grade = "A";
} else {
  grade = "B";
}           
____________________________`;
      break;
    }

    case "logicalqe1": {
      answer = `You can set the condition like this: 
____________________________

(m > 0) && (n > 0)
____________________________`;
      break;
    }

    case "logicalqe1test1": {
      answer = `You can set the condition like this: 
____________________________

(m < 0) && (n < 0)
____________________________`;
      break;
    }

    case "logicalqe2": {
      answer = `You can set the condition like this: 
____________________________

(m != "blue") || (n != "blue")
____________________________`;
      break;
    }

    case "gradehwt": {
      answer = `You can set the grade like this: 
____________________________

if (score >= 90) {
  grade = "A";
} else {
  grade = "B";
}           
____________________________`;
      break;
    }

    case "testResultqe": {
      answer = `You can set the test result like this: 
____________________________

if (testScore >= 60) {
  testResult = "Pass";
} else {
  testResult = "Fail";
}           
____________________________`;
      break;
    }

    case "setwinner": {
      answer = `You can set winner like this: 
____________________________

if (score2 > score1) {
  winner = "Player2";
}           
____________________________`;
      break;
    }

    case "setwinnerhwt": {
      answer = `You can set winner like this: 
____________________________

if (score2 <= score1) {
  winner = "Player1";
}           
____________________________`;
      break;
    }

    case "7counting1": {
      answer = `Here is the sequence of numbers: 
____________________________

3 5 7 9           
____________________________`;
      break;
    }

    case "7counting1hw": {
      answer = `Here is the sequence of numbers: 
____________________________

5 8 11 14 17
____________________________`;
      break;
    }

    case "7counting1hwt": {
      answer = `Here is the sequence of numbers: 
____________________________

3 23 43
____________________________`;
      break;
    }

    case "7counting2": {
      answer = `Here is the sequence of numbers: 
____________________________

9 8 7 6 5
____________________________`;
      break;
    }

    case "7counting2hw": {
      answer = `Here is the sequence of numbers: 
____________________________

15 11 7
____________________________`;
      break;
    }

    case "7counting2hwt": {
      answer = `Here is the sequence of numbers: 
____________________________

9 0 -9
____________________________`;
      break;
    }


    case "7forloop1": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=4; j<=16; j=j+4) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop1test1": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=28; j>=4; j=j-8) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop1hw": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var x=1; x<=11; x=x+2) {
  print(x);
}
____________________________`;
      break;
    }

    case "7forloop1hwt": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=1; j<=10; j=j+3) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop2": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=9; j>=1; j=j-2) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop2hw": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=9; j>=2; j=j-1) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop2hwt": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=10; j>=-5; j=j-5) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop3": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=16; j>=1; j=j/2) {
  print(j);
}
____________________________`;
      break;
    }

    case "7forloop3hwt": {
      answer = `Here is one way to write the for-loop: 
____________________________

for(var j=2; j<=16; j=j*2) {
  print(j);
}
____________________________`;
      break;
    }

    case "9nestfor1": {
      answer = `Here is one way to write the for-loop: 
____________________________________

for (var x=1; x<=2; x = x + 1) {
  for (var y=1; y<=5; y = y + 2) {
    print("x: " + x + " y: " + y);
  }
}
____________________________________`;
      break;
    }

    case "9nestfor1hw": {
      answer = `Here is one way to write the for-loop: 
____________________________________

for (var x=4; x>=2; x = x - 1) {
  for (var y=1; y<=7; y = y + 3) {
    print("x: " + x + " y: " + y);
  }
}
____________________________________`;
      break;
    }

    case "definelookupicescream": {
      answer = `Here is how to define the lookup table: 
____________________________________

iceCreamPrices["strawberry"] = 1.5;
iceCreamPrices["orange"] = 2;
iceCreamPrices["chocolate"] = 2.5;
____________________________________`;
      break;
    }

    case "buycheapericescream": {
      answer = `Here is an example solution: 
____________________________________

if (iceCreamPrices["orange"] < iceCreamPrices["chocolate"]) {
  iceCreamToBuy = "orange";
} else {
  iceCreamToBuy = "chocolate";
}
____________________________________`;
      break;
    }

    case "9nestfor2": {
      answer = `Here is one way to write the for-loop: 
____________________________________

for (var x=4; x<=10; x = x + 3) {
  for (var y=2; y<=6; y = y + 2) {
    print("y: " + y + " x: " + x);
  }
}
____________________________________`;
      break;
    }

    case "9nestfor2hw": {
      answer = `Here is one way to write the for-loop: 
____________________________________

for (var x=9; x>=5; x = x -2) {
  for (var y=2; y<=6; y = y + 2) {
    print("y: " + y + " x: " + x);
  }
}
____________________________________`;
      break;
    }


    case "13break1": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (k >= 4) {
  break;
}
____________________________`;
      break;
    }


    case "13break2": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (j >= 2) {
  continue;
}
____________________________`;
      break;
    }

    case "13break2test1": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (j > 0) {
  continue;
}
____________________________`;
      break;
    }

    case "13break2hw": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (j < 4) {
  continue;
}
____________________________`;
      break;
    }

    case "13break2hwt": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (j == 3) {
  continue;
}
____________________________`;
      break;
    }


    case "13break3": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (j >= 0) {
  break;
}
____________________________`;
      break;
    }

    case "13break3hw": {
      answer = `Here is one way to change the for-loop: 
____________________________

if (j == 2) {
  break;
}
____________________________`;
      break;
    }

    case "14callcalccutangle": {
      answer = `Here is the correct way to calculate the cut angle: 
____________________________

const angle1 = calculateCutAngle(10, 5);
____________________________`;
      break;
    }

    case "14callcalccutanglehw": {
      answer = `Here is the correct way to calculate the cut angle: 
____________________________

const angle4 = calculateCutAngle(M, 4);
____________________________`;
      break;
    }

    case "14callcalcskewangle": {
      answer = `Here is the correct way to calculate the skew angle: 
____________________________

const angle2 = calculateSidePocketSkew(10, 4);
____________________________`;
      break;
    }

    case "14callcalcskewanglehw": {
      answer = `Here is the correct way to calculate the skew angle: 
____________________________

const angleTop = calculateSidePocketSkew(12, 1);
____________________________`;
      break;
    }

    case "15mirror1": {
      answer = `The y coordinate of the point N is 2*12-10, which is: 
____________________________

14
____________________________`;
      break;
    }

    case "15mirror2": {
      answer = `The y coordinate of the point N is 2*15-20, which is: 
____________________________

10
____________________________`;
      break;
    }

    case "15mirror3": {
      answer = `The x coordinate of the point N is 2*30-20, which is: 
____________________________

40
____________________________`;
      break;
    }

    case "array2dvar1": {
      answer = `You can create the array like this: 
____________________________

var nums = [ [4, 9, 3], [11, 0, -2] ];
____________________________`;
      break;
    }

    case "array2dvar1hwt": {
      answer = `You can create the array like this: 
____________________________

var nums = [ [4, 9], [11, 0], [5, 3] ];
____________________________`;
      break;
    }

    case "array2dvar2": {
      answer = `You can change the array item like this: 
____________________________

Array2D[1][2] = -5;
____________________________`;
      break;
    }

    case "array2dvar2": {
      answer = `You can change the array item like this: 
____________________________

Array2D[0][2] = -2;
____________________________`;
      break;
    }

    case "array2dvar2hwt": {
      answer = `You can change the array item like this: 
____________________________

Array2D[0][2] = 4;
____________________________`;
      break;
    }

    case "array2dvar3": {
      answer = `You can get the sum of the array like this: 
____________________________

for (var i = 0; i < nums.length; i += 1) {
  sum += nums[i];
}
____________________________`;
      break;
    }

    case "array2dvar4": {
      answer = `You can get the sum of the array like this: 
____________________________

for (var i = 0; i < nums.length; i += 1) {
  for (var j = 0; j < nums[i].length; j += 1) {
    sum += nums[i][j];
  }
}
____________________________`;
      break;
    }

    case "array2dvar4hwt": {
      answer = `You can get the total score like this: 
____________________________

for (var i = 0; i < scores.length; i += 1) {
  for (var j = 0; j < scores[i].length; j += 1) {
    total += scores[i][j];
  }
}
____________________________`;
      break;
    }

    case "array2dvar5": {
      answer = `The printouts are like this: 
____________________________

M[0][0] is 12 
M[0][1] is 3 
M[0][2] is -1 
M[1][0] is 2 
M[1][1] is 5 
M[1][2] is 4 
____________________________`;
      break;
    }

    case "array2dvar6": {
      answer = `You can generate the multiplication table like this: 
____________________________

for (var i = 1; i <= 9; i += 1) {
  var row = [];
  for (var j = 1; j <= i; j += 1) {
    row.push(i * j);
  }
  table.push(row);
}
____________________________`;
      break;
    }

    case "placeballqe": {
      answer = `You can setup this test scenario like this: 
____________________________

ResetTable(true);
PlaceBallOnTable(0, 50, -300);
PlaceBallOnTable(1, 300, 250);
PlaceBallOnTable(4, -100, 200);
____________________________`;
    break;
    }
    
    case "pathvar1": {
      answer = `The string representation of this path should be this: 
____________________________

"U R R U R U R R R"
____________________________`;
      break;
    }

    case "pathvar1test1": {
      answer = `The string representation of this path should be this: 
____________________________

"U U R U R R U U"
____________________________`;
      break;
    }

    case "pathvar1hwt": {
      answer = `The string representation of this path should be this: 
____________________________

"U R R R R U U R R"
____________________________`;
      break;
    }

    case "astar1": {
      answer = `Any of the following strings is correct: 
____________________________

"U R R R R R U U"
"U R R R R U R U"
"U R R R R U U R"
"R R R R R U U U"
"R R R R U R U U"
"R R R R U U R U"
"R R R R U U U R"
____________________________`;
      break;
    }

    case "astar2": {
      answer = `Any of the following strings is correct: 
____________________________

"U R R R R R R D"
"U R R R D R R R"
"U R R R R D R R"
"U R R R R R D R"
____________________________`;
      break;
    }

    case "astar2hwt": {
      answer = `This is the correct sequence of directions: 
____________________________

"U R R D D D D L L U"
____________________________`;
      break;
    }

    case "astar3": {
      answer = `The creation of the graph array should be this: 
____________________________

var graph = [
  [0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 1]
];
____________________________`;
      break;
    }

    case "astar3hwt": {
      answer = `The creation of the graph array should be this: 
____________________________

var graph = [
  [0, 0, 0, 0],
  [0, 1, 1, 1],
  [0, 1, 1, 0],
  [0, 1, 1, 0]
];
____________________________`;
      break;
    }

    case "astar4": {
      answer = `Any of the following strings is correct: 
____________________________

"R D R R U R U"
"R D R R U U R"
"D R R R R U U"
"D R R R U R U"
"D R R R U U R"
____________________________`;
      break;
    }

    case "astar5": {
      answer = `Any of the following strings is correct: 
____________________________

"L U U U R R R R R D D"
"U L U U R R R R R D D"
____________________________`;
      break;
    }

    case "forbest1": {
      answer = `You can write a for-loop like this: 
____________________________

for (var i = 0; i < nums.length; i += 1) {
  if (nums[i] < smallest || i == 0) smallest = nums[i];
}
____________________________`;
      break;
    }

    case "quickmandist": {
      answer = `Here is the calculation: 
____________________________

var distance = Math.abs(p1.r-p2.r) + Math.abs(p1.c-p2.c);
____________________________`;
      break;
    }

    case "quickmandisthwt": {
      answer = `Here is the calculation: 
____________________________

var blocks = Math.abs(home.street-school.street) + Math.abs(home.avenue-school.avenue);
____________________________`;
      break;
    }

    case "searchforbest": {
      answer = `You can write a for-loop like this: 
____________________________

for (var i = 0; i < names.length; i += 1) {
  if (names[i].length > longest.length) longest = names[i];
}
____________________________`;
      break;
    }

    case "includesvsfind": {
      answer = `You can write the code like this: 
____________________________

var finded = students.find(s => s.id == s1.id && s.name == s1.name);
var result = (finded != undefined);
____________________________`;
      break;
    }

    case "forofexe": {
      answer = `You can write the for-loop like this: 
____________________________

var sum = 0;
for (var num of array1) {
  sum += num;
}
____________________________`;
      break;
    }

    case "searchforbesthwt": {
      answer = `You can write a for-loop like this: 
____________________________

for (var i = 0; i < names.length; i += 1) {
  if (names[i].length < shortest.length) shortest = names[i];
}
____________________________`;
      break;
    }

    case "searchforbesthwt2": {
      answer = `You can write a for-loop like this: 
____________________________

for (var i = 0; i < students.length; i += 1) {
  if (students[i].age < youngest.age) {
    youngest.name = students[i].name;
    youngest.age = students[i].age;
  }
}
____________________________`;
      break;
    }

    case "quickdecision": {
      answer = `You can write the if-else statements like this: 
____________________________

if (r > 3) a = 10;
else if (r < 1) a = 5;
else if (r < 2) a= 7;
else a = 6;
____________________________`;
      break;
    }

    case "damageexe1": {
      answer = `You can calculate the damage rate like this: 
____________________________

var damage = 1800 * (1 + MyTank.specialPower.damage) / (12 - MyTank.specialPower.reload);
____________________________`;
      break;
    }

    case "damageexe2": {
      answer = `You can calculate the real health reduction like this: 
____________________________

var healthRecovery = target.specialPower.healthRegen;
var healthReduction = damage - healthRecovery;
____________________________`;
      break;
    }

    case "arrowfunc1": {
      answer = `You can write an arrow function like this: 
____________________________

var hasID = (student, expectedID) => { return student.ID == expectedID; };
OR
var hasID = (student, expectedID) => student.ID == expectedID;
____________________________`;
      break;
    }

    case "arrowfunc0": {
      answer = `You can write an arrow function like this: 
____________________________

var subtract = (x, y) => { return x - y; };
OR
var subtract = (x, y) => x - y;
____________________________`;
      break;
    }

    case "arrowfuncmultiply": {
      answer = `You can write an arrow function like this: 
____________________________

var multiply = (x, y) => { return x * y; };
OR
var multiply = (x, y) => x * y;
____________________________`;
      break;
    }

    case "getoppo": {
      answer = `You can get the array of opponent tanks like this: 
____________________________

var oppoTanks = Tanks.filter(t => t.color != "white" || t.color != MyTank.color);
____________________________`;
      break;
    }

    case "arraymethod1": {
      answer = `You can add a new student object to students like this: 
____________________________

students.push({ ID: 113, Name: "Larry" });
____________________________`;
      break;
    }

    case "arraymethod2": {
      answer = `You can add the two subarrays to numbers like this: 
____________________________

numbers.push([3, 4, 5], [4, 5, 6]);
OR
numbers.push([3, 4, 5]);
numbers.push([4, 5, 6]);
____________________________`;
      break;
    }

    case "arraymethod2a": {
      answer = `You can add the two subarrays to numbers like this: 
____________________________

numbers.push([1, 2]);
____________________________`;
      break;
    }

    case "arraymethod3": {
      answer = `You can find the student object like this: 
____________________________

var myRoommate = students.find(s => s.ID == 111);
____________________________`;
      break;
    }

    case "arraymethod3hwt": {
      answer = `You can find the student object like this: 
____________________________

var myRoommate = students.find(s => s.age > 11);
____________________________`;
      break;
    }

    case "arraymethod3num": {
      answer = `You can find the number like this: 
____________________________

var x = numbers.find(n => n < 4);
____________________________`;
      break;
    }

    case "arraymethod3numhwt": {
      answer = `You can find the number like this: 
____________________________

var x = numbers.find(n => n >= 8);
____________________________`;
      break;
    }

    case "arraymethod4": {
      answer = `You can slice the numbers array like this: 
____________________________

var numbers2 = numbers.slice(2, 5);
____________________________`;
      break;
    }

    case "arraymethod4hwt": {
      answer = `You can slice the numbers array like this: 
____________________________

var numbers2 = numbers.slice(4, 6);
____________________________`;
      break;
    }

    case "ternary1": {
      answer = `The steps in the path are like this: 
____________________________

var watchTV = isHomeworkDone ? "Sure!" : "No!";
____________________________`;
      break;
    }

    case "lda1arraysquares": {
      answer = `Here is a solution to this quick exercise: 
____________________________

var squares = [1, 2*2, 3*3, 4*4, 5*5, 6*6, 7*7, 8*8, 9*9];
var sum = squares[7] + squares[8];
____________________________`;
      break;
    }

    case "lda1arraymethodreduce": {
      answer = `Here is a solution to this quick exercise: 
____________________________

var sum = flowers.reduce((result, flower) => result + flower.count, 0);
____________________________`;
      break;
    }

    case "lda12adjmatrix": {
      answer = `Here is a solution to this quick exercise: 
____________________________

const graph = [
  [0,3,2,0,0],
  [0,0,0,0,0],
  [0,0,0,0,7],
  [6,0,0,0,0],
  [0,0,4,5,0]
];
____________________________`;
      break;
    }

    case "lda12adjlist": {
      answer = `Here is a solution to this quick exercise: 
____________________________

const graph = {
  0: { 1:3, 2:2 }, 
  1: {}, 
  2: { 4:7 }, 
  3: { 0:6 }, 
  4: { 2:4, 3:5 }
};
____________________________`;
      break;
    }


    default: {
      break;
    }
  }
  return answer;
}


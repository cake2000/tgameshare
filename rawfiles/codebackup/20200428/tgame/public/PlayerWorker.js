var getOppositeRails = function(pocketId) {
    var Cushions = GameInfo.Cushions;
    switch (pocketId) {
        case 0:
            return [Cushions["23"], Cushions["34"]];
        case 1:
            return [Cushions["23"]];
        case 2:
            return [Cushions["01"]];
        case 3:
            return [Cushions["01"],Cushions["50"]];
        case 4:
            return [Cushions["50"]];
        case 5:
            return [Cushions["34"]];
    }
};	

var getMirroredPosition = function(origPos, rail) {
	if ( rail.p1.x == rail.p2.x) {
		return new Vector(rail.p1.x + (rail.p1.x  - origPos.x), 1, origPos.z);
	} else {
		return new Vector(origPos.x, 1, rail.p1.z + (rail.p1.z - origPos.z));
	}
};		 

// create a new function "takeCalledShot" that hits target ball to target pockeet
var specifyBreakShotPlan = function () {
  // return a JSON object as the output of the function
  return {
    // cue ball can only be placed beyond the head string, that is, x >= 36, -34 <= z <= 34
    CueBallPositionX: 36,
    CueBallPositionZ: 0,

    // Imagine an "aim ball" placed at coordinate (x=-36, z=0), and shoot the cue ball towards it
    AimBallPositionX: -36,
    AimBallPositionZ: 0,

    // strength needs to be a number between 1 and 999 for the break shot.
    HitStrength: 1000,

    // instead of hitting the center of the cue ball, you can hit higher or lower so the cue ball will spin
    // forward or backward
    HitPointShiftY: -0.5

  };
};


var dist2 = function (v, w) { return (v.x - w.x)*(v.x - w.x) + (v.z - w.z)*(v.z - w.z); };

var distanceFromPointToLineSegment = function(p,v,w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.z - v.z) * (w.z - v.z)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return Math.sqrt(dist2(p, { x: v.x + t * (w.x - v.x), z: v.z + t * (w.z - v.z) }));
};


// input positions are Vector objects 
// assuming ball speed in balance (i.e. it's hit at y shift of 0.39622205)
var estimateSpeedOnArrival = function(cueballpos, cueballInitSpeed, aimballpos) {
	var distance = aimballpos.subtract(cueballpos).length();
	var A = - 15/7;
	var B = cueballInitSpeed;
	var C = 0 - distance;
	var timeMS = ( 1 / (2*A)) * (0 - B + Math.sqrt(B*B - 4*A*C));
	var Vt = B - 60/14*timeMS;
	console.log("distance " + distance + " A " + A + " B " + B + " C " + C + " time " + timeMS + " Vt " + Vt  );
	return Vt;
};

// new new method for angle prediction
var BetaByAngleD20 = {};
BetaByAngleD20[0] = [0,0,0,0];BetaByAngleD20[1] = [-0.06097988,0.000331065,-7.734639e-006,1.665259e-008];BetaByAngleD20[2] = [-0.1296775,0.0009419698,-1.861045e-005,4.516345e-008];BetaByAngleD20[3] = [-0.2065997,0.001870912,-3.297623e-005,8.734016e-008];BetaByAngleD20[4] = [-0.2911557,0.003171242,-5.169028e-005,1.477995e-007];BetaByAngleD20[5] = [-0.286061,0.001691279,-4.205695e-005,1.191757e-007];BetaByAngleD20[6] = [-0.3414475,0.002318956,-5.414017e-005,1.655505e-007];BetaByAngleD20[7] = [-0.3939295,0.003030499,-6.727922e-005,2.198298e-007];BetaByAngleD20[8] = [-0.4407857,0.003719339,-8.007728e-005,2.763063e-007];BetaByAngleD20[9] = [-0.4764543,0.004120504,-8.892001e-005,3.195866e-007];BetaByAngleD20[10] = [-0.5035804,0.004323364,-9.44074e-005,3.496488e-007];BetaByAngleD20[11] = [-0.5228141,0.004358195,-9.727876e-005,3.702219e-007];BetaByAngleD20[12] = [-0.5336595,0.004172951,-9.658708e-005,3.761231e-007];BetaByAngleD20[13] = [-0.5413456,0.004000164,-9.541217e-005,3.791591e-007];BetaByAngleD20[14] = [-0.5392748,0.00352335,-8.981274e-005,3.63891e-007];BetaByAngleD20[15] = [-0.538398,0.00323083,-8.60597e-005,3.546352e-007];BetaByAngleD20[16] = [-0.5316344,0.002789604,-8.008345e-005,3.359215e-007];BetaByAngleD20[17] = [-0.5230191,0.002363567,-7.386539e-005,3.149628e-007];BetaByAngleD20[18] = [-0.5146319,0.00204068,-6.859164e-005,2.963675e-007];BetaByAngleD20[19] = [-0.5035146,0.001693849,-6.294784e-005,2.760405e-007];BetaByAngleD20[20] = [-0.4940239,0.001486326,-5.874557e-005,2.600646e-007];BetaByAngleD20[21] = [-0.4822886,0.001261797,-5.429189e-005,2.42807e-007];BetaByAngleD20[22] = [-0.470193,0.001077626,-5.016298e-005,2.259659e-007];BetaByAngleD20[23] = [-0.458955,0.0009956225,-4.732857e-005,2.140821e-007];BetaByAngleD20[24] = [-0.4483031,0.0009883768,-4.525911e-005,2.04235e-007];BetaByAngleD20[25] = [-0.4364706,0.0009798282,-4.319624e-005,1.943486e-007];BetaByAngleD20[26] = [-0.4239051,0.0009879608,-4.136019e-005,1.851793e-007];BetaByAngleD20[27] = [-0.4116,0.001032534,-3.983009e-005,1.766416e-007];BetaByAngleD20[28] = [-0.3986973,0.001096618,-3.857943e-005,1.689697e-007];BetaByAngleD20[29] = [-0.385441,0.001171786,-3.753547e-005,1.624178e-007];BetaByAngleD20[30] = [-0.3705266,0.00120681,-3.596419e-005,1.534928e-007];BetaByAngleD20[31] = [-0.3555906,0.001267462,-3.47751e-005,1.462305e-007];BetaByAngleD20[32] = [-0.3398089,0.001304079,-3.320155e-005,1.372194e-007];BetaByAngleD20[33] = [-0.3238227,0.001359053,-3.197949e-005,1.299103e-007];BetaByAngleD20[34] = [-0.3063187,0.00136161,-3.005887e-005,1.196199e-007];BetaByAngleD20[35] = [-0.2863485,0.001274742,-2.712635e-005,1.059336e-007];BetaByAngleD20[36] = [-0.2669313,0.001219855,-2.457576e-005,9.370832e-008];BetaByAngleD20[37] = [-0.2447714,0.001058392,-2.07521e-005,7.672406e-008];BetaByAngleD20[38] = [-0.2218884,0.0008848296,-1.695617e-005,6.044673e-008];BetaByAngleD20[39] = [-0.1993211,0.0007332511,-1.358735e-005,4.63944e-008];BetaByAngleD20[40] = [-0.1749118,0.0005152389,-9.509884e-006,2.996823e-008];BetaByAngleD20[41] = [-0.1491708,0.0002521741,-5.086349e-006,1.286896e-008];BetaByAngleD20[42] = [-0.1258803,0.0001176797,-2.6733e-006,4.694684e-009];BetaByAngleD20[43] = [-0.1042448,7.05541e-005,-1.624731e-006,2.303292e-009];BetaByAngleD20[44] = [-0.08319276,5.147326e-005,-9.531649e-007,8.030846e-010];

var getDirectionAfterHittingBall = function(targetballpos, aimballpos, cueballpos, hitstrength ) {
	var hitspeed = estimateSpeedOnArrival(cueballpos, hitstrength, aimballpos);
	const dirTarget = targetballpos.subtract(aimballpos);
	const dirCueBall = aimballpos.subtract(cueballpos);
	// debugger;
	var ang1 = Math.atan2(dirTarget.z, dirTarget.x);
	var ang2 = Math.atan2(dirCueBall.z, dirCueBall.x);
	if ( ang1 < 0 ) ang1 += Math.PI * 2;
	if ( ang2 < 0 ) ang2 += Math.PI * 2;

	if ( ang1 - ang2 > Math.PI ) {
		ang2 += Math.PI * 2;
	}
	if ( ang1 - ang2 < 0 - Math.PI ) {
		ang1 += Math.PI * 2;
	}

	// incoming direction, as angle between target ball direction and incoming ball direction
	var inang = ang1 - ang2;
	var sign = -1;
	if ( inang < 0) {
		sign = 1;
		inang = 0- inang;
	}

	// round inang to multiple of PI/96
	var angleL = Math.floor(inang / (Math.PI/96));
	var angleH = Math.ceil(inang / (Math.PI/96));
	if ( angleH > 44 ) {
		return ang2;  // no change in angle, so just return cue ball's angle
	}
	var betaL = BetaByAngleD20[angleL];
	var betaH = BetaByAngleD20[angleH];
	var angChgL = betaL[0] + (betaL[1]*hitspeed) + (betaL[2]*hitspeed*hitspeed) + (betaL[3]*hitspeed*hitspeed*hitspeed);
	var angChgH = betaH[0] + (betaH[1]*hitspeed) + (betaH[2]*hitspeed*hitspeed) + (betaH[3]*hitspeed*hitspeed*hitspeed);

	var angChg = ((inang - angleL) / (angleH - angleL)) * (angChgH - angChgL) + angChgL; 

	return ang2 + angChg * sign;

	/*

	var chg = 0;
	if ( indir <= -1.50534648 ) {
		chg = 0;
	} else if ( indir < -0.327249234748936) {
		chg = 0.265902 * indir * indir * indir + 0.927204* indir * indir + 0.168856* indir - 0.997550;
	} else {
		chg = 41.619921 * indir * indir * indir + 34.950724 * indir * indir + 9.907742 * indir;
	}

	//var outang = dir2 + chg * sign;

	var postImpactSpeedPct = 0.252914 * indir * indir * indir + 0.313345* indir * indir - 0.705440* indir + 0.077281;

	return {
		postImpactAngleChange: chg * sign, postImpactSpeedPct: postImpactSpeedPct
	};
	*/        
};

		

// create a new function "calculateShotPlanWithScore" that hits target ball to target pockeet
var calculateShotPlanWithScore = function (AllBallInfo, targetball_id, targetpocket_id) {
  console.log("calculateShotPlanWithScore " + targetball_id+" -> " + targetpocket_id);
	if ( !AllBallInfo[targetball_id] ) {
		//debugger;
	}
  var targetball_position = new Vector(AllBallInfo[targetball_id].x, 1,AllBallInfo[targetball_id].z);
	

  var cueball_position = new Vector(AllBallInfo[0].x, 1,AllBallInfo[0].z);
  var targetpocket_position = new Vector(PocketCenters[targetpocket_id].mouthx, 1, PocketCenters[targetpocket_id].mouthz); 
	//debugger;
  var direction = targetpocket_position.subtract(targetball_position);

  //debugger;
  var offset = direction.unit().multiply(-2); // this is intentionally wrong.

  // add offset to the target ball position to get the imaginary aim ball position
  var aimballposition = targetball_position.add(offset);
  var strength = 110;
	
  var mindist = 1000;
  AllBallInfo.forEach(function(ballInfo) {
	  if ( ballInfo.isOut || ballInfo.isInPocket || ballInfo.ballID == 0 || ballInfo.ballID == targetball_id ) {
		  return;
	  }
	  var ballPos = new Vector(ballInfo.x, 1, ballInfo.z);
	  var dist = distanceFromPointToLineSegment(ballPos, cueball_position, aimballposition);
	  if ( dist < mindist ) {
		  mindist = dist;
	  }
	  var dist2 = distanceFromPointToLineSegment(ballPos, targetball_position, targetpocket_position);
	  if ( dist2 < mindist ) {
		  mindist = dist2;
	  }
  });
 
  // print out variables onto developer console (press F12 to review it) for debugging
  //console.log("target ball ("+targetball_position.x+","+targetball_position.z+")");
  //console.log("target pocket ("+targetpocket_position.x+","+targetpocket_position.z+")");
  //console.log("direction ("+direction.x+","+direction.z+")");
  //console.log("aimballposition ("+aimballposition.x+","+aimballposition.z+")");
  //console.log("offset ("+offset.x+","+offset.sdf+")");
  // copy calculation part from tutorial 4

  var distanceTargetBallToPocket = targetball_position.distanceTo(targetpocket_position);
  var directionToAim = aimballposition.subtract(cueball_position);
  var directionToPocket = targetpocket_position.subtract(targetball_position);
  var angle = directionToPocket.angleTo(directionToAim);
  if ( angle > Math.PI ) {
	  angle = Math.PI * 2 - angle;
  }
  angle = Math.abs(angle);
  //debugger;
  var score = 0 - 60*angle - distanceTargetBallToPocket;
  if ( mindist < 2 ) {
	  score = -10000;
  }
  console.log(targetball_id+" -> " + targetpocket_id + ": " + score);
//	debugger;
	var shiftY = 0;
	if ( angle < 0.1 ) {
		shiftY = 0 - 0.007 * cueball_position.distanceTo(targetball_position);
	}
	//shiftY = -1;
	strength = 100;
	shiftY = 0.4;
	
	if ( targetpocket_id == 1 ) {
		//debugger;
	}
	// now check for possible pocketing of cue ball
	var outAngle = getDirectionAfterHittingBall(targetball_position, aimballposition, cueball_position, 100);
	var PocketList = [0,1,2,3,4,5];
	var mayPocketCueBall = false;
    PocketList.forEach(function (pocket_id) {
		var pocket_position = new Vector(PocketCenters[targetpocket_id].mouthx, 1, PocketCenters[targetpocket_id].mouthz); 
		var dirToPocket = pocket_position.subtract(aimballposition);
		var angToPocket = Math.atan2(dirToPocket.z, dirToPocket.x);
		if (  Math.abs(outAngle - angToPocket)  < Math.PI / 18  ||  Math.abs(Math.abs(outAngle - angToPocket) - (Math.PI * 2))  < Math.PI / 18   ) {
			mayPocketCueBall = true;
		}
	});
	
	if ( mayPocketCueBall ) {
		score = -10000;
	}
	

  // return a JSON object as the output of the function
  return {
    aimballposition: aimballposition, strength: strength, score: score, ballID: targetball_id, pocketID: targetpocket_id,HitPointShiftY: shiftY
  };
};



// create a new function "calculateShotPlanWithScore" that hits target ball to target pockeet
var calculateReboundShotPlanWithScore = function (AllBallInfo, targetball_id, targetpocket_id) {
  console.log("calculateShotPlanWithScore " + targetball_id+" -> " + targetpocket_id);
	if ( !AllBallInfo[targetball_id] ) {
	//	debugger;
	}
  var targetball_position = new Vector(AllBallInfo[targetball_id].x, 1,AllBallInfo[targetball_id].z);
	

  var cueball_position = new Vector(AllBallInfo[0].x, 1,AllBallInfo[0].z);
  var targetpocket_position = new Vector(PocketCenters[targetpocket_id].mouthx, 1, PocketCenters[targetpocket_id].mouthz); 
  var rail = getOppositeRails(targetpocket_id);
  targetpocket_position = getMirroredPosition(targetpocket_position, rail[0]);
	//debugger;
  var direction = targetpocket_position.subtract(targetball_position);

  //debugger;
  var offset = direction.unit().multiply(-2); // this is intentionally wrong.

  // add offset to the target ball position to get the imaginary aim ball position
  var aimballposition = targetball_position.add(offset);
  var strength = 100;
	
  var mindist = 1000;
  AllBallInfo.forEach(function(ballInfo) {
	  if ( ballInfo.isOut || ballInfo.isInPocket || ballInfo.ballID == 0 || ballInfo.ballID == targetball_id ) {
		  return;
	  }
	  var ballPos = new Vector(ballInfo.x, 1, ballInfo.z);
	  var dist = distanceFromPointToLineSegment(ballPos, cueball_position, aimballposition);
	  if ( dist < mindist ) {
		  mindist = dist;
	  }
	  var dist2 = distanceFromPointToLineSegment(ballPos, targetball_position, targetpocket_position);
	  if ( dist2 < mindist ) {
		  mindist = dist2;
	  }
  });
 
  // print out variables onto developer console (press F12 to review it) for debugging
  //console.log("target ball ("+targetball_position.x+","+targetball_position.z+")");
  //console.log("target pocket ("+targetpocket_position.x+","+targetpocket_position.z+")");
  //console.log("direction ("+direction.x+","+direction.z+")");
  //console.log("aimballposition ("+aimballposition.x+","+aimballposition.z+")");
  //console.log("offset ("+offset.x+","+offset.sdf+")");
  // copy calculation part from tutorial 4

  var distanceTargetBallToPocket = targetball_position.distanceTo(targetpocket_position);
  var directionToAim = aimballposition.subtract(cueball_position);
  var directionToPocket = targetpocket_position.subtract(targetball_position);
  var angle = directionToPocket.angleTo(directionToAim);
  if ( angle > Math.PI ) {
	  angle = Math.PI * 2 - angle;
  }
  angle = Math.abs(angle);
  //debugger;
  var score = 0 - 60*angle - distanceTargetBallToPocket;
  if ( mindist < 2 ) {
	  score = -10000;
  }
  console.log(targetball_id+" -> " + targetpocket_id + ": " + score);

  // return a JSON object as the output of the function
  return {
    aimballposition: aimballposition, strength: strength, score: score, ballID: targetball_id, pocketID: targetpocket_id
  };
};




var calculateBestPlan = function(AllBallInfo, targetColor) {
  //debugger;
  var targetBallInfoList = AllBallInfo.filter(function (ballinfo) {
    	return ballinfo.ballGroup == targetColor && !ballinfo.isInPocket ;
  });
  var targetBallIDList = targetBallInfoList.map( (ballinfo)=>(ballinfo.ballID));
  var targetPocketList = [0,1,2,3,4,5];
  var bestPlan = {score: -10000};
  targetBallIDList.forEach(function (ball_id) {
    targetPocketList.forEach(function (pocket_id) {
      var plan = calculateShotPlanWithScore(AllBallInfo, ball_id, pocket_id);
      if ( plan.score > bestPlan.score) {
        bestPlan = plan;
      }
	  plan = calculateReboundShotPlanWithScore(AllBallInfo, ball_id, pocket_id);
      if ( plan.score > bestPlan.score) {
        bestPlan = plan;
      }
    })
  });
  return bestPlan;

};


/* game info storage */

var RatingFloor = -1000000;
var GameInfo = {};
var PocketCenters = [];

GameInfo.initialize = function(data) {
    this.playerID = data.playerID;
    this.InitialBallPositions = data.AllBallInfo;
    PocketCenters = data.PocketCenters;
    this.Cushions = data.Cushions;
    this.ballRadius = data.ballRadius;
    this.TableXWidth = data.TableXWidth;
    this.TableZWidth = data.TableZWidth;
    this.HeadStringX = data.HeadStringX; // if x >= HeadStringX then it's above head string
    this.CueBallID = data.CueBallID;
    this.BlackBallID = data.BlackBallID;
    this.mygroup = null;
	importScripts(data.url + '/lib/vector.js');
    sendCommand(CMD_READY);
};


GameInfo.setMyGroup = function (group) {
    GameInfo.mygroup = group;
};

GameInfo.getMyGroup = function () {
    return GameInfo.mygroup;
};







// player API
function TakeBreakShot() {
	var plan = specifyBreakShotPlan();
    sendCommand(CMD_TAKE_BREAK_SHOT, plan);
};


// player API
function ChooseGroup(AllBallInfo, freeGroups) {
    // if one group has less non-black balls, choose that group; if both have same number of non-black balls, pick
    // the group with the highest ranking plan

	/*
    var groupToChoose = "";
	if ( freeGroups.length == 1) {
		var groupToChoose = freeGroups[0];
	} else {
		var ballCntByGroup = {};
		AllBallInfo.forEach(function(b){
			if ( !b.isOut && !b.isInPocket && b.ballID > 1 ) {
				if ( groupToChoose == "") // assign a default group
					groupToChoose = b.ballGroup;
			}
		});
		
	}
	*/
	

	var groupToChoose = freeGroups[0];
    sendCommand(CMD_CHOSEN_GROUP, {
        'ChosenGroup': groupToChoose
    });
    GameInfo.setMyGroup(groupToChoose);
}




// Player API
/* first get all candidates balls (if I have chosen group, then just balls from that group)*/
function TakeCalledShot(AllBallInfo, freeGroups) {
	
	if ( GameInfo.mygroup == null ) {
		ChooseGroup(AllBallInfo, freeGroups);
	}
	
	var targetColor = GameInfo.mygroup;
	var targetBallInfoList = AllBallInfo.filter(function (ballinfo) {
			return ballinfo.ballGroup == targetColor && !ballinfo.isInPocket ;
	});
	var targetBallIDList = targetBallInfoList.map( (ballinfo)=>(ballinfo.ballID));

	var bestPlan = {
		aimballposition: new Vector(0,1,0), strength: 100, score: -100
	};
	if ( targetBallIDList.length > 0 ) {
		bestPlan = calculateBestPlan(AllBallInfo, GameInfo.mygroup);
	} else {
		// shoot black ball
		bestPlan = calculateBestPlan(AllBallInfo, "black");
	}
	
	sendCommand(CMD_TAKE_CALLED_SHOT, bestPlan);
}


// Player API
function PlaceCueballByHand (AllBallInfo) {
    sendCommand(CMD_PLACE_CUEBALL, {
        'pos': {x: GameInfo.HeadStringX, z: 0}
    });
}










self.addEventListener('message', function(e) {
    console.log("player on message " + JSON.stringify(e.data));
    switch(e.data.cmd) {
        case 'Initialize':
            console.log("PoolPlayerWorker initialize "); // + JSON.stringify(e.data));
            GameInfo.initialize(e.data);
            break;
        case 'InformGroup':
			//debugger;
            console.log("PoolPlayerWorker inform group " + JSON.stringify(e.data));
            GameInfo.setMyGroup(e.data.Group);
            break;
        case 'TakeBreakShot':
            console.log("PoolPlayerWorker break shot " + JSON.stringify(e.data));
            TakeBreakShot(e.data.AllBallInfo);
            break;
        case 'ChooseGroup':
			//debugger;
            console.log("PoolPlayerWorker ChooseGroup " + JSON.stringify(e.data.AllBallInfo));
            ChooseGroup(e.data.AllBallInfo, e.data.freeGroups);
            break;
        case 'TakeCalledShot':
            console.log("PoolPlayerWorker normal shot  " + JSON.stringify(e.data));
            TakeCalledShot(e.data.AllBallInfo, e.data.freeGroups);
            break;
        case 'EvalScriptCodeLive':
            console.log("PoolPlayerWorker received script to eval live " + e.data.scriptCode);
            eval(e.data.scriptCode);
            break;
        case 'PlaceCueballByHand':
            console.log("PoolPlayerWorker place cue ball " + JSON.stringify(e.data));
            PlaceCueballByHand(e.data.AllBallInfo);
            break;
        default:
            console.log("unknown message received in player worker: " + JSON.stringify(e.data));
    }
}, false); // [useCapture = false]


var CMD_READY = -1;
var CMD_TAKE_BREAK_SHOT = 0;
var CMD_TAKE_CALLED_SHOT = 1;
var CMD_CHOSEN_GROUP = 2;
var CMD_PLACE_CUEBALL = 3;

var commandID = 0;
var sendCommand  = function (cmdType, param1, param2, param3) {
    commandID ++;
    console.log("player id " + GameInfo.playerID + " sending command " + cmdType + " " + JSON.stringify(param1));
    switch(cmdType) {
        case CMD_READY:
            self.postMessage({
                'cmdID': GameInfo.playerID+"_" + commandID,
                'cmd': 'READY'
            });
            break;
        case CMD_TAKE_BREAK_SHOT:
            self.postMessage({
                'cmdID': GameInfo.playerID+"_" + commandID,
                'cmd': 'TAKE_BREAK_SHOT',
                'param': param1
            });
            break;
        case CMD_TAKE_CALLED_SHOT:
            self.postMessage({
                'cmdID': GameInfo.playerID+"_" + commandID,
                'cmd': 'TAKE_CALLED_SHOT',
                'param': param1
            });
            break;
        case CMD_CHOSEN_GROUP:
			//debugger;
            self.postMessage({
                'cmdID': GameInfo.playerID+"_" + commandID,
                'cmd': 'CHOSEN_GROUP',
                'param': param1
            });
            break;
        case CMD_PLACE_CUEBALL:
            self.postMessage({
                'cmdID': GameInfo.playerID+"_" + commandID,
                'cmd': 'PLACE_CUEBALL',
                'param': param1
            });
            break;
        default:
            self.postMessage({
                'cmdID': GameInfo.playerID+"_" + commandID,
                'cmd': param1.cmd,
                'param': param1
            });
            console.log("unknown command from fsm but we send anyways " + JSON.stringify(param1));
            break;
    }
};


// Vector library place holder to be overwritten later during initialization
// Vector = function(){};

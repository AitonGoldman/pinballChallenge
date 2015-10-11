
////var router = express.Router();

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var email_phrases = [
    'You must crush your enemies, drive them before you, and hear the lamentation of thier women!',
    "It's go time!",
    "I think that this situation absolutely requires a really futile and stupid gesture be done on somebody's part!",
    "It's 106 miles to Chicago, we got a full tank of gas, half a pack of cigarettes, it's dark... and we're wearing sunglasses.",
    "No time for tea!  Kill those martians!",
    "It's SHOWTIME!"
    
    ]

var auth = function(req, res, next){
    if (!req.isAuthenticated()){
	res.send(401);
    } else {
	next()
    }
}

var checkLoggedIn = function(req){
    var sessionIdToMatch = 'sessionIdGoesHere';
    if(req.cookies.sessionId == sessionIdToMatch){
	return true;
    } else {
	return false;
    }
}


module.exports = function(app,passport,secrets){
    var express = require('express');
    var router = express.Router();
    router.post('/login', function(req,res,next){
	passport.authenticate('local-login', function(err, user, info) {
	    if (err) {
		// if error happens
		return next(err);
	    }
	    
	    if (!user) {
		// if authentication fail, get the error message that we set
		// from previous (info.message) step, assign it into to
		// req.session and redirect to the login page again to display
		req.session.messages = info.message;
		return res.status(401).json({});
	    }
	    
	    // if everything's OK
	    req.logIn(user, function(err) {
		if (err) {
		    req.session.messages = "Error";
		    return next(err);
		}
		
		// set the message
		req.session.messages = "Login successfully";
		//return res.redirect('/');
		user.local.password='';
		user.local.appRole='admin';
		return res.json(user);
	    });	
	})(req, res, next);
    });       
    
    router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
    });

    router.get('/test', function(req, res, next) {
	res.render('test', { title: 'Express' });
    });
    
    var mongoose = require('mongoose');

    var ChallengeBadgeDef = mongoose.model('ChallengeBadgeDef');
    router.get('/testBadgeDefInit', function(req, res, next) {
	var challengebadgedef = new ChallengeBadgeDef({
	    badge_def_eval_string:
	    'return user.matches_played > 0',
	    badge_img_url:
	    'https://cdn3.iconfinder.com/data/icons/beos/BeOS_person.png',
	    mouseover_string:
	    'Welcome to the party pal!<br>This badge is awarded for playing your first match'
	});
	challengebadgedef.save(function(err, user){
	    console.log('inserted badge def')
	    //FIXME : need to return something usefull
	    res.json({})
	})
    });

    var ChallengeBadge = mongoose.model('ChallengeBadge');
    router.get('/testBadge', function(req, res, next) {
	var challengebadgepromise = ChallengeBadge.find();
	challengebadgepromise.then(function(data){
	    res.json(data)
	})
    });

    
    var ChallengeUser = mongoose.model('ChallengeUser');    
    router.get('/challengeUser', auth, function(req, res, next) {
    	ChallengeUser.find(function(err, users){
    	    if(err){ return next(err); }
    	    res.json(users);
    	});
    });
    
    router.get('/challengeUser/:userId', auth, function(req, res, next) {
	//console.log('looking for user')
	var userId = req.params.userId;
	
	ChallengeUser.find({'_id':userId},function(err, users){
	    if(err){ return next(err); }
	    //FIXME : handle bad userid query?
	    res.json(users[0]);
	});
    });
    
    
    router.post('/challengeUser', function(req, res, next) {
	//console.log(req);
	ChallengeUser.findOne({ 'local.username' :  req.body.local.username }, function(err, user) {
	    if (user) {
		res.json({status:false})
	    } else {
		var challengeuser = new ChallengeUser(req.body);
		challengeuser.appRole = 'admin';
		challengeuser.local.password = challengeuser.generateHash(challengeuser.local.password);
		challengeuser.save(function(err, user){
		    if(err){ return next(err); }		    
		    res.json({status:true});
		});
	    }
	})
    });
    
    router.post('/challengeUser/:userId', auth, function(req, res, next) {
	
	var userId = req.params.userId;
	var challengeUser = req.body
	delete challengeUser._id;
	ChallengeUser.update({_id:userId},challengeUser,function(err, user){
    	    if(err){ return next(err); }
	    res.json(user);
	});
    });
    
    
    
    var ChallengeMachine = mongoose.model('ChallengeMachine');
    
    router.get('/challengeMachine', auth, function(req, res, next) {
	
	ChallengeMachine.find(function(err, users){
	    if(err){ return next(err); }
	    
	    res.json(users);
	});
    });
    
/*    router.post('/challengeMachine', auth, function(req, res, next) {
	
	var challengemachine = new ChallengeMachine(req.body);
	
	challengemachine.save(function(err, user){
	    if(err){ return next(err); }
	    
	    res.json(user);
	});
    });*/
    
    var ChallengeMatch = mongoose.model('ChallengeMatch');
    
    router.get('/challengeExMatch/:userId', auth, function(req, res, next) {
	var userId = req.params.userId;
	console.log(userId)
	ChallengeMatch.find({$or: [{'player_two_id':userId},{'player_one_id':userId}]},function(err, users){
	    if(err){ return next(err); }
	    
	    res.json(users);
	});
    });
    
    router.post('/challengeMatch', auth, function(req, res, next) {
	
	var challengematch = new ChallengeMatch(req.body);
	
	challengematch.save(function(err, user){
	    if(err){ return next(err); }
	    
	    res.json(user);
	});
    });

    var ChallengeChallenge = mongoose.model('ChallengeChallenge');

    router.post('/challengeChallenge', auth, function(req, res, next) {
	//console.log("about to create challenge")	
	var challengechallenge = new ChallengeChallenge(req.body);
	//console.log("created challenge")
	challengechallenge.save(function(err, user){
	    if(err){
		//console.log(err)
		return next(err);
	    }	    
	    res.json(user);
	});
    });

    router.put('/challengeChallenge/:challengeId', auth, function(req, res, next) {
	var challenge = req.body
	challenge_id = challenge._id
	delete challenge._id
	ChallengeChallenge.update({_id:challenge_id},challenge, function(err, user){
	    if(err){
		return next(err);
	    }
	    res.json(user);
	})
    })

    router.get('/challengeChallenge', auth, function(req, res, next) {
    	ChallengeChallenge.find(function(err, users){
    	    if(err){ return next(err); }
    	    res.json(users);
    	});
    });
    
    router.get('/challengeChallenge/:userId', auth, function(req, res, next) {
	//console.log('looking for challenges')
	var userId = req.params.userId;
	//console.log(userId)
	ChallengeChallenge.find({$and : [{$or : [{'challenged_id':userId},{'challenger_id':userId}]},{'completed':false}]},function(err, users){
	    if(err){ return next(err); }
	    //FIXME : handle bad userid query?
	    //console.log(users)
	    res.json(users);
	});
    });

    router.get('/challengeChallenge/:userId/:userId2', auth, function(req, res, next) {
	var userId = req.params.userId;
	var userId2 = req.params.userId2;
	//console.log(userId + 'is userid')
	if(userId == "challenger"){
	    ChallengeChallenge.find({'challenger_id':userId2},function(err, users){
		if(err){ return next(err); }
		//FIXME : handle bad userid query?
		//console.log('users '+users)
		res.json(users);
	    });	    
	} else {
	    ChallengeChallenge.find({$or : [{$and : [{'completed':false},{'challenged_id':userId},{'challenger_id':userId2}]},{$and : [{'completed':false},{'challenged_id':userId2},{'challenger_id':userId}]}]},function(err, users){
		if(err){ return next(err); }
		//console.log('okay - found some stuff '+users)
		//FIXME : handle bad userid query?
		res.json(users);
	    });

	}

    });

    router.get('/challengeChallenge/:userId/:userId2/:machineId', auth, function(req, res, next) {
	var userId = req.params.userId;
	var userId2 = req.params.userId2;
	var machineId = req.params.machineId;
	ChallengeChallenge.find({$or : [{$and :
					 [
					     {'challenged_id':userId},
					     {'challenger_id':userId2},
					     {'machine_id':machineId},
					     {'completed':false}
					 ]},
					{$and :
					 [
					     {'challenged_id':userId2},
					     {'challenger_id':userId},
					     {'machine_id':machineId},
					     {'completed':false}
					 ]},
				       ]},function(err, users){
					   if(err){ return next(err); }
					   //console.log('okay - found some stuff '+users)
					   //FIXME : handle bad userid query?
					   res.json(users);
				       });	
    });
    

    router.post('/sendMail',auth,function(req,res,next){
	var nodemailer = require('nodemailer');

	// create reusable transporter object using SMTP transport
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
		user: 'pinballchallenge@gmail.com',
		//FIXME : DO NOT COMMIT THIS - PASS THIS IN
		pass: secrets.google_account_password
	    }
	});

	// NB! No need to recreate the transporter object. You can use
	// the same transporter object for all e-mails

	// setup e-mail data with unicode symbols
	var machine_string = req.body.machine
	if(machine_string !== undefined){
	    machine_string = " on "+machine_string
	} else {
	    machine_string = ""
	}
	var email_random_phrase = email_phrases[Math.floor(getRandomArbitrary(0,email_phrases.length))]
	var mailOptions = {
	    from: 'Pinball Challenge <pinballchallenge@gmail.com>', // sender address
	    to: req.body.to_email, // list of receivers
	    subject: 'You have been challenged by '+req.body.challenger+'!', // Subject line
	    text: 'You have been challenged to a game '+machine_string+' by '+req.body.challenger+'.  '+email_random_phrase // plaintext body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
		console.log(error);
	    }else{
		console.log('Message sent: ' + info.response);
		res.json(info)
	    }
	})
	
    })
    
    router.get('/challengeChallenge/challenger/:userId', auth, function(req, res, next) {
	//console.log('looking for challenger challenges')
	var userId = req.params.userId;
	ChallengeChallenge.find({'challenger_id':userId},function(err, users){
	    if(err){ return next(err); }
	    //FIXME : handle bad userid query?
	    res.json(users);
	});
    });

    //FIXME : don't forget to put auth back in
    router.get('/badgeCheck/:userId', function(req, res, next) {
	var userId = req.params.userId;
    	var challengebadgedefpromise = ChallengeBadgeDef.find();
	challengebadgedefpromise.then(function(badgedefs){
	    var challengebadgepromise = ChallengeBadge.find();
	    challengebadgepromise.then(function(playerbadges){
		//FIXME : for each badge def, check if the two players have that badge
		ChallengeUser.find({'_id':userId},function(err, users){
		    for(badgedef in badgedefs){
			evalFunc = new Function("user","matches",badgedefs[badgedef].badge_def_eval_string)
			if(evalFunc(users[0],{})){
			    var newchallengebadge = new ChallengeBadge({
				user_id:users[0]._id,
				badge_id:badgedefs[badgedef]._id,
				badge_img_url:badgedefs[badgedef].badge_img_url,
				mouseover_string:badgedefs[badgedef].mouseover_string
			    });
			    newchallengebadge.save(function(err,thing){
				console.log('badge saved')
			    });
			} else {
			    console.log('badge has NOT been added')
			}
		    }
		    //FIXME : need to return something usefull
		    res.json({})
		})
	    })
	})
    })
				      
    
    router.post('/challengeExMatch', auth, function(req, res, next) {
	var challengematch = new ChallengeMatch(req.body.match);
	var winner_id = req.body.winner._id
	var loser_id = req.body.loser._id
	delete req.body.winner._id
	delete req.body.loser._id 
	var challenge_winner_json = req.body.winner;
	var challenge_loser_json = req.body.loser;

	challengematch.save(function(err, user){
	    if(err){
		//console.log(err);
		return next(err); }
	    ChallengeUser.update({_id:winner_id}, challenge_winner_json, function(err, user){
		if(err){
		    //console.log(err);
		    return next(err);
		}
		ChallengeUser.update({_id:loser_id}, challenge_loser_json, function(err, user){
		    if(err){
			//console.log(err);
			return next(err);
		    }		    
		    res.json(user);
		});
	    })
	})
    });	
    
    // router.post('/login', function(req, res, next) {
    // 	 res.cookie('sessionId','sessionIdGoesHere');
    // 	 res.json({
    // 	 	id: req.body.username+'-session_id',
    // 	 	user: {
    // 	 	    id: req.body.username+'-auth_id',
    // 	 	    role:'admin'
    // 	 	}
    // 	 });	
    // });
    
    return router;
}

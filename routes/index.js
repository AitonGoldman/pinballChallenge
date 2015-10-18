
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
		console.log('generic error in login')
		return next(err);
	    }
	    
	    if (!user) {
		// if authentication fail, get the error message that we set
		// from previous (info.message) step, assign it into to
		// req.session and redirect to the login page again to display
		console.log('auth failure in login')
		req.session.messages = info.message;
		return res.status(401).json({});
	    }
	    
	    // if everything's OK
	    req.logIn(user, function(err) {
		if (err) {
		    req.session.messages = "Error";
		    return next(err);
		    console.log('passport auth failure in login')
		}
		
		// set the message
		req.session.messages = "Login successfully";
		//return res.redirect('/');
		user.local.password='';
		user.local.appRole='admin';
		ChallengeUserStats.find({'userId':user._id},function(err, userstats){		    
		    console.log(userstats[0])
		    return res.json(userstats[0]);		    
		})

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
    var ChallengeUserStats = mongoose.model('ChallengeUserStats');
    var fs = require('fs');
    router.get('/challengeUserConvert', function(req, res, next) {	
	fs.readFileSync('/tmp/okayToGo')
	ChallengeUser.find(function(err, users){
	    for(i in users){
		users[i].local.username = users[i].local.username.toLowerCase();
		ChallengeUser.update({_id:users[i]._id},users[i],function(err, user){
		    console.log('converted!')
		})
	    }
	    
    	    if(err){ return next(err); }
	    for(i in users){
		var challengeuserstats = new ChallengeUserStats();
		challengeuserstats.wins = users[i].wins
		challengeuserstats.losses = users[i].losses
		challengeuserstats.matches_played = users[i].matches_played
		challengeuserstats.points = users[i].points
		challengeuserstats.appRole = users[i].appRole
		challengeuserstats.userId = users[i]._id
		challengeuserstats.username = users[i].local.username
		challengeuserstats.save(function(err, user){
		    console.log('okie dokie')		    
		})
	    }
    	    res.json(challengeuserstats);
    	});
    });
    
    
    router.get('/challengeUser', function(req, res, next) {
	ChallengeUserStats.find().lean().exec(function(err, users){
    	    if(err){ return next(err); }
	    for(i in users){
		if(users[i].displayName === undefined){
		    users[i]['displayNameHybrid'] = users[i].username
		} else {
		    users[i]['displayNameHybrid'] = users[i].displayName
		}		
	    }
    	    res.json(users);
    	});
    });
    
    router.get('/challengeUser/:userId', auth, function(req, res, next) {
	//console.log('looking for user')
	var userId = req.params.userId;
	
	ChallengeUserStats.find({'_id':userId},function(err, users){
	    if(err){ return next(err); }
	    //FIXME : handle bad userid query?
	    res.json(users[0]);
	});
    });

    router.get('/challengeUserEmail/:userId', auth, function(req, res, next) {
	//console.log('looking for user')
	var userId = req.params.userId;
	
	ChallengeUser.find({'_id':userId},function(err, users){
	    if(err){ return next(err); }
	    //FIXME : handle bad userid query?
	    res.json({email:users[0].local.email});
	    //	    res.json(users[0]);
	});
    });

    router.post('/challengeUserEmail/:userId', auth, function(req, res, next) {
	
	var userId = req.params.userId;
	var challengeUser = req.body
	//	delete challengeUserStats._id;
	ChallengeUser.find({'_id':userId},function(err, user_found){
	    user_found[0].local.email = req.body.email
	    ChallengeUser.update({_id:userId},user_found[0],function(err, user){
    		if(err){ return next(err); }
		res.json({status:true});
	    });
	})
    });

    
    
    router.post('/challengeUser', function(req, res, next) {
	//console.log(req);
	ChallengeUser.findOne({ 'local.username' :  req.body.local.username }, function(err, user) {
	    if (user) {
		res.json({status:false})
	    } else {
		var challengeuser = new ChallengeUser(req.body);
		var challengeuserstats = new ChallengeUserStats(req.body);
		//challengeuser.appRole = 'admin';
		challengeuser.local.username = challengeuser.local.username.toLowerCase();
		challengeuser.local.password = challengeuser.generateHash(challengeuser.local.password);
		challengeuser.save(function(err, user){
		    if(err){ return next(err); }
		    challengeuserstats.userId = user._id
		    challengeuserstats.username = user.local.username
		    challengeuserstats.save(function(err,user){
			res.json({status:true});
		    })
		});
	    }
	})
    });
    
    router.post('/challengeUser/:userId', auth, function(req, res, next) {
	
	var userId = req.params.userId;
	var challengeUserStat = req.body
//	delete challengeUserStats._id;
	ChallengeUserStats.update({_id:userId},challengeUserStat,function(err, user){
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

    router.get('/challengeMatchConvert', function(req, res, next) {	
	fs.readFileSync('/tmp/okayToGo')
	ChallengeUserStats.find(function(err, users){
    	    if(err){ return next(err); }
	    ChallengeMatch.find(function(err,matches){
		for(match in matches){
		    for(user in users){			
			if(users[user].userId == matches[match].player_one_id){
			    matches[match].player_one_id = users[user]._id
			}
			if(users[user].userId == matches[match].player_two_id){
			    matches[match].player_two_id = users[user]._id
			}
		    }
		    ChallengeMatch.update({_id:matches[match]._id},matches[match], function(err, user){
			console.log('match updated '+matches[match])
		    })
		}
    		res.json({});
    	    });
	});
    })
    
    router.get('/challengeExMatch/:userId', auth, function(req, res, next) {
	var userId = req.params.userId;
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
    

    router.put('/changePassword',auth, function(req,res,next){
	var userid = req.body._id
	var oldpassword = req.body.oldPassword
	var newpassword = req.body.newPassword

	ChallengeUserStats.find({'_id':userid},function(err, userstats){
	    if(userstats.length == 0){
		res.send(400);
		return
	    }
	    ChallengeUser.find({'_id':userstats[0].userId},function(err, users){
		if(!users[0].validPassword(oldpassword)){
		    res.send(400);
		    return
		}
		var newpasswordcrypt = users[0].generateHash(newpassword);   
		users[0].local.password = newpasswordcrypt
		ChallengeUser.update({_id:userstats[0].userId}, users[0], function(err,user){
		    res.json({})
		})		
	    })	    
	})
    })

    router.get('/email/:email',function(req,res,next){
	var nodemailer = require('nodemailer');

	// create reusable transporter object using SMTP transport
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
		user: 'pinballchallenge@gmail.com',
		pass: secrets.google_account_password
	    }
	});

	// NB! No need to recreate the transporter object. You can use
	// the same transporter object for all e-mails
	
	var email = req.params.email;
	ChallengeUser.find({'local.email':email},function(err, users){
	    if(users.length == 0){
		res.json({})
		return
	    }
	    var challengeuser = new ChallengeUser(users[0]);
	    //challengeuser.appRole = 'admin';
	    pass_gen_arr_length = secrets.password_generator_list.length
	    var passwordPhrase1 = secrets.password_generator_list[Math.floor(getRandomArbitrary(0,pass_gen_arr_length))]
	    var passwordPhrase2 = secrets.password_generator_list[Math.floor(getRandomArbitrary(0,pass_gen_arr_length))]
	    var passwordPhrase3 = secrets.password_generator_list[Math.floor(getRandomArbitrary(0,pass_gen_arr_length))]
	    var new_password = passwordPhrase1+passwordPhrase2+passwordPhrase3
	    challengeuser.local.password = challengeuser.generateHash(new_password);
	    console.log(new_password)
	    ChallengeUser.update({_id:challengeuser._id}, challengeuser, function(err,user){
		if(err){ return next(err); }
		
		var mailOptions = {
		    from: 'Pinball Challenge <pinballchallenge@gmail.com>', // sender address
		    to: challengeuser.local.email, // list of receivers
		    subject: 'Your password on Pinball Challenge has been reset!', // Subject line
		    text: 'A password reset request has been made.  The password for user '+challengeuser.local.username+' has been reset to the following : \n\n\n'+new_password+'\n\n\nIf you want to change this password, you can do so on your profile page.'
		};
		
		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
			console.log(error);
		    }else{
			console.log('Message sent: ' + info.response);
		    }
		})
		
	    	console.log('saved!')
	    })
	    res.json({})
	})
    })
	       
    router.post('/sendMail',auth,function(req,res,next){
	var nodemailer = require('nodemailer');

	// create reusable transporter object using SMTP transport
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
		user: 'pinballchallenge@gmail.com',
		pass: secrets.google_account_password
	    }
	});

	// NB! No need to recreate the transporter object. You can use
	// the same transporter object for all e-mails

	// setup e-mail data with unicode symbols
	var machine_string = req.body.machine
	var challenged_userId = req.body.challenged.userId
	if(machine_string !== undefined){
	    machine_string = " on "+machine_string
	} else {
	    machine_string = ""
	}
	
	var email_random_phrase = email_phrases[Math.floor(getRandomArbitrary(0,email_phrases.length))]

	ChallengeUser.find({'_id':challenged_userId},function(err, users){
	    if(users[0].local.email === undefined){
		res.json({})
		return
	    }
	    var mailOptions = {
		from: 'Pinball Challenge <pinballchallenge@gmail.com>', // sender address
		to: users[0].local.email, // list of receivers
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

    //FIXME : need to clean this up
    router.get('/badgeCheck/:userId', auth, function(req, res, next) {
	var userId = req.params.userId;
    	var challengebadgedefpromise = ChallengeBadgeDef.find();
	challengebadgedefpromise.then(function(badgedefs){
	    var challengebadgepromise = ChallengeBadge.find();
	    challengebadgepromise.then(function(playerbadges){
		ChallengeUserStats.find({'_id':userId},function(err, users){
		    for(badgedef in badgedefs){
			evalFunc = new Function("user","matches",badgedefs[badgedef].badge_def_eval_string)
			if(evalFunc(users[0],{})){
			    var newchallengebadge = new ChallengeBadge({
				user_id:users[0]._id,
				badge_id:badgedefs[badgedef]._id,
				badge_img_url:badgedefs[badgedef].badge_img_url,
				mouseover_string:badgedefs[badgedef].mouseover_string
			    });
			    ChallengeBadge.find({$and : [{'user_id':userId},
							 {'badge_id':badgedefs[badgedef]._id}]
						},function(err,badges){
						    if(badges.length == 0){
							newchallengebadge.save(function(err,thing){
							    console.log('badge saved')
							});
						    }
						})
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

    router.get('/challengeBadgeConvert', function(req, res, next) {	
	fs.readFileSync('/tmp/okayToGo')
	ChallengeUserStats.find(function(err, users){
    	    if(err){ return next(err); }
	    ChallengeBadge.find(function(err,badges){
		for(badge in badges){
		    for(user in users){			
			if(users[user].userId == badges[badge].user_id){
			    badges[badge].user_id = users[user]._id
			}
			if(users[user].userId == badges[badge].user_id){
			    badges[badge].user_id = users[user]._id
			}
		    }
		    ChallengeBadge.update({_id:badges[badge]._id},badges[badge], function(err, user){
			console.log('badge updated ')
		    })
		}
    		res.json({});
    	    });
	});
    })

    
    router.get('/challengeChallengeConvert', function(req, res, next) {	
	fs.readFileSync('/tmp/okayToGo')
	ChallengeUserStats.find(function(err, users){
    	    if(err){ return next(err); }
	    ChallengeChallenge.find(function(err,challenges){
		for(challenge in challenges){
		    for(user in users){			
			if(users[user].userId == challenges[challenge].challenger_id){
			    challenges[challenge].challenger_id = users[user]._id
			}
			if(users[user].userId == challenges[challenge].challenged_id){
			    challenges[challenge].challenged_id = users[user]._id
			}
		    }
		    ChallengeChallenge.update({_id:challenges[challenge]._id},challenges[challenge], function(err, user){
			console.log('challenge updated ')
		    })
		}
    		res.json({});
    	    });
	});
    })

    
    
    router.post('/challengeExMatch', auth, function(req, res, next) {
	var challengematch = new ChallengeMatch(req.body.match);
	var winner_id = req.body.winner._id
	var loser_id = req.body.loser._id
	//delete req.body.winner._id
	//delete req.body.loser._id
	console.log('one')
	var challenge_winner_json = new ChallengeUserStats(req.body.winner);
	var challenge_loser_json = new ChallengeUserStats(req.body.loser);

	challengematch.save(function(err, user){
	    if(err){
		//console.log(err);
		return next(err); }
	    ChallengeUserStats.update({_id:winner_id}, challenge_winner_json, function(err, user){
		if(err){
		    console.log(err);
		    return next(err);
		}
		ChallengeUserStats.update({_id:loser_id}, challenge_loser_json, function(err, user){
		    if(err){
			//console.log(err);
			return next(err);
		    }		    
		    res.json(user);
		});
	    })
	})
    });	
        
    return router;
}


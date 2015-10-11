var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
var mongoose = require('mongoose');
var ChallengeUser = mongoose.model('ChallengeUser');

router.get('/challengeUser', function(req, res, next) {
    ChallengeUser.find(function(err, users){
	if(err){ return next(err); }

	res.json(users);
    });
});

router.get('/challengeUser/:userId', function(req, res, next) {
    var userId = req.params.userId;
    
    ChallengeUser.find({'_id':userId},function(err, users){
	if(err){ return next(err); }
	res.json(users);
    });
});


router.post('/challengeUser', function(req, res, next) {
    var challengeuser = new ChallengeUser(req.body);

    challengeuser.save(function(err, user){
	if(err){ return next(err); }

	res.json(user);
    });
});

router.post('/challengeUser/:userId', function(req, res, next) {
    var userId = req.params.userId;
    var wins = req.body.wins
    var losses = req.body.losses
    
    ChallengeUser.update({_id:userId},{wins:wins,losses:losses},function(err, user){
    	if(err){ return next(err); }
	 res.json(user);
    });
});



var ChallengeMachine = mongoose.model('ChallengeMachine');

router.get('/challengeMachine', function(req, res, next) {
    ChallengeMachine.find(function(err, users){
	if(err){ return next(err); }

	res.json(users);
    });
});

router.post('/challengeMachine', function(req, res, next) {
    var challengemachine = new ChallengeMachine(req.body);

    challengemachine.save(function(err, user){
	if(err){ return next(err); }

	res.json(user);
    });
});

var ChallengeMatch = mongoose.model('ChallengeMatch');

router.get('/challengeMatch', function(req, res, next) {
    ChallengeMatch.find(function(err, users){
	if(err){ return next(err); }

	res.json(users);
    });
});

router.post('/challengeMatch', function(req, res, next) {
    var challengematch = new ChallengeMatch(req.body);

    challengematch.save(function(err, user){
	if(err){ return next(err); }

	res.json(user);
    });
});

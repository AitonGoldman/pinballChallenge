var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//Sigh - had to search a bunch for this line
var ObjectId = mongoose.Schema.ObjectId;

var Challenge = new mongoose.Schema({
    challengerId: String,
    challengerName: String,
    challengeMachine: String
})

var ChallengeUserSchema = new mongoose.Schema({
    local            : {
	email        : String,
	password     : String,
	username     : String
    },
    facebook         : {
	id           : String,
	token        : String,
	email        : String,
	name         : String
    },
    twitter          : {
	id           : String,
	token        : String,
	displayName  : String,
	username     : String
    },
    google           : {
	id           : String,
	token        : String,
	email        : String,
	name         : String
    },
    region: String,
    wins: Number,
    losses: Number,
    matches_played:  Number,
    points: Number,
    appRole: String,
    challenges: [Challenge]
});

// generating a hash
ChallengeUserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
ChallengeUserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

mongoose.model('ChallengeUser', ChallengeUserSchema);

var ChallengeMachineSchema = new mongoose.Schema({
    machine_name: String,
});

mongoose.model('ChallengeMachine', ChallengeMachineSchema);

var ChallengeBadgeDefSchema = new mongoose.Schema({
    badge_def_eval_string: String,
    badge_img_url: String,
    mouseover_string: String
});

mongoose.model('ChallengeBadgeDef', ChallengeBadgeDefSchema);

var ChallengeBadgeSchema = new mongoose.Schema({
    user_id: String,
    badge_id: String,
    badge_img_url: String,
    mouseover_string: String
});

mongoose.model('ChallengeBadge', ChallengeBadgeSchema);


var ChallengeMatchSchema = new mongoose.Schema({
    machine_name: String,
    player_one_user_name: String,
    player_two_user_name: String,
    player_winner: String,
    player_one_id: String,
    player_two_id: String,
    dateOfMatch: Date
});

var ChallengeChallengeSchema = new mongoose.Schema({
    challenger_id: String,
    challenger_name: String,
    challenged_id: String,
    challenged_name: String,
    machine_id: String,
    machine_name: String,
    completed: Boolean,
    challenge_has_machine: Boolean
})

mongoose.model('ChallengeChallenge', ChallengeChallengeSchema);

var ChallengeUserEx = new mongoose.Schema({
    wins: Number,
    losses: Number,
    matches_players: Number,
    points: Number    
})

var ChallengeMatchSchemaEx = new mongoose.Schema({
    machine_name: String,
    machine_id: String,
    player_one_user_name: String,
    winner_user_id: String,
    loser_user_id: String,
    winner_id: String,
    loser_id: String,
    dateOfMatch: Date,
    challenge_user:  [ChallengeUserEx],
    winner_challenge_id: String,
    loser_challenge_id: String    
});


mongoose.model('ChallengeMatch', ChallengeMatchSchema);

mongoose.model('ChallengeMatchEx', ChallengeMatchSchemaEx);

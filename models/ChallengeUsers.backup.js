var mongoose = require('mongoose');

var ChallengeUserSchema = new mongoose.Schema({
    user_name: String,
    wins: Number,
    losses: Number
});

mongoose.model('ChallengeUser', ChallengeUserSchema);

var ChallengeMachineSchema = new mongoose.Schema({
    machine_name: String,
});

mongoose.model('ChallengeMachine', ChallengeMachineSchema);

var ChallengeMatchSchema = new mongoose.Schema({
    machine_name: String,
    player_one_user_name: String,
    player_two_user_name: String,
    player_winner: String,
    player_one_id: String,
    player_two_id: String
});

mongoose.model('ChallengeMatch', ChallengeMatchSchema);

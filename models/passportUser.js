var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var passportUserSchema = mongoose.Schema({

    local            : {
	email        : String,
	password     : String,
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
    }

});

// methods ======================
// generating a hash
passportUserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
passportUserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('passportUser', passportUserSchema);

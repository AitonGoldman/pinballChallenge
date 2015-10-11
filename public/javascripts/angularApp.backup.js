//downloaded alert package from http://ngmodules.org/modules/message-center
//had to install libkrb5-dev for mongoose

//Add Match
//* Add "ranking" and "number of matches to model"
//* Calculate results of match ( who owes how many points, assign to players)
//View All Players
//* View All Matches for given player
//View all rankings


//add validators
//* on submit, validate or flash error message
//list of all matches per machine

var app = angular.module('pplChallenge', ['MessageCenterModule','ui.router','ngResource','ui.select', 'ngSanitize', 'ui.bootstrap']);

//var app = angular.module('pplChallenge', ['ui.bootstrap']);

app.factory('validUsers', function($resource){
    return $resource('challengeUser/:userId',
		     {userId:'@_id'})
});

app.factory('validMachines', function($resource){
    return $resource('challengeMachine/:machineId')
});

app.factory('validMatches', function($resource){
    return $resource('challengeMatch/:matchId')
});


app.directive('username', function($q, $timeout) {
    return {
	require: 'ngModel',
	link: function(scope, elm, attrs, ctrl) {
	    var usernames = ['Aiton Goldman'];

	    ctrl.$asyncValidators.username = function(modelValue, viewValue) {

		if (ctrl.$isEmpty(modelValue)) {
		    // consider empty model valid
		    return $q.when();
		}

		var def = $q.defer();

		$timeout(function() {
		    // Mock a delayed response
		    if (usernames.indexOf(modelValue) === -1) {
			// The username is available
			alert('Oh YAY')
			def.resolve();
		    } else {
			alert('Oh NOOO')

			def.reject();
		    }

		}, 250);

		return def.promise;
	    };
	}
    };
});


app.controller('NavBarCtrl', function($scope)
 	       {
 		   $scope.isCollapsed = true;
 		   fuckit = function(){
 		       if($scope.isCollapsed == false){
 		            $scope.isCollapsed = true;
 			   // 	   //	  $scope.$apply()
 		       }
		   }
 	       }	       
 	      );

app.controller('AddUserFormCtrl', [
    '$scope',
    'messageCenterService',
    'validUsers',
    'validMachines',
    'validMatches',
    '$stateParams',
    function($scope, messageCenterService, validUsers, validMachines, validMatches, $stateParams){
	$scope.validUsers = validUsers.query();
	$scope.validMachines = validMachines.query();
	$scope.listOfMatchesForUser = [];
	$scope.validMatches = validMatches.query(function(){
	for(match in $scope.validMatches){
	    if($scope.validMatches[match].player_one_id == $stateParams.id){
		$scope.listOfMatchesForUser.push($scope.validMatches[match]);
	    }
	    if($scope.validMatches[match].player_two_id == $stateParams.id){
		$scope.listOfMatchesForUser.push($scope.validMatches[match]);
	    }
	}

	});
	$scope.selectedPlayerOne = {};
	$scope.selectedPlayerTwo = {};
	$scope.selectedMachine = {};	
	$scope.user_name = "";	
	$scope.addUser = function(){
	    validUsers.save({user_name:$scope.user_name, wins:0, losses:0}, function(){
		$scope.validUsers = validUsers.query();
		messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
	    });
	}
	$scope.addMachine = function(){
	    validMachines.save({machine_name:$scope.machine_name}, function(){
		$scope.validMachines = validMachines.query();
		messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
	    });
	}
	$scope.addMatch = function(){
	    if($scope.match_player_won == "p1"){
		match_winner = $scope.selectedPlayerOne.selected;
	     	match_loser = $scope.selectedPlayerTwo.selected;

	    } else {
		match_winner = $scope.selectedPlayerTwo.selected;
	     	match_loser = $scope.selectedPlayerOne.selected;
	    }

	    match_winner.wins = match_winner.wins+1;
	    match_loser.losses = match_loser.losses+1;
	    validUsers.save(match_loser, function(){
		validUsers.save(match_winner, function(){
		    validMatches.save({player_one_user_name:match_winner.user_name,
				       player_one_id:match_winner._id,
				       player_two_user_name:match_loser.user_name,
				       player_two_id:match_loser._id,
				       machine_name:$scope.selectedMachine.selected.machine_name,
				       player_winner:match_winner.user_name
				      }, function(){
					  $scope.validUsers = validUsers.query();
					  $scope.validMatches = validMatches.query();
					  messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
		    })
		});		
	    });
	    
	    //messageCenterService.add('info', winner, { status: messageCenterService.status.permanent, timeout: 5000 });
	}

	
    }]);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('hide_menu', {
	    url: '/hide_menu',
	    template: '<ui-view/>'
	}).state('add_users', {
	    url: '/add_users',
	    templateUrl: '/add_users.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('user_list', {
	    url: '/user_list',
	    templateUrl: '/user_list.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('main', {
	    url: '/main',
	    templateUrl: '/main.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu'
	}).state('add_machines', {
	    url: '/add_machines',
	    templateUrl: '/add_machines.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('add_matches', {
	    url: '/add_matches',
	    templateUrl: '/add_matches.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('user', {
	    url: '/user/{id}',
	    templateUrl: '/user.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    resolve: { test: function(){
		fuckit();
	    }}
	});
	$urlRouterProvider.otherwise('hide_menu/main');
    }]);

				  

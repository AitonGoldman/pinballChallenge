//downloaded alert package from http://ngmodules.org/modules/message-center
//had to install libkrb5-dev for mongoose
//overall tutorial on building app with mean stack https://thinkster.io/mean-stack-tutorial
//login stuff from https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
//passport authentication ( used as guide, but made modifications ) : https://scotch.io/tutorials/easy-node-authentication-setup-and-local
//passport authentication ( I got the "how to auth individual methods after login" approach from the this )
//passport itself : http://passportjs.org/
//startfrom filter (and paginating while search) from : https://gist.github.com/kmaida/06d01f6b878777e2ea34

//Refactor
//* seperate out individual controllers
//* investigate loading resources on demand/loading once at page load?

//Add proper main page - maybe user page with extra info?

//Better notifications and error handling
//* on action, tell us if it succedded or not
//* tell us if a http request failed
//* disable controls when making http request

//add machine scores option to existing matches

//Add badges

//add profile page
// set email address
// set region
// set whethere or not to be informed for challenges
// set pic?
// see stats

//fix ipdb fetcher to get right machine ids for machines

//login
//* need to make sure 401 handling is being done right
//* add user needs to change to something reasonable once account is created

//View All Players
//* design - done
//* pagination
//* proper user search?

//add "region" to match fields?  or to user?

//add make challenge

//add see open challenges

//Fix collapsable navbar ( look at angular-bootstrap demo )

//Automate intteregation to ipdb

//allow for specifying date of match?

//add validators
//* on submit, validate or flash error message

//list of all matches per machine

var app = angular.module('pplChallenge', ['MessageCenterModule','ui.router','ngResource','ui.select', 'ngSanitize', 'ui.bootstrap','ngCookies']);

//var app = angular.module('pplChallenge', ['ui.bootstrap']);

app.config(function ($httpProvider) {
	$httpProvider.interceptors.push([
	    '$injector',
	    function ($injector) {
		return $injector.get('AuthInterceptor');
	    }
	]);
})

app.factory('AuthInterceptor', function ($rootScope, $q,
					  AUTH_EVENTS) {
	return {
	    responseError: function (response) {
		console.log('and here we are');
		$rootScope.$broadcast({
		    401: AUTH_EVENTS.notAuthenticated,
		    403: AUTH_EVENTS.notAuthorized,
		    419: AUTH_EVENTS.sessionTimeout,
		    440: AUTH_EVENTS.sessionTimeout
		}[response.status], response);
		return $q.reject(response);
	    }
	};
})


app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}]);

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

app.service('Session', function () {
	this.create = function (userId, userRole) {
	    this.userId = userId;
	    this.userRole = userRole;
	};
	this.destroy = function () {
	    this.userId = null;
	    this.userRole = null;
	};
    })

app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

app.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
})

app.factory('AuthService', function ($http, Session, $cookies) {
    var authService = {};
    
    authService.login = function (credentials) {
	return $http
	    .post('/login', credentials)
	    .then(function (res) {
		Session.create(res.data._id,
			       res.data.appRole);
		return res.data;
	    });
    };
    
    authService.isAuthenticated = function () {
	console.log('checking if authenticated')
	console.log($cookies.getAll())
	if ($cookies.get('connect.sid')){
	    return true
	}
	return !!Session.userId;
    };
    
    authService.isAuthorized = function (authorizedRoles) {
	if (!angular.isArray(authorizedRoles)) {
	    authorizedRoles = [authorizedRoles];
	}
	//FIXME : need to figure out what to do about isAuthorized
	//        - does it even make sense to have it?  
	console.log('checking if is authorized');
	return (authService.isAuthenticated() ||
		authorizedRoles.indexOf(Session.userRole) !== -1);
    };
    
    return authService;
})

app.controller('ApplicationController', function ($scope,
						  USER_ROLES,
						  AuthService) {
    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;
    $scope.isAuthenticated = AuthService.isAuthenticated();

//    $scope.setCurrentUser = function (user) {
//	$scope.currentUser = user;
//    };
})

app.controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService, $state) {
    $scope.credentials = {
	username: '',
	password: ''
    };
    $scope.login = function (credentials) {
	AuthService.login(credentials).then(function (user) {
	    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
	    //$scope.setCurrentUser(user);
	    if($rootScope.nextState){
		$state.go($rootScope.nextState.name);
	    } else {
		$state.go('main');
	    }
	}, function () {
	    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
	});
    };
})
app.controller('CreateUserFormCtrl',
	       ['$scope',
		'validUsers',
		'messageCenterService',
		function($scope,validUsers,messageCenterService){
		    
		    $scope.addUser = function(new_user_credentials){
			validUsers.save({local: {username: new_user_credentials.username, password: new_user_credentials.password}, wins:0, losses:0, matches_played: 0, points: 1400}, function(data){
			    console.log(data.status+" is status after add");
			    if(data.status){
				//	    	    $scope.validUsers = validUsers.query();
	    			messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
			    }else{
	    			messageCenterService.add('danger', 'Could not create the user - the userid already exists!', { status: messageCenterService.status.permanent, timeout: 5000 });
			    }
			})
		    }
		}
	       ]);

app.controller('AddUserFormCtrl', [
    '$scope',
    'messageCenterService',
    'validUsers',
    'validMachines',
    'validMatches',
    '$stateParams',
    '$http',
    'filterFilter',
    function($scope, messageCenterService, validUsers, validMachines, validMatches, $stateParams, $http,filterFilter){
	$scope.selectedPlayerOne = undefined;
	$scope.selectedPlayerTwo = undefined;
	$scope.selectedMachine = undefined;
	$scope.validUsers = validUsers.query();
	$scope.validMachines = undefined;
	$scope.validMachinesTotalItems = 99;
	//$scope.validMachines = validMachines.query();
	$scope.itemsPerPage = 10;
	$scope.maxSize = 5;
	$scope.currentPage = 1;
	$http.get('/javascripts/machines.nodups.json').success(function(data) {
	    $scope.validMachines = data;
	    $scope.validMachinesTotalItems = $scope.validMachines.length
//	    if(Math.ceil($scope.validMachinesTotalItems/ $scope.itemsPerPage) < $scope.maxSize){
//		$scope.maxSize = Math.ceil($scope.validMachinesTotalItems/ $scope.itemsPerPage);
//	    }
	});
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
//	$scope.selectedPlayerOne = {};
//	$scope.selectedPlayerTwo = {};
//	$scope.selectedMachine = {};	
	$scope.user_name = "";	

	$scope.addUser = function(new_user_credentials){
	    validUsers.save({local: {username: new_user_credentials.username, password: new_user_credentials.password}, wins:0, losses:0, matches_played: 0, points: 1400}, function(data){
		console.log(data.status+" is status after add");
		if(data.status){
	    	    $scope.validUsers = validUsers.query();
	    	    messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
		}else{
	    	    messageCenterService.add('danger', 'Could not create the user - the userid already exists!', { status: messageCenterService.status.permanent, timeout: 5000 });
		}
		});

	    //$scope.addUser = function(){
	    //	    validUsers.save({user_name:$scope.user_name, wins:0, losses:0, matches_played: 0, points: 1400}, function(){
	    //		$scope.validUsers = validUsers.query();
	    //		messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
	    //});
	}
	$scope.addMachine = function(){
	    validMachines.save({machine_name:$scope.machine_name}, function(){
		$scope.validMachines = validMachines.query();
		messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
	    });
	}

	// 
	//
	//
	//
	$scope.addMatch = function(){
	    match_winner = $scope.selectedPlayerOne;
	    match_loser = $scope.selectedPlayerTwo;
	    
	    match_winner.wins = match_winner.wins+1;
	    match_loser.losses = match_loser.losses+1;

	    player_rankings = []
	    
	    higher_ranked_player = undefined;
	    lower_ranked_player = undefined;
	    
	    if(match_winner.points > match_loser.points){
		player_rankings.push(match_winner,match_loser)
	    } else {
		player_rankings.push(match_loser, match_winner)
	    }
	    console.log("this is the old points" +match_winner.points);
	    var point_diff = player_rankings[0].points - player_rankings[1].points;
	    var point_diff_antes = [{low_range:0,high_range:11,h_ante:16,l_ante:16},
				    {low_range:12,high_range:33,h_ante:17,l_ante:15},
				    {low_range:34,high_range:55,h_ante:18,l_ante:14},
				    {low_range:56,high_range:77,h_ante:19,l_ante:13},
				    {low_range:78,high_range:100,h_ante:20,l_ante:12},
				    {low_range:101,high_range:125,h_ante:21,l_ante:11},
				    {low_range:126,high_range:150,h_ante:22,l_ante:10},
				    {low_range:151,high_range:176,h_ante:23,l_ante:9},
				    {low_range:177,high_range:205,h_ante:24,l_ante:8},
				    {low_range:206,high_range:238,h_ante:25,l_ante:7},
				    {low_range:239,high_range:272,h_ante:26,l_ante:6},
				    {low_range:273,high_range:314,h_ante:27,l_ante:5},
				    {low_range:315,high_range:365,h_ante:28,l_ante:4},
				    {low_range:366,high_range:445,h_ante:29,l_ante:3},
				    {low_range:446,high_range:525,h_ante:30,l_ante:2},
				    {low_range:526,high_range:715,h_ante:31,l_ante:1},
				    {low_range:716,high_range:999999,h_ante:32,l_ante:0}
				    
				   ]
	    for(i in point_diff_antes){
		if(point_diff >= point_diff_antes[i].low_range && point_diff <= point_diff_antes[i].high_range){
		    player_rankings[0].points = player_rankings[0].points - point_diff_antes[i].h_ante;
		    player_rankings[0].ante=point_diff_antes[i].h_ante;;
		    player_rankings[1].points = player_rankings[1].points - point_diff_antes[i].l_ante;
		    player_rankings[1].ante=point_diff_antes[i].l_ante;;
		}
	    }

	    $scope.winner_ante = player_rankings[0].ante;
	    $scope.loser_ante = player_rankings[1].ante;
	    
	    console.log("this is the new points" +match_winner.points);
	    
	    match_winner.points = match_winner.points + 32
	    match_winner.matches_played = match_winner.matches_played + 1;
	    match_loser.matches_played = match_loser.matches_played + 1;
	    
	    validUsers.save(match_loser, function(){
	      	validUsers.save(match_winner, function(){
	      	    validMatches.save({player_one_user_name:match_winner.local.username,
	      			       player_one_id:match_winner._id,
	      			       player_two_user_name:match_loser.local.username,
	      			       player_two_id:match_loser._id,
	      			       machine_name:$scope.selectedMachine.machine_name,
	      			       player_winner:match_winner.username,
				       dateOfMatch: new Date().getTime()
	      			      }, function(){
	      				  $scope.validUsers = validUsers.query();
	      				  $scope.validMatches = validMatches.query();
					  $scope.submitted = true;
	      				  messageCenterService.add('info', 'Your action has been completed!', { status: messageCenterService.status.permanent, timeout: 5000 });
	      	    })
	      	});		
	    });
	    
	    //messageCenterService.add('info', winner, { status: messageCenterService.status.permanent, timeout: 5000 });
	}
	$scope.setPage = function (pageNo) {
	    $scope.currentPage = pageNo;
	};
	
	$scope.pageChanged = function() {
	    console.log('Page changed to: ' + $scope.currentPage);
	};
	

	$scope.machine_list_query = '';

	$scope.resetFilters = function () {
	    // needs to be a function or it won't trigger a $watch
	    $scope.machine_list_query = '';
	};

	$scope.$watch('machine_list_query', function (newVal, oldVal) {
	    $scope.filtered = filterFilter($scope.validMachines, newVal);
	    $scope.validMachinesTotalItems = $scope.filtered.length;
	    if(Math.ceil($scope.validMachinesTotalItems / $scope.entryLimit) < 5){
		$scope.maxSize = Math.ceil($scope.validMachinesTotalItems / $scope.entryLimit);
	    }
	    $scope.currentPage = 1;
	}, true);
	
	
    }]);

app.filter('startFrom', function () {
    return function (input, start) {
	if (input) {
	    start = +start;
	    return input.slice(start);
	}
	return [];
    };
});

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    'USER_ROLES',
    function($stateProvider, $urlRouterProvider, USER_ROLES) {

	$stateProvider.state('hide_menu', {
	    url: '/hide_menu',
	    template: '<ui-view/>'
	}).state('test', {
	    url: '/test',
	    templateUrl: '/test.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    data: {
		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
	    },
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('add_users', {
	    url: '/add_users',
	    templateUrl: '/add_users.html',
	    controller: 'CreateUserFormCtrl',
	    parent: 'hide_menu',
//	    data: {
//		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
//	    },
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('user_list', {
	    url: '/user_list',
	    templateUrl: '/user_list.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    data: {
		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
	    },
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('main', {
	    url: '/',
	    templateUrl: '/main.html',
	    controller: 'AddUserFormCtrl',
	    data: {
		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
	    },
	    parent: 'hide_menu'
	}).state('login', {
	    url: '/login',
	    templateUrl: '/login.html',
	    parent: 'hide_menu'
	}).state('list_machines', {
	    url: '/list_machines',
	    templateUrl: '/list_machines.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    data: {
		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
	    },
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('add_matches', {
	    url: '/add_matches',
	    templateUrl: '/add_matches.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    data: {
		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
	    },
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('user', {
	    url: '/user/{id}',
	    templateUrl: '/user.html',
	    controller: 'AddUserFormCtrl',
	    parent: 'hide_menu',
	    data: {
		authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
	    },
	    resolve: { test: function(){
		fuckit();
	    }}
	});
	$urlRouterProvider.otherwise('hide_menu/');
    }]);

app.run(function ($rootScope, AUTH_EVENTS, AuthService, $state) {
    $rootScope.nextState = undefined;
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event, next){
	console.log('hi there - we are in trouble');
	//$rootScope.nextState = next;
	event.preventDefault();
	$state.go('login')
    });

    $rootScope.$on('$stateChangeStart', function (event, next) {
	var authorizedRoles;	
	if(next && next.data){
	    authorizedRoles = next.data.authorizedRoles;
	} else {
	    authorizedRoles = undefined;
	}
	if (!AuthService.isAuthorized(authorizedRoles)) {
	    event.preventDefault();
	    console.log('broadcasting trouble');
	    if (AuthService.isAuthenticated()) {
		// user is not allowed
		$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
	    } else {
		// user is not logged in
		console.log('broadcasting even more trouble');
		$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
		$rootScope.nextState = next
		//$state.go('login')
	    }
	}
    });
})

app.directive('loginDialog', function (AUTH_EVENTS) {
    return {
	restrict: 'A',
	template: '<div ng-if="visible" ng-include="\'/login.html\'">',
	link: function (scope) {
	    var showDialog = function () {
		scope.visible = true;
		console.log('oops');
	    };

	    scope.visible = false;
	    //scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
	    //scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
	}
    };
})


var app = angular.module('pplChallenge', ['ngAnimate', 'ngAutodisable', 'MessageCenterModule','ui.router','ngResource','ui.select', 'ngSanitize', 'ui.bootstrap','ngCookies','ui-notification']);


app.directive('testvalidator', function($q,$timeout) {
    return {
	require: 'ngModel',
	link: function(scope, elm, attrs, ctrl) {
	    ctrl.$asyncValidators.testvalidator = function(modelValue, viewValue) {
		if (ctrl.$isEmpty(modelValue)) {
		    // consider empty models to be valid
		    return $q.when();
		}
		var def = $q.defer();
		if(scope.challenger_user !== undefined && scope.challenger_user._id !== undefined){
		    def.resolve();		    
		} else {
		    def.reject();
		}
		return def.promise
	    };
	}
    };
});

app.constant('ANTE_RANGES',[{low_range:0,high_range:11,h_ante:16,l_ante:16},
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
			   ])

app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
    requestFailed: 'request-failed'
})

app.filter('startFrom', function () {
    return function (input, start) {
	if (input) {
	    start = +start;
	    return input.slice(start);
	}
	return [];
    };
});


app.factory('validUsers', function($resource){
    return $resource('challengeUser/:userId',{
	userId:'@_id'},{
	    get: {
		method:'GET',timeout:6000
	    }, save: {
		method:'POST',timeout:6000
	    }
	})
});

app.factory('validEmails', function($resource){
    return $resource('challengeUserEmail/:userId',{
	userId:'@_id'},{
	    get: {
		method:'GET',timeout:6000
	    }, save: {
		method:'POST',timeout:6000
	    }
	})
});


app.factory('validChallenges', function($resource){
    
    return $resource('challengeChallenge/:userId',{
	challengeId:'@_id'},{
	    get: {
		method:'GET',timeout:6000, isArray:true
	    }, save: {
		method:'POST',timeout:6000					   
	    }, update: {
		url: 'challengeChallenge/:challengeId/', method:'PUT',timeout:6000
	    }
	})
});

app.factory('validMatches', function($resource){
    return $resource('challengeExMatch/:userId',{
	matchId:'@_id'},{
	    get: {
		method:'GET',timeout:6000,isArray:true
	    }, save: {
		method:'POST',timeout:6000					   
	    }
	})
});

app.factory('validMachinesList', function($resource){
    var validMachinesResource = $resource('/static_json/machines.json')
    var validMachinesInstance = validMachinesResource.query();
    return validMachinesInstance;
})

app.factory('challengeBadges', function($resource){
    return $resource('/testBadge').query()
})


app.factory('AuthService', function ($http, $cookies, Notification, $resource) {
    var authService = {};
    
    authService.login = function (credentials) {
	credentials.username = 	credentials.username.toLowerCase();
	return $http
	    .post('/login', credentials)
	    .then(function (res) {
		//FIXME : need to signal login failure or success here?
		//        we get back a 401 if login failed, so maybe not?
		$cookies.remove('user_info');
		//		$cookies.putObject('user_info',{_id:res.data._id,username:res.data.local.username})
		displayNameHybrid = ''
		if(res.data.displayName === undefined){
		    displayNameHybrid = res.data.username
		} else {
		    displayNameHybrid = res.data.displayName
		}
		$cookies.putObject('user_info',{_id:res.data._id,username:res.data.username, displayNameHybrid:displayNameHybrid})
		$http.get('/static_json/motd.json').then(function(data){
		    //		    Notification({message:data.data.message,delay:10000})
		    Notification({message: "Welcome to the terror dome! ",delay:10000})
		})
		return res.data;
	    });
    };
    
    authService.isAuthenticated = function () {
	if ($cookies.get('user_info')){
	    return true
	} else {
	    return false
	}
    };
    
    return authService;
})


app.factory('AuthInterceptor', function ($rootScope, $q,
					 AUTH_EVENTS, $cookies) {
	return {
	    responseError: function (response) {
		console.log('There was a response error - '+response.status)

		$rootScope.$broadcast({
		    401: AUTH_EVENTS.notAuthenticated,
		    "-1": AUTH_EVENTS.requestFailed
		}[response.status], response);
		return $q.reject(response);
	    },
	};
})

app.controller('TestController', function ($scope, $http, $q){
    $scope.test = function(){
	console.log('okie dokie')
	return $q(function(){})
    }
})

app.controller('NavBarCtrl', function ($scope,AuthService){
    $scope.isCollapsed = true;
    $scope.isNotCollapsed = false;
    fuckit = function(){
 	if($scope.isCollapsed == false){
 	    $scope.isCollapsed = true;
 	}
	$scope.isUserAuthenticated = AuthService.isAuthenticated();
    }
});

app.controller('ApplicationController', function ($scope,AuthService) {
    $scope.itemsPerPage = 10;
    $scope.hardMaxSize = 5;
    $scope.currentUser = null;
    $scope.isUserAuthenticated = AuthService.isAuthenticated();
    $scope.checkScopeVariableHasId = function(scopeArr){
	for(i in scopeArr){
	    if(scopeArr[i] === undefined){
		return false
	    }
	    if(scopeArr[i]._id === undefined){
		return false
	    } 
	}
	return true
    }
})

app.controller('LoginController', function ($scope,$rootScope,
					    AUTH_EVENTS,AuthService,
					    $state, Notification,
					    $uibModal) {
    $scope.credentials = {
	username: '',
	password: ''
    };

    var open = function (user) {	
	var modalInstance = $uibModal.open({
	    animation: true,
	    templateUrl: '/modal.html',
	    controller: 'AddDisplayNameController',
	    backdrop: 'static',
	    resolve: {
		user: function () {
		    return user;
		}
	    }
	});
    }
    
	
    $scope.login = function (credentials) {
	var loginPromise = AuthService.login(credentials);
	loginPromise.then(function (user) {
	    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
	    if(user.displayName === undefined){
		open(user)
		return;
	    }
	    if($rootScope.nextState){		
		$state.go($rootScope.nextState.name);
	    } else {
		$state.go('main');
	    }
	}, function () {
	    //FIXME : should we handle login failure here,
	    //        or in a broadcast listener somewhere else?
	    Notification.error('Failed to log in.  Please try again');
	    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
	});
	return loginPromise;
    };
})

app.controller('AddUserEmailController',
	       ['$scope','validUsers',
		'Notification', '$q',
		'validEmails',
		function($scope, validUsers,
			 Notification, $q,
			 validEmails){
		    
		    $scope.addEmail = function(){
			$scope.email_address.email = $scope.newEmail			
			var emailPromise = validEmails.save({_id:$scope.user.userId,userId:$scope.user.userId,email:$scope.newEmail}).$promise

			emailPromise.then(function(data){
			    Notification('successfully set email address')
			})
		    }
		}])

app.controller('AddDisplayNameController',
		function($scope, validUsers,
			 Notification, $q,
			 $state, 
			 $modalInstance, user){
		    $scope.addDisplayName = function(){
			$modalInstance.close();
			$scope.user = user
			$scope.user.displayName = $scope.newDisplayName			
			var displayNamePromise = validUsers.save($scope.user).$promise
			displayNamePromise.then(function(data){
			    Notification('successfully set display name')
			    $state.go('main');
			})
		    }
		})


app.controller('AddUserFormController',
	       ['$scope','validUsers',
		'messageCenterService','Notification',
		'$state','$q',
		function($scope, validUsers,
			 messageCenterService, Notification,
			 $state, $q){
		    
		    $scope.addUser = function(new_user_credentials){
			//FIXME : should just be able to pass in new_user_credentials?
			var validUsersPromise = validUsers.save({
			    local: {
				username: new_user_credentials.username,
				password: new_user_credentials.password,
				email: new_user_credentials.email},
			    wins:0,
			    losses:0,
			    matches_played: 0,
			    points: 1400,
			    displayName: new_user_credentials.displayname
			}).$promise
			validUsersPromise.then(function(data){
			    if(data.status){
				$state.go('login');
				Notification('User has been successfully added.  Please login');
			    }else{
				Notification.error('User could not be added - the username might already be in use.  Please try again');
			    }
			}, function(response){
			    Notification.error('User could not be added - Server Error');
			})
			return validUsersPromise
		    }
		}
	       ]);

app.controller('ForgotFormController',
	       ['$scope','validUsers',
		'messageCenterService','Notification',
		'$state','$q',
		'$http',
		function($scope, validUsers,
			 messageCenterService, Notification,
			 $state, $q,
			 $http){
		    
		    $scope.forgotPassword = function(email_address){
			$http.get('/email/'+email_address).then(function(data){
			    console.log('password has been reset')
			    $state.go('login');
			    Notification('Password reset request has been sent!')
			})			
		    }
		}
	       ]);

app.controller('ForgotLoginIdFormController',
	       ['$scope','validUsers',
		'messageCenterService','Notification',
		'$state','$q',
		'$http',
		function($scope, validUsers,
			 messageCenterService, Notification,
			 $state, $q,
			 $http){
		    
		    $scope.forgotLoginId = function(email_address){
			$http.get('/forgotLoginId/'+email_address).then(function(data){
			    console.log('login id has been emailed')
			    $state.go('login');
			    Notification('Login in has been emailed!')
			})			
		    }
		}
	       ]);

app.controller('ChangePasswordController',
	       ['$scope','validUsers',
		'messageCenterService','Notification',
		'$state','$q',
		'$http','$cookies',
		function($scope, validUsers,
			 messageCenterService, Notification,
			 $state, $q,
			 $http, $cookies){
		    
		    var user_info = $cookies.getObject('user_info');
		    $scope.changePassword = function(oldPassword,newPassword){
			$http.put('/changePassword',{_id:user_info._id,oldPassword:oldPassword,newPassword:newPassword}).then(function(data){
			    $state.go('main');
			    Notification('Password has been changed!')
			}, function(data){
			    Notification.error('Password has NOT been changed!  <br>Make sure you have your current password correct.')
			})			
		    }
		}
	       ]);


app.controller('MachineListController',
	       function ($scope,filterFilter,
			 validMachinesList){
		   $scope.validMachinesList = validMachinesList
		   $scope.currentPage = 1;
//		   $scope.itemsPerPage = 10;
//		   var hardMaxSize = 8;
		   $scope.maxSize = $scope.hardMaxSize;
		   $scope.validMachinesList.$promise.then(function(data){
		       $scope.validMachinesListTotalItems = data.length;
		   })
		   $scope.$watch('machine_list_query', function (newVal, oldVal) {
		       $scope.filtered = filterFilter($scope.validMachinesList, newVal);
		       $scope.validMachinesListTotalItems = $scope.filtered.length;
		       if(Math.ceil($scope.validMachinesListTotalItems / $scope.entryLimit) < $scope.hardMaxSize){
			   $scope.maxSize = Math.ceil($scope.validMachinesListTotalItems / $scope.entryLimit);
		       }
		       $scope.currentPage = 1;
		   }, true);		   
	       })
	      	       
app.controller('AddMatchesController',
	       ['$scope', 'validMachinesList',
		'validUsers',
		'validMatches',
		'Notification','ANTE_RANGES',
		'filterFilter','$q',
		'validChallenges','$http',
		function($scope, 
			 validMachinesList, validUsers,
			 validMatches, 
			 Notification, ANTE_RANGES,
			 filterFilter, $q,
			 validChallenges, $http){
		    $scope.validUsersList = validUsers.query();
		    $scope.validMachinesList = validMachinesList;
		    
		    $scope.addMatch = function(){

			if($scope.noResultsMachine){
			    Notification.error('The machine you entered was not valid')
			    return $q.defer().reject();
			}

			if($scope.noResultsPlayerOne){
			    Notification.error('The winner you entered was not a valid username')
			    return $q.defer().reject();
			}

			if($scope.noResultsPlayerTwo){
			    Notification.error('The loser you entered is a loser.  Also, that is not a valid username')
			    return $q.defer().reject();
			}			
			
			$scope.match_winner = $scope.selectedPlayerOne;
			$scope.match_loser = $scope.selectedPlayerTwo;
			
			$scope.match_winner.wins = $scope.match_winner.wins+1;
			$scope.match_loser.losses = $scope.match_loser.losses+1;
			
			$scope.player_rankings = []
			
			if($scope.match_winner.points > $scope.match_loser.points){
			    $scope.player_rankings.push($scope.match_winner,$scope.match_loser)
			} else {
			    $scope.player_rankings.push($scope.match_loser, $scope.match_winner)
			}

			var HIGHER_RANKED = 0
			var LOWER_RANKED = 1
			
			var point_diff = $scope.player_rankings[HIGHER_RANKED].points - $scope.player_rankings[LOWER_RANKED].points;
			var point_diff_antes = ANTE_RANGES

			for(i in point_diff_antes){
			    if(point_diff >= point_diff_antes[i].low_range &&
			       point_diff <= point_diff_antes[i].high_range){
				$scope.player_rankings[HIGHER_RANKED].points = $scope.player_rankings[HIGHER_RANKED].points - point_diff_antes[i].h_ante;
				$scope.player_rankings[HIGHER_RANKED].ante=point_diff_antes[i].h_ante;;
				$scope.player_rankings[LOWER_RANKED].points = $scope.player_rankings[LOWER_RANKED].points - point_diff_antes[i].l_ante;
				$scope.player_rankings[LOWER_RANKED].ante=point_diff_antes[i].l_ante;;
			    }
			}
			
			$scope.winner_ante = $scope.player_rankings[HIGHER_RANKED].ante;
			$scope.loser_ante = $scope.player_rankings[LOWER_RANKED].ante;
			
			$scope.match_winner.points = $scope.match_winner.points + 32
			$scope.match_winner.matches_played = $scope.match_winner.matches_played + 1;
			$scope.match_loser.matches_played = $scope.match_loser.matches_played + 1;

			//fixme : try and make challenge and match update more atomic
			var validChallengesPromise = validChallenges.get({
			    userId:$scope.match_winner._id}).$promise;
			
			validChallengesPromise.then(function(data){
			    $scope.FilteredWin = filterFilter(data, $scope.match_winner._id);
			    $scope.FilteredWinAndLoser = filterFilter($scope.FilteredWin, $scope.match_loser._id);
			    $scope.FilteredWinAndLoserNoMachine = filterFilter($scope.FilteredWinAndLoser, {challenge_has_machine:false});
			    $scope.FilteredWinAndLoserAndMachine = filterFilter($scope.FilteredWinAndLoser,
										$scope.selectedMachine._id);
			    console.log($scope.FilteredWinAndLoserAndMachine.length)
			    
			    if($scope.FilteredWinAndLoserAndMachine.length != 0){
				$scope.FilteredWinAndLoserAndMachine[0].completed = true;
				validChallenges.update($scope.FilteredWinAndLoserAndMachine[0]).$promise.then(function(data){
				    Notification('Challenge has been completed!')
				})
			    } else {
				if($scope.FilteredWinAndLoserNoMachine.length != 0){
				    console.log($scope.FilteredWinAndLoserNoMachine[0]);
				    $scope.FilteredWinAndLoserNoMachine[0].completed = true;
				    validChallenges.update($scope.FilteredWinAndLoserNoMachine[0]).$promise.then(function(data){
					Notification('Challenge has been completed!')
					//FIXME : need to handle badge checking more cleanly
				    })				    
				}
			    }			    
			})

			
			return validMatches.save({
			    winner: $scope.match_winner,
			    loser: $scope.match_loser,
			    match:{
				player_one_user_name:$scope.match_winner.displayNameHybrid,
	      			player_one_id:$scope.match_winner._id,
	      			player_two_user_name:$scope.match_loser.displayNameHybrid,
	      			player_two_id:$scope.match_loser._id,
	      			machine_name:$scope.selectedMachine.machine_name,
				machine_id:$scope.selectedMachine._id,
	      			player_winner:$scope.match_winner.displayNameHybrid,
				dateOfMatch: new Date().getTime()
			    }
			},function(){
			    $scope.submitted = true;
			    Notification('Match has been recorded')
			    $http.get('/badgeCheck/'+$scope.match_winner._id).then(function(data){
				console.log('badge check for winner done')
			    })
			    $http.get('/badgeCheck/'+$scope.match_loser._id).then(function(data){
				console.log('badge check for winner done')
			    })			    
			}, function(){
			    Notification.error('Match could not be saved due to server error!')					      
			}).$promise
		    }
		}])


app.controller('UserListController',
	       ['$scope', 'validUsers',
		'messageCenterService', 'filterFilter',
		'challengeBadges','$sce',
		function($scope, validUsers,
			 messageCenterService, filterFilter,
			 challengeBadges, $sce){
		    $scope.badges = challengeBadges;

		    $scope.currentPage = 1;
		    $scope.maxSize = $scope.hardMaxSize;
		    $scope.validUsersList = validUsers.query()
		    $scope.validUsersList.$promise.then(function(data){
			$scope.validUsersListTotalItems = data.length;
		    })
		    $scope.$watch('user_list_query', function (newVal, oldVal) {
			$scope.filtered = filterFilter($scope.validUsersList, newVal);
			$scope.validUsersListTotalItems = $scope.filtered.length;
			if(Math.ceil($scope.validUsersListTotalItems / $scope.entryLimit) < $scope.hardMaxSize){
			    $scope.maxSize = Math.ceil($scope.validUsersListTotalItems / $scope.entryLimit);
			}
			$scope.currentPage = 1;
		    }, true);		   
		    
		}])

app.controller('ChallengeController',
	       ['$scope', 'AuthService',
		'$cookies', 'validUsers',
		'validMachinesList',
		'validChallenges', 'filterFilter',
		'orderByFilter', 'Notification',		
		'$q','$http',
		function($scope, AuthService,
			 $cookies, validUsers,
			 validMachinesList,
			 validChallenges, filterFilter,
			 orderByFilter, Notification,
			 $q, $http){

		    $scope.challenger_machine="";
		    $scope.noResultsMachine = false
		    var user_info = $cookies.getObject('user_info');
		    if(user_info === undefined){
			$state.go('login');
		    }
		    $scope.user_info = user_info
//		    var hardMaxSize = 8;
		    $scope.challengesCurrentPage = 1;
		    $scope.challengesItemsPerPage = 5;
		    $scope.challengesMaxSize = $scope.hardMaxSize;

		    $scope.challengedCurrentPage = 1;
		    $scope.challengedItemsPerPage = 5;
		    $scope.challengedMaxSize = $scope.hardMaxSize;

		    $scope.validUsersList = validUsers.query()
		    $scope.validMachinesList = validMachinesList
		    $scope.validChallenges = validChallenges.get({userId:user_info._id})

		    $scope.validChallenges.$promise.then(function(data){
			$scope.validUserChallengedTotalItems = filterFilter(data,{challenged_id:user_info._id}).length;
			$scope.validUserChallengesTotalItems = filterFilter(data,{challenger_id:user_info._id}).length;
		    })
		    
		    $scope.submitChallenge = function(){
			if($scope.noResultsMachine !== undefined){
			    if ($scope.noResultsMachine == true){
				Notification.error('You have not selected a valid machine')
				return $q.defer().reject();
			    } 
			}
			
			if($scope.noResultsUser === true){
			    Notification.error('You have not selected a user or selected an invalid user')
			    return $q.defer().reject();
			}
			
			if($scope.challenger_user._id === undefined){
			    Notification.error('You have not selected a user or selected an invalid user')
			    return $q.defer().reject();
			}


			var challenge_has_machine = false;
			if($scope.challenger_machine != ""){
			    challenge_has_machine = true;
			}
			
			var challengePromise = validChallenges.save({
			    //			    challenger_name:user_info.username,
			    challenger_name:user_info.displayNameHybrid,
			    challenger_id:user_info._id,
			    //			    challenged_name:$scope.challenger_user.local.username,
			    challenged_name:$scope.challenger_user.displayNameHybrid,
			    challenged_id:$scope.challenger_user._id,
			    machine_id: $scope.challenger_machine._id,
			    machine_name: $scope.challenger_machine.machine_name,
			    challenge_has_machine: challenge_has_machine,
			    completed:false
			}).$promise

			challengePromise.then(function(data){
			    $scope.validChallenges = validChallenges.get({
				userId:user_info._id
			    })
			    Notification('Challenge Issued');
			    $scope.validChallenges = validChallenges.get({userId:user_info._id})
			    $scope.validChallenges.$promise.then(function(data){
				$scope.validUserChallengedTotalItems = filterFilter(data,{challenged_id:user_info._id}).length;
				$scope.validUserChallengesTotalItems = filterFilter(data,{challenger_id:user_info._id}).length;
			    })
			    
			    //			    if($scope.challenger_user.local.email === undefined){
			    //				return
			    //			    }
			    $http.post('/sendMail',{
				challenged:$scope.challenger_user,
				challenger:user_info.username,
				machine:$scope.challenger_machine.machine_name
			    }).then(function(response){
				console.log('finished emailing')
			    })
			})
			return challengePromise;			
		    }
		}]);


app.controller('MainController',
	       ['$scope', 'AuthService',
		'$cookies', 'validUsers',
		'validMachinesList',
		'$state', 'Notification',
		'$stateParams',	'filterFilter',
		'orderByFilter', '$q',
		'validEmails','challengeBadges',
		function($scope, AuthService,
			 $cookies, validUsers,
			 validMachinesList,
			 $state, Notification,
			 $stateParams, filterFilter,
			 orderByFilter, $q,
			 validEmails, challengeBadges){
		    var user_info = $cookies.getObject('user_info');
		    if(user_info === undefined){
			$state.go('login');
		    }

		    $scope.currentPage = 1;
//		    $scope.itemsPerPage = 5;
//		    var hardMaxSize = 8;
		    $scope.maxSize = $scope.hardMaxSize;
		    
		    $scope.user = {};
		    $scope.user_id = $stateParams.id;		    
		    $scope.validMachinesList = validMachinesList;
		    
		    $scope.in_profile_page = false
		    if($stateParams.id === undefined){
			$scope.in_profile_page = true
		    }
		    
		    $scope.validUsersList = validUsers.query();
		    $scope.validUsersList.$promise.then(function(data){

			
			
			if($scope.user_id === undefined){
			    $scope.user = filterFilter($scope.validUsersList, user_info._id)[0];
			    $scope.user_id = user_info._id;
			    $scope.email_address = validEmails.get({userId:$scope.user.userId})
			} else {
			    $scope.user = filterFilter($scope.validUsersList, $scope.user_id)[0];
			}
			$scope.badges = challengeBadges;

			var filtered = orderByFilter($scope.validUsersList,"-points")
			$scope.rank = 1			
			for(i in filtered){
			    if (i == 1){
				$scope.rank = 1
			    }
			    
			    if (filtered[i].matches_played < 5){
				$scope.not_rank = true
			    } else {
				if (i >= 1 && filtered[i].points - filtered[i-1].points != 0){
				    $scope.rank = $scope.rank + 1
				}				
				$scope.not_rank = false
			    }
			    
			    if (filtered[i]._id == $scope.user_id){
				console.log($scope.not_rank)
			     	break
			    }


			}

		    })
		}])

app.controller('HelpController',
	       ['$scope','ANTE_RANGES',
		function($scope,ANTE_RANGES){
		    $scope.ANTE_RANGES = ANTE_RANGES
		}])

app.controller('UserProfileMatchController',
	       ['$scope', 'validMatches',
		'messageCenterService', '$stateParams',
		'$cookies', 'filterFilter',
		function($scope, validMatches,
			 messageCenterService, $stateParams,
			 $cookies, filterFilter){

		    $scope.currentPage = 1;
//		    $scope.itemsPerPage = 5;
//		    $scope.hardMaxSize = 8;
		    $scope.maxSize = $scope.hardMaxSize;

		    $scope.user_id = $stateParams.id;
		    
		    if($scope.user_id === undefined){
			$scope.user_id = $cookies.getObject('user_info')._id;
		    }

		    $scope.validMatches = validMatches.get({userId:$scope.user_id});
		    $scope.validMatches.$promise.then(function(data){
			$scope.validMatchesList = filterFilter($scope.validMatches, $scope.user_id);			
			$scope.validMatchesTotalItems = $scope.validMatchesList.length
		    })


		}])

app.config([
    '$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('application', {
	    url: '/application',
	    template: '<div ui-view/>'
	}).state('login', {
	    url: '/login',
	    templateUrl: '/login.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('main', {
	    url: '/',
	    templateUrl: '/main.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('add_users', {
	    url: '/add_users',
	    templateUrl: '/add_users.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('user_list', {
	    url: '/user_list',
	    templateUrl: '/user_list.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('user', {
	    url: '/user/{id}',
	    templateUrl: '/main.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('list_machines', {
	    url: '/list_machines',
	    templateUrl: '/list_machines.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('add_matches', {
	    url: '/add_matches',
	    templateUrl: '/add_matches.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('challenges', {
	    url: '/challenges',
	    templateUrl: '/challenges.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('test', {
	    url: '/test',
	    templateUrl: '/test.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('help', {
	    url: '/help',
	    templateUrl: '/help.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('about', {
	    url: '/about',
	    templateUrl: '/about.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('forgot', {
	    url: '/forgot',
	    templateUrl: '/forgot.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('forgot_login_id', {
	    url: '/forgot_login_id',
	    templateUrl: '/forgot_login_id.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	}).state('change_password', {
	    url: '/change_password',
	    templateUrl: '/change_password.html',
	    parent: 'application',
	    resolve: { test: function(){
		fuckit();
	    }}
	});
	$urlRouterProvider.otherwise('application/');
    }]);

app.config(function(NotificationProvider) {
    NotificationProvider.setOptions({
	delay: 4000,
	startTop: 20,
	startRight: 10,
	verticalSpacing: 20,
	horizontalSpacing: 20,
	positionX: 'left',
	positionY: 'bottom',
	templateUrl: '/templates/notification_template.html'
    });
});

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}]);

app.config(function ($httpProvider) {
	$httpProvider.interceptors.push([
	    '$injector',
	    function ($injector) {
		return $injector.get('AuthInterceptor');
	    }
	]);
})


app.run(function ($rootScope, AUTH_EVENTS, AuthService, $state, $cookies, Notification) {
    $rootScope.nextState = undefined;
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event, next){
	event.preventDefault();
	$cookies.remove('connect.sid');
	$cookies.remove('user_info');
	$state.go('login')
    });

    $rootScope.$on(AUTH_EVENTS.requestFailed, function(event, next){
	event.preventDefault();
	console.log('request failed')
	Notification.error('HTTP REQUEST FAILED! THIS IS BAD')
    });

    $rootScope.$on('$stateChangeStart', function (event, next) {
	if (!AuthService.isAuthenticated() && (next.name == 'add_matches' || next.name == 'challenges' || next.name == 'main' )) {
	    event.preventDefault();
	    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
	    $rootScope.nextState = next
	} else {
	    
	}
    });
});

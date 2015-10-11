var app = angular.module('pplChallenge', ['ngAutodisable','ngResource']);

app.factory('validChallenges', function($resource){
    return $resource('challengeChallenge/:userId',
		     {},
		     { get: {
			 method:'GET',timeout:6000, isArray:true
		     }, save: {
			 method:'POST',timeout:6000					   
		     }}
		    )
});

app.factory('validUsers', function($resource){
    return $resource('challengeUser/:userId',
		     {userId:'@_id'},
		     {get: {
			 method:'GET',timeout:6000
		     }, save: {
			 method:'POST',timeout:6000
		     }
		     })
});


app.controller('TestController',
	       function ($scope,
			 $http,
			 $q,
			 validUsers,
			 validChallenges)
	       {
		   $scope.test = function(){
		       console.log('okie dokie')
		       return $q(function(){})
		   }
		   $scope.validUsers = validUsers
		   $scope.validChallenges = validChallenges
		   $scope.validUsers.query().$promise.then(function(data){
		       $scope.user_stuff = data;
		       $scope.validChallenges.save({challenger_id:data[0]._id,
						    challenged_id:data[0]._id,
						    machine: 'oops'
						   }).$promise.then(function(data){
						       $scope.validChallenges.get({userId:$scope.user_stuff[0]._id}).$promise.then(function(data){
							   console.log(data[0])
							   console.log(data.length)
						       })
						   })
		       console.log(data[0].local.username)
		       
		   })
	       })


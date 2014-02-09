angular.module("ShortlyApp", ['ngRoute'])

.config(function($routeProvider, $locationProvider){
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/', {
      controller: 'FrameController',
      templateUrl: 'templates/home.html'
    })
    .when('/stats/:linkId', {
      controller: 'statsController',
      templateUrl: '/templates/stats.html'
    });
})

.controller('RedirectController', function($location, $routeParams){
  console.log('redirect');
  $location.$routeParams.urlCode;
})

.service('LinkService', function($http){
  this.getLinks = function(){
    return $http({
        method: 'GET', 
        url: '/links'
      }) 
  };
  this.createLink = function(url){
     return $http({
      method:'POST',
      url: '/links',
      data: { url : url }
    })
  }
})
.run(function($rootScope){
  //run on load
})

.controller('FrameController', function($scope, LinkService){
  LinkService.getLinks()
  .then(function(res){
    $scope.links = res.data;
  });

  $scope.addUrl = function(url){
    if($scope.urlForm.$valid){
    
    LinkService.createLink(url)
    .success(function(data, status){
      console.log(data + " " + status);;

    })
    .error(function(){
      console.log('an error on your post has occured')
    })
    debugger;
    $scope.urlForm.url = '';
    
    }
  };

})
.controller('statsController', function($scope, $http, $routeParams){
  $scope.rawdata = {};
  $scope.linkId = $routeParams;

  $http({
    method: 'GET',
    url: '/clicks/'+$scope.linkId.linkId
  })
  .then(function(res){
    debugger; 
    $scope.rawdata = res.data;
  })
  .then(function(){
    console.log($scope.rawdata);
  })
  .catch(function(res){
    console.log(res);
  })
});
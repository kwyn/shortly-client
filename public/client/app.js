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
  $scope.displayData = {};
  $scope.linkId = $routeParams;
  $scope.graphObject = [];
  $http({
    method: 'GET',
    url: '/clicks/'+$scope.linkId.linkId
  })
  .then(function(res){ 
    console.log(res);
    $scope.rawdata = res.data;
  })
  .then(function(){
    var origin = new Date ($scope.rawdata[0].created_at);
    var current = 0;
    var timeElapsed = 0;
    var group = 0;
    debugger;
    _.each($scope.rawdata, function(click){
      current = new Date (click.created_at);
      timeElapsed = (current - origin) / 1000 / 60;
      //change 5 to a variable to get different minute groupings.
      group = Math.ceil(timeElapsed/5);
      $scope.displayData[group] ? $scope.displayData[group]++ : $scope.displayData[group] = 1;
    })
    var time;
    var graphValues= [];
    _.each($scope.displayData, function(value, key){
      time = origin + (parseInt(key)*1000*60*5);
      graphValues.push({'label': ""+time, 'value': value});
    })
    $scope.graphObject = [{'key':"Cumulative Return", 'values': graphValues }];
    console.log($scope.graphObject);

    nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
        .x(function(d) { return d.label })
         .y(function(d) { return d.value })
         .staggerLabels(true)
         .tooltips(false)
         .showValues(true)
   
     d3.select('#chart svg')
         .datum($scope.graphObject)
       .transition().duration(500)
         .call(chart);
   
     nv.utils.windowResize(chart.update);
   
     return chart;
   });
    
  })
  .catch(function(res){
    console.log(res);
  })

  
   
});
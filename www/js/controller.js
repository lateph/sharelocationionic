angular.module('starter.controllers', ['ionic'])
.controller('MapCtrl', function($scope, $timeout, $cordovaGeolocation) {
// Code will be here
	$scope.mapOptions = {
		// lat : -7.9658149,
		// lng : 112.622488,

		latlng : {
			lat : -6.2293867,
			lng : 106.689428,
		},
		zoom : 16,
		palaces : [],
		keyword : '',
		selectedId : '',
		reload : false,
	}
	$scope.model = {
		keyword : '',
		accuracy : '',
	};

	var posOptions = {timeout: 10000, enableHighAccuracy: false};
	$cordovaGeolocation
	    .getCurrentPosition(posOptions)
	    .then(function (position) {
	    	$scope.mapOptions.latlng = {
				lat : position.coords.latitude,
				lng : position.coords.longitude,
			}
			$scope.mapOptions.reload = true;
			$scope.model.accuracy = position.coords.accuracy;
	    }, function(err) {
	      	alert("failed to get cordinat");
	    });

	var watchOptions = {
	    timeout : 3000,
	    enableHighAccuracy: false // may cause errors if true
	};

	var watch = $cordovaGeolocation.watchPosition(watchOptions);
	watch.then(
		null,
		function(err) {
		  // error
		},
		function(position) {
			console.log(position.coords);
			$scope.mapOptions.latlng = {
				lat : position.coords.latitude,
				lng : position.coords.longitude,
			}
			$scope.model.accuracy = position.coords.accuracy;
		}
	);

	$scope.search = function(){
		$scope.mapOptions.keyword = $scope.model.keyword;
	}

	$scope.sendPalace = function(palace){
		alert("terpilih : "+palace.geometry.location.lat()+':'+palace.geometry.location.lng());
		console.log(palace);
	}

	$scope.sendCurrentLocation = function(){
		alert("terpilih : "+$scope.mapOptions.latlng.lat+':'+$scope.mapOptions.latlng.lat);
	}
})
.directive('map', function($ionicPosition, $ionicScrollDelegate) {
    return {
        restrict: 'A',
        scope: {
	        options: '='
	    },
        link:function(scope, element, attrs){
			var zValue = scope.options.zoom;
			var lat = scope.options.latlng.lat;
			var lng = scope.options.latlng.lng;

			var myLatlng = new google.maps.LatLng(lat,lng),
          	mapOptions = {
                zoom: zValue,
                center: myLatlng
            };
            var map = new google.maps.Map(element[0],mapOptions);

            var mainMarker = new google.maps.Marker({
		      map: map,
		      position: myLatlng,
		      icon: 'img/blue-dot.png'
		    });

            var markers = [];

            function attachSecretMessage(marker, idelemen) {
			  marker.addListener('click', function() {
				scope.options.selectedId = idelemen;
				scope.$parent.$apply();

				for (var i = markers.length - 1; i >= 0; i--) {
					if(markers[i].icon == 'img/red-dot.png'){
						markers[i].setIcon('img/green-dot.png');
					}
				}
				marker.setIcon('img/red-dot.png');

			    var _element = document.getElementById('palace-'+idelemen);
				var quotePosition = $ionicPosition.position(angular.element(_element));
				$ionicScrollDelegate.$getByHandle('palaceScroll').scrollTo(quotePosition.left, quotePosition.top, true);
			  });
			}

            // bank, mall, atm, tempat makan, toko buku, toko elektronik, air p
            

            var service = new google.maps.places.PlacesService(map);

            var reloadPlace = function(){
            	var request = {
					location: new google.maps.LatLng(scope.options.latlng.lat,scope.options.latlng.lng),
					radius: '500',
					keyword : scope.options.keyword,
					// types: ['store']
				};

            	service.nearbySearch(request, function(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						for (var j = 0; j < markers.length; j++) {
						    markers[j].setMap(null);
						}
						markers = [];

						for (var i = 0; i < results.length; i++) {
						    var place = results[i];
						    if(results[i].photos){
						    	results[i].myImages = results[i].photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100});
						    }
						    else{
						    	results[i].myImages = results[i].icon;
						    }

						    var marker = new google.maps.Marker({
						      map: map,
						      position: place.geometry.location,
						      icon: 'img/green-dot.png'
						    });

						    attachSecretMessage(marker, results[i].id);
						    // marker.addListener('click',telekxx(i));

						    markers.push(marker);
					  	}
					}

					scope.options.palaces = results;
					scope.$parent.$apply();
				});
            }

			scope.$watch('options.latlng', function (val) {
	          if (val) {
	            map.setCenter(new google.maps.LatLng(val.lat,val.lng));
	            console.log("new Marker posision");
	            mainMarker.setPosition(new google.maps.LatLng(val.lat,val.lng));
	          }
	        }, true);

 			scope.$watch('options.keyword', function (val) {
	            reloadPlace();
	        })

	        scope.$watch('options.reload', function (val) {
	            if(val){
		            reloadPlace();
		            scope.options.reload = false;            	
	            }
	        })
        }
    };
});
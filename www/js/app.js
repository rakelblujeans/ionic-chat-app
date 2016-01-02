var firebaseUrl = "https://glowing-heat-8282.firebaseio.com/";

function onDeviceReady() {
    angular.bootstrap(document, ["starter"]);
}
//console.log("binding device ready");
// Registering onDeviceReady callback with deviceready event
document.addEventListener("deviceready", onDeviceReady, false);

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'firebase', 'starter.controllers', 'starter.services'])

.run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    ionic.Platform.fullScreen();

    $rootScope.firebaseUrl = firebaseUrl;
    $rootScope.displayName = null;

    Auth.$onAuth(function (authData) {
        if (authData) {
            console.log("Logged in as:", authData.uid);
            var ref = new Firebase(firebaseUrl);
            ref.child("users").child(authData.uid).once('value', function (snapshot) {
            var val = snapshot.val();
            // To Update AngularJS $scope either use $apply or $timeout
            $rootScope.$apply(function () {
              $rootScope.displayName = val;
            });
          });
        } else {
            console.log("Logged out");
            $ionicLoading.hide();
            $location.path('/login');
        }
    });

    $rootScope.logout = function () {
        console.log("Logging out from the app");
        $ionicLoading.show({
            template: 'Logging Out...'
        });
        Auth.$unauth();
    }


    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $location.path("/login");
        }
    });
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  console.log("setting config");
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'LoginCtrl',
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth",
          function (Auth) {
            // $waitForAuth returns a promise so the resolve waits for it to complete
            return Auth.$waitForAuth();
        }]
      }
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
    resolve: {
      // controller will not be loaded until $requireAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth",
        function (Auth) {
          // $requireAuth returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          return Auth.$requireAuth();
      }]
    }
  })

  .state('app.rooms', {
    url: '/rooms',
    views: {
      'menuContent': {
        templateUrl: 'templates/rooms.html',
        controller: 'RoomsCtrl'
      }
    }
  })

  .state('app.chat', {
    url: '/chat/:roomId',
    views: {
      'menuContent': {
        templateUrl: 'templates/chat.html',
        controller: 'ChatCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

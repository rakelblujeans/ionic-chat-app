angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
  //console.log('Login Controller Initialized');
  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref);

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.createUser = function (user) {
    console.log("Create User Function called");
    if (user && user.email && user.password && user.displayname) {
      $ionicLoading.show({
        template: 'Signing Up...'
      });

      auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function (userData) {
        //alert("User created successfully!");
        ref.child("users").child(userData.uid).set({
            email: user.email,
            displayName: user.displayname
        });
        $ionicLoading.hide();
        $scope.modal.hide();
        $state.go('app.rooms');
      }).catch(function (error) {
        alert("Error: " + error);
        $ionicLoading.hide();
      });
    } else
      alert("Please fill all details");
  }

  $scope.signIn = function (user) {
    if (user && user.email && user.pwdForLogin) {
      $ionicLoading.show({
        template: 'Signing In...'
      });
      auth.$authWithPassword({
        email: user.email,
        password: user.pwdForLogin
      }).then(function (authData) {
        console.log("Logged in as:" + authData.uid);
        ref.child("users").child(authData.uid).once('value', function (snapshot) {
          var val = snapshot.val();
          // To Update AngularJS $scope either use $apply or $timeout
          $scope.$apply(function () {
            $rootScope.displayName = val;
          });
        });
        $ionicLoading.hide();
        $state.go('app.rooms');
      }).catch(function (error) {
        alert("Authentication failed:" + error.message);
        $ionicLoading.hide();
      });
    } else
      alert("Please enter email and password both");
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('ChatCtrl', function ($scope, Chats, $state, $rootScope) {
    console.log("Chat Controller initialized", $rootScope.displayName, $scope);

    $scope.IM = {
        textMessage: ""
    };

    Chats.selectRoom($state.params.roomId);
    var roomName = Chats.getSelectedRoomName();
    console.log('roomName', roomName)
    // Fetching Chat Records only if a Room is Selected
    if (roomName) {
        $scope.roomName = " - " + roomName;
        $scope.chats = Chats.all();
    }

    $scope.sendMessage = function (msg) {
        console.log(msg);
        Chats.send($rootScope.displayName, msg);
        $scope.IM.textMessage = "";
    }

    $scope.remove = function (chat) {
        Chats.remove(chat);
    }
})

.controller('RoomsCtrl', function ($scope, $ionicModal, $ionicLoading, Rooms, Chats, $state) {

  $ionicModal.fromTemplateUrl('templates/newRoom.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.rooms = Rooms.all();

  $scope.openChatRoom = function (roomId) {
    console.log(roomId);
    $state.go('app.chat', {
      roomId: roomId
    });
  }

  $scope.addRoom = function(roomName) {
    $ionicLoading.show({
      template: 'Creating room...'
    });

    Rooms.add(roomName);

    $ionicLoading.hide();
    $scope.modal.hide();
  }
});

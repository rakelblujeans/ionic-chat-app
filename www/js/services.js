angular.module('starter.services', ['firebase'])

.factory("Auth", ["$firebaseAuth", "$rootScope",
	function ($firebaseAuth, $rootScope) {
	  var ref = new Firebase(firebaseUrl);
	  return $firebaseAuth(ref);
}])

.factory('Rooms', function ($firebaseArray) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
    var rooms = $firebaseArray(ref.child('rooms'));

    return {
        all: function () {
            return rooms;
        },
        get: function (roomId) {
            // Simple index lookup
            return rooms.$getRecord(roomId);
        },
        add: function(roomName) {
            rooms.$add({'name': roomName});
        }
    }
})

.factory('Chats', function ($firebaseArray, Rooms) {

    var selectedRoomId;

    var ref = new Firebase(firebaseUrl);
    var chats;

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.$remove(chat).then(function (ref) {
                ref.key() === chat.$id; // true item has been removed
            });
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        getSelectedRoomName: function () {
            var selectedRoom;
            if (selectedRoomId && selectedRoomId != null) {
              selectedRoom = Rooms.get(selectedRoomId);
              if (selectedRoom)
                return selectedRoom.name;
              else
                return null;
            } else
              return null;
        },
        selectRoom: function (roomId) {
            console.log("selecting the room with id: " + roomId);
            selectedRoomId = roomId;
            console.log(selectedRoomId);
            //if (!isNaN(roomId)) {
                //chats = $firebaseArray(ref.child('rooms').child(selectedRoomId).child('chats'));
                var roomItem = $firebaseArray(ref.child('rooms')).$getRecord(selectedRoomId);
                console.log('roomItem', roomItem);
                chats = $firebaseArray(ref.child(selectedRoomId))
                console.log('got room chats');
            //}
        },
        send: function (from, message) {
            console.log("sending message from :" + from.displayName + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from.displayName,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                chats.$add(chatMessage).then(function (data) {
                    console.log("message added");
                });
            }
        }
    }
});
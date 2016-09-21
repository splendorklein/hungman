'use strict';
var hungmanApp = hungmanApp || {};

hungmanApp.controllers = angular.module('gameControllers', []);

hungmanApp.controllers.controller('RootCtrl',
    ['$scope', '$rootScope', function ($scope,$rootScope) {
        
        $scope.initRoot = function () {  
          
          $scope.initGame();
          document.getElementById("ratefeld").innerHTML = "";
          var request = gapi.client.hangman.get_user_rankings();
          request.execute(function (response) {
          var l = response.users.length;
          l = Math.min(l,3)
          var text = "Best Players:<br>";
          var p = document.getElementById("input_greet_generically"); 
          for (var i = 0;i<l;i++){
            text += "Name: " + response.users[i].name + "<br>";
            text += "Score: " + response.users[i].performance + "<br>";
            text += "<br>";
          }  
          p.innerHTML = text;
          });
        };
        
        $scope.initGame = function () {  
          $rootScope.loggined = false;
          $rootScope.profile = {};
          $rootScope.game = [];
          $rootScope.gameUrl = "";

          $rootScope.gameloaded = false;
          $rootScope.gameCreate = false;
          document.getElementById("ratefeld").innerHTML = "";

        };

        $scope.loadGame = function (gamedata) {  

            if (gamedata.length != 0){

                $rootScope.gameUrl = gamedata[0].urlsafe_key;
                var historyReq = {
                                   urlsafe_game_key : $rootScope.gameUrl,
                                   user_name : $rootScope.profile.user_name,
                                   email : $rootScope.profile.email
                };


                var request = gapi.client.hangman.get_game_history(
                  historyReq);

                request.execute(function (response) {
                    
                  document.getElementById("gerateneBuchstaben").innerHTML = "History: " + response.moves;
                });               
                document.getElementById("ratefeld").innerHTML = "";
                var lsgwort = gamedata[0].currentword;
                var ratewort = new Array(lsgwort.length);
                var fehler = 0;
                for (var i = 0; i < ratewort.length; i++){
                  ratewort[i] = lsgwort[i] + " ";
                }
                var ratefeld = document.getElementById("ratefeld");
                for (var j = 0; j < ratewort.length; j++){
                    var buchstabe = document.createTextNode(ratewort[j]);
                    ratefeld.appendChild(buchstabe);
                }
                var attempts_remaining = gamedata[0].attempts_remaining;
                var hungPic = 5 - attempts_remaining;
                var hungPicUrl = '<br/><img src="https://linmaocong.com/hangman/pic?num=' + hungPic + '"><br/>';
                var div = document.createElement("DIV"); 
                div.innerHTML = hungPicUrl;
                ratefeld.appendChild(div);


                $rootScope.gameloaded = true;                
            }
            

        };
    }]
);

hungmanApp.controllers.controller('SignInCtrl',
    ['$scope', '$rootScope',function ($scope,$rootScope) {

      $scope.loading = false;
      $scope.initSignIn = function (){

        $scope.messages = "";
        

      };
      
      $scope.loggin = function (){
        var f = document.logginform;
        
        $rootScope.profile.user_name = f.elements["user_name"].value;
        $rootScope.profile.email =  f.elements["email"].value;
        
        var request = gapi.client.hangman.get_user_games(
          $rootScope.profile);
        
        request.execute(
            function(response){
              $scope.$apply(function () {
                if (response.message == "Get game successfully!"){
                  $scope.messages= "Loggin successfully! " + "Welcome, " + $rootScope.profile.user_name + " !";
                  $rootScope.loggined = true;
                  $rootScope.game = response.games;
                  $scope.loadGame($rootScope.game);
                }
                else if (response.message == "The user has no active game!"){
                  $scope.messages= "Loggin successfully! " + "Welcome, " + $rootScope.profile.user_name + " !";
                  $rootScope.loggined = true;
                  $rootScope.game = []
                  $scope.loadGame($rootScope.game);
                                    
                }
                else {
                  $scope.messages = response.message;
                }
              });
            }
        );
      };
      $scope.signup = function (){
        var f = document.logginform;
        
        $rootScope.profile.user_name = f.elements["user_name"].value;
        $rootScope.profile.email =  f.elements["email"].value;
        
        var request = gapi.client.hangman.create_user(
          $rootScope.profile);
        
        request.execute(
            function(response){
              $scope.$apply(function () {
                if (response.message.includes('created!')){
                  $scope.messages= response.message;
                  $rootScope.loggined = true;
                  $rootScope.game = [];
                  $scope.loadGame($rootScope.game);
                }
                else {
                  $scope.messages = response.message;
                }
              });
            }
        );
      };
/*
        var request = gapi.client.hangman.get_user_scores(
          $rootScope.profile);
        
        request.execute(
            function(response){
              $scope.$apply(function () {
                if (response.message == "Get game successfully!"){


                  $scope.messages= ;

                }
                else{

                  $scope.messages = response.message;
                }
              });
            }
        );
      };
*/

      $scope.logout = function (){
        $scope.initGame();
        $rootScope.loggined = false;
        $scope.messages= "Log out successfully!";
      };




    }]
);

hungmanApp.controllers.controller('GameCtrl',
    ['$scope', '$rootScope',function ($scope,$rootScope) {
        $scope.gameOver = false;
        $scope.newGame = function () {  
            
            var request = gapi.client.hangman.new_game(
              $rootScope.profile);
            
            request.execute(
                function(response){
                  $scope.$apply(function () {
                      $scope.gameOver = false;
                      $scope.gamemessages = response.message;
                      $rootScope.game = response.games;
                      $scope.loadGame($rootScope.game);

                  });
                }
            );
        };

        $scope.makeMove = function () {  
            var guessMade = document.getElementById("ratezeichen").value;
            document.getElementById("ratezeichen").value = '';
            var ratezeichen = {guess : guessMade,
                               urlsafe_game_key : $rootScope.gameUrl,
                               user_name : $rootScope.profile.user_name,
                               email : $rootScope.profile.email};
            var request = gapi.client.hangman.make_move(
              ratezeichen);
            
            request.execute(
                function(response){
                  $scope.$apply(function () {
                      console.log(response)
                      if (response.message.includes("Made move!")){
                          $scope.gamemessages = response.games[0].message;
                          $rootScope.game = response.games;
                          if (response.games[0].game_over){

                              $scope.gameOver = true; 
                              console.log("detected game over")
                          }
                          $scope.loadGame($rootScope.game); 

                      }
                      else{
                          $scope.gamemessages = response.message;
                      }

                  });
                }
            );
        };


    }]
);

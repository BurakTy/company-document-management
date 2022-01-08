app.controller("loginController", ['$scope', '$rootScope', '$location', 'AuthenticationService', function ($scope, $rootScope, $location, AuthenticationService, $cookieStore) {

    AuthenticationService.ClearCredentials();
    $scope.Login = function (u) {
        $scope.dataLoading = true;
        AuthenticationService.Login(u.Kullanici, u.Parola, function (response) {
            if (response.success) {
                AuthenticationService.SetCredentials(u.Kullanici);
                $location.path("/");
            } else {
                $scope.error = response.message;
                alertify.alert('', $scope.error , function () { });
                $scope.dataLoading = false;
            }
        });
    }
}]);
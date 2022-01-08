app.factory('AuthenticationService',
    ['$http', '$cookieStore', '$rootScope',
        function ($http, $cookieStore, $rootScope) {
            var service = {};

            service.Yetkicheck = function (a) {
                console.log(a);
            }

            service.Login = function (email, password, callback) {

                $http.post('DocService.asmx/Login', { email: email, password: password })
                    .success(function (response) {
                        $cookieStore.put('menu', response.d.Data);
                        $rootScope.Menu = response.d.Data;
                        callback(response.d);
                    });

            };

            service.SetCredentials = function (email) {
                var authdata = $cookieStore.get('global') || {};

                $rootScope.globals = {
                    currentUser: {
                        email: email,
                        authdata: authdata
                    }
                };

                $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                $cookieStore.put('globals', $rootScope.globals);
            };

            service.ClearCredentials = function () {
                $rootScope.globals = {};
                $rootScope.Menu = {};
                $cookieStore.remove('global');
                $cookieStore.remove('globals');
                $cookieStore.remove('menu');
                //$cookieStore.remove('refr');     
                
                $http.defaults.headers.common.Authorization = 'Basic ';
            };

            return service;
        }])

    
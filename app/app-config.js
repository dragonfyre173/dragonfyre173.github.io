(function() {
    angular.module('app')
        .config(['$routeProvider', function($routeProvider) {
            //$httpProvider.defaults.useXDomain = true;
            //delete $httpProvider.defaults.headers.common['X-Requested-With'];
            $routeProvider
                .when('/',{
                    templateUrl: 'app/views/partials/tpl-method-overview.html',
                    controller: 'MainController',
                    controllerAs: 'mainCtrl'
                })
                .when('/items',{
                    templateUrl: 'app/views/partials/tpl-item-database.html',
                    controller: 'ItemDatabaseController',
                    controllerAs: 'dbCtrl'
                })
                .otherwise({
                    redirectTo: '/'
                })

        }])

})();0
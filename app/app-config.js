(function() {
    angular.module('app')
        .config(['$routeProvider', function($routeProvider) {
            //$httpProvider.defaults.useXDomain = true;
            //delete $httpProvider.defaults.headers.common['X-Requested-With'];
            $routeProvider
                .when('/methods',{
                    templateUrl: 'app/views/partials/method-overview-tpl.html',
                    controller: 'MainController',
                    controllerAs: 'mainCtrl'
                })
                .when('/items',{
                    templateUrl: 'app/views/partials/item-database-tpl.html',
                    controller: 'ItemDatabaseController',
                    controllerAs: 'dbCtrl'
                })
                .otherwise({
                    redirectTo: '/methods'
                })

        }])

})();0
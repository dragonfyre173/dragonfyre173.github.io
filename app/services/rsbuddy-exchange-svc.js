(function() {
    angular.module('app')
        .factory('GrandExchange', ['$http', GrandExchange]);


    function GrandExchange($http) {
        var _factory = this;
        var _service = { };

        _factory.guide = 'https://api.rsbuddy.com/grandExchange?a=guidePrice&i=';

        _service.getGuidePrice = function(item) {
            return $http.get(_factory.guide + item).then(function(response) {
                return response.data;
            });
        };

        return _service;
    };
})();
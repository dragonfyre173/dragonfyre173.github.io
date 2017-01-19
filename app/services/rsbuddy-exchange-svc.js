(function() {
    angular.module('app')
        .factory('GrandExchange', ['$http', GrandExchange]);


    function GrandExchange($http) {
        var _factory = this;
        var _service = { };

        _factory.cached = { };

        _factory.guide = 'https://api.rsbuddy.com/grandExchange?a=guidePrice&i=';

        _service.getGuidePrice = function(item) {
            if(item in _factory.cached) {
                return _factory.cached[item];
            } else {
                return $http.get(_factory.guide + item).then(function (response) {
                    _factory.cached[item] = response.data.overall;
                    return response.data.overall;
                });
            }
        };

        return _service;
    };
})();
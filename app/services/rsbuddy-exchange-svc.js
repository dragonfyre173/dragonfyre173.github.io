(function() {
    angular.module('app')
        .factory('GrandExchange', ['$http', '$q', '$timeout', GrandExchange]);

    function formatString(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    }

    function GrandExchange($http, $q, $timeout) {
        var _factory = this;
        var _service = { };

        _factory.cached = { };

        _factory.guide = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'https%3A%2F%2Fapi.rsbuddy.com%2FgrandExchange%3Fa%3DguidePrice%26i%3D{0}'&format=json&callback=";

        _service.getGuidePrice = function(item, forceUpdate) {

            if(!forceUpdate && item in _factory.cached) {
                return _factory.cached[item];
            } else {
                var counter = 0;
                var queryResults = $q.defer();
                _factory.cached[item] = queryResults.promise;
                (function itemQuery() {
                    $http.get(formatString(_factory.guide, item)).then(function (response) {
                        if("json" in response.data.query.results) {
                            _factory.cached[item] = response.data.query.results.json.overall;
                            queryResults.resolve(response.data.query.results.json.overall);
                        }
                    }).catch(function(){
                        if(counter < 5) {
                            counter++;
                            $timeout(itemQuery(), 1000 * counter);
                        }
                    });
                })();
                return queryResults.promise;
            }
        };

        return _service;
    };
})();
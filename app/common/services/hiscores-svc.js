(function() {
    angular
        .module('app')
        .factory('Hiscores', ['$http', Hiscores]);

    function formatString(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    }

    function Hiscores($http) {
        var _factory = this;
        var _service = { };

        _factory.headers = [
            "Total", "Attack", "Defence", "Strength",
            "Hitpoints", "Ranged", "Prayer", "Magic",
            "Cooking", "Woodcutting", "Fletching", "Fishing",
            "Firemaking", "Crafting", "Smithing", "Mining",
            "Herblore", "Agility", "Thieving", "Slayer",
            "Farming", "Runecrafting", "Hunter", "Construction"
        ];

        _factory.baseUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fservices.runescape.com%2Fm%3Dhiscore_oldschool%2Findex_lite.ws%3Fplayer%3D{0}'&format=json&diagnostics=true&callback=yqlParseHiscores";


        _service.getPlayer = function(name) {
            return $http.get(formatString(_factory.baseUrl, "lord_lothric"), {

            }).then(function(response){
                return response.data.results;
            });
        }
//        _service.getPlayer = function(name) {
//            return $http.get(String.format(_factory.baseUrl,name)).then(function(response) {
//                var raw = response.data;
//                var obj = { };
//
//                var lines = raw.split('\n');
//
//                for(var i = 0; i < _factory.headers.length; i++) {
//                    var line = lines[i].split(',');
//                    obj[_factory.headers[i]] = {
//                        rank: line[0],
//                        level: line[1],
//                        exp: line[2]
//                    }
//                }
//
//                return obj;
//            });
//        };
        return _service;
    };

})();
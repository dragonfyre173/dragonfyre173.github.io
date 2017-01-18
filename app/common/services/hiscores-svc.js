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

    function parseHiscores(yqlResponse) {
        var headers = [
            "Total", "Attack", "Defence", "Strength",
            "Hitpoints", "Ranged", "Prayer", "Magic",
            "Cooking", "Woodcutting", "Fletching", "Fishing",
            "Firemaking", "Crafting", "Smithing", "Mining",
            "Herblore", "Agility", "Thieving", "Slayer",
            "Farming", "Runecrafting", "Hunter", "Construction"
        ];

        var data = yqlResponse.results;

        var results = { };

        for(var i = 0; i < headers.length; i++) {
            var hsEntry = data[i];
            results[headers[i]] = {
                rank: hsEntry.col0,
                level: hsEntry.col1,
                exp: hsEntry.col2
            }
        }

        return results;
    }

    function Hiscores($http) {
        var _factory = this;
        var _service = { };



        _factory.baseUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fservices.runescape.com%2Fm%3Dhiscore_oldschool%2Findex_lite.ws%3Fplayer%3D{0}'&format=json&diagnostics=true&callback=";

        _service.getPlayer = function(name) {
            return $http.get(formatString(_factory.baseUrl, "lord_lothric"), {

            }).then(function(response){
                return parseHiscores(response.data);
            });
        }
        return _service;
    };

})();
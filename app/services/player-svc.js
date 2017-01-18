(function() {
    angular.module('app')
        .factory('PlayerService', ['$http', PlayerServiceFactory]);

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

        var data = yqlResponse.query.results.row;

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

    function PlayerServiceFactory($http) {
        var _factory = this;
        var _service = {
            name: '',
            income: 500000,
            hiscores: { }
        };

        _factory.baseUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fservices.runescape.com%2Fm%3Dhiscore_oldschool%2Findex_lite.ws%3Fplayer%3D{0}'&format=json&diagnostics=true&callback=";


        _service.updateHiscores = function() {
            var uriName = encodeURI(encodeURI(_service.name))
            // 1. Get via YQL api
            return $http
            .get(formatString(_factory.baseUrl, uriName))
            .then(function(response){
            // 2. Ensure the results are valid
                if("http-status-code" in response.data.query.diagnostics.url) {
                    _service.hiscores = {
                        err: true
                    }
                } else {
                    // 3. Parse the hiscores
                   _service.hiscores = parseHiscores(response.data);
                }
            });
        };

        _service.getProductivity = function(tm) {
            // 1. Calculate total cost (or profit) per hour of training method
            var costPerHour = tm.profit * tm.actionsPerHour;
            // 2. Calculate total hours spent for one hour of training
            var hoursPerIncome = 1 + (-1 * costPerHour / _service.income);
            // 3. Calculate effective XP per hour
            var effectiveXph = (tm.experiencePerAction * tm.actionsPerHour) / hoursPerIncome;
            return effectiveXph;
        }

        return _service;
    }

})();
(function() {
    angular.module('app')
        .factory('PlayerService', ['$http', '$q', '$timeout', PlayerServiceFactory]);

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
                rank: parseInt(hsEntry.col0),
                level: parseInt(hsEntry.col1),
                exp: parseInt(hsEntry.col2)
            }
        }

        return results;
    }

    function PlayerServiceFactory($http, $q, $timeout) {
        var _factory = this;
        var _service = {
            name: '',
            income: 500000,
            incomeMultiplier: 1,
            hiscores: false
        };

        _service.getIncome = function() {
            return _service.income * _service.incomeMultiplier;
        }

        _factory.baseUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fservices.runescape.com%2Fm%3Dhiscore_oldschool%2Findex_lite.ws%3Fplayer%3D{0}'&format=json&diagnostics=true&callback=";

        _service.xpTable = false;

        $http.get('data/experience-table.json').then(function(response) {
            _service.xpTable = response.data;
        });

        _service.levelFromXp = function(exp, virtual) {
            if(_service.xpTable) {
                var maxLevel = virtual ? 126 : 99;
                for(var i = Math.min(maxLevel, _service.xpTable.length); i > 0 ; i--) {
                    if(_service.xpTable[i] <= exp) {
                        return i;
                    }
                }
                return 1;
            } else {
                return -1;
            }
        };

        _service.updateHiscores = function() {
            var uriName = encodeURI(encodeURI(_service.name));
            var counter = 0;
            var queryResults = $q.defer();
            // 1. Get via YQL api
            (function lookupQuery() {
                $http
                .get(formatString(_factory.baseUrl, uriName))
                .then(function (response) {
                    // 2. Ensure the results are valid
                    if ("http-status-code" in response.data.query.diagnostics.url) {
                        _service.hiscores = false;
                    } else {
                        // 3. Parse the hiscores
                        _service.hiscores = parseHiscores(response.data);
                    }
                    queryResults.resolve(response);
                })
                .catch(function () {
                    if (counter < 5) {
                        counter++;
                        // Wait between failed requests
                        $timeout(lookupQuery(), 1000 * counter);
                    }
                });
            })();

            return queryResults.promise;
        };

        return _service;
    }

})();
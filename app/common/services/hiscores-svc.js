(function() {
    angular
        .module('app')
        .factory('Hiscores', ['$http', Hiscores]);

    function Hiscores($http) {
        var _factory = this;
        var _service = { };

        if (!String.format) {
          String.format = function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) {
              return typeof args[number] != 'undefined'
                ? args[number]
                : match
              ;
            });
          };
        }

        _factory.headers = [
            "Total", "Attack", "Defence", "Strength",
            "Hitpoints", "Ranged", "Prayer", "Magic",
            "Cooking", "Woodcutting", "Fletching", "Fishing",
            "Firemaking", "Crafting", "Smithing", "Mining",
            "Herblore", "Agility", "Thieving", "Slayer",
            "Farming", "Runecrafting", "Hunter", "Construction"
        ];

        _factory.baseUrl = "http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player={0}";


        _service.getPlayer = function(name) {
            return $http.post('ajax/hiscores.php?user='+name, {

            }).then(function(response){
                return response.data;
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
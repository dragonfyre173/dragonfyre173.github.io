(function(){
    angular.module('app')
        .controller('ItemDatabaseController', ['$http', ItemDatabaseController]);

    function ItemDatabaseController($http) {
        var _ctrl = this;

        _ctrl.ready = false;
        _ctrl.items = [];

        _ctrl.sortType = 'id';
        _ctrl.sortReverse = false;
        _ctrl.searchName = '';

        $http.get('data/rsbuddy-names.json').then(function(response) {
            var keys = Object.keys(response.data);
            for(var i = 0; i < keys.length; i++) {
                _ctrl.items.push({
                    id: parseInt(keys[i]),
                    name: response.data[keys[i]].name
                })
            }
            _ctrl.ready = true;
        });
    };
})();
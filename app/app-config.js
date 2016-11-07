(function() {
    angular
        .module('app')
        .controller('TestCtrl', ['Hiscores', 'GrandExchange', TestCtrl])
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }])

    function TestCtrl(Hiscores, GrandExchange) {
        var ctrl = this;
        ctrl.names = { }
        ctrl.player = { }
        GrandExchange.getPriceGuide(41).then(function(data){
           ctrl.names = data;
        });
        Hiscores.getPlayer('Lord Lothric').then(function(data){
            ctrl.player = data;
        });

    }
})();
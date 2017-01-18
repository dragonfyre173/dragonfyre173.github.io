(function(){
    angular.module('app')
        .factory('TrainingMethods', ['$http', TrainingMethodsFactory]);

    function TrainingMethodsFactory($http){
        var _service = { };
        var _factory = this;

        _service.ready = false;
        _service.trainingMethods = { };
        _service.skills = [ ];

        // 1. Get entire training-methods.json
        $http.get('data/training-methods.json').then(function(response){
            _service.trainingMethods = response.data;
            _service.skills = Object.keys(response.data);
            _service.ready = true;
        });

        return _service;
    }
})();
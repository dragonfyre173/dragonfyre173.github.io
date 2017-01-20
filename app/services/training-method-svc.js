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
            // 2. Set each training method's respective level
            for(var i = 0; i < _service.skills.length; i++) {
                var skill = _service.skills[i];
                for(var j = 0; j < _service.trainingMethods[skill].length; j++) {
                    if("requirements" in _service.trainingMethods[skill][j]) {
                        _service.trainingMethods[skill][j].level = _service.trainingMethods[skill][j].requirements[skill] || 1;
                    } else {
                        _service.trainingMethods[skill][j].level = 1;
                    }
                }
            }
            _service.ready = true;
        });

        return _service;
    }
})();
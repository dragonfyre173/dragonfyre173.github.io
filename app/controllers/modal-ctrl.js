(function(){
    angular.module('app')
        .controller('ModalInstanceController', ['$uibModalInstance', 'trainingMethod', ModalInstanceController]);

    function ModalInstanceController($uibModalInstance, trainingMethod){
        var _ctrl = this;
        _ctrl.trainingMethod = trainingMethod;
    }
})();
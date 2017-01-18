(function(){
    angular.module('app')
        .controller('ModalInstanceCtrl', ['$uibModalInstance', 'trainingMethod', ModalInstanceCtrl]);

    function ModalInstanceCtrl($uibModalInstance, trainingMethod){
        var _ctrl = this;
        _ctrl.trainingMethod = trainingMethod;
    }
})();
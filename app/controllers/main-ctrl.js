(function(){
    angular.module('app')
        .controller('MainController', ['PlayerService', 'TrainingMethods', 'GrandExchange', '$q', '$uibModal', '$document', MainController]);

    function MainController(PlayerService, TrainingMethods, GrandExchange, $q, $uibModal, $document) {
        var _ctrl = this;
        _ctrl.tempName = "";
        _ctrl.activeSkill = false;
        _ctrl.trainingMethods = [ ];

        _ctrl.player = PlayerService;

        _ctrl.updateName = function() {
            PlayerService.name = _ctrl.tempName;
            PlayerService.updateHiscores();
        };

        _ctrl.isReady = function() {
            return TrainingMethods.ready;
        };

        _ctrl.getSkills = function() {
            return TrainingMethods.skills;
        };

        _ctrl.isActive = function(skill) {
            return _ctrl.activeSkill == skill
        };

        _ctrl.setActive = function(skill) {
            _ctrl.activeSkill = skill;
            _ctrl.trainingMethods = TrainingMethods.trainingMethods[skill];
            for(var i = 0; i < _ctrl.trainingMethods.length; i++) {
                if(!_ctrl.trainingMethods[i].ready){
                    _ctrl.trainingMethods[i].skill = skill;
                    getInOutPrices(_ctrl.trainingMethods[i]);
                }
            }
        };

        _ctrl.detailMethod = function (tm) {
            console.log("Opening modal..?")
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/views/partials/modalTrainingMethod.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: 'modalCtrl',
                size: 'lg',
                resolve: {
                    trainingMethod: function() {
                        return tm;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                _ctrl.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        function getInOutPrices(tm){
            var promises = [ ];

            if("inputs" in tm) {
                for(var i = 0; i < tm.inputs.length; i++) {
                    (function(item){promises.push(GrandExchange.getGuidePrice(item.id).then(function(response){
                        console.log(item.id + ": " + JSON.stringify(response));
                        item.price = response.overall;
                    }))})(tm.inputs[i]);
                }
            }

            if("outputs" in tm) {
                for(var o = 0; o < tm.outputs.length; o++) {
                    (function(item){promises.push(GrandExchange.getGuidePrice(item.id).then(function(response){
                        console.log(item.id + ": " + JSON.stringify(response));
                        item.price = response.overall;
                    }))})(tm.outputs[o]);
                }
            }

            return $q.all(promises).then(function(){
                // All item prices have been retrieved by now
                tm.profit = 0;
                tm.gross = 0;
                tm.cost = 0;

                if("inputs" in tm) {
                    for (var input = 0; input < tm.inputs.length; input++) {
                        tm.profit -= tm.inputs[input].qty * tm.inputs[input].price;
                        tm.cost -= tm.inputs[input].qty * tm.inputs[input].price;
                    }
                }
                if("outputs" in tm) {
                    for (var output = 0; output < tm.outputs.length; output++) {
                        tm.profit += tm.outputs[output].qty * tm.outputs[output].price;
                        tm.gross += tm.outputs[output].qty * tm.outputs[output].price;
                    }
                }

                tm.ready = true;
                console.log(JSON.stringify(tm));
            });
        }
    }
})();
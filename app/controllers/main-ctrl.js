(function(){
    angular.module('app')
        .controller('MainController', ['PlayerService', 'TrainingMethods', 'GrandExchange', '$q', '$uibModal', '$document', MainController]);

    function MainController(PlayerService, TrainingMethods, GrandExchange, $q, $uibModal, $document) {
        var _ctrl = this;
        _ctrl.tempName = "";
        _ctrl.activeSkill = false;
        _ctrl.trainingMethods = [ ];

        _ctrl.sortType = 7;
        _ctrl.sortReverse = true;

        _ctrl.player = PlayerService;

        _ctrl.gphMults = [
            {
                "text": "GP/hr",
                "mult": 1
            },
            {
                "text": "K GP/hr",
                "mult": 1000
            },
            {
                "text": "M GP/hr",
                "mult": 1000000
            }
        ];

        _ctrl.setGph = 0;

        _ctrl.incrementGphMult = function() {
            var oldIncome = _ctrl.player.income * _ctrl.player.incomeMultiplier;
            _ctrl.setGph = (_ctrl.setGph + 1) % 3;
            _ctrl.player.incomeMultiplier = _ctrl.gphMults[_ctrl.setGph].mult;
            _ctrl.player.income = oldIncome / _ctrl.gphMults[_ctrl.setGph].mult;
        };

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
            $uibModal.open({
                animation: true,
                templateUrl: 'app/views/partials/modal-training-method.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: 'modalCtrl',
                size: 'lg',
                resolve: {
                    trainingMethod: function() {
                        return tm;
                    }
                }
            });
        };

        _ctrl.setSort = function(sorter) {
            if(_ctrl.sortType == sorter) {
                _ctrl.sortReverse = !_ctrl.sortReverse;
            } else {
                _ctrl.sortType = sorter;
                _ctrl.sortReverse = false;
            }
        };

        _ctrl.trainingMethodOrder = function(entry){
            var value;
            switch(_ctrl.sortType) {
                case 2:
                    value = entry.experiencePerAction;
                    break;
                case 3:
                    value = entry.level;
                    break;
                case 4:
                    value = entry.profit;
                    break;
                case 5:
                    value = entry.profit / entry.experiencePerAction;
                    break;
                case 6:
                    value = entry.experiencePerAction * entry.actionsPerHour;
                    break;
                case 7:
                    value = PlayerService.getProductivity(entry);
                    break;
                default:
                    value = entry.name;
            }
            return value;
        };

        function getInOutPrices(tm){
            var promises = [ ];

            if("inputs" in tm) {
                for(var i = 0; i < tm.inputs.length; i++) {
                    (function(item){promises.push(GrandExchange.getGuidePrice(item.id).then(function(response){
                        item.price = response;
                    }))})(tm.inputs[i]);
                }
            }

            if("outputs" in tm) {
                for(var o = 0; o < tm.outputs.length; o++) {
                    (function(item){promises.push(GrandExchange.getGuidePrice(item.id).then(function(response){
                        item.price = response;
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
                console.log(tm.name + ": Done!");
            });
        }
    }
})();
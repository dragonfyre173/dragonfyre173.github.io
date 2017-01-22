(function () {
    angular.module('app')
        .controller('MainController', ['PlayerService', 'TrainingMethods', 'GrandExchange', '$q', '$uibModal', '$document', '$http', MainController]);

    function MainController(PlayerService, TrainingMethods, GrandExchange, $q, $uibModal, $document, $http) {
        var _ctrl = this;

        _ctrl.activeSkill = false;

        _ctrl.calcCollapsed = false;

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

        _ctrl.player = PlayerService;

        _ctrl.setGph = 0;

        _ctrl.sortType = "adjustedexphr";

        _ctrl.sortReverse = true;

        _ctrl.tempName = "";

        _ctrl.trainingMethods = [];

        _ctrl.calc = {
            "current": {
                "val": 1,
                "lv": 1,
                "xp": 0,
                "isXp": false
            },
            "target": {
                "val": 1,
                "lv": 1,
                "xp": 0,
                "isXp": false
            },
            "xpToGoal": function () {
                return Math.max(_ctrl.calc.target.xp - _ctrl.calc.current.xp, 0)
            }
        };


        _ctrl.virtualLevels = false;

        _ctrl.maxLevel = function () {
            return _ctrl.virtualLevels ? 126 : 99;
        };

        var updateCalcWithHiscores = function () {
            if (_ctrl.activeSkill) {
                if (PlayerService.hiscores) {
                    _ctrl.calc.current.lv = PlayerService.hiscores[_ctrl.activeSkill].level;
                    _ctrl.calc.current.xp = PlayerService.hiscores[_ctrl.activeSkill].exp;
                    _ctrl.calc.current.val = _ctrl.calc.current.xp;
                    _ctrl.calc.current.isXp = true;

                    _ctrl.calc.target.lv = Math.min(_ctrl.maxLevel(), _ctrl.calc.current.lv + 1);
                    _ctrl.calc.target.xp = _ctrl.calc.target.lv < PlayerService.xpTable.length ? PlayerService.xpTable[_ctrl.calc.target.lv] : 200000000;
                    _ctrl.calc.target.isXp = _ctrl.calc.target.lv >= _ctrl.maxLevel();
                    _ctrl.calc.target.val = _ctrl.calc.target.isXp ? _ctrl.calc.target.lv : _ctrl.calc.target.lv;
                } else {
                    _ctrl.calc.current.lv = 1;
                    _ctrl.calc.current.xp = 0;
                    _ctrl.calc.target.val = 1;
                    _ctrl.calc.current.isXp = false;

                    _ctrl.calc.target.lv = 2;
                    _ctrl.calc.target.xp = 83;
                    _ctrl.calc.target.val = 2;
                    _ctrl.calc.target.isXp = false;
                }
            }
        }

        var playerHiscoreIsReady = function () {
            return PlayerService.hiscores &&
                _ctrl.activeSkill in PlayerService.hiscores;
        };

        _ctrl.updateSyncXpLv = function (target) {
            var calc = _ctrl.calc[target];
            if (calc) {
                if (calc.isXp) {
                    calc.xp = calc.val;
                    calc.lv = PlayerService.levelFromXp(calc.val);
                } else {
                    calc.lv = calc.val;
                    if (target === 'current' && playerHiscoreIsReady()) {
                        calc.xp = PlayerService.hiscores[_ctrl.activeSkill].exp;
                    } else {
                        calc.xp = PlayerService.xpTable ? ( PlayerService.xpTable[calc.val] || 0 ) : -1;
                    }
                }
            }
        };

        _ctrl.toggleXpLvDisplay = function (target) {
            var calc = _ctrl.calc[target];
            if (calc) {
                if (calc.isXp) {
                    calc.val = calc.lv;
                } else {
                    calc.val = calc.xp;
                }
                calc.isXp = !calc.isXp;
            }
        };

        _ctrl.incrementGphMult = function () {
            var oldIncome = _ctrl.player.getIncome();
            _ctrl.setGph = (_ctrl.setGph + 1) % 3;
            _ctrl.player.incomeMultiplier = _ctrl.gphMults[_ctrl.setGph].mult;
            _ctrl.player.income = oldIncome / _ctrl.gphMults[_ctrl.setGph].mult;
        };

        _ctrl.hiscoreLookup = function () {
            PlayerService.name = _ctrl.tempName;
            PlayerService.updateHiscores();
            updateCalcWithHiscores();
        };

        _ctrl.isReady = function () {
            return TrainingMethods.ready;
        };

        _ctrl.getSkillList = function () {
            return TrainingMethods.skills;
        };

        _ctrl.isActive = function (skill) {
            return _ctrl.activeSkill == skill
        };

        _ctrl.setActive = function (skill) {
            if (skill === _ctrl.activeSkill) {
                _ctrl.activeSkill = false;
                _ctrl.trainingMethods = [];
            } else {
                _ctrl.activeSkill = skill;
                _ctrl.trainingMethods = TrainingMethods.trainingMethods[skill];
                for (var i = 0; i < _ctrl.trainingMethods.length; i++) {
                    if (!_ctrl.trainingMethods[i].ready) {
                        _ctrl.trainingMethods[i].skill = skill;
                        _ctrl.updatePrices(_ctrl.trainingMethods[i], false);
                    }
                }
                updateCalcWithHiscores();
            }
        };

        _ctrl.detailMethod = function (trainingMethod) {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/views/partials/modal-training-method.html',
                controller: 'ModalInstanceController',
                controllerAs: 'modalCtrl',
                size: 'lg',
                resolve: {
                    trainingMethod: function () {
                        return trainingMethod;
                    }
                }
            });
        };

        _ctrl.setSort = function (sorter) {
            if (_ctrl.sortType == sorter) {
                _ctrl.sortReverse = !_ctrl.sortReverse;
            } else {
                _ctrl.sortType = sorter;
                _ctrl.sortReverse = false;
            }
        };

        _ctrl.trainingMethodOrder = function (entry) {
            var value;
            switch (_ctrl.sortType) {
                case 'exp':
                    value = entry.experiencePerAction;
                    break;
                case 'level':
                    value = entry.level;
                    break;
                case 'profit':
                    value = entry.profit;
                    break;
                case 'gpxp':
                    value = entry.profit / entry.experiencePerAction;
                    break;
                case 'xphr':
                    value = entry.experiencePerAction * entry.actionsPerHour;
                    break;
                case 'adjustedxphr':
                    value = _ctrl.getProductivity(entry);
                    break;
                case 'total':
                    value = _ctrl.getProfitToGoal(entry);
                    break;
                case 'needed':
                    value = _ctrl.getActionsToGoal(entry);
                    break;
                case 'effeta':
                    value = _ctrl.getHoursToGoal(entry);
                    break;
                case 'raweta':
                    value = _ctrl.getActionsToGoal(entry) / entry.actionsPerHour;
                    break;
                case 'effgph':
                    value = _ctrl.getEffectiveGpPerHour(entry);
                    break;
                case 'effxph':
                    value = _ctrl.getEffectiveXpPerHour(entry);
                    break;
                default:
                    value = entry.name;
            }
            return value;
        };

        _ctrl.calcCollapse = function () {
            _ctrl.calcCollapsed = !_ctrl.calcCollapsed;
        }

        _ctrl.getActionsToGoal = function (trainingMethod) {
            return Math.max(0, Math.ceil(_ctrl.calc.xpToGoal() / trainingMethod.experiencePerAction));
        };

        _ctrl.getProfitToGoal = function (trainingMethod) {
            return trainingMethod.profit * _ctrl.getActionsToGoal(trainingMethod);
        };

        _ctrl.getHoursToGoal = function (trainingMethod) {
            var actionsNeeded = _ctrl.calc.xpToGoal() / trainingMethod.experiencePerAction;
            var hrsTraining = actionsNeeded / trainingMethod.actionsPerHour;
            var hrsProfit = Math.max(0, actionsNeeded * trainingMethod.profit * -1 / PlayerService.getIncome());
            return hrsTraining + hrsProfit;
        };

        _ctrl.getProductivity = function (trainingMethod) {
            return _ctrl.calc.xpToGoal() / _ctrl.getHoursToGoal(trainingMethod);
        };

        _ctrl.getEffectiveGpPerHour = function (trainingMethod) {
            // Finding this was REALLY fun
            // Note that as income approaches zero, effective GP/hr tanks

            var i = PlayerService.getIncome();
            var p = trainingMethod.profit;
            var a = trainingMethod.actionsPerHour;

            return p < 0 ? p / ((1 / a) - (p / i)) : p * a;
        };

        _ctrl.getEffectiveXpPerHour = function(trainingMethod) {
            // This was a byproduct of finding the above
            // As i -> infinity, if p < 0, the lhs approaches xa
            var x = trainingMethod.experiencePerAction;
            var i = PlayerService.getIncome();
            var p = trainingMethod.profit;
            var a = trainingMethod.actionsPerHour;

            return p < 0 ? x / ((1 / a) - (p / i)) : x * a;
        };

        _ctrl.updatePrices = function (trainingMethod, forceUpdate) {
            var promises = [];

            if ("inputs" in trainingMethod) {
                for (var i = 0; i < trainingMethod.inputs.length; i++) {
                    (function (item) {
                        var result = GrandExchange.getGuidePrice(item.id, forceUpdate);

                        if ("then" in result) {
                            promises.push(result.then(function (response) {
                                item.price = response;
                            }))
                        } else {
                            item.price = result;
                        }
                    })(trainingMethod.inputs[i]);
                }
            }

            if ("outputs" in trainingMethod) {
                for (var o = 0; o < trainingMethod.outputs.length; o++) {
                    (function (item) {
                        var result = GrandExchange.getGuidePrice(item.id, forceUpdate);

                        if ("then" in result) {
                            promises.push(result.then(function (response) {
                                item.price = response;
                            }));
                        } else {
                            item.price = result;
                        }
                    })(trainingMethod.outputs[o]);
                }
            }

            return $q.all(promises).then(function () {
                // All item prices have been retrieved by now
                trainingMethod.profit = 0;
                trainingMethod.gross = 0;
                trainingMethod.cost = 0;

                if ("inputs" in trainingMethod) {
                    for (var input = 0; input < trainingMethod.inputs.length; input++) {
                        trainingMethod.profit -= trainingMethod.inputs[input].qty * trainingMethod.inputs[input].price;
                        trainingMethod.cost -= trainingMethod.inputs[input].qty * trainingMethod.inputs[input].price;
                    }
                }
                if ("outputs" in trainingMethod) {
                    for (var output = 0; output < trainingMethod.outputs.length; output++) {
                        trainingMethod.profit += trainingMethod.outputs[output].qty * trainingMethod.outputs[output].price;
                        trainingMethod.gross += trainingMethod.outputs[output].qty * trainingMethod.outputs[output].price;
                    }
                }

                trainingMethod.ready = true;
            });
        };
    }
})();
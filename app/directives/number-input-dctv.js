(function(){
    angular.module('app')
        .directive('numberInput', ['$filter', '$browser', NumberInput]);


    function NumberInput() {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                min: '@customMin',
                max: '@customMax',
                increment: '@incrementPow'
            },
            link: function(scope, element, attrs, modelCtrl) {

                modelCtrl.$parsers.push(function (inputValue) {

                    var transformedInput = parseInt(inputValue.replace(/^[^0-9\-.]/g, ''));

                    if(transformedInput < scope.min) transformedInput = scope.min;
                    if(transformedInput > scope.max) transformedInput = scope.max;



                    if (transformedInput!=inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }

        }
    }
})();
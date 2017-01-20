(function(){
    angular.module('app')
        .directive('sortedColumn', [SortedColumn]);

    function SortedColumn(){
        return {
            restrict: "A",
            scope: {
                ctrl: '=',
                sortName: '@',
                columnName: '@',
                hasTooltip: '@?'
            },
            templateUrl: "app/views/partials/sorted-column-tpl.html"
        }
    }
})();
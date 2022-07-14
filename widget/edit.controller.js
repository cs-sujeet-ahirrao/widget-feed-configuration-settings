'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('editFeedConfigurationSettings110Ctrl', editFeedConfigurationSettings110Ctrl);

        editFeedConfigurationSettings110Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'appModulesService'];

    function editFeedConfigurationSettings110Ctrl($scope, $uibModalInstance, config, appModulesService) {
        $scope.cancel = cancel;
        $scope.save = save;
        $scope.config = config;

        function init() {
          appModulesService.load(true).then(function (modules) {
            $scope.modules = modules;
          });
        }

        function cancel() {
          $uibModalInstance.dismiss("cancel");
        }

        function save() {
          $uibModalInstance.close($scope.config);
        }

        init();

    }
})();

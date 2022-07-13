'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('editFeedConfigurationSettingsDev110DevCtrl', editFeedConfigurationSettingsDev110DevCtrl);

        editFeedConfigurationSettingsDev110DevCtrl.$inject = ['$scope', '$uibModalInstance', 'config', 'appModulesService'];

    function editFeedConfigurationSettingsDev110DevCtrl($scope, $uibModalInstance, config, appModulesService) {
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

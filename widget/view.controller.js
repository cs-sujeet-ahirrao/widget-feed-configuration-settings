    'use strict';
    (function () {
        angular
            .module('cybersponse')
            .controller('feedConfigurationSettings110Ctrl', feedConfigurationSettings110Ctrl);

        feedConfigurationSettings110Ctrl.$inject = ['$scope', 'CommonUtils', '$resource', 'API', 'config', 'statusCodeService', 'toaster', '$rootScope', 'ModalService', 'clipboard'];

        function feedConfigurationSettingsDev110DevCtrl($scope, CommonUtils, $resource, API, config, statusCodeService, toaster, $rootScope, ModalService, clipboard) {
          $scope.getFeedSettings = getFeedSettings;
          $scope.updateTaxiiServerStatus = updateTaxiiServerStatus;
          $scope.updateGenaralSettings = updateGenaralSettings;
          $scope.revertFeedConfidenceSettings = revertFeedConfidenceSettings;
          $scope.revertTaxiiServerStatus = revertTaxiiServerStatus;
          $scope.getDataSets = getDataSets;
          $scope.params = {};
          $scope.taxiiServerAddress = CommonUtils.getOrigin();
          $scope.copyDatasetLink = copyDatasetLink;

          function init() {
            $scope.tabsData = [
              {
                name: "general",
                title: "General",
                visible: true,
                active: false,
              },
              {
                name: "outgoingFeed",
                title: "Outgoing Feed",
                visible: true,
                active: true,
              },
            ];
            $scope.params.activeTab = $scope.tabsData[1];
            getFeedSettings();
            $scope.getTheme = $rootScope.theme.id;
            $scope.tableHeader = "backgrund-color:#191919";
          }

          function getFeedSettings() {
            if ($scope.params.activeTab.name === "outgoingFeed") {
              $scope.tabsData[1].active = true;
              $scope.tabsData[0].active = false;
              $scope.processing = true;
              $resource(
                API.BASE +
                  "system_settings/18f3043e-c1e4-4041-bba3-d481ea86d1b5/?$relationships=true"
              )
                .get({})
                .$promise.then(function (response) {
                  $scope.params.enableTaxiiServer =
                    response.publicValues.status.enabled;
                  $scope.oldTaxiiServerStatusObject =
                    angular.copy(response);
                }, statusCodeService)
                .finally(function () {
                  $scope.processing = false;
                });

                 getDataSets();
            }
            if ($scope.params.activeTab.name === "general") {
              $scope.tabsData[0].active = true;
              $scope.tabsData[1].active = false;
              $scope.processing = true;
              $resource(
                API.WORKFLOW +
                  "api/dynamic-variable/?name=Indicator_Feed_Reputation_Preference&format=json"
              )
                .get({})
                .$promise.then(function (response) {
                  $scope.feedConfidenceThresholdVariable =
                    response["hydra:member"][0];
                  var parsedFeedConfigValues = JSON.parse(
                    $scope.feedConfidenceThresholdVariable.value
                  );
                  $scope.params.feedConfidenceThreshold =
                    parsedFeedConfigValues.confidenceThreshold;
                  $scope.params.enableFeedIndicatorLinking =
                    parsedFeedConfigValues.setReputation;
                  $scope.oldFeedConfidenceThresholdObject = angular.copy(
                    $scope.feedConfidenceThresholdVariable
                  );
                }, statusCodeService)
                .finally(function () {
                  $scope.processing = false;
                });
            }
          }

          function updateGenaralSettings() {
            $scope.updateProcessing = true;
            $scope.feedConfidenceThresholdVariable.value = JSON.stringify(
              {
                setReputation: $scope.params.enableFeedIndicatorLinking,
                confidenceThreshold:
                  $scope.params.feedConfidenceThreshold,
              }
            );
            $resource(
              API.WORKFLOW +
                "api/dynamic-variable/" +
                $scope.feedConfidenceThresholdVariable.id +
                "/?format=json",
              null,
              {
                update: {
                  method: "PUT",
                },
              }
            )
              .update($scope.feedConfidenceThresholdVariable)
              .$promise.then(
                function () {
                  $scope.params.feedIndicatorLinking.$setPristine();
                  toaster.success({
                    body: "Feed Confidence Threshold updated successfully.",
                  });
                },
                function () {
                  toaster.error({
                    body: "Unable to update Feed Confidence Threshold.",
                  });
                }
              )
              .finally(function () {
                $scope.updateProcessing = false;
              });
          }

          function updateTaxiiServerStatus() {
            $scope.updateProcessing = true;
            $scope.oldTaxiiServerStatusObject.publicValues.status.enabled =
              $scope.params.enableTaxiiServer;
            $resource(
              API.BASE +
                "system_settings/18f3043e-c1e4-4041-bba3-d481ea86d1b5",
              null,
              {
                update: {
                  method: "PUT",
                },
              }
            )
              .update($scope.oldTaxiiServerStatusObject)
              .$promise.then(
                function () {
                  $scope.params.feedOutgoingStatusForm.$setPristine();
                  toaster.success({
                    body: "TAXII sever settings updated successfully.",
                  });
                },
                function () {
                  toaster.error({
                    body: "Unable to update TAXII sever settings.",
                  });
                }
              )
              .finally(function () {
                $scope.updateProcessing = false;
              });
          }

          function revertTaxiiServerStatus() {
            ModalService.confirm(
              "Are you sure that you want to revert the changes?"
            ).then(function (result) {
              if (result) {
                $scope.params.enableTaxiiServer =
                  $scope.oldTaxiiServerStatusObject.publicValues.status.enabled;
                $scope.params.feedOutgoingStatusForm.$setPristine();
                toaster.success({
                  body: "Changes reverted successfully.",
                });
              }
            });
          }

          function revertFeedConfidenceSettings() {
            ModalService.confirm(
              "Are you sure that you want to revert the changes?"
            ).then(function (result) {
              if (result) {
                var oldFeedSettingsObject = JSON.parse(
                  $scope.oldFeedConfidenceThresholdObject
                );
                $scope.params.enableFeedIndicatorLinking =
                  oldFeedSettingsObject.setReputation;
                $scope.params.enableFeedIndicatorLinking =
                  oldFeedSettingsObject.confidenceThreshold;
                $scope.params.feedIndicatorLinking.$setPristine();
                toaster.success({
                  body: "Changes reverted successfully.",
                });
              }
            });
          }
          
          function getDataSets(){
            $scope.datasetProcessing = true;
              $resource(
                API.BASE +
                  "system_queries?models__type=" +
                  config.module + '&$limit=100'
              )
                .get({})
                .$promise.then(function (response) {
                  $scope.datasets = response["hydra:member"];
                }, statusCodeService)
                .finally(function () {
                  $scope.datasetProcessing = false;
                });
          }

          function copyDatasetLink(datasetId,format) {
             if(format === 'taxii'){
                clipboard.copyText(CommonUtils.getOrigin() + 'api/taxii/1/collections/' + datasetId + '/objects');
            }
            else{
                clipboard.copyText(CommonUtils.getOrigin() + 'api/taxii/1/collections/' + datasetId + '/objects?$format=csv&$limit=1000');
            }
            toaster.success({
              body: 'Dataset URL copied to clipboard.'
            });
    	    }

          init();
        }
    })();

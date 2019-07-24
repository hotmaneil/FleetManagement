define(["require", "exports", "../Shared/module", "./mapfunction"], function (require, exports, module_1, mapfunction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MonitorService = (function () {
        function MonitorService() {
        }
        MonitorService.prototype.CallCarGroups = function () {
            var _this = this;
            var setting = {
                url: '/Monitor/GetMonitorData',
                type: 'GET',
                dataType: 'json'
            };
            module_1.DoAjax(setting, function (res) {
                mapfunction_1.DealDataFromAPI(res.Data);
            }, function (res) {
                toastr["error"]("載入車輛群組下拉列表發生錯誤");
            }, null, null);
        };
        MonitorService.prototype.SearchAddressByWord = function (word) {
            mapfunction_1.Search(word);
        };
        MonitorService.prototype.JudgeCStatusToReturnColor = function (Number) {
            switch (Number) {
                case 0:
                    return "teal";
                    break;
                case 1:
                    return "olive";
                    break;
                case 2:
                case 3:
                    return "blue";
                    break;
                case 10:
                case 7:
                    return "grey";
                    break;
                case 4:
                case 5:
                    return "orange";
                    break;
            }
        };
        return MonitorService;
    }());
    exports.MonitorService = MonitorService;
});
//# sourceMappingURL=service.js.map
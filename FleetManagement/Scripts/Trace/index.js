define(["require", "exports", "../../Content/bower_components/moment/moment", "./service", "../Shared/function", "../Shared/module"], function (require, exports, moment, t, function_1, module_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var trace = new t.TraceService();
    function_1.promise.then(function (success) {
        SetDefaultDateTimeDropdown();
        trace.initmap();
        trace.GetShowDropDown();
        $("#PlayTraceBtn").addClass("disabled");
        $("#StopTraceBtn").addClass("disabled");
        $("#ContinueTraceBtn").addClass("disabled");
    }).then(function (success) {
        SearchTrace();
        trace.ExportExcelOrPDF(module_1.PrintType.landscape);
    }).then(function (success) {
        $("#PlayTraceBtn").remove("disabled");
    });
    $("#traceList").on("click", ".item", function (key, list) {
        var datajson = {
            Address: $(this).attr("data-Address"),
            CarNo: $(this).attr("data-CarNo"),
            FrontPhoto: $(this).attr("data-FrontPhoto"),
            DriverName: $(this).attr("data-DriverName"),
            DriverPhone: $(this).attr("data-DriverPhone"),
            GPSStrength: Number($(this).attr("data-GPSStrength")),
            KMperHour: Number($(this).attr("data-KMperHour")),
            Latitude: Number($(this).attr("data-Latitude")),
            Longitude: Number($(this).attr("data-Longitude")),
            OperationalStatus: $(this).attr("data-OperationalStatus"),
            RecordTime: $(this).attr("data-RecordTime"),
            SignalStrength: Number($(this).attr("data-SignalStrength")),
            MessageId: $(this).attr("data-TaskId"),
            TaskNo: $(this).attr("data-TaskNo") === "null" ? "" : $(this).attr("data-TaskNo"),
            CStatus: Number($(this).attr("data-CStatus"))
        };
        trace.traceEventClick(datajson);
    });
    $("#PrintBtn").click(function () {
        trace.Print();
    });
    $("#ShowDropdown").closest(".dropdown").dropdown({
        onChange: function (value, text) {
            var wordSearch = $("#word-search");
            if (!value || value == "-1" || text == "顯示所有") {
                wordSearch.html("");
                return;
            }
            ;
            wordSearch.html('#traceList .item:not([data-CStatus*="' + value + '"]) {display: none;}');
        }
    });
    function SearchTrace() {
        $("#searchTraceForm").on('submit', function (event) {
            event.preventDefault();
            var start = moment($("#StartTime").val()).format("YYYY/MM/DD HH:mm:ss");
            var end = moment($("#EndTime").val()).format("YYYY/MM/DD HH:mm:ss");
            var drivercheck = ($("#Driverid").closest(".ui.dropdown").dropdown("get value") == "null") ? false : true;
            var vehiclecheck = ($("#VehicleId").closest(".ui.dropdown").dropdown("get value") == "null") ? false : true;
            if (drivercheck || vehiclecheck) {
                var option = {
                    BeginDateTime: start,
                    EndDateTime: end,
                    DriverId: $("#Driverid").closest(".ui.dropdown").dropdown("get value"),
                    VehicleId: $("#VehicleId").closest(".ui.dropdown").dropdown("get value")
                };
                trace.SearchTrace(option);
            }
            else {
                toastr.warning("司機或車號必填其中一個!");
            }
        });
    }
    function SetDefaultDateTimeDropdown() {
        var today = moment().add(-3, 'hours').format("YYYY/MM/DD HH:mm");
        var nowtime = moment().format("YYYY/MM/DD HH:mm");
        $("#StartTime").val(today);
        $("#EndTime").val(nowtime);
    }
});
//# sourceMappingURL=index.js.map
import * as moment from '../../Content/bower_components/moment/moment';
import * as t from './service';
import { promise } from '../Shared/function';
import { PrintType} from '../Shared/module';

let trace = new t.TraceService();

promise.then(success => {
    SetDefaultDateTimeDropdown();
    trace.initmap();
    trace.GetShowDropDown();
    $("#PlayTraceBtn").addClass("disabled");
    $("#StopTraceBtn").addClass("disabled");
    $("#ContinueTraceBtn").addClass("disabled");
}).then(success => {
    SearchTrace();

    /*表單下載*/
    trace.ExportExcelOrPDF(PrintType.landscape);

}).then(success => {
    $("#PlayTraceBtn").remove("disabled");
});

/*點擊軌跡列表時,觸發軌跡事件*/
$("#traceList").on("click", ".item", function (key, list) {
    let datajson = {
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

/**列印*/
$("#PrintBtn").click(function () {
    trace.Print();
});

/**由下拉選單決定顯示軌跡列表種類*/
$("#ShowDropdown").closest(".dropdown").dropdown({
    onChange: function (value, text) {

        var wordSearch = $("#word-search");
        if (!value || value == "-1" || text == "顯示所有") {
            wordSearch.html("");
            return;
        };

        wordSearch.html('#traceList .item:not([data-CStatus*="' + value + '"]) {display: none;}');
    }
});

/**查詢軌跡按鈕點擊事件 */
function SearchTrace() {
    $("#searchTraceForm").on('submit', function (event) {
        event.preventDefault();
       
        let start = moment(<string>$("#StartTime").val()).format("YYYY/MM/DD HH:mm:ss");
        let end = moment(<string>$("#EndTime").val()).format("YYYY/MM/DD HH:mm:ss");

        let drivercheck: boolean = ($("#Driverid").closest(".ui.dropdown").dropdown("get value") == "null") ? false : true;
        let vehiclecheck: boolean = ($("#VehicleId").closest(".ui.dropdown").dropdown("get value") == "null") ? false : true;

        if (drivercheck || vehiclecheck) {
            let option = {
                BeginDateTime: start,
                EndDateTime: end,
                DriverId: $("#Driverid").closest(".ui.dropdown").dropdown("get value"),
                VehicleId: $("#VehicleId").closest(".ui.dropdown").dropdown("get value")
            };
            trace.SearchTrace(option);
        } else {
            toastr.warning("司機或車號必填其中一個!");
        }
    });
}

/** 日期下拉選單預設值 */
function SetDefaultDateTimeDropdown() {

    let today = moment().add(-3, 'hours').format("YYYY/MM/DD HH:mm");
    let nowtime = moment().format("YYYY/MM/DD HH:mm");

    $("#StartTime").val(today);
    $("#EndTime").val(nowtime);
}




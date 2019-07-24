import * as moment from '../../Content/bower_components/moment/moment';
import * as t from './singleTraceViewService';
import {
    promise,
    GetURLParameter
} from '../Shared/function';
let trace = new t.SingleTraceViewService();

let jsondata = JSON.parse(JSON.stringify(GetURLParameter()));
let starttime = moment(jsondata.BeginDateTime).format("YYYY/MM/DD HH:mm:ss");
let endtime = moment(jsondata.EndDateTime).format("YYYY/MM/DD HH:mm:ss");

promise.then(success => {
    
    trace.initmap();
    trace.GetShowDropDown();
    $("#PlayTraceBtn").addClass("disabled");
    $("#StopTraceBtn").addClass("disabled");
    $("#ContinueTraceBtn").addClass("disabled");

}).then(success => {

    SearchTrace();

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

/** 查詢軌跡*/
function SearchTrace() {
    let option = {
        BeginDateTime: jsondata.BeginDateTime,
        EndDateTime: jsondata.EndDateTime,
        DriverId: jsondata.DriverId
    };
    trace.SearchTrace(option);
}
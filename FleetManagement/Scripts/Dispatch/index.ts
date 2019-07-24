import * as s from './service';
import moment = require('../../Content/bower_components/moment/moment');
import { PrintType } from '../Shared/module';

let service = new s.IndexService();

let thismonth = moment(new Date()).format('YYYY-MM') + '-01';
let currentYear: number = parseInt(moment(new Date()).format('YYYY'));
let currentMonth = parseInt(moment(new Date()).format('MM'));

let thisMonthDay = new Date(currentYear, currentMonth, 0).getDate();
let thisLastDay = moment(new Date()).format('YYYY-MM') + "-" + thisMonthDay;

$(document).ready(async function () {

    SetDefaultSerach();

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
    var SearchPostalCode = sessionStorage.getItem('SearchPostalCode');
    var SearchDriverName = sessionStorage.getItem('SearchDriverName');

    service.SearchResult({
        BeginDateTime: SearchBeginDateTime == null ? thismonth : SearchBeginDateTime,
        EndDateTime: SearchEndDateTime == null ? null : SearchEndDateTime,
        PostalCode: SearchPostalCode == null ? 0 : parseInt(SearchPostalCode, 10),
        DriverName: SearchDriverName == null ? null : SearchDriverName,
        ProcessStatusList: null
    });

    //任務列表篩選按鈕-未執行
    $("#NoExecuteBtn").on("click", function () {
        FilterMissionBtn("NoExecuteBtn");
    });

    //任務列表篩選按鈕-執行中
    $("#ExecuteBtn").on("click", function () {
        FilterMissionBtn("ExecuteBtn");
    });

    //service.ExportExcelOrPDF(PrintType.landscape);

    /**列印*/
    //$("#PrintBtn").click(function () {
    //    service.Print();
    //});
});

/**搜尋 */
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
    let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
    let postalCode: number = <number>$("#PostalCode").val();
    let driverName: string = <string>$("#DriverName").val();

    sessionStorage.setItem('SearchBeginDateTime', beginDateTime);
    sessionStorage.setItem('SearchEndDateTime', endDateTime);
    sessionStorage.setItem('SearchPostalCode', postalCode.toString());
    sessionStorage.setItem('SearchDriverName', driverName);

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        PostalCode: postalCode,
        DriverName: driverName,
        ProcessStatusList: null
    });

    RemoveAllButtonClass();
});

/**預設日期 */
function SetDefaultSerach() {

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    if (SearchBeginDateTime == null) {
        $("#BeginDateTime").val(thismonth);
    }

    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
    if (SearchEndDateTime == null) {
        $("#EndDateTime").val(thisLastDay);
    }
}

/**
 * 過濾任務列表之按鈕
 * @param ButtonName
 */
function FilterMissionBtn(ButtonName) {

    RemoveAllButtonClass();

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
    let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
    let postalCode: number = <number>$("#PostalCode").val();
    let driverName: string = <string>$("#DriverName").val();

    let processStatusList: Int32List;

    switch (ButtonName) {

        case "NoExecuteBtn":
            processStatusList = [0, 1, 2, 3, 4, 5];
            break;

        case "ExecuteBtn":
            processStatusList = [6, 7, 8, 9];
            break;
    }

    $("#" + ButtonName).addClass("orange");

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        PostalCode: postalCode,
        DriverName: driverName,
        ProcessStatusList: processStatusList
    });
}

/**先將所有按鈕移除class */
function RemoveAllButtonClass() {
    $("#NoExecuteBtn").removeClass("orange");
    $("#ExecuteBtn").removeClass("orange");
}


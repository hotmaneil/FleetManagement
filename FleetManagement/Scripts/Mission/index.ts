import * as moment from "../../Content/bower_components/moment/moment";
import * as s from './service';
import { promise } from "../Shared/function";
import { PrintType } from "../Shared/module";
let service = new s.MissionService();

let thismonth = moment(new Date()).format('YYYY-MM-DD');
let currentYear: number = parseInt(moment(new Date()).format('YYYY'));
let currentMonth = parseInt(moment(new Date()).format('MM'));

let thisMonthDay = new Date(currentYear, currentMonth, 0).getDate();
let thisLastDay = moment(new Date()).format('YYYY-MM') + "-" + thisMonthDay;

$(document).ready(async function () {

    SetDefaultSerach();

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
    var SearchLicenseNumber = sessionStorage.getItem('SearchLicenseNumber');
    var SearchDriverName = sessionStorage.getItem('SearchDriverName');
    let processStatusList: Int32List;

    service.SearchResult({
        BeginDateTime: SearchBeginDateTime == null ? thismonth : SearchBeginDateTime,
        EndDateTime: SearchEndDateTime == null ? null : SearchEndDateTime,
        VehicleNumber: SearchLicenseNumber == null ? null : SearchLicenseNumber,
        DriverName: SearchDriverName == null ? null : SearchDriverName,
        ProcessStatusList: processStatusList
    });

    service.ExportExcelOrPDF(PrintType.landscape);

    /**列印*/
    $("#PrintBtn").click(function () {
        service.Print();
    });
});

/**搜尋 */
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
    let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");

    let licenseNumber: string = <string>$("#VehicleNumber").val();
    let driverName: string = <string>$("#DriverName").val();

    sessionStorage.setItem('SearchBeginDateTime', beginDateTime);
    sessionStorage.setItem('SearchEndDateTime', endDateTime);
    sessionStorage.setItem('SearchLicenseNumber', licenseNumber);
    sessionStorage.setItem('SearchDriverName', driverName);

    let processStatusList: Int32List;

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        VehicleNumber: licenseNumber,
        DriverName: driverName,
        ProcessStatusList: processStatusList
    });

    RemoveAllButtonClass();
    $("#AllBtn").addClass("orange");
});

//任務列表 圖片按下功能
$("#dataTable").on("click", "div img", function () {

    let imgId: string = <string>($(this).attr("img-Id"));
    let src: string = <string>($(this).attr("src"));

    if (imgId != undefined) {

        var myModal = $('#my-modal');
        var modalImg = $('#modal-img');

        modalImg.attr("src", src);
        myModal.modal('show');
    }
});

//任務列表篩選按鈕-未執行
$("#NoExecuteBtn").on("click", function () {
    FilterMissionBtn("NoExecuteBtn");
});

//任務列表篩選按鈕-執行中
$("#ExecuteBtn").on("click", function () {
    FilterMissionBtn("ExecuteBtn");
});

//任務列表篩選按鈕-完成
$("#FinishedBtn").on("click", function () {
    FilterMissionBtn("FinishedBtn");
});

//任務列表篩選按鈕-全部
$("#AllBtn").on("click", function () {
    FilterMissionBtn("AllBtn");
});

/**
 * 過濾任務列表之按鈕
 * @param ButtonName
 */
function FilterMissionBtn(ButtonName) {

    RemoveAllButtonClass();

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
    let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");

    let licenseNumber: string = <string>$("#VehicleNumber").val();
    let driverName: string = <string>$("#DriverName").val();

    let processStatusList: Int32List;

    switch (ButtonName) {

        case "NoExecuteBtn":
            processStatusList = [0, 1, 2, 3, 4, 5];
            break;

        case "ExecuteBtn":
            processStatusList = [6, 7, 8, 9];
            break;

        case "FinishedBtn":
            processStatusList = [10];
            break;

        case "AllBtn":
            processStatusList = [];
            break;
    }

    $("#" + ButtonName).addClass("orange");

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        VehicleNumber: licenseNumber,
        DriverName: driverName,
        ProcessStatusList: processStatusList
    });
}

/**先將所有按鈕移除class */
function RemoveAllButtonClass() {
    $("#NoExecuteBtn").removeClass("orange");
    $("#ExecuteBtn").removeClass("orange");
    $("#FinishedBtn").removeClass("orange");
    $("#AllBtn").removeClass("orange");
}

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





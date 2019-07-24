import * as s from './service';
import moment = require('../../Content/bower_components/moment/moment');
import { PrintType } from '../Shared/module';
import { RelativePath } from '../Shared/enum';

let service = new s.OrderClientService();

let thismonth = moment(new Date()).format('YYYY-MM-DD');
let currentYear: number = parseInt(moment(new Date()).format('YYYY'));
let currentMonth = parseInt(moment(new Date()).format('MM'));

let thisMonthDay = new Date(currentYear, currentMonth, 0).getDate();
let thisLastDay = moment(new Date()).format('YYYY-MM') + "-" + thisMonthDay;

$(document).ready(async function () {

    SetDefaultSerach();

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');

    service.SearchResult({
        BeginDateTime: SearchBeginDateTime == null ? thismonth : SearchBeginDateTime,
        EndDateTime: SearchEndDateTime == null ? null : SearchEndDateTime
    });

    //service.ExportExcelOrPDF(PrintType.landscape);

    //新增訂單
    $("#btnCreate").click(function () {
        window.location.href = RelativePath.ConstName + "OrderClientService/Create";
    });
});

/**搜尋 */
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
    let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");

    sessionStorage.setItem('SearchBeginDateTime', beginDateTime);
    sessionStorage.setItem('SearchEndDateTime', endDateTime);

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime
    });
});

/**預設日期 */
function SetDefaultSerach() {
    $("#BeginDateTime").val(thismonth);
    $("#EndDateTime").val(thisLastDay);
}

//訂單客服列表 按鈕功能
$("#dataTable").on("click", "div button", function () {

    //報價
    let editMessageId: string = <string>($(this).attr("editMessageId"));
    if (editMessageId != undefined) {
        window.location.href = RelativePath.ConstName + "OrderClientService/Edit?MessageId=" + editMessageId;
    }
});




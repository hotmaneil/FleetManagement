import * as s from './reportService';
import moment = require('../../Content/bower_components/moment/moment');
import { PrintType } from '../Shared/module';
let service = new s.IncomeStatementReportService();

let thismonth = moment(new Date()).startOf('month').format('YYYY/MM/DD');
let thisDate = moment(new Date()).format('YYYY/MM/DD');

$(document).ready(async function () {

    SetDefaultSerach();

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
    var SearchVehicleId = sessionStorage.getItem('SearchVehicleId');

    service.SearchResult({
        BeginDateTime: SearchBeginDateTime == null ? thismonth : SearchBeginDateTime,
        EndDateTime: SearchEndDateTime == null ? thisDate : SearchEndDateTime,
        SearchVehicleId: parseInt(SearchVehicleId, 10),
    });

    service.ExportExcelOrPDF(PrintType.landscape);

    /**列印*/
    $("#PrintBtn").click(function () {
        service.Print();
    });

    $("#beginDateTimeLabel").text(SearchBeginDateTime == null ? thismonth : moment(SearchBeginDateTime).format('YYYY/MM/DD'));
    $("#endDateTimeLabel").text(SearchEndDateTime == null ? thisDate : moment(SearchEndDateTime).format('YYYY/MM/DD'));
});

//搜尋收支帳報表
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let beginDateTime: string = $("#BeginDateTime").val().toString();
    let endDateTime: string = $("#EndDateTime").val().toString();
    let searchVehicleId: number = <number>$("#SearchVehicleId").val();

    sessionStorage.setItem('SearchBeginDateTime', beginDateTime.toString());
    sessionStorage.setItem('SearchEndDateTime', endDateTime.toString());
    sessionStorage.setItem('SearchVehicleId', searchVehicleId.toString());

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        SearchVehicleId: searchVehicleId,
    });

    $("#beginDateTimeLabel").text(beginDateTime == null ? thismonth : moment(beginDateTime).format('YYYY/MM/DD'));
    $("#endDateTimeLabel").text(endDateTime == null ? thisDate : moment(endDateTime).format('YYYY/MM/DD'));
});

/**預設日期 */
function SetDefaultSerach() {
    $("#BeginDateTime").val(thismonth);
    $("#EndDateTime").val(thisDate);
}

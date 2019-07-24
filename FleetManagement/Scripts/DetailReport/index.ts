import * as s from './service';
import { SearchModel } from './module';
import moment = require('../../Content/bower_components/moment/moment');
import { PrintType } from '../Shared/module';
let service = new s.DetailReportService();

let thismonth = moment(new Date()).startOf('month').format('YYYY/MM/DD');
let thisDate = moment(new Date()).format('YYYY/MM/DD');

$(document).ready(async function () {

    SetDefaultSerach();

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
    var SearchCompanyId = sessionStorage.getItem('SearchCompanyId');
    var SearchVehicleId = sessionStorage.getItem('SearchVehicleId');
    var SearchDriverId = sessionStorage.getItem('SearchDriverId');
    var SearchGoodOwnerId = sessionStorage.getItem('SearchGoodOwnerId');

    let input: SearchModel = {
        BeginDateTime: SearchBeginDateTime == null ? thismonth : SearchBeginDateTime,
        EndDateTime: SearchEndDateTime == null ? null : SearchEndDateTime,
        SearchCompanyId: SearchCompanyId == null ? null : parseInt(SearchCompanyId,10),
        SearchVehicleId: SearchVehicleId == null ? null : parseInt(SearchVehicleId, 10),
        SearchDriverId: SearchDriverId == null ? ' ' : SearchDriverId,
        SearchGoodOwnerId: SearchGoodOwnerId == null ? ' ' : SearchGoodOwnerId
    };

    service.SearchBaseBookingReport(input);
    FillDateTimeLabel(SearchBeginDateTime == null ? thismonth : SearchBeginDateTime, 
        SearchEndDateTime == null ? thisDate : SearchEndDateTime);

    service.SearchDetailResult(input);

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
    let searchCompanyId: number = <number>$("#SearchCompanyId").val();
    let searchVehicleId: number = <number>$("#SearchVehicleId").val();
    let searchDriverId: string = <string>$("#SearchDriverId").val();
    let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

    sessionStorage.setItem('SearchBeginDateTime', beginDateTime);
    sessionStorage.setItem('SearchEndDateTime', endDateTime);
    sessionStorage.setItem('SearchCompanyId', searchCompanyId.toString());
    sessionStorage.setItem('SearchVehicleId', searchVehicleId.toString());
    sessionStorage.setItem('SearchDriverId', searchDriverId.toString());
    sessionStorage.setItem('SearchGoodOwnerId', searchGoodOwnerId.toString());

    let input: SearchModel = {
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        SearchCompanyId: searchCompanyId,
        SearchVehicleId: searchVehicleId,
        SearchDriverId: searchDriverId,
        SearchGoodOwnerId: searchGoodOwnerId
    };

    service.SearchDetailResult(input);
    FillDateTimeLabel(beginDateTime, endDateTime);
    service.SearchBaseBookingReport(input);
});

/**
 * 填充日期Label
 * @param BeginDateTime
 * @param EndDateTime
 */
function FillDateTimeLabel(BeginDateTime, EndDateTime) {
    $("#beginDateTimeLabel").text(BeginDateTime);
    $("#endDateTimeLabel").text(EndDateTime);
}

/**預設日期 */
function SetDefaultSerach() {
    $("#BeginDateTime").val(thismonth);
    $("#EndDateTime").val(thisDate);
}
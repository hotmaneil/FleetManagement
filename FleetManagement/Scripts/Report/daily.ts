import * as s from './dailyService';
import { PrintType } from '../Shared/module';

let service = new s.ReportDailyService();

$(document).ready(async function () {

    let yearMonth: string = <string>$("#SearchYearMonth").val();
    let detailDriverId: string = <string>$("#SearchDriverId").val();
    let detailGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

    service.SearchDailyReport({
        SearchYearMonth: yearMonth,
        SearchCompanyId: null,
        SearchVehicleId: null,
        SearchDriverId: detailDriverId,
        SearchGoodOwnerId: detailGoodOwnerId
    });

    //匯出Excel及PDF
    $("#submitBtn").on("click", function (event) {
        event.preventDefault();
        service.ExportExcelOrPDF(PrintType.landscape);
    });

    /**列印*/
    $("#PrintBtn").click(function () {
        service.Print();
    });
});

//搜尋司機每日趟次統計
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let searchYearMonth: string = <string>$("#SearchYearMonth").val();
    let searchDriverId: string = <string>$("#SearchDriverId").val();
    let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

    service.SearchDailyReport({
        SearchYearMonth: searchYearMonth,
        SearchCompanyId: null,
        SearchVehicleId: null,
        SearchDriverId: searchDriverId,
        SearchGoodOwnerId: searchGoodOwnerId
    });
});




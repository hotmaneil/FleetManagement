import * as s from './vehicleMissionService';
import { PrintType } from '../Shared/module';
let service = new s.vehicleMissionReportService();

$(document).ready(async function () {

    let yearMonth: string = <string>$("#SearchYearMonth").val();
    let searchVehicleId: number = <number>$("#SearchVehicleId").val();

    service.SearchVehicleMissionList({
        SearchYearMonth: yearMonth,
        SearchCompanyId: null,
        SearchVehicleId: searchVehicleId,
        SearchDriverId: null,
        SearchGoodOwnerId: null
    });

    service.ExportExcelOrPDF(PrintType.landscape);

    var licenseNumberLabel = $(`#SearchVehicleId option[value='${searchVehicleId}']`).text();
    $("#licenseNumberLabel").text(licenseNumberLabel);
});

//搜尋車輛任務列表
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let yearMonth: string = <string>$("#SearchYearMonth").val();
    let searchVehicleId: number = <number>$("#SearchVehicleId").val();
    let searchDriverId: string = <string>$("#SearchDriverId").val();
    let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

    service.SearchVehicleMissionList({
        SearchYearMonth: yearMonth,
        SearchCompanyId: null,
        SearchVehicleId: searchVehicleId,
        SearchDriverId: searchDriverId,
        SearchGoodOwnerId: searchGoodOwnerId
    });
});



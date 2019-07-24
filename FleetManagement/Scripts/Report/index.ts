import * as s from './service';
let service = new s.ReportService();

import moment = require('../../Content/bower_components/moment/moment');
import { PrintType } from '../Shared/module';


$(document).ready(async function () {

    $('.menu .item').tab();

    //匯出Excel及PDF
    $("#submitBtn").on("click", function (event) {
        event.preventDefault();

        //目前Tab位置
        var tabValue = $("#reportTab .item.active").attr("data-tab");

        switch (tabValue) {
            case "driverTab":
                service.ExportExcelOrPDF(PrintType.landscape, "DriverReport");
                break;

            case "vehicleTab":
                service.ExportExcelOrPDF(PrintType.landscape, "VehicleReport");
                break;

            case "customerTab":
                service.ExportExcelOrPDF(PrintType.landscape, "CustomerReport");
                break;
        }
    });

    //列印
    $("#PrintBtn").click(function (event) {
        event.preventDefault();

        //目前Tab位置
        var tabValue = $("#reportTab .item.active").attr("data-tab");

        switch (tabValue) {
            case "driverTab":
                service.PrintReport("DriverReport");
                break;

            case "vehicleTab":
                service.PrintReport("VehicleReport");
                break;

            case "customerTab":
                service.PrintReport("CustomerReport");
                break;
        }
    });
});

//搜尋月報表
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let searchYearMonth: string = <string>$("#SearchYearMonth").val();
    let searchCompanyId: number = <number>$("#SearchCompanyId").val();
    let searchVehicleId: number = <number>$("#SearchVehicleId").val();
    let searchDriverId: string = <string>$("#SearchDriverId").val();
    let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

    service.SearchMonthReport({
        SearchYearMonth: searchYearMonth,
        SearchCompanyId: searchCompanyId,
        SearchVehicleId: searchVehicleId,
        SearchDriverId: searchDriverId,
        SearchGoodOwnerId: searchGoodOwnerId
    });

    //chrome可以轉，但是IE無法轉
    //$("#yearLabel").text(moment(searchYearMonth).format('YYYY'));
    //$("#monthLabel").text(moment(searchYearMonth).format('MM'));

    //chrome可以轉，但是IE無法轉，因此改用如下
    var yearMonth = searchYearMonth.split("/");
    var year = yearMonth[0];
    var month = new Date(yearMonth[0] + "/" + yearMonth[1] + "/01").getMonth() + 1;

    $("#yearLabel").text(year);
    $("#monthLabel").text(month);
});

//月報表司機列表 href功能
$("#driverMStatistics").on("click", "div label", function () {

    let searchYearMonth: string = <string>$("#SearchYearMonth").val();
    let detailDriverId: string = <string>($(this).attr("detailDriverId"));

    location.href = "DailyStatisticsPage?YearMonth=" + searchYearMonth + "&DriverId=" + detailDriverId + "&CustomerId=";
});

//月報表車輛列表 href功能
$("#vehicleStatistics").on("click", "div label", function () {

    event.preventDefault();

    let searchYearMonth: string = <string>$("#SearchYearMonth").val();
    let detailVehicleId: string = <string>($(this).attr("detailVehicleId"));

    location.href = "VehicleMissionList?YearMonth=" + searchYearMonth + "&VehicleId=" + detailVehicleId;
});

//月報表客戶列表 href功能
$("#customerStatistics").on("click", "div label", function () {

    event.preventDefault();

    let searchYearMonth: string = <string>$("#SearchYearMonth").val();
    let detailCustomerId: string = <string>($(this).attr("detailCustomerId"));

    location.href = "DailyStatisticsPage?YearMonth=" + searchYearMonth + "&DriverId=&CustomerId=" + detailCustomerId;
});


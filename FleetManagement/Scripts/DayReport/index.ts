import * as s from './service';
import moment = require('../../Content/bower_components/moment/moment');
import { PrintType } from '../Shared/module';
import { DayReportSearchModel } from './module';
let service = new s.DayReportService();

let thismonth = moment(new Date()).startOf('month').format('YYYY/MM/DD');
let thisDate = moment(new Date()).format('YYYY/MM/DD');

$(document).ready(async function () {

    SetDefaultSerach();

    $('.menu .item').tab();

    DefaultTabFunction()

    //司機日趟次報表
    $('.menu>[data-tab=driverTimesTab]').tab({
        cache: false,
        apiSettings: {
            loadingDuration: 1000,
            mockResponse: function () {

                let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
                let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
                let searchCompanyId: number = <number>$("#SearchCompanyId").val();
                let searchVehicleId: number = <number>$("#SearchVehicleId").val();
                let searchDriverId: string = <string>$("#SearchDriverId").val();
                let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

                FillDateTimeLabel(beginDateTime, endDateTime);

                let input: DayReportSearchModel = {
                    BeginDateTime: beginDateTime,
                    EndDateTime: endDateTime,
                    SearchCompanyId: searchCompanyId,
                    SearchVehicleId: searchVehicleId,
                    SearchDriverId: searchDriverId,
                    SearchGoodOwnerId: searchGoodOwnerId
                };

                service.SearchDriverDayTimesReportList(input);
                service.SearchBaseBookingReportMonth(input);
            },
        }
    });

    //司機日運費報表
    $('.menu>[data-tab=driverChargeTab]').tab({
        cache: false,
        apiSettings: {
            loadingDuration: 1000,
            mockResponse: function () {

                let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
                let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
                let searchCompanyId: number = <number>$("#SearchCompanyId").val();
                let searchVehicleId: number = <number>$("#SearchVehicleId").val();
                let searchDriverId: string = <string>$("#SearchDriverId").val();
                let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

                FillDateTimeLabel(beginDateTime, endDateTime);

                let input: DayReportSearchModel = {
                    BeginDateTime: beginDateTime,
                    EndDateTime: endDateTime,
                    SearchCompanyId: searchCompanyId,
                    SearchVehicleId: searchVehicleId,
                    SearchDriverId: searchDriverId,
                    SearchGoodOwnerId: searchGoodOwnerId
                };

                service.SearchDriverDayChargeReportList(input);
                service.SearchBaseBookingReportMonth(input);
            },
        }
    });

    //車輛日趟數報表
    $('.menu>[data-tab=vehicleTimesTab]').tab({
        cache: false,
        apiSettings: {
            loadingDuration: 1000,
            mockResponse: function () {

                let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
                let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
                let searchCompanyId: number = <number>$("#SearchCompanyId").val();
                let searchVehicleId: number = <number>$("#SearchVehicleId").val();
                let searchDriverId: string = <string>$("#SearchDriverId").val();
                let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

                FillDateTimeLabel(beginDateTime, endDateTime);

                let input: DayReportSearchModel = {
                    BeginDateTime: beginDateTime,
                    EndDateTime: endDateTime,
                    SearchCompanyId: searchCompanyId,
                    SearchVehicleId: searchVehicleId,
                    SearchDriverId: searchDriverId,
                    SearchGoodOwnerId: searchGoodOwnerId
                };

                service.SearchVehicleDayTimesReportList(input);
                service.SearchBaseBookingReportMonth(input);
            },
        }
    });

    //車輛日運費報表
    $('.menu>[data-tab=vehicleChargeTab]').tab({
        cache: false,
        apiSettings: {
            loadingDuration: 1000,
            mockResponse: function () {

                let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
                let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
                let searchCompanyId: number = <number>$("#SearchCompanyId").val();
                let searchVehicleId: number = <number>$("#SearchVehicleId").val();
                let searchDriverId: string = <string>$("#SearchDriverId").val();
                let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

                FillDateTimeLabel(beginDateTime, endDateTime);

                let input: DayReportSearchModel = {
                    BeginDateTime: beginDateTime,
                    EndDateTime: endDateTime,
                    SearchCompanyId: searchCompanyId,
                    SearchVehicleId: searchVehicleId,
                    SearchDriverId: searchDriverId,
                    SearchGoodOwnerId: searchGoodOwnerId
                };

                service.SearchVehicleDayChargeReportList(input);
                service.SearchBaseBookingReportMonth(input);
            },
        }
    });

    //客戶日趟數報表
    $('.menu>[data-tab=customerTimeTab]').tab({
        cache: false,
        apiSettings: {
            loadingDuration: 1000,
            mockResponse: function () {

                let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
                let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
                let searchCompanyId: number = <number>$("#SearchCompanyId").val();
                let searchVehicleId: number = <number>$("#SearchVehicleId").val();
                let searchDriverId: string = <string>$("#SearchDriverId").val();
                let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

                FillDateTimeLabel(beginDateTime, endDateTime);

                let input: DayReportSearchModel = {
                    BeginDateTime: beginDateTime,
                    EndDateTime: endDateTime,
                    SearchCompanyId: searchCompanyId,
                    SearchVehicleId: searchVehicleId,
                    SearchDriverId: searchDriverId,
                    SearchGoodOwnerId: searchGoodOwnerId
                };

                service.SearchCustomerDayTimesReportList(input);
                service.SearchBaseBookingReportMonth(input);
            },
        }
    });

    //客戶日運費報表
    $('.menu>[data-tab=customerChargeTab]').tab({
        cache: false,
        apiSettings: {
            loadingDuration: 1000,
            mockResponse: function () {

                let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
                let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
                let searchCompanyId: number = <number>$("#SearchCompanyId").val();
                let searchVehicleId: number = <number>$("#SearchVehicleId").val();
                let searchDriverId: string = <string>$("#SearchDriverId").val();
                let searchGoodOwnerId: string = <string>$("#SearchGoodOwnerId").val();

                FillDateTimeLabel(beginDateTime, endDateTime);

                let input: DayReportSearchModel = {
                    BeginDateTime: beginDateTime,
                    EndDateTime: endDateTime,
                    SearchCompanyId: searchCompanyId,
                    SearchVehicleId: searchVehicleId,
                    SearchDriverId: searchDriverId,
                    SearchGoodOwnerId: searchGoodOwnerId
                };

                service.SearchCustomerDayChargeReportList(input);
                service.SearchBaseBookingReportMonth(input);
            },
        }
    });

    //匯出Excel or PDF
    $("#submitBtn").on("click", function (event) {
        event.preventDefault();

        var tabValue = $("#reportTab .item.active").attr("data-tab");
        switch (tabValue) {
            case "driverTimesTab":
                service.ExportExcelOrPDF(PrintType.landscape, "DriverTimesReport");
                break;

            case "driverChargeTab":
                service.ExportExcelOrPDF(PrintType.landscape, "DriverChargeReport");
                break;

            case "vehicleTimesTab":
                service.ExportExcelOrPDF(PrintType.landscape, "VehicleTimesReport");
                break;

            case "vehicleChargeTab":
                service.ExportExcelOrPDF(PrintType.landscape, "VehicleChargeReport");
                break;

            case "customerTimeTab":
                service.ExportExcelOrPDF(PrintType.landscape, "CustomerTimesReport");
                break;

            case "customerChargeTab":
                service.ExportExcelOrPDF(PrintType.landscape, "CustomerCgargeReport");
                break;
        }
    });

    //按下Tab設定標題值
    $("#reportTab").click(function () {
        var tabName = $("#reportTab .item.active").text();
        $("#TitleLabel").text(tabName);
    });

    //列印
    $("#PrintBtn").click(function (event) {
        event.preventDefault();

        var tabValue = $("#reportTab .item.active").attr("data-tab");

        switch (tabValue) {
            case "driverTimesTab":
                service.PrintReport("DriverTimesReport");
                break;

            case "driverChargeTab":
                service.PrintReport("DriverChargeReport");
                break;

            case "vehicleTimesTab":
                service.PrintReport("VehicleTimesReport");
                break;

            case "vehicleChargeTab":
                service.PrintReport("VehicleChargeReport");
                break;

            case "customerTimeTab":
                service.PrintReport("CustomerTimesReport");
                break;

            case "customerChargeTab":
                service.PrintReport("CustomerChargeReport");
                break;
        }
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

    let input: DayReportSearchModel = {
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        SearchCompanyId: searchCompanyId,
        SearchVehicleId: searchVehicleId,
        SearchDriverId: searchDriverId,
        SearchGoodOwnerId: searchGoodOwnerId
    };

    var tabValue = $("#reportTab .item.active").attr("data-tab");

    switch (tabValue) {
        case "driverTimesTab":
            service.SearchDriverDayTimesReportList(input);
            break;

        case "driverChargeTab":
            service.SearchDriverDayChargeReportList(input);
            break;

        case "vehicleTimesTab":
            service.SearchVehicleDayTimesReportList(input);
            break;

        case "vehicleChargeTab":
            service.SearchVehicleDayChargeReportList(input);
            break;

        case "customerTimeTab":
            service.SearchCustomerDayTimesReportList(input);
            break;

        case "customerChargeTab":
            service.SearchCustomerDayChargeReportList(input);
            break;
    }

    service.SearchBaseBookingReportMonth(input);
    FillDateTimeLabel(beginDateTime, endDateTime);
});

/**
 * Tab預設功能
 * */
function DefaultTabFunction() {
    var tabName = $("#reportTab .item.active").text();
    $("#TitleLabel").text(tabName);
}

/**
 * 填充日期Label
 * @param BeginDateTime
 * @param EndDateTime
 */
function FillDateTimeLabel(BeginDateTime, EndDateTime) {
    $("#beginDateTimeLabel").text(BeginDateTime);
    $("#endDateTimeLabel").text(EndDateTime);
}

/**
 * 檢查查詢月份
 * @param EndDateTime
 */
export function CheckSearchDateTime(EndDateTime) {

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");

    let beginMonth = new Date(beginDateTime).getMonth() + 1;
    let endMonth = new Date(EndDateTime).getMonth() + 1;

    if (beginMonth != endMonth) {
        return false;
    } else {
        return true;
    }
}

//檢查查詢月份驗證
$.fn.form.settings.rules.CheckSearchDateTime = function (param) {
    var result = CheckSearchDateTime(param);
    return result;
}

/**
 * 查詢驗證規則
 * */
var validateQueryFormFieldsRule = {

    BeginDateTime: {
        identifier: 'BeginDateTime',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入開始時間'
            }
        ]
    },

    EndDateTime: {
        identifier: 'EndDateTime',
        rules: [
            {
                type: 'CheckSearchDateTime[param]',
                prompt: '月份必須跟開始時間一樣！'
            }
        ]
    }
}

//套用查詢驗證規則
$("#SearchForm").form({
    on: 'blur',
    inline: true,
    fields: validateQueryFormFieldsRule
});

/**預設日期 */
function SetDefaultSerach() {
    $("#BeginDateTime").val(thismonth);
    $("#EndDateTime").val(thisDate);
}



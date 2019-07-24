import { IDayReportService, DayReportSearchModel } from "./module";
import { AjaxOption, DoAjax, HttpStatusCode, CreateMessage, InfoType, PrintType } from "../Shared/module";
import moment = require("../../Content/bower_components/moment/moment");

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';
import { DashBoardModel } from "../Report/module";
import { PrintHtml } from "../Shared/function";

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

//Table元件
let driverTimesTable;
let driverChargeTable;
let vehicleTimesTable;
let vehicleChargeTable;
let customerTimesTable;
let customerChargeTable;

//Table HTML
var driverTimesTableHTML;
var driverChargeTableHTML;
var vehicleTimesTableHTML;
var vehicleChargeTableHTML;
var customerTimesTableHTML;
var customerChargeTableHTML;

/**
 * DayReportService 日報表 服務
 * */
export class DayReportService implements IDayReportService {

    /**
     * 搜尋司機趟數報表
     * @param input
     */
    SearchDriverDayTimesReportList(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetDriverDayTimesReportList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchDriverDayTimesReportList", res, month, day);
            },
            function (res) { ERROR("SearchDriverDayTimesReportList", res); },
            function () { BeforeSend("SearchDriverDayTimesReportList", '#driverTimesDataTable'); },
            null);
    }

    /**
     * 搜尋司機運費報表
     * @param input
     */
    SearchDriverDayChargeReportList(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetDriverDayChargeReportList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchDriverDayChargeReportList", res, month, day);
            },
            function (res) { ERROR("SearchDriverDayChargeReportList", res); },
            function () { BeforeSend("SearchDriverDayChargeReportList", '#driverChargeDataTable'); },
            null);
    }

    /**
     * 搜尋車輛趟數報表
     * @param input
     */
    SearchVehicleDayTimesReportList(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetVehicleDayTimesReportList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchVehicleDayTimesReportList", res, month, day);
            },
            function (res) { ERROR("SearchVehicleDayTimesReportList", res); },
            function () { BeforeSend("SearchVehicleDayTimesReportList", '#vehicleTimesDataTable'); },
            null);
    }

    /**
     * 搜尋車輛運費報表
     * @param input
     */
    SearchVehicleDayChargeReportList(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetVehicleDayChargeReportList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchVehicleDayChargeReportList", res, month, day);
            },
            function (res) { ERROR("SearchVehicleDayChargeReportList", res); },
            function () { BeforeSend("SearchVehicleDayChargeReportList", '#vehicleChargeDataTable'); },
            null);
    }

    /**
     * 搜尋客戶趟數報表
     * @param input
     */
    SearchCustomerDayTimesReportList(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetCustomerDayTimesReportList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchCustomerDayTimesReportList", res, month, day);
            },
            function (res) { ERROR("SearchCustomerDayTimesReportList", res); },
            function () { BeforeSend("SearchCustomerDayTimesReportList", '#customerTimesDataTable'); },
            null);
    }

    /**
     * 搜尋客戶運費報表
     * @param input
     */
    SearchCustomerDayChargeReportList(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetCustomerDayChargeReportList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchCustomerDayChargeReportList", res, month, day);
            },
            function (res) { ERROR("SearchCustomerDayChargeReportList", res); },
            function () { BeforeSend("SearchCustomerDayChargeReportList", '#customerTimesDataTable'); },
            null);
    }

    /**
     * 取得總趟次與運費
     * @param input
     */
    SearchBaseBookingReportMonth(input: DayReportSearchModel) {

        let month = new Date(input.BeginDateTime).getMonth() + 1;
        let day = new Date(input.EndDateTime).getDate();

        let setting: AjaxOption = {
            url: '/Report/GetBaseBookingReportMonth',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchBaseBookingReportMonth", res, month, day);
            },
            function (res) { ERROR("SearchBaseBookingReportMonth", res); },
            function () { },
            null);
    }

    /**
     * 依照報表種類報表匯出Excel及PDF
     * @param print
     * @param reportType
     */
    ExportExcelOrPDF(print: PrintType, reportType: string) {

        /**查詢時間*/
        let yearMonth = moment().format("YYMM");
        let fileName: string = "營業日報表_" + yearMonth;
        let type = $("#exportType").closest(".dropdown").dropdown("get value");

        switch (reportType) {
            case "DriverTimesReport":
                fileName += "_司機趟次";
                switch (type) {
                    case "Excel":
                        //driverTimesTable.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#" + reportType).submit();
                        break;
                    case "Pdf":
                        driverTimesTable.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "DriverChargeReport":
                fileName += "_司機運費";
                switch (type) {
                    case "Excel":
                        //driverChargeTable.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#" + reportType).submit();
                        break;
                    case "Pdf":
                        driverChargeTable.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "VehicleTimesReport":
                fileName += "_車輛趟次";
                switch (type) {
                    case "Excel":
                        //vehicleTimesTable.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#" + reportType).submit();
                        break;
                    case "Pdf":
                        vehicleTimesTable.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "VehicleChargeReport":
                fileName += "_車輛運費";
                switch (type) {
                    case "Excel":
                        //vehicleChargeTable.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#" + reportType).submit();
                        break;
                    case "Pdf":
                        vehicleChargeTable.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "CustomerTimesReport":
                fileName += "_客戶趟次";
                switch (type) {
                    case "Excel":
                        //customerTimesTable.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#" + reportType).submit();
                        break;
                    case "Pdf":
                        customerTimesTable.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "CustomerCgargeReport":
                fileName += "_客戶運費";
                switch (type) {
                    case "Excel":
                        //customerChargeTable.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#" + reportType).submit();
                        break;
                    case "Pdf":
                        customerChargeTable.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;
        }
    }

    /**
     * 列印
     * @param reportType
     */
    PrintReport(reportType: string) {

        let title = "";

        /**查詢時間*/
        let queryDate = moment().format("YYMMDD");
        let fileName: string = "營業日報表_" + queryDate;

        switch (reportType) {
            case "DriverTimesReport":
                title = fileName += "_司機趟次";
                PrintHtml(title, driverTimesTableHTML);
                break;

            case "DriverChargeReport":
                title = fileName += "_司機運費";
                PrintHtml(title, driverChargeTableHTML);
                break;

            case "VehicleTimesReport":
                title = fileName += "_車輛趟次";
                PrintHtml(title, vehicleTimesTableHTML);
                break;

            case "VehicleChargeReport":
                title = fileName += "_車輛運費";
                PrintHtml(title, vehicleChargeTableHTML);
                break;

            case "CustomerTimesReport":
                title = fileName += "_客戶趟次";
                PrintHtml(title, customerTimesTableHTML);
                break;

            case "CustomerChargeReport":
                title = fileName += "_客戶運費";
                PrintHtml(title, customerChargeTableHTML);
                break;
        }
    }
}

/*列舉流程步驟*/
type flowStep =
    "SearchDriverDayTimesReportList" |
    "SearchDriverDayChargeReportList" |
    "SearchVehicleDayTimesReportList" |
    "SearchVehicleDayChargeReportList" |
    "SearchCustomerDayTimesReportList" |
    "SearchCustomerDayChargeReportList" |
    "SearchBaseBookingReportMonth";

/**
 * 回傳成功結果
 * @param Step
 * @param res
 */
function SUCCESS(Step: flowStep, res: any, Month: number, Day: number) {

    let _this = this;

    switch (res.HttpStatusCode) {

        case HttpStatusCode.OK:
            switch (Step) {
                case "SearchDriverDayTimesReportList":
                    GenerateDriverDayTimesReportList(res.Data, Month, Day);
                    break;

                case "SearchDriverDayChargeReportList":
                    GenerateDriverDayChargeReportList(res.Data, Month, Day);
                    break;

                case "SearchVehicleDayTimesReportList":
                    GenerateVehicleDayTimesReportList(res.Data, Month, Day);
                    break;

                case "SearchVehicleDayChargeReportList":
                    GenerateVehicleDayChargeReportList(res.Data, Month, Day);
                    break;

                case "SearchCustomerDayTimesReportList":
                    GenerateCustomerDayTimesReportList(res.Data, Month, Day);
                    break;

                case "SearchCustomerDayChargeReportList":
                    GenerateCustomerDayChargeReportList(res.Data, Month, Day);
                    break;

                case "SearchBaseBookingReportMonth":
                    SetDashBoard(res.Data);
                    break;
            }
            break;
    }
}

/**
 * 回傳失敗結果
 * @param Step
 * @param res
 */
function ERROR(Step: flowStep, res: any) {

    let message: string = String.empty;

    switch (res.HttpStatusCode) {
        case HttpStatusCode.NOT_FOUND:
            window.location.href = '@Url.Action("NotFound", "Error")';
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
                case "SearchDriverDayTimesReportList":
                    toastr["error"](res.Message);
                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
                    $("#driverTimesDataTable").empty().append(tableMessage);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {

            }
            break;
    }
}

/**
 * 送出前
 * @param Step
 * @param selector
 */
function BeforeSend(Step: flowStep, selector: string) {
    let skeleton: string = String.empty;
    switch (Step) {

    }
    $(selector).empty().append(skeleton);
}

/**
 * 產生司機日趟數報表
 * @param Data
 */
export function GenerateDriverDayTimesReportList(Data, Month: number, DayCount: number) {

    let dataTable = $("#driverTimesDataTable");

    let thead = "";
    let trs = "";

    let dayThead = "";
    for (let dayCount = 1; dayCount <= DayCount; dayCount++) {
        dayThead += `<th>${Month}/${dayCount}</th>`;
    }

    thead =
    `<thead>
        <tr>
            <th>司機姓名</th>
            ${dayThead}
        </tr>
    </thead>`;

    trs = CommonTrsTemplate(Data, DayCount, 'DriverName');

    let tableHtml = `<table id="driverTimesTable" class="ui celled table">
                        ${thead}
                        <tbody>
                            ${trs}
                        </tbody>
                    </table>`;

    dataTable.append(tableHtml);
    driverTimesTableHTML = tableHtml;

    driverTimesTable = new Tabulator("#driverTimesTable", null);
}

/**
 * 產生司機日運費報表
 * @param Data
 * @param Month
 * @param DayCount
 */
export function GenerateDriverDayChargeReportList(Data, Month: number, DayCount: number) {

    let dataTable = $("#driverChargeDataTable");

    let thead = "";
    let trs = "";

    let dayThead = "";
    for (let dayCount = 1; dayCount <= DayCount; dayCount++) {
        dayThead += `<th>${Month}/${dayCount}</th>`;
    }

    thead =
        `<thead>
        <tr>
            <th>司機姓名</th>
            ${dayThead}
        </tr>
    </thead>`;

    trs = CommonTrsTemplate(Data, DayCount, 'DriverName');

    let tableHtml = `<table id="driverChargeTable" class="ui celled table">
                        ${thead}
                        <tbody>
                            ${trs}
                        </tbody>
                    </table>`;

    dataTable.append(tableHtml);
    driverChargeTableHTML = tableHtml;

    driverChargeTable = new Tabulator("#driverChargeTable", null);
}

/**
 * 產生車輛日趟數報表
 * @param Data
 * @param Month
 * @param DayCount
 */
export function GenerateVehicleDayTimesReportList(Data, Month: number, DayCount: number) {

    let dataTable = $("#vehicleTimesDataTable");

    let thead = "";
    let trs = "";

    let dayThead = "";
    for (let dayCount = 1; dayCount <= DayCount; dayCount++) {
        dayThead += `<th>${Month}/${dayCount}</th>`;
    }

    thead =
        `<thead>
        <tr>
            <th>車號</th>
            ${dayThead}
        </tr>
    </thead>`;

    trs = CommonTrsTemplate(Data, DayCount, 'LicenseNumber');

    let tableHtml = `<table id="vehicleTimesTable" class="ui celled table">
                        ${thead}
                        <tbody>
                            ${trs}
                        </tbody>
                    </table>`;

    dataTable.append(tableHtml);
    vehicleTimesTableHTML = tableHtml;

    vehicleTimesTable = new Tabulator("#vehicleTimesTable", null);
}

/**
 * 產生車輛日運費報表
 * @param Data
 * @param Month
 * @param DayCount
 */
export function GenerateVehicleDayChargeReportList(Data, Month: number, DayCount: number) {

    let dataTable = $("#vehicleChargeDataTable");

    let thead = "";
    let trs = "";

    let dayThead = "";
    for (let dayCount = 1; dayCount <= DayCount; dayCount++) {
        dayThead += `<th>${Month}/${dayCount}</th>`;
    }

    thead =
        `<thead>
        <tr>
            <th>車號</th>
            ${dayThead}
        </tr>
    </thead>`;

    trs = CommonTrsTemplate(Data, DayCount, 'LicenseNumber');

    let tableHtml = `<table id="vehicleChargeTable" class="ui celled table">
                        ${thead}
                        <tbody>
                            ${trs}
                        </tbody>
                    </table>`;

    dataTable.append(tableHtml);
    vehicleChargeTableHTML = tableHtml;

    vehicleChargeTable = new Tabulator("#vehicleChargeTable", null);
}

/**
 * 產生客戶日趟數報表
 * @param Data
 * @param Month
 * @param DayCount
 */
export function GenerateCustomerDayTimesReportList(Data, Month: number, DayCount: number) {

    let dataTable = $("#customerTimesDataTable");

    let thead = "";
    let trs = "";

    let dayThead = "";
    for (let dayCount = 1; dayCount <= DayCount; dayCount++) {
        dayThead += `<th>${Month}/${dayCount}</th>`;
    }

    thead =
        `<thead>
        <tr>
            <th>姓名</th>
            ${dayThead}
        </tr>
    </thead>`;

    trs = CommonTrsTemplate(Data, DayCount, 'CustomerName');

    let tableHtml = `<table id="customerTimesTable" class="ui celled table">
                        ${thead}
                        <tbody>
                            ${trs}
                        </tbody>
                    </table>`;

    dataTable.append(tableHtml);
    customerTimesTableHTML = tableHtml;

    customerTimesTable = new Tabulator("#customerTimesTable", null);
}

/**
 * 產生客戶日運費報表
 * @param Data
 * @param Month
 * @param DayCount
 */
export function GenerateCustomerDayChargeReportList(Data, Month: number, DayCount: number) {

    let dataTable = $("#customerChargeDataTable");
    dataTable.empty();

    let thead = "";
    let trs = "";

    let dayThead = "";
    for (let dayCount = 1; dayCount <= DayCount; dayCount++) {
        dayThead += `<th>${Month}/${dayCount}</th>`;
    }

    thead =
        `<thead>
        <tr>
            <th>姓名</th>
            ${dayThead}
        </tr>
    </thead>`;

    trs = CommonTrsTemplate(Data, DayCount, 'CustomerName');

    let tableHtml = `<table id="customerChargeTable" class="ui celled table">
                        ${thead}
                        <tbody>
                            ${trs}
                        </tbody>
                    </table>`;

    dataTable.append(tableHtml);
    customerChargeTableHTML = tableHtml;

    customerChargeTable = new Tabulator("#customerChargeTable", null);
}

/**
 * 共用 填入Trs 之樣板
 * @param Data
 * @param DayCount
 */
export function CommonTrsTemplate(Data, DayCount,HeaderName) {

    let trs = "";
    $.each(Data, function (key) {
        let tr = `
        <tr>
            <td>${Data[key][HeaderName]}</td>
            <td>${Data[key]['One']}</td>
            ${DayCount >= 2 ? `<td>${Data[key]['Two']}</td>` : ``}
            ${DayCount >= 3 ? `<td>${Data[key]['Three']}</td>` : ``}
            ${DayCount >= 4 ? `<td>${Data[key]['Four']}</td>` : ``}
            ${DayCount >= 5 ? `<td>${Data[key]['Five']}</td>` : ``}
            ${DayCount >= 6 ? `<td>${Data[key]['Six']}</td>` : ``}
            ${DayCount >= 7 ? `<td>${Data[key]['Seven']}</td>` : ``}
            ${DayCount >= 8 ? `<td>${Data[key]['Eight']}</td>` : ``}
            ${DayCount >= 9 ? `<td>${Data[key]['Nine']}</td>` : ``}
            ${DayCount >= 10 ? `<td>${Data[key]['Ten']}</td>` : ``}
            ${DayCount >= 11 ? `<td>${Data[key]['Eleven']}</td>` : ``}
            ${DayCount >= 12 ? `<td>${Data[key]['Twelve']}</td>` : ``}
            ${DayCount >= 13 ? `<td>${Data[key]['Thirteen']}</td>` : ``}
            ${DayCount >= 14 ? `<td>${Data[key]['Fourteen']}</td>` : ``}
            ${DayCount >= 15 ? `<td>${Data[key]['Fifteen']}</td>` : ``}
            ${DayCount >= 16 ? `<td>${Data[key]['Sixteen']}</td>` : ``}
            ${DayCount >= 17 ? `<td>${Data[key]['Seventeen']}</td>` : ``}
            ${DayCount >= 18 ? `<td>${Data[key]['Eighteen']}</td>` : ``}
            ${DayCount >= 19 ? `<td>${Data[key]['Nineteen']}</td>` : ``}
            ${DayCount >= 20 ? `<td>${Data[key]['Twenty']}</td>` : ``}
            ${DayCount >= 21 ? `<td>${Data[key]['TwentyOne']}</td>` : ``}
            ${DayCount >= 22 ? `<td>${Data[key]['TwentyTwo']}</td>` : ``}
            ${DayCount >= 23 ? `<td>${Data[key]['TwentyThree']}</td>` : ``}
            ${DayCount >= 24 ? `<td>${Data[key]['TwentyFour']}</td>` : ``}
            ${DayCount >= 25 ? `<td>${Data[key]['TwentyFive']}</td>` : ``}
            ${DayCount >= 26 ? `<td>${Data[key]['TwentySix']}</td>` : ``}
            ${DayCount >= 27 ? `<td>${Data[key]['TwentySeven']}</td>` : ``}
            ${DayCount >= 28 ? `<td>${Data[key]['TwentyEight']}</td>` : ``}
            ${DayCount >= 29 ? `<td>${Data[key]['TwentyNine']}</td>` : ``}
            ${DayCount >= 30 ? `<td>${Data[key]['Thirty']}</td>` : ``}
            ${DayCount >= 31 ? `<td>${Data[key]['ThirtyOne']}</td>` : ``}
        </tr>`;
        trs += tr;
    });
    return trs;
}

/**
 * 營業月報表 儀表板資訊
 * @param Data
 */
export function SetDashBoard(Data: DashBoardModel) {
    $("#TotalTransportationCharges").text(Data.TotalTransportationCharges);
    $("#TotalTimes").text(Data.TotalTimes);
}

import {
    IReportService,
    BookingReportMonthSearchModel,
    DashBoardModel,
    BookingReportMonthDriverList,
    BookingReportMonthVehicleList,
    BookingReportMonthGoodsOwnerList
} from "./module";

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';

import { AjaxOption, DoAjax, HttpStatusCode, CreateMessage, InfoType, PrintType } from "../Shared/module";
import moment = require("../../Content/bower_components/moment/moment");
import { PrintHtml } from "../Shared/function";

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

var tableDriver;
var tableVehicle;
var tableCustomer;

/**
 * ReportService 報表 服務
 * */
export class ReportService implements IReportService {

    /**
     * 搜尋月報表
     * @param input
     */
    SearchMonthReport(input: BookingReportMonthSearchModel) {

        let setting: AjaxOption = {
            url: '/Report/GetSearchResult',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                SearchYearMonth: input.SearchYearMonth,
                SearchCompanyId: input.SearchCompanyId,
                SearchVehicleId: input.SearchVehicleId,
                SearchDriverId: input.SearchDriverId,
                SearchGoodOwnerId: input.SearchGoodOwnerId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchMonthReport", res);
            },
            function (res) {
                ERROR("SearchMonthReport", res); },
            function () {
                BeforeSend("SearchMonthReport", ''); 
            },
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
        let fileName: string = "營業月報表_" + yearMonth;
        let type = $("#exportType").closest(".dropdown").dropdown("get value");

        switch (reportType) {
            case "DriverReport":
                fileName += "_司機";
                switch (type) {
                    case "Excel":
                        //tableDriver.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#DownLoadExcelDriver").submit();
                        break;
                    case "Pdf":
                        tableDriver.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "VehicleReport":
                fileName += "_車輛";
                switch (type) {
                    case "Excel":
                        //tableVehicle.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#DownLoadExcelVehicle").submit();
                        break;
                    case "Pdf":
                        tableVehicle.download("pdfmake", fileName + ".pdf", {
                            pdfMake: pdfMake,
                            vfs: vfs,
                            filename: fileName,
                            orientation: print
                        });
                        break;
                }
                break;

            case "CustomerReport":
                fileName += "_客戶";
                switch (type) {
                    case "Excel":
                        //tableCustomer.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                        $("#DownLoadExcelCustomer").submit();
                        break;
                    case "Pdf":
                        tableCustomer.download("pdfmake", fileName + ".pdf", {
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

        let thead = "";
        let trs = "";
        let title = "";

        /**查詢時間*/
        let yearMonth = moment().format("YYMM");
        let fileName: string = "營業月報表_" + yearMonth;

        switch (reportType) {
            case "DriverReport":
                let driverData = tableDriver.getData();
                title = fileName += "_司機";

                thead = `<thead>
                    <tr>
                        <th>姓名</th>
                        <th>總趟次</th>
                        <th>總運費</th>
                    </tr>
                </thead> `;

                $.each(driverData, function (key, list) {
                    let tr = `<tr>
                            <td>${driverData[key]['DriverName']}</td>
                            <td>${driverData[key]['TotalTimes']}</td>
                            <td>${driverData[key]['TotalTransportationCharges']}</td>`;
                    trs += tr;
                });
                let driverTableHtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
                PrintHtml(title, driverTableHtml);
                break;

            case "VehicleReport":
                let vehicleData = tableVehicle.getData();
                title = fileName += "_車輛";

                thead = `<thead>
                    <tr>
                        <th>車號</th>
                        <th>總趟次</th>
                        <th>總運費</th>
                    </tr>
                </thead> `;

                $.each(vehicleData, function (key, list) {
                    let tr = `<tr>
                            <td>${vehicleData[key]['LicenseNumber']}</td>
                            <td>${vehicleData[key]['TotalTimes']}</td>
                            <td>${vehicleData[key]['TotalTransportationCharges']}</td>`;
                    trs += tr;
                });
                let tableVehicleHtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
                PrintHtml(title, tableVehicleHtml);
                break;

            case "CustomerReport":
                let customerData = tableCustomer.getData();
                title = fileName += "_客戶";

                thead = `<thead>
                    <tr>
                        <th>姓名</th>
                        <th>總趟次</th>
                        <th>總運費</th>
                    </tr>
                </thead> `;

                $.each(customerData, function (key, list) {
                    let tr = `<tr>
                            <td>${customerData[key]['GoodsOwnerName']}</td>
                            <td>${customerData[key]['TotalTimes']}</td>
                            <td>${customerData[key]['TotalTransportationCharges']}</td>`;
                    trs += tr;
                });
                let tableCustomerHtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
                PrintHtml(title, tableCustomerHtml);
                break;
        }
    }
}


/*列舉流程步驟*/
type flowStep = "SearchMonthReport" |"SearchDailyReport";

/**
 * 回傳成功結果
 * @param Step
 * @param res
 */
function SUCCESS(Step: flowStep, res: any) {

    let _this = this;

    switch (res.HttpStatusCode) {

        case HttpStatusCode.OK:
            switch (Step) {
                case "SearchMonthReport":
                    SetDashBoard(res.Data.DashBoardInfo);
                    GenerateBookingReportMonthDriverList(res.Data.BookingReportMonthDriverList);
                    GenerateBookingReportMonthVehicleList(res.Data.BookingReportMonthVehicleList);
                    GenerateBookingReportMonthGoodsOwnerList(res.Data.BookingReportMonthGoodsOwnerList);
                    break;

                case "SearchDailyReport":
                    SetDashBoard(res.Data.DashBoardInfo);
                    
                    $("#UserName").text(res.Data.UserName);
                    $("#_UserName").text(res.Data.UserName);
                    break;
            }
            break;

        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
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
                case "SearchMonthReport":
                    toastr["error"](res.Message);
                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
                    $("#dataTable").empty().append(tableMessage);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
           
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
}

/**
 * 營業月報表 儀表板資訊
 * @param Data
 */
export function SetDashBoard(Data: DashBoardModel) {
    $("#TotalTransportationCharges").text(Data.TotalTransportationCharges);
    $("#TotalTimes").text(Data.TotalTimes);
}

/**
 * 營業月報表-司機
 * @param Data
 */
export function GenerateBookingReportMonthDriverList(Data: BookingReportMonthDriverList[]) {

    tableDriver = new Tabulator("#driverMStatistics", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "姓名", field: "DriverName", sorter: "string" },
            {
                title: "總趟次", field: "TotalTimes",
                formatter: function (cell, formatterParams) {
                    let driverId = cell.getRow().getData().DriverId;
                    let totalTimes = cell.getRow().getData().TotalTimes;
                    return `<label detailDriverId="${driverId}">
                        <font color="#00aeae">
                            ${totalTimes}
                        </font>
                    </label>`;
                }
            },
            { title: "總運費", field: "TotalTransportationCharges", sorter: "string" }
        ]
    });
    tableDriver.setData(Data);
}

/**
 * 營業月報表-車輛
 * @param Data
 */
export function GenerateBookingReportMonthVehicleList(Data: BookingReportMonthVehicleList[]) {

    tableVehicle = new Tabulator("#vehicleStatistics", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "車號", field: "LicenseNumber", sorter: "string" },
            {
                title: "總趟次", field: "TotalTimes",
                formatter: function (cell, formatterParams) {
                    let vehicleId = cell.getRow().getData().VehicleId;
                    let totalTimes = cell.getRow().getData().TotalTimes;
                    return `<label detailVehicleId="${vehicleId}">
                        <font color="#00aeae">
                            ${totalTimes}
                        </font>
                    </label>`;
                }
            },
            { title: "總運費", field: "TotalTransportationCharges", sorter: "string" }
        ]
    });
    tableVehicle.setData(Data);
}

/**
 * 營業月報表-客戶
 * @param Data
 */
export function GenerateBookingReportMonthGoodsOwnerList(Data: BookingReportMonthGoodsOwnerList[]) {

    tableCustomer = new Tabulator("#customerStatistics", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "姓名", field: "GoodsOwnerName", sorter: "string" },
            {
                title: "總趟次", field:"TotalTimes",
                formatter: function (cell, formatterParams) {
                    let goodsOwnerId = cell.getRow().getData().GoodsOwnerId;
                    let totalTimes = cell.getRow().getData().TotalTimes;
                    return `<label detailCustomerId="${goodsOwnerId}">
                        <font color="#00aeae">
                            ${totalTimes}
                        </font>
                    </label>`;
                }
            },
            { title: "總運費", field: "TotalTransportationCharges", sorter: "string" }
        ]
    });
    tableCustomer.setData(Data);
}


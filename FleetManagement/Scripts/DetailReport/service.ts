/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';

import {
    IDetailReportService,
    SearchModel,
    SearchResultList
} from "./module";

import {
    AjaxOption,
    DoAjax,
    HttpStatusCode,
    CreateMessage,
    InfoType,

    PrintType
} from "../Shared/module";
import { DashBoardModel } from "../Report/module";
import moment = require("../../Content/bower_components/moment/moment");
import { PrintHtml } from "../Shared/function";

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

var table;

/**
 * DetailReportService 報表 服務
 * */
export class DetailReportService implements IDetailReportService {

    /**
     * 搜尋明細報表
     * @param input
     */
    SearchDetailResult(input: SearchModel) {

        let setting: AjaxOption = {
            url: '/Report/GetDetailReportList',
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
                SUCCESS("SearchDetailResult", res);
            },
            function (res) { ERROR("SearchDetailResult", res); },
            function () { BeforeSend("SearchDetailResult", '#detailDataTable'); },
            null);
    }

    /**
     * 取得總趟次與運費
     * @param input
     */
    SearchBaseBookingReport(input: SearchModel) {

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
                SUCCESS("SearchBaseBookingReport", res);
            },
            function (res) { ERROR("SearchBaseBookingReport", res); },
            function () { },
            null);
    }

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType) {

        $("#exportForm").on("submit", function (event) {
            event.preventDefault();

            /**查詢時間*/
            let nowtime = moment().format("YYMMDDHHmmss");
            let fileName: string = "明細報表_" + nowtime;
            let type = $("#exportType").closest(".dropdown").dropdown("get value");
            switch (type) {
                case "Excel":
                    //table.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                    $("#DownLoadExcel").submit();
                    break;
                case "Pdf":
                    table.download("pdfmake", fileName + ".pdf", {
                        pdfMake: pdfMake,
                        vfs: vfs,
                        filename: fileName,
                        orientation: print
                    });
                    break;
            }
        });
    }

    /**列印 */
    Print() {

        let data = table.getData();
        let thead = "";
        let trs = "";
        let title = "";

        title = "<h3>明細報表</h3>";
        thead = `<thead>
                    <tr>
                        <th>車主</th>
                        <th>車號</th>
                        <th>日期</th>
                        <th>接貨時間</th>
                        <th>接貨地點</th>
                        <th>送貨地點</th>
                        <th>運費</th>
                        <th>貨主</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['DriverName']}</td>
                            <td>${data[key]['LicenseNumber']}</td>
                            <td>${data[key]['BookingDate']}</td>
                            <td>${data[key]['BookingTime']}</td>
                            <td>${data[key]['StartAddress']}</td>
                            <td>${data[key]['TargetAddress']}</td>
                            <td>${data[key]['TransportationCharges']}</td>
                            <td>${data[key]['GoodOwnerName']}</td>`;
            trs += tr;
        });
        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchDetailResult" |"SearchBaseBookingReport";

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
                case "SearchDetailResult":
                    GenerateDetailResultList(res.Data);
                    break;

                case "SearchBaseBookingReport":
                    SetDashBoard(res.Data);
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
                case "SearchDetailResult":
                    toastr["error"](res.Message);
                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
                    $("#detailDataTable").empty().append(tableMessage);
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
 * 產生明細報表列表
 * @param Data
 */
export function GenerateDetailResultList(Data: SearchResultList[]) {

    table = new Tabulator("#detailDataTable", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "序號", sorter: "number", width: 50, formatter: "rownum" },
            { title: "車主", field: "DriverName", sorter: "string" },
            { title: "車號", field: "LicenseNumber", sorter: "string" },
            { title: "日期", field: "BookingDate", sorter: "string" },
            { title: "接貨時間", field: "BookingTime", sorter: "string" },
            { title: "接貨地點", field: "StartAddress", sorter: "string" },
            { title: "送貨地點", field: "TargetAddress", sorter: "string" },
            { title: "運費", field: "TransportationCharges", sorter: "number" },
            { title: "貨主", field: "GoodOwnerName", sorter: "string" }
        ]
    });
    table.setData(Data);
}

/**
 * 明細報表 儀表板資訊
 * @param Data
 */
export function SetDashBoard(Data: DashBoardModel) {
    $("#TotalTransportationCharges").text(Data.TotalTransportationCharges);
    $("#TotalTimes").text(Data.TotalTimes);
}


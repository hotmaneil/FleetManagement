import {
    IIncomeStatementReportService,
    IncomeStatementReportSearchModel,
    SearchResultList
} from "./reportModule";

import {
    AjaxOption,
    DoAjax,
    HttpStatusCode,
    CreateMessage,
    InfoType,

    PrintType
} from "../Shared/module";

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';

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
 * IncomeStatementReportService 收支帳報表 服務
 * */
export class IncomeStatementReportService implements IIncomeStatementReportService {

    /**
     * 搜尋收支帳報表
     * @param input
     */
    SearchResult(input: IncomeStatementReportSearchModel) {

        let setting: AjaxOption = {
            url: '/IncomeStatement/GetIncomeStatementReportList',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                SearchVehicleId: input.SearchVehicleId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("SearchResult", res);
            },
            function (res) { ERROR("SearchResult", res); },
            function () { BeforeSend("SearchResult", '#dataTable'); },
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
            let fileName: string = "收支帳報表_" + nowtime;
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

        title = "<h3>收支帳報表</h3>";
        thead = `<thead>
                    <tr>
                        <th>車號</th>
                        <th>營業收入</th>
                        <th>油資</th>
                        <th>ETC</th>
                        <th>輪胎</th>
                        <th>維修保養</th>
                        <th>稅</th>
                        <th>罰鍰</th>
                        <th>保費</th>
                        <th>其他</th>
                        <th>小計</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['LicenseNumber']}</td>
                            <td>${data[key]['Income']}</td>
                            <td>${data[key]['Oil']}</td>
                            <td>${data[key]['ETC']}</td>
                            <td>${data[key]['Tire']}</td>
                            <td>${data[key]['Maintain']}</td>
                            <td>${data[key]['Tax']}</td>
                            <td>${data[key]['Fine']}</td>
                            <td>${data[key]['Insurance']}</td>
                            <td>${data[key]['Other']}</td>
                            <td>${data[key]['CalculateResult']}</td>`;
            trs += tr;
        });
        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult";

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
                case "SearchResult":
                    GenerateIncomeStatementReportList(res.Data);
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
                case "SearchResult":
                    toastr["error"](res.Message);
                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
                    $("#dataTable").empty().append(tableMessage);
                    break;
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
}

/**
 * 產生收支帳報表列表
 * @param Data
 */
export function GenerateIncomeStatementReportList(Data: SearchResultList[]) {

    table = new Tabulator("#dataTable", {
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
            { title: "營業收入", field: "Income", sorter: "number" },
            {
                title: "油資", field: "Oil", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "ETC", field: "ETC", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "輪胎", field: "Tire", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "維修保養", field: "Maintain", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "稅", field: "Tax", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "罰鍰", field: "Fine", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "保費", field: "Insurance", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            {
                title: "其他", field: "Other", sorter: "number", formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    if (value == 0)
                        return value;
                    else
                        return "-" + value;
                }
            },
            { title: "小計", field: "CalculateResult", sorter: "number" },
        ]
    });
    table.setData(Data);
}
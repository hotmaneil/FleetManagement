import {
    IIncomeStatementService,
    CreateIncomeStatementModel,
    IncomeStatementSearchModel,
    SearchResultList,
    EditIncomeStatementModel
} from "./module";

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';

import {
    AjaxOption,
    DoAjax,
    HttpStatusCode,
    CreateMessage,
    InfoType,
    PrintType
} from "../Shared/module";

import moment = require('../../Content/bower_components/moment/moment');
import { PrintHtml } from "../Shared/function";

let thisDate = moment(new Date()).format('YYYY/MM/DD');

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

var table;

/**
 * IncomeStatementService 收支帳 服務
 * */
export class IncomeStatementService implements IIncomeStatementService {

    /**
     * 搜尋收支帳
     * @param input
     */
    SearchResult(input: IncomeStatementSearchModel) {
        let setting: AjaxOption = {
            url: '/IncomeStatement/GetIncomeStatementList',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                CreateTime: input.CreateTime,
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
     * 新增收支帳
     * @param input
     */
    CreateIncomeStatement(input: CreateIncomeStatementModel) {
        let _this = this;
        let setting: AjaxOption = {
            url: '/IncomeStatement/CreateOrEditIncomeStatement',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                VehicleId: input.VehicleId,
                ItemId: input.ItemId,
                Amount: input.Amount,
                FrequencyId: input.FrequencyId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("CreateIncomeStatement", res);
                _this.SearchResult({
                    CreateTime: thisDate,
                    SearchVehicleId: null
                });
            },
            function (res) { ERROR("CreateIncomeStatement", res); },
            function () { BeforeSend("CreateIncomeStatement", '#CreateIncomeStatementModal .content'); },
            null);
    }

    /**
     * 編輯收支帳
     * @param input
     */
    EditIncomeStatement(input: EditIncomeStatementModel) {
        let _this = this;
        let setting: AjaxOption = {
            url: '/IncomeStatement/CreateOrEditIncomeStatement',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                Id: input.Id,
                CompanyId: input.CompanyId,
                VehicleId: input.VehicleId,
                ItemId: input.ItemId,
                Amount: input.Amount,
                FrequencyId: input.FrequencyId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("EditIncomeStatement", res);
                _this.SearchResult({
                    CreateTime: thisDate,
                    SearchVehicleId: null
                });
            },
            function (res) { ERROR("EditIncomeStatement", res); },
            function () { BeforeSend("EditIncomeStatement", '#CreateIncomeStatementModal .content'); },
            null);
    }

    /**
     * 取得一筆收支帳
     * @param input
     */
    GetIncomeStatement(Id: string) {

        let setting: AjaxOption = {
            url: '/IncomeStatement/GetIncomeStatement?Id='+Id,
            type: 'GET',
            dataType: 'json',
            cache: false
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("GetIncomeStatement", res);
            },
            function (res) { ERROR("GetIncomeStatement", res); },
            function () { BeforeSend("GetIncomeStatement", ''); },
            null);
    }

    /**
     * 刪除一筆收支帳
     * @param Id
     */
    DeleteIncomeStatement(Id: string) {
        let _this = this;

        let setting: AjaxOption = {
            url: '/IncomeStatement/DeleteIncomeStatement',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: { Id: Id }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("DeleteIncomeStatement", res);
                _this.SearchResult({
                    CreateTime: thisDate,
                    SearchVehicleId: null
                });
            },
            function (res) { ERROR("DeleteIncomeStatement", res); },
            function () { BeforeSend("DeleteIncomeStatement", ''); },
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
            let fileName: string = "收支帳列表_" + nowtime;
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

        title = "<h3>收支帳列表</h3>";
        thead = `<thead>
                    <tr>
                        <th>日期</th>
                        <th>車號</th>
                        <th>項目</th>
                        <th>金額</th>
                        <th>頻率</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['Date']}</td>
                            <td>${data[key]['LicenseNumber']}</td>
                            <td>${data[key]['Item']}</td>
                            <td>${data[key]['Amount']}</td>
                            <td>${data[key]['Frequency']}</td>`;
            trs += tr;
        });
        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult" | "CreateIncomeStatement" | "GetIncomeStatement"| "EditIncomeStatement" | "DeleteIncomeStatement";

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
                    GenerateIncomeStatementList(res.Data);
                    break;

                case "CreateIncomeStatement":
                    $("#CreateIncomeStatementModel").modal('hide');
                    toastr["success"]("新增成功");
                    break;

                case "GetIncomeStatement":
                    GenerateIncomeStatement(res.Data);
                    break;

                case "EditIncomeStatement":
                    $("#CreateIncomeStatementModel").modal('hide');
                    toastr["success"]("編輯成功");
                    break;

                case "DeleteIncomeStatement":
                    toastr['success']('刪除成功!');
                    break;
            }
            break;

        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {

                case "CreateIncomeStatement":
                    toastr["error"](res.Message);
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

                case "CreateIncomeStatement":
                    toastr['error']('新增失敗!' + res.Message);
                    break;

                case "GetIncomeStatement":
                    toastr["error"](res.Message);
                    break;

                case "EditIncomeStatement":
                    toastr['error']('編輯失敗!' + res.Message);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
                case "DeleteIncomeStatement":
                    toastr['error']('刪除失敗!');
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
        case "CreateIncomeStatement":
            break;
    }
}

/**
 * 產生收支帳資料列表
 * @param Data
 */
export function GenerateIncomeStatementList(Data: SearchResultList[]) {

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
            { title: "序號", sorter: "number", width: 50, formatter: "rownum" },
            { title: "日期", field: "Date", sorter: "string" },
            { title: "車號", field: "LicenseNumber", sorter: "string" },
            { title: "項目", field: "Item", sorter: "string" },
            { title: "金額", field: "Amount", sorter: "number" },
            { title: "頻率", field: "Frequency", sorter: "string" },
            {
                title: "編輯",
                formatter: function (cell, formatterParams) {
                    let Id = cell.getRow().getData().Id;
                    return `<button type="button" class="ui basic button circular blue" editId="${Id}">編輯</button>`;
                }
            },

            {
                title: "刪除",
                formatter: function (cell, formatterParams) {
                    let Id = cell.getRow().getData().Id;
                    return `<button type="button" class="ui basic button circular red" delId="${Id}">刪除</button>`;
                }
            }
        ]
    });
    table.setData(Data);
}

/**
 * 將資料填入Modal欄位裡
 * @param Data
 */
export function GenerateIncomeStatement(Data: EditIncomeStatementModel) {
    $("#Id").val(Data.Id);
    $("#CompanyId").val(Data.CompanyId);

    $("#VehicleId").val(Data.VehicleId);
    $("#VehicleId").dropdown('set selected', Data.VehicleId);

    $("#SpendItem").val(Data.ItemId);
    $("#SpendItem").dropdown('set selected', Data.ItemId);

    $("#money").val(Data.Amount);

    $("#Frequence").val(Data.FrequencyId);
    $("#Frequence").dropdown('set selected', Data.FrequencyId);
}
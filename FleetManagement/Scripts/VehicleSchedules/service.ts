import {
    IVehicleSchedulesService,
    SearchKeyWordModel,
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

/*pdfmake 自訂函式*/
//import * as pdfMake from "pdfmake";

/*載入語言檔*/
//import { vfs } from '../Shared/vfs';

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
 * VehicleSchedulesService 路線管理 服務
 * */
export class VehicleSchedulesService implements IVehicleSchedulesService {

    /**
     * 關建字搜尋
     * @param input
     */
    SearchResult(input: SearchKeyWordModel) {

        let setting: AjaxOption = {
            url: '/VehicleSchedules/GetDriverList',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                SearchWord: input.SearchWord
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
     * 所有報表匯出Excel及PDF
     * @param print
     */
    //ExportExcelOrPDF(print: PrintType) {

    //    $("#exportForm").on("submit", function (event) {
    //        event.preventDefault();

    //        /**查詢時間*/
    //        let nowtime = moment().format("YYMMDDHHmmss");
    //        let fileName: string = "路線司機列表_" + nowtime;
    //        let type = $("#exportType").closest(".dropdown").dropdown("get value");
    //        switch (type) {
    //            case "Excel":
    //                table.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
    //                break;
    //            case "Pdf":
    //                table.download("pdfmake", fileName + ".pdf", {
    //                    pdfMake: pdfMake,
    //                    vfs: vfs,
    //                    filename: fileName,
    //                    orientation: print
    //                });
    //                break;
    //        }
    //    });
    //}

    /**列印 */
    Print() {

        let data = table.getData();
        let thead = "";
        let trs = "";
        let title = "";

        title = "<h3>路線司機列表</h3>";
        thead = `<thead>
                    <tr>
                        <th>司機姓名</th>
                        <th>帳號</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['DriverName']}</td>
                            <td>${data[key]['Account']}</td>`;
            trs += tr;
        });
        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult" | "SearchMyVehicleSchedulesResult";

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
                    let result = GenerateVehicleSchedulesList(res.Data);
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
            let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
            switch (Step) {
                case "SearchResult":
                    toastr["error"](res.Message);
                    $("#dataTable").empty().append(tableMessage);
                    break;

                case "SearchMyVehicleSchedulesResult":
                    toastr["error"](res.Message);
                    $("#SearchResult").empty().append(tableMessage);
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
 * 路線管理司機資料列表
 * @param Data
 */
export function GenerateVehicleSchedulesList(Data: SearchResultList) {

    table = new Tabulator("#SearchResult", {
        height: "60vh",
        fitColumns: true,
        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        placeholder: "沒有資料",
        columns: [
            { title: "序號", sorter: "number", width: 50, formatter: "rownum" },
            { title: "司機姓名", field: "DriverName", sorter: "string" },
            { title: "帳號", field: "Account", sorter: "string" },

            {
                title: "檢視路線", formatter: function (cell, formatterParams) {
                    let DriverId = cell.getRow().getData().DriverId;
                    return `<button type="button" class="ui basic button circular blue" DriverId="${DriverId}">查看</button>`;
                }
            }
        ]
    });
    table.setData(Data);
}

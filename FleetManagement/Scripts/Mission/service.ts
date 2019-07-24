import * as moment from "../../Content/bower_components/moment/moment";

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';

import {
    IMissionService,
    MissionSearchModel,
    SearchResultList
} from './module';

import {
    HttpStatusCode,
    AjaxOption,
    CreateMessage,
    DoAjax,
    InfoType,
    PrintType
} from '../Shared/module';
import { PrintHtml } from "../Shared/function";
import { RelativePath } from "../Shared/enum";

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

var table;
/**
 * MissionService 任務管理 服務
 * */
export class MissionService implements IMissionService {

    /**
     * 搜尋任務結果
     * @param input
     */
    SearchResult(input: MissionSearchModel) {

        let params = {
            BeginDateTime: input.BeginDateTime,
            EndDateTime: input.EndDateTime,
            VehicleNumber: input.VehicleNumber,
            DriverName: input.DriverName,
            ProcessStatusList: input.ProcessStatusList,
            Sorters: null
        };
        
        GenerateMissionListByPage(params);
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
            let fileName: string = "任務列表_" + nowtime;
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

        title = "<h3>任務列表</h3>";
        thead = `<thead>
                    <tr>
                        <th>預約時間</th>
                        <th>貨主</th>
                        <th>電話</th>
                        <th>長*寬*高(cm)</th>
                        <th>重量(kg)</th>
                        <th>照片</th>
                        <th>接貨地點</th>
                        <th>送貨地點</th>
                        <th>運費</th>
                        <th>車主</th>
                        <th>車號</th>
                        <th>車主評分</th>
                        <th>狀態</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['BookingDate']}</td>
                            <td>${data[key]['GoodOwnerName']}</td>
                            <td>${data[key]['GoodOwnerPhoneNumber']}</td>
                            <td>${data[key]['GoodsSizeInfo']}</td>
                            <td>${data[key]['GoodsWeight']}</td>

                            <td>
                                <img class="ui mini image" width="50" height="50" img-Id="${data[key]['messageId']}" src="PhotoGoods/${data[key]['GoodOwnerId']}/${data[key]['MessageId']}/${data[key]['FirstGoodsPhotoName']}" />
                            </td>

                            <td>${data[key]['StartAddress']}</td>
                            <td>${data[key]['TargetAddress']}</td>
                            <td>${data[key]['TransactionPrice']}</td>
                            <td>${data[key]['DriverName']}</td>
                            <td>${data[key]['VehicleLicenseNumber']}</td>
                            <td>${data[key]['DriverScore']}</td>
                            <td>${data[key]['ProcessStatusName']}</td>`;
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
//function SUCCESS(Step: flowStep, res: any) {

//    let _this = this;

//    switch (res.HttpStatusCode) {

//        case HttpStatusCode.OK:
//            switch (Step) {
//                case "SearchResult":
//                    let result = GenerateMissionList(res.Data);
//                    break;
//            }
//            break;
//    }
//}

/**
 * 回傳失敗結果
 * @param Step
 * @param res
 */
//function ERROR(Step: flowStep, res: any) {

//    let message: string = String.empty;

//    switch (res.HttpStatusCode) {
//        case HttpStatusCode.NOT_FOUND:
//            window.location.href = '@Url.Action("NotFound", "Error")';
//        case HttpStatusCode.INTERNAL_SERVER_ERROR:
//            switch (Step) {
//                case "SearchResult":
//                    toastr["error"](res.Message);
//                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
//                    $("#dataTable").empty().append(tableMessage);
//                    break;
//            }
//            break;
//        case HttpStatusCode.UNAUTHORIZED:
//            switch (Step) {

//            }
//            break;
//    }
//}

/**
 * 送出前
 * @param Step
 * @param selector
 */
//function BeforeSend(Step: flowStep, selector: string) {
//    let skeleton: string = String.empty;
//    switch (Step) {

//    }
//    $(selector).empty().append(skeleton);
//}

/**
 * 產生任務管理資料列表（棄用）
 * @param Data
 */
//export function GenerateMissionList(Data: SearchResultList[]) {

//     table = new Tabulator("#dataTable", {
//        height: "60vh",
//        fitColumns: true,
//        layout: "fitColumns",
//        layoutColumnsOnNewData: true,
//        pagination: "local",
//        paginationSize: 10,
//        history: true,
//        placeholder: "無資料",
//        columns: [
//            { title: "預約時間", field: "BookingDate", sorter: "string" },
//            { title: "貨主", field: "GoodOwnerName", sorter: "string" },
//            { title: "電話", field: "GoodOwnerPhoneNumber", sorter: "string" },
//            { title: "長*寬*高(cm)", field: "GoodsSizeInfo", sorter: "string" },
//            { title: "重量(kg)", field: "GoodsWeight", sorter: "number" },

//            {
//                title: "照片", 
//                formatter: function (cell, formatterParams) {

//                    let goodOwnerId = cell.getRow().getData().GoodOwnerId;
//                    let messageId = cell.getRow().getData().MessageId;
//                    let firstGoodsPhotoName = cell.getRow().getData().FirstGoodsPhotoName;

//                    if (firstGoodsPhotoName != null) {

//                        let imageUrl = 
//                            `<div class='show-modal'>
//                                <img class="ui mini image" img-Id="${messageId}" src="PhotoGoods/${goodOwnerId}/${messageId}/${firstGoodsPhotoName}" />
//                            </div>`;

//                        return imageUrl;
//                    } else {
//                        return '';
//                    }
//                }
//            },

//            { title: "接貨地點", field: "StartAddress", sorter: "string" },
//            { title: "送貨地點", field: "TargetAddress", sorter: "string" },
//            { title: "運費", field: "TransactionPrice", sorter: "number" },
//            { title: "車主", field: "DriverName", sorter: "string" },
//            { title: "車號", field: "VehicleLicenseNumber", sorter: "string" },
//            { title: "車主評分", field: "DriverScore", sorter: "number" },

//            {
//                title: "狀態",
//                formatter: function (cell, formatterParams) {
//                    let messageId = cell.getRow().getData().MessageId;
//                    let processStatusName = cell.getRow().getData().ProcessStatusName;
//                    return `<a href="Mission/Detail?MessageId=${messageId}">` + processStatusName+`</a>`;
//                }
//            }
//        ]
//    });
//    table.setData(Data);
//}

/**
 * 產生任務管理資料列表(效能考量改用這個)
 * @param params
 */
export function GenerateMissionListByPage(params: MissionSearchModel) {
    table = new Tabulator("#dataTable", {
        height: "60vh",
        fitColumns: true,
        ajaxURL: RelativePath.ConstName + 'Mission/GetMissionList',
        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "remote",
        ajaxParams: params,
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        ajaxSorting: true,

        columns: [
            { title: "預約時間", field: "BookingDate", sorter: "string" },
            { title: "貨主", field: "GoodOwnerName", sorter: "string" },
            { title: "電話", field: "GoodOwnerPhoneNumber", sorter: "string" },
            { title: "長*寬*高(cm)", field: "GoodsSizeInfo", sorter: "string" },
            { title: "重量(kg)", field: "GoodsWeight", sorter: "string" },

            {
                title: "照片",
                formatter: function (cell, formatterParams) {

                    let goodOwnerId = cell.getRow().getData().GoodOwnerId;
                    let messageId = cell.getRow().getData().MessageId;
                    let firstGoodsPhotoName = cell.getRow().getData().FirstGoodsPhotoName;

                    if (firstGoodsPhotoName != null) {

                        let imageUrl =
                            `<div class='show-modal'>
                                <img class="ui mini image" img-Id="${messageId}" src="PhotoGoods/${goodOwnerId}/${messageId}/${firstGoodsPhotoName}" />
                            </div>`;

                        return imageUrl;
                    } else {
                        return '';
                    }
                }
            },

            { title: "接貨地點", field: "StartAddress", sorter: "string" },
            { title: "送貨地點", field: "TargetAddress", sorter: "string" },
            { title: "運費", field: "TransactionPrice", sorter: "string" },
            { title: "車主", field: "DriverName", sorter: "string" },
            { title: "車號", field: "VehicleLicenseNumber", sorter: "string" },
            { title: "車主評分", field: "DriverScore", sorter: "string" },

            {
                title: "狀態",
                formatter: function (cell, formatterParams) {
                    let messageId = cell.getRow().getData().MessageId;
                    let processStatusName = cell.getRow().getData().ProcessStatusName;
                    return `<a href="Mission/Detail?MessageId=${messageId}&ControllerName=Mission">` + processStatusName + `</a>`;
                }
            }
        ],
    });
}
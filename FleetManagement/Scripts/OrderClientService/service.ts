import moment = require("../../Content/bower_components/moment/moment");

import {
    IOrderClientService,
    BaseBookingSearchModel,
    SearchResultList
} from "./module";

import {
    HttpStatusCode,
    AjaxOption,
    CreateMessage,
    DoAjax,
    InfoType,
    PrintType
} from '../Shared/module';

/*pdfmake 自訂函式*/
//import * as pdfMake from "pdfmake";

/*載入語言檔*/
//import { vfs } from '../Shared/vfs';
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
 * OrderClientService 訂單客服 服務
 * */
export class OrderClientService implements IOrderClientService {

    /**
     * 搜尋訂單列表
     * @param input
     */
    SearchResult(input: BaseBookingSearchModel) {
        let setting: AjaxOption = {
            url: '/OrderClientService/GetOrderList',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime
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
    //        let fileName: string = "訂單列表_" + nowtime;
    //        let type = $("#exportType").closest(".dropdown").dropdown("get value");
    //        switch (type) {
    //            case "Excel":
    //                //改用客製化Excel
    //                //table.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
    //                $("#DownLoadExcel").submit();
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
                    let result = GenerateOrderList(res.Data);
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
 * 產生任務管理資料列表
 * @param Data
 */
export function GenerateOrderList(Data: SearchResultList[]) {

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
            { title: "預約時間", field: "BookingDate", sorter: "string" },
            { title: "貨主", field: "GoodOwnerName", sorter: "string" },
            { title: "電話", field: "GoodOwnerContactPhoneNumber", sorter: "string" },
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
                                <img class="ui mini image" img-Id="${messageId}" src="${RelativePath.ConstName}/PhotoGoods/${goodOwnerId}/${messageId}/${firstGoodsPhotoName}" />
                            </div>`;

                        return imageUrl;
                    } else {
                        return '';
                    }
                }
            },

            { title: "接貨地點", field: "StartAddress", sorter: "string" },
            { title: "送貨地點", field: "TargetAddress", sorter: "string" },
            { title: "期望運費", field: "EstimatedFare", sorter: "string" },
            { title: "車主", field: "DriverName", sorter: "string" },
            { title: "車號", field: "VehicleLicenseNumber", sorter: "string" },
            { title: "狀態", field: "ProcessStatusName", sorter: "string" },
            { title: "下訂單者", field: "CreateUserName", sorter: "string" },
            {
                title: "編輯",
                formatter: function (cell, formatterParams) {
                    let messageId = cell.getRow().getData().MessageId;
                    return `<button type="button" class="ui basic button circular blue" editMessageId="${messageId}">編輯</button>`;
                }
            }
        ]
    });
    table.setData(Data);
}
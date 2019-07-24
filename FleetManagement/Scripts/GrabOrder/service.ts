import {
    IGrabOrderService,
    OrderSearchModel,
    SearchResultList,
    DriverQuotePriceModel,

    QuoteCreaterModel
} from "./module";

import {
    AjaxOption,
    DoAjax,
    HttpStatusCode,
    CreateMessage,
    InfoType,
    PrintType
} from "../Shared/module";

import moment = require("../../Content/bower_components/moment/moment");

/*pdfmake 自訂函式*/
//import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';
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
 * GrabOrderService 網路搶單 服務
 * */
export class GrabOrderService implements IGrabOrderService {

    /**
     * 搜尋訂單列表
     * @param input
     */
    SearchResult(input: OrderSearchModel) {
        let setting: AjaxOption = {
            url: '/GrabOrder/GetOrderList',
            type: 'POST',
            dataType: 'json',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                PostalCode: input.PostalCode
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
     * 報價
     * @param input
     */
    Quote(input: DriverQuotePriceModel) {

        let _this = this;

        let setting: AjaxOption = {
            url: '/GrabOrder/Quote',
            type: 'POST',
            dataType: 'json',
            data: {
                MessageId: input.MessageId,
                DriverId: input.DriverId,
                QuotedPrice: input.QuotedPrice,
                VerhicleId: input.VerhicleId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("Quote", res);
            },
            function (res) { ERROR("Quote", res); },
            function () { 
               
            },
            null);
    }

    /**
     * 匯出Excel及PDF
     * @param print
     */
    //ExportExcelOrPDF(print: PrintType) {

    //    $("#exportForm").on("submit", function (event) {
    //        event.preventDefault();

    //        /**查詢時間*/
    //        let nowtime = moment().format("YYMMDDHHmmss");
    //        let fileName: string = "網路搶單列表_" + nowtime;
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

    /**列印 */
    Print() {

        let data = table.getData();
        let thead = "";
        let trs = "";
        let title = "";

        title = "<h3>網路搶單列表</h3>";
        thead = `<thead>
                    <tr>
                        <th>預約時間</th>
                        <th>接貨地點</th>
                        <th>送貨地點</th>
                        <th>長*寬*高(cm)</th>
                        <th>重量(kg)</th>
                        <th>照片</th>
                        <th>貨主</th>
                        <th>電話</th>
                        <th>報價</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['BookingDate']}</td>
                            <td>${data[key]['StartAddress']}</td>
                            <td>${data[key]['TargetAddress']}</td>
                            <td>${data[key]['GoodsSizeInfo']}</td>
                            <td>${data[key]['GoodsWeight']}</td>
                            <td>
                                <img class="ui mini image" width="50" height="50" img-Id="${data[key]['messageId']}" src="PhotoGoods/${data[key]['GoodOwnerId']}/${data[key]['MessageId']}/${data[key]['FirstGoodsPhotoName']}" />
                            </td>
                            <td>${data[key]['GoodOwnerName']}</td>
                            <td>${data[key]['GoodOwnerPhoneNumber']}</td>
                            <td>${data[key]['QuotedPrice']}</td>`;
            trs += tr;
        });
        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }

    /**
     * 取得目前的報價
     * @param input
     */
    GetCurrentQuote(input: QuoteCreaterModel) {

        let setting: AjaxOption = {
            url: '/GrabOrder/GetCurrentQuote',
            type: 'POST',
            dataType: 'json',
            data: {
                MessageId: input.MessageId,
                CreaterId: input.CreaterId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("GetCurrentQuote", res);
            },
            function (res) { ERROR("GetCurrentQuote", res); },
            function () {  },
            null);
    }

    /**
     * 修改報價
     * @param input
     */
    ModifyQuote(input: DriverQuotePriceModel) {

        let _this = this;

        let setting: AjaxOption = {
            url: '/GrabOrder/ModifyQuote',
            type: 'POST',
            dataType: 'json',
            data: {
                MessageId: input.MessageId,
                DriverId: input.DriverId,
                QuotedPrice: input.QuotedPrice,
                VerhicleId: input.VerhicleId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("ModifyQuote", res);
            },
            function (res) {
                ERROR("ModifyQuote", res); 
            },
            function () {  
            },
            null);
    }

    /**
     * 取消報價
     * @param input
     */
    CancelQuote(input: DriverQuotePriceModel) {
        let _this = this;

        let setting: AjaxOption = {
            url: '/GrabOrder/CancelQuote',
            type: 'POST',
            dataType: 'json',
            data: {
                MessageId: input.MessageId,
                DriverId: input.DriverId,
                QuotedPrice: input.QuotedPrice,
                VerhicleId: input.VerhicleId
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS("CancelQuote", res);
            },
            function (res) {
                ERROR("CancelQuote", res);
            },
            function () {
            },
            null);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult" | "Quote" | "GetCurrentQuote" | "ModifyQuote" |"CancelQuote";

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
                    GenerateOrderList(res.Data);

                    //var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
                    //var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
                    //var SearchPostalCode = sessionStorage.getItem('SearchPostalCode');

                    //_this.SearchResult({
                    //    BeginDateTime: SearchBeginDateTime,
                    //    EndDateTime: SearchEndDateTime,
                    //    PostalCode: SearchPostalCode,
                    //});
                    break;

                case "Quote":
                    $("#createModel").modal('hide');
                    toastr["success"]("更新成功");
                    break;

                case "GetCurrentQuote":
                    $("#modifyQuotePrice").val(res.Data.QuotedPrice);

                    $("#modifyDriverId").val(res.Data.DriverId);
                    $("#modifyDriverId").dropdown('set selected', res.Data.DriverId);

                    $("#modifyVehicleLicenseNumber").val(res.Data.VerhicleId);
                    $("#modifyVehicleLicenseNumber").dropdown('set selected', res.Data.VerhicleId);
                    break;

                case "ModifyQuote":
                    $("#modifyModel").modal('hide');
                    toastr["success"]("更新成功");
                    break;

                case "CancelQuote":
                    toastr["success"]("取消報價成功");
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

                case "GetCurrentQuote":
                    toastr["error"]("無法取得報價資料");
                    break;

                case "CancelQuote":
                    toastr["error"]("取消報價失敗！");
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
        default:
            $(selector).empty().append(skeleton);
            break;
    }
}

/**
 * 產生網路搶單列表
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
            {
                title: "預約時間", field: "BookingDate", sorter: "string",
                formatter: function (cell, formatterParams) {
                    let bookingDate = cell.getRow().getData().BookingDate;
                    let messageId = cell.getRow().getData().MessageId;
                    return `<a href="Mission/Detail?MessageId=${messageId}&ControllerName=GrabOrder">` + bookingDate + `</a>`;
                }
            },
            { title: "接貨地點", field: "StartAddress", sorter: "string" },
            { title: "送貨地點", field: "TargetAddress", sorter: "string" },
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
            { title: "貨主", field: "GoodOwnerName", sorter: "string" },
            { title: "電話", field: "GoodOwnerPhoneNumber", sorter: "string" },
           
            {
                title: "報價",
                field: "QuotedPrice",
                formatter: function (cell, formatterParams) {

                    let messageId = cell.getRow().getData().MessageId;
                    let quotedPrice = cell.getRow().getData().QuotedPrice;

                    if (quotedPrice != null) {

                        let modifyQuotebtn = `<button type="button" class="ui basic button circular yellow" modifyQuotingMessageId="${messageId}" id="modifyQuoteBtn">修改報價</button>`;
                        let deleteQuotebtn = `<button type="button" class="ui basic button circular red" deleteQuotingMessageId="${messageId}">取消報價</button>`;

                        return quotedPrice + '元</br>'+modifyQuotebtn +'</br>'+ deleteQuotebtn;

                    } else {
                        return `<button type="button" class="ui basic button circular blue" quotingMessageId="${messageId}">報價</button>`;
                    }
                }
            }
        ]
    });
    table.setData(Data);
}

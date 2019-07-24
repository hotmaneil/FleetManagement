import {
    IVehicleMissionReportService, BookingReportMonthSearchModel, VehicleMissionReportList
} from "./module";
import { AjaxOption, DoAjax, HttpStatusCode, CreateMessage, InfoType, PrintType } from "../Shared/module";
import moment = require("../../Content/bower_components/moment/moment");

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';


/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

var tableVehicle;

/**
 * vehicleMissionReportService 車輛任務報表 服務
 * */
export class vehicleMissionReportService implements IVehicleMissionReportService {

    /**
     * 搜尋車輛任務列表
     * @param input
     */
    SearchVehicleMissionList(input: BookingReportMonthSearchModel) {

        let setting: AjaxOption = {
            url: '/Report/GetVehicleMissionReportList',
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
                SUCCESS("SearchVehicleMissionList", res);
            },
            function (res) {
                ERROR("SearchVehicleMissionList", res);
            },
            function () {
                BeforeSend("SearchVehicleMissionList", '');
            },
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
            let fileName: string = "車輛任務報表_" + nowtime;
            let type = $("#exportType").closest(".dropdown").dropdown("get value");
            switch (type) {
                case "Excel":
                    //tableVehicle.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                    $("#DownLoadExcel").submit();
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
        });
    }
}

/*列舉流程步驟*/
type flowStep = "SearchVehicleMissionList";

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
                case "SearchVehicleMissionList":
                    GenerateVehicleMissionReportList(res.Data);
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
                case "SearchVehicleMissionList":
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
 * 車輛任務報表 列表
 * @param Data
 */
export function GenerateVehicleMissionReportList(Data: VehicleMissionReportList[]) {

    tableVehicle = new Tabulator("#dataTable", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        rowClick: function (e, row) {
            let data = row.getData();
            let messageId = data["MessageId"];
            location.href = "VehicleMissionDetail?MessageId=" + messageId;
        },
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
            { title: "送貨地點", field: "TargetAddress", sorter: "string" }
        ]
    });
    tableVehicle.setData(Data);
}

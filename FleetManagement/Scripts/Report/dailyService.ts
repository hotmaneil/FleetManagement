import { IReportDailyService, BookingDailyList, BookingReportMonthSearchModel, DashBoardModel } from "./module";
import { AjaxOption, DoAjax, HttpStatusCode, PrintType } from "../Shared/module";
import moment = require("../../Content/bower_components/moment/moment");

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

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

var tableDaily;

export class ReportDailyService implements IReportDailyService {

    /**
    * 從使用者搜尋當月日報表 
    * @param input
    */
    SearchDailyReport(input: BookingReportMonthSearchModel) {

        let setting: AjaxOption = {
            url: '/Report/GetBookingDailyList',
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
                SUCCESS("SearchDailyReport", res);
            },
            function (res) {
                ERROR("SearchDailyReport", res);
            },
            function () {
                BeforeSend("SearchDailyReport", ''); 
            },
            null);
    }

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType) {

        /**查詢時間*/
        let nowtime = moment().format("YYMMDDHHmmss");
        let fileName: string = " 每日趟次統計_" + nowtime;
        let type = $("#exportType").closest(".dropdown").dropdown("get value");
        switch (type) {
            case "Excel":
                //tableDaily.download("xlsx", fileName + ".xlsx", { sheetName: fileName });
                $("#DownLoadExcel").submit();
                break;
            case "Pdf":
                tableDaily.download("pdfmake", fileName + ".pdf", {
                    pdfMake: pdfMake,
                    vfs: vfs,
                    filename: fileName,
                    orientation: print
                });
                break;
        }
    }

    /**列印 */
    Print() {

        let data = tableDaily.getData();
        let thead = "";
        let trs = "";
        let title = "";

        title = "<h3>每日趟次統計</h3>";
        thead = `<thead>
                    <tr>
                        <th>日</th>
                        <th>總趟次</th>
                        <th>總運費</th>
                    </tr>
                </thead> `;

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['BookDate']}</td>
                            <td>${data[key]['TotalTimes']}</td>
                            <td>${data[key]['TotalTransportationCharges']}</td>`;
            trs += tr;
        });
        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchDailyReport";

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
                case "SearchDailyReport":
                    SetDashBoard(res.Data.DashBoardInfo);
                    GenerateDailyReport(res.Data.BookingReportDailyList);
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

    switch (res.HttpStatusCode) {
        case HttpStatusCode.NOT_FOUND:
            window.location.href = '@Url.Action("NotFound", "Error")';
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
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
 * 司機或客戶營業當月日報表 每日趟次統計
 * @param Data
 */
export function GenerateDailyReport(Data: BookingDailyList) {

    tableDaily = new Tabulator("#DailyStatisticsTable", {
        height: "60vh",
        fitColumns: true,

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "日", field: "BookDate", sorter: "string" },
            { title: "總趟次", field: "TotalTimes", sorter: "string" },
            { title: "總運費", field: "TotalTransportationCharges", sorter: "string" }
        ]
    });
    tableDaily.setData(Data);
}

/**
 * 儀表板資訊
 * @param Data
 */
export function SetDashBoard(Data: DashBoardModel) {
    $("#TotalTransportationCharges").text(Data.TotalTransportationCharges);
    $("#TotalTimes").text(Data.TotalTimes);
}

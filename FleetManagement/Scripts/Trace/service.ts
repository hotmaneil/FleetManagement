import * as moment from "../../Content/bower_components/moment/moment";

import {
    DoAjax,
    AjaxOption,
    PrintType
} from '../Shared/module';

import {
    ITraceService,
    SearchTraceViewModel,
    TracePoints,
    TracePoint,
    SearchResultList
} from './module';

import {
    InitialMap,
    removeAllMapMarker,
    removeAllPolyCircle,
    drawPolyline,
    UpdateMapinfoWindow,
    CenterMapByItem
} from './mapfunction';

import {
    CreateTraceList_ERROR,
    CreateTraceList_Empty,
    temp_LineParagraph
} from '../Shared/templete';

import {
    promise,
    PrintHtml
} from '../Shared/function';

/*pdfmake 自訂函式*/
import * as pdfMake from "pdfmake";

/*載入語言檔*/
import { vfs } from '../Shared/vfs';

/*共用函式*/
import {
    CleanMapinfoWindow,
    CreateTraceList,
    GetShowDropDown
} from "./commonFunction";

var table;
export class TraceService implements ITraceService {

    private startDate: string;
    private endDate: string;
    constructor() {
        this.startDate = "";
        this.endDate = "";
    }

    /** 地圖初始化*/
    initmap() {
        InitialMap(true);
    }

    /**
     * 軌跡查詢
     * @param input
     */
    SearchTrace(input: SearchTraceViewModel) {

        this.startDate = input.BeginDateTime;
        this.endDate = input.EndDateTime;

        CleanMapinfoWindow();
        removeAllMapMarker();
        removeAllPolyCircle();

        $("#btnQuery").addClass('disabled');
        $("#ExportBtn").addClass('disabled');
        $("#PlayTraceBtn").addClass('disabled');
        $("#StopTraceBtn").addClass('disabled');

        let setting: AjaxOption = {
            url: '/Trace/SearchTrace/',
            data: {
                BeginDateTime: input.BeginDateTime,
                EndDateTime: input.EndDateTime,
                DriverId: input.DriverId,
                VehicleId: input.VehicleId
            },
            type: 'POST',
            dataType: 'json'
        };

        DoAjax(setting,
            function (res) {
                promise.then(success => {
                    let list: string = CreateTraceList(res.Data);
                    $("#traceList").empty().append(list);
                }).catch(fail => {
                    toastr["error"]("創建軌跡列表過程發生錯誤");
                    $("#traceList").empty().append(CreateTraceList_ERROR);
                }).then(success => {
                    drawPolyline(res.Data.TraceList);
                    GenerateTraceList(res.Data.TraceList);
                });
            },
            function (res) {
                toastr["error"]("創建軌跡列表發生錯誤:" + res);
                $("#traceList").empty().append(CreateTraceList_ERROR);
            },
            function () { 
                $("#traceList").empty().append(temp_LineParagraph(10));
            },
            function () {
                $("#btnQuery").removeClass('disabled');
                $("#ExportBtn").removeClass('disabled');
                $("#PlayTraceBtn").removeClass('disabled');
                $("#StopTraceBtn").removeClass('disabled');
                toastr.info("查詢完成");
            });
    }

    /**
     * 點擊軌跡事件
     * @param data
     */
    traceEventClick(data: TracePoint) {
        UpdateMapinfoWindow(data);
        let txt = data.OperationalStatus + "\r\n" + data.RecordTime;
        CenterMapByItem(data.Latitude, data.Longitude, txt);
    }

    /**
    * 所有報表匯出Excel及PDF
    * @param filename
    */
    ExportExcelOrPDF(print: PrintType) {
        let _this = this;
        $("#exportForm").on("submit", function (event) {
            event.preventDefault();
            let fileName: string = "軌跡紀錄";

            /**查詢時間*/
            let nowtime = moment().format("YYMMDDHHmmss");
            let startDate = moment(_this.startDate).format("YYYY/MM/DD");
            let endDate = moment(_this.endDate).format("YYYY/MM/DD");
            fileName = fileName + nowtime;
    
            let type = $("#exportType").closest(".dropdown").dropdown("get value");
            switch (type) {
                case "Excel":
                    //改用客製化Excel
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
            toastr.success("下載完成");
        });
    }

    /**列印 */
    Print() {
        let data = table.getData();
        let thead = `
        <thead>
            <tr>
                <th>時間</th>
                <th>狀態</th>
                <th>方向</th>
                <th>車速</th>
                <th>位置</th>
            </tr>
        </thead> `;
        let trs = "";
        let title = "<h3>軌跡紀錄</h3>";

        $.each(data, function (key, list) {
            let tr = `<tr>
                            <td>${data[key]['RecordTime']}</td>
                            <td>${data[key]['OperationalStatus']}</td>
                            <td>${data[key]['Direction']}</td>
                            <td>${data[key]['KMperHour']}</td>
                            <td>${data[key]['Address']}</td>`;
            trs += tr;
        });

        let tablehtml = `<table>${thead}<tbody>${trs}</tbody></table>`;
        PrintHtml(title, tablehtml);
    }

    /**營業狀態下拉選單 */
    GetShowDropDown() {
        GetShowDropDown();
    }
}

/**
 * 產生軌跡紀錄Table List
 * @param Data
 */
export function GenerateTraceList(Data: SearchResultList[]) {

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
            { title: "時間", field: "RecordTime", sorter: "string" },
            { title: "狀態", field: "OperationalStatus", sorter: "string" },
            { title: "方向", field: "Direction", sorter: "string" },
            { title: "車速", field: "KMperHour", sorter: "string" },
            {
                title: "位置", field: "Address", sorter: "string",
                formatter: function (cell, formatterParams) {
                    let address = cell.getRow().getData().Address;
                    let url = 'https://www.google.com/maps/search/?api=1&query=';
                    let latitude = cell.getRow().getData().Latitude;
                    let Longitude = cell.getRow().getData().Longitude;
                    let combineUrl = url + latitude + "," + Longitude;

                    return `<a href="${combineUrl}" target="_blank">${address}</a>`;
                }
            },
        ]
    });
    table.setData(Data);
}



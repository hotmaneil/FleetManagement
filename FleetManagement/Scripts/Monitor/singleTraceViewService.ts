import {
    ISingleTraceViewService
} from './SingleTraceViewModule';

import {
    InitialMap,
    removeAllMapMarker,
    removeAllPolyCircle,
    drawPolyline,
    UpdateMapinfoWindow,
    CenterMapByItem
} from '../Trace/mapfunction';

import {
    SearchTraceViewModel,
    SearchResultList,
    TracePoint
} from '../Trace/module';

import {
    DoAjax,
    AjaxOption,
    PrintType
} from '../Shared/module';

import {
    promise
} from '../Shared/function';

/*共用函式*/
import {
    CleanMapinfoWindow,
    CreateTraceList,
    GetShowDropDown
} from '../Trace/commonFunction';

import {
    CreateTraceList_ERROR,
    temp_LineParagraph
} from '../Shared/templete';

var table;
export class SingleTraceViewService implements ISingleTraceViewService {

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
            { title: "位置", field: "Address", sorter: "string" },
        ]
    });
    table.setData(Data);
}

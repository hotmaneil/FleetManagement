import {
    IDetailService,
    SearchTraceModel
} from './DetailModule'

import {
    InitialMap, drawPolyline
} from '../Trace/mapfunction';

import { AjaxOption, DoAjax } from '../Shared/module';
import { promise } from '../Shared/function';
import { CreateTraceList_ERROR, temp_LineParagraph } from '../Shared/templete';

export class DetailService implements IDetailService {

    /** 地圖初始化*/
    initmap() {
        InitialMap(false);
    }

    /**
     * 取得軌跡
     * @param input
     */
    GetTrace(input: SearchTraceModel) {

        let setting: AjaxOption = {
            url: '/Trace/GetTrace/',
            data: {
                MessageId: input.MessageId
            },
            type: 'POST',
            dataType: 'json'
        };

        DoAjax(setting,
            function (res) {
                promise.then(success => {
                    drawPolyline(res.Data);
                }).catch(fail => {
                    toastr["error"]("創建軌跡列表過程發生錯誤");
                    $("#traceList").empty().append(CreateTraceList_ERROR);
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
                toastr.info("查詢完成");
            });
    }
}
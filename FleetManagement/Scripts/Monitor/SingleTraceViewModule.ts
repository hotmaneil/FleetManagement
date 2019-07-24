import {
    SearchTraceViewModel,
    TracePoint
} from "../Trace/module";

/** Monitor 司機軌跡服務方法規格 */
export interface ISingleTraceViewService {

    /** 地圖初始化*/
    initmap();

    /**
     * 軌跡查詢
     * @param input
     */
    SearchTrace(input: SearchTraceViewModel);

    /**
     * 點擊軌跡事件
     * @param data
     */
    traceEventClick(data: TracePoint);
}
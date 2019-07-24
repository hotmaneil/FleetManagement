
/** 軌跡查詢條件 */
export interface SearchTraceModel {
    MessageId: string;
}

/** 任務明細 服務方法規格*/
export interface IDetailService {

    /**地圖初始化 */
    initmap();

    /**
     * 取得軌跡
     * @param input
     */
    GetTrace(input: SearchTraceModel);
}
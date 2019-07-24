import { PrintType } from "../Shared/module";

export interface IindexService {

    /**
     * 搜尋任務調派訂單列表
     * @param input
     */
    SearchResult(input: DispatchSearchModel);

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    //ExportExcelOrPDF(print: PrintType);

    /**列印 */
    Print();
}


/**搜尋任務調派訂單 Model */
export interface DispatchSearchModel {

    /**開始時間 */
    BeginDateTime: string,

    /**結束時間 */
    EndDateTime: string,

    /**地區-用縣市 */
    PostalCode: number,

    /**車主 */
    DriverName: string,

    /**預約狀態 List */
    ProcessStatusList: Int32List
}

/**搜尋任務調派訂單列表 */
export interface SearchResultList {

    MessageId: string,

    BookingDate: string,

    StartAddress: string,

    TargetAddress: string,

    GoodsSizeLength: number,

    GoodsSizeWide: number,

    GoodsSizeHeight: number,

    GoodsWeight: number,

    FirstGoodsPhotoName: string,

    GoodOwnerName: string,

    GoodOwnerPhoneNumber: string,

    DriverName: string,

    QuotedPrice: number
}


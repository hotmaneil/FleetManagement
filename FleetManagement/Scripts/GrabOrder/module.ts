import { PrintType } from "../Shared/module";

/** GrabOrder 服務方法規格 */
export interface IGrabOrderService {

    /**
     * 搜尋訂單列表
     * @param input
     */
    SearchResult(input: OrderSearchModel);

    /**
     * 報價
     * @param input
     */
    Quote(input: DriverQuotePriceModel);

    /**
     * 匯出Excel及PDF
     * @param print
     */
    //ExportExcelOrPDF(print: PrintType);

    /**
     * 取得目前的報價
     * @param input
     */
    GetCurrentQuote(input: QuoteCreaterModel);

    /**
     * 修改報價
     * @param input
     */
    ModifyQuote(input: DriverQuotePriceModel);

    /**
     * 取消報價
     * @param input
     */
    CancelQuote(input: DriverQuotePriceModel);
}

/**訂單搜尋 Model */
export interface OrderSearchModel {

    /**開始時間 */
    BeginDateTime: string,

    /**結束時間 */
    EndDateTime: string,

    /**地區-用縣市 */
    PostalCode: number
}

/** 訂單 查詢結果儲存用*/
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

    QuotedPrice: number
}

/** 報價 Model*/
export interface DriverQuotePriceModel {

    MessageId: string,

    DriverId: string,

    QuotedPrice: number,

    VerhicleId: number
}

/**報價建立者Model  */
export interface QuoteCreaterModel {

    MessageId: string,

    CreaterId: string
}
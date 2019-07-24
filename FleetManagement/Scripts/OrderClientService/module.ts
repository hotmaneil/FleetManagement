import { PrintType } from "../Shared/module";

/** OrderClient 服務方法規格 */
export interface IOrderClientService {

    /**
     * 搜尋訂單列表
     * @param input
     */
    SearchResult(input: BaseBookingSearchModel);

    /**
     * 所有報表匯出Excel及PDF
     * @param print
     */
    //ExportExcelOrPDF(print: PrintType);
}

export interface BaseBookingSearchModel {

    /**開始時間 */
    BeginDateTime: string,

    /**結束時間 */
    EndDateTime: string,
}

/** 訂車客服 查詢結果儲存用*/
export interface SearchResultList {

    MessageId: string,

    BookingDate: string,

    GoodOwnerId: string,

    GoodOwnerName: string,

    GoodOwnerPhoneNumber: string,

    GoodsSizeLength: number,

    GoodsSizeWide: number,

    GoodsSizeHeight: number,

    GoodsWeight: number,

    StartAddress: string,

    TargetAddress: string,

    EstimatedFare: number,

    DriverName: string,

    VehicleLicenseNumber: string,

    ProcessStatus: number,

    ProcessStatusName: string,

    FirstGoodsPhotoName: string,

    CreateUserName: string
}


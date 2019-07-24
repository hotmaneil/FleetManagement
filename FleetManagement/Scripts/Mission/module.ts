import { PrintType } from "../Shared/module";

/**
Mission服務方法規格
*/
export interface IMissionService {

    /**
     * 搜尋任務結果
     * @param input
     */
    SearchResult(input: MissionSearchModel); 

    /**
     * 匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType);

    /**列印 */
    Print();
}

/** 任務管理  搜尋 ViewModel*/
export interface MissionSearchModel {

    /**開始時間 */
    BeginDateTime: string,

    /**結束時間 */
    EndDateTime: string,

    /**車號 */
    VehicleNumber: string,

    /**車主 */
    DriverName: string,

    /**預約狀態 List */
    ProcessStatusList: Int32List
}


/** 任務管理 查詢結果儲存用*/
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

    TransactionPrice: number,

    DriverName: string,

    VehicleLicenseNumber: string,

    DriverScore: number,

    ProcessStatus: number,

    ProcessStatusName: string,

    FirstGoodsPhotoName: string
}
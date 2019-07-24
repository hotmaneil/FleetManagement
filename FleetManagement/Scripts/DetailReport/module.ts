import { PrintType } from "../Shared/module";

export interface IDetailReportService {

    /**
     * 搜尋明細報表
     * @param input
     */
    SearchDetailResult(input: SearchModel);

    /**
     * 取得總趟次與運費
     * @param input
     */
    SearchBaseBookingReport(input: SearchModel);

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType);

    /** 列印 */
    Print();
}

/** 明細報表搜尋 Model */
export interface SearchModel {

    BeginDateTime: string,

    EndDateTime: string,

    SearchCompanyId: number,

    SearchVehicleId: number,

    SearchDriverId: string,

    SearchGoodOwnerId: string
}

/**搜尋結果報表列表 */
export interface SearchResultList {

    MessageId: string,

    DriverName: string,

    LicenseNumber: string,

    BookingDate: string,

    StartAddress: string,

    TargetAddress: string,

    TransportationCharges: number

    GoodOwnerName: string,
}
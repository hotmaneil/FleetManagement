import { PrintType } from "../Shared/module";

/** ReportService 服務方法規格*/
export interface IReportService {

    /**
     * 搜尋月報表
     * @param input
     */
    SearchMonthReport(input: BookingReportMonthSearchModel);

    /**
     * 依照報表種類報表匯出Excel及PDF
     * @param print
     * @param reportType
     */
    ExportExcelOrPDF(print: PrintType, reportType: string); 

    /**
     * 列印
     * @param reportType
     */
    PrintReport(reportType: string);
}

/** ReportDailyService 服務方法規格*/
export interface IReportDailyService {

    /**
    * 從司機搜尋當月日報表
    * @param input
    */
    SearchDailyReport(input: BookingReportMonthSearchModel);

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType); 

    /**列印 */
    Print();
}

/** VehicleMissionReportService 服務方法規格*/
export interface IVehicleMissionReportService {

    /**
     * 搜尋車輛任務列表
     * @param input
     */
    SearchVehicleMissionList(input: BookingReportMonthSearchModel);

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType);
}

/** 報表搜尋 Model*/
export interface BookingReportMonthSearchModel {
    SearchYearMonth: string,
    SearchVehicleId: number,
    SearchCompanyId: number,
    SearchDriverId: string,
    SearchGoodOwnerId: string
}

/**儀表板 Model */
export interface DashBoardModel {
    TotalTimes: number,
    TotalTransportationCharges: number
}

/** 營業月報表-司機*/
export interface BookingReportMonthDriverList {
    DriverName: string,
    TotalTimes: number,
    TotalTransportationCharges: number
}

/** 營業月報表-車輛 列表*/
export interface BookingReportMonthVehicleList {
    LicenseNumber: string,
    TotalTimes: number,
    TotalTransportationCharges: number
}

/** 營業月報表-客戶*/
export interface BookingReportMonthGoodsOwnerList {
    GoodsOwnerName: string,
    TotalTimes: number,
    TotalTransportationCharges: number
}

/** 司機之營業當月日報表*/
export interface BookingDailyList {
    BookDate: string,
    TotalTimes: number,
    TotalTransportationCharges: number
}

/**車輛任務報表列表 */
export interface VehicleMissionReportList {
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
}
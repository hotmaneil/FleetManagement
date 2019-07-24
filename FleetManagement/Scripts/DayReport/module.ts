import { PrintType } from "../Shared/module";

/**
 * 日報表 服務
 * */
export interface IDayReportService {

    /**
     * 搜尋司機趟數報表
     * @param input
     */
    SearchDriverDayTimesReportList(input: DayReportSearchModel);

    /**
     * 搜尋司機運費報表
     * @param input
     */
    SearchDriverDayChargeReportList(input: DayReportSearchModel);

    /**
     * 搜尋車輛趟數報表
     * @param input
     */
    SearchVehicleDayTimesReportList(input: DayReportSearchModel);

    /**
     * 搜尋車輛運費報表
     * @param input
     */
    SearchVehicleDayChargeReportList(input: DayReportSearchModel);

    /**
     * 搜尋客戶趟數報表
     * @param input
     */
    SearchCustomerDayTimesReportList(input: DayReportSearchModel);

    /**
     * 搜尋客戶運費報表
     * @param input
     */
    SearchCustomerDayChargeReportList(input: DayReportSearchModel);

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

/**日報表搜尋 Model */
export interface DayReportSearchModel {

    BeginDateTime: string,

    EndDateTime: string,

    SearchCompanyId: number,

    SearchVehicleId: number,

    SearchDriverId: string,

    SearchGoodOwnerId: string
}
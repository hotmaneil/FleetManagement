import { PrintType } from "../Shared/module";

/** IncomeStatementReportService 服務方法規格 */
export interface IIncomeStatementReportService {

    /**
     *  搜尋收支帳報表
     * @param input
     */
    SearchResult(input: IncomeStatementReportSearchModel);

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType);

    /**列印*/
    Print();
}

/**收支帳報表搜尋 Model */
export interface IncomeStatementReportSearchModel {

    BeginDateTime: string,

    EndDateTime: string

    SearchVehicleId: number
}

/** 收支帳報表列表 搜尋結果*/
export interface SearchResultList {

    LicenseNumber: string,

    Income: number,

    Amount: number,

    Oil: number,

    ETC: number,

    Tire: number,

    Maintain: number,

    Tax: number,

    Fine: number,

    Insurance: number,

    Other: number,

    CalculateResult: number
}
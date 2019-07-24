import { PrintType } from "../Shared/module";

/** IncomeStatement  服務方法規格*/
export interface IIncomeStatementService {

    /**
     * 搜尋收支帳
     * @param input
     */
    SearchResult(input: IncomeStatementSearchModel);

    /**
     * 新增收支帳
     * @param input
     */
    CreateIncomeStatement(input: CreateIncomeStatementModel);

    /**
     * 取得一筆收支帳
     * @param input
     */
    GetIncomeStatement(Id: string);

    /**
     * 報表匯出Excel及PDF
     * @param print
     */
    ExportExcelOrPDF(print: PrintType);

    /**列印 */
    Print();
}

/**收支帳搜尋 Model */
export interface IncomeStatementSearchModel {

    CreateTime: string,

    SearchVehicleId: number
}

/** 收支帳  新增Model */
export interface CreateIncomeStatementModel {

    VehicleId: number,

    ItemId: number,

    Amount: number,

    FrequencyId: number
}

/** 收支帳  編輯Model */
export interface EditIncomeStatementModel {

    Id: string,

    CompanyId: number,

    VehicleId: number,

    ItemId: number,

    Amount: number,

    FrequencyId: number
}

/**收支帳列表 Model */
export interface SearchResultList {

    Date: string,

    LicenseNumber: string,

    Item: string,

    Amount: number,

    Frequency: string
}

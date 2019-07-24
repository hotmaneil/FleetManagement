import { PrintType } from "../Shared/module";

/** VehicleSchedules  服務方法規格*/
export interface IVehicleSchedulesService {

    /**
     * 關建字搜尋
     * @param input
     */
    SearchResult(input: SearchKeyWordModel);

    /**
     * 所有報表匯出Excel及PDF
     * @param print
     */
    //ExportExcelOrPDF(print: PrintType);

    /**列印 */
    Print(); 
}

/** 新增或編輯  VehicleSchedules 之  服務方法規格**/
export interface ICreateService {

    /**
    * 搜尋司機自己的路線班表
    * @param input
    */
    SearchMyVehicleSchedulesResult(input: SearchDriverKeyWordModel);

    /**
     * 刪除路線班表
     * @param input
     */
    DeleteVehicleSchedule(input: VehicleScheduleIdModel);
}

/**搜尋關鍵字 模型 */
export interface SearchKeyWordModel {
    SearchWord: string;
}

/** 查詢結果儲存用*/
export interface SearchResultList {
    DriverName: string,
    Account: string,
    StartPostalName: string,
    TargetPostalName: string
}

/**司機的路線結果儲存用 */
export interface MyVehicleSchedulesResultList {
    VehicleLicenseNumber: string,
    StartPostalName: string,
    TargetPostalName: string,
    Frequency: string,
    DateTimeInfo: string,
    QuotedPrice: number
}

/**Id 模型 */
export interface VehicleScheduleIdModel{
    Id: number
}

/**搜尋司機模型 */
export interface SearchDriverKeyWordModel {
    DriverId: string,
    SearchWord: string;
}
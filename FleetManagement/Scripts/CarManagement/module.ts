/**
CarManagement服務方法規格
*/
export interface ICarManagementService {

}

/**
車輛 搜尋 ViewModel
*/
export interface VehicleSearchModel {

    //車號
    SearchLicenseNumber: string

    // 車隊廠商(公司Id)
    SearchCompanyId: Number,
}


/*車輛管理 查詢結果儲存用*/
export interface SearchResultList {
    VehicleId: number,
    LicenseNumber: string,
    VehicleCallNo: string,
    LoadWeight: string,
    CompanyName: string,
    VehicleMode: string
}
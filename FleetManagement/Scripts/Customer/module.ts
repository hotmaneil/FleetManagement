
/**Customer 服務方法規格 */
export interface ICustomerService {

    /**
     * 搜尋客戶列表
     * @param input
     */
    SearchResult(input: CustomerSearchModel);

    /**
     * 新增客戶
     * @param input
     */
    CreateCustomer(input: CreateCustomerModel);

    /**
     * 刪除客戶
     * @param Id
     */
    DeleteCustomer(Id: string);
}

/**客戶搜尋 Model */
export interface CustomerSearchModel {

    /**我的公司Id */
    CompanyId: number,

    /**公司統編 */
    SearchTaxNumber: string,
}

/**客戶列表  Model*/
export interface SearchResultList {

    Name: string,

    TaxNumber: string,

    MainContacter: string,

    ContactPhoneNumber: string,

    PersonInCharge: string
}

/**客戶  Model*/
export interface CreateCustomerModel {

    /**我的公司Id */
    CompanyId: number,

    /**統編 */
    TaxNumber: string,

    Name: string,

    MainContacter: string,

    ContactPhoneNumber: string,

    SubContacter: string,

    PersonInCharge: string
}
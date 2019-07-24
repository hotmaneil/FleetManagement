
/**
BrandManagement 服務方法規格
*/
export interface IBrandManagementService {

    /*新增公司群組*/
    CreateCompanyGroup(input: CreateCompanyGroupViewModel) 

    /*編輯公司群組*/
    UpdateCompanyGroup(input: UpdateCompanyGroupViewModel)

    /*刪除公司群組*/
    DeleteCompanyGroup(input: DeleteCompanyGroupIdModel)

    /*新增帳號*/
    CreateAccount(input: CreateAccountModel);
}

/**
車隊廠商群組 新增模型
*/
export interface CreateCompanyGroupViewModel {
    CompanyId: Number,
    GroupName: string
}

/**
車隊廠商群組 更新模型
*/
export interface UpdateCompanyGroupViewModel {
    CompanyId: Number,
    Groupid: Number,
    GroupName: string
}

/**
車隊廠商群組 刪除模型
*/
export interface DeleteCompanyGroupIdModel {
    companyGroupId: Number
}

/*帳號管理 新增帳號用*/
export interface CreateAccountModel {
    PhoneNumber: string,
    RealName: string,
    Password: string,
    CompanyId: number,
    Area: number,
    RoleId: string
}
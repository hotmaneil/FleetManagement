/**新增角色須輸入資訊*/
export interface RoleCreateModel {
    /**角色定義*/RoleName: string;
    /**角色描述/說明*/Description: string;
}
/**WebAccount服務方法規格*/
export interface IWebAccountService {
   /**新增角色*/ CreateRole(input: RoleCreateModel);
   /**刪除角色*/ DeleteRole(roleid: string);
   /**取得角色列表*/GetRoles();

   /*搜尋帳號列表*/
   SearchAccountManageList(input: AccountSearchModel);

    /*新增帳號*/
   CreateAccount(input: CreateAccountModel);

    /*更新帳號*/
   UpdateAccount(input: UserModel);

    /*還原密碼*/
   RollBackPassword(input: UserPasswordModel);

    /*復權或停權該帳號*/
   OpenOrStopAccountAuthority(input: AuthorityModel);

    /*檢查該角色是否屬於公司*/
   CheckRoleIsBelongCompany(RoleId: string): boolean;

    /*檢查符合的角色回傳給地區用*/
   CheckRoleToReturnForArea(RoleId: string): boolean;
}

/*帳號管理 搜尋條件模型*/
export interface AccountSearchModel {
    Account: string,
    Area: number,
    Role: string
}

/*帳號管理 查詢結果儲存用*/
export interface SearchResultList {
    Id: number,
    UserName: string,
    RealName: string,
    BelongCompanyName: string,
    AreaName: string,
    Roles: string
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

/*搜尋功能模型*/
export interface FindFunctionModel {
    RoleId: string
}

/*帳號管理 更新帳號用*/
export interface UserModel {
    Id: string,
    PhoneNumber: string,
    RealName: string,
    CompanyId: number,
    Area: number,
    RoleId: string
}

/*使用者密碼輸入模型 */
export interface UserPasswordModel {
    //UserId: string,
    UserName: string,
    NewPassword: string
}

/*使用者Id輸入模型*/
export interface AuthorityModel {
    UserId: string,
    IsStopAuthority: boolean
}
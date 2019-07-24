import { PrintType } from "../Shared/module";

/**新增角色須輸入資訊*/
export interface RoleCrerateModel {
    /**角色定義*/RoleName: string;
    /**角色描述/說明*/Description: string;
}

 /**角色列表呈現資訊*/
export interface RoleListData {
     /**帳號總數量*/AccountCounts: number;
     /**角色編號*/RoleId:string;
     /**角色定義*/RoleName:string;
     /**角色描述*/Description: string;
}

/**符合此權限帳號呈現資訊*/
export interface AccounrListData {
    /**用戶的帳號*/UserName: string,
    /**用戶的真實姓名*/RealName: string,
    /**用戶手機*/PhoneNumber: string,
    /**公司Id*/CompanyId: string,
    /**公司名稱*/CompanyName: string,
    /**建立者*/CreateUser: string,
    /**建立者姓名*/CreateRealName: string,
    /**角色Id*/RoleId: string,
    /**角色名稱*/RoleName: string,
    /**角色描述*/Description: string
}

/**平台功能項目清單*/
export interface FunctionListData {
    /**子功能列表*/SubList: SubListData[],
    /**功能Id*/Id: number,
    /**???*/IId:string,
    /**父Id*/ParentIId: string,
    /**功能繁忠*/FunctionName: string,
    /**功能英文*/FunctionNameEN:string,
    /**功能簡中*/FunctionNameSC:string,
    /**功能連結*/FunctionUrl:string,
    /**控制器*/Controller: string,
    /**動作*/ActionName:string,
    /**功能排序*/DefaultSort:number,
    /**列表icon*/FunctionIcon:string,
    /**是否刪除*/IsDeleted: boolean
}

/**子功能列表*/
interface SubListData {
    /**功能Id*/Id: number,
    /**???*/IId: string,
    /**父Id*/ParentIId: string,
    /**功能繁忠*/FunctionName: string,
    /**功能英文*/FunctionNameEN: string,
    /**功能簡中*/FunctionNameSC: string,
    /**功能連結*/FunctionUrl: string,
    /**控制器*/Controller: string,
    /**動作*/ActionName: string,
    /**功能排序*/DefaultSort: number,
    /**列表icon*/FunctionIcon: string,
    /**是否刪除*/IsDeleted: boolean
}

/**指定角色以取得其可使用的平台功能項目清單*/
export interface GetRoleFunctionListData {
   /**子功能列表*/ SubList: GetRoleSubListData[],
    /**是否可以使用*/Usable: boolean,
     /**功能Id*/Id: number,
    /**???*/IId: string,
    /**父Id*/ParentIId: string,
    /**功能繁忠*/FunctionName: string,
    /**功能英文*/FunctionNameEN: string,
    /**功能簡中*/FunctionNameSC: string,
    /**功能連結*/FunctionUrl: string,
    /**控制器*/Controller: string,
    /**動作*/ActionName: string,
    /**功能排序*/DefaultSort: number,
    /**列表icon*/FunctionIcon: string,
    /**是否刪除*/IsDeleted: boolean
}

/**指定角色平台子功能列表*/
interface GetRoleSubListData {
    /**是否可以使用*/Usable: boolean,
   /**功能Id*/Id: number,
    /**???*/IId: string,
    /**父Id*/ParentIId: string,
    /**功能繁忠*/FunctionName: string,
    /**功能英文*/FunctionNameEN: string,
    /**功能簡中*/FunctionNameSC: string,
    /**功能連結*/FunctionUrl: string,
    /**控制器*/Controller: string,
    /**動作*/ActionName: string,
    /**功能排序*/DefaultSort: number,
    /**列表icon*/FunctionIcon: string,
    /**是否刪除*/IsDeleted: boolean
}

/**Role服務方法規格*/
export interface IRoleService {

    /**[GET]角色列表(角色帳號數量)*/
    GetRoleCounters();

    /**
     * [POST]新增角色
     * @param input
     */
    CreateRoleResult(input: RoleCrerateModel);

    /**
    *[GET] 符合角色之帳號列表
    * @param roleid 角色編號*/
    RoleAccounts(roleid: string);

    /**
    *開放功能(平台功能項目清單)
    * @param realall 讀取全部資料,選填。預設為false*/
    WebFunctionList(realall: boolean);

    /**
    *開放功能(平台功能項目清單,指定角色對應可使用權限)
     * @param roleid 角色編號*/
    RoleFunctions(roleid: string);

    /**
    *異動角色可用功能項目
    *角色編號已經由點擊事件取代
    * @param FunctionIds 功能勾選編號*/
    RoleFunctionsUpdate(FunctionIds: number[]);

    /**取得該角色所有的已選項目**/
    GetAllChecked();

    /**
     * 輸出Excel或PDF
     * @param filename
     * @param print
     */
    ExportExcelOrPDF(filename, print: PrintType);
}

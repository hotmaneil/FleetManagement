import {
    RoleCreateModel,
    IWebAccountService,
    AccountSearchModel,
    SearchResultList,
    CreateAccountModel,
    FindFunctionModel,
    UserModel,
    UserPasswordModel,
    AuthorityModel
} from './module';

import
{
    HttpStatusCode,
    CreateMessage,
    InfoType,
    DoAjax,
    AjaxOption
} from '../Shared/module';
import { RelativePath } from '../Shared/enum';

/**宣告String,以擴充屬性Empty*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

//儲存json搜尋結果
let savejson: SearchResultList[];

/**WebAccount服務*/
export class WebAccountService implements IWebAccountService {
    CreateRole(input:RoleCreateModel) {
        let setting: AjaxOption = {
            url: '/UserRole/CreateRole', type: 'POST', dataType: 'json',
            data: { RoleName: input.RoleName, Description: input.Description }
        };
        DoAjax(setting,
            function (res) {SUCCESS('CreateRole', res);},
            function (res) { ERROR('CreateRole', res); },
            null,
            null);
    }
    DeleteRole(roleid: string) {
        let setting: AjaxOption = {
            url: ' /UserRole/DeleteRole', type: 'POST', dataType: 'json',
            data: { roleid: roleid}
        };
        DoAjax(setting,
            function (res) { SUCCESS('DeleteRole', res); },
            function (res) { ERROR('DeleteRole', res); },
            null,
            null);
    }
    GetRoles() { }

    /**
     * 搜尋帳號列表
     * @param input
     */
    SearchAccountManageList(input: AccountSearchModel) {
        let setting: AjaxOption = {
            url: 'WebAccount/GetAccountManageList',
            type: 'POST',
            dataType: 'json',
            data: {
                Account: input.Account,
                Area: input.Area,
                Role: input.Role
            }
        };

        DoAjax(setting,
            function (res) {
                SUCCESS('SearchAccountManageList', res);
                savejson = res.Data;
            },
            function (res) {
                ERROR('SearchAccountManageList', res);
            },
            function () {
                BeforeSend('SearchAccountManageList', '#dataTable')
            },
            null);
    }

    /**
     * 新增帳號
     * @param input
     */
    CreateAccount(input: CreateAccountModel){
        let _this = this;
        let setting: AjaxOption = {
            url: '/WebAccount/CreateAccount',
            type: 'POST',
            dataType: 'json',
            data: {
                PhoneNumber: input.PhoneNumber,
                RealName: input.RealName,
                Password: input.Password,
                CompanyId: input.CompanyId,
                Area: input.Area,
                RoleId: input.RoleId
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("CreateAccount", res);
                _this.SearchAccountManageList({
                    Account: '',
                    Area: null,
                    Role: '' });
            },
            function (res) { ERROR("CreateAccount", res); },
            function () { BeforeSend("CreateAccount", '#CreateAccontModal .content'); },
            null);
    }

    /**
     * 更新帳號
     * @param input
     */
    UpdateAccount(input: UserModel) {
        let setting: AjaxOption = {
            url: '/WebAccount/UpdateAccount',
            type: 'POST',
            dataType: 'json',
            data: {
                Id: input.Id,
                PhoneNumber: input.PhoneNumber,
                RealName: input.RealName,
                CompanyId: input.CompanyId,
                Area: input.Area,
                RoleId: input.RoleId
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("UpdateAccount", res);
            },
            function (res) { ERROR("UpdateAccount", res); },
            function () { BeforeSend("UpdateAccount", ''); },
            null);
    }

    /**
     * 重設密碼
     * @param input
     */
    RollBackPassword(input: UserPasswordModel){
        let setting: AjaxOption = {
            url: '/Account/RollbackPassword',
            type: 'POST',
            dataType: 'json',
            data: {
                UserName: input.UserName,
                NewPassword: input.NewPassword 
            }
        };
        DoAjax(setting,
            function (res) {
                toastr['success']('儲存成功!新密碼為' + input.NewPassword);
            },
            function (res) { ERROR("RollbackPassword", res); },
            function () { BeforeSend("RollbackPassword", ''); },
            null);
    }

    /**
     * 復權或停權該帳號
     * @param input
     */
    OpenOrStopAccountAuthority(input: AuthorityModel) {
        let _this = this;
        let setting: AjaxOption = {
            url: '/Account/OpenOrStopAccountAuthority',
            type: 'POST',
            dataType: 'json',
            data: {
                UserId: input.UserId,
                IsStopAuthority: input.IsStopAuthority
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("OpenOrStopAccountAuthority", res);
                _this.SearchAccountManageList({
                    Account: '',
                    Area: null,
                    Role: ''
                });
            },
            function (res) { ERROR("OpenOrStopAccountAuthority", res); },
            function () { BeforeSend("OpenOrStopAccountAuthority", ''); },
            null);
    }

   /**
    * 檢查該角色是否屬於公司
    * @param RoleId
    */
    CheckRoleIsBelongCompany(RoleId: string): boolean {
        let setting: AjaxOption = {
            url: '/WebAccount/CheckRoleIsBelongCompany',
            type: 'GET',
            dataType: 'json'
        };

        var isBelong = false;
        $.ajax({
            url: setting.url,
            type: setting.type,
            contentType: "application/json; charset=utf-8",
            dataType: setting.dataType,
            data: { RoleId: RoleId },
            async: false,
           
            success: function (result) {
                isBelong = result.Data;
            },
        });
        return isBelong;
    }

    /**
     * 檢查符合的角色回傳給地區用
     * @param RoleId
     */
    CheckRoleToReturnForArea(RoleId: string): boolean {
        let setting: AjaxOption = {
            url: '/WebAccount/CheckRoleToReturnForArea',
            type: 'GET',
            dataType: 'json'
        };

        var isCorrect = false;
        $.ajax({
            url: setting.url,
            type: setting.type,
            contentType: "application/json; charset=utf-8",
            dataType: setting.dataType,
            data: { RoleId: RoleId },
            async: false,

            success: function (result) {
                isCorrect = result.Data;
            },
        });
        return isCorrect;
    }

}
/**列舉流程步驟*/
type flowStep = "CreateRole" | "DeleteRole" |
    "SearchAccountManageList" | "CreateAccount" | "FindFunctionList" | "UpdateAccount" | "RollbackPassword" | "OpenOrStopAccountAuthority";

/**
 * 回傳成功結果
 * @param Step
 * @param res
 */
function SUCCESS(Step: flowStep, res: any) {
    let message: string = String.empty;
    switch (res.HttpStatusCode) {
        case HttpStatusCode.OK:
            switch (Step) {
                case "CreateRole":
                    toastr["success"]("新增成功");
                    break;
                case "DeleteRole":
                    break;

                case "SearchAccountManageList":
                    GenerateAccountManageList(res.Data);
                    break;

                case "CreateAccount":
                    $("#CreateAccontModal").modal('hide');
                    toastr["success"]("新增成功");
                    break;

                case "RollbackPassword":
                    break;

                case "UpdateAccount":
                    toastr['success']('儲存成功!');
                    break;

                case "OpenOrStopAccountAuthority":
                    toastr['success']('修改帳號權成功!');
                    break;        
            }
            break;

        case HttpStatusCode.BAD_REQUEST:
            switch (Step) {
                case 'CreateAccount':
                    message = CreateMessage(InfoType.error, '', res.Message, '');
                    toastr['error'](res.Message);
                    break;
            }
            break;
    }
}

/**
 * 回傳失敗結果
 * @param Step
 * @param res
 */
function ERROR(Step: flowStep, res: any) {
    let message: string = String.empty;
    switch (res.HttpStatusCode) {
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
                case "CreateRole":
                    break;
                case "DeleteRole":
                    break;

                case "SearchAccountManageList":
                    toastr["error"](res.Message);
                    let tableMessage: string = CreateMessage(InfoType.error, "", "", res.Message);
                    $("#dataTable").empty().append(tableMessage);
                    break;

                case "UpdateAccount":
                case "RollbackPassword":
                    toastr['error']('儲存失敗!');
                    break;

                case "OpenOrStopAccountAuthority":
                    toastr['success']('修改帳號權失敗!');
                    break;

                case "CreateAccount":
                    toastr['error']('新增失敗!');
                    break;
            }
            break;

        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
                case 'CreateRole':
                    message = CreateMessage(InfoType.error, '', res.Message, '');
                    break;
            }
    }
}

/**
 * 送出前
 * @param Step
 * @param selector
 */
function BeforeSend(Step: flowStep, selector: string) {
    let skeleton: string = String.empty;
    switch (Step) {
        case "CreateRole":
            break;
        case "DeleteRole":
            break;

        case "UpdateAccount":
        case 'CreateRole':
        case "RollbackPassword":
            skeleton = CreateMessage(InfoType.info, '', '系統執行中,請稍候', '');
            break;
    }
}

/**
 * 產生帳號管理資料列表
 * @param Data
 */
function GenerateAccountManageList(Data: SearchResultList[]) {
    var table = new Tabulator("#dataTable", {
        height: "60vh",

        fitColumns: true,
        selectable: 1,
        rowFormatter: function (row, data) {

            //找出已經按下編輯按鈕的session
            var editedUserId = sessionStorage.getItem('editedUserId');
            var userId = row.getData()['Id'];

            if (editedUserId == userId) {

                //看到哪列上次編輯過
                row.getElement().style.backgroundColor = "#A6A6DF";
            }
        },

        layout: "fitColumns",
        layoutColumnsOnNewData: true,
        pagination: "local",
        paginationSize: 10,
        history: true,
        placeholder: "無資料",
        columns: [
            { title: "帳號", field: "UserName", sorter: "string" },
            { title: "姓名", field: "RealName", sorter: "string" },
            { title: "所屬公司", field: "BelongCompanyName", sorter: "string" },
            { title: "地區", field: "AreaName", sorter: "string" },
            { title: "角色", field: "Roles", sorter: "string" },

            {
                title: "操作", field: "Id", align: "center", sortable: false, formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    let editBtn = `<button type="button" class="ui basic button circular cusgreen" name="edit" edit-Id="${value}">編輯</button>`;
                    return editBtn;
                }
            },

            {
                title: "", field: "UserName", align: "center", sortable: false, formatter: function (cell, formatterParams) {
                    let value = cell.getValue();
                    let backPwdBtn = `<button type="button" class="ui basic button circular yellow" name="backPwd" backPwd-Id="${value}">變更密碼</button>`;
                    return  backPwdBtn;
                }
            },

            {
                formatter: function (cell, formatterParams) {
                    let isStopAuthority = cell.getRow().getData().IsStopAuthority;
                    let id = cell.getRow().getData().Id;
                    let stopBtn = `<button type="button" class="ui basic button circular red" name="stop" stop-Id="${id}">停權</button>`;
                    let openBtn = `<button type="button" class="ui basic button circular olive" name="open" open-Id="${id}">復權</button>`;

                    if (isStopAuthority) {
                        return openBtn;
                    }  
                    else {
                        return stopBtn;
                    }
                }
                
            },

            {
                formatter: function (cell, formatterParams) {
                    let roleName = cell.getRow().getData().RoleName;
                    let Area = cell.getRow().getData().Area;
                    let driver = cell.getRow().getData().Id;
                    let companyId = cell.getRow().getData().CompanyId;
                   
                    let editCompanyVehicleBtn = `<button type="button" class="ui basic button circular blue" name="editCompanyGroupVehicle" editCompanyGroupVehicleId="${driver}" companyId="${companyId}">編輯車隊車輛</button>`;
                    let editCompanyDriverVehicleBtn = `<button type="button" class="ui basic button circular teal" name="editCompanyDriverVehicle" editCompanyDriverVehicleId="${driver}" companyId="${companyId}">編輯司機車輛</button>`;

                    switch (roleName)
                    {
                        //(廠商)車隊帳號，只能出現所屬車隊的車做編輯
                        case "FleetManager":
                            return editCompanyVehicleBtn;

                        //司機，只能出現所屬車隊的車做編輯
                        case "CarOwner":
                        case "Driver":
                            return editCompanyDriverVehicleBtn;
                    }
                }
            },
        ],
    });
    table.setData(Data);
}
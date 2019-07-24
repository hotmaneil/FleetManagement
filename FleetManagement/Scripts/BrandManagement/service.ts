import{
    IBrandManagementService,
    CreateCompanyGroupViewModel,
    UpdateCompanyGroupViewModel,
    DeleteCompanyGroupIdModel,
    CreateAccountModel
} from './module';

import {
    HttpStatusCode,
    CreateMessage,
    InfoType,
    DoAjax,
    AjaxOption
} from '../Shared/module';

/**
宣告String,以擴充屬性Empty
*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

/**
*BrandManagement 廠商管理 服務
*/
export class BrandManagementService implements IBrandManagementService {

    /**
     * 取得廠商之群組資料
     * @param CompanyId
     */
    GetCompanyGroups(CompanyId: Number) {
        let setting: AjaxOption = {
            url: '/BrandManagement/GetGroupByCompany',
            type: 'GET',
            dataType: 'json',
            data: { companyId: CompanyId}
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("GetCompanyGroups", res);
            },
            function (res) {
                ERROR("GetCompanyGroups", res);
            },
            function () {
                BeforeSend("GetCompanyGroups", '#companyGroupList');
            },
            null);
    }

    /**
     * 新增公司群組
     * @param input
     */
    CreateCompanyGroup(input: CreateCompanyGroupViewModel) {
        let setting: AjaxOption = {
            url: '/BrandManagement/CreateCompanyGroup',
            type: 'POST',
            dataType: 'json',
            data: {
                CompanyId: input.CompanyId,
                GroupName: input.GroupName
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("CreateCompanyGroup", res);
                location.reload();
            },
            function (res) { ERROR("CreateCompanyGroup", res); },
            function () { BeforeSend("CreateCompanyGroup", ""); },
            null);
    }

    /**
     * 編輯公司群組
     * @param input
     */
    UpdateCompanyGroup(input: UpdateCompanyGroupViewModel) {
        let setting: AjaxOption = {
            url: '/BrandManagement/UpdateCompanyGroup',
            type: 'POST',
            dataType: 'json',
            data: {
                CompanyId: input.CompanyId,
                Groupid: input.Groupid,
                GroupName: input.GroupName
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("UpdateCompanyGroup", res);
                location.reload();
            },
            function (res) { ERROR("UpdateCompanyGroup", res); },
            function () { BeforeSend("UpdateCompanyGroup", ""); },
            null);
    }

    /**
     * 刪除公司群組
     * @param input
     */
    DeleteCompanyGroup(input: DeleteCompanyGroupIdModel) {
        let setting: AjaxOption = {
            url: '/BrandManagement/DeleteCompanyGroup',
            type: 'POST',
            dataType: 'json',
            data: { companyGroupId: input.companyGroupId}
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("DeleteCompanyGroup", res);
                location.reload();
            },
            function (res) { ERROR("DeleteCompanyGroup", res); },
            function () { BeforeSend("DeleteCompanyGroup", ""); },
            null);
    }

    /**
      * 新增帳號
      * @param input
      */
    CreateAccount(input: CreateAccountModel) {
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
                location.reload();
            },
            function (res) { ERROR("CreateAccount", res); },
            null,
            null);
    }
}

/*列舉流程步驟*/
type flowStep = "SearchResult" | "CreateCompany" | "GetCompanyGroups" | "UpdateCompany" | "DeleteCompany" |
    "CreateCompanyGroup" | "UpdateCompanyGroup" | "DeleteCompanyGroup" | "FindFunctionList" | "CreateAccount";

/**
 * 回傳成功結果
 * @param Step
 * @param res
 */
function SUCCESS(Step: flowStep, res: any) {

    let _this = this;

    switch (res.HttpStatusCode) {

        case HttpStatusCode.OK:
            switch (Step) {
                case "CreateCompanyGroup":
                case "UpdateCompanyGroup":
                    toastr['success']('儲存成功!');
                    break;

                case "DeleteCompanyGroup":
                    toastr['success']('刪除成功!');
                    break;
            }
            break;

        case HttpStatusCode.BAD_REQUEST:
            switch (Step) {
                
            }
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
        case HttpStatusCode.NOT_FOUND:
            window.location.href = '@Url.Action("NotFound", "Error")';
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
                case "GetCompanyGroups":
                    message = CreateMessage(InfoType.error, "", res.Message, "");
                    $("#companyGroupList").empty().append(message);
                    break;
            }
            break;
        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
                case "CreateCompanyGroup":
                case "UpdateCompanyGroup":
                    toastr['error']('儲存失敗!');
                    break;

                case "DeleteCompanyGroup":
                    toastr['error']('刪除失敗!');
                    break;
            }
            break;
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
        case "SearchResult":
            skeleton = ` <tr><td colspan="5"><div class="ui fluid placeholder">
                         <div class="full line"></div>
                         <div class="very long line"></div>
                         <div class="long line"></div>
                         <div class="full line"></div>
                         <div class="very long line"></div>
                         <div class="long line"></div>
                        </div></td></tr>`;
            break;

        case "CreateCompanyGroup":
        case "UpdateCompanyGroup":
            skeleton = CreateMessage(InfoType.info, '', '系統執行中,請稍候', '');
            break;

        case "GetCompanyGroups":
            skeleton = "";
            break;
    }
    $(selector).empty().append(skeleton);
}
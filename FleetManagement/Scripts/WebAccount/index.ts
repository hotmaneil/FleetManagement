import * as s from './service';
import * as common from '../Shared/service';
import { RoleCreateModel } from './module';
import { ICommonService } from '../Shared/module';
import { RelativePath } from '../Shared/enum';

let service = new s.WebAccountService();
let commonService = new common.CommonService();

$(document).ready(async function () {
    CreateRole();

    var SearchAccount = sessionStorage.getItem('SearchAccount');
    var SearchArea = sessionStorage.getItem('SearchArea');
    var SearchRole = sessionStorage.getItem('SearchRole');
    service.SearchAccountManageList({
        Account: SearchAccount == null ? '' : SearchAccount,
        Area: SearchArea == null ? null : parseInt(SearchArea, 10),
        Role: SearchRole == null ? '' : SearchRole
    });

    CreateAccountModal();
    RoleIdTriggerFindFunctionList();

    ChangePasswordModal(undefined);
    
});

$('#CreateRoleForm').on("submit", function (event) {
    event.preventDefault();
    let input:RoleCreateModel= {
        Description: <string>$("input[name='Description']").val(),
        RoleName: <string>$("input[name='RoleName']").val(),
    };
    service.CreateRole(input);
    $("#CreateRoleModal").modal("hide");
});　

//搜尋帳號
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let account: string = <string>$("#Account").val();
    let area: number = <number>$("#Area").val();
    let role: string = <string>$("#Role").val();

    sessionStorage.setItem('SearchAccount', account);
    sessionStorage.setItem('SearchArea', area.toString());
    sessionStorage.setItem('SearchRole', role);

    service.SearchAccountManageList({
        Account: account,
        Area: area,
        Role: role
    });
   
});

//新增帳號
$("#CreateAccountForm").on('submit', function (event) {
    event.preventDefault();

    if ($("#CreateAccountForm").form('is valid')) {

        let phoneNumber: string = <string>$("#PhoneNumber").val();
        let realName: string = <string>$("#RealName").val();
        let password: string = <string>$("#Password").val();
        let companyId: number = <number>$("#CompanyId").val();
        let area: number = <number>$("#AreaId").val();
        let roleId: string = <string>$("#RoleId").val();

        service.CreateAccount({
            PhoneNumber: phoneNumber,
            RealName: realName,
            Password: password,
            CompanyId: companyId,
            Area: area,
            RoleId: roleId
        });
    }
});

//帳號列表 按鈕功能
$("#dataTable").on("click", "div button", function () {
    let editId: string = <string>($(this).attr("edit-Id"));
    if (editId != undefined) {
        sessionStorage.setItem('editedUserId', editId);
        window.location.href = RelativePath.ConstName + 'WebAccount/EditAccount?UserId=' + editId;
    }

    let backPwdId: string = <string>($(this).attr("backPwd-Id"));
    if (backPwdId != undefined) {
        $('#ChangePasswordModal').modal('show');
        ChangePasswordModal(backPwdId)
    }

    let stopId: string = <string>($(this).attr("stop-Id"));
    if (stopId != undefined) {
        var isConfirm = confirm("是否將該帳號停權？");
        if (isConfirm) {
            let isStopAuthority: boolean = true;
            service.OpenOrStopAccountAuthority({ UserId: stopId, IsStopAuthority: isStopAuthority })
        }
    }

    let openId: string = <string>($(this).attr("open-Id"));
    if (openId != undefined) {
        var isConfirm = confirm("是否將該帳號復權？");
        if (isConfirm) {
            let isStopAuthority: boolean = false;
            service.OpenOrStopAccountAuthority({ UserId: openId, IsStopAuthority: isStopAuthority })
        }
    }

    //檢視所有車輛
    let viewAllAreaId: number = parseInt($(this).attr("viewAllAreaId"), 10);
    if (viewAllAreaId.toString() != "NaN") {
        window.location.href = '../WebAccount/ViewPartVehicleList';
    }

    //檢視區域車輛
    let viewAreaId: number = parseInt($(this).attr("viewAreaId"), 10);
    if (viewAreaId.toString() != "NaN") {
        window.location.href = '../WebAccount/ViewPartVehicleList?AreaId=' + viewAreaId;
    }

    //編輯公司司機車輛
    let editCompanyDriverVehicleId: string = <string>($(this).attr("editCompanyDriverVehicleId"));
    let companyId: string = <string>($(this).attr("companyId"));
    if (editCompanyDriverVehicleId != undefined) {
        var url = RelativePath.ConstName + 'BrandManagement/EditCompanyDriverVehicles?CompanyId=' + companyId
            + "&DriverId=" + editCompanyDriverVehicleId + "&Control=WebAccount";
        window.location.href = url;
    }

    //編輯公司車隊車輛
    let editCompanyGroupVehicleId: string = <string>($(this).attr("editCompanyGroupVehicleId"));
    if (editCompanyGroupVehicleId != undefined) {
        var url = RelativePath.ConstName + 'BrandManagement/CompanyGroup?CompanyId=' + companyId;
        window.location.href = url;
    }
});

//角色下拉選單提示功能列表
$("#RoleId").change(function () {
    RoleIdTriggerFindFunctionList();
});

//更新帳號=>Doris要求更換為跳轉上一頁
//$("#UpdateAccountForm").on('submit', function (event) {
//    event.preventDefault();

//    if ($("#UpdateAccountForm").form('is valid')) {
//        let id: string = <string>$("#Id").val();
//        let phoneNumber: string = <string>$("#PhoneNumber").val();
//        let realName: string = <string>$("#RealName").val();
//        let companyId: number = <number>$("#CompanyId").val();
//        let area: number = <number>$("#Area").val();
//        let roleId: string = <string>$("#RoleId").val();

//        service.UpdateAccount({
//            Id: id,
//            PhoneNumber: phoneNumber,
//            RealName: realName,
//            CompanyId: companyId,
//            Area: area,
//            RoleId: roleId
//        });
//    }
//});

//返回帳號列表
$("#backToIndexBtn").click(function () {
    window.location.href = '../WebAccount/Index';
});

/**
共用角色驗證公司規則
*/
$.fn.form.settings.rules.ValidateCompanyId = function (param) {
    var roleId = $("#RoleId").val();
    var isBelong = ValidateCompanyByRoleId(roleId);

    var companyId = $("#CompanyId").val();

    var result = isBelong == true ? false : true;
    if (companyId == "" || companyId == "NULL") {
        return result;
    }
    else
        return true;
}

/**
共用角色驗證地區
1.司機、車隊：公司及地區必填
2.分局、控制台：地區必填
3.系統、高公局：非必填
*/
$.fn.form.settings.rules.ValidateAreaId = function (param) {

    var roleId = $("#RoleId").val().toString();
   
    var isCorrect = service.CheckRoleToReturnForArea(roleId);

    var result = isCorrect == true ? false : true;

    if (param == "" || param == "NULL") {
        return result;
    }
    else {
        return true;
    }
}

/**
 * 更新帳號驗證規則
 */
var validateUpdateAccountFormFieldsRule = {

    RealName: {
        identifier: 'RealName',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入姓名'
            }
        ]
    },
    CompanyId: {
        identifier: 'CompanyId',
        rules: [
            {
                type: 'ValidateCompanyId[param]',
                prompt: '請選擇公司'
            }
        ]
    },
    Area: {
        identifier: 'Area',
        rules: [
            {
                type: 'ValidateAreaId[param]',
                prompt: '請選擇地區'
            }
        ]
    }
}

//套用更新帳號驗證規則
$('#UpdateAccountForm')
    .form({
        on: 'blur',
        inline: true,
        fields: validateUpdateAccountFormFieldsRule
    });

function CreateRole() {
    $("#CreateRoleModal").modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消新增");
        },
        onApprove: function () {
            $("#CreateRoleForm").form({
                on: 'blur',
                fields: {
                    RoleName: {
                        identifier: 'RoleName',
                        rules: [
                            {
                                type: 'empty',
                                prompt: '請輸入角色名稱(英文)'
                            }
                        ]
                    },
                    Description: {
                        identifier: 'Description',
                        rules: [
                            {
                                type: 'empty',
                                prompt: '請輸入角色說明'
                            }
                        ]
                    }

                }
            });
            if ($(this).form('is valid')) {
                $('#CreateRoleForm').trigger('submit');
            }
            return false;
        }
    }).modal('attach events', '#btnCreateRole');
}

/**
 * 新增帳號 驗證規則
 */
var validateCreateAccountFormFieldsRule = {
    PhoneNumber: {
        identifier: 'PhoneNumber',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入帳號'
            }
        ]
    },
    RealName: {
        identifier: 'RealName',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入姓名'
            }
        ]
    },
    Password: {
        identifier: 'Password',
        rules: [
            {
                type:'regExp[^(?=.*\\d)(?=.*[a-z]).{6,}$]',
                prompt: '請輸入6碼以上且英數交雜之密碼'
            }
        ]
    },
    RoleId: {
        identifier: 'RoleId',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入角色'
            }
        ]
    },
    CompanyId: {
        identifier: 'CompanyId',
        rules: [
            {
                type: 'ValidateCompanyId[param]',
                prompt: '請選擇公司'
            }
        ]
    },
    AreaId: {
        identifier: 'AreaId',
        rules: [
            {
                type: 'ValidateAreaId[param]',
                prompt: '請選擇地區'
            }
        ]
    }
}

//套用新增帳號驗證規則
$("#CreateAccountForm").form({
    on: 'blur',
    inline: true,
    fields: validateCreateAccountFormFieldsRule
});

/**
 * 變更密碼驗證規則
 */
var validateChangePasswordFormFieldsRule = {
    ChangePassword: {
        identifier: 'ChangePassword',
        rules: [
            {
                type: 'regExp[^(?=.*\\d)(?=.*[a-z]).{6,}$]',
                prompt: '請輸入6碼以上且英數交雜之密碼'
            }
        ]
    },
}

//套用變更密碼驗證規則
$("#ChangePasswordForm").form({
    on: 'blur',
    inline: true,
    fields: validateChangePasswordFormFieldsRule
});

/**
 * 新增帳號 Modal
 */
function CreateAccountModal() {
    //.ui.modal
    $('#CreateAccontModal').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消新增");
        },
        onApprove: function () {
            if ($("#CreateAccountForm").form('is valid')) {
                //$('#CreateAccountForm').trigger('submit');
            } else {
                toastr["error"]("表單不通過驗證");
            }
            return false;
        }
    }).modal('attach events', '#btnCreateAccount');
}

/**
 * 變更密碼 Modal
 * @param backPwdId
 */
function ChangePasswordModal(backPwdId) {
    $('#ChangePasswordModal').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消新增");
        },
        onApprove: function () {
            if ($("#ChangePasswordForm").form('is valid')) {
                let changePassword: string = <string>($("#ChangePassword").val());
                service.RollBackPassword({ UserName: backPwdId, NewPassword: changePassword })
            } else {
                toastr["error"]("表單不通過驗證");
            }
            return false;
        }
    });
}

/**
 * 角色Id觸發功能列表
 */
function RoleIdTriggerFindFunctionList() {
    let roleId: string = <string>($("#RoleId").val());
    commonService.FindFunctionList({ RoleId: roleId });
}

/**
 * 依照角色檢查公司是否必填
 * @param RoleId
 */
function ValidateCompanyByRoleId(RoleId) {
    var data = service.CheckRoleIsBelongCompany(RoleId);
    return data;
}

//重填時清空下拉選單
$('#resetBtn').click(function () {
    $("#CompanyId").prop('selectedIndex', 0);
    $("#CompanyId").dropdown('clear');
});

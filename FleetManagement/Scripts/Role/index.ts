import * as moment from "../../Content/bower_components/moment/moment";
import { PrintType } from "../Shared/module";
import * as s from './service';
let service = new s.RoleService();

/**查詢時間*/
let nowtime = moment().format("YYYYMMDDHHmmss");
$(document).ready(async function () {
    service.GetRoleCounters();
    service.ExportExcelOrPDF("角色列表_" + nowtime, PrintType.landscape);
    await service.WebFunctionList(false);
    CreateRole();
});

$("#searchResult .menu .item").tab();
$("#RoleListTable tbody").on('click', ' tr td:last-child a', async function () {
    let roleId: string = $(this).attr("data-RoleId");
    let roleName: string = $(this).parent("td").prev().html();
    $("#ShowMessage").empty().html("<h3>您選擇了角色:<span id='roleName'>" + roleName + "</span></h3>");
    await service.RoleAccounts(roleId);
    await service.RoleFunctions(roleId);
});

$("#CreateRoleForm").on('submit', function (event) {
    event.preventDefault();
    let rolename: string = <string>$(this).find("input:eq(0)").val();
    let description: string = <string>$(this).find("input:eq(1)").val();
    service.CreateRoleResult({ RoleName: rolename, Description: description });
});

$("#saveFuntionList").on('click', function () {
    let result = service.GetAllChecked();
    console.log(result);
    service.RoleFunctionsUpdate(result);
});

function CreateRole() {
    $('.ui.modal').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消新增");
        },
        onApprove: function () {
            $('#CreateRoleForm').trigger('submit');
            return false;
        }
    }).modal('attach events', '#btnCreateRole');
}


import * as s from './service';
import { RelativePath } from '../Shared/enum';
let service = new s.CarManagementService();

$(document).ready(async function () {

    var SearchLicenseNumber = sessionStorage.getItem('SearchLicenseNumber');
    var SearchCompanyId = sessionStorage.getItem('SearchCompanyId');

    service.SearchResult({
        SearchLicenseNumber: SearchLicenseNumber == null ? '' : SearchLicenseNumber,
        SearchCompanyId: SearchCompanyId == null ? null : parseInt(SearchCompanyId, 10)
    });
    CreateVehicleModal();
});

//搜尋
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let licenseNumber: string = <string>$("#SearchLicenseNumber").val();
    let companyId: Number = <Number>$("#SearchCompanyId").val();

    sessionStorage.setItem('SearchLicenseNumber', licenseNumber);
    sessionStorage.setItem('SearchCompanyId', companyId.toString());
    
    service.SearchResult({
        SearchLicenseNumber: licenseNumber,
        SearchCompanyId: companyId,
    });
});

//車輛列表 按鈕功能
$("#dataTable").on("click", "div button", function () {
    let editId: string = <string>($(this).attr("edit-Id"));
    if (editId != undefined) {
        sessionStorage.setItem("editedVehicleId", editId);
        window.location.href = RelativePath.ConstName + 'CarManagement/Edit?VehicleId=' + editId;
    }
});

//公司下拉選單
$("#CompanyIds").change(function () {
    GetCompanyChangeGroupList();
});

//返回車輛列表
$("#backToIndexBtn").click(function () {
    window.location.href = '../CarManagement/Index';
});

//新增按鈕
$("#btnCreateVehicle").click(function () {
    window.location.href = RelativePath.ConstName + 'CarManagement/Create';
});

//表單驗證
$('.ui.form')
    .form({
        on: 'blur',
        inline: true,
        fields: {
            LicenseNumber: {
                identifier: 'LicenseNumber',
                rules: [
                    {
                        type: 'empty',
                        prompt: '請輸入車號'
                    }
                ]
            },
            CompanyIds: {
                identifier: 'CompanyIds',
                rules: [
                    {
                        type: 'empty',
                        prompt: '請輸入廠商'
                    }
                ]
            }
        }
    });

/**
 * 依照公司下拉選單變更群組下拉選單
 */
function GetCompanyChangeGroupList() {
    $.ajax({
        type: 'POST',
        url: "../CarManagement/CompanyChangeGroupList",
        data: {
            CompanyIds: $("#CompanyIds").val(),
            VehicleId: $("#VehicleId").val()
        },
        async: false,
        success: function (data) {
            $("#CompanyGroups").empty();
            $("#CompanyGroups").html();

            var obj = "<option value=\"\">請選擇</option>";
            $.each(data, function (i, item) {
                if (item.Selected == true) {
                    obj += "<option selected=\"" + item.Selected + "\" value=\"" + item.Value + "\">" + item.Text + "</option>";
                } else {
                    obj += "<option value=\"" + item.Value + "\">" + item.Text + "</option>";
                }
            });
            $("#CompanyGroups").html(obj); 
        }
    });
}

/**
 * 新增廠商 Modal
 */
function CreateVehicleModal() {
    $('.ui.modal').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消新增");
        },
        onApprove: function () {
            $('#CreateVehicleForm').trigger('submit');
            return false;
        }
    }).modal('attach events', '#btnCreateVehicle');
}

//重填時清空下拉選單
$('#resetBtn').click(function () {

    $("#CompanyIds").dropdown('clear');

    $("#CompanyGroups").dropdown('clear');

    $("#VehicleModelId").prop('selectedIndex', 0);
    $("#VehicleModelId").dropdown('clear');

    $("#LoadWeight").prop('selectedIndex', 0);
    $("#LoadWeight").dropdown('clear');

    $("#LoadConditions").dropdown('clear');
});
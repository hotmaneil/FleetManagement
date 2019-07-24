import { CreateCustomerModel } from "./module";
import * as s from './service';
import { ValidateTaxIdNumber } from "../Shared/function";
import { RelativePath } from "../Shared/enum";
let service = new s.CustomerService();

$(document).ready(async function () {

    var SearchTaxNumber = sessionStorage.getItem('SearchTaxNumber');

    service.SearchResult({
        CompanyId: <number>$("#CompanyId").val(),
        SearchTaxNumber: SearchTaxNumber == null ? null : SearchTaxNumber
    });

    CreateCustomerModal();

    $("#AsMainContacter").change(function () {
        var mainContacter = $("#MainContacter").val();
        $("#PersonInCharge").val(mainContacter);
    });

    $("#AsSubContacter").change(function () {
        var subContacter = $("#SubContacter").val();
        $("#PersonInCharge").val(subContacter);
    });

    $("#backToIndexBtn").click(function () {
        var companyId = $("#CompanyId").val();
        location.href = "Index";
    });
});

//新增客戶Modal 提交
$('#CreateCustomerForm').on("submit", function (event) {
    event.preventDefault();

    if ($('#CreateCustomerForm').form('is valid')) {

        let input: CreateCustomerModel = {
            CompanyId: <number>$("#CompanyId").val(),
            TaxNumber: <string>$("#TaxNumber").val(),
            Name: <string>$("#Name").val(),
            MainContacter: <string>$("#MainContacter").val(),
            ContactPhoneNumber: <string>$("#ContactPhoneNumber").val(),
            SubContacter: <string>$("#SubContacter").val(),
            PersonInCharge: <string>$("#PersonInCharge").val()
        };

        service.CreateCustomer(input);
    };
});

//搜尋客戶
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let companyId: number = <number>$("#CompanyId").val();
    let searchTaxNumber: string = <string>$("#SearchTaxNumber").val();

    sessionStorage.setItem('SearchTaxNumber', searchTaxNumber);

    service.SearchResult({
        CompanyId: companyId,
        SearchTaxNumber: searchTaxNumber,
    });

});

//客戶列表 按鈕功能
$("#dataTable").on("click", "div button", function () {

    //編輯
    let editCustomerId: string = <string>($(this).attr("editCustomerId"));
    if (editCustomerId != undefined) {
        location.href = RelativePath.ConstName + "CustomerManage/Edit?Id=" + editCustomerId;
    }

    //刪除
    let delId: string = <string>($(this).attr("delId"));
    if (delId != undefined) {
        var isConfirm = confirm("確定刪除客戶？");
        if (isConfirm) {
            service.DeleteCustomer(delId);
        }
    }
});

/**
 * 新增客戶 Modal
 * */
function CreateCustomerModal() {

    $('#CreateCustomerModal').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消");
        },
        onApprove: function () {
            if ($("#CreateCustomerForm").form('is valid')) {
                //$('#CreateCustomerForm').trigger('submit');
            } else {
                toastr["error"]("表單不通過驗證");
            }
            return false;
        }
    }).modal('attach events', '#btnCreateCustomer');
}

//
//表單驗證
//
$.fn.form.settings.rules.ValidateTaxNumber = function (param) {
    var result = ValidateTaxIdNumber(param);
    return result;
}

/**
 * 新增客戶 驗證規則
 * */
var validateCreateCustomerFormFieldsRule = {

    TaxNumber: {
        identifier: 'TaxNumber',
        rules: [
            {
                type: 'ValidateTaxNumber[param]',
                prompt: '廠商統編驗證：格式有誤'
            }
        ]
    },
    Name: {
        identifier: 'Name',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入客戶名稱'
            }
        ]
    },
    ContactPhoneNumber: {
        identifier: 'ContactPhoneNumber',
        rules: [
            {
                type: 'regExp[^[0-9]{6,10}$]',
                prompt: '請輸入聯絡電話'
            }
        ]
    }
}

//套用新增客戶 驗證規則
$("#CreateCustomerForm").form({
    on: 'blur',
    inline: true,
    fields: validateCreateCustomerFormFieldsRule
});

//套用編輯客戶 驗證規則
$("#EditCustomerForm").form({
    on: 'blur',
    inline: true,
    fields: validateCreateCustomerFormFieldsRule
});





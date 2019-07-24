import * as s from './service';
import moment = require('../../Content/bower_components/moment/moment');
let service = new s.IncomeStatementService();

let thisDate = moment(new Date()).format('YYYY/MM/DD');

import { CreateIncomeStatementModel, EditIncomeStatementModel } from "./module";
import { PrintType } from '../Shared/module';

$(document).ready(async function () {

    SetDefaultSerach();

    var SearchCreateTime = sessionStorage.getItem('SearchCreateTime');
    var SearchVehicleId = sessionStorage.getItem('SearchVehicleId');

    service.SearchResult({
        CreateTime: SearchCreateTime == null ? thisDate: SearchCreateTime,
        SearchVehicleId: SearchVehicleId == null ? null : parseInt(SearchVehicleId, 10)
    });

    $("#SearchDate").text(SearchCreateTime == null ? thisDate : SearchCreateTime);

    CreateIncomeStatementModel();

    service.ExportExcelOrPDF(PrintType.landscape);

    /**列印*/
    $("#PrintBtn").click(function () {
        service.Print();
    });

    //新增收支帳前先清空欄位值
    $("#btnCreateIncomeStatement").click(function () {
        $("#Id").val(null);
        $("#CompanyId").val(null);
        $("#VehicleId").val(null);
        $("#SpendItem").val(null);
        $("#money").val(null);
        $("#Frequence").val(null);
    });
});

//新增收支帳Modal 提交
$('#CreateIncomeStatementForm').on("submit", function (event) {
    event.preventDefault();

    if ($('#CreateIncomeStatementForm').form('is valid')) {

        let Id = <string>$("#Id").val();

        if (Id != '') {
            let input: EditIncomeStatementModel = {
                Id: <string>$("#Id").val(),
                CompanyId: <number>$("#CompanyId").val(),
                VehicleId: <number>$("#VehicleId").val(),
                ItemId: <number>$("#SpendItem").val(),
                Amount: <number>$("#money").val(),
                FrequencyId: <number>$("#Frequence").val()
            };
            service.EditIncomeStatement(input);
        } else {
            let input: CreateIncomeStatementModel = {
                VehicleId: <number>$("#VehicleId").val(),
                ItemId: <number>$("#SpendItem").val(),
                Amount: <number>$("#money").val(),
                FrequencyId: <number>$("#Frequence").val()
            };
            service.CreateIncomeStatement(input);
        }
    };
});

//搜尋收支帳
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let createTime: string = moment(<string>$("#CreateTime").val()).format("YYYY/MM/DD");
    let searchVehicleId: number = <number>$("#SearchVehicleId").val();

    sessionStorage.setItem('SearchCreateTime', createTime);
    sessionStorage.setItem('SearchVehicleId', searchVehicleId.toString());

    service.SearchResult({
        CreateTime: createTime,
        SearchVehicleId: searchVehicleId,
    });

    $("#SearchDate").text(createTime == null ? thisDate : createTime);
});

//收支帳列表 按鈕功能
$("#dataTable").on("click", "div button", function () {

    let editId: string = <string>($(this).attr("editId"));
    let delId: string = <string>($(this).attr("delId"));

    if (editId != undefined) {
        service.GetIncomeStatement(editId);
        $('#CreateIncomeStatementModel').modal('show');
    }

    if (delId != undefined) {
        service.DeleteIncomeStatement(delId);
    }
});

/**
 * 新增收支帳 Modal
 * */
function CreateIncomeStatementModel() {

    $('#CreateIncomeStatementModel').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消");
        },
        onApprove: function () {
            if ($("#CreateIncomeStatementForm").form('is valid')) {
                
            } else {
                toastr["error"]("表單不通過驗證");
            }
            return false;
        }
    }).modal('attach events', '#btnCreateIncomeStatement');
}

/**預設日期 */
function SetDefaultSerach() {
    $("#CreateTime").val(thisDate);
}

/**
 * 新增或編輯 收入帳驗證規則
 * */
var validateIncomeStatementFormFieldsRule = {

    VehicleId: {
        identifier: 'VehicleId',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入車號'
            }
        ]
    },

    SpendItem: {
        identifier: 'SpendItem',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入項目'
            }
        ]
    },

    money: {
        identifier: 'money',
        rules: [
            {
                type: 'regExp[^[0-9]*$]',
                prompt: '請輸入金額'
            }
        ]
    },

    Frequence: {
        identifier: 'Frequence',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入頻率'
            }
        ]
    }
}

//套用
$("#CreateIncomeStatementForm").form({
    on: 'blur',
    inline: true,
    fields: validateIncomeStatementFormFieldsRule
});

import * as s from './service';
import moment = require('../../Content/bower_components/moment/moment');

import * as common from '../Shared/service';
import { DriverQuotePriceModel } from './module';
import { PrintType } from '../Shared/module';
let commonService = new common.CommonService();

let service = new s.GrabOrderService();

let thismonth = moment(new Date()).format('YYYY-MM-DD');
let currentYear: number = parseInt(moment(new Date()).format('YYYY'));
let currentMonth = parseInt(moment(new Date()).format('MM'));

let thisMonthDay = new Date(currentYear, currentMonth, 0).getDate();
let thisLastDay = moment(new Date()).format('YYYY-MM') + "-" + thisMonthDay;

$(document).ready(async function () {

    DefaultSearch();
    
    //service.ExportExcelOrPDF(PrintType.landscape);

    /**列印*/
    //$("#PrintBtn").click(function () {
    //    service.Print();
    //});

    //
    //下拉選單變更
    //

    //新增
    $("#DriverId").change(function () {
        var driverId = $("#DriverId").val();
        commonService.GetDriverVehicles(driverId, "VehicleLicenseNumber");
    });

    //修改
    $("#modifyDriverId").change(function () {
        var driverId = $("#modifyDriverId").val();
        commonService.GetDriverVehicles(driverId, "modifyVehicleLicenseNumber");
    });

    ModifyModel();
});

/**搜尋 */
$("#SearchForm").on("submit", function (event) {
    event.preventDefault();

    let beginDateTime: string = moment(<string>$("#BeginDateTime").val()).format("YYYY/MM/DD");
    let endDateTime: string = moment(<string>$("#EndDateTime").val()).format("YYYY/MM/DD");
    let postalCode: number = <number>$("#PostalCode").val();

    sessionStorage.setItem('SearchBeginDateTime', beginDateTime);
    sessionStorage.setItem('SearchEndDateTime', endDateTime);
    sessionStorage.setItem('SearchPostalCode', postalCode.toString());

    service.SearchResult({
        BeginDateTime: beginDateTime,
        EndDateTime: endDateTime,
        PostalCode: postalCode
    });
});

//搶單列表 按鈕功能
$("#dataTable").on("click", "div button", function () {

    //報價
    let quotingMessageId: string = <string>($(this).attr("quotingMessageId"));
    if (quotingMessageId != undefined) {
        $('#createModel').modal({
            closable: false,
            onDeny: function () {
                toastr["warning"]("已經取消報價");
            },
            onApprove: function () {
                if ($("#CreateQuoteForm").form('is valid')) {
                } else {
                    toastr["error"]("表單不通過驗證");
                }
                return false;
            }
        }).modal('show');

        $("#quoteMessageId").val(quotingMessageId);
    }

    //修改報價
    let modifyQuotingMessageId: string = <string>($(this).attr("modifyQuotingMessageId"));
    if (modifyQuotingMessageId != undefined) {

        service.GetCurrentQuote({
            MessageId: modifyQuotingMessageId,
            CreaterId: null
        });

        $('#modifyModel').modal('show');

        $("#modifyQuotingMessageId").val(modifyQuotingMessageId);
    }

    //取消報價
    let deleteQuotingMessageId: string = <string>($(this).attr("deleteQuotingMessageId"));
    if (deleteQuotingMessageId != undefined) {

        if (confirm('確定要取消報價？')) {
            service.CancelQuote({
                MessageId: deleteQuotingMessageId,
                DriverId: null,
                QuotedPrice: null,
                VerhicleId: null
            });
            DefaultSearch();
        } 
    }
});

//報價Modal 提交
$("#CreateQuoteForm").on("submit", function (event) {
    event.preventDefault();

    if ($("#CreateQuoteForm").form('is valid')) {
        let input: DriverQuotePriceModel = {
            MessageId: <string>$("#quoteMessageId").val(),
            DriverId: <string>$("#DriverId").val(),
            QuotedPrice: <number>$("#quotePrice").val(),
            VerhicleId: <number>$("#VehicleLicenseNumber").val()
        };

        service.Quote(input);
        location.reload();
    }
});

/**修改報價Modal */
function ModifyModel() {

    $('#modifyModel').modal({
        closable: false,
        onDeny: function () {
            toastr["warning"]("已經取消報價");
        },
        onApprove: function () {
            if ($("#ModifyQuoteForm").form('is valid')) {
                let input: DriverQuotePriceModel = {
                    MessageId: <string>$("#modifyQuotingMessageId").val(),
                    DriverId: <string>$("#modifyDriverId").val(),
                    QuotedPrice: <number>$("#modifyQuotePrice").val(),
                    VerhicleId: <number>$("#modifyVehicleLicenseNumber").val()
                };
                service.ModifyQuote(input);
                DefaultSearch();
            } else {
                toastr["error"]("表單不通過驗證");
            }
            return false;
        }
    });
}

/**預設日期 */
function SetDefaultSerach() {
    $("#BeginDateTime").val(thismonth);
    $("#EndDateTime").val(thisLastDay);
}

/**預設搜尋 */
function DefaultSearch() {

    var SearchBeginDateTime = sessionStorage.getItem('SearchBeginDateTime');
    var SearchEndDateTime = sessionStorage.getItem('SearchEndDateTime');
    var SearchPostalCode = sessionStorage.getItem('SearchPostalCode');

    //預設搜尋
    service.SearchResult({
        BeginDateTime: SearchBeginDateTime == null ? thismonth : SearchBeginDateTime,
        EndDateTime: SearchEndDateTime == null ? null : SearchEndDateTime,
        PostalCode: SearchPostalCode == null ? 0 : parseInt(SearchPostalCode, 10)
    });

    if (SearchBeginDateTime == "Invalid date" || SearchBeginDateTime == null) {
        SetDefaultSerach();
    }
}

/**
 * 報價 驗證規則
 * */
var validateQuotedPriceFormFieldsRule = {
    quotePrice: {
        identifier: 'quotePrice',
        rules: [
            {
                type: 'integer',
                prompt: '請輸入報價'
            }
        ]
    },
    DriverId: {
        identifier: 'DriverId',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入車主'
            }
        ]
    },
    VehicleLicenseNumber: {
        identifier: 'VehicleLicenseNumber',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入車號'
            }
        ]
    }
}

//套用報價 驗證規則
$("#CreateQuoteForm").form({
    on: 'blur',
    inline: true,
    fields: validateQuotedPriceFormFieldsRule
});
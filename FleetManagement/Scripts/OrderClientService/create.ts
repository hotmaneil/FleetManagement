
import moment = require('../../Content/bower_components/moment/moment');
import * as common from '../Shared/service';
import { RelativePath } from '../Shared/enum';
let commonService = new common.CommonService();

$(document).ready(async function () {

    //取消回上一頁
    $("#backToIndexBtn").click(function () {
        window.location.href = "../OrderClientService/Index";
    });

    //
    //下拉選單變更
    //
    $("#GoodOwnerId").change(function () {
        var goodOwnerId = $("#GoodOwnerId").val();
        GetGoodOwnerPhoneNumber(goodOwnerId);
    });

    $("#DriverId").change(function () {
        var driverId = $("#DriverId").val();
        commonService.GetDriverVehicles(driverId, "VehicleId");
    });

    //
    //輸入後變更
    //
    $("#StartAddress").change(function () {

        let address: string = <string>$("#StartAddress").val();

        GetParseAddressData(address, "postal", "StartPostalCode");
        GetParseAddressData(address, "lat", "StartLat");
        GetParseAddressData(address, "lng", "StartLng");
        GetParseAddressData(address, "city", "StartAreaLevel12");
        GetParseAddressData(address, "region", "StartAreaLevel3");
    });

    $("#TargetAddress").change(function () {

        let address: string = <string>$("#TargetAddress").val();

        GetParseAddressData(address, "postal", "TargetPostalCode");
        GetParseAddressData(address, "lat", "TargetLat");
        GetParseAddressData(address, "lng", "TargetLng");
        GetParseAddressData(address, "city", "TargetAreaLevel12");
        GetParseAddressData(address, "region", "TargetAreaLevel3");
    });
});

//選擇相片列表按鈕
$("#ImageList").on("click", "button", function () {

    let goodOwnerId: string = $(this).attr("GoodOwnerId");
    let messageId: string = $(this).attr("MessageId");
    let bookingGoodsPhotoId: string = $(this).attr("BookingGoodsPhotoId");
    let photoFileName: string = $(this).attr("PhotoFileName");

    if (bookingGoodsPhotoId != undefined) {
        var isConfirm = confirm("確定要刪除？");
        if (isConfirm) {
            commonService.DeletePhoto({
                Id: bookingGoodsPhotoId,
                PhotoFileName: photoFileName,
                GoodOwnerId: goodOwnerId,
                MessageId: messageId
            });
        }
    }
});

/**
 * 取得貨主電話號碼
 * @param GoodsOwenerId
 */
function GetGoodOwnerPhoneNumber(GoodsOwenerId) {
    $.ajax({
        type: 'POST',
        url: RelativePath.ConstName + 'OrderClientService/GetGoodOwnerPhoneNumber',
        data: {
            UserId: GoodsOwenerId
        },
        async: false,
        success: function (data) {
            $("#GoodOwnerContactPhoneNumber").val(data);
        }
    });
}

/**
 * 解析地址並依照參數取得名稱
 * @param address
 * @param param
 * @param id
 */
function GetParseAddressData(address, param, id) {

    let lat: string;
    let lng: string;
    let postal: string;
    let city: string;
    let region: string;

    var geocoderS = new google.maps.Geocoder();

    if (geocoderS) {
        geocoderS.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                var loc = results[0].geometry.location;

                if (param == "lat") {
                    lat = loc.lat().toString();
                    $("#" + id).val(lat);
                }

                if (param == "lng") {
                    lng = loc.lng().toString();
                    $("#" + id).val(lng);
                }

                var addressComponents = results[0].address_components;
                addressComponents.forEach(function (array) {

                    $.map(array.types, function (value, key) {

                        if (param == "postal") {
                            if (value == 'postal_code') {
                                postal = array.long_name;
                                $("#" + id).val(postal);
                            }
                        }

                        if (param == "city") {
                            if (value == 'administrative_area_level_1' || value == 'administrative_area_level_2') {
                                city = array.long_name;
                                $("#" + id).val(city);
                            }
                        }

                        if (param == "region") {
                            if (value == 'administrative_area_level_3') {
                                region = array.long_name;
                                $("#" + id).val(region);

                            }
                        }
                    });
                });

            } else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
                toastr["error"]("系統不允許請求");
            } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                toastr["error"]("Google今天已停止接受此金鑰的查詢,已達每日上限");
            } else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
                toastr["error"]("Google服務器遇到意外錯誤。 暫時再重新整理頁面一次。");
            } else { toastr["error"]('查詢失敗，請確認是否輸入完整地址、或座標是否正確！'); }
        });
    }
}

/**
 * 驗證運費
 * @param param
 */
$.fn.form.settings.rules.ValidateTransactionPrice = function (param) {

    let driverId: string = <string>$("#DriverId").val();
    var price = $("#TransactionPrice").val().toString();

    let transactionPrice: string = price;

    if (driverId != null || driverId != '') {
        if (transactionPrice === '') {
            return false;
        } else {

            var regex = new RegExp('^[0-9]*$')
            if (transactionPrice.match(regex) == null)
                return false;
            else
                return true;
        }
    }
}

var validateCreateOrEditFormFieldsRule = {
    GoodOwnerId: {
        identifier: 'GoodOwnerId',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入貨主姓名'
            }
        ]
    },
    GoodOwnerPhoneNumber: {
        identifier: 'GoodOwnerPhoneNumber',
        rules: [
            {
                type: 'regExp[^[0-9]{6,10}$]',
                prompt: '請輸入聯絡電話'
            }
        ]
    },
    BookingDate: {
        identifier: 'BookingDate',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入任務時間'
            }
        ]
    },
    StartAddress: {
        identifier: 'StartAddress',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入接貨地點'
            }
        ]
    },
    TargetAddress: {
        identifier: 'TargetAddress',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入送達地點'
            }
        ]
    },
    TransactionPrice: {
        identifier: 'TransactionPrice',
        rules: [
            {
                type: 'ValidateTransactionPrice[param]',
                prompt:'已選擇司機，請輸入正確的運費！'
            }
        ]
    }
}

$(".ui.form").form({
    on: 'blur',
    inline: true,
    fields: validateCreateOrEditFormFieldsRule
})
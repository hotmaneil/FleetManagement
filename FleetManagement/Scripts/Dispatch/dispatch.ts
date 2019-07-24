import * as common from '../Shared/service';
let commonService = new common.CommonService();

$(document).ready(async function () {

    //取消回上一頁
    $("#backToIndexBtn").click(function () {
        window.location.href = "../Dispatch/Index";
    });

    //
    //下拉選單變更
    //
    $("#DriverQuotePrice_DriverId").change(function () {
        var driverId = $("#DriverQuotePrice_DriverId").val();
        commonService.GetDriverVehicles(driverId, "DriverQuotePrice_VerhicleId");
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

var validateCreateOrEditFormFieldsRule = {
    GoodOwnerId: {
        identifier: 'Booking_GoodOwnerId',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入貨主姓名'
            }
        ]
    },
    GoodOwnerPhoneNumber: {
        identifier: 'Booking_GoodOwnerPhoneNumber',
        rules: [
            {
                type: 'regExp[^[0-9]{6,10}$]',
                prompt: '請輸入聯絡電話'
            }
        ]
    },
    BookingDate: {
        identifier: 'Booking_BookingDate',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入任務時間'
            }
        ]
    },
    StartAddress: {
        identifier: 'Booking_StartAddress',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入接貨地點'
            }
        ]
    },
    TargetAddress: {
        identifier: 'Booking_TargetAddress',
        rules: [
            {
                type: 'empty',
                prompt: '請輸入送達地點'
            }
        ]
    },
}

$(".ui.form").form({
    on: 'blur',
    inline: true,
    fields: validateCreateOrEditFormFieldsRule
})
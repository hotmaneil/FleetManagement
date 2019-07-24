
var validateCreateOrEditFormFieldsRule = {

    VehicleId: {
        identifier: 'VehicleId',
        rules: [
            {
                type: 'empty',
                prompt: '請選擇車號'
            }
        ]
    },

    StartPostalCode: {
        identifier: 'StartPostalCode',
        rules: [
            {
                type: 'empty',
                prompt: '請選擇接貨地區'
            }
        ]
    },

    TargetPostalCode: {
        identifier: 'TargetPostalCode',
        rules: [
            {
                type: 'empty',
                prompt: '請選擇送貨地區'
            }
        ]
    },

    DriverId: {
        identifier: 'DriverId',
        rules: [
            {
                type: 'empty',
                prompt: '請選擇司機'
            }
        ]
    },
}

$("#CreateOrEditForm").form({
    on: 'blur',
    inline: true,
    fields: validateCreateOrEditFormFieldsRule
});

//週一
$("#EffectPeriodMon").change(function () {
    ClearOneDayByCheckBoxChange();
});

//週二
$("#EffectPeriodTue").change(function () {
    ClearOneDayByCheckBoxChange();
});

//週三
$("#EffectPeriodWed").change(function () {
    ClearOneDayByCheckBoxChange();
});

//週四
$("#EffectPeriodThu").change(function () {
    ClearOneDayByCheckBoxChange();
});

//週五
$("#EffectPeriodFri").change(function () {
    ClearOneDayByCheckBoxChange();
});

//週六
$("#EffectPeriodSat").change(function () {
    ClearOneDayByCheckBoxChange();
});

//週日
$("#EffectPeriodSun").change(function () {
    ClearOneDayByCheckBoxChange();
});

/** 週一到週六 勾選時 清空單次路線日期 */
function ClearOneDayByCheckBoxChange() {

    var effectPeriodMon = $("#EffectPeriodMon").prop("checked");
    var effectPeriodTue = $("#EffectPeriodTue").prop("checked");
    var effectPeriodWed = $("#EffectPeriodWed").prop("checked");
    var effectPeriodThu = $("#EffectPeriodThu").prop("checked");
    var effectPeriodFri = $("#EffectPeriodFri").prop("checked");
    var effectPeriodSat = $("#EffectPeriodSat").prop("checked");
    var effectPeriodSun = $("#EffectPeriodSun").prop("checked");

    if (effectPeriodMon == true ||
        effectPeriodTue == true ||
        effectPeriodWed == true ||
        effectPeriodThu == true ||
        effectPeriodFri == true ||
        effectPeriodSat == true ||
        effectPeriodSun == true) {

        $("#OneDay").val(null);
    }
}

//單次路線日期變更
$("#OneDay").change(function () {

    var oneDay = $("#OneDay").val();
    if (oneDay != null) {
        $("#EffectPeriodMon").prop("checked", false);
        $("#EffectPeriodTue").prop("checked", false);
        $("#EffectPeriodWed").prop("checked", false);
        $("#EffectPeriodThu").prop("checked", false);
        $("#EffectPeriodFri").prop("checked", false);
        $("#EffectPeriodSat").prop("checked", false);
        $("#EffectPeriodSun").prop("checked", false);
    }
});


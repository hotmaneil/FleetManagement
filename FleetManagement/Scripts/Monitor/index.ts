import * as s from './service';
import { promise } from '../Shared/function';
import { LocationConnect } from './mqttfunction_driverLocation';
import { DoConnect } from './mqttfunction';
import * as map from './mapfunction';

let service = new s.MonitorService();

$(document).ready(async function () {
    setInterval(location.reload, 5000);
});

promise.then(success => {

    /*載入車輛列表,營運狀態資料*/
    service.CallCarGroups();

    $(".ui.checkbox").prop('checked', true);

    CheckboxListUpdate();

    /*顯示設定核取方塊清單變更事件*/
    $("#CheckboxList").on("change", ".ui.checkbox", function () {
        CheckboxListUpdate();
    });

    /**車輛手風琴列表點擊事件*/
    $("#GroupList").on("click", ".content .item", function () {
        let cstatus: number = Number($(this).attr("data-Status"));
        if (cstatus == -1) {
            toastr["warning"]("無法標註經緯度, 因為最新的經緯度記錄是空值");
        } else {
            let driveruserId: string = <string>$(this).attr("data-DriverUserId");
            let groupId: number = Number($(this).attr("data-GroupId"));
            map.AnalysisClick(driveruserId, groupId);
        }
    });

}).catch(fail => {
    console.log("載入車輛列表,營運狀態資料(" + fail + ")");
}).then(success => {

    /**訂閱司機位置mqtt*/
    LocationConnect('54.255.240.30',8083, '/mqtt', false, 'TruckMapping/+/DriverLocation');

    /*點選後地點顯示搜尋地址,並標註*/
    $("#SearchLocationForm").on('submit', function (event) {
        event.preventDefault();
        let word: string = <string>$("#AssignSearch").val();
        service.SearchAddressByWord(word);
    });

});

/** 核取方塊清單內的區塊之顯示與隱藏 */
function CheckboxListUpdate() {
    $("#CheckboxList .ui.checkbox").each(function () {
        let val = Number($(this).find("input[type='checkbox']").attr("name"));

        let color = service.JudgeCStatusToReturnColor(val);

        if (val == 99) {
            if ($(this).checkbox('is checked')) {

                $("input:checkbox").prop('checked', true);
                $('.item .' + color).show();

            } else {

                $("input:checkbox").prop('checked', false);
                $('.item .' + color).hide();
            }
        } else {
            if ($(this).checkbox('is checked')) {

                $('.item .' + color).show();

            } else {

                $('.item .' + color).hide();
            }
        }
    });
}

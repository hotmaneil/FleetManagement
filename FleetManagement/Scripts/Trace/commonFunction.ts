import {
    TracePoints,
    SearchResultList,
    OptionalStatusDropDown
} from './module';

import {
    CreateTraceList_Empty
} from '../Shared/templete';

import {
    AjaxOption,
    DoAjax
} from '../Shared/module';

/**清除google的資訊視窗內容 */
export function CleanMapinfoWindow() {
    let info: string = ` 
    <div class="ui equal width  stackable grid left aligned">
        <div class="row">
            <div class="column">
                <div class="ui list">
                    <div class="item">查詢時間:<span></span></div>
                    <div class="item">司機姓名:<span></span></div>
                    <div class="item">司機電話:<span></span></div>
                    <div class="item">車牌號碼:<span></span></div>
                </div>
            </div>
            <div class="column">
                <div class="item">訂單:<span></span></div>
                <div class="item">狀態:<span></span></div>
                <div class="item">位置:<span></span></div>
                <div class="item">車速:<span></span>km/hr</div>
            </div>
            <div class="column">
                <div class="item">GPS:<span></span></div>
                <div class="item">4G:<span></span>dbm</div>
            </div>
        </div>
    </div>`;
    $("#traceinfo").empty().append(info);
}


/**
 * 創建軌跡列表
 * @param data
 */
export function CreateTraceList(Data: TracePoints): string {
    let data = Data.TraceList;
    let items: string = "";
    if (data.length > 0) {

        $.each(data, function (key, list) {
            let color: string = "green";
            let showgreenheader = ["登出", "離線"];
            if (showgreenheader.indexOf(data[key].OperationalStatus) > -1) {
                color = "red";
            }
            let item: string = `
            <div class="item white"
                data-TaskId="${data[key].MessageId}" 
                data-CStatus="${data[key].CStatus}" 
                data-OperationalStatus="${data[key].OperationalStatus}" 
                data-KMperHour="${data[key].KMperHour}" 
                data-Address="${data[key].Address}" 
                data-RecordTime="${data[key].RecordTime}" 
                data-Latitude="${data[key].Latitude}" 
                data-Longitude="${data[key].Longitude}" 
                data-DriverName="${data[key].DriverName}" 
                data-DriverPhone="${data[key].DriverPhone}" 
                data-CarNo="${data[key].CarNo}" 
                data-GPSStrength="${data[key].GPSStrength}" 
                data-SignalStrength="${data[key].SignalStrength}">
                
                <div class="content">
                    <h5 class="ui header ${color}">
                        <span class="ui label green">${data[key].OperationalStatus}</span> 
                        <span>${data[key].KMperHour}km/hr</span>
                        <span class="right floated fontwhite">${data[key].RecordTime}</span>
                    </h5>

                    <div class="description">
                        ${data[key].Address}
                    </div>
                </div>
            </div>`;
            items += item;
        });

        $('#VehicleLicenseNumber').text(data[1].CarNo);
        var path = "Vehicle/" + data[1].CarNo + "/" + data[1].FrontPhoto;
        $('#imgSrc').attr('src', path);

    } else {
        let item: string = CreateTraceList_Empty;
        items += item;
    }
    return items;
}

/**
 * 狀態下拉選單
 */
export function GetShowDropDown() {
    let setting: AjaxOption = {
        url: '/Trace/GetCStatusList',
        type: 'GET',
        dataType: 'json'
    };
    DoAjax(setting,
        function (res) {
            let data: OptionalStatusDropDown[] = res.Data;

            if (data.length > 0) {
                let options: string = "";
                $.each(data, function (key, list) {
                    let option: string = ` <option value="${data[key].CStatus}">${data[key].CStatusName}</option>`;
                    options += option;
                });
                $("#ShowDropdown").empty().append(`<option value="-1">顯示所有</option>${options}`).dropdown('refresh');
            }
        },
        function (res) { $("#ShowDropdown").empty().append(`<option value="-1">顯示所有</option>`).addClass("disabled").dropdown('refresh') },
        null, null);
}



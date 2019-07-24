import { Coordinate, TracePoint } from './module';
import { RelativePath } from '../Shared/enum';
import { CHK_GPS_LocationTW } from '../Shared/function';
import moment = require('../../Content/bower_components/moment/moment');

/* 初始地圖中心點 */
var centerLocation = { lat: 25.0347707, lng: 121.3520598 };

/**初始地圖 */
var tracemap;

/**所有標註資訊 */
var traceMarkers = [];

/**儲存的軌跡資料 */
var traceData = [];

/**第一記時器 */
var timer;

/**第二記時器 */
var timer2;

/**軌跡多線Array */
var tracePolyLine = [];

/**軌跡播放紅圈圈*/
var polyLineCircle;

/**軌跡暫停時的筆數點*/
var stopindex: number = 0;

/**軌跡路徑顏色 */
var pathcolor = "#a6ec7a";

/**
 * 地圖初始化
 * @param HasTraceInfo
 */
export function InitialMap(HasTraceInfo: boolean) {

    tracemap = new google.maps.Map(document.getElementById('traceMap'), {
        zoom: 16,
        center: new google.maps.LatLng(centerLocation["lat"], centerLocation["lng"]),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        gestureHandling: 'greedy',
        zoomControl: true,
        scaleControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            mapTypeIds: ['roadmap', 'terrain']
        }
    });

    if (HasTraceInfo) {
        let traceinfo = document.getElementById('traceinfo');
        tracemap.controls[google.maps.ControlPosition.TOP_CENTER].push(traceinfo);

        let playTraceBtn = document.getElementById('PlayTraceBtn');
        let stopTraceBtn = document.getElementById('StopTraceBtn');
        let ContinueTraceBtn = document.getElementById('ContinueTraceBtn');

        google.maps.event.addDomListener(playTraceBtn, 'click', function () {
            PlayTrace();
            $("#PlayTraceBtn").addClass('disabled');
            $("#StopTraceBtn").removeClass('disabled');
            $("#ContinueTraceBtn").removeClass('disabled');
        });

        google.maps.event.addDomListener(stopTraceBtn, 'click', function () {
            StopTrace();
            $("#PlayTraceBtn").removeClass('disabled');
            $("#StopTraceBtn").addClass('disabled');
            $("#ContinueTraceBtn").removeClass('disabled');
        });

        google.maps.event.addDomListener(ContinueTraceBtn, 'click', function () {
            ContinuePlayTrace();
            $("#PlayTraceBtn").removeClass('disabled');
            $("#StopTraceBtn").removeClass('disabled');
            $("#ContinueTraceBtn").addClass('disabled');
        });
    }
}

/**
 * 繪製軌跡線
 * @param data
 */
export function drawPolyline(data) {

    traceData = data;
    console.log(data);

    if (data.length <= 0) {
        setMarkers({ latitude: 25.067267, longitude: 121.4251752 }, "Start");
    } else {

        /**起點Lat */
        var lat1;

        /**起點Lng */
        var lng1;

        /**標繪圖繫結緯經度 */
        var plotBounds = new google.maps.LatLngBounds();

        const distinct = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        /**所有資料List */
        let dateList = [];

        /**Distinct後的日期List */
        let distinctDataList = [];

        /**計算各日期有多少筆 */
        let countList = [];

        data.forEach(function (value) {
            let recordDate = moment(value.RecordTime).format('YYYY/MM/DD'); 
            dateList.push(recordDate)
        });

        distinctDataList = dateList.filter(distinct);

        countList.push(0);
        distinctDataList.forEach(function (value) {

            var collection = dateList.filter(function (element, index) {
                return (element === value);
            })

            countList.push(collection.length);
        });

        //改寫成有以日期區分的線(第二版)

        /**線號碼計數 */
        var lineNumber = 0;
        distinctDataList.forEach(function (main) {

            var polyLine;
            for (var dataCount = 0; dataCount < data.length; dataCount++) {

                if (CHK_GPS_LocationTW(data[dataCount].Latitude, data[dataCount].Longitude)) {

                    /**該筆的日期 */
                    let recordDate = moment(data[dataCount].RecordTime).format('YYYY/MM/DD');

                    /**顏色碼集合=>最多6種？ */
                    let pathcolors = ['#a6ec7a', '#C63300', '#FF7744', '#0000AA', '#B088FF', '#FF44AA'];

                    if (recordDate == main) {

                        plotBounds.extend(new google.maps.LatLng(data[dataCount].Latitude, data[dataCount].Longitude));

                        var count = 0;
                        count += countList[lineNumber];
                        if (count == dataCount) {
                            setMarkers({ latitude: data[dataCount].Latitude, longitude: data[dataCount].Longitude }, "Start");
                            lat1 = data[dataCount].Latitude;
                            lng1 = data[dataCount].Longitude;
                        }

                        var lineCoords = [new google.maps.LatLng(lat1, lng1), new google.maps.LatLng(data[dataCount].Latitude, data[dataCount].Longitude)];
                        var lineSymbol = {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            strokeColor: "#000000",
                            strokeOpacity: 1,
                            scale: 2
                        };

                        polyLine = new google.maps.Polyline({
                            path: lineCoords,
                            strokeColor: pathcolors[lineNumber],
                            strokeOpacity: 1.0,
                            strokeWeight: 4,
                            icons: [{
                                icon: lineSymbol,
                                offset: '85%'
                            }],
                            map: tracemap
                        });

                        tracePolyLine.push(polyLine);
                        lat1 = data[dataCount].Latitude;
                        lng1 = data[dataCount].Longitude;
                    }
                }
            }
            lineNumber++;
        });

        tracemap.fitBounds(plotBounds);
    }
}

/**
 * 將地圖中心設置為點擊的軌跡
 * @param lat
 * @param lng
 * @param title
 */
export function CenterMapByItem(lat: number, lng: number, title: string) {
    tracemap.setCenter(new google.maps.LatLng(lat, lng));
    setMarkers({
        latitude: lat,
        longitude: lng
    }, title);
}

/**
 * 地點標註
 */
function setMarkers(position: Coordinate, title) {

    //清除先前標註
    removeAllTracePin();

    var image = {
        url: RelativePath.ConstName + 'Content/images/Icon/location_pin_1.ico',
        size: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 27)
    };

    traceMarkers.push(new google.maps.Marker({
        position: { lat: position.latitude, lng: position.longitude },
        map: tracemap,
        icon: image,
        title: title,
        draggable: false,
        animation: google.maps.Animation.DROP//掉落動畫
    }));
}

/**移除所有地圖軌跡pin */
function removeAllTracePin() {
    for (var i = 0; i < traceMarkers.length; i++) {
        traceMarkers[i].setMap(null);
    }
}

/**移除地圖所有標記 */
export function removeAllMapMarker() {
    for (var i = 0; i < traceMarkers.length; i++) {
        traceMarkers[i].setMap(null);
    }
    for (var j = 0; j < tracePolyLine.length; j++) {
        tracePolyLine[j].setMap(null);
    }
}

/**移除播放軌跡紅圈圈*/
export function removeAllPolyCircle() {
    if (typeof polyLineCircle !== "undefined") {
        polyLineCircle.setMap(null);
    }
}

/**
 * 更新google的資訊視窗內容
 * @param data
 */
export function UpdateMapinfoWindow(Data: TracePoint) {
    let data = Data;
    let info: string = ` 
    <div class="ui equal width stackable grid left aligned">
        <div class="row">

            <div class="column">
                <div class="ui list">
                    <div class="item">查詢時間:<span>${data.RecordTime}</span></div>
                    <div class="item">司機姓名:<span>${data.DriverName}</span></div>
                    <div class="item">司機電話:<span>${data.DriverPhone}</span></div>
                    <div class="item">車牌號碼:<span>${data.CarNo}</span></div>
                </div>
            </div>

            <div class="column">
                <div class="item">訂單:<span>${data.MessageId}</span></div>
                <div class="item">狀態:<span>${data.OperationalStatus}</span></div>
                <div class="item">位置:<span>${data.Address}</span></div>
                <div class="item">車速:<span>${data.KMperHour}</span>km/hr</div>
            </div>

            <div class="column">
                <div class="item">GPS:<span>${data.GPSStrength}</span></div>
                <div class="item">4G:<span>${data.SignalStrength}</span>dbm</div>
            </div>
        </div>
    </div>`;
    $("#traceinfo").empty().append(info);
}

/**播放軌跡*/
function PlayTrace() {
    removeAllPolyCircle();
    if (traceData.length > 0) {
        polyLineCircle = new google.maps.Polyline({
            path: [new google.maps.LatLng(traceData[0].Latitude, traceData[0].Longitude), new google.maps.LatLng(traceData[0].Latitude, traceData[0].Longitude)],
            strokeColor: "#193A87",
            strokeOpacity: 1,
            strokeWeight: 0,
            icons: [{
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    strokeColor: '#ff0000'
                },
                offset: '80%'
            }],
            map: tracemap
        });

        let i = 0;

        let startposition = new google.maps.LatLng(traceData[0].Latitude, traceData[0].Longitude);
        if (i <= traceData.length) {
            timer = setInterval(function () {

                TraceListScrollToActive(i);

                let position = new google.maps.LatLng(traceData[i].Latitude, traceData[i].Longitude);
                polyLineCircle.setPath([startposition, position]);
                polyLineCircle.setMap(tracemap);
                tracemap.setCenter(polyLineCircle.getPath().getAt(1));
                stopindex = i;
                i++;
                if (i > traceData.length) {
                    clearInterval(timer);
                    $("#PlayTraceBtn").removeClass('disabled');
                    $("#StopTraceBtn").addClass('disabled');
                    $("#ContinueTraceBtn").addClass('disabled');
                    toastr.success("播放完畢!");
                }
            }, 200);
        }
    } else {
        toastr.warning("目前沒有軌跡資料,無法播放");
        $("#PlayTraceBtn").removeClass('disabled');
        $("#StopTraceBtn").addClass('disabled');
        $("#ContinueTraceBtn").addClass('disabled');
    }
}

/**停止播放軌跡*/
function StopTrace() {
    clearInterval(timer);
    clearInterval(timer2);
    return false;
}

/**繼續播放軌跡*/
function ContinuePlayTrace() {

    if (traceData.length > 0) {
        let startposition = new google.maps.LatLng(traceData[stopindex].Latitude, traceData[stopindex].Longitude);
        if (stopindex <= traceData.length) {
            timer2 = setInterval(function () {
                TraceListScrollToActive(stopindex);//add
                let position = new google.maps.LatLng(traceData[stopindex].Latitude, traceData[stopindex].Longitude);
                polyLineCircle.setPath([startposition, position]);
                polyLineCircle.setMap(tracemap);
                tracemap.setCenter(polyLineCircle.getPath().getAt(1));
                stopindex++;
                if (stopindex > traceData.length) {
                    clearInterval(timer);
                    $("#PlayTraceBtn").removeClass('disabled');
                    $("#StopTraceBtn").addClass('disabled');
                    $("#ContinueTraceBtn").addClass('disabled');
                    toastr.success("播放完畢!");
                }
            }, 200);
        }
    }
}

/**
 * 軌跡列表顯示哪筆正在播放
 */
function TraceListScrollToActive(index: number) {

    $("#traceList .item").removeClass("active");
    $("#traceList .item").eq(index).addClass("active");

    UpdateMapinfoWindow({
        Address: $("#traceList .item").eq(index).attr("data-Address"),
        CarNo: $("#traceList .item").eq(index).attr("data-CarNo"),
        FrontPhoto: $("#traceList .item").eq(index).attr("data-FrontPhoto"),
        DriverName: $("#traceList .item").eq(index).attr("data-DriverName"),
        DriverPhone: $("#traceList .item").eq(index).attr("data-DriverPhone"),
        GPSStrength: Number($("#traceList .item").eq(index).attr("data-GPSStrength")),
        KMperHour: Number($("#traceList .item").eq(index).attr("data-KMperHour")),
        Latitude: Number($("#traceList .item").eq(index).attr("data-Latitude")),
        Longitude: Number($("#traceList .item").eq(index).attr("data-Longitude")),
        OperationalStatus: $("#traceList .item").eq(index).attr("data-OperationalStatus"),
        RecordTime: $("#traceList .item").eq(index).attr("data-RecordTime"),
        SignalStrength: Number($("#traceList .item").eq(index).attr("data-SignalStrength")),
        MessageId: ($("#traceList .item").eq(index).attr("data-TaskId")),
        CStatus: Number($("#traceList .item").eq(index).attr("data-CStatus"))
    });
}




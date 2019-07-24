import { DoAjax, AjaxOption } from '../Shared/module';
import * as moment from '../../Content/bower_components/moment/moment';
import {
    GetMonitorData, mapmarker, position,
    cusmarker, LocationInfo, TraceData,
    MqttDriverLocation, CStatusEnum, OperationType
} from './module';
import { promise, CHK_LastLocationOffLine } from '../Shared/function';
import { GetInitCarImageByFlowStatus } from './cssfunction';
import { CHK_GPS_LocationTW } from '../Shared/function';
import { RelativePath } from '../Shared/enum';

/*=========================================================================================================*/

/**從api傳回的資料*/
var dataset: GetMonitorData;

/**初始化google地圖*/
/**創建的地圖*/
var map;

/**所有標註資訊*/
var markers = [];

/**標註聚落*/
var markersClusterer;

/**初始中心點設置為高公局*/
var centerLocation = { lat: 25.0347707, lng: 121.3520598 };

/**搜尋標註*/
var mapMarkers = []

/**設置搜尋的地點標註樣式*/
var assignmarker;

/**營運狀態樣式*/
type OPstatus = "Red" | "Purple" | "Sienna" | "Blue" | "Gray" | "Green" | "pin";

/**平移速度*/
var speed = 50; // km/h

///**延遲毫秒*/var delay = 100;
//var markerClusterer: any;
/**軌跡折線*/
var flightPath;

/**地圖彈窗*/
var infowindow = new google.maps.InfoWindow();

/**將前端data分析為地圖可用*/
var mapmarkers: mapmarker[] = [];

/**儲存google.map.marker的所有標註格時*/
var cusmarkers: cusmarker[] = [];

/*=========================================================================================================*/
/**
 * 分析api傳來的資料,並儲存至dataset(原始資料)和mapmarkers(標記群組,帶條件與googlemarker)
 * @param data api傳來的資料
 */
export function DealDataFromAPI(data: GetMonitorData) {
    dataset = data;
    if (data.CarGroups.length > 0) {

        $.each(data.CarGroups, function (key, list) {

            let cars = data.CarGroups[key].Cars;
            if (cars.length > 0) {

                $.each(cars, function (index, val) {
                    if (cars[index].cStatus > -1) {
                        //判定'離線'
                        var isOffLine = CHK_LastLocationOffLine(cars[index].UpdateTime, 3);
                        if (isOffLine) {
                            cars[index].cStatus = 10;
                        }

                        let mapmarker: mapmarker = {
                            MessageId: cars[index].MessageId,
                            VehicleId: Number(cars[index].VehicleId),
                            DriverUserId: cars[index].DriverUserId,
                            GroupId: Number(data.CarGroups[key].GroupId),
                            Angle: Number(cars[index].LastCoordinate.GAngle),
                            cstatus: cars[index].cStatus,
                            CarIcon: cars[index].CarIcon,
                            position: {
                                lat: cars[index].LastCoordinate.Latitude,
                                lng: cars[index].LastCoordinate.Longitude
                            },
                            LicenseNumber: cars[index].VehicleNo,
                            DriverName: cars[index].DriverName
                        };
                        mapmarkers.push(mapmarker);
                    }
                });
            }
        });
      CreateMap(mapmarkers);
    } else {
        toastr["warning"]("目前沒有載入的車輛列表資料");
    }
}

/**
 * 創建地圖(初始化)
 * @param locations mapmarkers(標記群組,帶條件與googlemarker)
 */
export function CreateMap(locations: mapmarker[]) {

    map = new google.maps.Map(document.getElementById('googleMap'), {
        zoom: 9,
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

    //CreateLegend();
    addMarker(locations);
}

/**創建圖例-目前不顯示*/
 function CreateLegend() {
     var iconBase = RelativePath.ConstName+'Content/images/Icon/CAR/';
    var icons = {
        notOperation: {
            name: '未營運',
            icon: iconBase + 'C000_Gray.gif'
        },
        operation: {
            name: '營運中',
            icon: iconBase + 'C000_Red.gif'
        },
        empty: {
            name: '空車',
            icon: iconBase + 'C000_Green.gif'
        },
        alert: {
            name: '警示',
            icon: iconBase + 'C000_Purple.gif'
        } 
     };

    let legend = document.getElementById('legend');
    for (var key in icons) {
        let type = icons[key];
        let name = type.name;
        let icon = type.icon;
        let div = document.createElement('div');
        div.innerHTML = '<img src="' + icon + '"> ' + name;
        legend.appendChild(div);
     }
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
}

/**
 * 地點標註掉落動畫(僅用於一時載入)
 * @param markers mapmarkers(標記群組,帶條件與googlemarker)
 */
function addMarker(markers: mapmarker[]) {
    var bounds = new google.maps.LatLngBounds();
    $.each(markers, function (key, list) {
        if (markers[key].CarIcon.indexOf("CC") > -1) {
            markers[key].CarIcon=markers[key].CarIcon.toString().replace("CC","C");
        }

        if (markers[key].position.lat != 0 && markers[key].position.lng != 0) {
            let imgurl = GetInitCarImageByFlowStatus(markers[key].cstatus);
            let cusmarker: cusmarker = {
                MarkerId: "#marker" + key,
                MessageId: mapmarkers[key].MessageId,
                cstatus: markers[key].cstatus,
                DriverUserId: markers[key].DriverUserId,
                VehicleId: markers[key].VehicleId,
                GroupId: markers[key].GroupId,
                Angle: markers[key].Angle,
                googlemarker: new google.maps.Marker({
                    position: new google.maps.LatLng(markers[key].position.lat, markers[key].position.lng),
                    map: map,
                    //title: "經度:" + markers[key].position.lat + ",緯度:" + markers[key].position.lng,
                    title: markers[key].LicenseNumber + " - " + markers[key].DriverName,
                    icon: {
                        url: RelativePath.ConstName + 'Content/images/Icon/CAR/' + markers[key].CarIcon + "#marker" + key,
                        //url: imgurl + "#marker" + key,
                        size: new google.maps.Size(64, 64),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(25, 28)
                    },
                    draggable: false,
                    // animation: google.maps.Animation.DROP
                })
            };

            google.maps.event.addListener(cusmarker.googlemarker, 'click', function (MARKER, KEY) {
                CreatePopUp(cusmarker.googlemarker, cusmarker.DriverUserId, infowindow);
            });

            cusmarkers.push(cusmarker);
            bounds.extend(cusmarker.googlemarker.getPosition());
        } else {
           console.log("經緯度有0,導致markers[key]無法加入=" + JSON.stringify(markers[key]));
        }
     });
    map.fitBounds(bounds);
}

/**
 * 前端點擊下拉列表時,判定是否已存在標註以進行不同事件
 * @param DriverUserId 司機編號
 * @param VehicleId 車輛編號
 * @param GroupId 公司群組編號
 */
export function AnalysisClick(DriverUserId: string, GroupId: number) {
    $.each(cusmarkers, function (key, list) {
        if (cusmarkers[key].DriverUserId == DriverUserId && cusmarkers[key].GroupId == GroupId) {
           let googlemarker = cusmarkers[key].googlemarker;
            CreatePopUp(cusmarkers[key].googlemarker, cusmarkers[key].DriverUserId, infowindow);       
        }
    });
}

/**
 * 讀取popup最新內容
 * @param DriverUserId
 */
function CreatePopUp(marker: google.maps.Marker, DriverUserId: string, infowindow: google.maps.InfoWindow) {
    let setting: AjaxOption = { url: '/Monitor/GetSignleInfo?driverid=' + DriverUserId, type: 'GET', dataType: 'json' };
    DoAjax(setting,
        function (res) {
            let item: LocationInfo = res.Data;
            let MessageId = item.MessageId;
            let starttime = moment().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format("YYYY/MM/DD HH:mm:ss");
            let endtime = moment().format("YYYY/MM/DD HH:mm:ss");
            let url = `?BeginDateTime=${starttime}&EndDateTime=${endtime}&DriverId=${DriverUserId}&VehicleId`;

            let photourl: string = (item.Driver.PhotoUrl == "" || item.Driver.PhotoUrl == null)
                ? "../../Content/images/Icon/userMan.jpg" : `PhotoUser/${item.Driver.DriverId}/${item.Driver.PhotoUrl}`;

            item.ProcessStatus = (item.ProcessStatus == null || item.ProcessStatus == "") ? "" : item.ProcessStatus;
            let LatLngDIV = (item.CurrentLatitude == null && item.CurrentLongitude == null)
                ? "" : `經緯度<div class="ui label">${item.CurrentLatitude},${item.CurrentLongitude}</div>`;
            item.CurrentLatitude = (item.CurrentLatitude == null) ? 0 : item.CurrentLatitude;
            item.CurrentLongitude = (item.CurrentLongitude == null) ? 0 : item.CurrentLongitude;

            let popup = `
            <div class="ui pointing below basic label" data-Item="${MessageId}">
                <div class="ui unstackable items">
                    <div class="unstackable  item" style="border:0;">
                        <div class="image">
                            <img src="${photourl}">
                        </div>
                        <div class="content">
                            <a class="header">
                                ${item.Driver.DriverName}(${item.Driver.PhoneNumber})
                                <br />
                                車牌號碼：${item.Car.LicenseNumber}
                            </a>
                            <div class="meta">
                                <div class="ui red label" style="min-width:80px;">
                                    訂單編號：${MessageId == null ? '' : MessageId} 
                                    <br />
                                    狀態：${item.ProcessStatusName == null ? '' : item.ProcessStatusName}
                                </div>
                            </div>
                            <div class="description">
                                <h5 class="ui header">
                                    貨主：${item.GoodsOwnerName == null ? '' : item.GoodsOwnerName}<br />
                                    收貨地址：${item.StartAddress == null ? '' : item.StartAddress}<br />
                                    送達地址：${item.TargetAddress == null ? '' : item.TargetAddress}
                                </h5>
                                <p>${LatLngDIV}</p>
                            </div>
                            <div class="extra">
                                    <a class="ui basic button green" href='${RelativePath.ConstName}/Monitor/SingleTraceView${url}' target="_blank">檢視軌跡</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            map.setCenter(marker.getPosition());
            //map.setZoom(16);
            infowindow.setContent(popup);
            infowindow.open(map, marker);
          
        },
        function (res) { toastr["error"]("讀取任務內容發生錯誤");  },
        null, null);
}

/**
 * 搜尋地址/地點
 * @param word 搜尋的關鍵字
 */
export function Search(word: string) {

    //Clear Marker Icon
    removeMarker(assignmarker);

    let searchTxt: string = word;
    if (searchTxt == '') {
        alert('請輸入查詢地址或座標.');
    }
    else {
        var geocoderS = new google.maps.Geocoder();
        if (geocoderS) {
            geocoderS.geocode({ 'address': searchTxt }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    var loc = results[0].geometry.location;
                    var locA = results[0].formatted_address;
                 
                    assignmarker = new google.maps.Marker({
                        position: loc,
                        map: map,
                        draggable: false,
                        animation: google.maps.Animation.DROP,
                        title: '你查詢的地點',
                        label:'S',
                    });

                    assignmarker.setTitle(locA);
                    map.setCenter(loc);
                    map.setZoom(16);

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
}


/**
 * 設置標註
 * @param MAP 已創建的地圖
 * @param cstatus 營運狀態大類
 */
function setMapOnAll(MAP, cstatus: number) {
    for (let cus of cusmarkers) {
        if (cus.cstatus == cstatus) {
            if (MAP == null) {
                cus.googlemarker.setMap(null);
            } else {
                cus.googlemarker.setMap(map);
            }
        }
    }
}

/**
 * 刪除單一座標
 * @param mk 地圖標註
 */
export function removeMarker(mk) {
    if (undefined === mk) { return mk; }
    for (var i = 0; i < mk.length; i++) {
        if (mk[i] === mk) {
            mk[i].setMap(null);
            mk.splice(i, 1);
            break;
        }
    }
    return mk;
}

/**
 * 全屏事件
 */
export function FullScreen() {
    var element = map.getDiv();  
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }

    if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }

    if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
}

/*
==================================================
20190118_modified:
1.加入函式
===================================================


*/
/**
 * 自定義標記旋轉
 * @param cstatus 營運狀態
 * @param markerid 標記Id
 * @param degree 角度
 */
function rotateMarker(cstatus, markerid, degree) {
    let imgurl = GetInitCarImageByFlowStatus(cstatus) + markerid;
    $('img[src="' + imgurl + '"]').css({
        'transform': 'rotate(' + degree + 'deg)'
    });
}

/**
 * 藉由司機Id和車輛Id取得以更新該cusmarker的googlemarker 經緯度
 * @param driverId 司機Id
 * @param vehicleId 車輛Id
 */
export function GetCusMarkerByDriverVehicle(data: MqttDriverLocation) {

    for (var cus of cusmarkers) {

        //新位置不在台灣範圍,略過更新
        if (!CHK_GPS_LocationTW(data.GLat, data.GLng)) {
            continue;
        }

        //cus.MessageId == data.MessageId && 
        if (cus.VehicleId == data.VehicleId) {
            let newcus = cus;
            promise.then(success => {
                newcus.MessageId = data.MessageId;
                newcus.DriverUserId = data.DriverId;
                newcus.VehicleId = data.VehicleId;
                newcus.cstatus = data.CStatus;
                newcus.Angle = data.GAngle;
                newcus.googlemarker.setPosition(new google.maps.LatLng(data.GLat, data.GLng));
                animateMarker(0, cus, newcus);
            }).then(success => {
                cus = newcus;
               // infowindow.setContent();
             });
        }
    }
}

/**
 *  marker 平滑移動到指定位置
 * @param i 開始的指引
 * @param originmarker 原來標記
 * @param newmarker 更新標記
 */
export function animateMarker(i, originmarker: cusmarker, newmarker: cusmarker) {

    /**公里/時*/
    let KM_H = 80;

    /**延遲毫秒*/
    let delay = 100;

    let oldPosition = originmarker.googlemarker.getPosition();
    let newPosition = newmarker.googlemarker.getPosition();
    let distance = google.maps.geometry.spherical.computeDistanceBetween(oldPosition, newPosition); /*公尺*/
    let step = (KM_H * 1000 * delay) / 3600000; /*公尺*/
    let km_h = KM_H || 50;
    let oldlat = Number(originmarker.googlemarker.getPosition().lat);
    let oldlng = Number(originmarker.googlemarker.getPosition().lng);
    let newlat = Number(newmarker.googlemarker.getPosition().lat);
    let newlng = Number(newmarker.googlemarker.getPosition().lng);
    let numStep = distance / step;
    let deltaLat = (newlat - oldlat) / numStep;
    let deltaLng = (newlng - oldlng) / numStep;
    let newAngle = Number(newmarker.Angle);
    oldlat += deltaLat;
    oldlng += deltaLng;
    i += step;
    if (i < distance) {
        originmarker.googlemarker.setPosition(new google.maps.LatLng(oldlat, oldlng));
        animateMarker(i, originmarker, newmarker);
    } else {
        originmarker.googlemarker.setPosition(new google.maps.LatLng(newlat, newlng));
        if (i == distance) {
            i = 0;
        }
    }
    // console.log("標記資訊");
    //console.log(newmarker.googlemarker.getIcon());
    rotateMarker(newmarker.cstatus, newmarker.MarkerId, newmarker.Angle);
}
import { uuid } from '../Shared/service';

/*===============================================
宣告MQTT告警服務物件
 ================================================*/

/**宣告客戶(必用全域變數)*/
var client;

/**域名*/
const host: string = '54.255.240.30';

/**連接阜*/
const port: number = Number(8083);

/**路徑*/
const path: '/mqtt' | '/ws' = '/mqtt';

/**ssl證書開啟*/
const useTLS: boolean = false;

/**重新連線超時時間(秒)*/
const reconnectTimeout: number = 2000;

/**超時時間(秒)如果連接在此秒數內未成功，則視為失敗。預設值為30秒。*/
const timeout = 30;

/**連線帳號*/
const username: string = "truckmapping";

/**連線密碼*/
const password: string = "24638389";

/**訂閱主題*/
var topic = "TowTruck/SystemAlert";

/**是否中斷連結*/
var isDisConnect: boolean = true;

/**過濾顯示訊息用計算*/
var countConnect: number = 0;

/*======================================================================*/

/*==============================================================
   MQTT連線
=================================================================*/

/**
    * 開始進行連線
    * @param mqttHost 連線url
    * @param mqttport 連線port(MQTT/TCP=1883,MQTT/SSL=8883,MQTT/WebSocket=8083,MQTT/WebSocket/SSL=8084)
    * @param mqttuseSSL 是否開啟https SSL證書(當走wss時才需要)
    * @param mqttClientID 連線唯一值
    * @param subscribeName 訂閱主題
    */
export function DoConnect(mqttHost: string, mqttport: number, mqttpath: '/mqtt' | '/ws' , mqttuseSSL: boolean, subscribeName: string) {
    if (typeof mqttHost == 'undefined') { mqttHost = host; }
    if (typeof mqttport == 'undefined') { mqttport = port; }
    if (typeof mqttuseSSL == 'undefined') { mqttuseSSL = useTLS; }
    if (typeof subscribeName == 'undefined') { subscribeName = topic; }
    if (typeof mqttpath == 'undefined') { mqttpath = path; }
    client = new Paho.MQTT.Client(mqttHost, Number(mqttport), mqttpath, uuid());

    // 連接客庫端
    var options = {
        timeout: timeout,
        useSSL: mqttuseSSL,
        cleanSession: true,
        userName: username,
        password: password,
        onSuccess: onConnect,
        onFailure: function (message) {
            console.log("Connection failed: " + message.errorMessage + "Retrying");
            setTimeout(DoConnect, reconnectTimeout);
        }
    };
    if (username != null || typeof username == 'undefined') { options.userName = 'towtruck'; }
    if (password != null || typeof password == 'undefined') { options.password = 'tow24638389'; }
    // 設置callback
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect(options);
}

/**成功連接到服務器時調用*/
function onConnect() {

    isDisConnect = false;
    if (!isDisConnect) {
        // 建立連接後，進行訂閱並發送消息。
        console.log("mqtt已連結成功,開始訂閱");
        client.subscribe(topic, { qos: 2 });
      
        $("#AlertIcon").html(`<i class="icon green bell small"></i>`);
    } else {
        //取消訂閱
        client.unsubscribe(topic, { qos: 0 });
        doDisconnect();
        $("#AlertIcon").html(`<i class="icon red bell slash small"></i>`);
    }
}

/**
 * 當客戶端連接丟失時調用
 * @param responseObject
 */
function onConnectionLost(responseObject) {
    /*
      ERROR CODE
     0=成功
     1=MQTT客戶端失敗的通用
     2=客戶端已斷開連接
     3=允許同時發送的最大消息數(in-flight has been reached.)
     4=檢測到無效的UTF-8字符串。
     5=無效時提供了NULL參數。
     6=主題已被截斷（主題字符串包括 *嵌入的NULL字符）。字符串函數不會訪問完整主題。*使用主題長度值訪問完整主題。
     7=結構參數沒有正確的引人注目*和版本號。
     8=返回碼：超出可接受範圍的QoS值（0,1,2）
     9=使用非SSL版本的庫嘗試SSL連接
    10=無法識別的MQTT版本
    11=serverURI中的協議前綴應為tcp：//或ssl：//
    14=選項不適用於請求的MQTT版本
    15=要連接的默認MQTT版本。使用3.1.1然後回到3.1
    */
    if (isDisConnect) {

        //如果已斷關閉,就取消訂閱
        client.unsubscribe(topic, { qos: 0 });
        doDisconnect();
        $("#AlertIcon").html(`<i class="icon red bell slash small"></i>`);
    } else {
        //如果沒關閉,但發生錯誤
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost errorCode:"+responseObject.errorCode);
            console.log("onConnectionLost:" + JSON.stringify(responseObject));
            $("#AlertIcon").html(`<i class="icon orange exchange small"></i>`);
            setTimeout(DoConnect, reconnectTimeout);
        }
    }


    //=======================
    //let showstring: string = "告警服務啟動";
    //if (!isDisConnect) {
    //    if (countConnect != 0) {
    //        showstring = "告警服務遺失消息";
    //    }
    //    setTimeout(DoConnect, reconnectTimeout);
    //    if (responseObject.errorCode !== 0) {
    //        console.log(responseObject.errorCode);
    //        console.log("onConnectionLost:" + responseObject.errorMessage);
            //let templete: string = ` <div class="item alert">
            //            <div class="content">
            //             ${showstring}
            //            </div>
            //        </div>`;
            //$("#AlertMessage").prepend(templete);
        //    countConnect += 1;
        //    $("#AlertIcon").html(`<i class="icon orange exchange small"></i>`);
        //}
    //} else {
    //    DoConnect;
        //let templete2: string = `<div class="item alert">
        //                <div class="content">
        //                告警服務已關閉
        //                </div>
        //            </div>`;
        //$("#AlertMessage").prepend(templete2);
        //$("#AlertIcon").html(`<i class="icon red bell slash small"></i>`);
    //}

}

/**當一條消息到達此Paho.MQTT.client時調用*/
function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    console.log(message.destinationName + " onMessageArrived:" + message.payloadString);
    let arrivedmessage = JSON.parse(message.payloadString);
    console.log(typeof arrivedmessage);
    let templete: string = "";
    if (typeof arrivedmessage == 'object') {
        console.log(arrivedmessage);
        templete = ` <div class="item alert" data-DriverId="${arrivedmessage["DriverId"]}" data-TaskId="${arrivedmessage["TaskId"]} data-VehicleId="${arrivedmessage["VehicleId"]}">
                    <div class="content">
                        <h4 class="ui dividing header red">${arrivedmessage["TaskNo"]}${arrivedmessage["TaskContent"]}</h4>
                           <div class="meta">
                          ${arrivedmessage["DriverName"]},${arrivedmessage["DriverPhoneNumber"]},${arrivedmessage["VehicleLicenseNumber"]}
                           <div class="extra">
                               ${arrivedmessage["Passerby"]}, ${arrivedmessage["PasserbyPhoneNumber"]} 
                          </div> 
                           <div class="extra">
                               ${arrivedmessage["AlertNotes"]} 
                          </div> 
                       </div>
                  </div>`;
        $("#AlertMessage").prepend(templete);
        $("#AlertIcon").html(`<i class="icon green bell tiny"></i>`);
    }
}

/**中斷連線*/
export function doDisconnect() {
    client.disconnect();
    console.log("已中斷告警服務連線");
    //let templete: string = `<div class="item alert"><div class="content">已關閉告警服務</div></div>`;
    //$("#AlertMessage").prepend(templete);
    $("#AlertIcon").html(`<i class="icon red bell slash small"></i>`);
    isDisConnect = true;
}





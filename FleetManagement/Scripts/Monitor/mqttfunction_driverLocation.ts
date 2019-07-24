import { uuid } from '../Shared/service';
import { GetCusMarkerByDriverVehicle } from './mapfunction';

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

/**超時時間(秒)如果連接在此秒數內未成功，則視為失敗。默認值為30秒。*/
const timeout = 30;

/**連線帳號*/
const username: string = "truckmapping";

/**連線密碼*/
const password: string = "24638389";

/**訂閱主題*/
var topic = "TruckMapping/+/DriverLocation";

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
export function LocationConnect(mqttHost: string, mqttport: number, mqttpath: '/mqtt' | '/ws' , mqttuseSSL: boolean, subscribeName: string) {
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
            setTimeout(LocationConnect, reconnectTimeout);
        }
    };

    if (username != null || typeof username == 'undefined') { options.userName = 'truckmapping'; }
    if (password != null || typeof password == 'undefined') { options.password = '24638389'; }

    // 設置callback
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect(options);
}

/**成功連接到服務器時調用*/
function onConnect() {
    // 建立連接後，進行訂閱並發送消息。
    console.log("mqtt已連結成功,開始訂閱");
    client.subscribe(topic, { qos: 2 });
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
    if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorCode);
        console.log("onConnectionLost:" + responseObject.errorMessage);
        setTimeout(LocationConnect, reconnectTimeout);
    }  
}

/**
 * 當一條消息到達此Paho.MQTT.client時調用
 * @param message
 */
function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    //console.log(topic + " onMessageArrived:" + payload);

    let arrivedmessage = JSON.parse(payload);
    //console.log(arrivedmessage);

    //暫時註解 不連接MQTT
    GetCusMarkerByDriverVehicle(arrivedmessage);
}

/**中斷連線 */
export function doDisconnect() {
    client.disconnect();
    console.log("已中斷告警服務連線");
}





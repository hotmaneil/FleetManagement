import {
    IMQTTService, ICommonService, FindFunctionModel, PhotoModel
} from './module';

import {
    HttpStatusCode,
    CreateMessage,
    InfoType,
    DoAjax,
    AjaxOption
} from '../Shared/module';
import { RelativePath } from './enum';

/**宣告String,以擴充屬性Empty*/
declare const String: StringExtensions;
interface StringExtensions extends StringConstructor {
    empty: '';
}

/*===============================================
宣告MQTT告警服務物件
 ================================================*/
var client;
const reconnectTimeout: number = 2000;
const username: string = "towtruck";
const password: string = "tow24638389";
var topic = "/test";

/**
 * MQTT服務
 */
export class MQTTService implements IMQTTService {

    /**
     * 開始進行連線
     * @param mqttHost 連線url
     * @param mqttport 連線port(MQTT/TCP=1883,MQTT/SSL=8883,MQTT/WebSocket=8083,MQTT/WebSocket/SSL=8084)
     * @param mqttuseSSL 是否開啟https SSL證書(當走https時才需要)
     * @param mqttClientID 連線唯一值
     * @param subscribeName 訂閱主題
     */
    DoConnect(mqttHost: string, mqttport: number, mqttuseSSL: boolean, subscribeName: string) {

        if (mqttHost == "") {
            mqttHost = location.hostname;
        }

        client = new Paho.MQTT.Client(mqttHost, Number(mqttport), uuid());

        // 設置callback
        client.onConnectionLost = this.onConnectionLost;
        client.onMessageArrived = this.onMessageArrived;

        // 連接客庫端
        client.connect({
            onSuccess: this.onConnect(subscribeName),
            useSSL: mqttuseSSL,
            username: 'towtruck',
            password: 'tow24638389'
        });
    }

    /**當客戶端連接時*/
    onConnect(subscribeName: string) {
        // 建立連接後，進行訂閱並發送消息。
        console.log("mqtt已連結成功,開始訂閱" + subscribeName);
        client.subscribe(subscribeName);
        let message = new Paho.MQTT.Message("Hello");
        message.destinationName = subscribeName;
        client.send(message);
    }

    /**當客戶端失去連接時調用*/
    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    /**消息到達時調用*/
    onMessageArrived(message) {
        console.log("onMessageArrived:" + message.payloadString);
    }

    /**中斷連線*/
    doDisconnect() {
        client.disconnect();
        console.log("已中斷mqtt連線");
    }
}

/**
 * 產生Guid //todo 待確認Guid
 */
export function uuid() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

/*===============================================
共用函式
 ================================================*/

export class CommonService implements ICommonService {

    /**
   * 尋找角色功能清單
   * @param input
   */
    FindFunctionList(input: FindFunctionModel) {
        let _this = this;
        let setting: AjaxOption = {
            url: '/UserRoles/FunctionsForRole?roleid=' + input.RoleId,
            type: 'GET',
            dataType: 'json'
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("FindFunctionList", res);
            },
            function (res) { ERROR("FindFunctionList", res); },
            null);
    }

    /**
     * 依照車主取得車牌號碼下拉選單
     * @param DriverId
     * @param IdName
     */
    GetDriverVehicles(DriverId, IdName) {
        $.ajax({
            type: 'POST',
            url: RelativePath.ConstName+'Base/GetOwnVehicleList',
            data: {
                UserId: DriverId
            },
            async: false,
            success: function (data) {

                $("#" + IdName).empty();
                $("#" + IdName).html();

                var obj = "<option value=\"0\">請選擇</option>";
                $.each(data, function (i, item) {
                    if (item.Selected == true) {
                        obj += "<option selected=\"" + item.Selected + "\" value=\"" + item.Value + "\">" + item.Text + "</option>";
                    } else {
                        obj += "<option value=\"" + item.Value + "\">" + item.Text + "</option>";
                    }
                });
                $("#" + IdName).html(obj);
            }
        });
    }

   /**
    * 刪除照片
    * @param input
    */
    DeletePhoto(input: PhotoModel) {
        let setting: AjaxOption = {
            url: '/Base/DeletePhoto',
            type: 'POST',
            dataType: 'json',
            data: {
                Id: input.Id,
                PhotoFileName: input.PhotoFileName,
                GoodOwnerId: input.GoodOwnerId,
                MessageId: input.MessageId
            }
        };
        DoAjax(setting,
            function (res) {
                SUCCESS("DeletePhoto", res);
                setTimeout(function () {
                    location.reload();
                }, 1000);
            },
            function (res) { ERROR("DeletePhoto", res); },
            function () { BeforeSend("DeletePhoto", '#ImageList'); },
            null);
    }
}

/**列舉流程步驟*/
type flowStep = "FindFunctionList" | "DeletePhoto";

/**
 * 回傳成功結果
 * @param Step
 * @param res
 */
function SUCCESS(Step: flowStep, res: any) {

    let _this = this;

    switch (res.HttpStatusCode) {

        case HttpStatusCode.OK:
            switch (Step) {
                case "FindFunctionList":
                    let result = RoleFunctionList(res.Data);
                    $("#FunctionList").empty().append(result);
                    break;

                case "DeletePhoto":
                    toastr['success']('刪除成功!');
                    break;
            }
            break;
    }
}

/**
 * 回傳失敗結果
 * @param Step
 * @param res
 */
function ERROR(Step: flowStep, res: any) {
    let message: string = String.empty;
    switch (res.HttpStatusCode) {
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            switch (Step) {
                case "DeletePhoto":
                    toastr['error']('刪除失敗!');
                    break;
            }
            break;

        case HttpStatusCode.UNAUTHORIZED:
            switch (Step) {
               
            }
    }
}

/**
 * 送出前
 * @param Step
 * @param selector
 */
function BeforeSend(Step: flowStep, selector: string) {
    let skeleton: string = String.empty;
    switch (Step) {

    }
    $(selector).empty().append(skeleton);
}

/**
 * 角色功能清單
 * @param Data
 */
function RoleFunctionList(Data: FindFunctionModel[]) {
    let dataLength = Data.length;
    let items = String.empty;
    if (dataLength > 0) {
        $.each(Data, function (key, list) {
            let item =
                `<tr>
                    <td>${Data[key]["FunctionName"]}</td>
                    <td>${Data[key]["UsableName"]}</td>
                <tr>`
            items += item;
        });
    } else {
        let emptytr = CreateMessage(InfoType.success, "", "該角色尚未設定功能權限", "");
        items += `<div class="item">${emptytr}</div>`
    }
    return items;
}
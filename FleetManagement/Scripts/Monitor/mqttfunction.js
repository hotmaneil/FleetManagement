define(["require", "exports", "../Shared/service"], function (require, exports, service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var client;
    var host = '54.255.240.30';
    var port = Number(8083);
    var path = '/mqtt';
    var useTLS = false;
    var reconnectTimeout = 2000;
    var timeout = 30;
    var username = "truckmapping";
    var password = "24638389";
    var topic = "TowTruck/SystemAlert";
    var isDisConnect = true;
    var countConnect = 0;
    function DoConnect(mqttHost, mqttport, mqttpath, mqttuseSSL, subscribeName) {
        if (typeof mqttHost == 'undefined') {
            mqttHost = host;
        }
        if (typeof mqttport == 'undefined') {
            mqttport = port;
        }
        if (typeof mqttuseSSL == 'undefined') {
            mqttuseSSL = useTLS;
        }
        if (typeof subscribeName == 'undefined') {
            subscribeName = topic;
        }
        if (typeof mqttpath == 'undefined') {
            mqttpath = path;
        }
        client = new Paho.MQTT.Client(mqttHost, Number(mqttport), mqttpath, service_1.uuid());
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
        if (username != null || typeof username == 'undefined') {
            options.userName = 'towtruck';
        }
        if (password != null || typeof password == 'undefined') {
            options.password = 'tow24638389';
        }
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        client.connect(options);
    }
    exports.DoConnect = DoConnect;
    function onConnect() {
        isDisConnect = false;
        if (!isDisConnect) {
            console.log("mqtt已連結成功,開始訂閱");
            client.subscribe(topic, { qos: 2 });
            $("#AlertIcon").html("<i class=\"icon green bell small\"></i>");
        }
        else {
            client.unsubscribe(topic, { qos: 0 });
            doDisconnect();
            $("#AlertIcon").html("<i class=\"icon red bell slash small\"></i>");
        }
    }
    function onConnectionLost(responseObject) {
        if (isDisConnect) {
            client.unsubscribe(topic, { qos: 0 });
            doDisconnect();
            $("#AlertIcon").html("<i class=\"icon red bell slash small\"></i>");
        }
        else {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost errorCode:" + responseObject.errorCode);
                console.log("onConnectionLost:" + JSON.stringify(responseObject));
                $("#AlertIcon").html("<i class=\"icon orange exchange small\"></i>");
                setTimeout(DoConnect, reconnectTimeout);
            }
        }
    }
    function onMessageArrived(message) {
        var topic = message.destinationName;
        var payload = message.payloadString;
        console.log(message.destinationName + " onMessageArrived:" + message.payloadString);
        var arrivedmessage = JSON.parse(message.payloadString);
        console.log(typeof arrivedmessage);
        var templete = "";
        if (typeof arrivedmessage == 'object') {
            console.log(arrivedmessage);
            templete = " <div class=\"item alert\" data-DriverId=\"" + arrivedmessage["DriverId"] + "\" data-TaskId=\"" + arrivedmessage["TaskId"] + " data-VehicleId=\"" + arrivedmessage["VehicleId"] + "\">\n                    <div class=\"content\">\n                        <h4 class=\"ui dividing header red\">" + arrivedmessage["TaskNo"] + arrivedmessage["TaskContent"] + "</h4>\n                           <div class=\"meta\">\n                          " + arrivedmessage["DriverName"] + "," + arrivedmessage["DriverPhoneNumber"] + "," + arrivedmessage["VehicleLicenseNumber"] + "\n                           <div class=\"extra\">\n                               " + arrivedmessage["Passerby"] + ", " + arrivedmessage["PasserbyPhoneNumber"] + " \n                          </div> \n                           <div class=\"extra\">\n                               " + arrivedmessage["AlertNotes"] + " \n                          </div> \n                       </div>\n                  </div>";
            $("#AlertMessage").prepend(templete);
            $("#AlertIcon").html("<i class=\"icon green bell tiny\"></i>");
        }
    }
    function doDisconnect() {
        client.disconnect();
        console.log("已中斷告警服務連線");
        $("#AlertIcon").html("<i class=\"icon red bell slash small\"></i>");
        isDisConnect = true;
    }
    exports.doDisconnect = doDisconnect;
});
//# sourceMappingURL=mqttfunction.js.map
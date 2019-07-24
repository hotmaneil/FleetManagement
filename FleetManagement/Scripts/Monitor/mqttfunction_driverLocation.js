define(["require", "exports", "../Shared/service", "./mapfunction"], function (require, exports, service_1, mapfunction_1) {
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
    var topic = "TruckMapping/+/DriverLocation";
    function LocationConnect(mqttHost, mqttport, mqttpath, mqttuseSSL, subscribeName) {
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
                setTimeout(LocationConnect, reconnectTimeout);
            }
        };
        if (username != null || typeof username == 'undefined') {
            options.userName = 'truckmapping';
        }
        if (password != null || typeof password == 'undefined') {
            options.password = '24638389';
        }
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        client.connect(options);
    }
    exports.LocationConnect = LocationConnect;
    function onConnect() {
        console.log("mqtt已連結成功,開始訂閱");
        client.subscribe(topic, { qos: 2 });
    }
    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log(responseObject.errorCode);
            console.log("onConnectionLost:" + responseObject.errorMessage);
            setTimeout(LocationConnect, reconnectTimeout);
        }
    }
    function onMessageArrived(message) {
        var topic = message.destinationName;
        var payload = message.payloadString;
        var arrivedmessage = JSON.parse(payload);
        mapfunction_1.GetCusMarkerByDriverVehicle(arrivedmessage);
    }
    function doDisconnect() {
        client.disconnect();
        console.log("已中斷告警服務連線");
    }
    exports.doDisconnect = doDisconnect;
});
//# sourceMappingURL=mqttfunction_driverLocation.js.map
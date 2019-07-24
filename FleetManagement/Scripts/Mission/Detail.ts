
import * as service from './DetailService';
import {
    promise
} from '../Shared/function';
let trace = new service.DetailService();

$(document).ready(async function () {

    //貨品照片
    $("#GoodsPhotoBtn").on("click", function (e) {
        var topValue = $("#GoodsPhoto").offset().top;
        $('#scrollDiv').animate({
            scrollTop: $("#GoodsPhoto").offset().top
        }, 750);  // 750是滑動的時間，單位為毫秒
        e.preventDefault();
    });

    //簽收照片
    $("#SignPhotoBtn").on("click", function (e) {
        var topValue = $("#SignPhoto").offset().top;
        $('#scrollDiv').animate({
            scrollTop: $("#SignPhoto").offset().top
        }, 750);
        e.preventDefault();
    });

    //運送軌跡
    $("#TraceBtn").on("click", function (e) {
        var topValue = $("#traceMap").offset().top;
        $('#scrollDiv').animate({
            scrollTop: $("#traceMap").offset().top
        }, 750);
        e.preventDefault();
    });

    //對話記錄
    $("#TalkLogBtn").on("click", function (e) {
        var topValue = $("#TalkLog").offset().top;
        $('#scrollDiv').animate({
            scrollTop: $("#TalkLog").offset().top
        }, 750);
        e.preventDefault();
    });
});

promise.then(success => {
    trace.initmap();
}).then(success => {
    let messageId: string = <string>$("#MessageId").val();
    trace.GetTrace({ MessageId: messageId });
});
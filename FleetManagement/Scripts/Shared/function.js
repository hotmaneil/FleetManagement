define(["require", "exports", "../../Content/bower_components/moment/moment"], function (require, exports, moment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function padLeft(str, lenght) {
        if (str.length >= lenght)
            return str;
        else
            return padLeft("0" + str, lenght);
    }
    exports.padLeft = padLeft;
    exports.promise = new Promise(function (resolve, reject) {
        resolve(1);
        reject(0);
    });
    function GetURLParameter() {
        var strUrl = location.search.toString().replace(/%20/g, " ");
        var getPara, ParaVal;
        var aryPara = {};
        if (strUrl.indexOf("?") != -1) {
            var getSearch = strUrl.split("?");
            getPara = getSearch[1].split("&");
            for (var _i = 0, getPara_1 = getPara; _i < getPara_1.length; _i++) {
                var i = getPara_1[_i];
                ParaVal = i.split("=");
                aryPara[ParaVal[0]] = ParaVal[1];
            }
        }
        return aryPara;
    }
    exports.GetURLParameter = GetURLParameter;
    function ValidateTaxIdNumber(taxId) {
        var invalidList = "00000000,11111111";
        if (/^\d{8}$/.test(taxId) == false || invalidList.indexOf(taxId) != -1) {
            return false;
        }
        var validateOperator = [1, 2, 1, 2, 1, 2, 4, 1], sum = 0, calculate = function (product) {
            var ones = product % 10, tens = (product - ones) / 10;
            return ones + tens;
        };
        for (var i = 0; i < validateOperator.length; i++) {
            sum += calculate(taxId[i] * validateOperator[i]);
        }
        return sum % 10 == 0 || (taxId[6] == "7" && (sum + 1) % 10 == 0);
    }
    exports.ValidateTaxIdNumber = ValidateTaxIdNumber;
    function WrapText(text, maxLength) {
        if (text.length == 0) {
            return "";
        }
        else {
            var resultText = "";
            for (var i = 0; i < text.length; i++) {
                if (i % maxLength == 0) {
                    resultText += text[i] + "\r\n";
                }
                else {
                    resultText += text[i];
                }
            }
            return resultText;
        }
    }
    exports.WrapText = WrapText;
    function PrintHtml(title, html) {
        var printwindow = window.open("", "列印", "resizable=yes");
        printwindow.document.open();
        printwindow.document.write("<!DOCTYPE html><html lang=\"\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        printwindow.document.write("<title>\u5217\u5370</title>");
        printwindow.document.write("<style>h1,h2,h3,h4,h5,h6{font-weight:bold;color:#00cccc;}\n                                table {margin: 25px auto;border-collapse: collapse;border: 1px solid #eee;width:100%;}\n                                table tr:hover {background: #f4f4f4;}\n                                table tr:hover td {color: #555;}\n                                table th, table td {color: #999;border: 1px solid #eee;padding: 12px 35px;border-collapse: collapse;}\n                                table th {background: #00cccc;color: #fff;text-transform: uppercase;font-size: 12px;}\n                                table th.last {border-right: none;}\n                               @media print{ h1,h2,h3,h4,h5,h6{color:#333;}table th,table td{color:#333;border-color:#888;}}</style>");
        printwindow.document.write("</head><body>");
        printwindow.document.write(title);
        printwindow.document.write(html);
        printwindow.document.write("</body></html>");
        printwindow.print();
    }
    exports.PrintHtml = PrintHtml;
    ;
    function setCookie(name, val) {
        var datenow = new Date();
        var value = val;
        datenow.setTime(datenow.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = name + "=" + value + "; expires=" + datenow.toUTCString() + "; path=/";
    }
    exports.setCookie = setCookie;
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }
    exports.getCookie = getCookie;
    function deleteCookie(name) {
        var setdate = new Date();
        setdate.setTime(setdate.getTime() + (-1 * 24 * 60 * 60 * 1000));
        document.cookie = name + "=; expires=" + setdate.toUTCString() + "; path=/";
    }
    exports.deleteCookie = deleteCookie;
    function CHK_GPS_LocationTW(lat, lng) {
        var regions = {
            "台灣本島": [{ lat: 23.093705861379938, lng: 119.96441894531245 }, { lat: 22.26025746466269, lng: 120.36879663085938 }, { lat: 21.879888116683166, lng: 120.72479406738285 }, { lat: 21.87112347692943, lng: 120.87754443359381 }, { lat: 23.52667748892151, lng: 121.66378784179688 }, { lat: 25.092038191894755, lng: 122.06550976562494 }, { lat: 25.337383953124792, lng: 121.51689111328119 }, { lat: 25.1056459482638, lng: 121.02320410156244 }, { lat: 24.15059001483785, lng: 120.32696777343745 }, { lat: 23.61818083248707, lng: 120.05780273437495 }],
            "東引": [{ lat: 26.35411177383301, lng: 120.47991806030268 }, { lat: 26.359944880967536, lng: 120.51259234619147 }, { lat: 26.38132356658539, lng: 120.51197430419916 }, { lat: 26.38548683548121, lng: 120.4589753723144 }],
            "連江": [{ lat: 25.976640357946756, lng: 119.90948730468745 }, { lat: 25.917355023381063, lng: 119.9928016967774 }, { lat: 26.308406973301203, lng: 120.02376934814447 }, { lat: 26.237303379300197, lng: 119.9045091247558 }],
            "澎湖": [{ lat: 23.19094023346052, lng: 119.23520141601557 }, { lat: 23.164732185122677, lng: 119.68140795898444 }, { lat: 23.800960773123013, lng: 119.76284405517572 }, { lat: 23.797830908467844, lng: 119.44720321655268 }],
            "綠島": [{ lat: 22.639440654272086, lng: 121.46542602539057 }, { lat: 22.62833754897049, lng: 121.50788500976569 }, { lat: 22.681090986608034, lng: 121.52614971923822 }, { lat: 22.691872322220238, lng: 121.46044784545893 }],
            "蘭嶼": [{ lat: 22.043400486590016, lng: 121.50560478759769 }, { lat: 21.94104778468612, lng: 121.60785744970713 }, { lat: 21.941519301134928, lng: 121.6253093916016 }, { lat: 22.026681080934186, lng: 121.60512195263675 }, { lat: 22.088018833167457, lng: 121.58403082006839 }, { lat: 22.087308829282325, lng: 121.49152655468748 }]
        }, d;
        for (var d_1 in regions) {
            var latLng = new google.maps.LatLng(lat, lng);
            var polygon = new google.maps.Polygon({ paths: regions[d_1] });
            var containsLocation = google.maps.geometry.poly.containsLocation(latLng, polygon);
            if (containsLocation) {
                return !0;
                return !1;
            }
        }
    }
    exports.CHK_GPS_LocationTW = CHK_GPS_LocationTW;
    function CHK_LastLocationOffLine(updatetime, overminutes) {
        if (moment(updatetime).add(overminutes, 'minutes').isBefore(moment()) || typeof updatetime == 'undefined') {
            return true;
        }
        else {
            return false;
        }
    }
    exports.CHK_LastLocationOffLine = CHK_LastLocationOffLine;
});
//# sourceMappingURL=function.js.map
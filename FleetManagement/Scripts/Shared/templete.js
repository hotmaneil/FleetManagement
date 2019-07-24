define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function temp_LineParagraph(length) {
        if (length < 0) {
            length = 1;
        }
        var items = "<div class=\"ui inverted placeholder fluid\">";
        for (var i = 0; i < length; i++) {
            var item = "\n        <div class=\"paragraph\">\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n        </div>";
            items += item;
        }
        items += "</div>";
        return items;
    }
    exports.temp_LineParagraph = temp_LineParagraph;
    function temp_LineParagraph_white(length) {
        if (length < 0) {
            length = 1;
        }
        var items = "<div class=\"ui placeholder fluid\">";
        for (var i = 0; i < length; i++) {
            var item = "\n        <div class=\"paragraph\">\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n            <div class=\"line\"></div>\n        </div>";
            items += item;
        }
        items += "</div>";
        return items;
    }
    exports.temp_LineParagraph_white = temp_LineParagraph_white;
    exports.CreateTraceList_ERROR = "<div class=\"item white disabled\">\n        <div class=\"content\">\n            <h5 class=\"ui header green\"><span class=\"ui label red\">\u5275\u5EFA\u932F\u8AA4</span></h5>\n            <div class=\"description\">\n                \u7121\u6CD5\u7522\u751F\u8ECC\u8DE1\u5217\u8868\n            </div>\n        </div>\n    </div>";
    exports.CreateTraceList_Empty = "\n    <div class=\"item white disabled\">\n        <div class=\"content\">\n            <h5 class=\"ui header green\"><span class=\"ui label red\">\u67E5\u7121\u8CC7\u8A0A</span></h5>\n            <div class=\"description\">\n                \u67E5\u7121\u8ECC\u8DE1\u8CC7\u6599\n            </div>\n        </div>\n    </div>";
    exports.CreateAccrodition_ERROR = "\n    <div class=\"title active\"> \n        <i class=\"dropdown icon\"></i>\u8B80\u53D6\u8ECA\u8F1B\u4E0B\u62C9\u5217\u8868\u767C\u751F\u932F\u8AA4\n    </div>\n\n    <div class=\"content active\"><div class=\"ui middle aligned divided cushover list\">\n        <div class=\"item\">\n            <div class=\"right floated content\">\n                <span class=\"ui fontred\">\u8B80\u53D6\u8ECA\u8F1B\u4E0B\u62C9\u5217\u8868\u767C\u751F\u932F\u8AA4</span>\n            </div>\n            <div class=\"left floated content\" style=\"width:130px;\">\n                <a class=\"ui red empty circular label\"></a>ERROR\n            </div>\n            <div class=\"content\">\n                \u8ACB\u78BA\u8A8D\u7DB2\u8DEF\u662F\u5426\u65B7\u7DDA\u6216\u91CD\u6574\u9801\u9762\n            </div>\n        </div>\n    </div>\n</div>";
    exports.CreateCheckboxList_ERROR = "\n    <div class=\"field\">\n        <div class=\"ui checkbox custom red disabled\">\n        <input type=\"checkbox\" name=\"GroupOperation\" data-value=\"-1\">\n        <label>\u6C92\u6709\u71DF\u904B\u72C0\u614B\u8A2D\u7F6E</label>\n        </div>\n    </div>";
});
//# sourceMappingURL=templete.js.map
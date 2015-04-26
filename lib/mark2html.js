/**
 * 运用markdown 渲染说明文件
 */
var marked = require("marked");
var renderer = new marked.Renderer();
marked.setOptions({
    breaks: true,
    tables: true,
    smartLists: true,
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    },
    renderer: renderer
});
// renderer.heading = function(text, level) {
//     var escapedText = text.toLowerCase().replace(/[^\w\W]+/g, '-').replace(/<a.*>/g, '-');
//     return '<h' + level + '><a name="' + escapedText + '" class="anchor" href="#' + escapedText + '"><span class="header-link"></span></a>' + text + '</h' + level + '>';
// };
var Hashed = {};
module.exports = function(content) {
    var key = content;
    var ret;
    if (Hashed[key]) {
        ret = Hashed[key];
    } else {
        ret = Hashed[key] = marked(content);
    }
    return ret;
}
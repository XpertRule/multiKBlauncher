xrBootstrap.setPayload({
isMobile: true,
hb: false,
isAjax: false,
isApp: false,
noCache: false,
endCallback: "../../end.php",
files: [
    "css/jquerymobile/jquery.mobile-1.2.0.min.css"
    , "css/xr_engine-min.css"
    , "plugins/mpiechart/xrui-mpiechart.css", "plugins/mstars/xrui-mstars.css", "plugins/mvisuallist/xrui-mvisuallist.css"
    , "jquery.mobile-1.2.0.min.js"
    , "xr_engine-min.js"
    , "dict.js"
    , "plugins/mpiechart/libraries/RGraph.common.core.js", "plugins/mpiechart/libraries/RGraph.common.dynamic.js", "plugins/mpiechart/libraries/RGraph.common.tooltips.js", "plugins/mpiechart/libraries/RGraph.pie.js", "plugins/mpiechart/xrui-mpiechart.js", "plugins/mstars/xrui-mstars.js", "plugins/mvisuallist/xrui-mvisuallist.js"
]
});
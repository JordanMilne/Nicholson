var JACK_DEFAULTS = {
    "iframeSrc": "tests/a.html",
    "iframeWidth": 2000,
    "iframeHeight": 2000,
    "scrollLeft": 0,
    "scrollTop": 0,
    "viewPortHeight": 250,
    "viewPortWidth": 800,
    "sandbox": true,
    "allowScripts": true,
    "allowTopNavigation": false,
    "allowSameOrigin": true,
    "allowForms": true
};

window.jack = $.extend({}, JACK_DEFAULTS);

function updateNicholsonIframe() {
    setIframeParams($("#jackFrame"), $("#scroller"), window.jack);
}

// Load nicholson for the first time, or when importing JSON
function initNicholson() {
    $(".sandboxParam").prop('disabled', !window.jack["sandbox"]);

    updateInput("iframeSrc");
    updateInput("iframeWidth");
    updateInput("iframeHeight");
    updateInput("scrollLeft");
    updateInput("scrollTop");
    updateInput("viewPortWidth");
    updateInput("viewPortHeight");
    updateCheckbox("sandbox");
    updateCheckbox("allowSameOrigin");
    updateCheckbox("allowForms");
    updateCheckbox("allowTopNavigation");
    updateCheckbox("allowScripts");

    updateNicholsonIframe();
}

function watchCoordForm() {
    // watches for changes in an input and automatically updates window.jack

    $("#exportJSON").click(function(e) {
        var textBox = $("#inputOutput");
        textBox.val(JSON.stringify(window.jack, null, 0));
        textBox.select();
    });
    $("#importJSON").click(function(e) {
        importFrom($("#inputOutput"));
    });

    watchInput("iframeSrc", function(val) {
        $("#jackFrame").attr("src", val);
    });
    watchInput("iframeWidth", function(val) {
        $("#jackFrame").css("width", val);
        fixScroll();
    });
    watchInput("iframeHeight", function(val) {
        $("#jackFrame").css("height", val);
        fixScroll();
    });
    watchInput("scrollLeft", function(val) {
        fixScroll();
    });
    watchInput("scrollTop", function(val) {
        fixScroll();
    });
    watchInput("viewPortWidth", function(val) {
        $("#scroller").css("width", val);
        fixScroll();
    });
    watchInput("viewPortHeight", function(val) {
        $("#scroller").css("height", val);
        fixScroll();
    });

    // We want to force a reload of the page if we change sandbox params
    watchCheckbox("sandbox", function(val) {
        updateNicholsonIframe();
    });
    watchCheckbox("allowSameOrigin", function(val) {
        updateNicholsonIframe();
    });
    watchCheckbox("allowScripts", function(val) {
        updateNicholsonIframe();
    });
    watchCheckbox("allowForms", function(val) {
        updateNicholsonIframe();
    });
    watchCheckbox("allowTopNavigation", function(val) {
        updateNicholsonIframe();
    });
}
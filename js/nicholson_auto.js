var JACK_DEFAULTS = {
    "iframeSrc": "tests/a.html",
    "configIframeSrc": "tests/b.html",
    "selector": "#coolButton",
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
    calcViewportParams(window.jack, function(viewPortParams){
        var sopWarning = $("#sopWarning");
        var jackFrame = $("#jackFrame");
        if(viewPortParams != null) {
            window.jack = $.extend(window.jack, viewPortParams);
            setIframeParams(jackFrame, $("#scroller"), window.jack);
            sopWarning.attr('class', '');
        } else {
            // IDK, let the user know stuff wasn't kosher.
            jackFrame.attr('src', 'about:blank');
            sopWarning.attr('class', 'angry');
        }

        updateInputs();
    });
}

function updateInputs() {
    $(".sandboxParam").prop('disabled', !window.jack["sandbox"]);

    // allow-same-origin must be set to get the dimensions of the element.
    // set allowSameOrigin to false in the callback for calcViewPortParams
    // if you don't want it set on your target iframe.
    $("#allowSameOrigin").prop('disabled', true);

    updateInput("iframeSrc");
    updateInput("configIframeSrc");
    updateInput("selector");
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
}

// Load nicholson for the first time, or when importing JSON
function initNicholson() {
    updateInputs();

    updateNicholsonIframe();
}

function watchAutoConfigForm() {
    // watches for changes in an input and automatically updates window.jack

    $("#exportJSON").click(function(e) {
        var textBox = $("#inputOutput");

        // Don't export parameters that are generated at runtime
        var cleanParams = jQuery.extend(true, {}, window.jack);

        delete cleanParams["viewPortWidth"];
        delete cleanParams["viewPortHeight"];
        delete cleanParams["scrollLeft"];
        delete cleanParams["scrollTop"];

        textBox.val(JSON.stringify(cleanParams, null, 0));
        textBox.select();
    });
    $("#importJSON").click(function(e) {
        importFrom($("#inputOutput"));
    });

    watchInput("iframeSrc", function(val) {
        $("#jackFrame").attr("src", val);
    });
    watchInput("configIframeSrc", function(val) {
        updateNicholsonIframe();
    });
    watchInput("selector", function(val) {
        updateNicholsonIframe();
    });
    watchInput("iframeWidth", function(val) {
        $("#jackFrame").css("width", val);
        fixScroll();
        updateNicholsonIframe();
    });
    watchInput("iframeHeight", function(val) {
        $("#jackFrame").css("height", val);
        fixScroll();
        updateNicholsonIframe();
    });

    // We want to force a reload of the page if we change sandbox params
    watchCheckbox("sandbox", function(val) {
        // allow-same-origin must be set to get the dimensions of the element.
        // set allowSameOrigin to false in the callback for calcViewPortParams
        // if you don't want it set on your target iframe.
        $("#allowSameOrigin").prop('disabled', true);

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
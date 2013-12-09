function updateInput(name) {
    $("#" + name).val(window.jack[name]);
}
function updateCheckbox(name) {
    $("#" + name).prop("checked", window.jack[name]);
}

// Depending on how we change the width of certain objects, how far we can scroll may change.
function fixScroll() {
    var scroller = $("#scroller");
    scroller.scrollTop(window.jack.scrollTop);
    scroller.scrollLeft(window.jack.scrollLeft);
}

function watchInput(name, cb) {
    $("#" + name).change(function() {
        var curVal = $("#" + name).val();

        // A guard to make sure the value's *actually* changed in case a browser is dumb.
        if(curVal == window.jack[name])
            return;

        window.jack[name] = curVal;
        cb(curVal);
    });
}

function watchCheckbox(name, cb) {
    $("#" + name).change(function() {
        var curVal = $("#" + name).prop( "checked" );

        // A guard to make sure the value's *actually* changed in case a browser is dumb.
        if(curVal == window.jack[name])
            return;

        window.jack[name] = curVal;
        cb(curVal);

        $(".sandboxParam").prop('disabled', !window.jack["sandbox"]);
    });
}

function importFrom(textBox) {
    var newParams = JSON.parse(textBox.val());
    window.jack = $.extend(window.jack, {});

    $.each(newParams, function(key, val) {
        // Only set keys that make sense.
        if(key in JACK_DEFAULTS) {
            window.jack[key] = val;
        }
    });

    initNicholson();
}

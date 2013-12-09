/**
 * Sets all of the applicable rules in jackParams on frameJQ and scrollerJQ
 */
function setIframeParams(frameJQ, scrollerJQ, jackParams) {

    // Sandbox parameters need to be set *before* a page starts loading.
    if("sandbox" in jackParams) {
        if(jackParams.sandbox) {
            var sandBoxVal = "";

            function maybeAppendPermission(type, val) {
                if(type in jackParams && jackParams[type]) {
                    if(sandBoxVal != "")
                        sandBoxVal += " ";

                    sandBoxVal += val;
                }
            }

            maybeAppendPermission("allowScripts", "allow-scripts");
            maybeAppendPermission("allowTopNavigation", "allow-top-navigation");
            maybeAppendPermission("allowSameOrigin", "allow-same-origin");
            maybeAppendPermission("allowForms", "allow-forms");
            frameJQ.attr("sandbox", sandBoxVal);
        } else {
            frameJQ.removeAttr("sandbox");
        }
    }

    if("iframeWidth" in jackParams)
        frameJQ.css("width", jackParams.iframeWidth);
    if("iframeHeight" in jackParams)
        frameJQ.css("height", jackParams.iframeHeight);
    if("iframeSrc" in jackParams) {
        // Make sure to force a reload even if we're looking at the same page
        frameJQ.attr("src", "about:blank");
        frameJQ.attr("src", jackParams.iframeSrc);
    }

    // We don't need this when setting up an autoconfig iframe
    if(scrollerJQ != null) {
        if("viewPortHeight" in jackParams)
            scrollerJQ.css("height", jackParams.viewPortHeight);
        if("viewPortWidth" in jackParams)
            scrollerJQ.css("width", jackParams.viewPortWidth);
        if("scrollTop" in jackParams)
            scrollerJQ.scrollTop(jackParams.scrollTop);
        if("scrollLeft" in jackParams)
            scrollerJQ.scrollLeft(jackParams.scrollLeft);
    }
}

var DEFAULT_DIMENSION_CALC_FUNCS = {
    'left': function(target, frame) {
        // We need to round() these numbers, otherwise the browser will call floor()
        return Math.round(target.offset().left);
    },
    'top': function(target, frame) {
        return Math.round(target.offset().top);
    },
    'width': function(target, frame) {
        // jQuery's .width() and .height() return useless results, why?
        return target[0].offsetWidth;
    },
    'height': function(target, frame) {
        return target[0].offsetHeight;
    }
};

/**
 * Figure out how much we need to scroll the scroller, and what dimensions it should be
 * @param jackParams
 * @param callback
 * @param dimensionCalcFuncs
 */
function calcViewportParams(jackParams, callback, dimensionCalcFuncs) {
    // display:none would be ideal, however no layout actually happens and we can't get the document
    // offset in that case. Just try to make it affect as little as possible.
    var frame = $('<iframe style="visibility:hidden;position:fixed;z-index:-9999999" seamless="seamless" scrolling="no"></iframe>');

    console.log(jackParams);

    if(dimensionCalcFuncs == undefined) {
        dimensionCalcFuncs = {};
    }
    // Use the default methods for calculating dimensions if one wasn't specified.
    dimensionCalcFuncs = jQuery.extend(true, DEFAULT_DIMENSION_CALC_FUNCS, dimensionCalcFuncs);

    var testParams = jQuery.extend({}, jackParams);
    testParams["iframeSrc"] = testParams["configIframeSrc"];

    // Bail if the framed document never loads
    var frameTimeout = setTimeout(function(){
        frame.remove();

        callback(null);
        console.log("CONFIG FRAME TIMEOUT");
    }, 5000);

    // Configure our test iframe
    setIframeParams(frame, null, testParams);

    frame.load(function() {
        clearTimeout(frameTimeout);

        try {
            // Look for our target in the iframe's DOM
            var target;
            if(typeof testParams.selector == "function")
                target = testParams.selector(frame.contents());
            else
                target = frame.contents().find(testParams.selector);
            var viewPortParams = {};
            viewPortParams["scrollTop"] = dimensionCalcFuncs.top(target, frame);
            viewPortParams["scrollLeft"] = dimensionCalcFuncs.left(target, frame);
            viewPortParams["viewPortWidth"] = dimensionCalcFuncs.width(target, frame);
            viewPortParams["viewPortHeight"] = dimensionCalcFuncs.height(target, frame);

            // We don't want to end up catching errors for the callback.
            setTimeout(function(){
                callback(viewPortParams, frame.contents());
                frame.remove();
            }, 1);
        }
        // Handle errors finding and dealing with the target element.
        catch (e) {
            callback(null);
            console.log("CONFIG IFRAME EXCEPTION");
            throw (e);
        }
    });

    $('body').append(frame);
}


function viewPortToRect(viewPortParams) {
    return {
        top: viewPortParams["scrollTop"],
        left: viewPortParams["scrollLeft"],
        width: viewPortParams["viewPortWidth"],
        height: viewPortParams["viewPortHeight"]
    };
}


/**
 * Take a pre-configured scroller / iframe combo and place it over target
 * @param scroller Scroller containing the iframe (jQuery object)
 * @param target Element to place the scroller over, assumed to be in the DOM (jQuery object)
 */
function placeNicholsonIframeOver(scroller, target) {

    var targetOffset = target.offset();

    var rect = {
        top: targetOffset.top,
        left: targetOffset.left,
        width: target[0].offsetWidth,
        height : target[0].offsetHeight
    };

    placeElemOverRect(scroller, rect, true);
}

/**
 * Take a pre-configured scroller / iframe combo and tile it over target
 * @param scroller Scroller containing the iframe (jQuery object)
 *                 scroller does not need to be in the DOM at time of passing,
 *                 clones of it will be automatically added.
 * @param target Element to place the scroller over (jQuery object)
 * @param scroll_rect Rect with the dimensions of the element if it can't be determined at call time
 */
function tileNicholsonIframeOver(scroller, target, scroll_rect) {

    var targetOffset = target.offset();
    var targetWidth = target[0].offsetWidth;
    var targetHeight = target[0].offsetHeight;

    var viewPortHeight = 0;
    var viewPortWidth = 0;
    var scrollLeft = 0;
    var scrollTop = 0;

    if(scroll_rect === undefined) {
        viewPortHeight = scroller[0].offsetHeight;
        viewPortWidth = scroller[0].offsetWidth;
        scrollLeft = scroller.scrollLeft();
        scrollTop = scroller.scrollTop();
    } else {
        viewPortHeight = scroll_rect.height;
        viewPortWidth = scroll_rect.width;
        scrollTop = scroll_rect.top;
        scrollLeft = scroll_rect.left;
    }

    var rows = Math.ceil(targetHeight / viewPortHeight);
    var cols = Math.ceil(targetWidth / viewPortWidth);

    if(!isFinite(rows) || !isFinite(cols)) {
        throw "called tileNicholsonIframeOver without rect and hidden scroller";
    }

    var body = $('body');

    var scrollerClones = $();

    for(var y = 0; y < rows; ++y) {
        var yOffset = y * viewPortHeight;
        for(var x = 0; x < cols; ++x) {
            var xOffset = x * viewPortWidth;

            var rect = {
                left: targetOffset.left + xOffset,
                top: targetOffset.top + yOffset,
                width: targetWidth - xOffset,
                height: targetHeight - yOffset
            };

            // NOTE: The state of the iframe contained in scroller will not be the
            // same as the iframe you copied, if you've navigated the iframe since
            // adding it to the DOM, this will NOT be reflected in the clones.
            var scrollerClone = $(scroller[0]).clone();
            scrollerClone.removeAttr('id').find('*').removeAttr('id');

            body.append(scrollerClone);
            placeElemOverRect(scrollerClone, rect, false);

            // We need to set the scroll properly afterwards.
            scrollerClone.scrollTop(scrollTop);
            scrollerClone.scrollLeft(scrollLeft);
            scrollerClones = scrollerClones.add(scrollerClone);
        }
    }
    return scrollerClones;
}

/**
 * Attempts to place an element over a rect, changing the width and height
 * of the element to fit
 *
 * @param elem Element to place (jQuery object)
 * @param rect Rect (top, left, width, height) to place elem within
 * @param center Whether to center elems that are smaller than rect,
 *               places elem in top-left if false.
 */
function placeElemOverRect(elem, rect, center) {

    elem.css('position', 'absolute');
    elem.css('z-index', '999999');

    var elemWidth = elem[0].offsetWidth;
    var elemHeight = elem[0].offsetHeight;

    var left = rect.left;
    var top = rect.top;

    if(rect.width > elemWidth) {
        // Center the element over the rect if it's not wide / tall enough.
        if(center) {
            left += Math.round((rect.width - elemWidth) / 2);
        }
    } else {
        // The element may be too big, shrink it to fit over the rect.
        elem.css('width', rect.width);
    }

    if(rect.height > elemHeight) {
        if(center) {
            top += Math.round((rect.height - elemHeight) / 2);
        }
    } else {
        // The element may be too big, shrink it to fit over the element.
        elem.css('height', rect.height);
    }

    elem.css('left', left);
    elem.css('top', top);
}

/**
 * Calls cb on the frame's *second* load event (i.e. on user action)
 * @param collection
 * @param cb
 */
function onAnySecondLoad(collection, cb) {
    var afterLoad = function(){
        $(this).unbind('load', afterLoad);

        var afterSecondLoad = function(){
            $(this).unbind('load', afterSecondLoad);
            cb();
        };

        // call the callback when any one of the collection
        // navigates successfully after the first time
        $(this).load(afterSecondLoad);
    };
    collection.load(afterLoad);
}

/**
 * Triggers cb when every element in collection has load()ed once
 * @param collection
 * @param cb
 */
function onAllLoaded(collection, cb) {
    var elem_list = collection.get();

    var onLoad = function() {
        var self = this;
        elem_list = jQuery.grep(elem_list, function(value) {
            return value != self;
        });

        if(elem_list.length <= 0) {
            console.log("All loaded.");
            collection.unbind('load', onLoad);
            cb();
        }
    };

    collection.load(onLoad);
}
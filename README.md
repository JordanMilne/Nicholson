Summary
=======

All work and no play makes Jack a dull boy, and with the amount of clickjacking issues I run into during pentesting, making interesting cross-browser PoCs is a real pain in the ass. Even after years of people crowing about web standards, modern browsers *still* have positioning and rendering differences that affect the viability of clickjacking attacks.

It's even worse when an attack requires multiple clicks and reframes before anything interesting happens.

Nicholson helps you with this in several ways:

Fixed-position Editor
================

This was the first part of the tool, and was partially inspired by [Egor Homakov's Any Square](http://homakov.github.io/anysquare.html). Type in a URL, play around with the viewport parameters and sandbox settings manually until the page is framed the way you want it. Then you can export the settings to JSON, and pass it to setIframeParams on your page.

You can also re-import the settings on another browser so you have a good starting point.

For an example of a completed attack, see `nicholson_test_coords.html`

Selector-based Editor
=================

The interesting bit is the selector-based clickjacking support. For this, you need to be able to construct a "configuration page" with a similar layout as the target page on the your domain. A copy of the target page with any auth tokens stripped out is fine. Then you pass in a selector of the target element on both the configuration and target page. Nicholson will determine the height, width and coordinates of the selected element on the configuration page, and use those calculations to frame the element on the *target* page.

Using this method, we can avoid having to manually determine the viewport with every possible browser the attacker might use. This method also accounts for any differences in browser configuration (default font size, ad blocking, etc.)

For an example of a completed attack, see `nicholson_test_auto.html`

Demo
====

A live version can be found [here](http://jordanmilne.github.io/Nicholson/), but note that Nicholson (especially the Selector-based editor) works best when served from a server that you control.
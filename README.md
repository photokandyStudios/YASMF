# YASMF: Yet Another Simple Mobile Framework

The goal of YASMF is to provide a simple, light-weight framework that can be used to create performant Apps for Mobile Devices. It supports Webkit and Trident-based browsers, so it should work on a wide-variety of devices. That said, this framework specifically targets only Android, iOS, and WP7 (Mango).

This framework arose out of several projects and a need to have something simple and lightweight that didn't distract from the App-creation process. I wanted something that would be reasonably native-like on each platform, while also not aiming for pixel perfection (which can lead to bloat).

The framework itself is mainly intended for use under the PhoneGap/Cordova umbrella, though portions of it are certainly useable outside. 

## Authors/Contributors

* Kerri Shotts, photoKandy Studios LLC

## Current Version

0.1 alpha

## License

MIT

## A Word to the Wise

This framework is under heavy, active development. It may change at any given time. Please don't use it in a production app and then complain when the next version breaks it. (That said, I use this in my own apps, and so really don't intend on breaking anything.)

Essentially, use at your own risk. If you'd like to help, however, that would be absolutely fantastic. Feel free to fork this repo, make changes, suggest pulls. If you find a bug, feel free to submit an issue, too.

## Framework Expectations

The framework currently expects a single element in the "index.html" file called "rootContainer". All other views are placed inside this container. To support tablets, this will need to be modified somewhat, but I have yet to build that support.

In general, the coding style assumes a view/model convention, but there's nothing that specifically states that you must program that way. The animation functionality that manages the view stack does assume that each view has certain contracted methods, but beyond that, you are free to design as you wish. That said, personally, I use a very Apple-like approach to the way things are laid out.

## Separable Components

Some components included in this framework are, in all honesty, separate components that can live without the framework. These include:

* localization.js
* scroller.js
* ui-gestures.js
* utility.js

## Third-party Components

The localization component relies heavily upon jQuery's globalize.js. Thanks to them for creating such a good library for globalization purposes.

## Further Documentation

As this is in very early stages, documentation is sparse. The best way to get a feel for the framework is to review the code and the comments therein. As time permits, documentation will be added, as well as a sample app.

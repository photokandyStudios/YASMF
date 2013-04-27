/**
 *
 * YASMF Demo Application
 *
 * This application seeks to demonstrate most of the features in YASMF while also
 * looking and acting somewhat like a real application. (By that I mean, the demo
 * isn't going to be just about dropping a lot of widgets on the screen with no
 * functionality).
 *
 */
/*jshint
         asi:true,
         bitwise:true,
         browser:true,
         camelcase:true,
         curly:true,
         eqeqeq:false,
         forin:true,
         noarg:true,
         noempty:true,
         plusplus:false,
         smarttabs:true,
         sub:true,
         trailing:false,
         undef:true,
         white:false,
         onevar:false 
 */
/*global PKLOC, PKUTIL, PKUI, UI, device, cordova, console , $ge*/

/**
 *
 * Our application lives under the APP namespace
 *
 */
var APP = APP || {};

/**
 *
 * pretty much does what it says though this could, just as easily,
 * be done largely in index.html as well. Really more to your preference,
 * honestly.
 *
 * We fire off the localization initialization when it is complete.
 */
APP.loadLibraries = function ()
{
    PKUTIL.consoleLogging = true;
    PKUTIL.include ( ["./framework/localization.js",
                      "./framework/device.js",
                      "./framework/ui-gestures.js",
                      "./framework/fileutil.js",
                      "./framework/pk-object.js",
                      "./framework/ui-base.js",
                      "./framework/ui-view.js",
                      "./framework/ui-label.js"
                     ].reverse(),
                     APP.initLocalization );
}
document.addEventListener ( "deviceready", APP.loadLibraries, false );

/**
 *
 * Load the localization locales, and when done, call APP.init
 *
 */
APP.initLocalization = function ()
{
    PKLOC.initializeGlobalization(function ()
    { 
        PKLOC.loadLocales( ["en-US"], function() 
        { 
            APP.init(); 
        }); 
    });
}

/**
 *
 * Add any values that should exist in the translation matrix at the
 * start of the app, then call APP.start.
 *
 */
APP.init = function ()
{
    PKLOC.addTranslation ("en", "BACK", "Back");
    APP.start();

    // ready.
}

/**
 *
 * Called when the application is ready to be started. Here we
 * can load, display, and manipulate views and data.
 *
 */
APP.start = function ()
{
    var aView = new UI.View();
    APP.rootView = aView;
    aView.initWithOptions ( 
        { //backgroundColor: UI.COLOR.redColor(), 
                   //useGPU: true,// useGPUForPositioning: true,
//            backgroundImage: UI.makeSimpleLinearGradientImage ( "top", UI.makeColor(192,192,192,1), "0%", 
//                                                                       UI.makeColor(228,228,228,1), "100%" ),
                    frame: UI.makeRect ( UI.makePoint(10,10), UI.offsetSize( UI.screenSize(), UI.makeSize (-20, -20) ) ) 
        } 
    );

    var scrollView = new UI.View();
    var aRect = aView.bounds;
    aRect.size.h = 20 * 200;
    scrollView.initWithFrame ( aRect );
    //scrollView.useGPU = true;
    //scrollView.useGPUForPositioning = true;
    //scrollView.backgroundColor = UI.makeColor( 228, 228, 228, 1.0 );
    aView.backgroundImage = UI.makeImage ( "./images/crisp_paper_ruffles.png", UI.makeSize(481/2,500/2),
                                                { repeat: "repeat" } );

    aView.addSubView (scrollView);

    for (var i=0; i<200; i++)
    {
        var aLabel = new UI.Label();
        aLabel.initWithOptions (
        {
            //useGPU: true,// useGPUForPositioning: true,
            frame: UI.makeRect ( UI.makePoint ( 10, i*20 ), UI.makeSize ( scrollView.bounds.size.w-20, 20 ) ),
            textColor: UI.COLOR.darkTextColor(),
            text: "This is label #" + i
        });
        if (i==5)
        {
            aLabel.interactive = true;
            aLabel.addListenerForNotification ( "tapped", function () { console.log("Hi!"); } );
        }
        scrollView.addSubView (aLabel);
    }

    aView.overflow = "scroll";

    UI.setRootView ( aView );
}

APP.animate = function ()
{
    var scrollView = APP.rootView.subViews[0];
    scrollView.frame = UI.offsetRectByPoint ( scrollView.frame, UI.makePoint ( 0, -1 ) );
    if (scrollView.frame.origin.y > -500)
    {
        setTimeout ( APP.animate, 0 );
    }
}


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
var APP = APP || {};

APP.loadLibraries = function ()
{
    PKUTIL.include ( ["./framework/localization.js",
                      "./framework/device.js",
                      "./framework/ui-core.js",
                      "./framework/ui-msg.js",
                      "./framework/ui-gestures.js",
                      "./framework/fileutil.js",
                      "./framework/pk-object.js",
                      "./framework/ui-base.js",
                      "./framework/ui-view.js",
                      "./framework/ui-label.js"
                     ].reverse(),
                     APP.initLocalization );
}

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

APP.init = function ()
{
    PKLOC.addTranslation ("en", "BACK", "Back");
    APP.start();
    PKUI.CORE.initializeApplication();

    // ready.
}

APP.start = function ()
{
    var aView = new UI.View();
    APP.rootView = aView;
    aView.initWithOptions ( 
        { backgroundColor: UI.COLOR.redColor(), 
                   //useGPU: true,// useGPUForPositioning: true,
                    frame: UI.makeRect ( UI.makePoint(10,10), UI.offsetSize( UI.screenSize(), UI.makeSize (-20, -20) ) ) 
        } 
    );
    $ge("rootContainer").appendChild(aView._element);

    var scrollView = new UI.View();
    var aRect = aView.bounds;
    aRect.size.h = 20 * 200;
    scrollView.initWithFrame ( aRect );
    //scrollView.useGPU = true;
    //scrollView.useGPUForPositioning = true;
    scrollView.backgroundColor = UI.makeColor( 228, 228, 228, 1.0 );
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

    //APP.animate();
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

document.addEventListener ( "deviceready", APP.loadLibraries, false );

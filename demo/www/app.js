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
    aView.initWithOptions ( { backgroundColor: UI.COLOR.redColor(), frame: UI.makeRect ( UI.makePoint(10,10), UI.makeSize(300,200) ) } );
    $ge("rootContainer").appendChild(aView._element);

    var aLabel = new UI.Label();
    aLabel.initWithOptions ( 
    {
        backgroundColor: UI.makeColor(228, 228, 228, 1.0),
        frame: UI.makeRect ( UI.makePoint (10,10), UI.makeSize (280, 20) ),
        textColor: UI.COLOR.darkTextColor(),
//        shadow: UI.makeShadow ( true, UI.COLOR.whiteColor(), UI.makePoint(0,-1), 0),
//        textAlignment: "center",
        text: "A New Label"
    });
    aView.addSubView (aLabel);
}

document.addEventListener ( "deviceready", APP.loadLibraries, false );

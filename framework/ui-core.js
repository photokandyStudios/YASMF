/**
 * This script provides a lot of the core user interface framework, such as
 * loading content via AJAX, transitions, and more.
 * @module PKUI
 * @requires PKUTIL, PKDEVICE
 * @author Kerri Shotts
 * @version 0.3
 *
 ******************************************************************************/
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
/*global device, PKDEVICE, PKUTIL, $ge, cordova, console*/
PKUTIL.require ( ["PKUTIL", "PKDEVICE"], function () 
{ 
    PKUTIL.export ( [ "PKUI", "PKUI.CORE"] );
});

/**
 *
 * PKUI provides the legacy (v0.2) UI framework (including a view hierarchy)
 * and other various utility functions that are still applicable to newer
 * versions.
 *
 * Where possible, one should use the newer methods that supersede the
 * framework methods.
 *
 * @class PKUI
 */
var PKUI = PKUI ||
{
};
// create the namespace
/**
 * Version of the class in {major:,minor:,rev:} form.
 *
 * @property version
 * @type Object
 */
PKUI.version = { major: 0, minor: 3, rev: 100 };

/**
 * PKUI.CORE provides the legacy (v0.2) UI framework (including a view hierarchy)
 * and other various utility functions that are still applicable to newer
 * versions.
 *
 * Where possible, one should use the newer methods that supersede the
 * framework methods.
 *
 * @class PKUI.CORE
 */
PKUI.CORE = PKUI.CORE ||
{
}// create the CORE space
PKUI.CORE.TABBAR = PKUI.CORE.TABBAR ||
{
};

//
// Properties
//
/**
 * Determines whether console logs are generated; if `true`, various functions
 * will generate logging information to the console.
 *
 * @property consoleLogging
 * @type boolean
 * @default false
 */
PKUI.CORE.consoleLogging = false;

/**
 * Controls the view stack. It does not have the concept of multiple views
 * on-screen at once, so for split-view apps, this isn't nearly sufficient,
 * but it works for simple apps.
 *
 * @property viewStack
 * @type Array
 * @default empty
 */
PKUI.CORE.viewStack = Array();

/**
 * Points at the view at the top of the viewStack. (Generally, this one
 * that is visible).
 *
 * @property currentView
 * @type Object
 * @default null
 */
PKUI.CORE.currentView = null;

/**
 * If `true`, 3D transforms and transitions are used instead of the slower,
 * jerkier javascript transitions.
 *
 * @property useTransforms
 * @type boolean
 * @default true
 */
PKUI.CORE.useTransforms = true; 

/**
 * Determines the interval to use between JS animations when not using
 * 3D transforms.
 *
 * @property jsaInterval
 * @type Number
 * @default 16
 */
PKUI.CORE.jsaInterval = 16;

/**
 * If `true`, use animation when pushing and popping views.
 *
 * @property animate
 * @type boolean
 * @default true
 */
PKUI.CORE.animate = true;

/**
 * It turns out that PG doesn't really like having to support multiple
 * back button handlers, and so if `true`, we'll install a global
 * back button handler to help do the work for us.
 *
 * @property captureBackButton
 * @type boolean
 * @default true
 */
PKUI.CORE.captureBackButton = true;
/**
 * Keep track of the list time the back button was pressed, so we can
 * prevent double bounces.
 *
 * @property _lastBackButtonTime
 * @private
 * @type Number
 * @default -1
 */
PKUI.CORE._lastBackButtonTime = -1;

/** 
 * the interval to use when calling applyTouchListeners automatically.
 * If 0, they will not be called, and must be called manually after
 * every DOM change. 
 *
 * @property listenerInterval
 * @type Number
 * @default 100
 */
PKUI.CORE.listenerInterval = 100;

/**
 * Determines how push,pop,swap, etc., are handled
 * if "fullscreen", all views take up the entire screen.
 * if "column", all views take up the _columnWidth specified
 *              in the view.
 *
 * @property viewHandlingMethod
 * @type String
 * @default "fullscreen"
 */
PKUI.CORE.viewHandlingMethod = "fullscreen";


//
// Methods
//

/**
 *
 * Global back button handler, since doing it per-view and per-
 * message is buggy. This will call backButtonPressed() on any
 * active message or view. If said method isn't found, it will
 * pop the view on its own.
 *
 * NOTE: if backButtonPressed() is defined, it is expected to
 * pop the view, if the method is also a view. If the view is
 * not popped, the back button will have no effect.
 *
 * SECOND NOTE: Since back buttons received in quick succession
 * are problematic, we force the user to wait 1s before the next
 * back button is accepted.
 *
 * @method handleBackButton
 * @static
 */
PKUI.CORE.handleBackButton = function ()
{
  var currentTime = (new Date()).getTime();
  if (PKUI.CORE._lastBackButtonTime < currentTime - 1000)
  {
    PKUI.CORE._lastBackButtonTime = (new Date()).getTime();
    if (PKUI.MESSAGE)
    {
      if (!PKUI.MESSAGE.captureBackButton)
      {
        if (PKUI.MESSAGE.currentMessage)
        {
          PKUI.MESSAGE.currentMessage.backButtonPressed();
          return;
        }
      }
    }

    if (PKUI.CORE.currentView.backButtonPressed)
    {
      PKUI.CORE.currentView.backButtonPressed();
    }
    else
    {
      PKUI.CORE.popView();
    }
  }
}

/**
 *
 * Initializes the application framework
 *  - in this version of the framework, we force an orientation update.
 *  - by default, we attach a global back button handler
 *  - we deisable animations and transforms for Android and WP7.
 *
 * @method initializeApplication
 * @static
 */
PKUI.CORE.initializeApplication = function()
{

  // check (and update) our current device orientation
  PKUI.CORE.updateOrientation();

  // add the event listener...
  window.addEventListener('orientationchange', PKUI.CORE.updateOrientation, false);

  // do we capture the back button?
  if (PKUI.CORE.captureBackButton)
  {
    document.addEventListener('backbutton', PKUI.CORE.handleBackButton, false);
  }

  // determine if we should use 3D transforms for animation or not
  if (device.platform == "Android")
  {
    PKUI.CORE.animate = false;
    PKUI.CORE.useTransforms = false;
/*    if (parseInt(device.version.substr(0, 2)) < 3)
    {
      if (PKUI.CORE.consoleLogging)
      {
        console.log("NOTICE: DISABLING 3D TRANSFORMS");
      }
      PKUI.CORE.useTransforms = true;
    }*/
  }

  if (device.platform == "WinCE")
  {
    if (PKUI.CORE.consoleLogging)
    {
      console.log("NOTICE: DISABLING 3D TRANSFORMS");
    }
    PKUI.CORE.useTransforms = false;
  }

}

/**
 *
 * Called on first-start and whenever the orientation changes. It updates the
 * body's class to reflect the device, formfactor, orientation, and scaling.
 *
 * @method updateOrientation
 * @static
 */
PKUI.CORE.updateOrientation = function()
{
  var curDevice;
  var curOrientation;
  var curFormFactor;
  var curScale;
  var curConvenience;

  curDevice = PKDEVICE.platform();
  curFormFactor = PKDEVICE.formFactor();
  curOrientation = PKDEVICE.isPortrait() ? "portrait" : "landscape";
  curScale = PKDEVICE.isRetina() ? "hiDPI" : "loDPI";
  curConvenience = "";
  if (PKDEVICE.iPad()) { curConvenience = "ipad"; }
  if (PKDEVICE.iPhone()) { curConvenience = "iphone"; }
  if (PKDEVICE.droidTablet()) { curConvenience = "droid-tablet"; }
  if (PKDEVICE.droidPhone()) { curConvenience = "droid-phone"; }

  document.body.setAttribute("class", curDevice + " " + curFormFactor + " " + curOrientation + " " + curScale + " " + curConvenience);
}

/*
 * Debugging aid. Displays the view stack as well as marking the current view.
 * Renders like this:
 *
 *    VIEW STACK DUMP as of 12:36:12
 *      An optional message
 *        [0]: (H) testView0
 *        [1]: (H) testView1
 *        [2]: (H) testView2
 *        [3]: (V) testView3 =CURRENT=
 *    END VIEW STACK DUMP
 *
 * (H) = hidden; (V) = visible; =CURRENT= = the top view on the stack
 *
 * @method dumpViewStack
 * @static
 * @param msg {String} a string to display
 */
PKUI.CORE.dumpViewStack = function( msg )
{
  console.log ("VIEW STACK DUMP as of " + (__D((new Date()),"hh:mm:ss")));

  if (msg) { console.log ("  " + msg); }

  for (var view in PKUI.CORE.viewStack)
  {
    console.log ( "    [" + view + "]: " +
                  (PKUI.CORE.viewStack[view].style.display == "block" ? "(V) " : "(H) ") +
                  "{ " + PKUI.CORE.viewStack[view].style.left + " " +
                  PKUI.CORE.viewStack[view].style.maxWidth + " } " +
                  PKUI.CORE.viewStack[view].getAttribute("id") +
                  (PKUI.CORE.currentView === PKUI.CORE.viewStack[view] ? " =CURRENT= " : "")
                );
  }

  console.log ("END VIEW STACK DUMP");
}

/*
 * Calculate the width of the visible views
 *
 * @method visibleViewsWidth
 * @static
 * @returns {Number} the width of all the visible views
 */
PKUI.CORE.visibleViewsWidth = function ()
{
  var totalWidth = 0;
  for (var view in PKUI.CORE.viewStack)
  {
    if (PKUI.CORE.viewStack[view].style.display == "block")
    {
      if (PKUI.CORE.viewStack[view]._columnWidth)
      {
        totalWidth += PKUI.CORE.viewStack[view]._columnWidth;
      }
      else
      {
        totalWidth += 320;
      }
    }
  }
  return totalWidth;
}

/**
 *
 * Shows a view and pushes it on the viewStack. NO ANIMATION.
 * DOES NOT PROPERLY CALL viewWillHide/viewDidHide of any view, since there
 * may be no view visible.
 *
 * @method showView
 * @static
 * @param theView {Object} the view to display
 *
 */
PKUI.CORE.showView = function(theView)
{
  PKUI.CORE.dumpViewStack ("before showView of " + theView.getAttribute("id"));
  PKUI.CORE.viewStack.push(theView);
  PKUI.CORE.currentView = theView;

  if (theView.viewWillAppear)
  {
    theView.viewWillAppear();
  }

  theView.style.display = "block";

  if (theView.viewDidAppear)
  {
    theView.viewDidAppear();
  }
  PKUI.CORE.dumpViewStack ("after showView of " + theView.getAttribute("id"));

}
/**
 *
 * Hides a view and pops it off the viewStack. NO ANIMATION.
 * DOES NOT ATTEMPT TO CALL viewWillShow or viewDidShow of any view
 * on the stack, as there may not be any view visible.
 *
 * @method hideView
 * @static
 * @param theView {Object} the view to hide
 */
PKUI.CORE.hideView = function(theView)
{
  PKUI.CORE.dumpViewStack ("before hideView of " + theView.getAttribute("id"));

  PKUI.CORE.currentView = PKUI.CORE.viewStack.pop();
  if (theView.viewWillHide)
  {
    theView.viewWillHide();
  }
  theView.style.display = "none";
  if (theView.viewDidHide)
  {
    theView.viewDidHide();
  }

  PKUI.CORE.dumpViewStack ("after hideView of " + theView.getAttribute("id"));

}

/**
 *
 * Swaps a view on the stack with the desired view. NO ANIMATION.
 *
 * @method swapView
 * @static
 * @param theView {Object} the view to swap (with the current view)
 */
PKUI.CORE.swapView = function (theView)
{
  PKUI.CORE.dumpViewStack ("before swapView of " + theView.getAttribute("id"));

  if (PKUI.CORE.viewHandlingMethod !== "fullscreen")
  {
    if (PKUI.CORE.viewHandlingMethod === "column")
    {
      PKUI.CORE.popColumnView();
      PKUI.CORE.pushColumnView(theView);
      PKUI.CORE.dumpViewStack ("after swapView of " + theView.getAttribute("id"));
      return;
    }
  }


  var theViewHiding = PKUI.CORE.viewStack.pop();
  var theViewShowing = theView;
  PKUI.CORE.currentView = theViewShowing;

  if (theViewHiding.viewWillHide)    { theViewHiding.viewWillHide(); }
  if (theViewShowing.viewWillAppear) { theViewShowing.viewWillAppear(); }

  theViewHiding.style.display = "none";
  theViewShowing.style.display = "block";
  theViewShowing.style.webkitTransform = "translate3d(0,0,0)";


  PKUI.CORE.viewStack.push(theViewShowing);

  if (theViewShowing.viewDidAppear) { theViewShowing.viewDidAppear(); }
  if (theViewHiding.viewDidHide)    { theViewHiding.viewDidHide(); }

  PKUI.CORE.dumpViewStack ("after swapView of " + theView.getAttribute("id"));

}

/**
 * @method jsaPush
 * @static
 * @deprecated
 */
PKUI.CORE.jsaPush = function(theViewHiding, theViewShowing, duration)
{
  var theStartTime = (new Date()).getTime();

  var theAnimationID = setInterval(function()
  {
    var theCurrentTime = (new Date()).getTime();
    var theDelta = theCurrentTime - theStartTime;
    // #ms between start and now
    var theProgress = (theDelta / duration) * 100;

    if (theProgress > 100)
    {
      theProgress = 100;
      clearInterval(theAnimationID);
      // we're done animating.
      return;
    }

    theViewHiding.style.left = "" + (-theProgress) + "%";
    theViewHiding.style.right = "" + (theProgress) + "%";

    theViewShowing.style.left = "" + (100 - theProgress) + "%";
    theViewShowing.style.right = "" + (-(100 - theProgress)) + "%";
 
  }, PKUI.CORE.jsaInterval);
}

/**
 * @method jsaPop
 * @static
 * @deprecated
 */
PKUI.CORE.jsaPop = function(theViewHiding, theViewShowing, duration)
{
  var theStartTime = (new Date()).getTime();

  var theAnimationID = setInterval(function()
  {
    var theCurrentTime = (new Date()).getTime();
    var theDelta = theCurrentTime - theStartTime;
    // #ms between start and now
    var theProgress = 100 - ((theDelta / duration) * 100);

    if (theProgress < 0)
    {
      theProgress = 0;
      clearInterval(theAnimationID);
      // we're done animating.
      return;
    }
    theViewShowing.style.left = "" + (-theProgress) + "%";
    theViewShowing.style.right = "" + (theProgress) + "%";

    theViewHiding.style.left = "" + (100 - theProgress) + "%";
    theViewHiding.style.right = "" + (-(100 - theProgress)) + "%";
  }, PKUI.CORE.jsaInterval);
}

/**
 * Pushes a view onto the stack, and renders it as a column. Intended
 * only to be used if the `viewHandlingMethod` property is `column`.
 * 
 * @method pushColumnView
 * @private
 * @static
 * @param theView {Object} the view to push
 */
PKUI.CORE.pushColumnView = function (theView)
{
  theView.style.maxWidth = "" + (theView._columnWidth || 320) + "px";
  theView.style.minWidth = "" + (theView._columnWidth || 320) + "px";
  theView.style.left = "" + PKUI.CORE.visibleViewsWidth() + "px";
  theView.style.display = "block";
  theView.style.zIndex = PKUI.CORE.viewStack.length+1;

  if (theView.viewWillAppear) { theView.viewWillAppear(); }
  if (theView.viewDidAppear)  { theView.viewDidAppear(); }

  PKUI.CORE.viewStack.push (theView);
  PKUI.CORE.currentView = theView;

  theView.parentElement.scrollLeft = PKUI.CORE.visibleViewsWidth();

  PKUI.CORE.dumpViewStack ( "after pushColumnView of " + theView.getAttribute("id") );

}

/**
 * Pops the view off the stack. Intended
 * only to be used if the `viewHandlingMethod` property is `column`.
 * 
 * @method popColumnView
 * @private
 * @static
 * @param [theView=null] {Object} the view to pop
 */
PKUI.CORE.popColumnView = function (theView)
{
  // if theView is null, we assume the last view on the stack
  var theViewToPop = theView || PKUI.CORE.currentView;
  var theIndex = -1;
  theViewToPop.style.display = "none";

  for (var i=0; i<PKUI.CORE.viewStack.length; i++)
  {
    if (PKUI.CORE.viewStack[i] === theViewToPop)
    {
       theIndex = i;
    }
  }

  if (theIndex > -1)
  {
    PKUI.CORE.viewStack.splice( theIndex, 1);
  }

  if (theIndex < PKUI.CORE.viewStack.length)
  {
    PKUI.CORE.currentView = PKUI.CORE.viewStack[theIndex];
  }
  else
  {
    if (theIndex-1 > -1)
    {
      PKUI.CORE.currentView = PKUI.CORE.viewStack[theIndex-1];
    }
    else
    {
      PKUI.CORE.currentView = null;
    }
  }

  var theNewLeft = 0;
  for (i=0; i<PKUI.CORE.viewStack.length; i++)
  {
    PKUI.CORE.viewStack[i].style.left = "" + theNewLeft + "px";
    PKUI.CORE.viewStack[i].style.zIndex = i;
    theNewLeft += ( PKUI.CORE.viewStack[i]._columnWidth || 320 );
  }

  if (theViewToPop.viewWillHide) { theViewToPop.viewWillHide(); }
  if (theViewToPop.viewDidHide) { theViewToPop.viewDidHide(); }

  theViewToPop.parentElement.scrollLeft = PKUI.CORE.visibleViewsWidth();

  PKUI.CORE.dumpViewStack ( "after popColumnView of " + theViewToPop.getAttribute("id") );

}

/**
 * Pops to a specific view without animation.
 * 
 * @method popToView
 * @static
 * @param theView {Object} the view to pop to.
 */
PKUI.CORE.popToView = function (theView)
{
  var theViewIndex = 0;
  for (var i=0; i<PKUI.CORE.viewStack.length; i++)
  {
    if (PKUI.CORE.viewStack[i] === theView)
    {
      theViewIndex = i;
    }
  }
  for (i=PKUI.CORE.viewStack.length-1;i>theViewIndex;i--)
  {
    PKUI.CORE.viewStack[i].style.display = "none";
    if (PKUI.CORE.viewStack[i].viewWillHide) { PKUI.CORE.viewStack[i].viewWillHide(); }
    if (PKUI.CORE.viewStack[i].viewDidHide) { PKUI.CORE.viewStack[i].viewDidHide(); }
  }
  PKUI.CORE.viewStack.splice( theViewIndex+1, PKUI.CORE.viewStack.length-theViewIndex-1 );
  PKUI.CORE.currentView = PKUI.CORE.viewStack[PKUI.CORE.viewStack.length-1];

  PKUI.CORE.dumpViewStack ("after popToView");
}

/**
 *
 * Shows a view WITH ANIMATION and pushes it onto the view stack.
 * The animation is a slide from right to left.
 *
 * @method pushView
 * @static
 * @param theView {Object} the view to push
 */
PKUI.CORE.pushView = function(theView)
{
  PKUI.CORE.dumpViewStack ("before pushView of " + theView.getAttribute("id"));
  // tell theView we're going to appear

  if (PKUI.CORE.consoleLogging)
  {
    console.log("Pushing View: " + theView.getAttribute("id"));
  }

  var theViewHiding = PKUI.CORE.currentView;
  var theViewShowing = theView;

  if (theViewShowing == theViewHiding)
  {
    console.log ("Pushing the same view!");
    return;
  }

  if (PKUI.CORE.viewHandlingMethod !== "fullscreen")
  {
    if (PKUI.CORE.viewHandlingMethod === "column")
    {
      PKUI.CORE.pushColumnView ( theView );
      return;
    }
  }

  if (!PKUI.CORE.animate)
  {
    $ge("preventClicks").style.display = "block";
    // switch views with no fuss
    if (theViewHiding.viewWillHide) { theViewHiding.viewWillHide(); }
    if (theViewShowing.viewWillAppear) { theViewShowing.viewWillAppear(); }
    theViewHiding.style.display = "none";
    theViewShowing.style.display = "block";
    if (theViewShowing.viewDidAppear) { theViewShowing.viewDidAppear(); }
    if (theViewHiding.viewDidHide) { theViewHiding.viewDidHide(); }

    PKUI.CORE.viewStack.push(theViewShowing);
    PKUI.CORE.currentView = theViewShowing;
    PKUI.CORE.dumpViewStack ("after pushView of " + theView.getAttribute("id"));
    PKUTIL.delay(500,function() { $ge("preventClicks").style.display = "none"; } );

    return;
  }

  $ge("preventClicks").style.display = "block"; // prevent clicking during animations

  if (PKUI.CORE.consoleLogging)
  {
    console.log("... the view hiding: " + theViewHiding.getAttribute("id"));
  }

  if (theViewHiding.viewWillHide)
  {
    theViewHiding.viewWillHide()
  }
  if (PKUI.CORE.consoleLogging)
  {
    console.log("... Called viewWillHide on hiding View"  + theViewHiding.getAttribute("id"));
  }

  if (theView.viewWillAppear)
  {
    theView.viewWillAppear();
  }
  if (PKUI.CORE.consoleLogging)
  {
    console.log("... Called viewWillAppear on showing View" + theViewShowing.getAttribute("id"));
  }

  theViewHiding.style.webkitTransform = "translate3d(0,0,0)";
  theViewShowing.style.webkitTransform = "translate3d(100%,0,0)";
  theViewShowing.style.display = "block";

  if (PKUI.CORE.consoleLogging)
  {
    console.log("... Animate in 100ms");
  }
  PKUTIL.delay(100, function()
  {
    // this is an animated push
    if (PKUI.CORE.consoleLogging)
    {
      console.log("... Start Animation");
    }
    if (PKUI.CORE.useTransforms)
    {
      theViewHiding.style.webkitTransition = "-webkit-transform 0.25s ease-in-out";
      theViewShowing.style.webkitTransition = "-webkit-transform 0.25s ease-in-out";
      theViewHiding.style.webkitTransform = "translate3d(-100%,0,0)";
      theViewShowing.style.webkitTransform = "translate3d(0,0,0)";

    } else
    { 
      PKUI.CORE.jsaPush(theViewHiding, theViewShowing, 250);
    }

    if (PKUI.CORE.consoleLogging)
    {
      console.log("... Cleanup Animation in 255ms");
    }
    PKUTIL.delay(261, function()
    {
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Cleaning up Animation");
      }
      
      theViewHiding.style.webkitTransition = "";
      theViewShowing.style.webkitTransition = "";

      theViewHiding.style.display = "none";
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Setting display none to " + theViewHiding.getAttribute("id"));
      }

      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Pushed view on stack" + theViewShowing.getAttribute("id"));
      }
      PKUI.CORE.viewStack.push(theViewShowing);
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... And current");
      }
      PKUI.CORE.currentView = theViewShowing;

      if (theViewHiding.viewDidHide)
      {
        theViewHiding.viewDidHide();
      }
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Called viewDidHide on hidden View"  + theViewHiding.getAttribute("id"));
      }
      if (theViewShowing.viewDidAppear)
      {
        theViewShowing.viewDidAppear();
      }
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Called viewDidAppear on shown View"  + theViewShowing.getAttribute("id"));
      }

      $ge("preventClicks").style.display = "none"; // prevent clicking during animations
      PKUI.CORE.dumpViewStack ("after pushView of " + theView.getAttribute("id"));

    });
  });
}
/**
 *
 * Hides a view WITH ANIMATION and pops it from the stack.
 *
 * @method popView
 * @static
 */
PKUI.CORE.popView = function()
{
  PKUI.CORE.dumpViewStack ("before popView");
  if (PKUI.CORE.consoleLogging)
  {
    console.log("Popping top view...");
  }

  if (!(PKUI.CORE.viewStack.length > 1))
  {
    if (PKUI.CORE.consoleLogging)
    {
      console.log("... There are NO views to pop!!!");
    }
    return;
    // nothing to pop.
  }


  if (PKUI.CORE.consoleLogging)
  {
    console.log("... There are views to pop");
  }

  var theViewHiding = PKUI.CORE.viewStack.pop();
  var theViewShowing = PKUI.CORE.viewStack.pop();

  if (PKUI.CORE.consoleLogging)
  {
    console.log("... The view to hide: " + theViewHiding.getAttribute("id"));
  }
  if (PKUI.CORE.consoleLogging)
  {
    console.log("... The view to show: " + theViewShowing.getAttribute("id"));
  }

  if (PKUI.CORE.viewHandlingMethod !== "fullscreen")
  {
    if (PKUI.CORE.viewHandlingMethod === "column")
    {
      PKUI.CORE.viewStack.push(theViewShowing);     
      PKUI.CORE.viewStack.push(theViewHiding);
      PKUI.CORE.popColumnView ( theViewHiding );
      return;
    }
  }

  if (!PKUI.CORE.animate)
  {
    $ge("preventClicks").style.display = "block"; // prevent clicking during animations
    // switch views with no fuss
    if (theViewHiding.viewWillHide) { theViewHiding.viewWillHide(); }
    if (theViewShowing.viewWillAppear) { theViewShowing.viewWillAppear(); }
    theViewHiding.style.display = "none";
    theViewShowing.style.display = "block";
    if (theViewShowing.viewDidAppear) { theViewShowing.viewDidAppear(); }
    if (theViewHiding.viewDidHide) { theViewHiding.viewDidHide(); }

    PKUI.CORE.currentView = theViewShowing;
    PKUI.CORE.viewStack.push(theViewShowing);
    PKUI.CORE.dumpViewStack ("after popView");

    PKUTIL.delay(500,function() { $ge("preventClicks").style.display = "none"; } );

    return;
  }
  $ge("preventClicks").style.display = "block"; // prevent clicking during animations

  if (theViewHiding.viewWillHide)
  {
    theViewHiding.viewWillHide();
  }
  if (PKUI.CORE.consoleLogging)
  {
    console.log("... Called viewWillHide on hiding View " + theViewHiding.getAttribute("id"));
  }

  if (theViewShowing.viewWillAppear)
  {
    theViewShowing.viewWillAppear();
  }
  if (PKUI.CORE.consoleLogging)
  {
    console.log("... Called viewWillAppear on showing View" + theViewShowing.getAttribute("id"));
  }

  theViewHiding.style.webkitTransform = "translate3d(0,0,0)";
  theViewShowing.style.webkitTransform = "translate3d(-100%,0,0)";
  theViewShowing.style.display = "block";
  if (PKUI.CORE.consoleLogging)
  {
    console.log("... Animating in 100ms");
  }

  PKUTIL.delay(100, function()
  {
    // this is an animated pop
    if (PKUI.CORE.consoleLogging)
    {
      console.log("... Animating out");
    }
    if (PKUI.CORE.consoleLogging)
    {
      console.log("... The view to hide: " + theViewHiding.getAttribute("id"));
    }
    if (PKUI.CORE.consoleLogging)
    {
      console.log("... The view to show: " + theViewShowing.getAttribute("id"));
    }

    if (PKUI.CORE.useTransforms)
    {
      theViewHiding.style.webkitTransition = "-webkit-transform 0.250s ease-in-out";
      theViewShowing.style.webkitTransition = "-webkit-transform 0.250s ease-in-out";
      theViewHiding.style.webkitTransform = "translate3d(100%,0,0)";
      theViewShowing.style.webkitTransform = "translate3d(0,0,0)";

    } else
    {
      PKUI.CORE.jsaPop(theViewHiding, theViewShowing, 250);
    }

    if (PKUI.CORE.consoleLogging)
    {
      console.log("... Animation cleanup in 255ms");
    }

    PKUTIL.delay(261, function()
    {
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Cleaning up animation");
      }
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... The view to hide: " + theViewHiding.getAttribute("id"));
      }
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... The view to show: " + theViewShowing.getAttribute("id"));
      }

      theViewHiding.style.webkitTransition = "";
      theViewShowing.style.webkitTransition = "";

      theViewHiding.style.msTransition = "";
      theViewShowing.style.msTransition = "";
 
      theViewHiding.style.display = "none";
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Set display none to the hiding element" + theViewHiding.getAttribute("id"));
      }

      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Current view is showing view" + theViewShowing.getAttribute("id"));
      }
      PKUI.CORE.currentView = theViewShowing;
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... And pushed to viewStack");
      }
      PKUI.CORE.viewStack.push(theViewShowing);

      if (theViewHiding.viewDidHide)
      {
        theViewHiding.viewDidHide();
      }
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Called viewDidHide " + theViewHiding.getAttribute("id"));
      }
      if (theViewShowing.viewDidAppear)
      {
        theViewShowing.viewDidAppear();
      }
      if (PKUI.CORE.consoleLogging)
      {
        console.log("... Called viewDidAppear " + theViewShowing.getAttribute("id"));
      }

      $ge("preventClicks").style.display = "none";
      PKUI.CORE.dumpViewStack ("after popView");

    });
  });
}

/*
 * WP7 doesn't do touch events, so translate to equivalent mouse events.
 *
 *   touchstart = mousedown
 *   touchmove  = mousemove
 *   touchend   = mouseup
 *
 * @method translateWindowsEvents
 * @static
 * @private
 * @param theEvent {DOMEvent}
 */
PKUI.CORE.translateWindowsEvents = function(theEvent)
{
  var theTranslatedEvent = theEvent;
  if (!theTranslatedEvent) { return theTranslatedEvent; }
  var nonTouchPlatform = ( PKDEVICE.platform() == "wince" || PKDEVICE.platform() == "unknown" );
  if (nonTouchPlatform && theTranslatedEvent.toLowerCase().indexOf("touch") > -1 )
  {
    theTranslatedEvent = theTranslatedEvent.replace("touch", "mouse");
    theTranslatedEvent = theTranslatedEvent.replace("start", "down");
    theTranslatedEvent = theTranslatedEvent.replace("end", "up");
  }
  return theTranslatedEvent;
}

/*
 * Adds a touch listener to theElement, converting touch events for WP7.
 *
 * @method addTouchListener
 * @static
 * @param theElement {DOMElement} the element to attach the event to
 * @param theEvent {String} the event to handle
 * @param theFunction {Function} the function to call when the event is fired
 *
 */
PKUI.CORE.addTouchListener = function(theElement, theEvent, theFunction)
{
  var theTranslatedEvent = PKUI.CORE.translateWindowsEvents(theEvent.toLowerCase());
  theElement.addEventListener(theTranslatedEvent, theFunction, false);
}

/*
 * Removes a touch listener added by addTouchListener
 *
 * @method removeTouchListener
 * @static
 * @param theElement {DOMElement} the element to remove an event from
 * @param theEvent {String} the event to remove
 * @param theFunction {Function} the function to remove
 *
 */
PKUI.CORE.removeTouchListener = function(theElement, theEvent, theFunction)
{
  var theTranslatedEvent = PKUI.CORE.translateWindowsEvents(theEvent.toLowerCase());
  theElement.removeEventListener(theTranslatedEvent, theFunction);
}

/*
 * Cancels the event in just about every cross-platform way imaginable.
 *
 * @method cancelEvent
 * @static
 * @param theEvent {DOMEvent} the event to cancel
 */
PKUI.CORE.cancelEvent = function(theEvent)
{
  if (!theEvent)
  {
    theEvent = window.event;
  }
  if (theEvent.stopPropagation)
  {
    theEvent.stopPropagation();
  }
  if (theEvent.cancelBubble)
  {
    theEvent.cancelBubble();
  }
  if (theEvent.preventDefault)
  {
    theEvent.preventDefault();
  } else
  {
    theEvent.returnValue = false;
  }
}

/**
 *
 * Applies touch listeners to various items in the dom.
 *
 * In this version of the framework, we apply it to BUTTONs and Anchors.
 *
 * @method applyTouchListeners
 * @static
 */
PKUI.CORE.applyTouchListeners = function()
{
  // things with hover states do funny things, like buttons and anchors.
  // let's deal with them
  var theNodes = Array();
  theNodes = theNodes.concat(document.getElementsByTagName("button"), document.getElementsByTagName("a"));

  // theNodes is an array like [ NodeList[5], NodeList[1], NodeList[0]... ]
  for (var n = 0; n < theNodes.length; n++)
  {
    var theTags = theNodes[n];
    for (var i = 0; i < theTags.length; i++)
    {
      var theItem = theTags[i];
      if (!theItem.touchListenersApplied)
      {
        PKUI.CORE.addTouchListener(theItem, "touchstart", function()
        {
          this.oldClassName = this.className;
          this.className += " touched";
        });
        PKUI.CORE.addTouchListener(theItem, "touchend", function()
        {
          if (this.oldClassName !== undefined)
          {
            this.className = this.oldClassName;
          } else
          {
            this.className = "";
          }
        });
        theItem.touchListenersApplied = "YES";
      }
    }
  }
}

/*
 * for platforms that support it,
 * hide the splash screen when called.
 *
 * @method hideSplash
 * @static
 */
PKUI.CORE.hideSplash = function ()
{
  cordova.exec(null, null, "SplashScreen", "hide", []);
}

// fire off applyTouchListeners every so often.
if (PKUI.CORE.listenerInterval !== 0)
{
  setInterval(PKUI.CORE.applyTouchListeners, PKUI.CORE.listenerInterval);
}


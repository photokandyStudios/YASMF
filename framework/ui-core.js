/*jshint asi:true, forin:true, noarg:true, noempty:true, eqeqeq:false, bitwise:true, undef:true, curly:true, browser:true, devel:true, smarttabs:true, maxerr:50 */
// REQUIRES: utility.js
// REQUIRES: device.js

/******************************************************************************
 *
 * UI-CORE
 * Author: Kerri Shotts
 *
 * This script provides a lot of the core user interface framework, such as
 * loading content via AJAX, transitions, and more.
 *
 ******************************************************************************/

var PKUI = PKUI || {};  // create the namespace

PKUI.CORE = PKUI.CORE || {} // create the CORE space
PKUI.CORE.TABBAR = PKUI.CORE.TABBAR || {};


//
// Properties
//
PKUI.CORE.consoleLogging = false;      // If TRUE, we'll write UI logs out to the console.
PKUI.CORE.viewStack = Array();        // Contains the view stack
PKUI.CORE.currentView = null;         // Points at the /current/ view
PKUI.CORE.useTransforms = true;      // animation; if true, uses 3D transforms
PKUI.CORE.jsaInterval = 16;

//
// Methods
//

/**
 *
 * Initializes the application framework
 *  - in this version of the framework, we force an orientation update.
 *
 */
PKUI.CORE.initializeApplication = function ()
{
    
    // check (and update) our current device orientation
    PKUI.CORE.updateOrientation();
    
    // add the event listener...
    window.addEventListener ( 'orientationchange', PKUI.CORE.updateOrientation, false );

    // determine if we should use 3D transforms for animation or not
    if (device.platform == "Android")
    {
      if ( parseInt( device.version.substr(0,2) ) < 3 )
      {
        if (PKUI.CORE.consoleLogging) { console.log ("NOTICE: DISABLING 3D TRANSFORMS"); }
        PKUI.CORE.useTransforms = false;
      }
    }
    
    if (device.platform == "WinCE")
    {
      if (PKUI.CORE.consoleLogging) { console.log ("NOTICE: DISABLING 3D TRANSFORMS"); }
      PKUI.CORE.useTransforms = false;
    }

	// better logging
	/*console._log = console.log;
	console.log = function ()
	{
	    console._log ("Logged on " + (new Date()).getTime() + ": ", JSON.stringify(arguments));
	}    */
}

/**
 *
 * Called on first-start and whenever the orientation changes. It updates the
 * body's class to reflect the device, formfactor, orientation, and scaling.
 *
 */
PKUI.CORE.updateOrientation = function()
{
  var curDevice;
  var curOrientation;
  var curFormFactor;
  
  curDevice = PKDEVICE.platform();
  curFormFactor = PKDEVICE.formFactor();
  curOrientation = PKDEVICE.isPortrait() ? "portrait" : "landscape";
  curScale = PKDEVICE.isRetina() ? "hiDPI" : "loDPI";
  
  document.body.setAttribute("class", curDevice + " " + curFormFactor + " " + curOrientation + " " + curScale);  
}

/**
 *
 * Shows a view and pushes it on the viewStack. NO ANIMATION.
 *
 */
PKUI.CORE.showView = function ( theView )
{
  PKUI.CORE.viewStack.push (theView);
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
  
}

/**
 *
 * Hides a view and pops it off the viewStack. NO ANIMATION.
 *
 */
PKUI.CORE.hideView = function ( theView )
{
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
}

PKUI.CORE.jsaPush = function ( theViewHiding, theViewShowing, duration )
{
  var theStartTime = (new Date()).getTime();

  var theAnimationID = setInterval ( function()
                                     {
                                       var theCurrentTime = (new Date()).getTime();
                                       var theDelta = theCurrentTime - theStartTime; // #ms between start and now
                                       var theProgress = (theDelta / duration) * 100;
                                       
                                       if (theProgress > 100)
                                       {
                                         theProgress == 100;
                                         clearInterval (theAnimationID); // we're done animating.
                                         return;
                                       }
                                       
                                       theViewHiding.style.left = "" + (-theProgress) + "%";
                                       theViewHiding.style.right = "" + (theProgress) + "%";
                                       
                                       theViewShowing.style.left = "" + (100-theProgress) + "%";
                                       theViewShowing.style.right = "" + (-(100-theProgress)) + "%";
                                     }, PKUI.CORE.jsaInterval );
}

PKUI.CORE.jsaPop = function ( theViewHiding, theViewShowing, duration )
{
  var theStartTime = (new Date()).getTime();

  var theAnimationID = setInterval ( function()
                                     {
                                       var theCurrentTime = (new Date()).getTime();
                                       var theDelta = theCurrentTime - theStartTime; // #ms between start and now
                                       var theProgress = 100 - ((theDelta / duration) * 100);
                                       
                                       if (theProgress < 0)
                                       {
                                         theProgress = 0;
                                         clearInterval (theAnimationID); // we're done animating.
                                         return;
                                       }
                                       
                                       theViewShowing.style.left = "" + (-theProgress) + "%";
                                       theViewShowing.style.right = "" + (theProgress) + "%";
                                       
                                       theViewHiding.style.left = "" + (100-theProgress) + "%";
                                       theViewHiding.style.right = "" + (-(100-theProgress)) + "%";
                                     }, PKUI.CORE.jsaInterval );
}


/**
 *
 * Shows a view WITH ANIMATION and pushes it onto the view stack.
 * The animation is a slide from right to left.
 *
 */
PKUI.CORE.pushView = function ( theView )
{
  // tell theView we're going to appear
  
  if (PKUI.CORE.consoleLogging) { console.log ("Pushing View: " + theView.getAttribute("id")); }
  
  var theViewHiding = PKUI.CORE.currentView;
  var theViewShowing = theView;

  if (PKUI.CORE.consoleLogging) { console.log ("... the view hiding: " + theViewHiding.getAttribute("id")); }
  
  if (theViewHiding.viewWillHide)
  {
    theViewHiding.viewWillHide()
  }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewWillHide on hiding View"); }

  if (theView.viewWillAppear)
  {
    theView.viewWillAppear();
  }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewWillAppear on showing View"); }

  theViewHiding.style.left = "0%";
  theViewHiding.style.right = "0%";
  
  theViewShowing.style.left = "100%";
  theViewShowing.style.right = "-100%";
  theViewShowing.style.display = "block";

  if (PKUI.CORE.consoleLogging) { console.log ("... Animate in 100ms"); }
  PKUTIL.delay ( 100, 
                 function () 
                 {
                  // this is an animated push
  if (PKUI.CORE.consoleLogging) { console.log ("... Start Animation"); }
                  if (PKUI.CORE.useTransforms)
                  {
                    theViewHiding.style.webkitTransition = "-webkit-transform 0.25s ease-in-out";  
                    theViewShowing.style.webkitTransition = "-webkit-transform 0.25s ease-in-out";  
                    theViewHiding.style.webkitTransform = "translate3d(-100%,0,0)";
                    theViewShowing.style.webkitTransform = "translate3d(-100%,0,0)";

                    theViewHiding.style.msTransition = "-ms-transform 0.25s ease-in-out";  
                    theViewShowing.style.msTransition = "-ms-transform 0.25s ease-in-out";  
                    theViewHiding.style.msTransform = "translate3d(-100%,0,0)";
                    theViewShowing.style.msTransform = "translate3d(-100%,0,0)";
                  }
                  else
                  {
                    PKUI.CORE.jsaPush ( theViewHiding, theViewShowing, 250 );
                  }

  if (PKUI.CORE.consoleLogging) { console.log ("... Cleanup Animation in 255ms"); }
                  PKUTIL.delay ( 261, 
                                 function ()
                                 {
  if (PKUI.CORE.consoleLogging) { console.log ("... Cleaning up Animation"); }
                                   theViewHiding.style.webkitTransition = "";
                                   theViewShowing.style.webkitTransition = "";

                                   theViewHiding.style.msTransition = "";
                                   theViewShowing.style.msTransition = "";

                                   theViewHiding.style.display = "none";
  if (PKUI.CORE.consoleLogging) { console.log ("... Setting display none to " + theViewHiding.getAttribute("id")); }
                                   
                                   if (PKUI.CORE.useTransforms)
                                   {
                                     theViewHiding.style.webkitTransform = "translate3d(0,0,0)";
                                     theViewShowing.style.webkitTransform = "translate3d(0,0,0)";
                                   
                                     theViewHiding.style.msTransform = "translate3d(0,0,0)";
                                     theViewShowing.style.msTransform = "translate3d(0,0,0)";
                                   }

                                   theViewShowing.style.left = "0";
                                   theViewShowing.style.right = "0";

  if (PKUI.CORE.consoleLogging) { console.log ("... Pushed view on stack"); }
                                   PKUI.CORE.viewStack.push (theViewShowing);
  if (PKUI.CORE.consoleLogging) { console.log ("... And current"); }
                                   PKUI.CORE.currentView = theViewShowing;

                                   if (theViewHiding.viewDidHide)
                                   {
                                     theViewHiding.viewDidHide();
                                   }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewDidHide on hidden View"); }
                                   if (theViewShowing.viewDidAppear)
                                   {
                                     theViewShowing.viewDidAppear();
                                   }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewDidAppear on shown View"); }
                                 }
                               );
                 }
                );
}


/**
 *
 * Hides a view WITH ANIMATION and pops it from the stack.
 *
 */
PKUI.CORE.popView = function ()
{
  if (PKUI.CORE.consoleLogging) { console.log ("Popping top view..."); }

  if (!(PKUI.CORE.viewStack.length > 1) )
  {
  if (PKUI.CORE.consoleLogging) { console.log ("... There are NO views to pop!!!"); }
     return; // nothing to pop.
  }
  if (PKUI.CORE.consoleLogging) { console.log ("... There are views top pop"); }

  var theViewHiding = PKUI.CORE.viewStack.pop();
  var theViewShowing = PKUI.CORE.viewStack.pop();

  if (PKUI.CORE.consoleLogging) { console.log ("... The view to hide: " + theViewHiding.getAttribute("id")); }
  if (PKUI.CORE.consoleLogging) { console.log ("... The view to show: " + theViewShowing.getAttribute("id")); }

  if (theViewHiding.viewWillHide)
  {
    theViewHiding.viewWillHide();
  }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewWillHide on hiding View"); }

  if (theViewShowing.viewWillAppear)
  {
    theViewShowing.viewWillAppear();
  }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewWillAppear on showing View"); }


  theViewHiding.style.left = "0%";
  theViewHiding.style.right = "0%";
  
  theViewShowing.style.left = "-100%";
  theViewShowing.style.right = "100%";
  theViewShowing.style.display = "block";
  if (PKUI.CORE.consoleLogging) { console.log ("... Animating in 100ms"); }
  
 

  PKUTIL.delay ( 100, 
                 function () 
                 {
                  // this is an animated pop
  if (PKUI.CORE.consoleLogging) { console.log ("... Animating out"); }
  if (PKUI.CORE.consoleLogging) { console.log ("... The view to hide: " + theViewHiding.getAttribute("id")); }
  if (PKUI.CORE.consoleLogging) { console.log ("... The view to show: " + theViewShowing.getAttribute("id")); }

                  if (PKUI.CORE.useTransforms)
                  {
                    theViewHiding.style.webkitTransition = "-webkit-transform 0.250s ease-in-out";  
                    theViewShowing.style.webkitTransition = "-webkit-transform 0.250s ease-in-out";  
                    theViewHiding.style.webkitTransform = "translate3d(100%,0,0)";
                    theViewShowing.style.webkitTransform = "translate3d(100%,0,0)";

                    theViewHiding.style.msTransition = "-ms-transform 0.250s ease-in-out";  
                    theViewShowing.style.msTransition = "-ms-transform 0.250s ease-in-out";  
                    theViewHiding.style.msTransform = "translate3d(100%,0,0)";
                    theViewShowing.style.msTransform = "translate3d(100%,0,0)";
                  }
                  else
                  {
                    PKUI.CORE.jsaPop ( theViewHiding, theViewShowing, 250 );
                  }

  if (PKUI.CORE.consoleLogging) { console.log ("... Animation cleanup in 255ms"); }

                  PKUTIL.delay ( 261, 
                                 function ()
                                 {
  if (PKUI.CORE.consoleLogging) { console.log ("... Cleaning up animation"); }
  if (PKUI.CORE.consoleLogging) { console.log ("... The view to hide: " + theViewHiding.getAttribute("id")); }
  if (PKUI.CORE.consoleLogging) { console.log ("... The view to show: " + theViewShowing.getAttribute("id")); }
  
                                   theViewHiding.style.webkitTransition = "";
                                   theViewShowing.style.webkitTransition = "";

                                   theViewHiding.style.msTransition = "";
                                   theViewShowing.style.msTransition = "";

                                   theViewHiding.style.display = "none";
  if (PKUI.CORE.consoleLogging) { console.log ("... Set display none to the hiding element"); }
                                   
                                   if (PKUI.CORE.useTransforms)
                                   {
                                     theViewHiding.style.webkitTransform = "translate3d(0,0,0)";
                                     theViewShowing.style.webkitTransform = "translate3d(0,0,0)";

                                     theViewHiding.style.msTransform = "translate3d(0,0,0)";
                                     theViewShowing.style.msTransform = "translate3d(0,0,0)";
                                   }
                                   
                                   theViewShowing.style.left = "0";
                                   theViewShowing.style.right = "0";

  if (PKUI.CORE.consoleLogging) { console.log ("... Current view is showing view"); }
                                   PKUI.CORE.currentView = theViewShowing;
  if (PKUI.CORE.consoleLogging) { console.log ("... And pushed to viewStack"); }
                                   PKUI.CORE.viewStack.push ( theViewShowing);

                                   if (theViewHiding.viewDidHide)
                                   {
                                     theViewHiding.viewDidHide();
                                   }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewDidHide"); }
                                   if (theViewShowing.viewDidAppear)
                                   {
                                     theViewShowing.viewDidAppear();
                                   }
  if (PKUI.CORE.consoleLogging) { console.log ("... Called viewDidAppear"); }
                                 }
                               );
                 }
                );
}

PKUI.CORE.translateWindowsEvents = function ( theEvent )
{
    var theTranslatedEvent = theEvent;
	if (device.platform=="WinCE")
	{
	    theTranslatedEvent = theTranslatedEvent.replace ("touch", "mouse");
		theTranslatedEvent = theTranslatedEvent.replace ("start", "down" );
		theTranslatedEvent = theTranslatedEvent.replace ("end"  , "up"   );
	}
	return theTranslatedEvent;
}

PKUI.CORE.addTouchListener = function ( theElement, theEvent, theFunction )
{
    var theTranslatedEvent = PKUI.CORE.translateWindowsEvents(theEvent.toLowerCase());
	theElement.addEventListener ( theTranslatedEvent, theFunction, false );
}

PKUI.CORE.removeTouchListener = function ( theElement, theEvent, theFunction )
{
    var theTranslatedEvent = PKUI.CORE.translateWindowsEvents(theEvent.toLowerCase());
	theElement.removeEventListener ( theTranslatedEvent, theFunction );
}


/**
 *
 * Applies touch listeners to various items in the dom.
 *
 * In this version of the framework, we apply it to BUTTONs.
 *
 */
PKUI.CORE.applyTouchListeners = function ()
{
  // things with hover states do funny things, like buttons and anchors.
  // let's deal with them
  var theNodes = Array();
  theNodes = theNodes.concat ( document.getElementsByTagName ("button"),
                               document.getElementsByTagName ("a") 
                             );
  
  // theNodes is an array like [ NodeList[5], NodeList[1], NodeList[0]... ]
  for (var n=0;n<theNodes.length;n++)
  {
      var theTags = theNodes[n];
      for (var i=0;i<theTags.length;i++)
      {
        var theItem = theTags[i];
        if (!theItem.touchListenersApplied)
        {
            PKUI.CORE.addTouchListener ( theItem, "touchstart", function ()
                                         {
                                             this.oldClassName = this.className;
                                             this.className += " touched";
                                         }
                                       );
            PKUI.CORE.addTouchListener ( theItem, "touchend", function ()
                                         {
                                             if (this.oldClassName != undefined)
                                             {
                                                 this.className = this.oldClassName;
                                             }
                                             else
                                             {
                                                 this.className = "";
                                             }
                                         }
                                       );
            theItem.touchListenersApplied = "YES"; 
        }
      }
  }
}

// fire off applyTouchListeners every 100ms.
setInterval ( PKUI.CORE.applyTouchListeners, 100 );


/******************************************************************************
 *
 * UI-BASE
 * Author: Kerri Shotts
 * Version: 0.3
 *
 * This provides the basics of the UI model, including poings, rects, and more.
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
/*global PKUTIL, PKDEVICE */
PKUTIL.require ( ["PKUTIL", "PKDEVICE"], function () 
{ 
    PKUTIL.export ( [ "UI", "UI.COLOR", "UI.FONT", "UI.SHADOW" ] );
});

var UI = UI || {};
UI.version = { major: 0, minor: 3, rev: 100 };

/**
 *
 * Points are of the form { x: #, y: # }
 *
 */
UI.makePoint = function ( x, y )
{
    return { x: x, y: y };
};
UI.copyPoint = function ( point )
{
  return UI.makePoint ( point.x, point.y );
};
/**
 *
 * offsets a point by the values in another point. For example,
 * if pointA = { x:100, y:100 } and pointB = { x:-5, y:10 }, the
 * returned point will be { x:95, y:110 }.
 *
 */
UI.offsetPoint = function ( pointA, pointB )
{
  return UI.makePoint ( pointA.x + pointB.x, pointA.y + pointB.y );
};

/**
 *
 * Sizes are similar to points, but they are of the form
 * { w: width, h: height }
 *
 */
UI.makeSize = function ( w, h )
{
    return { w: w, h: h };
};
UI.makeSizeFromPoint = function ( point )
{
  return { w: point.x, h: point.y };
}
UI.sizeFromRect = function (rect)
{
  return { w: rect.size.w, h: rect.size.h };
}
UI.copySize = function ( size )
{
  return UI.makeSize ( size.w, size.h );
};
UI.offsetSize = function ( sizeA, sizeB )
{
  return UI.makeSize ( sizeA.w + sizeB.w, sizeA.h + sizeB.h );
};

/**
 *
 * Rects are of the form { origin: point, size: size }, or
 * { origin: {x: #, y: #}, size: {w: width, h: height} }
 *
 */
UI.makeRect = function ( origin, size )
{
    return { origin: { x: origin.x, y: origin.y },
            size: { w: size.w, h: size.h } };
};
UI.copyRect = function ( rect )
{
  return UI.makeRect ( rect.origin, rect.size );
};

/**
 *
 * Offsets a rect's origin point by the supplied point.
 *
 */
UI.offsetRectByPoint = function ( rectA, pointB )
{
  return UI.makeRect ( UI.offsetPoint (rectA.origin, pointB), rectA.size );
};

/**
 *
 * Offsets a rect's origin by the origin of the second rect,
 * and offsets the rect's size by the size of the second rect.
 *
 * This implies that the second rect does not need to be "real",
 * as in, it can have negative sizes and such.
 *
 */
UI.offsetRectByRect = function ( rectA, rectB )
{
  return UI.makeRect ( UI.offsetPoint (rectA.origin, rectB.origin), 
                       UI.offsetSize (rectA.size, rectB.size) );
};

/**
 *
 * Returns true if the two rects supplied intersect. Note that this
 * will not work if the rectangles are non-canonical.
 *
 */
UI.doRectsIntersect = function ( rectA, rectB )
{
  //http://codesam.blogspot.com/2011/02/check-if-two-rectangles-intersect.html
  var r1tlx = rectA.origin.x;
  var r2brx = rectB.origin.x + rectB.size.w;
  var r1brx = rectA.origin.x + rectA.size.w;
  var r2tlx = rectB.origin.x;
  var r1tly = rectA.origin.y;
  var r2bry = rectB.origin.y + rectB.size.h;
  var r1bry = rectA.origin.y + rectA.size.h;
  var r2tly = rectB.origin.y;
  // corrected for Y axis
  if ( r1tlx >= r2brx || r1brx <= r2tlx || r1tly >= r2bry || r1bry <= r2tly) 
  {
    return false;
  }
  return true;
};

/**
 *
 * Think of these as constants, except you have to call them like a 
 * method.
 *
 * zeroPoint() returns a point of {0,0}
 * zeroSize() returns a size of {0,0}
 * zeroRect() returns a rect of { {0,0}, {0,0} }
 * screenSize() returns a **point** representing the size of the screen (or browser).
 * screenBounds() returns a **rect** representing the size of the screen (with a {0,0} origin).
 *
 */
UI.zeroPoint = function () { return UI.makePoint ( 0, 0 ); };
UI.zeroSize = function () { return UI.makeSize ( 0, 0 ); };
UI.zeroRect = function () { return UI.makeRect ( UI.zeroPoint(), UI.zeroSize() ); };
UI.screenSize = function () { return UI.makeSize ( window.innerWidth, window.innerHeight ); };
UI.screenBounds = function () { return UI.makeRect ( UI.zeroPoint(), UI.screenSize() ); };

/**
 *
 * fonts
 *
 */

UI.makeFont = function ( theFontFamily, theFontSize, theFontWeight )
{
  return { family: theFontFamily,
             size: theFontSize,
           weight: theFontWeight || "normal"
         };
}
UI.copyFont = function ( theFont )
{
  return UI.makeFont ( theFont.family, theFont.size, theFont.weight );
}
UI.copyFontWithNewSize = function ( theFont, theNewSize )
{
  return UI.makeFont ( theFont.family, theNewSize, theFont.weight );
}
UI.copyFontWithNewSizeDelta = function ( theFont, theNewSizeDelta )
{
  return UI.makeFont ( theFont.family, theFont.size + theNewSizeDelta, theFont.weight );
}
UI.copyFontWithPercentSize = function ( theFont, theSizePercent )
{
  return UI.makeFont ( theFont.family, theFont.size * theSizePercent, theFont.weight );
}
UI._applyFontToElement = function ( theElement, theFont )
{
  if (theFont)
  {
    theElement.style.fontFamily = theFont.family;
    theElement.style.fontSize = "" + theFont.size + "px";
    theElement.style.fontWeight = theFont.weight;
  }
  else
  {
    theElement.style.fontFamily = "inherit";
    theElement.style.fontSize = "inherit";
    theElement.style.fontWeight = "inherit";
  }
}

UI.FONT = UI.FONT || {};
UI.FONT.systemFont = function ()
{
  var theCurrentPlatform = PKDEVICE.platform();
  switch (theCurrentPlatform)
  {
    case "ios": return UI.makeFont ( "Helvetica, Arial, sans-serif", 20, "normal" );
    case "android": return UI.makeFont ( "Roboto, Arial, sans-serif", 20, "normal" );
    case "wince": return UI.makeFont ( "Segoe, Arial, sans-serif", 20, "normal" );
    default: return UI.makeFont ( "sans-serif", 20, "normal" );
  }
}
UI.FONT.boldSystemFont = function ()
{
  var theSystemFont = UI.copyFont( UI.FONT.systemFont() );
  theSystemFont.weight = "bold";
  return theSystemFont;
}

/**
 *
 * Shadows
 *
 */
UI.makeShadow = function ( theVisibility, theColor, theOffset, theBlur )
{
  return { visible: theVisibility, color: UI.copyColor(theColor), offset: UI.copyPoint ( theOffset ), blur: theBlur || 0 };
}
UI.copyShadow = function ( theShadow )
{
  return UI.makeShadow ( theShadow.visible, theShadow.color, theShadow.offset, theShadow.blur );
}
UI._applyShadowToElement = function ( theElement, theShadow )
{
  if (theShadow)
  {
    if (theShadow.visible)
    {
      theElement.style.textShadow = "" + theShadow.offset.x + "px " +
                                         theShadow.offset.y + "px " +
                                         theShadow.blur + "px " +
                                         UI._colorToRGBA(theShadow.color) + "";
    }
    else
    {
      theElement.style.textShadow = "inherit";
    }
  }
  else
  {
    theElement.style.textShadow = "inherit";
  }    
}
UI.SHADOW = UI.SHADOW || {};
UI.SHADOW.defaultDarkShadow = function ()
{
  var theCurrentPlatform = PKDEVICE.platform();
  switch (theCurrentPlatform)
  {
    case "ios": return UI.makeShadow ( true, "rgba(0,0,0,0.25)", UI.makePoint( 0, -1), 0 );
    default: return UI.makeShadow ( false, "#000", UI.zeroPoint(), 0 );
  }
}
UI.SHADOW.defaultLightShadow = function ()
{
  var theCurrentPlatform = PKDEVICE.platform();
  switch (theCurrentPlatform)
  {
    case "ios": return UI.makeShadow ( true, "rgba(255,255,255,0.75)", UI.makePoint( 0, -1), 0 );
    default: return UI.makeShadow ( false, "#FFF", UI.zeroPoint(), 0 );
  }
}

/**
 *
 * Colors
 *
 */
UI._colorToRGBA = function ( theColor )
{
  if (!theColor)
  {
    return "inherit";
  }
  if (theColor.alpha !== 0)
  {
    return "rgba(" + theColor.red + "," + theColor.green + "," + theColor.blue + "," + theColor.alpha + ")";
  }
  else
  {
    return "transparent";
  }
}
UI.makeColor = function ( r, g, b, a )
{
  return { red: r, green: g, blue: b, alpha: a };
}
UI.copyColor = function (theColor)
{
  return UI.makeColor ( theColor.red, theColor.green, theColor.blue, theColor.alpha );
}
UI.COLOR = UI.COLOR || {};
UI.COLOR.blackColor     = function () { return UI.makeColor (   0,   0,   0, 1.0 ); }
UI.COLOR.darkGrayColor  = function () { return UI.makeColor (  85,  85,  85, 1.0 ); }
UI.COLOR.GrayColor      = function () { return UI.makeColor ( 127, 127, 127, 1.0 ); }
UI.COLOR.lightGrayColor = function () { return UI.makeColor ( 170, 170, 170, 1.0 ); }
UI.COLOR.whiteColor     = function () { return UI.makeColor ( 255, 255, 255, 1.0 ); }
UI.COLOR.blueColor      = function () { return UI.makeColor (   0,   0, 255, 1.0 ); }
UI.COLOR.greenColor     = function () { return UI.makeColor (   0, 255,   0, 1.0 ); }
UI.COLOR.redColor       = function () { return UI.makeColor ( 255,   0,   0, 1.0 ); }
UI.COLOR.cyanColor      = function () { return UI.makeColor (   0, 255, 255, 1.0 ); }
UI.COLOR.yellowColor    = function () { return UI.makeColor ( 255, 255,   0, 1.0 ); }
UI.COLOR.magentaColor   = function () { return UI.makeColor ( 255,   0, 255, 1.0 ); }
UI.COLOR.orangeColor    = function () { return UI.makeColor ( 255, 127,   0, 1.0 ); }
UI.COLOR.purpleColor    = function () { return UI.makeColor ( 127,   0, 127, 1.0 ); }
UI.COLOR.brownColor     = function () { return UI.makeColor ( 153, 102,  51, 1.0 ); }
UI.COLOR.lightTextColor = function () { return UI.makeColor ( 240, 240, 240, 1.0 ); }
UI.COLOR.darkTextColor  = function () { return UI.makeColor (  15,  15,  15, 1.0 ); }
UI.COLOR.clearColor     = function () { return UI.makeColor (   0,   0,   0, 0.0 ); }

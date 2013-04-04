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
UI.makeShadow = function ( theVisibility, theColor, theOffset, theBlur, theSpread, theType )
{
  return { visible: theVisibility, color: UI.copyColor(theColor), offset: UI.copyPoint ( theOffset ), 
           blur: theBlur || 0, spread: theSpread || 0, type: theType || "" };
}
UI.copyShadow = function ( theShadow )
{
  return UI.makeShadow ( theShadow.visible, theShadow.color, theShadow.offset, theShadow.blur, theShadow.spread, theShadow.type );
}
UI._applyShadowToElementAsTextShadow = function ( theElement, theShadow )
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
UI._shadowToBoxShadow = function (  theShadow )
{
  if (theShadow)
  {
    if (theShadow.visible)
    {
      return  "" +  theShadow.type + " " + theShadow.offset.x + "px " +
                                         theShadow.offset.y + "px " +
                                         theShadow.blur + "px " +
                                         theShadow.spread + "px " + 
                                         UI._colorToRGBA(theShadow.color) + "";
    }
    else
    {
      return  "inherit";
    }
  }
  else
  {
    return  "inherit";
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

/**
 *
 * Images
 *
 */

UI.makeImage = function ( thePathToTheImage, theImageSize, options )
{
  var theRatio = window.devicePixelRatio;
  var theNewImageSize = null
  if (theImageSize)
  {
    theNewImageSize = UI.copySize( theImageSize );
  }
  var aNewImage = { image: thePathToTheImage, 
                    imageSize : theNewImageSize,
                    targetSize: null,
                    repeat: options.repeat || "no-repeat",
                    position: options.position || "top left",
                    sizing: options.sizing || "",
                    imageType: options.imageType || "url" }; // url, gradient, etc.
  //UI.recalcImageSize ( aNewImage );
  return aNewImage;
}
/*UI.recalcImageSize = function ( theImage )
{
  var theRatio = window.devicePixelRatio || 1;
  if (theImage.imageSize)
  {
    var theTargetSize = UI.makeSize ( theImage.imageSize.w / theRatio,
                                      theImage.imageSize.h / theRatio );
    theImage.targetSize = theTargetSize;
  }
}*/
UI.copyImage = function ( theImage )
{
  return UI.makeImage ( theImage.image, theImage.imageSize,
                        { repeat: theImage.repeat, position: theImage.position, sizing: theImage.sizing,
                          imageType: theImage.imageType } );
}
UI._applyImageToElement = function ( theElement, theImage )
{
  if (!theImage)
  {
    theElement.style.backgroundImage = "";
    theElement.style.backgroundPosition = "";
    theElement.style.backgroundSize = "";
    theElement.style.backgroundRepeat = "";
    return;
  }
  if (theImage.imageType == "url")
  {
      theElement.style.backgroundImage = "url(" + theImage.image + ")";
  }
  else
  {
    theElement.style.backgroundImage = theImage.image;
  }
  if (theImage.sizing !== "")
  {
    theElement.stle.backgroundSize = theImage.sizing; // cover, contain
  }
  else
  {
    if (theImage.imageSize)
    {
      theElement.style.backgroundSize = "" + 
       ((theImage.imageSize.w>-1) ? theImage.imageSize.w + "px " : "auto ") + 
       ((theImage.imageSize.h>-1) ? theImage.imageSize.h + "px" : "auto" );
    }
    else
    {
      theElement.style.backgroundSize = "";
    }
  }
  theElement.style.backgroundPosition = theImage.position;
  theElement.style.backgroundRepeat = theImage.repeat;
}
UI.makeLinearGradientImage = function ( gradientOrigin, colorStops )
{
  var gradientString = "-webkit-linear-gradient(" + gradientOrigin + ", ";
  for (var i=0; i<colorStops.length; i++)
  {
    gradientString += UI._colorToRGBA(colorStops[i].color) + " " + (colorStops[i].position || "");
    if (i<colorStops.length-1)
    {
      gradientString += ", "
    }
  }
  gradientString += ")";
  return UI.makeImage ( gradientString, null, { imageType: "gradient" } );
}
UI.makeSimpleLinearGradientImage = function ( gradientOrigin, color1, color1Position, color2, color2Position )
{
  return UI.makeLinearGradientImage ( gradientOrigin, [ {color: color1, position: color1Position},
                                                        {color: color2, position: color2Position} ] );
}
/**
 *
 * borders
 *
 */
UI.makeBorderForSide = function ( theBorderColor, theBorderStyle, theBorderStrokeWidth )
{
  var theNewColor = null;
  if (theBorderColor) { theNewColor = UI.copyColor(theBorderColor); }

  return { color: theNewColor, style: theBorderStyle || "inherit", width: theBorderStrokeWidth || "inherit"};
}
UI.copyBorderForSide = function ( theBorderForSide )
{
  return UI.makeBorderForSide (theBorderForSide.color, theBorderForSide.style, theBorderForSide.width );
}
UI.makeBorder = function ( borders, borderRadii )
{
  var theBorder = { color: null, style: "inherit", width: 0 };
  if (borders)
  {
    if (borders.color) { theBorder.color = UI.copyColor(borders.color); }
    if (borders.style) { theBorder.style = borders.style  }
    if (borders.width) { theBorder.width = borders.width  }
    if (borders.top) { theBorder.top = UI.copyBorderForSide(borders.top); }
    if (borders.left) { theBorder.left = UI.copyBorderForSide(borders.left); }
    if (borders.right) { theBorder.right = UI.copyBorderForSide(borders.right); }
    if (borders.bottom) { theBorder.bottom = UI.copyBorderForSide(borders.bottom); }
  }
  if (borderRadii)
  {
    theBorder.topLeftBorderRadius = borderRadii.topLeftBorderRadius || borderRadii.borderRadius || "inherit";
    theBorder.topRightBorderRadius = borderRadii.topRightBorderRadius || borderRadii.borderRadius || "inherit";
    theBorder.bottomLeftBorderRadius = borderRadii.bottomLeftBorderRadius || borderRadii.borderRadius || "inherit";
    theBorder.bottomRightBorderRadius = borderRadii.bottomRightBorderRadius || borderRadii.borderRadius || "inherit";
  }
  else
  {
    theBorder.topLeftBorderRadius = "inherit";
    theBorder.topRightBorderRadius = "inherit";
    theBorder.bottomLeftBorderRadius = "inherit";
    theBorder.bottomRightBorderRadius = "inherit";
  }
  return theBorder;
}
UI.copyBorder = function ( borders )
{
  return UI.makeBorder ( borders, { topLeftBorderRadius: borders.topLeftBorderRadius, 
                                    topRightBorderRadius: borders.topRightBorderRadius,
                                    bottomLeftBorderRadius: borders.bottomLeftBorderRadius, 
                                    bottomRightBorderRadius: borders.bottomRightBorderRadius } );
}
UI._applyBorderToElement = function ( theElement, theBorder )
{
  // over-arching
  if ( theBorder.color ) { theElement.style.borderColor = UI._colorToRGBA(theBorder.color); }
                    else { theElement.style.borderColor = "" }
  if ( theBorder.style !== "inherit" ) { theElement.style.borderStyle = theBorder.style; }
                                  else { theElement.style.borderStyle = ""; }
  if ( theBorder.width !== "inherit" ) { theElement.style.borderWidth = "" + theBorder.width + "px"; }
                                  else { theElement.style.borderWidth = ""; }
  // and now, the specifics
  if ( theBorder.left )
  {
    if (theBorder.left.color) { theElement.style.borderLeftColor = UI._colorToRGBA(theBorder.left.color); }
    if ( theBorder.left.style !== "inherit" ) { theElement.style.borderLeftStyle = theBorder.left.style; }
    if ( theBorder.left.width !== "inherit" ) { theElement.style.borderLeftWidth = "" + theBorder.left.width + "px"; }
  }

  if ( theBorder.top )
  {
    if (theBorder.top.color) { theElement.style.borderTopColor = UI._colorToRGBA(theBorder.top.color); }
    if ( theBorder.top.style !== "inherit" ) { theElement.style.borderTopStyle = theBorder.top.style; }
    if ( theBorder.top.width !== "inherit" ) { theElement.style.borderTopWidth = "" + theBorder.top.width + "px"; }
  }

  if ( theBorder.right )
  {
    if (theBorder.right.color) { theElement.style.borderRightColor = UI._colorToRGBA(theBorder.right.color); }
    if ( theBorder.right.style !== "inherit" ) { theElement.style.borderRightStyle = theBorder.right.style; }
    if ( theBorder.right.width !== "inherit" ) { theElement.style.borderRightWidth = "" + theBorder.right.width + "px"; }
  }

  if ( theBorder.bottom )
  {
    if (theBorder.bottom.color) { theElement.style.borderBottomColor = UI._colorToRGBA(theBorder.bottom.color); }
    if ( theBorder.bottom.style !== "inherit" ) { theElement.style.borderBottomStyle = theBorder.bottom.style; }
    if ( theBorder.bottom.width !== "inherit" ) { theElement.style.borderBottomWidth = "" + theBorder.bottom.width + "px"; }
  }

  // border radii
  theElement.style.borderTopLeftRadius = theBorder.topLeftBorderRadius == "inherit" ? "" : theBorder.topLeftBorderRadius + "px";
  theElement.style.borderTopRightRadius = theBorder.topRightBorderRadius == "inherit" ? "" : theBorder.topRightBorderRadius + "px";
  theElement.style.borderBottomLeftRadius = theBorder.bottomLeftBorderRadius == "inherit" ? "" : theBorder.bottomLeftBorderRadius + "px";
  theElement.style.borderBottomRightRadius = theBorder.bottomRightBorderRadius == "inherit" ? "" : theBorder.bottomRightBorderRadius + "px";
}
/**
 *
 * events
 *
 */
UI.makeEvent = function ( e )
{
  var newEvent = { _originalEvent: e, touches: [], x: -1, y: -1, avgX: -1, avgY: -1 };
  if (e.touches)
  {
    var avgXTotal = 0;
    var avgYTotal = 0;
    for (var i=0; i<e.touches.length; i++)
    {
      newEvent.touches.push ( { x: e.touches[i].clientX, y: e.touches[i].clientY } );
      avgXTotal += e.touches[i].clientX;
      avgYTotal += e.touches[i].clientY;
      if (i===0)
      {
        newEvent.x = e.touches[i].clientX;
        newEvent.y = e.touches[i].clientY;
      }
    }
    if (e.touches.length>0)
    {
      newEvent.avgX = avgXTotal / e.touches.length;
      newEvent.avgY = avgYTotal / e.touches.length;
    }
  }
  else
  {
    if (event.pageX)
    {
      newEvent.touches.push ( { x: e.pageX, y: e.pageY } );
      newEvent.x = e.pageX;
      newEvent.y = e.pageY;
      newEvent.avgX = e.pageX;
      newEvent.avgY = e.pageY;
    }
  }
  return newEvent;
}

UI.cancelEvent = function ( e )
{
  if (e._originalEvent.cancelBubble)
  {
    e._originalEvent.cancelBubble();
  }
  if (e._originalEvent.stopPropagation)
  {
    e._originalEvent.stopPropagation();
  }
  if (e._originalEvent.preventDefault)
  {
    e._originalEvent.preventDefault();
  } else
  {
    e._originalEvent.returnValue = false;
  }
}


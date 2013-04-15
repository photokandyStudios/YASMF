/**
 *
 * UI-BASE
 * @author Kerri Shotts
 * @version 0.3
 *
 * @file This provides the basics of the UI model, including poings, rects, and more.
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
/**
 * @requires PKUTIL
 * @requires PKDEVICE
 * @exports UI
 * @exports UI/COLOR
 * @exports UI/FONT
 * @exports UI/SHADOW
 */
PKUTIL.require ( ["PKUTIL", "PKDEVICE"], function () 
{ 
    PKUTIL.export ( [ "UI", "UI.COLOR", "UI.FONT", "UI.SHADOW" ] );
});

/**
 *
 * @typedef {Object} point
 * @typedef {Object} size
 * @typedef {Object} rect
 * @typedef {Object} color
 * @typedef {Object} shadow
 * @typedef {Object} font
 * @typedef {Object} event
 * @typedef {Object} image
 * @typedef {Object} DOMElement
 * @typedef {Object} DOMEvent
 */

/**
 * Provides the base namespace for various user-interface functions,
 * including colors, points, rectangles, shadows, fonts, etc. 
 * @namespace
 */
var UI = UI || {};
/**
 *
 * Version of the UI Namespace
 *
 */
UI.version = { major: 0, minor: 3, rev: 100 };

/**
 *
 * Creates a point. Points are of the form
 * { x: x, y: y }
 *
 * @param {Number} x - the x-coordinate of the point
 * @param {Number} y - the y-coordinate of the point
 * @returns {point} a point containing x and y
 *
 */
UI.makePoint = function ( x, y )
{
    return { x: x, y: y };
};
/**
 *
 * Creates a copy of a point. You should always copy a point prior
 * to modifying its values, otherwise you risk modifying the
 * original.
 *
 * @param {point} point - the point to copy
 * @returns {point} a new point, ready for modification
 *
 */
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
 * @param {point} pointA - the point to be offset
 * @param {point} pointB - the offset
 * @returns {point} pointA offset by pointB
 *
 */
UI.offsetPoint = function ( pointA, pointB )
{
  return UI.makePoint ( pointA.x + pointB.x, pointA.y + pointB.y );
};

/**
 *
 * Creates a size of the form { w: width, h: height}
 *
 * @param {Number} w - Width portion of a size
 * @param {Number} h - Height portion of a size
 * @returns {size} a size comprised of the specified width and height.
 *
 */
UI.makeSize = function ( w, h )
{
    return { w: w, h: h };
};
/**
 *
 * Creates a size from a point.
 *
 * @param {point} point - the point to create a size from
 * @returns {size} a size based on the x,y coordinates within the point.
 *
 */
UI.makeSizeFromPoint = function ( point )
{
  return { w: point.x, h: point.y };
}
/**
 *
 * Extracts the size from the rect.
 *
 * @param {rect} rect - the rectange from which to extract the size
 * @returns {size} a size based on the size of the rect.
 *
 */
UI.sizeFromRect = function (rect)
{
  return { w: rect.size.w, h: rect.size.h };
}
/**
 *
 * Copies a size object. You should always copy a size before
 * modifying a size, else you risk modifying the original size.
 *
 * @param {size} size - the size to copy
 * @returns {size} a duplicate of the size, ready for modification
 *
 */
UI.copySize = function ( size )
{
  return UI.makeSize ( size.w, size.h );
};
/**
 *
 * Offsets a size by another size.
 *
 * @param {size} sizeA - the size to offset
 * @param {size} sizeB - the offset
 * @returns {size} sizeA offset by sizeB
 *
 */
UI.offsetSize = function ( sizeA, sizeB )
{
  return UI.makeSize ( sizeA.w + sizeB.w, sizeA.h + sizeB.h );
};

/**
 *
 * Creates a rect of the form { origin: point, size: size }
 * which expands to 
 * { origin: {x: x, y: y}, size: {w: width, h: height} }
 *
 * @param {point} origin - the x,y origin of the rect
 * @param {size} size - the width,height of the rect
 * @returns {rect} a rectangle originating at origin with the specified size
 *
 */
UI.makeRect = function ( origin, size )
{
    return { origin: { x: origin.x, y: origin.y },
            size: { w: size.w, h: size.h } };
};
/**
 *
 * Duplicates a rect, returning a rect suitable for modification. You should
 * always copy a rect prior to modifying the contents, else you risk
 * modifying the original.
 *
 * @param {rect} rect - the rect to be copied
 * @returns {rect} a duplicate of the specified rect, suitable for modification
 *
 */
UI.copyRect = function ( rect )
{
  return UI.makeRect ( rect.origin, rect.size );
};

/**
 *
 * Offsets a rect's origin point by the supplied point.
 *
 * @param {rect} rectA - the rect to be offset
 * @param {point} pointB - the offset
 * @returns {rect} rectA offset by pointB
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
 * @param {rect} rectA - the rect to be offset
 * @param {rect} rectB - the offset
 * @returns {rect} a duplicate of rectA offset by rectB.
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
 * @param {rect} rectA - the first rect
 * @param {rect} rectB - the second rect
 * @returns {boolean} true if the rects intersect
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
 * Returns a zero point of {0,0}
 *
 * @returns {point}
 *
 */
UI.zeroPoint = function () { return UI.makePoint ( 0, 0 ); };

/**
 *
 * Returns a zero size of {0,0}
 *
 * @returns {size}
 *
 */
UI.zeroSize = function () { return UI.makeSize ( 0, 0 ); };

/**
 *
 * Returns a zero rect of { {0,0}, {0,0} }
 *
 * @returns {rect}
 *
 */
UI.zeroRect = function () { return UI.makeRect ( UI.zeroPoint(), UI.zeroSize() ); };

/**
 *
 * returns a **point** representing the size of the screen (or browser).
 *
 * @returns {point}
 *
 */
UI.screenSize = function () { return UI.makeSize ( window.innerWidth, window.innerHeight ); };

/**
 *
 * returns a **rect** representing the size of the screen (with a {0,0} origin).
 *
 * @returns {rect}
 *
 */
UI.screenBounds = function () { return UI.makeRect ( UI.zeroPoint(), UI.screenSize() ); };

/**
 *
 * Creates a font.
 *
 * @param {String} theFontFamily - the font family (as you would specify it in CSS)
 * @param {Number} theFontSize - the pixel size of the desired font
 * @param {String} [theFontWeight="normal"] - the weight of the font (as specified by CSS)
 * @returns {font} A font object.
 *
 */
UI.makeFont = function ( theFontFamily, theFontSize, theFontWeight )
{
  return { family: theFontFamily,
             size: theFontSize,
           weight: theFontWeight || "normal"
         };
}
/**
 *
 * Copies a font, making it suitable for modification.
 *
 * @param {font} theFont - the font to duplicate
 * @returns {font} a duplication of theFont, suitable for modification
 *
 */
UI.copyFont = function ( theFont )
{
  return UI.makeFont ( theFont.family, theFont.size, theFont.weight );
}
/**
 *
 * Copies a font, specifying a new size in the process.
 *
 * @param {font} theFont - the font to copy
 * @param {Number} theNewSize - the new size, in pixels, of the font
 * @returns {font} a duplication of theFont, but with a new size
 *
 */
UI.copyFontWithNewSize = function ( theFont, theNewSize )
{
  return UI.makeFont ( theFont.family, theNewSize, theFont.weight );
}
/**
 *
 * Copies a font, specifying a delta for the new font size.
 *
 * @param {font} theFont - the font to copy
 * @param {Number} theNewSizeDelta - the amount by which to modify the size (in pixels)
 * @returns {font} a duplication of theFont, adjusted by theNewSizeDelta
 *
 */
UI.copyFontWithNewSizeDelta = function ( theFont, theNewSizeDelta )
{
  return UI.makeFont ( theFont.family, theFont.size + theNewSizeDelta, theFont.weight );
}
/**
 *
 * Copies a font, specifying a percentage for the new size. A value of 1.00 will keep
 * the size the same; while 1.25 would increase the size and 0.75 would decrease the
 * size.
 *
 * @param {font} theFont - the font to copy
 * @param {Number} theNewSizeDelta - the amount by which to multiply the size
 * @returns {font} a duplicate of theFont, with the size multiplied by theNewSizeDelta
 *
 */
UI.copyFontWithPercentSize = function ( theFont, theSizePercent )
{
  return UI.makeFont ( theFont.family, theFont.size * theSizePercent, theFont.weight );
}
/**
 *
 * Applies a font to an element. If theFont is null, the values used
 * are the CSS "inherit" properties.
 * @private
 *
 * @param {DOMElement} theElement - the DOM element the to which the font is applied
 * @param {font} theFont - the font to apply
 *
 */
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

/**
 * UI.FONT
 * @namespace
 */
UI.FONT = UI.FONT || {};

/**
 *
 * Returns a system font, specific to the platform. Use this when attempting to 
 * match the platform's default font.
 *
 * @returns {font}
 */
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
/**
 *
 * Returns a bolded system font, specific to the platform.
 *
 * @returns {font} a bolded version of {@link UI.FONT.systemFont}
 */
UI.FONT.boldSystemFont = function ()
{
  var theSystemFont = UI.copyFont( UI.FONT.systemFont() );
  theSystemFont.weight = "bold";
  return theSystemFont;
}

/**
 *
 * Creates a shadow for use as text or box shadows.
 *
 * @param {boolean} theVisibility - indicates the visibility of the shadow.
 * @param {color} theColor - the color of the shadow.
 * @param {point} theOffset - the shadow offset
 * @param {Number} theBlur - the amount to blur the shadow (can be zero, but not negative)
 * @param {Number} theSpread - the amount of spread to use (box shadows only, can be zero, but not negative)
 * @param {string} [theType] - specify "inset" for inset box shadows, otherwise omit or make null.
 * @returns {shadow}
 *
 */
UI.makeShadow = function ( theVisibility, theColor, theOffset, theBlur, theSpread, theType )
{
  return { visible: theVisibility, color: UI.copyColor(theColor), offset: UI.copyPoint ( theOffset ), 
           blur: theBlur || 0, spread: theSpread || 0, type: theType || "" };
}
/**
 *
 * Copies a shadow and makes it suitable for modification. Always copy a shadow prior to modification,
 * otherwise you risk modifying the original.
 *
 * @param {shadow} theShadow - the shadow to be copied
 * @returns {shadow} the duplicated shadow, suitable for modificaiton
 *
 */
UI.copyShadow = function ( theShadow )
{
  return UI.makeShadow ( theShadow.visible, theShadow.color, theShadow.offset, theShadow.blur, theShadow.spread, theShadow.type );
}
/**
 *
 * applies a shadow to an element's text. If the shadow is null or invisible, the "inherit"
 * CSS is applied. If the shadow's color is null, the shadow will be transparent.
 *
 * **Note:** the shadow's spread, if not 0 is ignored, since text shadows don't support spread.
 *
 * @private
 *
 * @param {DOMElement} theElement - the DOM element to which to apply the shadow
 * @param {shadow} theShadow - the shadow to apply
 *
 */
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
/**
 *
 * applies a shadow to an element. If the shadow is null or invisible, the "inherit"
 * CSS is applied. If the shadow's color is null, the shadow will be transparent.
 * @private
 *
 * @param {DOMElement} theElement - the DOM element to which to apply the shadow
 * @param {shadow} theShadow - the shadow to apply
 *
 */
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

/**
 * UI.SHADOW
 * @namespace
 */
UI.SHADOW = UI.SHADOW || {};

/**
 *
 * Returns a default dark shadow, depending on the platform. Some platforms return an
 * invisible shadow, since they tend not to use text shadows.
 *
 * @returns {shadow}
 */
UI.SHADOW.defaultDarkShadow = function ()
{
  var theCurrentPlatform = PKDEVICE.platform();
  switch (theCurrentPlatform)
  {
    case "ios": return UI.makeShadow ( true, "rgba(0,0,0,0.25)", UI.makePoint( 0, -1), 0 );
    default: return UI.makeShadow ( false, "#000", UI.zeroPoint(), 0 );
  }
}
/**
 *
 * Returns a default light shadow, depending on the platform. Some platforms return an
 * invisible shadow, since they tend not to use text shadows.
 *
 * @returns {shadow}
 */
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
 * Converts a color object to an rgba(r,g,b,a) string, suitable for applying to
 * any number of CSS styles. If the color's alpha is zero, the return value is
 * "transparent". If the color is null, the return value is "inherit".
 *
 * @private
 *
 * @param {color} theColor - theColor to convert.
 * @returns {string} a CSS value suitable for color properties
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
/**
 *
 * Creates a color object of the form {red:r, green:g, blue:b, alpha:a}.
 *
 * @param {Number} r - red component (0-255)
 * @param {Number} g - green component (0-255)
 * @param {Number} b - blue component (0-255)
 * @param {Number} a - alpha component (0.0-1.0)
 * @returns {color}
 *
 */
UI.makeColor = function ( r, g, b, a )
{
  return { red: r, green: g, blue: b, alpha: a };
}
/**
 *
 * Copies a color and returns it suitable for modification. You should copy
 * colors prior to modification, otherwise you risk modifying the original.
 *
 * @param {color} theColor - the color to be duplicated
 * @returns {color} a duplicate color ready to be modified
 *
 */
UI.copyColor = function (theColor)
{
  return UI.makeColor ( theColor.red, theColor.green, theColor.blue, theColor.alpha );
}

/**
 * UI.COLOR
 * @namespace
 */
UI.COLOR = UI.COLOR || {};
/** @returns {color} a black color. */
UI.COLOR.blackColor     = function () { return UI.makeColor (   0,   0,   0, 1.0 ); }
/** @returns {color} a dark gray color. */
UI.COLOR.darkGrayColor  = function () { return UI.makeColor (  85,  85,  85, 1.0 ); }
/** @returns {color} a gray color. */
UI.COLOR.GrayColor      = function () { return UI.makeColor ( 127, 127, 127, 1.0 ); }
/** @returns {color} a light gray color. */
UI.COLOR.lightGrayColor = function () { return UI.makeColor ( 170, 170, 170, 1.0 ); }
/** @returns {color} a white color. */
UI.COLOR.whiteColor     = function () { return UI.makeColor ( 255, 255, 255, 1.0 ); }
/** @returns {color} a blue color. */
UI.COLOR.blueColor      = function () { return UI.makeColor (   0,   0, 255, 1.0 ); }
/** @returns {color} a green color. */
UI.COLOR.greenColor     = function () { return UI.makeColor (   0, 255,   0, 1.0 ); }
/** @returns {color} a red color. */
UI.COLOR.redColor       = function () { return UI.makeColor ( 255,   0,   0, 1.0 ); }
/** @returns {color} a cyan color. */
UI.COLOR.cyanColor      = function () { return UI.makeColor (   0, 255, 255, 1.0 ); }
/** @returns {color} a yellow color. */
UI.COLOR.yellowColor    = function () { return UI.makeColor ( 255, 255,   0, 1.0 ); }
/** @returns {color} a magenta color. */
UI.COLOR.magentaColor   = function () { return UI.makeColor ( 255,   0, 255, 1.0 ); }
/** @returns {color} a orange color. */
UI.COLOR.orangeColor    = function () { return UI.makeColor ( 255, 127,   0, 1.0 ); }
/** @returns {color} a purple color. */
UI.COLOR.purpleColor    = function () { return UI.makeColor ( 127,   0, 127, 1.0 ); }
/** @returns {color} a brown color. */
UI.COLOR.brownColor     = function () { return UI.makeColor ( 153, 102,  51, 1.0 ); }
/** @returns {color} a light text color suitable for display on dark backgrounds. */
UI.COLOR.lightTextColor = function () { return UI.makeColor ( 240, 240, 240, 1.0 ); }
/** @returns {color} a dark text color suitable for display on light backgrounds. */
UI.COLOR.darkTextColor  = function () { return UI.makeColor (  15,  15,  15, 1.0 ); }
/** @returns {color} a transparent color. */
UI.COLOR.clearColor     = function () { return UI.makeColor (   0,   0,   0, 0.0 ); }

/**
 *
 * Makes an image object. The options object can contain any of the following
 * properties: repeat (default "no-repeat"), position ("top left"), sizing
 * (""), and imageType ("url"). Repeat can be "repeat-x","repeat-y","reepat" or
 * "no-repeat". Position is a CSS position. Sizing can be empty, "contain" or
 * "cover". imageType specifies if the image is a "url" asset or something
 * else (like a "gradient").
 *
 * @param {string} thePathToTheImage - the relative or absolute path to the image
 * @param {size} theImageSize - the size of the image as it should appear logically;
 *                              if an image should be displayed with retina quality,
 *                              the physical pixels would be 64x64 whereas the size
 *                              would be {32,32}.
 * @param {Object} options - options for the image. These are all optional, but useful.
 * @returns {image}
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
/**
 *
 * Copies an image and returns it suitable for modification. You should always
 * duplicate an image prior to modification or you risk modifying the original.
 *
 * @param {image} theImage - the image to be copied
 * @returns {image} a duplicate image, suitable for modification
 */
UI.copyImage = function ( theImage )
{
  return UI.makeImage ( theImage.image, theImage.imageSize,
                        { repeat: theImage.repeat, position: theImage.position, sizing: theImage.sizing,
                          imageType: theImage.imageType } );
}
/**
 *
 * Applies an image to the background of a DOMElement. If the image type
 * as "url", the image is assumed to be a graphic asset, but if it is
 * some other value, the backgroundImage property is assigned the
 * image property directly (say, as a gradient).
 *
 * If sizing is specified, it is used over any specific size. If a size
 * is specified, but no sizing, it is used (and should be understood as
 * logical pixels). Any one component of a size that is -1 will be
 * converted to "auto".
 * @private
 *
 * @param {DOMElement} theElement - the DOM Element to apply the image to
 * @param {image} theImage - the image to appy
 *
 */
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
/**
 *
 * Creates a linear gradient image that can be used wherever images are used.
 *
 * @param {String} gradientOrigin - the CSS origin of the gradient (like top, left, etc.)
 * @param {Array} colorStops - a series of color stops, each one of the form {color: color, position: position} where
 *                             position is optional. The position is a CSS position (like 0%,50%,100%).
 * @returns {image} an image with the specified gradient.
 *
 */
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
/**
 *
 * Creates a simple linear gradient that can be used wherever images are used. Unlike
 * {@link UI.makeLinearGradientImage}, only two color stops and positions are used.
 *
 * @param {String} gradientOrigin - the CSS origin of the gradient (like top, left, etc.)
 * @param {color} color1 - the color for the first stop
 * @param {String} color1Position - the position for the first stop (or null if the default is acceptable)
 * @param {color} color2 - the color for the second stop
 * @param {String} color2Position - the position for the second stop (or null)
 *
 */
UI.makeSimpleLinearGradientImage = function ( gradientOrigin, color1, color1Position, color2, color2Position )
{
  return UI.makeLinearGradientImage ( gradientOrigin, [ {color: color1, position: color1Position},
                                                        {color: color2, position: color2Position} ] );
}
/**
 *
 * Creates a border for a (generic) side.
 *
 * @param {color} theBorderColor - the color for the borde
 * @param {String} [theBorderStyle="inherit"] - a CSS border style
 * @param {Number} [theBorderStrokeWidth="inherit"] - the number of pixels for the border stroke
 *
 * returns {Object} a Border Side
 */
UI.makeBorderForSide = function ( theBorderColor, theBorderStyle, theBorderStrokeWidth )
{
  var theNewColor = null;
  if (theBorderColor) { theNewColor = UI.copyColor(theBorderColor); }

  return { color: theNewColor, style: theBorderStyle || "inherit", width: theBorderStrokeWidth || "inherit"};
}
/**
 *
 * Copies a border for a side; always copy before modification, or you risk
 * modifying the original.
 *
 * @param {Object} theBorderForSide - the border side to copy
 * @returns {Object} a copied Border side
 */
UI.copyBorderForSide = function ( theBorderForSide )
{
  return UI.makeBorderForSide (theBorderForSide.color, theBorderForSide.style, theBorderForSide.width );
}
/**
 *
 * Creates a border for applicatiom to DOM Elements.
 *
 * The borders are specified with the top-level color, style, and width parameters (all optional)
 * can be applied to all sides, but a specific property (in the top, left, right, bottom) borders
 * will override any top-level property. Any property not specified will be given a suitable
 * default.
 *
 * The borderRadii object specifies the specific border radii (topLeftBorderRadius, topRightBorderRadius,
 * bottomLeftBorderRadius, bottomRightBorderRadius), but if any are missing, borderRadius will be used
 * instead. If that property is not defined, "inherit" is used.
 *
 * @param {Object} borders - an object that specifies the borders, for all sides, and for each side
 * @param {Object} borderRadii - an object that specifies the border radii
 * @returns {border} a border
 *
 */
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
/**
 *
 * Copies a border for modification. Always copy borders prior to modifying them, else you
 * risk modifying the original.
 *
 * @param {border} borders - the border to duplicate
 * @returns {border}
 */
UI.copyBorder = function ( borders )
{
  return UI.makeBorder ( borders, { topLeftBorderRadius: borders.topLeftBorderRadius, 
                                    topRightBorderRadius: borders.topRightBorderRadius,
                                    bottomLeftBorderRadius: borders.bottomLeftBorderRadius, 
                                    bottomRightBorderRadius: borders.bottomRightBorderRadius } );
}
/**
 *
 * Applies a border to an element.
 * @private
 *
 * @param {DOMElement} theElement - the DOM element to which to apply the border
 * @param {borde} theBorder - the border to apply
 *
 */
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
 * Creates an event object from a DOM event.
 *
 * The event returned contains all the touches from the DOM event in an array of {x,y} objects.
 * The event also contains the first touch as x,y properties and the average of all touches
 * as avgX,avgY. If no touches are in the event, these values will be -1.
 *
 * @param {DOMEvent} e - the DOM event
 * @returns {event}
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

/**
 *
 * Cancels an event that's been created using {@link UI.makeEvent}.
 *
 * @param {event} e - the event to cancel
 *
 */
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


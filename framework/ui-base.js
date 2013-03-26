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

var UI = UI || {};

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


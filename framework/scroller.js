/******************************************************************************
 *
 * SCROLLER
 * Author:  Kerri Shotts
 * Version: 0.1 alpha
 * License: MIT
 *
 * This library is intended to be similar to iScroll-lite in that it should be
 * a relatively fast method of scrolling content without being horribly laggy
 * or cause incorrect "clicks" to be registered.
 *
 * This library does *NOT* support physics-based scrolling, except for a small
 * inertia animation at the end of a scroll. It is not intended to replicate
 * native scrolling /at all/. There are no bounces at the top or bottom. There
 * is no visible scroll bar either. Essentially, overflow:scroll as supported
 * on iOS 5 with no bounce/inertia scrolling.
 *
 * Consider this library an experiment. The idea is to be simpler than iScroll
 * to use -- for example, the scroller only needs to be created once -- it does
 * not need to be refreshed when AJAX content loads. It is intended to be at
 * least as fast as iScroll, if not a little faster. It is not, however,
 * intended to be a native scrolling solution. At this time, I do not believe
 * it truly possible or practice, and users will notice any non-native solution
 * that tries to match, so why try?
 *
 * Usage:
 *
 * var yourScroller = new SCROLLER.GenericScroller ( "the_element_to_scroll" );
 *
 * where you have the following DOM tree:
 *
 *     container_element
 *     - the_element_to_scroll
 *
 * Future Goals:
 *
 *  - Detect native physics scrolling and use it when possible
 *  - Detect native overflow:scroll (non-physics) and use it when possible
 *  - Improve the inertial scrolling at end (this is a very rough implementation)
 *  - Become irrelevant. I hope for a day when all mobile browsers can scroll
 *    complex content natively and smoothly.
 *
 * Supported Platforms:
 *
 *  - Android 2.3+
 *  - iOS 4.3+
 *  - probably any webkit browser?
 *
 * Known Issues:
 *  - A little too willing to call a scroll a "click".
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
         plusplus:true,
         smarttabs:true,
         sub:true,
         trailing:false,
         undef:true,
         white:false,
         onevar:false 
 */

/*global device */

var SCROLLER = SCROLLER ||
{
};
// create the namespace

SCROLLER.GenericScroller = function(element)
{
  var self = this;

  // the element that should scroll
  self.theElement =
  {
  };

  // various touch-related coords.
  self._touchX = -1;
  self._touchY = -1;
  self._touchStartX = 0;
  self._touchStartY = 0;
  self._actualX = 0;
  self._actualY = 0;

  // delta changes; totalDelta should be total change from start to end.
  self._deltaX = 0;
  self._deltaY = 0;
  self._totalDeltaX = 0;
  self._totalDeltaY = 0;

  // inertial animation
  self._timer = -1;
  self._step = 0;

  /**
   *
   * Attaches the scroller to a new element. The element MUST be contained within
   * another element that can support the setting of scrollTop/Left.
   *
   * Any overflow values will be overridden. Any webkit transforms may also be
   * overridden.
   */
  self.attachToElement = function(element)
  {
    // get our element
    self.theElement = document.getElementById(element);

    // attach our listeners
    self.theElement.addEventListener("touchstart", self.touchStart, false);
    self.theElement.addEventListener("touchmove", self.touchMove, false);
    self.theElement.addEventListener("touchend", self.touchEnd, false);

    // turn overflow to hidden; if it is auto or scroll, the native scrolling
    // might kick in (if supported) and confuse us. IF YOU WANT NATIVE SCROLLING,
    // DON'T USE THIS SCROLLER.
    self.theElement.parentNode.style.overflow = "hidden";

    // A quandary. on iOS, it is faster to have translate3d(0,0,0) enabled,
    // but you have more visual glitches. Without it, it is a little slower,
    // but with no visual glitches. For Android, we leave it on, just in case
    // it can be used.
    if (device)
    {
      if (device.platform == "Android")
      {
        //self.theElement.style.webkitTransform = "translate3d(0,0,0)";
      }
    } else
    {
      // if we can't detect the device, we'll always use it.
      self.theElement.style.webkitTransform = "translate3d(0,0,0)";
    }

    console.log("Scroller initiated for element " + element);
  }
  /**
   *
   * Get the scroll position
   *
   */
  self.getScrollTop = function()
  {
    return self.theElement.parentNode.scrollTop;
  }
  self.getScrollLeft = function()
  {
    return self.theElement.parentNode.scrollLeft;
  }
  /**
   *
   * Scroll to a given location. If the location can't be scrolled to,
   * the nearest location will be used.
   *
   */
  self.scrollTo = function(left, top)
  {
    self.theElement.parentNode.scrollTop = top;
    self.theElement.parentNode.scrollLeft = left;
    self._actualX = -left;
    self._actualY = -top;
  }
  /**
   *
   * touchStart initializes all our values when a touch is received.
   *
   */
  self.touchStart = function(event)
  {
    // if an inertia animation is underway, clear it.
    if (self._timer != -1)
    {
      clearInterval(self._timer);
    }
    self._timer = -1;

    // record our touches.
    self._touchX = event.touches[0].screenX;
    self._touchY = event.touches[0].screenY;
    self._touchStartX = self._touchX;
    self._touchStartY = self._touchY;

    // zero the deltas
    self._deltaX = 0;
    self._deltaY = 0;
    self._totalDeltaX = 0;
    self._totalDeltaY = 0;

    // get our actual scroll position
    self._actualX = -self.theElement.parentNode.scrollLeft;
    self._actualY = -self.theElement.parentNode.scrollTop;
  }
  /**
   *
   * When a touch moves, we'll receive the event here.
   *
   */
  self.touchMove = function(event)
  {
    // calculate the delta between our last and current
    // position
    self._deltaX = self._touchX - event.touches[0].screenX;
    self._deltaY = self._touchY - event.touches[0].screenY;

    // update totalDelta
    self._totalDeltaX -= self._deltaX;
    self._totalDeltaY -= self._deltaY;

    // update our actual scroll position
    self._actualX -= self._deltaX;
    self._actualY -= self._deltaY;

    // store our current screen position
    self._touchX = event.touches[0].screenX;
    self._touchY = event.touches[0].screenY;

    // scroll to the new position
    self.theElement.parentNode.scrollTop = -self._actualY;
    self.theElement.parentNode.scrollLeft = -self._actualX;

    // if there is any movement, prevent the default.
    if (Math.sqrt((self._totalDeltaX * self._totalDeltaX) + (self._totalDeltaY * self._totalDeltaY)) > 0)
    {
      event.preventDefault();
    }
  }
  /**
   *
   * When a finger is lifted from the screen, we'll get this event.
   * We can determine whether or not it was a click if we scrolled at all,
   * and if we scrolled a certain distance, we'll do a little inertial
   * scrolling
   */
  self.touchEnd = function(event)
  {
    // were we just a click? if so, this'll be zero -- otherwise prevent the default.
    if (Math.sqrt((self._totalDeltaX * self._totalDeltaX) + (self._totalDeltaY * self._totalDeltaY)) > 0)
    {
      event.preventDefault();
    }

    // how far did we scroll just prior to getting the end event? Is it far enough to have
    // some inertia?
    if (Math.sqrt((self._deltaX * self._deltaX) + (self._deltaY * self._deltaY)) > 10)
    {
      // yes, set up our animation
      self._step = 0;
      self._timer = setInterval(function()
      {
        // increment the frame
        self._step = self._step + 1;
        if (self._step < 10)
        {
          // we'll permit 10 frames of animation
          self._actualX -= self._deltaX / (self._step);
          self._actualY -= (self._deltaY) / (self._step);
          self.theElement.parentNode.scrollTop = -self._actualY;
          self.theElement.parentNode.scrollLeft = -self._actualX;
        } else
        {
          // animation complete
          clearInterval(self._timer);
          self._timer = -1;
        }
      }, 17);
      // 17 = as fast as possible
    }
  }
  // attach to the element passed in the constructor.
  self.attachToElement(element);
}
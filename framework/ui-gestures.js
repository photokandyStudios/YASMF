/******************************************************************************
 *
 * UI-GESTURES
 * Author:  Kerri Shotts
 * Version: 0.1 alpha
 * License: MIT
 *
 * A simple, no-frills gesture recognizer. Permits long-press recognition,
 * horizontal swipe recognition, and vertical swipe recognition. Recognizing
 * swipes in a particular direction (left, right, up, down) should be easy to
 * add later.
 *
 * The SimpleGesture class represents the basic recognizer -- it implements all
 * the tracking of touch and mouse events. Every 100ms it calls
 * a recognition function, which by default does nothing. Essentially, Simple-
 * Gesture is abstract. This method is expected to be overridden by a specific
 * recognizer, which the LongPressGesture, HorizontalSwipeGesture, and
 * VerticalSwipeGesture do.
 *
 * The LongPressGesture will fire off an event when a longpress is recognized.
 * How this is recognized is partially defined by the caller -- that is,
 * two durations can be supplied. By default, the long-press is recognized at
 * 1s and cancelled at 3s (assuming no previous recognition). It is also
 * cancelled should any movement outside of a 25px radius occur.
 *
 * The HorizontalSwipeGesture and VerticalSwipeGesture will fire off an event
 * when a swipe in the given axis is detected. This swipe is detected when the
 * length of the swipe exceeds 75px (or the provided override), and will be
 * fired as long as the duration of the swipe is less than the cancel duration
 * (3s by default). The line must not deviate by more than 25px in the specified
 * axis, or the gesture will fail to be recognized.
 *
 * Usage:
 *
 * var anElement = document.getElementById("abc");
 * var aLongPressGesture = new GESTURES.LongPressGesture
 *                             ( anElement, theFunctionToCallWhenRecognized,
 *                               [ thePressDuration, [ theCancelDelay ]] );
 *
 * var aHorizontalSwipeGesture = new GESTURES.HorizontalSwipeGesture
 *                               ( anElement, theFunctionToCallWhenRecognized,
 *                                 [ theSwipeLength, [ theCancelDelay ]] );
 *
 * var aVerticalSwipeGesture = new GESTURES.VerticalSwipeGesture
 *                             ( anElement, theFunctionToCallWhenRecognized,
 *                               [ theSwipeLength, [ theCancelDelay ]] );
 *
 *
 * Where: anElement is an HTML DOM element
 *        theFunctionToCallWhenRecognized is a function that will be called
 *            when the gesture is recognized. It will be passed the recognizer,
 *            and as such, one can store & retrieve data in this manner:
 *
 *                 aLongPressGesture.data = "Hello";
 *                 function theFunctionToCallWhenRecognized ( gr )
 *                 { alert (gr.data); }
 *
 *            This will generate an alert of "Hello" when the element is long-
 *            pressed.
 *
 *        thePressDuration: Optional, defaults to 1s. The amount of time required
 *            to recognize a long-press.
 *        theSwipeLength: Optional, defaults to 75px. The length of a swipe
 *            required to recognize a swipe.
 *        theCancelDelay: Optional, defaults to 3s. If a gesture is not recognized
 *            prior to this delay, the gesture is cancelled, that is, it will
 *            never be recognized.
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
 
var GESTURES = GESTURES ||
{
};
// create the namespace
GESTURES.consoleLogging = false;

GESTURES.SimpleGesture = function(element)
{
  var self = this;

  self.theElement =
  {
  };

  self._touchStartX = 0;
  self._touchStartY = 0;
  self._touchX = 0;
  self._touchY = 0;
  self._deltaX = 0;
  self._deltaY = 0;
  self._duration = 0;
  self._timerId = -1;
  self._distance = 0;
  self._event =
  {
  };
  self._cleared = false;

  self.attachToElement = function(element)
  {
    // get our element
    self.theElement = element;
    // attach our listeners
    self.theElement.addEventListener("touchstart", self.touchStart, false);
    self.theElement.addEventListener("touchmove", self.touchMove, false);
    self.theElement.addEventListener("touchend", self.touchEnd, false);

    self.theElement.addEventListener("mousedown", self.mouseDown, false);
    self.theElement.addEventListener("mousemove", self.mouseMove, false);
    self.theElement.addEventListener("mouseup", self.mouseUp, false);

  }

  self.recognizeGesture = function(o)
  {
    // we do nothing; no gesture to recognize.
    if (GESTURES.consoleLogging)
    {
      console.log("default recognizer...");
    }
  }

  self.attachGestureRecognizer = function(fn)
  {
    self.recognizeGesture = fn;
  }

  self.updateGesture = function()
  {
    self._duration += 100;
    self._distance = Math.sqrt((self._deltaX * self._deltaX) + (self._deltaY * self._deltaY));
    if (GESTURES.consoleLogging)
    {
      console.log("gesture: start: (" + self._touchStartX + "," + self._touchStartY + ") current: (" + self._touchX + "," + self._touchY + ") delta: (" + self._deltaX + "," + self._deltaY + ") delay: " + self._duration + "ms, " + self._distance + "px");
    }
    if (!self._cleared)
    {
      self.recognizeGesture(self);
    }
  }

  self.clearEvent = function()
  {
    if (self._cleared)
    {
      if (self._event.cancelBubble)
      {
        self._event.cancelBubble();
      }
      if (self._event.stopPropagation)
      {
        self._event.stopPropagation();
      }
      if (self._event.preventDefault)
      {
        self._event.preventDefault();
      } else
      {
        self._event.returnValue = false;
      }
    }
    if (self._timerId > -1)
    {
      clearInterval(self._timerId);
      self._timerId = -1;
    }
    self._cleared = true;
  }

  self.eventStart = function()
  {
    if (GESTURES.consoleLogging)
    {
      console.log("eventstart");
    }
    self._duration = 0;
    self._deltaX = 0;
    self._deltaY = 0;
    self._cleared = false;
    self._touchStartX = self._touchX;
    self._touchStartY = self._touchY;
    self._timerId = setInterval(self.updateGesture, 100);
  }

  self.touchStart = function(event)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("touchstart");
    }
    if (event)
    {
      self._touchX = event.touches[0].screenX;
      self._touchY = event.touches[0].screenY;
      self._event = event;
    } else
    {
      self._touchX = window.event.screenX;
      self._touchY = window.event.screenY;
      self._event = window.event;
    }
    self.eventStart();
  }

  self.mouseDown = function(event)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("mousedown");
    }
    if (event)
    {
      self._touchX = event.screenX;
      self._touchY = event.screenY;
      self._event = event;
    } else
    {
      self._touchX = window.event.screenX;
      self._touchY = window.event.screenY;
      self._event = window.event;
    }
    self.eventStart();
  }

  self.eventMove = function()
  {
    if (GESTURES.consoleLogging)
    {
      console.log("eventmove");
    }
    self._deltaX = self._touchX - self._touchStartX;
    self._deltaY = self._touchY - self._touchStartY;

    var distance = Math.sqrt((self._deltaX * self._deltaX) + (self._deltaY * self._deltaY));

  }

  self.touchMove = function(event)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("touchmove");
    }
    if (event)
    {
      self._touchX = event.touches[0].screenX;
      self._touchY = event.touches[0].screenY;
      self._event = event;
    } else
    {
      self._touchX = window.event.screenX;
      self._touchY = window.event.screenY;
      self._event = window.event;
    }
    self.eventMove();
  }

  self.mouseMove = function(event)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("mousemove");
    }
    if (event)
    {
      self._touchX = event.screenX;
      self._touchY = event.screenY;
      self._event = event;
    } else
    {
      self._touchX = window.event.screenX;
      self._touchY = window.event.screenY;
      self._event = window.event;
    }
    self.eventMove();
  }

  self.eventEnd = function()
  {
    if (GESTURES.consoleLogging)
    {
      console.log("eventend");
    }
    self.clearEvent();
  }

  self.touchEnd = function(event)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("touchend");
    }
    self._event = event || window.event;
    self.eventEnd();
  }

  self.mouseUp = function(event)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("mouseup");
    }
    self._event = event || window.event;
    self.eventEnd();
  }
  // attach to the element passed in the constructor.
  self.attachToElement(element);
}

GESTURES.LongPressGesture = function(element, whatToDo, delayToRecognition, delayToCancel)
{
  var myGesture = new GESTURES.SimpleGesture(element);
  myGesture._delayToRecognition = delayToRecognition || 1000;
  myGesture._delayToCancel = delayToCancel || 3000;
  myGesture._whatToDo = whatToDo;
  myGesture.attachGestureRecognizer(function(o)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("longpress recognizer...");
    }
    // no finger movement
    if (o._distance < 25)
    {
      // must be between our minimum and maximum delay
      if (o._duration >= o._delayToRecognition && o._duration <= o._delayToCancel)
      {
        // long-press recognized
        o.clearEvent();
        o._whatToDo(o);
      }
    } else
    {
      o.clearEvent();
      // long-press cancelled.
    }
  });
  return myGesture;
}

GESTURES.HorizontalSwipeGesture = function(element, whatToDo, radiusToRecognition, delayToCancel)
{
  var myGesture = new GESTURES.SimpleGesture(element);
  myGesture._radiusToRecognition = radiusToRecognition || 50;
  myGesture._delayToCancel = delayToCancel || 3000;
  myGesture._whatToDo = whatToDo;
  myGesture.attachGestureRecognizer(function(o)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("horizontal recognizer...");
    }
    // no finger movement
    if (o._distance > o._radiusToRecognition)
    {
      // must be between our minimum and maximum delay
      if (o._duration <= o._delayToCancel)
      {
        // finger must trace a straight line
        if (Math.abs(o._deltaY) < 25)
        {
          o.clearEvent();
          o._whatToDo(o);
        }
      }
    }
  });
  return myGesture;
}

GESTURES.VerticalSwipeGesture = function(element, whatToDo, radiusToRecognition, delayToCancel)
{
  var myGesture = new GESTURES.SimpleGesture(element);
  myGesture._radiusToRecognition = radiusToRecognition || 50;
  myGesture._delayToCancel = delayToCancel || 3000;
  myGesture._whatToDo = whatToDo;
  myGesture.attachGestureRecognizer(function(o)
  {
    if (GESTURES.consoleLogging)
    {
      console.log("vertical recognizer...");
    }
    // no finger movement
    if (o._distance > o._radiusToRecognition)
    {
      // must be between our minimum and maximum delay
      if (o._duration <= o._delayToCancel)
      {
        // finger must trace a straight line
        if (Math.abs(o._deltaX) < 25)
        {
          o.clearEvent();
          o._whatToDo(o);
        }
      }
    }
  });
  return myGesture;
}


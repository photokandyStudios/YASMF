/**
 *
 * UI-VIEW provides the UI.View object
 * @namespace UI
 * @module UI.View
 * @requires PKUTIL, UI, PKObject
 * @author Kerri Shotts
 * @version 0.3
 ******************************************************************************/
/*jshint
         asi:true,
         bitwise:true,
         browser:true,
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
/*global PKObject, PKUTIL */

PKUTIL.require ( ["PKUTIL", "UI", "PKObject" ], function () 
{ 
    PKUTIL.export ( "UIView" );
});

var UI = UI || {};
/**
 *
 * Views provide the basic object that all widgets that are part of the
 * display hierarchy derive from.
 *
 * @class UI.View
 * @extends PKObject
 */
UI.View = function ()
{
  var self = new PKObject();
  self.subclass ( "UIView" );

  // register any notifications
  /**
   * Fired when the bounds of the view has changed. Note that if the frame changes, but the
   * size of the view does *not* change, this notification is not changed.
   * @event boundsDidChange
   */
  self.registerNotification ( "boundsDidChange" );
  /**
   * Fired when the frame of the view has changed. Note that this event will also be fired
   * when the bounds change, since they inherently affect the frame.Note
   * that this doesn't get fired when sub-properties are changed, only when the object
   * itself is assigned.
   * @event frameDidChange
   */
  self.registerNotification ( "frameDidChange" );
  /**
   * Fired when the background color has changed. Note
   * that this doesn't get fired when sub-properties are changed, only when the object
   * itself is assigned.
   * @event backgroundColorDidChange
   */
  self.registerNotification ( "backgroundColorDidChange" );
  /**
   * Fired when the background image has changed. (This includes gradients, etc.). Note
   * that this doesn't get fired when sub-properties are changed, only when the object
   * itself is assigned.
   * @event backgroundImageDidChange
   */
  self.registerNotification ( "backgroundImageDidChange" );
  /**
   * Fired when the border has changed. Note that this isn't changed when the *size*
   * of the view changes, only when the border itself is assigned. Furthermore,
   * it won't be fired when any sub-properties change in the border: to trigger
   * the event, one *must* copy the border and re-assign it.
   * @event borderDidChange
   */
  self.registerNotification ( "borderDidChange" );
  /**
   * Fired when the opacity has changed. 
   * @event opacityDidChange
   */
  self.registerNotification ( "opacityDidChange" );
  /**
   * Fired when the shadow has changed. Note
   * that this doesn't get fired when sub-properties are changed, only when the object
   * itself is assigned.
   * @event shadowDidChange
   */
  self.registerNotification ( "shadowDidChange" );
  /**
   * Fired when the visibility has changed.
   * @event visibilityDidChange
   */
  self.registerNotification ( "visibilityDidChange" );
  /**
   * Fired when the view is about to appear.
   * @event viewWillAppear
   */
  self.registerNotification ( "viewWillAppear" );
  /**
   * Fired when the view has appeared.
   * @event viewDidAppear
   */
  self.registerNotification ( "viewDidAppear" );
  /**
   * Fired when the view will disappear.
   * @event viewWillDisappear
   */
  self.registerNotification ( "viewWillDisappear" );
  /**
   * Fired when the view has disappeared
   * @event viewDidDisappear
   */
  self.registerNotification ( "viewDidDisappear" );
  /**
   * Fired when the view has finished initializing itself. By the time
   * this notification is received, it is safe to use various methods
   * and properties that act on the view's DOM element.
   * @event viewDidInit
   */
  self.registerNotification ( "viewDidInit" );
  /**
   * Fired when the view is marked interactive and has been tapped. No
   * event information is passed.
   * @event tapped
   */
  self.registerNotification ( "tapped" );
  /**
   * Fired when the view is marked interactive and a touch event has started. No
   * event information is passed.
   * @event touchStarted
   */
  self.registerNotification ( "touchStarted" );
  /**
   * Fired when the view is marked interactive and a touch has moved. No
   * event information is passed.
   * @event touchMoved
   */
  self.registerNotification ( "touchMoved" );
  /**
   * Fired when the view is marked interactive and a touch event has ended. No
   * event information is passed.
   * @event touchEnded
   */
  self.registerNotification ( "touchEnded" );


  /*
   *
   * All views have direct DOM representations
   *
   */
  /**
   * Stores a reference to the view's DOM representation. It is not initialized
   * until the `init` method is finished. Once that is finished, the DOM Element
   * will be an element with the same tagname as the object's class. For a UI.View,
   * the tag name will be "UIView". The class will also be "UIView".
   *
   * @private
   * @property _element
   * @type DOMElement
   * @default null
   */
  self._element = null; 
  /*
   *
   * All views have subviews
   *
   */
  /**
   *
   * Represents the list of all views that belong to this view.
   *
   * @private
   * @property _subViews
   * @type Array
   * @default empty
   */
  self._subViews = [];
  /**
   * Represents the superView (parent view).
   *
   * @private
   * @property _superView
   * @type View
   * @default null
   */
  self._superView = null;
  /**
   * Add a view to the list of this view's subviews. Doing so makes the view's
   * DOM element a child of this view's DOM element, but there is no guarantee
   * of order. (That is, the representation of the DOM element's children may not
   * be in the same order as the subViews array.) The view's `superView` is also
   * set to this view instance.
   *
   * > The behavior is undefined if the *same* view is added more than once.
   *
   * @method addSubView
   * @param theView {View} the view to add
   */
  self.addSubView = function ( theView )
  {
    self._subViews.push ( theView );
    theView._superView = self;

    // make sure our element knows about it.
    self._element.appendChild ( theView._element );
  };
  /**
   * Removes a subview from the list of this view's subviews. Doing so removes
   * the view as a child of this view's DOM element, and sets `superView` to 
   * null.
   *
   * > The behavior is undefined if the view hasn't already been added.
   *
   * @method removeSubView
   * @param theView {View} the view to remove
   */
  self.removeSubView = function ( theView )
  {
    self._subViews.splice ( self._subViews.indexOf(theView), 1 );
    theView._superView = null;

    // and our element needs to be removed
    self._element.removeChild ( theView._element );
  };
  /**
   * Removes this view from its superview. Doing so removes this view
   * from it's prior parent's DOM Elemnt and sets `superView` to null.
   * 
   * @method removeFromSuperView
   */
  self.removeFromSuperView = function ()
  {
    self._superView.removeSubView ( self );
  };
  /**
   * Returns all the subViews in an array.
   *
   * @method getSubViews
   * @returns {Array} all the subviews.
   */
  self.getSubViews = function ()
  {
    return self._subViews;
  }
  /**
   * Return the super view
   *
   * @method getSuperView
   * @returns {View} the parent view
   */
  self.getSuperView = function ()
  {
    return self._superView;
  }
  /**
   * The array of subviews. **Read-Only**
   * @property subViews
   * @type Array
   * @default empty
   */
  self.__defineGetter__ ( "subViews", self.getSubViews );
  /**
   * The parent view. **Read-Only**
   * @property superView
   * @type View
   * @default null
   */
  self.__defineGetter__ ( "superView", self.getSuperView );

  /*
   *
   * All views have bounds and frames.
   *
   */
  /**
   * Represents the bounds of the view. Keep in mind that if the view's DOM element
   * has various other styles that might affect the visible bounds, this may not
   * accurately reflect the visual representation. 
   *
   * @private
   * @property _bounds
   * @type rect
   * @default zeroRect
   */
  self._bounds = UI.zeroRect();
  /**
   * Represents the frame of the view. Keep in mind that it may not accurately
   * reflect the DOM element's actual frame (due to various CSS styles that may
   * be applied).
   *
   * @private
   * @property _frame
   * @type rect
   * @default zeroRect
   */
  self._frame = UI.zeroRect();
  /**
   * Returns the bounds of the view. Keep in mind that it may not accurately
   * reflect the DOM element's actual bounds (due to various CSS styles that may
   * be applied).
   *
   * @method getBounds
   * @returns {rect}
   */
  self.getBounds = function ()
  {
    return self._bounds;
  }
  /**
   * Sets the bounds of the view. 
   *
   * Triggers `boundsDidChange` and `frameDidChange`.
   * @method setBounds
   * @property newBounds {rect}
   */
  self.setBounds = function ( newBounds )
  {
    self._bounds = UI.copyRect ( newBounds );
    if (!self._frame)
    {
      self._frame = UI.zeroRect();
    }
    if (self._frame.size.w != self._bounds.size.w ||
        self._frame.size.h != self._bounds.size.h)
    {
      self._frame.size = UI.copySize ( newBounds.size );
      self.notify ("boundsDidChanged");
      self.notify ("frameDidChange");
    }
  }
  /**
   * Represents the frame of the view. Keep in mind that it may not accurately
   * reflect the DOM element's actual frame (due to various CSS styles that may
   * be applied).
   *
   * @method getFrame
   * @returns {rect}
   */
  self.getFrame = function ()
  {
    return self._frame;
  }
  /**
   * Set the frame of the view. Adjusts the bounds if necessary.
   *
   * Triggers `frameDidChange`, and `boundsDidChange` only if the bounds
   * needed to be adjusted.
   * @method setFrame
   * @param newFrame {rect}
   */
  self.setFrame = function( newFrame )
  {
    self._frame = UI.copyRect ( newFrame );
    if (!self._bounds)
    {
      self._bounds = UI.zeroRect();
    }
    if ( self._bounds.size.w != self._frame.size.w ||
         self._bounds.size.h != self._frame.size.h )
    {
      self._bounds.size = UI.copySize ( newFrame.size );
      self.notify ("boundsDidChange");      
    }
    self.notify ("frameDidChange");
  }
  /**
   * Represents the bounds of the view. Keep in mind that it may not accurately
   * reflect the DOM element's actual frame (due to various CSS styles that may
   * be applied). Setting the bounds of the view will adjust the frame.
   *
   * Triggers `frameDidChange` and and `boundsDidChange` whenever the bounds are changed, and `boundsDidChange`
   *
   * @property bounds
   * @type rect
   * @default zeroRect
   */
  self.__defineGetter__("bounds", self.getBounds);
  self.__defineSetter__("bounds", self.setBounds);
  /**
   * Represents the frame of the view. Keep in mind that it may not accurately
   * reflect the DOM element's actual frame (due to various CSS styles that may
   * be applied). Setting the frame of the view will adjust the bounds if necessary.
   *
   * Triggers `frameDidChange` whenever the frame is changed, and `boundsDidChange` only if the bounds actuallly
   * change.
   *
   * @property frame
   * @type rect
   * @default zeroRect
   */
  self.__defineGetter__("frame", self.getFrame);
  self.__defineSetter__("frame", self.setFrame);


  /**
   * Indicates if the view should use the GPU for compositing.
   *
   * @private
   * @property _useGPU
   * @type boolean
   * @default false
   */
  self._useGPU = false;
  /**
   * Indicates if the view should use the GPU for positioning the view. Requires
   * that `_useGPU` is `true`.
   *
   * @private
   * @property _useGPUForPositioning
   * @type boolean
   * @default false
   */
  self._useGPUForPositioning = false;
  /**
   * Returns whether or not the view is using the GPU for compositing. If `true`,
   * the view is using the GPU (if available) for compositing. If `false`, it isn't.
   *
   * @method getUseGPU
   * @returns {boolean}
   */
  self.getUseGPU = function ()
  {
    return self._useGPU;
  }
  /**
   * Returns whether the view is using the GPU for positioning. If `true`,
   * the view is using the GPU (if available, and getUseGPU is `true`),
   * otherwise it is not.
   *
   * @method getUseGPUForPositioning
   * @returns {boolean}
   */
  self.getUseGPUForPositioning = function ()
  {
    return self._useGPUForPositioning;
  }
  /**
   * Sets whether or not the view should use the GPU (if available) for compositing.
   * @method setUseGPU
   * @parameter v {boolean} `true` to use the GPU; `false` to use software compositing.
   */
  self.setUseGPU = function ( v )
  {
    self._useGPU = v;
    if (v)
    {
      if (!self._useGPUForPositioning)
      {
        self._element.style.webkitTransform = "translate3d(0,0,0)";
      }
      else
      {
        self._element.style.webkitTransform = "translate3d(" + self._frame.origin.x + "px," + self._frame.origin.y + "px,0)";
//        self._element.style.webkitTransform = "translate(" + self._frame.origin.x + "px," + self._frame.origin.y + "px)";
      }
    }
    else
    {
      self._element.style.webkitTransform = "inherit";
    }
  }
  /**
   * Sets whether or not the view should be positioned using the GPU (if available). Een should
   * this value be set to `true`, it only takes effect if the view is also compositing via the
   * GPU.
   *
   * @method setUseGPUForPositioning
   * @param v {boolean} `true` to use the GPU for positioning; `false` to use regular `top`/`left` styling.
   */
  self.setUseGPUForPositioning = function ( v )
  {
    self._useGPUForPositioning = v;
    if (v && self._useGPU)
    {
      self._element.style.top = "";
      self._element.style.left = "";
    }
    else
    {
      if (self._useGPU)
      {
        self._element.style.webkitTransform = "translate3d(0,0,0)";
      }
      else
      {
        self._element.style.webkitTransform = "";
      }
    }
    self.notify ( "frameDidChange" );
  }
  /**
   * Determines whether or not to use the GPU for compositing. If changed, the
   * DOM element will be updated appropriately.
   *
   * @property useGPU
   * @type boolean
   * @default false
   */
  self.__defineGetter__("useGPU", self.getUseGPU);
  self.__defineSetter__("useGPU", self.setUseGPU);
  /**
   * Determines wether or not to use the GPU for positioning. If changed, the DOM
   * element is updated appropriately. `useGPU` must be `true` for it to have
   * any effect.
   *
   * @property useGPUForPositioning
   * @type boolean
   * @default false
   */
  self.__defineGetter__("useGPUForPositioning", self.getUseGPUForPositioning);
  self.__defineSetter__("useGPUForPositioning", self.setUseGPUForPositioning);

  /**
   *
   * recalculates the element's position based on
   * the frame. It also calls calcElement() for the
   * object, if defined. After that, it calls the
   * _calcElement for every subview, in case they
   * decide to be re-positioned.
   *
   * @private
   * @method _calcElement
   * @param o {PKObject} the object being calc'd
   * @param n {String} the notification
   */
  self._calcElement = function ( o, n )
  {    
    // allow us the opportunity to override
    if ( n == "frameDidChange" )
    {
      if (self.calcElement)
      {
        self.calcElement();
      }
    }

    // and notify all our sub views if our bounds have changed
    if ( n == "boundsDidChange" )
    {
      for (var i=0; i<self._subViews.length; i++)
      {
        if ( self._subViews[i]._calcElement )
        {
          self._subViews[i]._calcElement();
        }
      }
    }
  }
  /**
   * Calculates the position and size (and other various properties) of the element.
   * To a small degree, this would be like the drawRect() in other native frameworks.
   *
   * > Override to provide different positioning methods.
   *
   * > Called automatically when the frame changes.
   *
   * @method calcElement
   */
  self.calcElement = function ()
  {
    // only change properties that have changed
    if (self._element.style.position != "absolute") { self._element.style.position = "absolute"; }
    if (self._useGPUForPositioning && self._useGPU)
    {
      self._element.style.webkitTransform = "translate3d(" + self._frame.origin.x + "px," + self._frame.origin.y + "px,0)";  
//      self._element.style.webkitTransform = "translate(" + self._frame.origin.x + "px," + self._frame.origin.y + "px)";  
    }
    else
    {
      if (self._frame.origin.y + "px" != self._element.style.top) { self._element.style.top = self._frame.origin.y + "px"; }
      if (self._frame.origin.x + "px" != self._element.style.left) { self._element.style.left = self._frame.origin.x + "px"; }
    }
    if (self._frame.size.w + "px" != self._element.style.width) { self._element.style.width = self._frame.size.w + "px"; }
    if (self._frame.size.h + "px" != self._element.style.height) { self._element.style.height = self._frame.size.h + "px"; }
    
  }
  // when our frame changes, we must know. Call self._calcElement
  self.addListenerForNotification ( "frameDidChange" , self._calcElement );

  /*
   *
   * Every view has a background color, even if it is transparent.
   *
   */
  /**
   * The background color of the view. When null, the background color is applied to the DOM
   * element as `inherit`.
   *
   * @private
   * @property _backgroundColor
   * @type color
   * @default null
   */
  self._backgroundColor = null;
  /**
   * Returns the background color, or null if there is no background color set.
   *
   * @method getBackgroundColor
   * @returns {color}
   */
  self.getBackgroundColor = function ()
  {
    return self._backgroundColor;
  };
  /**
   * Sets the background color, and fires `backgroundColorDidChange`. If the color
   * is null, the DOM element will receive `inherit`
   *
   * @method setBackgroundColor
   * @param theColor {color}
   */
  self.setBackgroundColor = function ( theColor )
  {
    self._backgroundColor = UI.copyColor(theColor);
    self._element.style.backgroundColor = UI._colorToRGBA (theColor);
    self.notify ("backgroundColorDidChange");
  };

  /**
   * The background color for the view. Changing it will fire `backgroundColorDidChange`.
   *
   * @property backgroundColor
   * @type color
   * @default null
   */
  self.__defineGetter__("backgroundColor", self.getBackgroundColor);
  self.__defineSetter__("backgroundColor", self.setBackgroundColor);

  /*
   *
   * Every view can have a background image
   *
   */
  /**
   * The background image can be a real image or a gradient. 
   *
   * @private
   * @property _backgroundImage
   * @type image
   * @default null
   */
  self._backgroundImage = null;
  /**
   * returns the background image, if any.
   *
   * @method getBackgroundImage
   * @returns {image}
   */
  self.getBackgroundImage = function ()
  {
    return self._backgroundImage;
  }
  /**
   * sets the background image. If `theImage` is `null`, the element will
   * be `inherit` instead. Fires `backgroundImageDidChange`.
   *
   * @method setBackgroundImage
   * @param theImage {image}
   */
  self.setBackgroundImage = function ( theImage )
  {
    self._backgroundImage = UI.copyImage ( theImage );
    UI._applyImageToElement ( self._element, self._backgroundImage );
    self.notify ("backgroundImageDidChange");
  }
  /**
   * The background image of the view, or `null` if none. Changing
   * will fire `backgroundImageDidChange`.
   *
   * @property backgroundImage
   * @type image
   * @default null
   */
  self.__defineGetter__("backgroundImage", self.getBackgroundImage);
  self.__defineSetter__("backgroundImage", self.setBackgroundImage);

  /*
   *
   * Every view can also have a border
   *
   */
  /**
   * The border, if any, for the view.
   *
   * @private
   * @property _border
   * @type border
   * @default null
   */
  self._border = null;
  /**
   * Returns the border for the view, `null` if no border.
   *
   * @method getBorder
   * @returns {border}
   */
  self.getBorder = function ()
  {
    return self._border;
  }
  /**
   * Sets the border of the view. If `null`, the view receives inherited borders. Fires `borderDidChange`.
   *
   * @method setBorder
   * @param theBorder {border}
   */
  self.setBorder = function ( theBorder )
  {
    self._border = UI.copyBorder (theBorder);
    UI._applyBorderToElement ( self._element, self._border )
    {
      self.notify ("borderDidChange");
    }
  }
  /**
   * The border for the view. If changed, fires `borderDidChange`.
   *
   * @property border
   * @type border
   * @default null
   */
  self.__defineGetter__("border", self.getBorder);
  self.__defineSetter__("border", self.setBorder);

  /*
   *
   * And every view can also have multiple shadows
   *
   */
  /**
   * Array of shadows for the view.
   *
   * @private
   * @property _shadows
   * @type Array
   * @default empty
   */
  self._shadows = [];
  /**
   * Returns all the shadows in an array. If there are no shadows, the
   * array will be empty.
   *
   * @method getShadows
   * @returns {Array} of shadows
   */
  self.getShadows = function ()
  {
    return self._shadows;
  }
  /**
   * Sets the shadows for the view. `theShadows` must be an Array of shadow
   * objects. Shadows are applied to the DOM element in the order they appear
   * in the Array. Calling this method fires `shadowDidChange`.
   *
   * @method setShadows
   * @param theShadows {Array} (of shadows)
   */
  self.setShadows = function ( theShadows )
  {
    var shadowString = "";
    self._shadows = [];
    for (var i=0; i<theShadows.length; i++)
    {
      self._shadows.push ( UI.copyShadow ( theShadows[i] ) );
      shadowString += UI._shadowToBoxShadow ( self._shadows[i] );
      if (i<theShadows.length-1)
      {
        shadowString += ", ";
      }
    }
    self._element.style.boxShadow = shadowString;
    self.notify ("shadowDidChange");
  }
  /**
   * The shadows for the view. Shadows are applied to the DOM element in the
   * order they appear in the array. If the property is set, `shadowDidChange`
   * is fired.
   *
   * @property shadows
   * @type Array
   * @default empty
   */
  self.__defineGetter__("shadows", self.getShadows);
  self.__defineSetter__("shadows", self.setShadows);

  /*
   *
   * Every view can be shown or hidden
   *
   */
  /**
   * Maintains the visibility state of the object
   * @private
   * @property _visible
   * @type boolean
   * @default true
   */
  self._visible = true;
  /**
   * Returns the visibility of the view.
   *
   * @method getVisibility
   * @returns {boolean} `true` if the view is visible.
   */
  self.getVisibility = function ()
  {
    return self._visible;
  }
  /**
   * Sets the visibility of the view. If the view is appearing, the `viewWillAppear`
   * notification will be fired, followed by a `viewDidAppear`. If the view is
   * disappearing, the `viewWillDisappear` will be fired, followed by a `viewDidDisappear`.
   * No matter what, `visibilityDidChange` will fire.
   *
   * > The DOM Element will receive a `display: inherit` while visible, to ensure that styling
   * > can apply whatever `display` property it wants when the view is visible.
   *
   * @method setVisibility
   * @param visibility {boolean} `true` to show the view; `false` to hide it.
   */
  self.setVisibility = function ( visibility )
  {
    if (self._visible != visibility)
    {
      self.notify ( visibility ? "viewWillAppear" : "viewWillDisappear" );
      self._visible = visibility;
      self._element.style.display = ( visibility ? "inherit" : "none" );
      self.notify ( visibility ? "viewDidAppear" : "viewDidDisappear" );
      self.notify ( "visibilityDidChange" );
    }
  }
  /**
   * The state of the object's visibility. If `true`, the object is visible. Changing
   * the state will cause the obhect to hide or show, depending upon the assignment.
   * If the view is appearing, the `viewWillAppear`
   * notification will be fired, followed by a `viewDidAppear`. If the view is
   * disappearing, the `viewWillDisappear` will be fired, followed by a `viewDidDisappear`.
   * No matter what, `visibilityDidChange` will fire.
   *
   * > The DOM Element will receive a `display: inherit` while visible, to ensure that styling
   * > can apply whatever `display` property it wants when the view is visible.
   *
   * @property visible
   * @type boolean
   * @default true
   */   
  self.__defineGetter__("visible", self.getVisibility);
  self.__defineSetter__("visible", self.setVisibility);

  /*
   *
   * Every view has opacity
   *
   */
  /**
   * Opacity of the view; 1.0 = fully opaque; 0.0 = fully transparent.
   *
   * @private
   * @property _opacity
   * @type Number
   * @default 1.0
   */
  self._opacity = 1.0;
  /**
   * returns the opacity of the view.
   *
   * @method getOpacity
   * @returns {Number}
   */
  self.getOpacity = function ()
  {
    return self._opacity;
  }
  /**
   * Sets the opacity of the view. Fires `opacityDidChange`.
   *
   * @method setOpacity
   * @param opacity {Number} A number between 0.0 and 1.0
   */
  self.setOpacity = function ( opacity )
  {
    if (self._opacity != opacity)
    {
      self._opacity = opacity;
      self._element.style.opacity = opacity;
      self.notify ( "opacityDidChange" );
    }
  }
  /**
   * The opacity of the view from 0.0 (transparent) to 1.0 (fully opaque).
   * When changed, `opacityDidChange` is fired.
   *
   * @property opacity
   * @type Number
   * @default 1.0
   */
  self.__defineGetter__("opacity", self.getOpacity);
  self.__defineSetter__("opacity", self.setOpacity);

  /*
   *
   * Views can override their scrolling
   *
   */
  /**
   * By default views inherit their scrolling (which is typically overflow:hidden),
   * but they can determine their overflow capability (hidden, auto, scroll).
   *
   * @private
   * @property _overflow
   * @type String
   * @default "inherit"
   */
  self._overflow = "inherit";
  /**
   * Returns the overflow property; "inherit" means that the view inherits its scrolling
   * capability (which is usually overflow:hidden). Valid values are `hidden`, `auto`, `scroll`.
   *
   * @method getOverflow
   * @returns {String}
   */
  self.getOverflow = function ()
  {
    return self._overflow;
  }
  /**
   * Sets the overflow property; "inherit" means that the view inherits its scrolling
   * capability (which is usually overflow:hidden). Valid values are `hidden`, `auto`, `scroll`.
   *
   * @method setOverflow
   * @param v {String} `hidden`, `auto`, `scroll`, `inherit`.
   */
  self.setOverflow = function ( v )
  {
    self._overflow = v;
    self._element.style.overflow = v;
  }
  /**
   * The CSS overflow property. "inherit" means that the view inherits its scrolling
   * capability (which is usually overflow:hidden). Valid values are `hidden`, `auto`, `scroll`.
   *
   * @property overflow
   * @type String
   * @default "inherit"
   */
  self.__defineGetter__("overflow", self.getOverflow);
  self.__defineSetter__("overflow", self.setOverflow);

  /*
   *
   * event processing
   *
   */
  /**
   * Called when the view is interactive and a touchStart event has been fired.
   * It will add a `touched` event to the DOM Element's class (for the benefit of
   * any CSS), and then indicates the potential for a tap. `touchStarted` will be
   * fired and will call `touchStart` with the event if possible.
   * @private
   * @method _touchStart
   * @param e {DOMEvent}
   */
  self._touchStart = function ( e )
  {
    var event = UI.makeEvent ( e || window.event );
    self._element.className += " touched ";
    self._tapPotential = true;
    self.notify ( "touchStarted" );
    if (self.touchStart)
    {
      return self.touchStart ( event );
    }
  }
  /**
   * Called, if defined, whenever the view receives the start of a touch and is
   * interactive.
   *
   * @optional
   * @method touchStart
   * @param event {event}
   */

  /**
   * Called whenever a touch event moves if the view is interactive. It will
   * remove any `touched` class from the DOM element, and then send `touchMoved`
   * as a notification. It will clear the tap potential. Finally, if defined,
   * it will call `touchMove` with the event.
   *
   * @private
   * @method _touchMove
   * @param event {DOMEvent}
   */
  self._touchMove = function ( e )
  {
    var event = UI.makeEvent ( e || window.event );
    self._tapPotential = false;
    if (self._element.className)
    {
      self._element.className = self._element.className.replace(/touched/g,"");
    }
    self.notify ( "touchMoved" );
    if (self.touchMove)
    {
      return self.touchMove ( event );
    }
  }
  /**
   * Called whenever the touch moves on the view, if it is interactive.
   *
   * @optional
   * @method touchMove
   * @param event {event}
   */

  /**
   * Called whenever the touch ends. It removes any `touched` class from the DOM element
   * and checks the tap potential. If there's been no movement, it will fire `tapped`.
   * No matter what, `touchEnded` is fired, and then `touchEnd` is called if defined.
   *
   * @private
   * @method _touchEnd
   * @param e {DOMEvent}
   *
   */
  self._touchEnd = function ( e )
  {
    var event = UI.makeEvent ( e || window.event );
    if (self._element.className)
    {
      self._element.className = self._element.className.replace(/touched/g,"");
    }
    self.notify ( "touchEnded" );
    if (self._tapPotential)
    {
      self.notify ( "tapped" );
    }
    self._tapPotential = false;
    if (self.touchEnd)
    {
      return self.touchEnd ( event );
    }
  }
  /**
   * Called, if defined, whenever a touch event ends.
   *
   * @method touchEnd
   * @param event {event}
   */

  /**
   * Stores the state of the view's interactivity.
   *
   * @private
   * @property _interactive
   * @type boolean
   * @default false
   */
  self._interactive = false;
  /**
   * Stores whether or not touch handlers have been added to the DOM element.
   * This ensures that they will only ever be added once.
   *
   * @private
   * @property _touchHandlersAdded
   * @type boolean
   * @default false
   */
  self._touchHandlersAdded = false;
  /**
   * Returns the interactive status of the view. If `true`, the view can be interacted with via touch.
   *
   * @method getInteractive
   * @returns {boolean}
   */
  self.getInteractive = function ()
  {
    return self._interactive;
  }
  /**
   * Sets the interactive status of the view. If `true` is passed, touch handlers are added to the view
   * and touch events can be processed. If `false` is passed, touch handlers are removed and touch
   * events are no longer processed.
   *
   * @method setInteractive
   * @param v {boolean}
   */
  self.setInteractive = function ( v )
  {
    self._interactive = v;
    if (v)
    {
      if (!self._touchHandlersAdded)
      {
        UI._addEventListener ( self._element, "touchstart", self._touchStart );
        UI._addEventListener ( self._element, "touchmove", self._touchMove );
        UI._addEventListener ( self._element, "touchend", self._touchEnd );      
      }
      self._touchHandlersAdded = true;
    }
    else
    {
      if (self._touchHandlersAdded)
      {
        UI._removeEventListener ( self._element, "touchstart", self._touchStart );
        UI._removeEventListener ( self._element, "touchmove", self._touchMove );
        UI._removeEventListener ( self._element, "touchend", self._touchEnd );
        self._touchHandlersAdded = false;        
      }
    }
  }
  /**
   * Whether or not the view is interactive. If `true`, it is, and touch events will be
   * generated.
   *
   * @property interactive
   * @type boolean
   * @default false
   */
  self.__defineGetter__("interactive", self.getInteractive);
  self.__defineSetter__("interactive", self.setInteractive);

  /**
   *
   * Initializes the view by creating the DOM element and setting its class.
   * Once complete, the view fires `viewDidInit`
   *
   * > `noNotify` should only ever be passed from overridden `init`s. The value
   * > in that case should always be `true` in order to prevent multiple 
   * > `viewDidInit`.
   *
   * @method init
   * @param {boolean} [noNotify]
   *
   */
  self.overrideSuper ( self.class, "init", self.init );
  self.init = function ( noNotify )
  {
    // super first
    self.super ( "UIView", "init" );

    // any view initialization
    self._element = document.createElement ( self.class );
    self._element.className = self._classHierarchy.join (" ");
    //self.backgroundColor = UI.COLOR.lightGrayColor();

    // notify of the initialization
    if (!noNotify) { self.notify ( "viewDidInit" ); }
  };
  /**
   * Initializes the view by calling `init` and then sets the frame.
   *
   * @method initWithFrame
   * @param theFrame {frame}
   */
  self.initWithFrame = function ( theFrame )
  {
    self.init();
    self.frame = theFrame;
  };
  /**
   * Initializes the view by calling `init` and then sets all the options in the `options` object.
   *
   * @method initWithOptions
   * @param options {Object} the options. Each property that is supported by the view is also
   *                         supported in this object. The idea is to simplify initialization code
   *                         just a little.
   */
  self.initWithOptions = function ( options )
  {
    self.init();
    if (options.frame)              { self.frame = options.frame; }
    if (options.backgroundColor)    { self.backgroundColor = options.backgroundColor; }
    if (options.backgroundImage)    { self.backgroundImage = options.backgroundImage; }
    if (options.border)             { self.border = options.border; }
    if (options.shadows)            { self.shadows = options.shadows; }
    if (options.visible)            { self.visible = options.visible; }
    if (options.opacity)            { self.opacity = options.opacity; }
    if (options.useGPU)             { self.useGPU = options.useGPU; }
    if (options.useGPUForPositioning) { self.useGPUForPositioning = options.useGPUForPositioning; }
    if (options.overflow)           { self.overflow = options.overflow; }
    if (options.interactive)        { self.interactive = options.interactive; }
  };

  return self;

}
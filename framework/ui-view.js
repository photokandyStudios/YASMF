/******************************************************************************
 *
 * UI-VIEW
 * Author: Kerri Shotts
 * Version: 0.3
 *
 * UI-VIEW provides the UI.View object
 *
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
/*requires pk-object.js */
PKUTIL.require ( ["PKUTIL", "UI", "PKObject"], function () 
{ 
    PKUTIL.export ( "UIView" );
});

var UI = UI || {};

UI.View = function ()
{
  var self = new PKObject();
  self.subclass ( "UIView" );

  // register any notifications
  self.registerNotification ( "boundsDidChange" );
  self.registerNotification ( "frameDidChange" );
  self.registerNotification ( "backgroundColorDidChange" );
  self.registerNotification ( "opacityDidChange" );
  self.registerNotification ( "visibilityDidChange" );
  self.registerNotification ( "viewWillAppear" );
  self.registerNotification ( "viewDidAppear" );
  self.registerNotification ( "viewWillDisappear" );
  self.registerNotification ( "viewDidDisappear" );
  self.registerNotification ( "viewDidInit" );


  /**
   *
   * All views have direct DOM representations
   *
   */
  self._element = null; 
  /**
   *
   * All views have subviews
   *
   */
  self._subViews = [];
  self._superView = null;
  self.addSubView = function ( theView )
  {
    self._subViews.push ( theView );
    theView._superView = self;

    // make sure our element knows about it.
    self._element.appendChild ( theView._element );
  };
  self.removeSubView = function ( theView )
  {
    self._subViews.splice ( self._subViews.indexOf(theView), 1 );
    theView._superView = null;

    // and our element needs to be removed
    self._element.removeChild ( theView._element );
  };
  self.removeFromSuperView = function ()
  {
    self._superView.removeSubView ( self );
  };
  self.getSubViews = function ()
  {
    return self._subViews;
  }
  self.getSuperView = function ()
  {
    return self._superView;
  }
  self.__defineGetter__ ( "subViews", self.getSubViews );
  self.__defineGetter__ ( "superView", self.getSuperView );

  /**
   *
   * All views have bounds and frames.
   *
   */
  self._bounds = UI.zeroRect();
  self._frame = UI.zeroRect();
  self.getBounds = function ()
  {
    return self._bounds;
  }
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
  self.getFrame = function ()
  {
    return self._frame;
  }
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
  self.__defineGetter__("bounds", self.getBounds);
  self.__defineSetter__("bounds", self.setBounds);
  self.__defineGetter__("frame", self.getFrame);
  self.__defineSetter__("frame", self.setFrame);

  self._useGPU = false;
  self._useGPUForPositioning = false;
  self.getUseGPU = function ()
  {
    return self._useGPU;
  }
  self.getUseGPUForPositioning = function ()
  {
    return self._useGPUForPositioning;
  }
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
  self.__defineGetter__("useGPU", self.getUseGPU);
  self.__defineSetter__("useGPU", self.setUseGPU);
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

  /**
   *
   * Every view has a background color, even if it is transparent.
   *
   */
  self._backgroundColor = null;
  self.getBackgroundColor = function ()
  {
    return self._backgroundColor;
  };
  self.setBackgroundColor = function ( theColor )
  {
    self._backgroundColor = UI.copyColor(theColor);
    self._element.style.backgroundColor = UI._colorToRGBA (theColor);
    self.notify ("backgroundColorDidChange");
  };

  self.__defineGetter__("backgroundColor", self.getBackgroundColor);
  self.__defineSetter__("backgroundColor", self.setBackgroundColor);

  /**
   *
   * Every view can be shown or hidden
   *
   */
  self._visible = true;
  self.getVisibility = function ()
  {
    return self._visible;
  }
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
  self.__defineGetter__("visible", self.getVisibility);
  self.__defineSetter__("visible", self.setVisibility);

  /**
   *
   * Every view has opacity
   *
   */
  self._opacity = 1.0;
  self.getOpacity = function ()
  {
    return self._opacity;
  }
  self.setOpacity = function ( opacity )
  {
    if (self._opacity != opacity)
    {
      self._opacity = opacity;
      self._element.style.opacity = opacity;
      self.notify ( "opacityDidChange" );
    }
  }
  self.__defineGetter__("opacity", self.getOpacity);
  self.__defineSetter__("opacity", self.setOpacity);

  /**
   *
   * Views can override their scrolling
   *
   */
  self._overflow = "inherit";
  self.getOverflow = function ()
  {
    return self._overflow;
  }
  self.setOverflow = function ( v )
  {
    self._overflow = v;
    self._element.style.overflow = v;
/*    if (v=="scroll")
    {
        self._element.style.webkitOverflowScrolling = "touch";
    }
    else
    {      
        self._element.style.webkitOverflowScrolling = "";
    } */
  }
  self.__defineGetter__("overflow", self.getOverflow);
  self.__defineSetter__("overflow", self.setOverflow);


  /**
   *
   * init
   *
   */
  self.overrideSuper ( self.class, "init", self.init );
  self.init = function ( noNotify )
  {
    // super first
    self.super ( "UIView", "init" );

    // any view initialization
    self._element = document.createElement ( self.class );
    self.backgroundColor = UI.COLOR.lightGrayColor();

    // notify of the initialization
    if (!noNotify) { self.notify ( "viewDidInit" ); }
  };
  self.initWithFrame = function ( theFrame )
  {
    self.init();
    self.frame = theFrame;
  };
  self.initWithOptions = function ( options )
  {
    self.init();
    if (options.frame)              { self.frame = options.frame; }
    if (options.backgroundColor)    { self.backgroundColor = options.backgroundColor; }
    if (options.visible)            { self.visible = options.visible; }
    if (options.opacity)            { self.opacity = options.opacity; }
    if (options.useGPU)             { self.useGPU = options.useGPU; }
    if (options.useGPUForPositioning) { self.useGPUForPositioning = options.useGPUForPositioning; }
    if (options.overflow)           { self.overflow = options.overflow; }
  };

  return self;

}
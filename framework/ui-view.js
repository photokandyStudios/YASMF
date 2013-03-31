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
    self._frame.size = UI.copySize ( newBounds.size );
    self.notify ("boundsDidChanged");
    self.notify ("frameDidChange");
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
    self._bounds.size = UI.copySize ( newFrame.size );
    self.notify ("frameDidChange");
    self.notify ("boundsDidChange");
  }
  self.__defineGetter__("bounds", self.getBounds);
  self.__defineSetter__("bounds", self.setBounds);
  self.__defineGetter__("frame", self.getFrame);
  self.__defineSetter__("frame", self.setFrame);

  /**
   *
   * recalculates the element's position based on
   * the frame. It also calls calcElement() for the
   * object, if defined. After that, it calls the
   * _calcElement for every subview, in case they
   * decide to be re-positioned.
   *
   */
  self._calcElement = function ()
  {    
    // allow us the opportunity to override
    if (self.calcElement)
    {
      self.calcElement();
    }

    // and notify all our sub views.
    for (var i=0; i<self._subViews.length; i++)
    {
      if ( self._subViews[i]._calcElement )
      {
        self._subViews[i]._calcElement();
      }
    }
  }
  self.calcElement = function ()
  {
    // only change properties that have changed
    if (self._element.style.position != "absolute") { self._element.style.position = "absolute"; }
    if (self._frame.origin.y + "px" != self._element.style.top) { self._element.style.top = self._frame.origin.y + "px"; }
    if (self._frame.origin.x + "px" != self._element.style.left) { self._element.style.left = self._frame.origin.x + "px"; }
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
    //self._element.style.display = "none"; // views are hidden by default    

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
  };

  return self;

}
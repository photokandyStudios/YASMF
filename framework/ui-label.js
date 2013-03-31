/******************************************************************************
 *
 * UI-LABEL
 * Author: Kerri Shotts
 * Version: 0.3
 *
 * UI-LABEL provides the UI.Label object
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
PKUTIL.require ( ["UIView"], function () 
{ 
    PKUTIL.export ( "UILabel" );
});

var UI = UI || {};

UI.Label = function ()
{
  var self = new UI.View();
  self.subclass ( "UILabel" );

  // register any notifications
  self.registerNotification ( "textDidChange" );
  self.registerNotification ( "textColorDidChange" );
  self.registerNotification ( "shadowDidChange" );
  self.registerNotification ( "textAlignmentDidChange" );
  self.registerNotification ( "fontDidChange" );


  /**
   *
   * labels have the following properties:
   *  - text (properlly innerHTML)
   *  - textColor ( font Color )
   *  - shadow
   *  - shadowColor
   *  - shadowOffset
   *  - textAlignment
   *  - font 
   *
   */

  self._text = "";
  self._textAlignment = "inherit";
  self._textColor = null;
  self._shadow = null;
  self._font = null;

  self.getText          = function () { return self._text; }
  self.getTextAlignment = function () { return self._textAlignment; }
  self.getTextColor     = function () { return self._textColor; }
  self.getShadow        = function () { return self._shadow; }
  self.getFont          = function () { return self._font; }

  self.__defineGetter__("text", self.getText);
  self.__defineGetter__("textAlignment", self.getTextAlignment);
  self.__defineGetter__("textColor", self.getTextColor);
  self.__defineGetter__("shadow", self.getShadow);
  self.__defineGetter__("font", self.getFont);

  self.setText = function ( theText )
  {
    if (self._text != theText)
    {
      self._text = theText;
      self._element.innerHTML = theText;
      self.notify ( "textDidChange" );
    }
  }
  self.__defineSetter__("text", self.setText);

  self.setTextColor = function ( theTextColor )
  {
    self._textColor = UI.copyColor(theTextColor);
    self._element.style.color = UI._colorToRGBA(theTextColor);
    self.notify ( "textColorDidChange" );
  }
  self.__defineSetter__("textColor", self.setTextColor);

  self.setTextAlignment = function ( theTextAlignment )
  {
    if (self._textAlignment != theTextAlignment )
    {
      self._textAlignment = theTextAlignment;
      self._element.style.textAlign = theTextAlignment;
      self.notify ( "textAlignmentDidChange" );
    }
  }
  self.__defineSetter__("textAlignment", self.setTextAlignment);

  self.setShadow = function ( theShadow )
  {
    self._shadow = UI.copyShadow( theShadow );
    UI._applyShadowToElement ( self._element, theShadow );
    self.notify ( "shadowDidChange" );
  }
  self.__defineSetter__("shadow", self.setShadow);

  self.setFont = function ( theFont )
  {
    self._font = UI.copyFont ( theFont );
    UI._applyFontToElement ( self._element, theFont );
    self.notify ( "fontDidChange" );
  }
  self.__defineSetter__("font", self.setFont);
  /**
   *
   * init
   *
   */
  self.overrideSuper ( self.class, "init", self.init );
  self.init = function ( noNotify )
  {
    // super first
    self.super ( "UILabel", "init", true ); // don't notify yet

    // any view initialization

    // notify of the initialization
    if (!noNotify) { self.notify ( "viewDidInit" ); }
  };

  self.overrideSuper ( self.class, "initWithOptions", self.initWithOptions );
  self.initWithOptions = function ( options )
  {
    self.super ( "UILabel", "initWithOptions", options );
    if (options.text)            { self.text = options.text; }
    if (options.textColor)       { self.textColor = options.textColor; }
    if (options.textAlignment)   { self.textAlignment = options.textAlignment; }
    if (options.shadow)          { self.shadow = options.shadow; }
    if (options.font)            { self.font = options.font; }
  };

  return self;

}
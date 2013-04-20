/**
 *
 * UI-LABEL provides the UI.Label object
 * @namespace UI
 * @module UI.Label
 * @requires PKUTIL, UI, UI.View, PKObject, PKUI
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
PKUTIL.require ( ["UIView"], function () 
{ 
    PKUTIL.export ( "UILabel" );
});

var UI = UI || {};

/**
 * A simple label widget.
 *
 * @class UI.Label
 * @extends UI.View
 */
UI.Label = function ()
{
  var self = new UI.View();
  self.subclass ( "UILabel" );

  // register any notifications
  /**
   * Fires when the text is changed in the label.
   * @event textDidChange
   */
  self.registerNotification ( "textDidChange" );
  /**
   * Fires when the text color is changed in the label.
   * @event textColorDidChange
   */
  self.registerNotification ( "textColorDidChange" );
  /**
   * Fires when the text shadow is changed in the label.
   * @event textShadowDidChange
   */
  self.registerNotification ( "textShadowDidChange" );
  /**
   * Fires when the text alignment is changed in the label.
   * @event textAlignmentDidChange
   */
  self.registerNotification ( "textAlignmentDidChange" );
  /**
   * Fires when the font is changed in the label.
   * @event fontDidChange
   */
  self.registerNotification ( "fontDidChange" );


  /*
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

  /**
   * The text to display.
   * @private
   * @property _text
   * @default ""
   * @type String
   */
  self._text = "";
  /**
   * The text alignment.
   * @private
   * @property _textAlignment
   * @default ""
   * @type String
   */
  self._textAlignment = "inherit";
  /**
   * The text color; if `null` the color is given as `inherit`.
   * @private
   * @property _textColor
   * @default ""
   * @type String
   */
  self._textColor = null;
  /**
   * The text shadow; if `null`, `inherit`.
   * @private
   * @property _textShadow
   * @default ""
   * @type String
   */
  self._textShadow = null;
  /**
   * The font for the text. If `null`, `inherit`.
   * @private
   * @property _font
   * @default ""
   * @type String
   */
  self._font = null;

  /**
   * Returns the text for the label.
   * @method getText
   * @returns {String}
   */
  self.getText          = function () { return self._text; }
  /**
   * Returns the text alignmentfor the label.
   * @method getTextAlignment
   * @returns {String}
   */
  self.getTextAlignment = function () { return self._textAlignment; }
  /**
   * Returns the text color for the label.
   * @method getTextColor
   * @returns {color}
   */
  self.getTextColor     = function () { return self._textColor; }
  /**
   * Returns the text shadow for the label.
   * @method getTextShadow
   * @returns {shadow}
   */
  self.getTextShadow    = function () { return self._textShadow; }
  /**
   * Returns the font for the label.
   * @method getFont
   * @returns {font}
   */
  self.getFont          = function () { return self._font; }

  /**
   * The text for the label. If changed, `textDidChange` is fired.
   *
   * @property text
   * @type String
   * @default ""
   */
  self.__defineGetter__("text", self.getText);
  /**
   * The textAlignment for the label. If changed, `textAlignmentDidChange` is fired.
   *
   * Valid values are `left`, `center`, `right`.
   *
   * @property textAlignment
   * @type String
   * @default "inherit"
   */
  self.__defineGetter__("textAlignment", self.getTextAlignment);
  /**
   * The text color for the label. If changed, `textColorDidChange` is fired.
   *
   * @property textColor
   * @type color
   * @default null
   */
  self.__defineGetter__("textColor", self.getTextColor);
  /**
   * The text shadow for the label. If changed, `textShadowDidChange` is fired.
   *
   * @property textShadow
   * @type shadow
   * @default null
   */
  self.__defineGetter__("textShadow", self.getTextShadow);
  /**
   * The font for the label. If changed, `fontDidChange` is fired.
   *
   * @property font
   * @type font
   * @default null
   */
  self.__defineGetter__("font", self.getFont);

  /**
   * Sets the text for the label. Fires `textDidChange`.
   *
   * > Since `innerHTML` is set on the DOM element, the text can contain
   * > HTML and other elements.
   *
   * @method setText
   * @param theText {String}
   */
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

  /**
   * Sets the text color for the label. Fires `textColorDidChange`.
   * @method setTextColor
   * @param theTextColor {color}
   */
  self.setTextColor = function ( theTextColor )
  {
    self._textColor = UI.copyColor(theTextColor);
    self._element.style.color = UI._colorToRGBA(theTextColor);
    self.notify ( "textColorDidChange" );
  }
  self.__defineSetter__("textColor", self.setTextColor);

  /**
   * Sets the text alignment for the label. Fires `textAlignmentDidChange`.
   * @method setTextAlignment
   * @param theTextAlignment {String} `left`, `center`, `right`, `inherit`
   */
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

  /**
   * Sets the text shadow for the label. Fires `textShadowDidChange`.
   * @method setTextShadow
   * @param theTextShadow {shadow} 
   */
  self.setTextShadow = function ( theShadow )
  {
    self._shadow = UI.copyShadow( theShadow );
    UI._applyShadowToElementAsTextShadow ( self._element, theShadow );
    self.notify ( "textShadowDidChange" );
  }
  self.__defineSetter__("textShadow", self.setTextShadow);

  /**
   * Sets the font for the label. Fires `fontDidChange`.
   * @method setFont
   * @param theFont {font}
   */
  self.setFont = function ( theFont )
  {
    self._font = UI.copyFont ( theFont );
    UI._applyFontToElement ( self._element, theFont );
    self.notify ( "fontDidChange" );
  }
  self.__defineSetter__("font", self.setFont);
  /*
   *
   * Initializes the label.
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
    self.super ( "UILabel", "init", true ); // don't notify yet

    // any view initialization

    // notify of the initialization
    if (!noNotify) { self.notify ( "viewDidInit" ); }
  };

  /**
   * Initializes the view by calling `init` and then sets all the options in the `options` object.
   *
   * @method initWithOptions
   * @param options {Object} the options. Each property that is supported by the view is also
   *                         supported in this object. The idea is to simplify initialization code
   *                         just a little.
   */
  self.overrideSuper ( self.class, "initWithOptions", self.initWithOptions );
  self.initWithOptions = function ( options )
  {
    self.super ( "UILabel", "initWithOptions", options );
    if (options.text)            { self.text = options.text; }
    if (options.textColor)       { self.textColor = options.textColor; }
    if (options.textAlignment)   { self.textAlignment = options.textAlignment; }
    if (options.textShadow)          { self.textShadow = options.textShadow; }
    if (options.font)            { self.font = options.font; }
  };

  return self;

}
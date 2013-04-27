/**
 *
 * UI-NAVBAR provides the UI.NavBar object
 * @namespace UI
 * @module UI.NavBar
 * @requires PKUTIL, UI, UI.View, PKObject, PKUI, UILabel
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
PKUTIL.require ( ["UIView", "UILabel"], function () 
{ 
    PKUTIL.export ( "UINavBar" );
});

var UI = UI || {};

/**
 * A simple navigation bar widget.
 *
 * @class UI.NavBar
 * @extends UI.View
 */
UI.NavBar = function ()
{
  var self = new UI.View();
  self.subclass ( "UINavBar" );

  /**
   * The title of the navigation bar
   *
   * @property _titleView
   * @private
   * @type UI.Label
   * @default null
   */
  self._titleView = null;
  /**
   * Returns the title
   *
   * @method getTitle
   * @returns {String}
   */
  self.getTitle = function () { return self._titleView.text; }
  /**
   * Sets the title
   *
   * @method setTitle
   * @param theTitle {String}
   */
  self.setTitle = function ( theTitle )
  {
    self._titleView.text = theTitle;
  }
  /**
   * The title of the nav bar
   *
   * @property title
   * @type String
   * @default ""
   */
  self.__defineGetter__("title", self.getTitle);
  self.__defineSetter__("title", self.setTitle);


  /*
   *
   * Initializes the navbar.
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
    self.super ( "UINavBar", "init", true ); // don't notify yet

    // any view initialization
    self._titleView = new UI.Label();
    self._titleView.initWithOptions ( { text: "" } );
    self.addSubView ( self._titleView );

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
    if (options.title)            { self.title = options.title; }
  };

  return self;
}

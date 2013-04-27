/**
 *
 * This library includes functions that reflect the device and its current
 * state
 * @module PKDEVICE
 * @requires PKUTIL
 * @author Kerri Shotts
 * @version 0.3
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
/*global device, PKUTIL */
if (PKUTIL) { if (PKUTIL.export) { PKUTIL.export ( "PKDEVICE" ); } }

/**
 *
 * PKDEVICE provides simple methods for getting device information, such as platform,
 * form factor, and orientation.
 *
 * @class PKDEVICE
 */
var PKDEVICE = PKDEVICE ||
{
};
// create the namespace

/**
 * The version of the class with major, minor, and rev properties.
 *
 * @property version
 * @type Object
 *
 */
PKDEVICE.version = { major: 0, minor: 3, rev: 100 };

/**
 * Permits overriding the platform for testing. Leave set to `false` for
 * production applications.
 *
 * @property platformOverride
 * @type boolean
 * @default false
 */
PKDEVICE.platformOverride = false;
/**
 * Permits overriding the form factor. Usually used for testing.
 *
 * @property formFactorOverride
 * @type boolean
 * @default false
 */
PKDEVICE.formFactorOverride = false;

/**
 *
 * Returns the device platform, lowercased. If PKDEVICE.platformOverride is
 * other than "false", it is returned instead.
 *
 * See PhoneGap's documentation on the full range of platforms that can be
 * returned; without PG available, the method will attemt to determine the
 * platform from `navigator.platform` and the `userAgent`, but only supports
 * iOS and Android in that capacity.
 *
 * @method platform
 * @static
 * @returns {String} the device platform, lowercase.
 */
PKDEVICE.platform = function()
{
  if (PKDEVICE.platformOverride)
  {
    return PKDEVICE.platformOverride.toLowerCase();
  }
  if (!device)
  {
    if (navigator.platform == "iPad" ||
        navigator.platform == "iPad Simulator" ||
        navigator.platform == "iPhone" || 
        navigator.platform == "iPhone Simulator" ||
        navigator.platform == "iPod" )
    {
      return "ios";
    }
    if ( navigator.userAgent.toLowerCase().indexOf ("android") > -1 )
    {
      return "android";
    }
    return "unknown";
  }
  if (!device.platform)
  {
    if (navigator.platform == "iPad" ||
        navigator.platform == "iPad Simulator" ||
        navigator.platform == "iPhone" || 
        navigator.platform == "iPhone Simulator" ||
        navigator.platform == "iPod" )
    {
      return "ios";
    }
    if ( navigator.userAgent.toLowerCase().indexOf ("android") > -1 )
    {
      return "android";
    }
    return "unknown";
  }
  var thePlatform = device.platform.toLowerCase();
  //
  // turns out that for Cordova > 2.3, deivceplatform now returns iOS, so the
  // following is really not necessary on those versions. We leave it here
  // for those using Cordova <= 2.2.
  if (thePlatform.indexOf("ipad") > -1 || thePlatform.indexOf("iphone") > -1)
  {
    thePlatform = "ios";
  }
  return thePlatform;
}

/**
 *
 * Returns the device's form factor. Possible values are "tablet" and
 * "phone". If PKDEVICE.formFactorOverride is not false, it is returned
 * instead.
 *
 * @method formFactor
 * @static
 * @returns {String} `tablet` or `phone`, as appropriate
 */
PKDEVICE.formFactor = function()
{
  if (PKDEVICE.formFactorOverride)
  {
    return PKDEVICE.formFactorOverride.toLowerCase();
  }
  if (navigator.platform == "iPad")
  {
    return "tablet";
  }
  if ((navigator.platform == "iPhone") || (navigator.platform == "iPhone Simulator"))
  {
    return "phone";
  }

  // the following is hacky, and not guaranteed to work all the time,
  // especially as phones get bigger screens.

  if (Math.max(window.screen.width, window.screen.height) < 1024)
  {
    return "phone";
  }
  return "tablet";
}
/**
 *
 * Determines if the device is in Portrait orientation.
 *
 * @method isPortrait
 * @static
 * @returns {boolean} `true` if the device is in a Portrait orientation; `false` otherwise
 */
PKDEVICE.isPortrait = function()
{
  return window.orientation === 0 || window.orientation == 180 || window.location.href.indexOf("portrait") > -1;
}
/**
 *
 * Determines if the device is in Landscape orientation.
 *
 * @method isLandscape
 * @static
 * @returns {boolean} `true` if the device is in a landscape orientation; `false` otherwise
 */
PKDEVICE.isLandscape = function()
{
  if (window.location.href.indexOf("landscape") > -1)
  {
    return true;
  }
  return !PKDEVICE.isPortrait();
}
/**
 *
 * Determines if the device is a hiDPI device (aka retina)
 *
 * @method isRetina
 * @static
 * @returns {boolean} `true` if the device has a `window.devicePixelRatio` greater than `1.0`; `false` otherwise
 */
PKDEVICE.isRetina = function()
{
  return window.devicePixelRatio > 1;
}

/**
 * Returns `true` if the device is an iPad.
 *
 * @method iPad
 * @static
 * @returns {boolean}
 */
PKDEVICE.iPad = function ()
{
  return PKDEVICE.platform()==="ios" && PKDEVICE.formFactor()==="tablet";
}

/**
 * Returns `true` if the device is an iPhone (or iPod).
 *
 * @method iPhone
 * @static
 * @returns {boolean}
 */
PKDEVICE.iPhone = function ()
{
  return PKDEVICE.platform()==="ios" && PKDEVICE.formFactor()==="phone";
}

/**
 * Returns `true` if the device is an Android Phone.
 *
 * @method droidPhone
 * @static
 * @returns {boolean}
 */
PKDEVICE.droidPhone = function ()
{
  return PKDEVICE.platform()==="android" && PKDEVICE.formFactor()==="phone";
}

/**
 * Returns `true` if the device is an Android Tablet.
 *
 * @method droidTablet
 * @static
 * @returns {boolean}
 */
PKDEVICE.droidTablet = function ()
{
  return PKDEVICE.platform()==="android" && PKDEVICE.formFactor()==="tablet";
}

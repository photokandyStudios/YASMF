/*jshint asi:true, forin:true, noarg:true, noempty:true, eqeqeq:false, bitwise:true, undef:true, curly:true, browser:true, devel:true, smarttabs:true, maxerr:50 */
/******************************************************************************
 *
 * DEVICE
 * Author: Kerri Shotts
 *
 * This library includes functions that reflect the device and its current
 * state
 *
 ******************************************************************************/

var PKDEVICE = PKDEVICE ||
{
};
// create the namespace

PKDEVICE.platformOverride = false;
// change me for testing in a browser...
PKDEVICE.formFactorOverride = false;
// change me for testing in a browser

/**
 *
 * Returns the device platform, lowercased. If PKDEVICE.platformOverride is
 * other than "false", it is returned instead.
 *
 */
PKDEVICE.platform = function()
{
  if (PKDEVICE.platformOverride)
  {
    return PKDEVICE.platformOverride.toLowerCase();
  }
  var thePlatform = device.platform.toLowerCase();
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
 */
PKDEVICE.isPortrait = function()
{
  return window.orientation == 0 || window.orientation == 180 || window.location.href.indexOf("portrait") > -1;
}
/**
 *
 * Determines if the device is in Landscape orientation.
 *
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
 */
PKDEVICE.isRetina = function()
{
  return window.devicePixelRatio > 1;
}


/******************************************************************************
 *
 * localization.js
 * Author: Kerri Shotts
 *
 * Provides simple localization, as described in Chapter 1 of PhoneGap HotShot.
 *
 * Relies on JQuery/Globalize.js, as found at https://github.com/jquery/globalize
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
/*global PKUTIL, Globalize, device */

var PKLOC = PKLOC ||
{
};

// define our current user locale so that we don't have to calculate it
// each time we want it
PKLOC.currentUserLocale = "";
PKLOC.localizedText =
{
};

/**
 *
 * Loads the JQuery Globalize script from the framework directory
 * as well as the underlying cultures definitions.
 *
 */
PKLOC.initializeGlobalization = function(completion)
{
  PKUTIL.include(["./framework/globalize.js"], completion);
}
/**
 *
 * Loads the appropriate locale from the JQuery Globalize script.
 *
 */
PKLOC.loadLocales = function(theLocales, completion)
{
  for (var i = 0; i < theLocales.length; i++)
  {
    theLocales[i] = "./framework/cultures/globalize.culture." + theLocales[i] + ".js";
  }
  PKUTIL.include(theLocales, completion);
}
/**
 *
 * Sets the current locale for the JQuery Globalize script.
 *
 */
PKLOC.setGlobalizationLocale = function(theLocale)
{
  Globalize.culture(theLocale);
}
/**
 *
 * Add a translation to the existing translation matrix
 *
 * @param locale: the locale for which to add the translation
 * @param key:    the key for the translation (generally the word or phrase)
 * @param value:  the translated value.
 *
 */
PKLOC.addTranslation = function(locale, key, value)
{
  if (PKLOC.localizedText[locale])
  {
    PKLOC.localizedText[locale][key] = value;
  } else
  {
    PKLOC.localizedText[locale] =
    {
    };
    PKLOC.localizedText[locale][key] = value;
  }
}
/**
 *
 * Return the user's locale (e.g., en-US or fr-FR)
 * for proper localization.
 *
 * @returns the user's current locale. If one can't be
 * found, "en-US" is returned.
 */
PKLOC.getUserLocale = function()
{
  if (PKLOC.currentUserLocale)
  {
    return PKLOC.currentUserLocale;
  }
  var currentPlatform = "unknown";
  if ( typeof device != 'undefined')
  {
    currentPlatform = device.platform;
  }
  var userLocale = "en-US";
  // a suitable default

  if (currentPlatform == "Android")
  {
    // parse the navigator.userAgent
    var userAgent = navigator.userAgent;
    // inspired by http://stackoverflow.com/a/7728507/741043
    var tempLocale = userAgent.match(/Android.*([a-zA-Z]{2}-[a-zA-Z]{2})/);
    if (tempLocale)
    {
      userLocale = tempLocale[1];
    }
  } else
  {
    userLocale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
    userLocale = userLocale;
  }

  PKLOC.currentUserLocale = userLocale;
  return PKLOC.currentUserLocale;
}

PKLOC.substituteVariables = function(theString, theParms)
{
  var currentValue = theString;

  // handle replacement variables
  if (theParms)
  {
    for (var i = 1; i <= theParms.length; i++)
    {
      currentValue = currentValue.replace("%" + i, theParms[i - 1]);
    }
  }

  return currentValue;
}

PKLOC.lookupTranslation = function(key, theLocale)
{
  var userLocale = theLocale || PKLOC.getUserLocale();

  // look it up by checking if userLocale exists, and then if the key (uppercased) exists
  if (PKLOC.localizedText[userLocale])
  {
    if (PKLOC.localizedText[userLocale][key.toUpperCase()])
    {
      return PKLOC.localizedText[userLocale][key.toUpperCase()];
    }
  }

  // if not found, we don't return anything but null
  return null;
}
/**
 *
 * Convenience function for translating text.
 *
 * @param key:        the text to translate. Case doesn't matter.
 * @param locale:     the locale to use for translation. If not defined, defaults
 *                    to the user's current locale.
 * @param parms:      (optional) An indexed array of replacement values.
 *
 * @returns the translated text, or the original key if no translation was found.
 */
function __T(key, parms, locale)
{
  var userLocale = locale || PKLOC.getUserLocale();
  var currentValue = "";

  if (!( currentValue = PKLOC.lookupTranslation(key, userLocale)))
  {
    // we haven't found it under the given locale (of form: xx-XX), try the fallback locale (xx)
    userLocale = userLocale.substr(0, 2);
    if (!( currentValue = PKLOC.lookupTranslation(key, userLocale)))
    {
      // we haven't found it under any of the given locales; try en-US
      userLocale = "en-US";
      if (!( currentValue = PKLOC.lookupTranslation(key, userLocale)))
      {
        // we haven't found it under any of the given locales; try en
        userLocale = "en";
        if (!( currentValue = PKLOC.lookupTranslation(key, userLocale)))
        {
          // we didn't find it at all... we'll use the key
          currentValue = key;
        }
      }
    }
  }

  return PKLOC.substituteVariables(currentValue, parms);
}

/**
 *
 * Convenience function for localizing numbers.
 *
 * @param theNumber:       the number to localize
 * @param theFormat:       the number of decimal places to use. Defaults to "n" if not supplied
 * @param theLocale:       (optional) the locale. If not specified, current locale is assumed.
 *
 * @returns the number formatted according to the locale. If the number of digits after
 * the decimal point is less than the actual number of digits, rounding is performed. If
 * the number of digits is more than the actual number of digits, zeroes are added.
 *
 */

function __N(theNumber, theFormat, theLocale)
{
  var iFormat = "n" + theFormat;
  var iLocale = theLocale || PKLOC.getUserLocale();

  PKLOC.setGlobalizationLocale(iLocale);

  return Globalize.format(theNumber, iFormat);
}

/**
 *
 * Convenience function for localizing currency.
 *
 * @param theNumber:       the number to localize
 * @param theFormat:       the number of decimal places, defaults to two if not specified
 * @param theLocale:       (optional) the locale. If not specified, current locale is assumed.
 *
 * @returns the number formatted according to the locale's currency. If the number of digits after
 * the decimal point is less than the actual number of digits, rounding is performed. If
 * the number of digits is more than the actual number of digits, zeroes are added.
 *
 */
function __C(theNumber, theFormat, theLocale)
{
  var iFormat = "c" + theFormat;
  var iLocale = theLocale || PKLOC.getUserLocale();

  PKLOC.setGlobalizationLocale(iLocale);

  return Globalize.format(theNumber, iFormat);
}

/**
 *
 * Convenience function for localizing percentages.
 *
 * @param theNumber:       the number to localize
 * @param theFormat:       the number of decimal places, defaults to two if not specified
 * @param theLocale:       (optional) the locale. If not specified, current locale is assumed.
 *
 * @returns the number formatted according to the locale's percent settings.
 *
 */
function __PCT(theNumber, theFormat, theLocale)
{
  var iFormat = "p" + theFormat;
  var iLocale = theLocale || PKLOC.getUserLocale();

  PKLOC.setGlobalizationLocale(iLocale);

  return Globalize.format(theNumber, iFormat);
}

/**
 *
 * Convenience function for localizing dates.
 *
 * @param theDate:         the date to localize
 * @param theFormat:       (optional) The format of the date; "d" is assumed if not provided.
 * @param theLocale:       (optional) the locale. If not specified, current locale is assumed.
 *
 * @returns the date formatted according to the locale's settings.
 *
 */
function __D(theDate, theFormat, theLocale)
{
  var iFormat = theFormat || "d";
  var iLocale = theLocale || PKLOC.getUserLocale();

  PKLOC.setGlobalizationLocale(iLocale);

  return Globalize.format(theDate, iFormat);
}


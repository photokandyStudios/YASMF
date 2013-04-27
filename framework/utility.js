/**
 *
 * This library includes simple utility functions
 * @module PKUTIL
 * @author Kerri Shotts
 * @requires PKLOC
 * @version 0.3
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
/*global PKLOC, device, cordova, console */
/*requires: cordova.js*/

/**
 *
 * Returns an element specified by elementId. Similar to (but not exactly like) jQuery's $()
 *
 * @method $ge
 * @returns {DOMElement}
 */
function $ge(elementId)
{
  return document.getElementById(elementId);
}

/**
 *
 * Returns an element specified by elementId, but with localization. Localization assumes
 * you have at least one element of the form <elementId_enus>, and that all other localized
 * elements have the locale after the elementId appended with an underscore.
 * (eg: thisElementIsLocalized_enus and thisElementIsLocalized_eses)
 *
 * @method $geLocale
 * @returns {DOMElement}
 */
function $geLocale(elementId)
{
  var currentLocale = PKLOC.getUserLocale();
  var theLocalizedElementId = elementId + "_" + currentLocale;
  if ($ge(theLocalizedElementId))
  {
    return $ge(theLocalizedElementId);
  }

  theLocalizedElementId = elementId + "_" + currentLocale.substr(0, 2);
  if ($ge(theLocalizedElementId))
  {
    return $ge(theLocalizedElementId);
  }

  theLocalizedElementId = elementId + "_en-US";
  if ($ge(theLocalizedElementId))
  {
    return $ge(theLocalizedElementId);
  }

  theLocalizedElementId = elementId + "_en";
  if ($ge(theLocalizedElementId))
  {
    return $ge(theLocalizedElementId);
  }

  return $ge(elementId);
  // we don't have it; return the default element.
}

/**
 *
 * Similar to $$. Returns all classes matching a selector.
 *
 * @method $gac
 * @returns {Array} of DOMElements.
 */
function $gac(selector)
{
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}


/**
 * Provides lots of various utility functions; think of this as the
 * framework's basement. :-)
 *
 * @class PKUTIL
 *
 */
var PKUTIL = PKUTIL ||
{
};
// create the namespace

/**
  * Version of the PKUTIL Namespace
  * @property version
  * @type Object
 **/
PKUTIL.version = { major: 0, minor: 3, rev: 100 };

//
// Properties
//
/**
 * Determines if various methods log to the console. Added 0.3.100
 *
 * @property consoleLogging
 * @type boolean
 * @static
 * @default false
 */
PKUTIL.consoleLogging = false; // add console logging flag, v0.3.100

/**
 * Indicates success of an operation.
 * 
 * @property COMPLETION_SUCCESS
 * @final
 * @static
 * @default true
 */
PKUTIL.COMPLETION_SUCCESS = true;
/**
 * Indicates failure of an operation.
 * 
 * @property COMPLETION_FAILURE
 * @final
 * @static
 * @default false
 */
PKUTIL.COMPLETION_FAILURE = false;

//
// Methods
//

/*
 *
 * basic dependency support
 *
 */
/**
 * Tracks all dependencies that have been exported.
 *
 * @property _dependencies
 * @static
 * @private
 * @type Array
 * @default empty
 */
PKUTIL._dependencies = [];
/**
 * Export a module so that other modules can depend on it.
 *
 * @method export
 * @static
 * @param module {String|Array} the module name(s) to export
 */
PKUTIL.export = function ( dependency )
{
  if (dependency.push)
  {
    // probably an array; use it as such
    for (var i=0; i<dependency.length; i++)
    {
      PKUTIL._dependencies.push ( dependency[i] );
    }
  }
  else
  {
    PKUTIL._dependencies.push ( dependency );
  }
}

/**
 * Specify that a module is a dependency (or if an array, that
 * multiple modules are dependencies), and call completion() if
 * all dependencies are met (usually for the purpose of exporting
 * a module).
 *
 * @method require
 * @static
 * @param dependency {String|Array} the module name(s) that this module depends on
 * @param [completion] {Function} the method to call if all dependencies are met
 */
PKUTIL.require = function ( dependency, completion )
{
  if (!dependency)
  {
    return true;
  }
  var allRequires;
  if (dependency.push)
  {
    allRequires = dependency;
  }
  else
  {
    allRequires = [ dependency ];
  }
  var allDepenciesMet = true;
  for (var i=0; i<allRequires.length; i++)
  {
    var dependencyMet = PKUTIL._dependencies.indexOf ( allRequires[i] ) > -1;
    if (!dependencyMet)
    {
      if (PKUTIL.consoleLogging) { console.log ("[WARN] Dependency " + allRequires[i] + " not met."); }
      throw "Dependency Failure " + allRequires[i];
    }
    allDepenciesMet = allDepenciesMet && dependencyMet; 
  }
  if (allDepenciesMet)
  {
    if (completion)
    {
      completion();
    }
  }
  return allDepenciesMet;
}
PKUTIL.export ( "PKUTIL" );
PKUTIL.require ( null );


/**
 *
 * Utility function to delay execution of code
 *
 * @method delay
 * @static
 * @param theDelay {Number} in milliseconds
 * @param theFunction {Function} the function to call after the delay
 */
PKUTIL.delay = function(theDelay, theFunction)
{
  return setTimeout(theFunction, theDelay);
}

/**
 * The load queue; for WP7 only.
 * 
 * @private
 * @property loadQueue
 * @type Array
 */
PKUTIL.loadQueue = Array();
/**
 * Indicates if there is an XHR in progress (for WP7 loading)
 *
 * @private
 * @property XHRinProgress
 * @type boolean
 */
PKUTIL.XHRinProgress = false;
/**
 * Stores the XHR timer (for WP7 loading)
 * @private
 * @property XHRTimer
 * @type Timer
 */
PKUTIL.XHRTimer = -1;

/**
 *
 * Loads a file or URL and returns it to the completion
 * handler. The completion handler must be of the form
 * fn(success/failure, data).
 *
 * @method load
 * @static
 * @param theFileName {String} the file or URL to load
 * @param aSync {boolean} if TRUE, load asynchronously
 * @param completion {Function} completion block
 *
 */
PKUTIL.load = function(theFileName, aSync, completion)
{
  // if we're running on anything but Windows Phone, we call
  // _load directly, since it does the right thing.
  if (device.platform != "WinCE")
  {
    PKUTIL._load(theFileName, aSync, completion);
    return;
  }

  // but if we re running on Windows Phone, we need to queue
  // the requests so that we can process them in order.
  if (PKUTIL.consoleLogging) { console.log("Pushing request to load XHR: " + theFileName); }
  PKUTIL.loadQueue.push(function()
  {
    if (PKUTIL.consoleLogging) { console.log("Processing XHR " + theFileName); }
    PKUTIL._load(theFileName, aSync, completion);
  });

  if (PKUTIL.XHRTimer < 0)
  {
    PKUTIL.XHRTimer = setInterval(PKUTIL._XHRQueue, 100);
  }
}

/**
 * Attemts to load the next item on the loadQueue, for WP7 only.
 *
 * @method _XHRQueue
 * @private
 * @static
 */
PKUTIL._XHRQueue = function()
{
  if (PKUTIL.XHRinProgress)
  {
    return;
  }
  if (PKUTIL.loadQueue.length > 0)
  {
    var f = PKUTIL.loadQueue.pop();
    f();
  }
}

/**
 * Loads some content, whether it be local or remote, and notifies
 * completion when it is done.
 *
 * @method _load
 * @private
 * @static
 * @param theFileName {String} the file or URL to load
 * @param aSync {boolean} if TRUE, load asynchronously
 * @param completion {Function} completion block
 */
PKUTIL._load = function(theFileName, aSync, completion)
{
  if (!window.XMLHttpRequest)
  {
    if (completion)
    {
      completion(PKUTIL.COMPLETION_FAILURE, "This browser does not support XMLHttpRequest.");
      return;
    }
  }

  PKUTIL.XHRinProgress = true;

  var r = new XMLHttpRequest();
  r.onreadystatechange = function()
  {
    if (r.readyState == 4)// loaded
    {
      if (r.status == 200 || r.status === 0)// success
      {
        if (completion)
        {
          if (PKUTIL.consoleLogging) 
            { console.log("success loading " + theFileName + ", length " + r.responseText.length); }
          completion(PKUTIL.COMPLETION_SUCCESS, r.responseText);
          PKUTIL.XHRinProgress = false;
        }
      } else// failed to load
      {
        if (completion)
        {
          completion(PKUTIL.COMPLETION_FAILURE, r.status);
          PKUTIL.XHRinProgress = false;
        }
      }
    }
  }
  if (device.platform == "WinCE" && theFileName.substr(0, 4) != "http")
  {
    r.open('GET', "/app/www/" + theFileName, true);
  } else
  {
    r.open('GET', theFileName, aSync);
  }
  r.send();

}
/**
 *
 * Javascript doesn't provide any native include functionality,
 * which tends to bloat code and result in long scripts that are
 * brittle. Here's our tiny effort to help stem the tide and
 * make Javascript just a /little/ nicer.
 *
 * NOTE: individual includes are loaded SYNCHRONOUSLY. This is done as further
 * includes may rely upon the one being loaded now. However, it does
 * mean that larger files may take longer to process. The entire process, however
 * is done ASYNCHRONOUSLY, so any code that relies on the included scripts must
 * only be run after the completion.
 *
 * Also note: Loads scripts in reverse, so one should use .reverse() when
 * calling the method so that things are listed in a proper order.
 *
 * @method include
 * @static
 * @param theScripts {Array}
 * @param completion {Function}
 */
PKUTIL.include = function(theScripts, completion)
{
  var theNewScripts = theScripts;
  if (theNewScripts.length === 0)
  {
    if (completion)
    {
      completion();
    }
    return;
  }
  var theScriptName = theNewScripts.pop();
  PKUTIL.load(theScriptName, true, function(success, data)
  {
    if (success)
    {
      try
      {
        var theScriptElement = document.createElement("script");
        theScriptElement.type = "text/javascript";
        theScriptElement.charset = "utf-8";
        theScriptElement.text = data;
        document.body.appendChild(theScriptElement);
        // add it as a script tag
      }
      catch ( e )
      {
        if (PKUTIL.consoleLogging) 
          { console.log("WARNING: Error in " + theScriptName + ";" + JSON.stringify (e)); }       
        throw e;
      }
    } else
    {
      if (PKUTIL.consoleLogging) 
        { console.log("WARNING: Failed to load " + theScriptName); }
    }
    PKUTIL.include(theNewScripts, completion);
  });
}
/**
 *
 * Loads an HTML fragment, creates a DIV, and adds it to the DOM.
 * Any script tags inside will be executed.
 *
 * The `options` parameter should contain the information specified in the example.
 *
 * @example
 *     aSync                 Determines if the file is loaded
 *                           asynchronously or not.
 *     id                    The ID to attach to the DIV created
 *                           to surround the content.
 *     className             The class name to attach to the DIV
 *                           created to surround the content.
 *     attachTo              Indicates the element to append the
 *                           content to. If not specified,
 *                           document.body is used.
 *
 * @method loadHTML
 * @static
 * @param theFileName {String}          the file or URL to laod
 * @param options {Object}              An array of options, as follows:
 * @param completion {Function}           A function called when loading is
 *                              complete. Of the form fn ( successOrFailure )
 *                              so that success or failure of the load
 *                              can be determined.
 *
 */
PKUTIL.loadHTML = function(theFileName, options, completion)
{
  var aSync = options["aSync"];
  PKUTIL.load(theFileName, aSync, function(success, data)
  {
    if (success)
    {
      // extract our values out of the options array
      var theId = options["id"];
      var theClass = options["className"];
      var attachTo = options["attachTo"];

      // create the DIV element that will contain the data
      var theElement = document.createElement("DIV");
      theElement.setAttribute("id", theId);
      theElement.setAttribute("class", theClass);

      // make sure the element isn't visible, yet
      theElement.style.display = "none";

      // add the data
      theElement.innerHTML = data;

      // add it to the DOM
      if (attachTo)
      {
        attachTo.appendChild(theElement);
      } else
      {
        document.body.appendChild(theElement);
      }

      // now, handle the scripts that might be in there
      var theScriptTags = theElement.getElementsByTagName("script");
      for (var i = 0; i < theScriptTags.length; i++)
      {
        // try...catch to get an indication that the /script/ is what is
        // causing an error, not this block.
        try
        {
          // inspired by http://bytes.com/topic/javascript/answers/513633-innerhtml-script-tag
          var theScriptElement = document.createElement("script");
          theScriptElement.type = "text/javascript";
          theScriptElement.charset = "utf-8";
          if (theScriptTags[i].src)
          {
            theScriptElement.src = theScriptTags[i].src;
          } else
          {
            theScriptElement.text = theScriptTags[i].text;
          }
          document.body.appendChild(theScriptElement);
        } catch ( err )
        {
          if (PKUTIL.consoleLogging) { console.log("When loading " + theFileName + ", error: " + err); }
        }
      }
      if (completion)
      {
        completion(PKUTIL.COMPLETION_SUCCESS);
      }
    } else
    {
      if (PKUTIL.consoleLogging) { console.log("WARNING: Failed to load " + theFileName); }
      if (completion)
      {
        completion(PKUTIL.COMPLETION_FAILURE);
      }
    }
  });
}
/**
 *
 * Retrieves a JSON string from the specified URL, and executes completion.
 * Completion must be of the form ( success, data ).
 *
 * @method loadJSON
 * @static
 * @param theURL {String}    the URL or Filename
 * @param completion {Function} function of the from ( success, data )
 *
 */
PKUTIL.loadJSON = function(theURL, completion)
{
  PKUTIL.load(theURL, true, function(success, data)
  {
    var theParsedData =
    {
    };

    if (success)
    {
      try
      {
        theParsedData = JSON.parse(data);
      } catch (err)
      {
        if (PKUTIL.consoleLogging) { console.log("Failed to parse JSON from " + theURL); }
        success = PKUTIL.COMPLETION_FAILURE;
      }
    }
    // call completion, if available
    if (completion)
    {
      completion(success, theParsedData);
    }
  });
}
/**
 *
 * Loads a URL in a popup window. Uses ChildBrowser for PG 2.2.x or
 * lower, and in-app browser for 2.3 or higher.
 *
 * @method showURL
 * @static
 * @param theURL {String}
 */
PKUTIL.showURL = function(theURL)
{
  if (device.cordova < 2.3)
  {
    switch (device.platform)
    {
      case "Android":
        window.plugins.childBrowser.showWebPage(theURL);
        break;
      case "WinCE":
        var options =
        {
          url : theURL,
          geolocationEnabled : false
        };
        cordova.exec(null, null, "ChildBrowserCommand", "showWebPage", options);
        break;
      default:
        // iOS
        cordova.exec("ChildBrowserCommand.showWebPage", theURL);
    }
  }
  else
  {
    // use in-app browser instead
    window.open ( theURL, '_blank' );
  }
}
/**
 *
 * instanceOfTemplate returns an HTML string ready for insertion into the DOM
 * as an instance of the supplied template (templateElement). Any %VAR% are
 * replaced by VAR from the replacements object.
 *
 * @method instanceOfTemplate
 * @static
 * @param template {DOMElement|String}
 * @param replacements {Array}
 * @returns {String}
 **/

PKUTIL.instanceOfTemplate = function(templateElement, replacements)
{
  var templateHTML = templateElement.innerHTML || templateElement;
  for (var theVar in replacements)
  {
    while (templateHTML.indexOf('%' + theVar.toUpperCase() + '%') > -1)
    {
      templateHTML = templateHTML.replace('%' + theVar.toUpperCase() + '%', replacements[theVar]);
    }
  }
  return templateHTML;
}


/**
 * Returns a psuedo-GUID. Not guaranteed to be unique, but pretty close.
 * see http://stackoverflow.com/a/8809472
 * @method getGUID
 * @static
 * @returns {String}
 */
PKUTIL.getGUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}

/**
 * Returns the current unix time
 *
 * @method getUnixTime
 * @static
 * @returns Number
 */
PKUTIL.getUnixTime = function ()
{
  return (new Date()).getTime();
}


/**
 *
 * Filename Handling
 *
 */
PKUTIL.export ( "PKUTIL.FILE" );
/**
 * Basic filename handling is supported by PKUTIL.FILE. This includes
 * dealing with invalid characters, parsing extensions and paths.
 *
 * @class PKUTIL.FILE
 */
PKUTIL.FILE = PKUTIL.FILE ||
{
};
/**
 * Specifies the characters that are not allowed in file names.
 * @property invalidCharacters
 * @static
 * @type Array
 * @default [ '/', '\', ':', '|', '<', '>', '*', '?', ';', '%' ]
 */
PKUTIL.FILE.invalidCharacters = "/,\\,:,|,<,>,*,?,;,%".split(",");
/**
 * Specifies the extension separator.
 * @property extensionSeparator
 * @static
 * @type String
 * @default "."
 */
PKUTIL.FILE.extensionSeparator = ".";
/**
 * Specifies the extension separator.
 * @property extensionSeparator
 * @static
 * @type String
 * @default "."
 */
PKUTIL.FILE.pathSeparator = "/";

/**
 * Converts a suspected invalid filename to a valid filename by replacing
 * invalid characters (as specified in `invalidCharacters`) with
 * dashes.
 *
 * @method convertToValidFileName
 * @static
 * @param theFileName {String} the file name to convert
 * @returns {String} the converted file name
 */
PKUTIL.FILE.convertToValidFileName = function(theFileName)
{
  var theNewFileName = theFileName;
  for (var i = 0; i < PKUTIL.FILE.invalidCharacters.length; i++)
  {
    var d = 0;
    while (theNewFileName.indexOf(PKUTIL.FILE.invalidCharacters[i]) > -1 && (d++) < 50)
    {
      theNewFileName = theNewFileName.replace(PKUTIL.FILE.invalidCharacters[i], "-");
    }
  }
  return theNewFileName;
}
/**
 * Returns the file (name) portion of a path.
 *
 * @method getFilePart
 * @static
 * @returns {String}
 */
PKUTIL.FILE.getFilePart = function(theFileName)
{
  var theSlashPosition = theFileName.lastIndexOf(PKUTIL.FILE.pathSeparator);
  if (theSlashPosition < 0)
  {
    return theFileName;
  }
  return theFileName.substr(theSlashPosition + 1, theFileName.length - theSlashPosition);
}

/**
 * Returns the path portion of a path (minus any filename).
 *
 * @method getPathPart
 * @static
 * @returns {String}
 */
PKUTIL.FILE.getPathPart = function(theFileName)
{
  var theSlashPosition = theFileName.lastIndexOf(PKUTIL.FILE.pathSeparator);
  if (theSlashPosition < 0)
  {
    return "";
  }
  return theFileName.substr(0, theSlashPosition + 1);
}

/**
 * Returns the file name, minus the extension.
 *
 * @method getFileNamePart
 * @static
 * @returns {String}
 */
PKUTIL.FILE.getFileNamePart = function(theFileName)
{
  var theFileNameNoPath = PKUTIL.FILE.getFilePart(theFileName);
  var theDotPosition = theFileNameNoPath.lastIndexOf(PKUTIL.FILE.extensionSeparator);
  if (theDotPosition < 0)
  {
    return theFileNameNoPath;
  }
  return theFileNameNoPath.substr(0, theDotPosition);
}

/**
 * Returns the extension, minus the file name.
 *
 * @method getFileNamePart
 * @static
 * @returns {String}
 */
PKUTIL.FILE.getFileExtensionPart = function(theFileName)
{
  var theFileNameNoPath = PKUTIL.FILE.getFilePart(theFileName);
  var theDotPosition = theFileNameNoPath.lastIndexOf(PKUTIL.FILE.extensionSeparator);
  if (theDotPosition < 0)
  {
    return "";
  }
  return theFileNameNoPath.substr(theDotPosition + 1, theFileNameNoPath.length - theDotPosition - 1);
}




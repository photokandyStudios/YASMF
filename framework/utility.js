/******************************************************************************
 *
 * UTILITY
 * Author: Kerri Shotts
 *
 * This library includes simple utility functions
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
/*global PKLOC, device, cordova */

var PKUTIL = PKUTIL ||
{
};
// create the namespace

//
// Properties
//
PKUTIL.COMPLETION_SUCCESS = true;
PKUTIL.COMPLETION_FAILURE = false;

//
// Methods
//

/**
 *
 * Returns an element specified by elementId. Similar to (but not exactly like) jQuery's $()
 *
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
 */
function $gac(selector)
{
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}

/**
 *
 * Utility function to delay execution of code
 *
 */
PKUTIL.delay = function(theDelay, theFunction)
{
  return setTimeout(theFunction, theDelay);
}
/**
 *
 * Loads a file or URL and returns it to the completion
 * handler. The completion handler must be of the form
 * fn(success/failure, data).
 *
 * @param theFileName       the file or URL to load
 * @param aSync             if TRUE, load asynchronously
 * @param completion        completion block
 *
 */
PKUTIL.loadQueue = Array();
PKUTIL.XHRinProgress = false;
PKUTIL.XHRTimer = -1;

PKUTIL.load = function(theFileName, aSync, completion)
{
  if (device.platform != "WinCE")
  {
    PKUTIL._load(theFileName, aSync, completion);
    return;
  }
  console.log("Pushing request to load XHR: " + theFileName);
  PKUTIL.loadQueue.push(function()
  {
    console.log("Processing XHR " + theFileName);
    PKUTIL._load(theFileName, aSync, completion);
  });

  if (PKUTIL.XHRTimer < 0)
  {
    PKUTIL.XHRTimer = setInterval(PKUTIL._XHRQueue, 100);
  }
}

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
          console.log("success loading " + theFileName + ", length " + r.responseText.length);
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
 * NOTE: includes are loaded SYNCHRONOUSLY. This is done as further
 * includes may rely upon the one being loaded now. However, it does
 * mean that larger files may take longer to process.
 *
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
      var theScriptElement = document.createElement("script");
      theScriptElement.type = "text/javascript";
      theScriptElement.charset = "utf-8";
      theScriptElement.text = data;
      document.body.appendChild(theScriptElement);
      // add it as a script tag
    } else
    {
      console.log("WARNING: Failed to load " + theScriptName);
    }
    PKUTIL.include(theNewScripts, completion);
  });
}
/**
 *
 * Loads an HTML fragment, creates a DIV, and adds it to the DOM.
 * Any script tags inside will be executed.
 *
 * @param theFileName           the file or URL to laod
 * @param options               An array of options, as follows:
 *    @param aSync                 Determines if the file is loaded
 *                                 asynchronously or not.
 *    @param id                    The ID to attach to the DIV created
 *                                 to surround the content.
 *    @param className             The class name to attach to the DIV
 *                                 created to surround the content.
 *    @param attachTo              Indicates the element to append the
 *                                 content to. If not specified,
 *                                 document.body is used.
 * @param completion            A function called when loading is
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
          console.log("When loading " + theFileName + ", error: " + err);
        }
      }
      if (completion)
      {
        completion(PKUTIL.COMPLETION_SUCCESS);
      }
    } else
    {
      console.log("WARNING: Failed to load " + theFileName);
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
 * @param theURL     the URL or Filename
 * @param completion function of the from ( success, data )
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
        console.log("Failed to parse JSON from " + theURL);
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
 * Shows an instance of the ChildBrowser plugin with the given URL
 * regardless of the platform we're running on. The plugin must
 * be properly installed, or the function will not work.
 *
 */
PKUTIL.showURL = function(theURL)
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
/**
 *
 * instanceOfTemplate returns an HTML string ready for insertion into the DOM
 * as an instance of the supplied template (templateElement). Any %VAR% are
 * replaced by VAR from the replacements object.
 *
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
 *
 * Filename Handling
 *
 */
PKUTIL.FILE = PKUTIL.FILE ||
{
};
PKUTIL.FILE.invalidCharacters = "/,\\,:,|,<,>,*,?,;,%".split(",");
PKUTIL.FILE.extensionSeparator = ".";
PKUTIL.FILE.pathSeparator = "/";

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

PKUTIL.FILE.getFilePart = function(theFileName)
{
  var theSlashPosition = theFileName.lastIndexOf(PKUTIL.FILE.pathSeparator);
  if (theSlashPosition < 0)
  {
    return theFileName;
  }
  return theFileName.substr(theSlashPosition + 1, theFileName.length - theSlashPosition);
}

PKUTIL.FILE.getPathPart = function(theFileName)
{
  var theSlashPosition = theFileName.lastIndexOf(PKUTIL.FILE.pathSeparator);
  if (theSlashPosition < 0)
  {
    return "";
  }
  return theFileName.substr(0, theSlashPosition + 1);
}

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

// sometimes one needs a psuedo-guid:
// see http://stackoverflow.com/a/8809472
PKUTIL.getGUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}

PKUTIL.getUnixTime = function ()
{
  return (new Date()).getTime();
}




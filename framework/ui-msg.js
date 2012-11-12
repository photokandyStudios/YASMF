/******************************************************************************
 *
 * UI-MSG
 * Author: Kerri Shotts
 *
 * This script provides a mechanism by which alerts, prompts, and confirmations
 * can be displayed to the end user.
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

/*global PKUTIL, device, PKDEVICE, __T */
var PKUI = PKUI ||
{
};
// create the namespace

PKUI.MESSAGE = PKUI.MESSAGE ||
{
};

PKUI.MESSAGE.messageStack = [];
PKUI.MESSAGE.currentMessage = null;

PKUI.MESSAGE.captureBackButton = false;

PKUI.MESSAGE.createBaseElements = function(title, text)
{
  var rootElement = document.createElement("div");
  rootElement.className = "pkui-alert-container";

  var alertElement = document.createElement("div");
  alertElement.className = "pkui-alert";

  var titleElement = document.createElement("div");
  titleElement.className = "pkui-alert-title";
  titleElement.innerHTML = title;

  var msgElement = document.createElement("div");
  msgElement.className = "pkui-alert-message";
  msgElement.innerHTML = text;

  var actionElement = document.createElement("div");
  actionElement.className = "pkui-alert-action-container";

  alertElement.appendChild(titleElement);
  alertElement.appendChild(msgElement);
  alertElement.appendChild(actionElement);
  rootElement.appendChild(alertElement);

  return rootElement;
}

PKUI.MESSAGE.Confirm = function(title, text, buttons, dismissFn)
{
  var self = this;
  self.title = title;
  self.text = text;
  self.dismissFunction = dismissFn;

  self.rootElement = PKUI.MESSAGE.createBaseElements(title, text);
  self.alertElement = self.rootElement.childNodes[0];
  self.actionElement = self.alertElement.childNodes[2];

  self.buttonArray = buttons.split("|");

  var longButtonList = (self.buttonArray.length > 2);

  for (var i = 0; i < self.buttonArray.length; i++)
  {
    var theButtonText = self.buttonArray[i];
    var secondaryClass = "";
    switch (theButtonText[theButtonText.length-1])
    {
      case "*":
        theButtonText = theButtonText.substr(0, theButtonText.length - 1);
        secondaryClass = "destructive";
        break;
      case ">":
        theButtonText = theButtonText.substr(0, theButtonText.length - 1);
        secondaryClass = "go";
        break;
      case "<":
        theButtonText = theButtonText.substr(0, theButtonText.length - 1);
        secondaryClass = "cancel";
        break;
      case "_":
        theButtonText = theButtonText.substr(0, theButtonText.length - 1);
        secondaryClass = "wideButton";
        break;
      default:
        break;
      // do nothing
    }

    var theButtonElement = document.createElement("button");
    theButtonElement.className = ( longButtonList ? "wideButton " : "" ) + "barButton" + " " + secondaryClass;
    theButtonElement.innerHTML = theButtonText;
    theButtonElement.buttonIndex = i;
    PKUI.CORE.addTouchListener(theButtonElement, "touchend", function()
    {
      self.dismiss(this.buttonIndex);
    });

    self.actionElement.appendChild(theButtonElement);
  }

  self.hide = function()
  {
    self.dismiss(-1);
  }
  self.backButtonPressed = function()
  {
    self.dismiss(-1);
  }
  self.show = function()
  {
    PKUI.MESSAGE.currentMessage = self;
    PKUI.MESSAGE.messageStack.push (self);
    if (PKUI.MESSAGE.captureBackButton)
    {
      // capture the backbutton
      document.addEventListener("backbutton", self.backButtonPressed, false);
    }

    document.body.appendChild(self.rootElement);

    // make us visible; by default we've opacity=0
    if (PKUI.CORE.useTransforms)
    {
      PKUTIL.delay(50, function()
      {
        self.rootElement.style.opacity = "1";
      });
      PKUTIL.delay(125, function()
      {
        self.alertElement.style.opacity = "1";
        self.alertElement.style.webkitTransform = "scale3d(1.05,1.05,1)"
      });
      PKUTIL.delay(250, function()
      {
        self.alertElement.style.webkitTransform = "scale3d(0.95,0.95,1)"
      });
      PKUTIL.delay(375, function()
      {
        self.alertElement.style.webkitTransform = "scale3d(1.00,1.00,1)"
      });
    } else
    {
      self.alertElement.style.webkitTransition = "none";
      self.rootElement.style.webkitTransition = "none";
      self.alertElement.style.opacity = "1";
      self.rootElement.style.opacity = "1";
    }
  }

  self.dismiss = function(idx)
  {
      if (window.event) { PKUI.CORE.cancelEvent(); }

    if (PKUI.MESSAGE.captureBackButton)
    {
      document.removeEventListener("backbutton", self.backButtonPressed);
    }

    PKUI.MESSAGE.messageStack.pop(); // pop us.
    if (PKUI.MESSAGE.messageStack.length>0)
    { // keep the message stack maintained
      PKUI.MESSAGE.currentMessage = PKUI.MESSAGE.messageStack.pop();
      PKUI.MESSAGE.messageStack.push( PKUI.MESSAGE.currentMessage );
    }
    else
    {
      PKUI.MESSAGE.currentMessage = null; // no messages on the stack.
    }
    

    if (PKUI.CORE.useTransforms)
    {
      self.alertElement.style.opacity = "0";
      PKUTIL.delay(250, function()
      {
        self.rootElement.style.opacity = "0";
      });
      PKUTIL.delay(500, function()
      {
        document.body.removeChild(self.rootElement);
      });
    } else
    {
      self.alertElement.style.webkitTransition = "none";
      self.rootElement.style.webkitTransition = "none";
      self.alertElement.style.opacity = "0";
      PKUTIL.delay(250, function()
      {
        self.rootElement.style.opacity = "0";
      });
      PKUTIL.delay(500, function()
      {
        document.body.removeChild(self.rootElement);
      });
    }
    if (self.dismissFunction)
    {
      self.dismissFunction(idx);
    }

  }
}

PKUI.MESSAGE.Prompt = function(title, text, inputType, defaultValue, buttons, dismissFn)
{
  var theAlert = new PKUI.MESSAGE.Confirm(title, text, buttons, dismissFn);

  theAlert.inputElement = document.createElement("input");
  theAlert.inputElement.setAttribute("type", inputType || "text");
  theAlert.inputElement.value = defaultValue;
  theAlert.inputElement.className = "pkui-prompt-input";
  theAlert.actionElement.previousSibling.appendChild(theAlert.inputElement);
  theAlert.alertElement.className = "pkui-alert pkui-prompt";

  return theAlert;
}

PKUI.MESSAGE.Alert = function(title, text, dismissFn)
{
  return new PKUI.MESSAGE.Confirm(title, text, __T("OK") + "_", dismissFn);
}


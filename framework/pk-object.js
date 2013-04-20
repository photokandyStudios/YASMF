/**
 *
 * BASE PKOBJECT
 *
 * The Object class provides the top object that all other objects inherit
 * from. This provides object inheritance via a subclass/superclass mechanism
 * without having to worry about prototype or constructor inheritance.
 *
 * PKObjects provide simple subclassing and a limited form of KVO in the form
 * of tags and tag listeners.
 *
 * @module PKObject
 * @requires PKUTIL
 * @author Kerri Shotts
 * @version 0.3
 */
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
/*global PKUTIL, console */
PKUTIL.require ( "PKUTIL", function () 
{ 
    PKUTIL.export ( "PKObject" );
});

/**
 * PKObject is the base object for all complex objects used by YASMF;
 * simpler objects that are properties-only do not inherit from this
 * class.
 *
 * PKObject provides simple inheritance, but not by using the typical
 * prototypal method. Rather inheritance is formed by object composition
 * where all objects are instances of PKObject with methods overridden
 * instead. As such, you can *not* use any Javascript type checking to
 * differentiate PKObjects; you should instead use the `class`
 * property.
 *
 * PKObject provides inheritance to more than just a constructor: any
 * method can be overridden, but it is critical that the super-chain
 * be properly initialized. See the `super` and `overrideSuper`
 * methods for more information.
 *
 * @class PKObject
 */
var PKObject = function ()
{
    var self=this;

    /**
     *
     * We need a way to provide inheritance. Most methods only provide
     * inheritance across the constructor chain, not across any possible
     * method. But for our purposes, we need to be able to provide for
     * overriding any method (such as drawing, touch responses, etc.),
     * and so we implement inheritance in a different way.
     *
     * First, the _classHierarchy, a private property, provides the
     * inheritance tree. All objects inherit from "PKObject".
     *
     * @private
     * @property _classHierarchy
     * @type Array
     * @default ["PKObject"]
     */
    self._classHierarchy = ["PKObject"];

    /**
     *
     * Objects are subclassed using this method. The newClass is the
     * unique class name of the object (and should match the class'
     * actual name.
     *
     * @method subclass
     * @param {String} newClass - the new unique class of the object
     */
    self.subclass = function ( newClass )
    {
        self._classHierarchy.push (newClass);
    };

    /**
     *
     * getClass returns the current class of the object. The
     * `class` property can be used as well. Note that there
     * is no `setter` for this property; an object's class
     * can *not* be changed.
     * 
     * @method getClass
     * @returns {String} the class of the instance
     *
     */
    self.getClass = function()
    {
        return self._classHierarchy[self._classHierarchy.length-1];
    };
    /**
     *
     * The class of the instance. **Read-only**
     * @property class
     * @type String
     * @readOnly
     */
    self.__defineGetter__("class", self.getClass);

    /**
     *
     * Returns the super class for the given class. If the
     * class is not supplied, the class is assumed to be the
     * object's own class.
     *
     * The property "superClass" uses this to return the
     * object's direct superclass, but getSuperClassOfClass
     * can be used to determine superclasses higher up
     * the hierarchy.
     *
     * @method getSuperClassOfClass
     * @param {String} [aClass=currentClass] the class for which you want the super class. If not specified,
     *                                        the instance's class is used.
     * @returns {String} the super-class of the specified class.
     */
    self.getSuperClassOfClass = function(aClass)
    {
        var theClass = aClass || self.class;
        var i = self._classHierarchy.indexOf ( theClass );
        if (i>-1)
        {
            return self._classHierarchy[i-1];
        }
        else
        {
            return null;
        }
    };
    /**
     *
     * The superclass of the instance.
     * @property superClass
     * @type String
     */
    self.__defineGetter__("superClass", self.getSuperClassOfClass);

    /**
     *
     * _super is an object that stores overridden functions by class and method
     * name. This is how we get the ability to arbitrarily override any method
     * already present in the superclass.
     *
     * @private
     * @property _super
     * @type Object
     */
    self._super = {};

    /**
     *
     * Must be called prior to defining the overridden function as this moves
     * the original function into the _super object. The functionName must
     * match the name of the method exactly, since there may be a long tree
     * of code that depends on it.
     *
     * @method overrideSuper
     * @param theClass {String} the class for which the function override is desired
     * @param theFunctionName {String} the name of the function to override
     * @param theActualFunction {Function} the actual function (or pointer to function)
     *
     */
    self.overrideSuper = function ( theClass, theFunctionName, theActualFunction )
    {
        var superClass = self.getSuperClassOfClass (theClass);
        if (!self._super[superClass])
        {
            self._super[superClass] = {};
        }
        self._super[superClass][theFunctionName] = theActualFunction;
    };

    /**
     *
     * Calls a super function with up to 10 arguments.
     *
     * @method super
     * @param theClass {String} the current class instance
     * @param theFunctionName {String} the name of the function to execute
     * @param [arg]* {Any} up to 10 parameters to pass to the super method
     *
     */
    self.super = function ( theClass, theFunctionName, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 )
    {
        var superClass = self.getSuperClassOfClass (theClass);
        if (self._super[superClass])
        {
            if (self._super[superClass][theFunctionName])
            {
                return self._super[superClass][theFunctionName]( arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 );
            }
            return null;
        }
        return null;
    };

    /**
     *
     * initializes the object
     * 
     * @method init
     *
     */
    self.init = function ()
    {
        // since we're at the top of the hierarchy, we don't do anything.
    };

    /*
     *
     * Objects have some properties that we want all objects to have...
     *
     */

    /**
     * Stores the values of all the tags associated with the instance.
     *
     * @private
     * @property _tag
     * @type Object
     */
    self._tags = {};
    /**
     *
     * Stores the *listeners* for all the tags associated with the instance.
     *
     * @private
     * @property _tagListeners
     * @type Object
     */
    self._tagListeners = {};
    /**
     *
     * Sets the value for a specific tag associated with the instance. If the
     * tag does not exist, it is created.
     * 
     * Any listeners attached to the tag via `addTagListenerForKey` will be
     * notified of the change. Listeners are passed three parameters:
     * `self` (the originating instance),
     * `theKey` (the tag being changed),
     * and `theValue` (the value of the tag); the tag is *already* changed
     *
     * @method setTagForKey
     * @param theKey {Any} the name of the tag; "__default" is special and
     *                     refers to the default tag visible via the `tag`
     *                     property.
     * @param theValue {Any} the value to assign to the tag.
     *
     */
    self.setTagForKey = function ( theKey, theValue )
    {
        self._tags[theKey] = theValue;
        if (self._tagListeners[theKey])
        {
            for (var i=0; i< self._tagListeners[theKey].length; i++)
            {
                self._tagListeners[theKey][i]( self, theKey, theValue );
            }
        }
    };
    /**
     *
     * Returns the value for a given key. If the key does not exist, the
     * result is undefined.
     *
     * @method getTagForKey
     * @param theKey {Any} the tag; "__default" is special and refers to
     *                     the default tag visible via the `tag` property.
     * @returns {Any} the value of the key
     *
     */
    self.getTagForKey = function ( theKey )
    {
        return self._tags[theKey];
    };
    /**
     *
     * Add a listener to a specific tag. The listener will receive three
     * paramters whenever the tag changes (though they are optional). The tag
     * itself doesn't need to exist in order to assign a listener to it.
     *
     * The first parameter is the object for which the tag has been changed.
     * The second parameter is the tag being changed, and the third parameter
     * is the value of the tag. **Note:** the value has already changed by
     * the time the listener is called.
     *
     * @method addListenerForKey
     * @param theKey {Any} The tag for which to add a listener; `__default`
     *                     is special and refers the default tag visible via
     *                     the `tag` property.
     * @param theListener {Function} the function (or reference) to call
     *                    when the value changes.
     */
    self.addTagListenerForKey = function ( theKey, theListener )
    {
        if (!self._tagListeners[theKey])
        {
            self._tagListeners[theKey] = [];
        }
        self._tagListeners[theKey].push (theListener);
    };
    /**
     *
     * Removes a listener from being notified when a tag changes.
     *
     * @method removeTagListenerForKey
     * @param theKey {Any} the tag from which to remove the listener; `__default`
     *                     is special and refers to the default tag visible via
     *                     the `tag` property.
     * @param theListener {Function} the function (or reference) to remove.
     *
     */
    self.removeTagListenerForKey = function ( theKey, theListener )
    {
        if (!self._tagListeners[theKey])
        {
            self._tagListeners[theKey] = [];
        }
        self._tagListeners[theKey].splice ( self._tagListeners[theKey].indexOf ( theListener ), 1 );
    };
    /**
     *
     * Sets the value for the simple tag (`__default`). Any listeners attached
     * to `__default` will be notified.
     *
     * @method setTag
     * @param theValue {Any} the value for the tag
     * 
     */
    self.setTag = function ( theValue )
    {
        self.setTagForKey ( "__default", theValue );
    };
    /**
     *
     * Returns the value for the given tag (`__default`). If the tag has never been
     * set, the result is undefined.
     *
     * @method getTag
     * @returns {Any} the value of the tag. 
     */
    self.getTag = function ()
    {
        return self.getTagForKey ( "__default" );
    };
    /**
     *
     * The default tag for the instance. Changing the tag itself (not any sub-properties of an object)
     * will notify any listeners attached to `__default`.
     *
     * @property tag
     * @type Any
     *
     */
    self.__defineSetter__("tag", self.setTag);
    self.__defineGetter__("tag", self.getTag);

    /**
     *
     * All objects subject notifications for events
     *
     */

    /**
     * Supports notification listeners.
     * @private
     * @property _notificationListeners
     * @type Object
     */
    self._notificationListeners = {};
    /**
     * Adds a listener for a notification. If a notification has not been
     * registered (via `registerNotification`), an error is logged on the console
     * and the function returns without attaching the listener. This means if
     * you aren't watching the console, the function fails nearly silently.
     *
     * > By default, no notifications are registered.
     *
     * @method addListenerForNotification
     * @param theNotification {String} the name of the notification
     * @param theListener {Function} the function (or reference) to be called when the
     *                                notification is triggered.
     *
     */
    self.addListenerForNotification = function ( theNotification, theListener )
    {
        if (!self._notificationListeners[theNotification])
        {
            console.log ( theNotification + " has not been registered.");
            return;
        }
        self._notificationListeners[ theNotification ].push (theListener);
    };
    /**
     * Removes a listener from a notification. If a notification has not been
     * registered (via `registerNotification`), an error is logged on the console
     * and the function returns without attaching the listener. This means if
     * you aren't watching the console, the function fails nearly silently.
     *
     * > By default, no notifications are registered.
     *
     * @method removeListenerForNotification
     * @param theNotification {String} the notification
     * @param theListener {Function} The function or reference to remove
     */

    self.removeListenerForNotification = function ( theNotification, theListener )
    {
        if (!self._notificationListeners[theNotification])
        {
            console.log ( theNotification + " has not been registered.");
            return;
        }
        self._notificationListeners[theNotification].splice 
        (
            self._notificationListeners[theNotification].indexOf ( theListener ), 1
        );
    }
    /**
     * Registers a notification so that listeners can then be attached. Notifications
     * should be registered as soon as possible, otherwise listeners may attempt to
     * attach to a notification that isn't registered.
     *
     * @method registerNotification
     * @param theNotification {String} the name of the notification.
     */
    self.registerNotification = function ( theNotification )
    {
        self._notificationListeners [ theNotification ] = [];
    }

    /**
     * Notifies all listeners of a particular notification that the notification
     * has been triggered. If the notification hasn't been registered via 
     * `registerNotification`, an error is logged to the console, but the function
     * itself returns silently, so be sure to watch the console for errors.
     *
     * @method notify
     * @param theNotification {String} the notification to trigger
     */
    self.notify = function ( theNotification )
    {
        if (!self._notificationListeners[theNotification])
        {
            console.log ( theNotification + " has not been registered.");
            return;
        }
        //console.log ( "Notifying " + self._notificationListeners[theNotification].length + " listeners for " + theNotification );
        for (var i=0; i< self._notificationListeners[theNotification].length; i++ )
        {
            self._notificationListeners[theNotification][i]( self, theNotification );
        }        
    }

};

/**
//http://stackoverflow.com/a/11462081
function clone(obj){
    var clonedObjectsArray = [];
    var originalObjectsArray = []; //used to remove the unique ids when finished
    var next_objid = 0;

    function objectId(obj) {
        if (obj == null) return null;
        if (obj.__obj_id == undefined){
            obj.__obj_id = next_objid++;
            originalObjectsArray[obj.__obj_id] = obj;
        }
        return obj.__obj_id;
    }

    function cloneRecursive(obj) {
        if (null == obj || typeof obj == "string" || typeof obj == "number" || typeof obj == "boolean") return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0; i < obj.length; ++i) {
                copy[i] = cloneRecursive(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            if (clonedObjectsArray[objectId(obj)] != undefined)
                return clonedObjectsArray[objectId(obj)];

            var copy;
            if (obj instanceof Function)//Handle Function
                copy = function(){return obj.apply(this, arguments);};
            else
                copy = {};

            clonedObjectsArray[objectId(obj)] = copy;

            for (var attr in obj)
                if (attr != "__obj_id" && obj.hasOwnProperty(attr))
                    copy[attr] = cloneRecursive(obj[attr]);                 

            return copy;
        }       


        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
    var cloneObj = cloneRecursive(obj);



    //remove the unique ids
    for (var i = 0; i < originalObjectsArray.length; i++)
    {
        delete originalObjectsArray[i].__obj_id;
    };

    return cloneObj;
}
**/
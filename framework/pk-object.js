/******************************************************************************
 *
 * BASE PKOBJECT
 *
 ******************************************************************************
 *
 * The Object class provides the top object that all other objects inherit
 * from. This provides object inheritance via a subclass/superclass mechanism
 * without having to worry about prototype or constructor inheritance.
 *
 * PKObjects provide simple subclassing and a limited form of KVO in the form
 * of tags and tag listeners.
 *
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
     * inheritance tree. All objects inherit from "Object".
     *
     */
    self._classHierarchy = ["PKObject"];

    /**
     *
     * Objects are subclassed using this method. The newClass is the
     * unique class name of the object (and should match the class'
     * actual name.
     *
     */
    self.subclass = function ( newClass )
    {
        self._classHierarchy.push (newClass);
    };

    /**
     *
     * getClass returns the current class of the object. The
     * "class" property can be used as well. Note that there
     * is no "setter" for this property; an object's class
     * can *not* be changed.
     *
     */
    self.getClass = function()
    {
        return self._classHierarchy[self._classHierarchy.length-1];
    };
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
    self.__defineGetter__("superClass", self.getSuperClassOfClass);

    /**
     *
     * _super is an object that stores overridden functions by class and method
     * name. This is how we get the ability to arbitrarily override any method
     * already present in the superclass.
     *
     */
    self._super = {};

    /**
     *
     * Must be called prior to defining the overridden function as this moves
     * the original function into the _super object. The functionName must
     * match the name of the method exactly, since there may be a long tree
     * of code that depends on it.
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
     */
    self.init = function ()
    {
        // since we're at the top of the hierarchy, we don't do anything.
    };

    /**
     *
     * Objects have some properties that we want all objects to have...
     *
     */
    self._tags = {};
    self._tagListeners = {};
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
    self.getTagForKey = function ( theKey )
    {
        return self._tags[theKey];
    };
    self.addTagListenerForKey = function ( theKey, theListener )
    {
        if (!self._tagListeners[theKey])
        {
            self._tagListeners[theKey] = [];
        }
        self._tagListeners[theKey].push (theListener);
    };
    self.removeTagListenerForKey = function ( theKey, theListener )
    {
        if (!self._tagListeners[theKey])
        {
            self._tagListeners[theKey] = [];
        }
        self._tagListeners[theKey].splice ( self._tagListeners[theKey].indexOf ( theListener ), 1 );
    };
    self.setTag = function ( theValue )
    {
        self.setTagForKey ( "__default", theValue );
    };
    self.getTag = function ()
    {
        return self.getTagForKey ( "__default" );
    };
    self.__defineSetter__("tag", self.setTag);
    self.__defineGetter__("tag", self.getTag);

    /**
     *
     * All objects subject notifications for events
     *
     */
    self._notificationListeners = {};
    self.addListenerForNotification = function ( theNotification, theListener )
    {
        if (!self._notificationListeners[theNotification])
        {
            console.log ( theNotification + " has not been registered.");
            return;
        }
        self._notificationListeners[ theNotification ].push (theListener);
    };
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
    self.registerNotification = function ( theNotification )
    {
        self._notificationListeners [ theNotification ] = [];
    }
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
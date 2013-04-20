YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "PKObject",
        "UI",
        "UI.COLOR",
        "UI.FONT",
        "UI.Label",
        "UI.SHADOW",
        "UI.View"
    ],
    "modules": [
        "PKObject",
        "UI",
        "UI.Label",
        "UI.View"
    ],
    "allModules": [
        {
            "displayName": "PKObject",
            "name": "PKObject",
            "description": "BASE PKOBJECT\nThe Object class provides the top object that all other objects inherit\n from. This provides object inheritance via a subclass/superclass mechanism\n without having to worry about prototype or constructor inheritance.\nPKObjects provide simple subclassing and a limited form of KVO in the form\n of tags and tag listeners."
        },
        {
            "displayName": "UI",
            "name": "UI",
            "description": "Provides the base namespace for various user-interface functions,\nincluding colors, points, rectangles, shadows, fonts, etc."
        },
        {
            "displayName": "UI.Label",
            "name": "UI.Label",
            "description": "UI-LABEL provides the UI.Label object"
        },
        {
            "displayName": "UI.View",
            "name": "UI.View",
            "description": "UI-VIEW provides the UI.View object"
        }
    ]
} };
});
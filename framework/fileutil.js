/******************************************************************************
 *
 * FILEUTIL
 * Author: Kerri Shotts
 *
 * This library includes routines to deal with the FILE API, (which is... a bit
 * painful.) The purpose of the library is to reduce the amount of work necessary
 * to go through obtaining a file system, working with directories and files,
 * etc. That isn't to say that we can eliminate callbacks or even callback
 * chaining -- but it is significantly easier without all the intervening cruft,
 * which is essentially (for all intents and purposes) boilerplate.
 *
 * IMPORTANT NOTE:
 *
 * This library provides various conveniences that make referencing persistent
 * and temporary storage a bit easier as well. For example, you can use a
 * path like the following:
 *
 *     doc://photo.jpg   -->   /some/gobbledygook/yourApp/Documents/photo.jpg
 *     tmp://photo.jpg   -->   /some/gobbledygook/yourApp/tmp/photo.jpg
 *
 * Several APIs (such as camera capture) may also refer to paths with
 * "file://localhost" attached. The routines will gracefully remove this so that
 * the reference is a true file.
 *
 * CONVENIENCE:
 *
 * For those who are more comfortable with *nix/BSD commands, nearly each method
 * has a version that correlates to a roughly *nix name. The parameters are the
 * same, however.
 *
 * METHODS
 *   copyFileTo ( source, target, success, failure )         |   cp ()
 *   moveFileTo ( source, target, success, failure )         |   mv ()
 *   removeFile ( theFile, success, failure )                |   rm ()
 *   renameFile ( source, newName, success, failure )        |   -
 *   createFileWriter ( theFile, success, failure )          |   fcreate ()
 *   writeFileData ( writer, theData, success, failure )     |   fwrite ()
 *
 * PLANNED METHODS
 *
 *   getListing ( path, filters, success, failure )          |    ls ()
 *   createDirectory ( path, newDirectory, success, failure )|    mkdir()
 *   removeDirectory ( path, theDirectory, success, failure )|    rmdir()
 *   createFileReader ( theFile, success, failure )          |    fopen()
 *   readFileData ( reader, success, failure )               |    fread()
 *
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
/*global LocalFileSystem, PKUTIL, FileEntry, DirectoryEntry*/

var PKFILE = PKFILE ||
{
};
// create the namespace

//
// Properties
//
PKFILE.COMPLETION_SUCCESS = true;
PKFILE.COMPLETION_FAILURE = false;

// set to true to enable console logging
PKFILE.consoleLogging = false;

// these will be set upon first method that needs them
PKFILE.persistentFS = "";
PKFILE.persistentFSName = "";

PKFILE.temporaryFS = "";
PKFILE.temporaryFSName = "";

//
// Methods
//

/**
 *
 * Determines the persistent and temporary file systems prior
 * to file operations. While it's unlikely that these will
 * change during application execution, it certainly doesn't
 * hurt to re-read them whenever possible (just in case!).
 *
 * When both are read, the success method is called. If we
 * can't obtain one or the other, the failure method is called.
 */
PKFILE._initializeFileSystems = function ( success, failure )
{
  // we need to request two file systems: persistent and temporary.
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
    function (fs)
    {
      PKFILE.persistentFS = fs.root.fullPath;
      PKFILE.persistentFSName = fs.root.name;

      window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
        function (fs)
        {
          PKFILE.temporaryFS = fs.root.fullPath;
          PKFILE.temporaryFSName = fs.root.name;
          
          if (success)
          {
            success();
          }
        },
        failure
      );

    },
    failure
  );

}

/**
 *
 * Handles substition strings within a file path.
 *
 *  doc:/ translates to the persistent storage. We don't use "//" here
 *        since the persistentFS doesn't have a trailing "/", so we leave
 *        that in the original.
 *  tmp:/ translates to the temporary storage.
 *  file://localhost translates to nothing. 
 *
 */
PKFILE._replaceFS = function ( s )
{
  return s.replace ( "doc:/", PKFILE.persistentFS )
          .replace ( "tmp:/", PKFILE.temporaryFS )
          .replace ( "file://localhost", "" );
  
}

/**
 *
 * Copies the file identified by @source to the file identified by @target.
 * If the copy is successful, success() is called. If not, failure() is
 * called.
 *
 * The target will generally be of the form "doc://filename", but it can
 * be any path and file name that the application has access to.
 *
 * NOTE: Copying will fail if the target exists.
 *
 */
PKFILE.copyFileTo = function ( source, target, success, failure )
{
  PKFILE._initializeFileSystems (
    function()
    {
      var newSource = PKFILE._replaceFS ( source );
      var newTarget = PKFILE._replaceFS ( target );
      var newTargetDir = PKUTIL.FILE.getPathPart (newTarget);
                     
      var sourceFileEntry = new FileEntry ( PKUTIL.FILE.getFilePart ( newSource ),
                                            newSource );

      var targetDirEntry = new DirectoryEntry ( newTargetDir.substr(newTargetDir.lastIndexOf('/')+1),
                                                newTargetDir);

      sourceFileEntry.copyTo ( targetDirEntry, PKUTIL.FILE.getFilePart ( target ),
                               success, failure );
    },
    failure
  );
}

/**
 *
 * *nix convenience method.
 *
 */
PKFILE.cp = function ( source, target, success, failure )
{
  PKFILE.copyFileTo ( source, target, success, failure );
}

/**
 *
 * Moves the file identified by @source to the file identified by @target.
 * If the move is successful, success() is called. If not, failure() is
 * called.
 *
 * The target will generally be of the form "doc://filename", but it can
 * be any path and file name that the application has access to.
 *
 * NOTE: The move will overwrite the target if it exists.
 *
 */
PKFILE.moveFileTo = function ( source, target, success, failure )
{
  PKFILE._initializeFileSystems (
    function()
    {
      var newSource = PKFILE._replaceFS ( source );
      var newTarget = PKFILE._replaceFS ( target );
      var newTargetDir = PKUTIL.FILE.getPathPart (newTarget);
                     
      var sourceFileEntry = new FileEntry ( PKUTIL.FILE.getFilePart ( newSource ),
                                            newSource );

      var targetDirEntry = new DirectoryEntry ( newTargetDir.substr(newTargetDir.lastIndexOf('/')+1),
                                                newTargetDir);

      sourceFileEntry.moveTo ( targetDirEntry, PKUTIL.FILE.getFilePart ( target ),
                               success, failure );
    },
    failure
  );
}

/**
 *
 * Convenience method that allows renaming a file in the same
 * directory as the source. The source's path will prepended
 * to the new name.
 *
 * NOTE: The move will overwrite the target if it exists.
 *
 */
PKFILE.renameFile = function ( source, newName, success, failure )
{
  var target = PKUTIL.FILE.getPathPart ( source ) + "/" + newName;
  PKFILE.moveFileTo ( source, target, success, failure );
}

/**
 *
 * *nix convenience method.
 *
 */
PKFILE.mv = function ( source, target, success, failure )
{
  PKFILE.moveFileTo ( source, target, success, failure );
}

/**
 *
 * Removes the file identified by @theFile. The full path must
 * be specified. 
 *
 */
PKFILE.removeFile = function ( theFile, success, failure )
{
  PKFILE._initializeFileSystems (
    function()
    {
      var newSource = PKFILE._replaceFS ( theFile );
      var sourceFileEntry = new FileEntry ( PKUTIL.FILE.getFilePart ( newSource ),
                                            newSource );

      sourceFileEntry.remove ( success, failure );
    },
    failure
  );
}

/**
 *
 * *nix convenience method.
 *
 */
PKFILE.rm = function ( theFile, success, failure )
{
  PKFILE.removeFile ( theFile, success, failure );
}

/**
 *
 * Creates a fileWriter for @theFile. If successful, it will
 * call success() with the created writer. If unsuccessful, it
 * will call failure().
 *
 * Once in success(), writeFileData() may be used to finish
 * the writing of data to the file.
 *
 * Note: if the file exists, it will be overwritten.
 *
 */
PKFILE.createFileWriter = function ( theFile, success, failure )
{
  PKFILE._initializeFileSystems (
    function()
    {
      var newSource = PKFILE._replaceFS ( theFile );
      var sourceFileEntry = new FileEntry ( PKUTIL.FILE.getFilePart ( newSource ),
                                            newSource );

      sourceFileEntry.createWriter ( success, failure );
    },
    failure
  );
}

/**
 *
 * *nix convenience method.
 *
 */
PKFILE.fcreate = function ( theFile, success, failure )
{
  PKFILE.createFileWriter ( theFile, success, failure );
}

/**
 *
 * Writes @theData to the specified writer. When complete,
 * success() will be called. If it fails, failure().
 *
 */
PKFILE.writeFileData = function ( writer, theData, success, failure )
{
  writer.onerror = failure;
  writer.onwriteend = success;
  writer.write ( theData );
}

/**
 *
 * *nix convenience method.
 *
 */
PKFILE.fwrite = function ( writer, theData, success, failure )
{
  PKFILE.writeFileData ( writer, theData, success, failure );
}

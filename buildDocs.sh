#!/bin/sh
#
# Build all javascript docs via jsdoc3
#
export HOME_DIR=`pwd`
export FRAMEWORK_HOME=$HOME_DIR/framework
export DOCS_DIR=$HOME_DIR/docs
export JSDOC_HOME=/Applications/jsdoc
$JSDOC_HOME/jsdoc --verbose $FRAMEWORK_HOME -r -c $FRAMEWORK_HOME/docsconf.json -d $DOCS_DIR $*


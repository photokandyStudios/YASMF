#!/bin/sh
echo $#
echo $@
set
echo "[NOTICE] Copying framework before prepare. Must be in project root, or this will fail."
cp -r ../framework ./www


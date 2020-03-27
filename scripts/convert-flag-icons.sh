#!/bin/bash

# Requires imagemagick
cd assets/flags/

for f in *.png
do
	convert $f -thumbnail 342x256 -gravity center -crop 256x256+0+0 ../../img/icon-$f
done

# Requires pnqquant
cd ../..
pngquant --ext ".png" --force img/*.png

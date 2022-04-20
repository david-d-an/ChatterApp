#!/bin/bash
# set -eo pipefail
# mkdir -p ../shared/nodejs
# rm -rf node_modules shared/nodejs/node_modules
# npm install --production
# mv node_modules lib/nodejs/

# To publish the layer, run:
rm -rf temp_node_modules
mkdir -p temp_node_modules
cd temp_node_modules
npm install --production
cd ..
mv temp_node_modules/* shared/nodejs/node_modules
rm -rf temp_node_modules

# To simulate the layer locally, run:
rm -rf ./node_modules
npm install
cp -r ./shared/nodejs/node_modules/* ./node_modules

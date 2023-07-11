#!/bin/bash

DIR=/var/www/

cd $DIR'backend' && npm install;
cd $DIR'frontend' && npm install;


cd $DIR'backend' && nohup nest start;
cd $DIR'frontend' && npm run dev;
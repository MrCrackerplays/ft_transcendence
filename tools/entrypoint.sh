#!/bin/bash

cd '/usr/src/app/backend' && npm install;
cd '/usr/src/app/frontend' && npm install;


cd '/usr/src/app/backend' && npm run build;
cd '/usr/src/app/frontend' && npm run build;
cd '/usr/src/app/backend' && npm run start:prod;
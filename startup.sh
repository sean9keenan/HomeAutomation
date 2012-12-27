#!/bin/bash

# This should be called from /etc/rc.local (that way it has sudo permission)

# Restart the database
nohup sudo mongod -journal > /home/sean/nohupMongod.out &

# Restart the server process
nohup sudo node /home/sean/Dropbox/Public/HomeAutomation/server.js > /home/sean/nohupServer.out &

#Update our IP adress on namecheap
wget --delete-after https://dynamicdns.park-your-domain.com/update?host=xp&domain=skeenan.com&password=ac6cf112524348b5b6d1fa257320f35a &
wget --delete-after https://dynamicdns.park-your-domain.com/update?host=www&domain=skeenan.com&password=ac6cf112524348b5b6d1fa257320f35a &
wget --delete-after https://dynamicdns.park-your-domain.com/update?host=link&domain=skeenan.com&password=ac6cf112524348b5b6d1fa257320f35a &

# Start a simple python server for static content for home automation
cd /home/sean/Dropbox/Public/HomeAutomation/assets; nohup sudo python -m SimpleHTTPServer 83 > /home/sean/nohupAutomation.out &

# Start a simple python server for static content for www.skeenan.com
cd /home/sean/Dropbox/Public/skeenan; nohup sudo python -m SimpleHTTPServer 81 > /home/sean/nohupSkeenan.out &
#!/bin/bash

# This should be called from /etc/rc.local (that way it has sudo permission)

# Restart the database
nohup sudo mongod -journal > /home/sean/nohup/Mongod.out &

# Restart the server process
nohup sudo node /home/sean/Websites/HomeAutomation/server.js > /home/sean/nohup/Server.out &
HomeAutomation
==============

My Home Automation Project!

Go to link.skeenan.com for a running version of this application (no longer running right now)

This project (and even this help file) are more or less terribly organized and organically grown (and not the delicious organically grown fruit kind). It is in need of a massive reorganization and documentation, but it does run, and quite stably and incredibly low latency - it ran my dorm room for over a year without any intervention (including reconnecting after loss of internet / power). 

This project was also mostly a learning exercise for me in learning Javascript frameworks (backbone.js / angular.js) and everything needed to run a website.

More succinctly : **Here be Dragons** 

Especially these below notes which were personal reinstall notes - I reallyyy should use chef (which I didn't know about when I started this)

Install Instructions
--------------------

In order to install run:

`sudo npm install`

`node server.js`

You then have to _seperately_ host the index.html file (and assets directory) with whatever service you want (`python -m SimpleHTTPServer 80` works). You will also want to change the socket.io connection URL to your server running server.js in assets/js/main.js.

<!-- If you want to host it all from the same server, install the appacheConfig file, which allows you to host the static files on another port -->

Running the service on Apache on another port:
First fix permissions on the entire directory tree up to the path you want
sudo chgrp -R www-data /home/
sudo chmod -R 2750 /home/

Next update apache files : /etc/apache2/sites-enabled/000-default
 /etc/apache2/ports.conf

Restart apache server at `/etc/init.d/apache2 restart`

Then need a load balancer, 
sudo apt-get haproxy
use the settings in haproxy.cfg, c/p them in at
/etc/haproxy/haproxy.cfg
and reboot: "/etc/init.d/haproxy restart"

Troubleshooting
---------------

You may also have to run sudo node server.js since it runs on port 80

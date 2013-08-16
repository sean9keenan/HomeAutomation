import os
import re


r = open('assets/cache-manifest', 'r')

r.readline()
versionLine = r.readline()
versionSplit = re.split("\.", versionLine)
versionNumber = int(versionSplit[2].replace('\n', ''))
newVersion = versionSplit[0] + "." + versionSplit[1] + "." + str(versionNumber + 1) + "\n"
print newVersion

r.close()

cache = open('assets/cache-manifest', 'w')

cache.write("CACHE MANIFEST\n" + newVersion)

path = os.getcwd() + "/assets"

for root, dirs, files in os.walk(path):
  print "Now in root %s" %root
  for f in files:
    if (f != ".DS_Store" and f != "cache-manifest"):
      relativePath = (root.replace(path, "") +"/" + f + "\n")[1:]
      cache.write(relativePath)

cache.write("""
http://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js
http://yui.yahooapis.com/3.7.3/build/yui/yui-min.js

NETWORK:
# All URLs that start with the following lines
# are whitelisted.
*
  """)
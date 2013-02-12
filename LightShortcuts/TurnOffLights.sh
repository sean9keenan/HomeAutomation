#!/bin/bash

# Turn On the lights

wget --delete-after "http://link.skeenan.com/performAction/%7B%22id%22%3A%225085cf1cf07f747d25000004%22%2C%22value%22%3A0%7D"

# To compile to apple script:
#  osacompile -e 'do shell script "/opt/local/bin/wget --delete-after \"http://link.skeenan.com/performAction/%7B%22id%22%3A%225085cf1cf07f747d25000004%22%2C%22value%22%3A0%7D\""' -o ./lightsOff.scpt
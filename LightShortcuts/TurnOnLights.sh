#!/bin/bash

# Turn On the lights

/opt/local/bin/wget --delete-after "http://link.skeenan.com/performAction/%7B%22id%22%3A%225085cf1cf07f747d25000004%22%2C%22value%22%3A255%7D"

# To compile to apple script:
#  osacompile -e 'do shell script "/opt/local/bin/wget --delete-after \"http://link.skeenan.com/performAction/%7B%22id%22%3A%225085cf1cf07f747d25000004%22%2C%22value%22%3A255%7D\""' -o ./lightsOn.scpt

# Alex's Lights are on id = 50ac7bf1521846610b000012 :
#  osacompile -e 'do shell script "/opt/local/bin/wget --delete-after \"http://link.skeenan.com/performAction/%7B%22id%22%3A%2250ac7bf1521846610b000012%22%2C%22value%22%3A255%7D\""' -o ./deskLightsOn.scpt

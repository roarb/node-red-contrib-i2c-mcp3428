# node-red-i2c-mcp3428
NodeRED - Node to read current from a Control Everything MCP3428 Analog to Digital Conversion 0-20v board connected via I2C.

Board is available at : https://www.controleverything.com

Install for NodeRED with NPM : npm install node-red-i2c-mcp3428

This has been written for the Raspberry Pi 3 Model B. To enable i2c on your Raspberry Pi see the tutorial at : https://learn.sparkfun.com/tutorials/raspberry-pi-spi-and-i2c-tutorial

Once enabled, confirm the MCP3428 board is visible with cli command : i2cdetect -y 1

The default connection port is 0x68 (104).

## Stream Data from I2C

wire.on('data', function(data){
	data is an object
	}
	
// channels
channel 1 = 0x10
channel 2 = 0x30
channel 3 = 0x50
channel 4 = 0x70

length = 2

wire.stream(channel, length, ms-delay);

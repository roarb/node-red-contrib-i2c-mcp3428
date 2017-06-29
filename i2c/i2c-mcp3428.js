module.exports = function(RED) {
    "use strict";
    var I2C = require("i2c");

    // The Server Definition - this opens (and closes) the connection
    function I2CServerNodeMCP(n) {
        RED.nodes.createNode(this, n);
        this.device = n.device || "/dev/i2c-1";
        this.address = n.address || 0x68;
        this.channel = n.channel || 1;
        this.frequency = n.frequency || 100;
        this.port = null;
        this.on("close", function() {
            if (this.port != null) {
                     this.port.disconnect();
            }
        });
    }
    RED.nodes.registerType("i2c-device-mcp3428", I2CServerNodeMCP);

	// Get Watcher for Channel
	function I2CADCChannel(n) {
		RED.nodes.createNode(this, n);
		this.i2cdevice = n.i2cdevice;
		this.serverConfig = RED.nodes.getNode(this.i2cdevice);
		var node = this;
		//console.log(node.serverConfig);
		if (node.serverConfig.port === null) {
			node.log("CONNECT: " + node.serverConfig.device);
			node.serverConfig.port = new I2C(parseInt(this.serverConfig.address), {device: node.serverConfig.device});
		}
		node.port = node.serverConfig.port;
		// commands for MCP3428
		var CMD_NEW_CNVRSN = 0x80,
			CMD_CHNL_1 = 0x00,
			CMD_CHNL_1_ADJ = 0x10,
			CMD_CHNL_2 = 0x20,
			CMD_CHNL_2_ADJ = 0x30,
			CMD_CHNL_3 = 0x40,
			CMD_CHNL_3_ADJ = 0x50,
			CMD_CHNL_4 = 0x60,
			CMD_CHNL_4_ADJ = 0x70,
			CMD_MODE_CONT = 0x10,
			CMD_MODE_ONESHOT = 0x00,
			CMD_SPS_240 = 0x00,
			CMD_SPS_60 = 0x04,
			CMD_SPS_15 = 0x08,
			CMD_GAIN_1 = 0x00,
			CMD_GAIN_2 = 0x01,
			CMD_GAIN_4 = 0x02,
			CMD_GAIN_8 = 0x03,
			CMD_READ_CNVRSN = 0x00;
		// last state - send through on change to positive only
		var lastState = "inactive";

		setInterval(function(){
			//node.port.writeByte(CMD_NEW_CNVRSN, function(err){});
			
			var streamChannel = CMD_CHNL_1_ADJ;
			if (node.serverConfig.channel == 2){
				streamChannel = CMD_CHNL_2_ADJ;
			} else if (node.serverConfig.channel == 3){
				streamChannel = CMD_CHNL_3_ADJ;
			} else if (node.serverConfig.channel == 4){
				streamChannel = CMD_CHNL_4_ADJ;
			}
			
			// :::::non-stream version:::::
			node.port.writeByte(streamChannel, function(err){
				if (err) { console.log(err); return false; }
				// read data back from 0x00(0), 2 bytes
				// raw_adc MSB, raw_adc LSB
				node.port.readBytes(0x00, 2, function(err, data){
					//console.log(err);
					//console.log(data);
					if (data[0] > 0){
						if (lastState == "inactive"){
							lastState = "active";
							node.send({payload: {"active": true}});
						}
					} else {
						lastState = "inactive";
					}
				});
			});

		}, node.serverConfig.frequency);
        
        node.on("close", function() {
            //   node.port.free();
        });
			
	}
	RED.nodes.registerType("i2c-adc-mcp3428", I2CADCChannel);
}

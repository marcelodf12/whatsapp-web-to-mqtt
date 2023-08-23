const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia, MessageSendOptions } = require('whatsapp-web.js');
const mqtt = require('mqtt');

const MQTT_PORT = process.env.MQTT_PORT || 1883
const MQTT_HOST = process.env.MQTT_HOST || '192.168.0.101'
const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || 'ww2mqtt'
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'whatsapp'
const MQTT_QOS = process.env.MQTT_QOS || '0'

const url = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;

const sessionPath = `./data`

const options = {
    clean: false,
    connectTimeout: 4000,
    // Authentication
    clientId: MQTT_CLIENT_ID
}
if(process.env.MQTT_USER) options.username = process.env.MQTT_USER;
if(process.env.MQTT_PASS) options.password = process.env.MQTT_PASS;



// Use the saved values
const clientWhatsapp = new Client({
    authStrategy: new LocalAuth({
        dataPath: `${sessionPath}`
    }),
	puppeteer: {
        headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	}
});

// Save session values to the file upon successful auth
clientWhatsapp.on('authenticated', (session) => {
    console.log('Authenticated');
});
 
clientWhatsapp.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

let clientMQTT
clientWhatsapp.on('ready', () => {
    console.log('Client is ready');
    clientMQTT  = mqtt.connect(url, options);

    clientMQTT.on('connect', () => {
        console.log('Connected MQTT');

        console.log(`${MQTT_TOPIC}/send/#`);
        // Subscribe messages to send
        clientMQTT.subscribe(`${MQTT_TOPIC}/send/#`, function (error, granted) {
            if (error) {
                console.log(error)
            } else {
                //console.log(`${granted[0].topic} was subscribed`)
                console.log(granted)
            }
        })

        // Send messages to whatsapp
        clientMQTT.on('message', function (topic, message) {
            // message is Buffer
            topicSplit = topic.split('/')
            to = topicSplit.slice(-1)[0]
            typeMsg = topicSplit.slice(-2,-1)[0]
            console.log(typeMsg)
            try{
                payload = JSON.parse(message.toString())
                console.log(payload)
                if(payload.content){
                    if(typeMsg === "text"){
                        clientWhatsapp.sendMessage(to, payload.content)
                    }else if(typeMsg === "media") {
                        const media = new MessageMedia(payload.content.mimetype, payload.content.data);
                        clientWhatsapp.sendMessage(to, media)
                    }else{
                        console.error('Type msg not support')
                    }
                }else{
                    console.error('Content empty')
                }
            }catch(e){
                console.error(e)
            }
        })
        
        clientMQTT.on('error', function(error){
            console.log('error');
            console.log(error)
        })
        
        clientMQTT.on('reconnect', function(){
            console.log('reconnect');
        })
        
        clientMQTT.on('close', function(){
            console.log('close');
        })
        
        clientMQTT.on('disconnect', function(packet){
            console.log('disconnect');
            console.log(packet)
        })
        
        clientMQTT.on('offline', function(){
            console.log('offline');
        })
        
        clientMQTT.on('packetsend', function(packet){
            console.log('packetsend');
            console.log(packet)
        })
        
        
        clientMQTT.on('packetreceive', function(packet){
            console.log('packetreceive');
            console.log(packet)
        })
    })
});

// Receive messages from whatsapp
clientWhatsapp.on('message', message => {
    console.log(`Send to ${MQTT_TOPIC}/message topic`)
    clientMQTT.publish(`${MQTT_TOPIC}/message/${message.from}`, JSON.stringify(message))    
});

clientWhatsapp.initialize();




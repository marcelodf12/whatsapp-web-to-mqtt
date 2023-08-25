# Whatsapp web to mqtt
Bridge between whatsapp web to mqtt

## Variables
| Variables | Description | Default |
| :------- | :------- | :------- |
| MQTT_PORT | Port of MQTT Broker | 1883 |
| MQTT_HOST | Hostname or IP of MQTT Broker | 192.168.0.101 |
| MQTT_CLIENT_ID | Client name for MQTT Broker | ww2mqtt |
| MQTT_TOPIC | Topic MQTT Broker |  whatsapp |
| MQTT_QOS | QOS for MQTT Broker | 0 |
| MQTT_USER |  User to connect MQTT Broker | |
| MQTT_PASS |  Password to connect MQTT Broker | |

## Volumens
The data of session saved in `/usr/src/app/data`

## Docker Compose example
```yml
version: '2'
services:
  ww2mqtt:
    container_name: ww2mqtt
    image: marcelodf12/whatsapp-web-to-mqtt:latest
    restart: always
    ports:
      - 3000:3000
    environment:
      MQTT_PORT: 1883
      MQTT_HOST: 10.0.0.1
      MQTT_CLIENT_ID: ww2mqtt
      MQTT_TOPIC: whatsapp
      MQTT_QOS: 2
      MQTT_USER: user_mqtt
      MQTT_PASS: secret
    volumes:
      - /home/your_user_name/whatsapp_session:/usr/src/app/data
```

## Use examples
### Send sms
***Topic:*** `whatsapp/send/text/${{ chatId }}`
```json
{
    "content": "Your message"
}
```

### Send media
***Topic:*** `whatsapp/send/media/${{ chatId }}`
```json
{
    "mimetype": "image/jpg",
    "data": "{{ your_image_in_base64 }}"
}
```
[More info](https://docs.wwebjs.dev/MessageMedia.html)


### Receive message
***Topic:*** `whatsapp/message/${{ chatId_to }}`
```json
{
    ...
    "body": "{{ message }}",
    "type": "chat",
    "timestamp": 1692996944,
    "from": "{{ chatId_from }}",
    "to": "{{ chatId_to }}",
    ...
}
```

### Receive media
***Topic:*** `whatsapp/message/${{ chatId_to }}`
```json
{
    "_data": {
        ...
        "body": "{{ image_in_base64 }}",
        "type": "image",
        "t": 1692997913,
        "notifyName": "{{ contact_name }}",
        "from": "{{ chatId_from }}",
        "to": "{{ chatId_to }}",
        "mimetype": "image/jpeg",
        "size": 441,
        "width": 25,
        "height": 25
        ...
    },
    ...
    "body": "{{ message }}",
    "type": "image",
    "timestamp": 1692997913,
    "from": "{{ chatId_from }}@c.us",
    "to": "{{ chatId_to }}@c.us"
    ...
}
```


## Build image
```
docker build -t ww2mqtt .
```
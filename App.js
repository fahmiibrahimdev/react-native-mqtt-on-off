import { Pressable, SafeAreaView, Text, View, Switch} from 'react-native';
import React, { useState, Component, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync : {}
});

const options = {
  host: 'xxx.xxx.xxx.xx', // Host IP MQTT
  port: 9001, // Port Websocket
  path: '/testTopic', // Topic MQTT
  id: 'id_' + parseInt(Math.random()*100000) // Client ID MQTT
};

client = new Paho.MQTT.Client(options.host, options.port, options.path);

export default class App extends Component {

    constructor() {
        super()
        this.state = {
            textButton: 'ON',
            valueStatus: '0',
            topic_pertama: 'rn-lampu/status',
            message: '',
            messageList: [],
            status: '',
            username_mqtt: 'xxx',
            password_mqtt: 'xxxx',
            classButton: 'bg-blue-500 p-4 rounded-lg mt-3',
        }
        client.onConnectionLost = this.onConnectionLost;
        client.onMessageArrived = this.onMessageArrived;
    }

    componentDidMount() {
        this.connect();
    }
    
    clickState = () => {
        if( this.state.valueStatus == '0' ) {
            this.setState({
                valueStatus: '1',
                textButton: 'OFF',
                classButton: 'bg-red-500 p-4 rounded-lg mt-3'
            })
            this._sendMessage("1", this.state.topic_pertama)
        } else {
            this.setState({
                valueStatus: '0',
                textButton: 'ON',
                classButton: 'bg-blue-500 p-4 rounded-lg mt-3'
            })
            this._sendMessage("0", this.state.topic_pertama)
        }
    }

    _sendMessage(messages, topics) {
        var message = new Paho.MQTT.Message(messages);
        message.destinationName = topics;
        client.send(message);
    }

    onConnect = () => {
        console.log('onConnect');
        this.setState({ status: 'connected' });
        client.subscribe(this.state.topic_pertama, { qos: 0 });
    }
     
    onFailure = (err) => {
        console.log('Connect failed!');
        console.log(err);
        this.setState({ status: 'failed' });
    }
    
    connect = () => {
        this.setState(
            { status: 'Sedang koneksi Ke MQTT' },
            () => {
                client.connect({
                    onSuccess: this.onConnect,
                    userName: this.state.username_mqtt,
                    password: this.state.password_mqtt,
                    useSSL: false,
                    timeout: 3,
                    onFailure: this.onFailure
                });
            }
        );
    }

    onConnectionLost=(responseObject)=>{
        if (responseObject.errorCode !== 0) {
            console.log('Koneksi Lost: ' + responseObject.errorMessage);
        }
    }

    onMessageArrived = (message )=> {
        console.log('Pesan diterima dari MQTT:' + message.payloadString);
        newmessageList = this.state.messageList;
        newmessageList.unshift(message.payloadString);
        this.setState({ messageList: newmessageList });
    }

    render() {
        return (
            <View className='px-10 mt-48'>
                <Pressable className={this.state.classButton}
                    onPress={this.clickState}
                >
                    <Text className='font-bold text-white text-center text-xl'>{ this.state.textButton }</Text>
                </Pressable>
            </View>
            
        );
    }
}

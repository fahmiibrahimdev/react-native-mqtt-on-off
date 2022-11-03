import { Pressable, SafeAreaView, Text, View } from 'react-native';
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
            textValue: 'TIDAK ADA STATUS',
            topic: 'testTopic',
            subscribedTopic: '',
            message: '',
            messageList: [],
            status: ''
        }
        client.onConnectionLost = this.onConnectionLost;
        client.onMessageArrived = this.onMessageArrived;
    }

    componentDidMount() { // fungsi nya sama kayak document.ready.function() di jQuery
        this.connect();
    }
    
    clickON = () => { // Kirim data ke MQTT ( Lampu Nyala )
        this.setState({
            textValue: 'LAMPU NYALA'
        })
        var message = new Paho.MQTT.Message("1");
        message.destinationName = "rn-lampu/status";
        client.send(message);
    }

    clickOFF = () => { // Kirim data ke MQTT ( Lampu MATI )
        this.setState({
            textValue: 'LAMPU MATI'
        })
        var message = new Paho.MQTT.Message("0");
        message.destinationName = "rn-lampu/status";
        client.send(message);
    }

    onConnect = () => { // Status Koneksi
        console.log('onConnect');
        this.setState({ status: 'connected' });
        client.subscribe("rn-lampu/status", { qos: 0 });
    }
     
    onFailure = (err) => { // Status Gagal
        console.log('Connect failed!');
        console.log(err);
        this.setState({ status: 'failed' });
    }
    
    connect = () => {
        this.setState(
            { status: 'Sedang koneksi Ke MQTT' },
            () => {
                client.connect({
                    onSuccess: this.onConnect, // jika koneksi MQTT maka jalankan funct ini
                    userName: "xxx", // username MQTT
                    password: "xxxx", // password MQTT
                    useSSL: false,
                    timeout: 3,
                    onFailure: this.onFailure // jika koneksi MQTT maka jalankan funct ini
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
                <Text>Value: {this.state.textValue}</Text>
                <Pressable className='bg-blue-500 p-4 rounded-lg mt-3'
                    onPress={this.clickON}
                >
                    <Text className='font-bold text-white text-center text-xl'>ON</Text>
                </Pressable>
                <Pressable className='bg-red-500 p-4 rounded-lg mt-3'
                    onPress={this.clickOFF}
                >
                    <Text className='font-bold text-white text-center text-xl'>OFF</Text>
                </Pressable>
            </View>
            
        );
    }
}

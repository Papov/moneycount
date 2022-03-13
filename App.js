import React, {useState} from 'react';
import {StyleSheet, Text, View, Button, ActivityIndicator} from 'react-native';

import moment from 'moment/moment';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Xml2js from 'react-native-xml2js';

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const DATE_FORMAT = 'DD.MM.YYYY';

const DATE_RANGE = {
  today: () => moment().format(DATE_FORMAT),
  monthAgo: () => moment().subtract(1, 'month').format(DATE_FORMAT),
};

const makeSignature = (data, password) => {
  const hash = CryptoJS.MD5(`${data}${password}`);
  const signature = CryptoJS.SHA1(hash.toString(CryptoJS.enc.Hex));
  return signature.toString(CryptoJS.enc.Hex);
};

const doRequest = (setAmount, setLoading) => async () => {
  setLoading(true);
  const psw = '';
  const card = '';
  const id = '';

  const balance = `<oper>cmt</oper>
            <wait>90</wait>
            <test>0</test>
            <payment id="">
                <prop name="cardnum" value="${card}" />
                <prop name="country" value="UA" />
            </payment>`;

  const list = `<oper>cmt</oper>
            <wait>90</wait>
            <test>0</test>
            <payment id="">
                <prop name="sd" value="${DATE_RANGE.monthAgo()}"/>
                <prop name="ed" value="${DATE_RANGE.today()}"/>
                <prop name="cardnum" value="${card}"/>
                <prop name="country" value="UA" />
            </payment>`;

  const signature = makeSignature(balance, psw);

  const request = `<?xml version="1.0" encoding="UTF-8"?>
            <request version="1.0">
                <merchant>
                    <id>${id}</id>
                    <signature>${signature}</signature>
                </merchant>
                <data>
                    ${balance}
                </data>
            </request>`;

  const response = await axios.post(
    'https://api.privatbank.ua/p24api/balance',
    request,
    {headers: {'Content-Type': 'text/xml'}},
  );
  Xml2js.parseString(response.data, {trim: true}, (err, res) => {
    setAmount(`${res.response.data[0].info[0].cardbalance[0].balance} UAH`);
    setLoading(false);
  });
};

const App = () => {
  const [amount, setAmount] = useState('0 UAH');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={s.container}>
      <Text>Текущий счет:</Text>
      <Text>{amount}</Text>
      <Button
        title="Синхронизировать"
        onPress={doRequest(setAmount, setIsLoading)}
      />
      {isLoading && (
        <View style={s.loaderContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export default App;

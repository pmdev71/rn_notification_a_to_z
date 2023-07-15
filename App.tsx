import React, {useEffect} from 'react';
import {View, Button} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

function App() {
  useEffect(() => {
    // Get the device token
    messaging()
      .getToken()
      .then(token => {
        // return saveTokenToDatabase(token);
        console.log('Device token :', token);
      });

    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }

    // Listen to whether the token changes
    return messaging().onTokenRefresh(token => {
      // saveTokenToDatabase(token);
      console.log('Device token :', token);
    });
  }, []);

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      lights: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  return (
    <View>
      <Button
        title="Display Notification"
        onPress={() => onDisplayNotification()}
      />
    </View>
  );
}

export default App;

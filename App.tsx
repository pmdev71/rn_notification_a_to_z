import React, {useEffect} from 'react';
import {View, Button, Platform} from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidColor,
  EventType,
} from '@notifee/react-native';
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

  // Handles FCM messages when the app is in a killed state.
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await onDisplayNotification(remoteMessage);
  });

  // Handles FCM messages when the application is alive/in the foreground.
  messaging().onMessage(async remoteMessage => {
    await onDisplayNotification(remoteMessage);
  });

  async function onDisplayNotification(data: any) {
    console.log(
      '<== Message handled in the foreground/background ==>',
      JSON.stringify(data, null, 2),
    );
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    await notifee.incrementBadgeCount();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default' || data?.notification?.channelId,
      name: 'Default Channel' || data?.notification?.name,
      sound: 'default' || data?.notification?.sound,
      badge: true,
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: AndroidColor.RED,
      importance: AndroidImportance.HIGH,
    });

    if (Platform.OS === 'android') {
      // Display a notification
      await notifee.displayNotification({
        title: data?.notification?.title,
        body: data?.notification?.body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
          vibrationPattern: [300, 500],
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    }

    // if (Platform.OS === 'ios') {
    //   // Display a notification
    //   await notifee.displayNotification({
    //     title: data?.data?.title,
    //     body: data?.data?.body,
    //     ios: {
    //       // badgeCount: 1,
    //       sound: data?.data?.soundIOS,
    //       foregroundPresentationOptions: {
    //         badge: true,
    //         sound: true,
    //       },
    //     },
    //   });
    // }
  }

  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    // Check if the user pressed the "Mark as read" action
    if (Platform.OS === 'ios') {
      if (
        type === EventType.ACTION_PRESS &&
        pressAction.id === 'mark-as-read'
      ) {
        // Decrement the count by 1
        await notifee.decrementBadgeCount();

        // Remove the notification
        await notifee.cancelNotification(notification.id);
      }
    }
  });

  // async function onDisplayNotification() {
  //   // Request permissions (required for iOS)
  //   await notifee.requestPermission();

  //   // Create a channel (required for Android)
  //   const channelId = await notifee.createChannel({
  //     id: 'default',
  //     name: 'Default Channel',
  //     lights: false,
  //     vibration: true,
  //     importance: AndroidImportance.HIGH,
  //   });

  //   // Display a notification
  //   await notifee.displayNotification({
  //     title: 'Notification Title',
  //     body: 'Main body content of the notification',
  //     android: {
  //       channelId,
  //       smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
  //       // pressAction is needed if you want the notification to open the app when pressed
  //       pressAction: {
  //         id: 'default',
  //       },
  //     },
  //   });
  // }

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

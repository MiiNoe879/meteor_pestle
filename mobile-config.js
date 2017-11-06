App.info({
  id: 'com.ps.pestle',
  name: 'Pestle',
  description: 'Receipe Management',
  author: 'Bhoomika Kathiriya',
  email: 'kathiriyabm9111210@gmail.com',
  version: '1.0',
  buildNumber: '1'
});

App.setPreference('StatusBarOverlaysWebView', 'true');
App.setPreference('StatusBarStyle', 'lightcontent');

// Reference at https://docs.meteor.com/api/mobile-config.html
// Set up resources such as icons and launch screens.

// App.configurePlugin('com.phonegap.plugins.facebookconnect', {
//   APP_ID: '337832873240070',
//   APP_NAME: 'Wishing Vine',
//   API_KEY: '314b1973782707425412cbff68768085'
// });

// App.configurePlugin('cordova-plugin-facebook4', {
//     APP_NAME: 'CarWebApp',
//     APP_ID: '1075931505761302'
// });
// App.configurePlugin('phonegap-plugin-push', {
//   SENDER_ID: 569263101844
// });

// App.configurePlugin('phonegap-plugin-push', {
//   SENDER_ID: 972001606870
// });

/**** working fb ********/
// App.configurePlugin('cordova-plugin-facebook4', {
//   APP_ID: '337832873240070',
//   APP_NAME: 'webA­n­a­l­y­tics'
// });
//*/*********************//////
//
// App.icons({
//   'iphone_2x': 'private/icons/iphone_2x.png',
//   'iphone_3x': 'private/icons/iphone_3x.png',
//   'ipad': 'private/icons/ipad.png',
//   'ipad_2x': 'private/icons/ipad_2x.png',
//   'ipad_pro': 'private/icons/ipad_pro.png',
//   'ios_settings_2x': 'private/icons/ios_settings_2x.png',
//   'ios_settings_3x': 'private/icons/ios_settings_3x.png',
//   'ios_spotlight_2x': 'private/icons/ios_spotlight_2x.png',
//   'android_mdpi': 'private/icons/android_mdpi.png',
//   'android_hdpi': 'private/icons/android_hdpi.png',
//   'android_xhdpi': 'private/icons/android_xhdpi.png',
//   'android_xxhdpi': 'private/icons/android_xxhdpi.png',
//   'android_xxxhdpi': 'private/icons/android_xxxhdpi.png',
// });
// App.launchScreens({
//   'iphone_2x': 'private/splashScreens/iphone_2x.png',
//   'iphone5': 'private/splashScreens/iphone5.png',
//   'iphone6': 'private/splashScreens/iphone6.png',
//   'iphone6p_portrait': 'private/splashScreens/iPhone6p_portrait.png',
//   'ipad_portrait': 'private/splashScreens/ipad_portrait.png',
//   'ipad_portrait_2x': 'private/splashScreens/ipad_portrait_2x.png',
//   'android_mdpi_portrait': 'private/splashScreens/android_mdpi_portrait.png',
//   'android_hdpi_portrait': 'private/splashScreens/android_hdpi_portrait.png',
//   'android_xhdpi_portrait': 'private/splashScreens/android_xhdpi_portrait.png',
//   'android_xxhdpi_portrait': 'private/splashScreens/android_xxhdpi_portrait.png',
// });


// App.accessRule('https://test.payu.in/*');
// App.accessRule('https://*.googleapis.com/*');
// App.accessRule('https://*.google.com/*');
// App.accessRule('https://*.gstatic.com/*');
// App.accessRule("blob:*");
// App.accessRule('*');
// App.accessRule('http://*', {type: 'intent'});
// App.accessRule('https://*', {type: 'intent'});
// App.accessRule('*', { type: 'navigation' })

App.accessRule("blob:*");
App.accessRule('http://*');
App.accessRule('https://*');

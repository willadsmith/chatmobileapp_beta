package com.ivcbox;

import com.azendoo.reactnativesnackbar.SnackbarPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.imagepicker.ImagePickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;

import com.oney.WebRTCModule.WebRTCModulePackage;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;

import com.github.wumke.RNLocalNotifications.RNLocalNotificationsPackage;

import com.horcrux.svg.SvgPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

  @Override
  protected ReactGateway createReactGateway() {
    ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
      @Override
      protected String getJSMainModuleName() {
        return "index";
      }
    };
    return new ReactGateway(this, isDebug(), host);
  }

  @Override
  public void onCreate() { // <-- Check this block exists
    super.onCreate();
  }

  @Override
  public boolean isDebug() {
    return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(
            new VectorIconsPackage(),
            new ImagePickerPackage(),
            new RNFetchBlobPackage(),
            new RNFirebasePackage(),
            new RNFirebaseAuthPackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseMessagingPackage(),
            new SvgPackage(),
            new SnackbarPackage(),
            new RNSpinkitPackage(),
            new RNSoundPackage(),
            new RNCViewPagerPackage(),
            new AsyncStoragePackage(),
            new RNLocalNotificationsPackage(),
            new WebRTCModulePackage()
    );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }

}

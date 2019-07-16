package com.ivcbox;
import com.imagepicker.permissions.OnImagePickerPermissionsCallback;
import com.facebook.react.modules.core.PermissionListener;
import com.zmxv.RNSound.RNSoundPackage;
import android.app.NotificationManager;
import android.content.Context;

import com.reactnativenavigation.NavigationActivity;

public class MainActivity extends NavigationActivity implements OnImagePickerPermissionsCallback {
    private PermissionListener listener;

    @Override
    public void setPermissionListener(PermissionListener listener)
    {
        this.listener = listener;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults)
    {
        if (listener != null)
        {
            listener.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
        public void onResume() {
            super.onResume();
            NotificationManager nMgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            nMgr.cancelAll();
        }
}

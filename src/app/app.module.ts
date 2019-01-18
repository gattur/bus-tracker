import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { TrackerService } from './../service/tracker';
import { TrackerPage } from './../pages/tracker/tracker';
import { DBPaths } from './../service/path';
import { DetailsPage } from './../pages/details/details';
import { OtpPage } from './../pages/otp/otp';
import { LoginPage } from './../pages/login/login';
import { Network } from '@ionic-native/network';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { Globalization } from '@ionic-native/globalization';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    OtpPage,
    DetailsPage,
    TrackerPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    OtpPage,
    DetailsPage,
    TrackerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Network,
    DBPaths,
    Globalization,
    TrackerService,
    Geolocation,
    GoogleMaps

  ]
})
export class AppModule {}

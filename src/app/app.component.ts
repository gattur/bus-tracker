import { TrackerService } from './../service/tracker';
import { DetailsPage } from './../pages/details/details';
import { LoginPage } from './../pages/login/login';
import { Component,ViewChild } from '@angular/core';
import { Platform,NavController,MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import firebase from 'firebase';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;
  isAuthenticated:boolean=false;
  detailsPage=DetailsPage;
  @ViewChild('nav') nav:NavController;


  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private menuController:MenuController,
                  private trackerService:TrackerService) {
     var config = {
    apiKey: "AIzaSyDpiiMS5RogZgNSec3K1Q8vQAN0E6LeN7U",
    authDomain: "build1-21cc7.firebaseapp.com",
    databaseURL: "https://build1-21cc7.firebaseio.com",
    projectId: "build1-21cc7",
    storageBucket: "build1-21cc7.appspot.com",
    messagingSenderId: "816017510869"
  };
  firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged( user =>{
    
      if(user){
        //console.log("auth done")
          this.isAuthenticated=true;
          this.rootPage=DetailsPage;
        }
        else{
          this.isAuthenticated=false;
          //console.log('not authenticated');
        }
    })
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }


    onLoad(page: any){
      this.nav.setRoot(page);
      this.menuController.close();
  }
    onLogout(){
        this.trackerService.logout();
        this.menuController.close();
        this.nav.setRoot(LoginPage);
    }
      fakeSignIn(){
        //firebase.auth().createUserWithEmailAndPassword("g@y.com","qwertyuiop").then((asd)=>{
        //  console.log('fake sign up',asd);
        //})
        firebase.auth().signInWithEmailAndPassword("g@y.com","qwertyuiop").then((asd)=>{
          console.log('fake signed in',asd);
        });
            console.log('auth  '+firebase.auth().currentUser.uid);
      }

}


import { Globalization } from '@ionic-native/globalization';
import { Geolocation } from '@ionic-native/geolocation';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    lastMo:string;
  constructor(public navCtrl: NavController,private geolocation:Geolocation,private globalization:Globalization) {
         console.log(new Date().toLocaleTimeString());
       // const str=new Date().toLocaleTimeString()
       const str=new Date().toLocaleTimeString() ;
        this.lastMo=str.split(":").slice(0,2).join(':');
        if(str.split(" ")[1]){
          this.lastMo=this.lastMo+" "+str.split(" ")[1]
        }
       console.log(this.lastMo)

    }

}

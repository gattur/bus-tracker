import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
//import { DetailsPage } from './../details/details';
import { NgForm } from '@angular/forms';
  
import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Platform } from 'ionic-angular';

import firebase from 'firebase';

@Component({
  selector: 'page-otp',
  templateUrl: 'otp.html',
})
export class OtpPage implements OnInit{
  
  verificationId:any;

  connected:Subscription;
  disconnected:Subscription;
  internet:boolean=false;

  constructor(private navController: NavController, public navParams: NavParams,private loadingController:LoadingController,
              private alertController:AlertController,private platform:Platform,private network:Network) {
  }
  ngOnInit() {
    this.verificationId=this.navParams.get("verifId");
  }

    ionViewDidEnter() {
    this.internet=navigator.onLine;
      this.platform.ready().then(() => {
        this.connected=this.network.onConnect().subscribe((data)=>{
          console.log(data);
          this.internet=data.type;  
        },error=>console.log(error));
        this.disconnected=this.network.onDisconnect().subscribe((data)=>{ 
          this.internet=data.type;
        },error=>console.log(error));
        console.log(this.connected);
      });
  }
      
  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }   

  login(form:NgForm){
    const loading=this.loadingController.create({
      content:'Loging u In'
    });
    loading.present();
      let signinCredential=firebase.auth.PhoneAuthProvider.credential(this.verificationId,form.value.otp);
        firebase.auth().signInWithCredential(signinCredential).then((info)=>{
          loading.dismiss();
          //this.navController.setRoot(DetailsPage);
        },
        (error)=>{
          loading.dismiss();
          this.hadleError(error.message);
          console.log(error);
        })
  }
      hadleError(errorMessage:string){
          const alert=this.alertController.create({
            title:'Error Occured',
            message:errorMessage,
            buttons:['Ok']
          });
            alert.present();
          this.navController.pop();    
      }

}

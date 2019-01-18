
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, Platform } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import firebase from 'firebase';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { OtpPage } from './../otp/otp';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

      code:string;
      verificationId:any;

      connected:Subscription;
      disconnected:Subscription;
      internet:boolean=false;
      
  constructor(private navCtrl: NavController,private loadingController:LoadingController,private alertController:AlertController,
              private network:Network,private platform:Platform) {
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

  send(form:NgForm){
    const loading=this.loadingController.create({
      content:'Sending OTP!!!'
    });
      loading.present();
    const phNumber="+91"+form.value.pnumber;
    console.log(phNumber);
    (<any>window).FirebasePlugin.verifyPhoneNumber(phNumber,60, (credential) => {
          this.verificationId = credential.verificationId;
          loading.dismiss();
          this.navCtrl.push(OtpPage,{verifId:this.verificationId});
        }, error => {
          loading.dismiss();
          this.handleError(error.message)
          console.log("error:" + error);
        });
  }

    handleError(errorMessage:string){
      const alert=this.alertController.create({
        title:'Error Occured',
        message:errorMessage,
        buttons:['Ok']
      });
      alert.present();
    }

}

import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { TrackerPage } from './../tracker/tracker';
import { Coords } from './../../models/coords';
import { Student } from './../../models/student';


import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform, AlertController } from 'ionic-angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import firebase from 'firebase';

import {DBPaths} from '../../service/path';

@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage implements OnInit {

  constructor(public navCtrl: NavController, public navParams: NavParams,private loadingController:LoadingController,
              private dBPaths:DBPaths,private platform:Platform,private alertController:AlertController, private network:Network) {

                console.log(navigator);
  }

  student:Student;
  studentForm:FormGroup;
  locationsData:any[]=[];
   
  locations:any[]=[];
  buses:string[]=[];

  //to check for the update and reset button
  isChanged=false;
  isValid=false;

  initalized_locationsData:any[]=[];
  initalized_locations:any[]=[];
  dropAreaCoords:Coords;
  pickUpAreaCoords:Coords;

   connected:Subscription;
  disconnected:Subscription;
  internet:boolean=false;

  ngOnInit(){
    this.initializeForm();
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


  async initializeForm(){
    const loading=this.loadingController.create({
      content:'Signing up'
    });
    loading.present();
    console.log(firebase.auth().currentUser.phoneNumber);
    const pnumber=firebase.auth().currentUser.phoneNumber;
    await firebase.database().ref(this.dBPaths.getParentdata(pnumber)).once('value')
               .then(
                 data=>{
                   this.student=data.val();
                   if(!this.student.firstTime){
                     this.navCtrl.setRoot(TrackerPage,{school:this.student.school,bus:this.student.busNo,
              pickUp:{area:this.student.pickUp.area,coords:this.pickUpAreaCoords},
              drop:{area:this.student.drop.area,coords:this.dropAreaCoords}})
                   }
                   this.studentForm=new FormGroup({
                       'name':new FormControl(this.student.name,Validators.required),
                       'busNo':new FormControl(this.student.busNo,Validators.required),
                       'pickUpArea':new FormControl(this.student.pickUp.area,Validators.required),
                       'dropArea':new FormControl(this.student.drop.area,Validators.required)
                     });
                   this.pickUpAreaCoords={lat:this.student.pickUp.lat,lng:this.student.pickUp.lng};
                   this.dropAreaCoords={lat:this.student.drop.lat,lng:this.student.drop.lng};
                   
                   firebase.database().ref(this.dBPaths.getBusLocations(this.student.school,this.student.busNo)).once('value')
                         .then(
                             data=>{
                               this.initalized_locations.splice(0);
                               this.initalized_locationsData.splice(0);
                               this.locations.splice(0);                               
                               this.locationsData.splice(0);                   
                                data.forEach(
                                  (each)=>{
                                    this.locationsData.push(each.val());
                                    this.locations.push(each.val().name);
                                      })
                              this.initalized_locationsData=this.locationsData.slice();
                              this.initalized_locations=this.locations.slice();
                         console.log('locations',this.locations);
                              })
                        .catch(                
                          error=>{
                          loading.dismiss();
                           this.hadleError('error',error.message);
                            }); 

                   firebase.database().ref(this.dBPaths.getSchoolBusses(this.student.school)).once('value')
                        .then(
                            data=>{
                              this.buses.splice(0);
                              data.forEach(
                                (each)=>{
                                  this.buses.push(each.key);
                                    })
                                })
                        .catch(
                          error=>{
                            loading.dismiss();
                            this.hadleError('error',error.message);
                            });   
                loading.dismiss();
                this.isValid=true;    
               })
              .catch(
                  error=>{
                    loading.dismiss();
                    this.hadleError('error',error.message);
                  });                     
                  }
   
  async onChangeinBus(){
    const alert= this.loadingController.create(
       {
         content:'Loading',
       });
    alert.present();
    console.log(this.studentForm);
       await this.getLocations(this.studentForm.value.busNo);
        //if(this.studentForm.value.busNo!=this.student.busNo)
          //this.isValid=false;
        this.studentForm=new FormGroup({
              'name':new FormControl(this.studentForm.value.name,Validators.required),
              'busNo':new FormControl(this.studentForm.value.busNo,Validators.required),
              'pickUpArea':new FormControl('',Validators.required),
              'dropArea':new FormControl('',Validators.required)
              });           
            // this.isValid=true;
            
        this.checkChanges();
        alert.dismiss();
  }

  private getLocations(busNo:string){  
    const loading=this.loadingController.create({
        content:'Bus details'
      });
    loading.present();
    firebase.database().ref(this.dBPaths.getBusLocations(this.student.school,busNo)).once('value')
            .then(
               data=>{
                  this.locations.splice(0);
                  this.locationsData.splice(0);
                  data.forEach(
                     (each)=>{
                          this.locationsData.push(each.val());
                          this.locations.push(each.val().name);
                          })
                  console.log('locations',this.locations);
                      loading.dismiss()
                  })
              .catch(
                error=>{
                  loading.dismiss();
                  this.hadleError('error',error.message);
                }
              
                  ); 
              
    }
  checkChanges(){
      if(this.studentForm.value.name!=this.student.name || this.student.busNo!=this.studentForm.value.busNo || 
            this.student.pickUp.area!= this.studentForm.value.pickUpArea || this.student.drop.area!= this.studentForm.value.dropArea){
              this.isChanged=true;
            }
            else{
              this.isChanged=false;
            }
    }              


  cancelChanges(){
      console.log('cancelled');
      this.studentForm=new FormGroup({
              'name':new FormControl(this.student.name,Validators.required),
              'busNo':new FormControl(this.student.busNo,Validators.required),
              'pickUpArea':new FormControl(this.student.pickUp.area,Validators.required),
              'dropArea':new FormControl(this.student.drop.area,Validators.required)
              });
            console.log('fine');
           // this.getLocations(this.student.busNo);
              this.locations.splice(0);
              this.locationsData.splice(0);
           this.locations=this.initalized_locations.slice();
           this.locationsData=this.initalized_locationsData.slice();
            console.log('here');
            this.checkChanges();
    }


  onSubmit(){
    const loading=this.loadingController.create({
      content:'Updating Details'
    });
    loading.present();
    console.log(firebase.auth().currentUser.phoneNumber);
    console.log(firebase.auth().currentUser);
    console.log('submited')
    if(this.studentForm.valid){
        let dropPoint=null;
        let dropPointCoord:Coords=null;

        let pickUp=null;
        let pickUpCoord:Coords=null;
        //console.log(this.locationsData);
        this.locationsData.forEach(
          data=>{
            if(data.name==this.studentForm.value.pickUpArea){
             dropPoint=data.name;
             dropPointCoord={lat:data.lat,lng:data.lng};
            }
            if(data.name==this.studentForm.value.dropArea){
              pickUp=data.name;
              pickUpCoord={lat:data.lat,lng:data.lng};
            }
          }
        )
        this.dropAreaCoords=dropPointCoord;
        this.pickUpAreaCoords=pickUpCoord;
        const pnumber=firebase.auth().currentUser.phoneNumber;
        firebase.database().ref(this.dBPaths.getParentdata(pnumber)).update({
          name:this.studentForm.value.name,
          busNo:this.studentForm.value.busNo,
          drop:{
            area:dropPoint,
            lat:dropPointCoord.lat,
            lng:dropPointCoord.lng
          },
          pickUp:{
             area:pickUp,
            lat:pickUpCoord.lat,
            lng:pickUpCoord.lng
          }
        }).then(
          data=>{
            loading.dismiss();
            console.log(data);
        })
          .catch(
            error=>{
              loading.dismiss();
              this.hadleError('error',error.message);
              console.log('error',error);
            }
          )

    }
    else{
      console.log('not submitting  '+this.studentForm.valid);
    }
  }

  showOnMap(){
    if(this.student.firstTime){
         const loading=this.loadingController.create({
      content:'Loading...'
    });
    loading.present();
       const pnumber=firebase.auth().currentUser.phoneNumber;
        firebase.database().ref(this.dBPaths.getParentdata(pnumber)).update({
        firstTime:false
        }).then(
          data=>{
            loading.dismiss();
            console.log(data);
        })
          .catch(
            error=>{
              loading.dismiss();
              this.hadleError('error',error.message);
              console.log('error',error);
            }
          )

    }
    console.log(this.pickUpAreaCoords);
    this.navCtrl.push(TrackerPage,{school:this.student.school,bus:this.student.busNo,
              pickUp:{area:this.student.pickUp.area,coords:this.pickUpAreaCoords},
              drop:{area:this.student.drop.area,coords:this.dropAreaCoords}});
  }

   private hadleError(title:string,errorMessage:string){
          const alert=this.alertController.create({
            title:title,
            message:errorMessage,
            buttons:['Ok']
          });
            alert.present();
         // this.navController.pop();    
      
        }

}

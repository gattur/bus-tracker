import { Globalization } from '@ionic-native/globalization';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { Http } from '@angular/http';
import { Coords } from './../../models/coords';
import { TrackerService } from './../../service/tracker';
import { Component,OnInit } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController, ToastController, AlertController } from 'ionic-angular';

import {GoogleMaps,GoogleMap,GoogleMapsEvent,GoogleMapOptions,CameraPosition,MarkerOptions,Marker} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-tracker',
  templateUrl: 'tracker.html',
})
export class TrackerPage implements OnInit{

    map: GoogleMap;
    //bus track data
    lat:number;
    lng:number;
    busmarker:Marker;
    lastUpdatedBus:any;

    school:string;
    bus:string;
    pickUpPoint:any;
    dropPoint:any;

    busLocationSubscription:any;
    deviceLocationSubscription:any;
    
     deviceMarker:Marker;
     //parent track data
     deviceLat:number;
     deviceLng:number;
     lastUpdatedDevice:any;

     connected:Subscription;
      disconnected:Subscription;
      internet:boolean=false;

      lastUpdated:string;
      logger:boolean=true;

    constructor(public navCtrl: NavController, private platform: Platform,private geolocation:Geolocation,
                private trackerService:TrackerService,private navParams:NavParams,private loadingController:LoadingController,
                private toastController:ToastController,private alertController:AlertController,
                private http:Http,private network:Network,private globalization: Globalization) {}       
        
    ngOnInit() {
      this.school=this.navParams.get('school');
        this.bus=this.navParams.get('bus');
        this.pickUpPoint=this.navParams.get('pickUp');
        this.dropPoint=this.navParams.get('drop');
      this.neStarter();
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


     neStarter(){
          
      const loading=this.loadingController.create({
      content:'Loading Map'
    });
    loading.present();
        
      this.busLocationSubscription = this.trackerService.getBusLocation(this.school,this.bus);
         this.busLocationSubscription.on('value',
            (data)=>{
              console.log(data.val());
              this.lat=data.val().lat;
              this.lng=data.val().lng;

              const str=new Date().toLocaleTimeString() ;
              this.lastUpdated=str.split(":").slice(0,2).join(':');
              if(str.split(" ")[1]){
                  this.lastUpdated=this.lastUpdated+" "+str.split(" ")[1]
              }
              if(this.busmarker){
                  console.log('position changed');
               this.platform.ready().then(() => {   
              this.busmarker.setPosition({lat:this.lat,lng:this.lng}); 
          let val= this.map.getVisibleRegion().contains({lat:this.lat,lng:this.lng}).valueOf()
          console.log('does it contain');
          console.log(val);  
          console.log(this.map.getVisibleRegion().contains({lat:this.lat,lng:this.lng}));
          if(val==false){
            console.log('changed map position');
            this.map.setCameraTarget({lat:this.lat,lng:this.lng});
          }
          //      (data)=>{
            //          console.log('gattu',data);
            //          this.map.setCameraTarget({lat:this.lat,lng:this.lng});
            //    }
             // )
             
              console.log();                  
              loading.dismiss();
              });
                }else{
                     console.log('lat '+this.lat+'  lng '+this.lng);                       
                this.platform.ready().then(() => {
               this.loadMap();
               //if(this.busmarker)
                  loading.dismiss();                   
              });
              }
      },
          (error)=>{
            loading.dismiss();
          });           
    }
    ionViewWillEnter(){
      console.log('ionviewwillenter');
    }



 
    ionViewDidLoad() {
   //this.loadMap();
   }

   async loadMap(){
      console.log('changed again');
      if(this.logger)
        console.log('in loadMap');
      let mapOptions: GoogleMapOptions = {
      camera: {
        target: {lat: this.lat,lng: this.lng},
        zoom: 18,
        tilt: 30
      }
    };
       this.map = GoogleMaps.create('map', mapOptions);
        
       this.map.one(GoogleMapsEvent.MAP_READY)
          .then(() => {
         this.getDeviceLocation();
        console.log('Map is ready!');
        // Now you can use all methods safely.
        this.map.addMarker({
            title: 'Ionic',
            icon: 'blue',
            animation: 'DROP',
            
            position: {
              lat: this.lat,
              lng: this.lng
            }
          })
          .then(marker => {
            this.busmarker=marker;
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
                alert('clicked');
              });
          })
            .catch((error)=>{
                  this.hadleError('error',error.message);
            });
      });
 
    }

  async getDeviceLocation(){       
    if(this.logger)  
    console.log('getting device loaction');
//this.map.one(GoogleMapsEvent.MAP_READY)
//          .then(() => {
      await this.map.getMyLocation({enableHighAccuracy:true})
      .then(
        (data)=>{
          //console.log('from google maps',data);
        }
      )
      .catch(
        (error)=>{
          this.hadleError('error',error.message);
        }
      );
//      });
      let options = {timeout: 10000, enableHighAccuracy: true, maximumAge: 3600};
      this.deviceLocationSubscription = await this.geolocation.watchPosition(options).subscribe(
            (data)=>{
              //console.log(data)
              if(data){
              this.lastUpdatedBus=data.timestamp;
              this.deviceLat=data.coords.latitude;
              this.deviceLng= data.coords.longitude;
             // console.log('from phone direct',data);
              }
            else{
              console.log('no data');
            }
            
     if(!this.deviceMarker ){
       console.log(this.deviceLat);
       console.log(this.deviceLng);
        if(this.logger)
        console.log('checking if markers are done again');
       // this.map.one(GoogleMapsEvent.MAP_READY)
       //    .then(() => {
        console.log('Map is ready!');
        this.map.addMarker({
            title: 'Ionic',
            icon: 'red',
            animation: 'DROP',
            
            position: {
              lat: this.deviceLat,
              lng: this.deviceLng
            }
          })
          .then(marker => {
            console.log('added');
            if(this.deviceMarker){
              this.deviceMarker.remove()
            }

            this.deviceMarker=marker;
            console.log('gattu marker',this.deviceMarker)
          })
       .catch(
          (error)=>{
                  this.hadleError('error',error.message);
          }
        );
     // })
       // .catch(
       //   (error)=>console.log(error)
      //  );
      }
        else if(this.deviceMarker && this.deviceLat && this.deviceLng){
         // console.log('setting position');
                this.deviceMarker.setPosition({lat:this.deviceLat,lng:this.deviceLng});  
        }

            }
            ,(error)=>{
              console.log(error);
            });
            console.log('async working');
    }
        calculateTime1(){
      console.log('getting device loaction');
      this.map.getMyLocation({enableHighAccuracy:true})
      .then(
        (data)=>{
          console.log(data.latLng);
        }
      )
      .catch(
        (error)=>{
          this.hadleError('error',error.message);
        }
      );
     
      let options = {timeout: 10000, enableHighAccuracy: true, maximumAge: 3600};
this.deviceLocationSubscription=this.geolocation.watchPosition(options).subscribe(
            (data)=>{
              console.log(data.coords) 
            }
          );
        }

   async calculateTime(){
      //  let time
      //  let timeToPoint;
      //  let parentTravelTime;
     const loading= this.loadingController.create({
        content:'Calculating'
      });
      loading.present();
         //this.map.getMyLocation({enableHighAccuracy:true})
         //   .then(
         //     (data)=>{
         // console.log(data);
        //time= this.trackerService.calculateTravelTime({lat:this.lat,lng:this.lng},{lat:time.lat,lng:time.lng});
        
              const date=new Date().toLocaleTimeString();
              date.split(" ")[1].trim()!='PM'
              const pickUpCheck=true;

        if(pickUpCheck){
           //console.log(this.lat);
           this.deviceLat=this.lat;
           this.deviceLng=this.lng;
            loading.dismiss();
           this.calculateTravelTime({lat:this.lat,lng:this.lng},{lat:this.deviceLat,lng:this.deviceLng},
                          this.pickUpPoint.coords)
          
          console.log('gattu');
//console.log(this.trackerService.calculateTravelTime({lat:this.lat,lng:this.lng},{lat:this.deviceLat,lng:this.deviceLng},this.pickUpPoint.coords))
                    
                      
        }
          else{ loading.dismiss();
             this.calculateTravelTime({lat:this.lat,lng:this.lng},{lat:this.deviceLat,lng:this.deviceLng},
                          this.dropPoint.coords);                         

        }
    /*  })
      .catch(
        (error)=>{
          loading.dismiss();
          this.hadleError('error',error.message);
        }); */
      
    }

    async driverDetails(){
    const loading= this.loadingController.create({
        content:'Loading Driver Details' 
      });
      loading.present();

      this.trackerService.getDriverCode(this.school,this.bus).once('value')
                    .then(
                      (driverCodeData)=>{
                       
                        console.log(driverCodeData.val());
                        this.trackerService.getDriverDetails(this.school,driverCodeData.val())
                        .once('value').then(
                          (driverData)=>{
                             loading.dismiss();
                                console.log(driverData.val());
                                const alert=this.alertController.create({
                                  title:'Name: '+driverData.val().name,
                                  subTitle: 'Route No: '+this.bus+'<br/><br/>Contact No:'+driverData.val().phNo,
                                  buttons: ['Ok']
                                });
                              alert.present();
                          })
                          .catch(
                            (error)=>{
                              loading.dismiss();
                              this.hadleError('error',error.message);
                              
                            });
                      })
                    .catch(
                      error=>{
                        loading.dismiss();
                        this.hadleError('error',error.message);
                      }
                    )
    
    }

      private hadleError(title:string,errorMessage:string){
          const alert=this.alertController.create({
            title:title,
            message:errorMessage,
            buttons:['Ok']
          });
            alert.present();
          //this.navController.pop();    
      
        }


    ionViewWillLeave(){
      console.log('ionViewWillLeave');
      console.log(this.busLocationSubscription);
      console.log('second',this.deviceLocationSubscription);
      
      if(this.busLocationSubscription)
        this.busLocationSubscription.off();

      if(this.deviceLocationSubscription)
        this.deviceLocationSubscription.unsubscribe();
 //this.deviceLocationSubscription.unsubscribe();

     this.connected.unsubscribe();
    this.disconnected.unsubscribe();

    }

    async calculateTravelTime(bus:Coords,device:Coords,location:Coords){

         const loading= this.loadingController.create({
        content:'Calculating'
      });
      loading.present();
        console.log('ca;ulating');
      let timeToPoint;
       let parentTravelTime;

       const string1='https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='
                    +bus.lat.toString().trim()+','+bus.lng.toString().trim()+'&'+'destinations='+location.lat.toString().trim()+','+
                    location.lng.toString().trim()+
                    '&mode=driving&key=AIzaSyDODuVVeOpnu_Z_RxhTzPJ2TJw2LeYb2Xs';

       const string2='https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='
                    +device.lat.toString().trim()+','+device.lng.toString().trim()+'&'+'destinations='+location.lat.toString().trim()+
                    ','+location.lng.toString().trim()+
                    '&mode=driving&key=AIzaSyDODuVVeOpnu_Z_RxhTzPJ2TJw2LeYb2Xs';
                    

        console.log(string1);
        console.log(string2);
      const a = await this.http.get(string1).subscribe(
                        (data)=>{
                            console.log(data.json().status)
                            if(data.json().status=='OK'){

                            console.log(data.json().rows[0].elements[0].duration.text);
                            timeToPoint=data.json().rows[0].elements[0].duration.text;
                            console.log(timeToPoint)
                     this.http.get(string2).subscribe(
                    (data)=>{
                            console.log(data.json().status)
                           if(data.json().status=='OK'){
                            console.log(data.json().rows[0].elements[0].duration.text);
                            parentTravelTime=data.json().rows[0].elements[0].duration.text;
                            console.log({timeToPoint:timeToPoint,parentTravelTime:parentTravelTime});
                             loading.dismiss();
                            const alert=this.alertController.create({
                       title: 'Time Track',
                      subTitle: 'Bus arrives in '+timeToPoint+' at '+this.pickUpPoint.area+'. '+
                            '</br>For u it takes '+parentTravelTime+'to reach the stop',
                        buttons: ['Ok']
                            });
                        alert.present();
                            
                        }
                        else
                            return 3
                        },error=>{
                            loading.dismiss();
                            this.hadleError('error Occured',error.message);
                              });

                        }
                        else 
                            return 2
                        }
                        ,
                        error=>{
                          loading.dismiss();    
                          this.hadleError('error Occured',error.message)}
                    );  

                    console.log(a);
					
        //    return 1;
             console.log(2);
              return {timeToPoint:timeToPoint,parentTravelTime:parentTravelTime};
    }

}

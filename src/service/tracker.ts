
import { Injectable } from '@angular/core';
import { Coords } from './../models/coords';
import firebase from 'firebase';
import { Http,Response } from '@angular/http';
import 'rxjs/Rx'

@Injectable()
export class TrackerService{

    constructor(private http:Http){}

    logout(){ 
        firebase.auth().signOut();
    }

    getBusLocation(school:string,bus:string){
        return firebase.database().ref('/cubspot/tracker/'+school.trim()+'/'+bus.trim()+'/coords');
    }

    async travelTime(source:Coords,destinatin:Coords){
        const string1='https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='
                    +source.lat.toString().trim()+','+source.lng.toString().trim()+'&'+'destinations='+destinatin.lat.toString().trim()+','+
                    destinatin.lng.toString().trim()+
                    '&mode=driving&key=AIzaSyDODuVVeOpnu_Z_RxhTzPJ2TJw2LeYb2Xs';
            
                return  this.http.get(string1).map((response:Response) => {
                    console.log(response);
                    console.log(response.json().rows[0].elements[0].duration.text)
                    
                        return response.json().rows[0].elements[0].duration.text;
                })

    }

    async calculateTravelTime(bus:Coords,device:Coords,location:Coords){
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
                    

        console.log(1);
      const a = await this.http.get(string1).subscribe(
                        (data)=>{
                            console.log(data.json().status)
                            if(data.json().status=='OK'){

                            console.log(data.json().rows[0].elements[0].duration.text);
                            timeToPoint=data.json().rows[0].elements[0].duration.text;

                     this.http.get(string2).subscribe(
                    (data)=>{
                            console.log(data.json().status)
                           if(data.json().status=='OK'){
                            console.log(data.json().rows[0].elements[0].duration.text);
                            parentTravelTime=data.json().rows[0].elements[0].duration.text;
                            console.log({timeToPoint:timeToPoint,parentTravelTime:parentTravelTime});
                             return {timeToPoint:timeToPoint,parentTravelTime:parentTravelTime};
                            
                        }
                        else
                            return 3
                        });

                        }
                        else 
                            return 2
                        }
                        ,
                        error=>console.log(error)
                    );  

                    console.log(a);
					
        //    return 1;
             console.log(2);
              return {timeToPoint:timeToPoint,parentTravelTime:parentTravelTime};
    }

    getDriverCode(school:string,bus:string){
        return firebase.database().ref('/cubspot/tracker/'+school+'/bus/'+bus+'/driver');
    }

    getDriverDetails(school:string,driver:string){
         return firebase.database().ref('/cubspot/tracker/'+school+'/drivers/'+driver);
    }
   

}
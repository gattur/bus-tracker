
export class DBPaths{

    getParentdata(pnumber:string){
        return '/cubspot/parent/'+pnumber;
    } 
    getBusLocations(school:string,busNo:string){
        return '/cubspot/buses/'+school+'/'+busNo;
    }
    getSchoolBusses(school:string){
        return '/cubspot/schools/'+school;
    }

}
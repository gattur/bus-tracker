import { Location } from './location';


export class Student{

    constructor(public name:string,public busNo:string,public school:string,public pickUp:Location,public drop:Location,
                public firstTime:boolean){}

}
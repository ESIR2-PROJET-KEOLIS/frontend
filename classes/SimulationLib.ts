import {SimulationInfo} from "~/classes/SimulationInfo";
import axios from "axios";

export function getBusPositionSimulation(simulation : SimulationInfo, callback : Function, errorCallback : Function){
    try{
        console.log("Bus Position Simulation request...")
        const day = ["sunday", "monday","tuesday","wednesday","thursday", "friday", "saturday"][simulation.getDaySimulated()];
        let hour:any = Math.trunc(simulation.getHourSimulated()/60);
        if(hour<10) hour = "0"+hour;
        let minute:any = simulation.getHourSimulated()%60;
        if(minute<10) minute = "0"+minute;
        axios.get('http://localhost:3500/action/location/bus/'+day+"/"+hour+"/"+minute, {
            headers: {"Access-Control-Allow-Origin": "*"}
        }).then(function (response) {
            console.log("Simulation data received for "+day+" at "+hour+":"+minute);
            callback(response.data);
        }).catch((e) => {
            console.log(e)
            errorCallback(e);
        });
    } catch (e){
        console.log(e);
        errorCallback(e);
    }
}

export enum SimulationState {
    WAITING = "Waiting response ",
    READY = "Last updated "
}
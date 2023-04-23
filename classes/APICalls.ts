import axios from "axios";
import {ErrorModal} from "~/classes/ErrorModal";

export function getAPIData(url: string, callback: Function, errorMessage: string){
    try{
        axios.get(url, {
            headers: {"Access-Control-Allow-Origin": "*"}
            // @ts-ignore
        }).then(callback);
    } catch (e){
        console.log(e)
        ErrorModal.show(errorMessage);
    }
}
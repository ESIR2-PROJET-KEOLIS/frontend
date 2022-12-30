export class SimulationInfo {
    // @ts-ignore
    private day: number;
    // @ts-ignore
    private hourSimulated: number;

    constructor() {
        this.refreshRealTime();
    }

    private getHourSimulatedSlider(hour:number, minute:number) : number {
        return hour*60 + minute;
    }

    public setHourSimulated(sliderValue:number) {
        this.hourSimulated = sliderValue;
    }

    public setDaySimulated(day:number) {
        this.day = day;
    }

    public getDaySimulated() : number {
        return this.day;
    }

    public getHourSimulated() : number {
        return this.hourSimulated;
    }

    public refreshRealTime(){
        let currentdate = new Date();
        let hour = currentdate.getHours();
        let minute = currentdate.getMinutes();
        this.hourSimulated = this.getHourSimulatedSlider(hour, minute);
        this.day = currentdate.getDay();
    }
}
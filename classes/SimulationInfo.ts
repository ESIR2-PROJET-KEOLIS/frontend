export class SimulationInfo {
    private day: number;
    private hourSimulated: number;

    constructor() {
        let currentdate = new Date();
        let hour = currentdate.getHours();
        let minute = currentdate.getMinutes();
        this.hourSimulated = this.getHourSimulatedSlider(hour, minute);
        this.day = currentdate.getDay();
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
}
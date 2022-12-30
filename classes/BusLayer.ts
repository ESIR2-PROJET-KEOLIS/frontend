export class BusLayer {
    public lineName: string;
    public visible: boolean;
    public layerID: string;

    constructor(layerID: string, lineName: string) {
        this.layerID = layerID;
        this.lineName = lineName;
        this.visible = true;
    }
}
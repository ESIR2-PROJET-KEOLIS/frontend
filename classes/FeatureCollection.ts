export class FeatureCollection {
    type: string = "FeatureCollection";
    features: Feature[] = [];
}

export class FeatureCollectionLine extends FeatureCollection{
    constructor() {
        super();
        this.features.push(new Feature(new Geometry("LineString", []), {}));
    }
}

export class Geometry {
    type: string;
    coordinates: number[];

    constructor(type: string, coordinates: number[]) {
        this.type = type;
        this.coordinates = coordinates;
    }
}

export class Feature {
    type: string = "Feature";
    geometry: Geometry;
    properties: any;

    constructor(geometry: Geometry, properties: any) {
        this.geometry = geometry;
        this.properties = properties;
    }
}
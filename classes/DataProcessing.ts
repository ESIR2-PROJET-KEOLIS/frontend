import {FeatureCollection} from "~/classes/FeatureCollection";
import {Config} from "~/classes/Config";

export function processBusFeaturesData(data: FeatureCollection){
    if(!data || !data.features) return;
    for (let feature of data.features) {
        feature.properties.rotation = 0;
    }
}

export function setLayersColor(map: any, colors: any, showColors: boolean){
    for (let layer of map.getStyle().layers) {
        if(layer.id.startsWith("bus-")){
            let lineName = layer.id.split("-")[2];
            map.setPaintProperty(layer.id, 'icon-color', showColors ? (colors[lineName] || Config.busColor) : Config.busColor);
        }
    }
}

export function createBusLayers(map: any, data: FeatureCollection, colors: any, showColors: boolean, callbackLayer?: Function){
    map.addSource("busses", {
        'type': 'geojson',
        'data': data
    });
    // Create all bus layers
    for(let feature of data.features) {
        const symbol = "bus-icon"
        const layerID = "bus-line-" + feature.properties.line;
        feature.properties.rotation = 0;

        if (!map.getLayer(layerID)) {
            map.addLayer({
                'id': layerID,
                'type': 'symbol',
                'source': 'busses',
                'layout': {
                    'icon-image': `${symbol}`,
                    'icon-size': 0.35,
                    'icon-allow-overlap': true,
                    'icon-rotate': ['get', 'rotation']
                },
                "paint": {
                    "icon-color": showColors ? (colors[feature.properties.line] || Config.busColor) : Config.busColor
                },
                'filter': ['==', 'line', layerID.split("-")[2]]
            });
            if(callbackLayer) callbackLayer(layerID, feature.properties.line);
        }
    }
}
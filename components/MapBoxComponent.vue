<template>
    <client-only>
        <div id="mapDiv" ref="mapDiv"></div>
        <img src="~/assets/icons/bus.png" alt="bus"  style="display: none; pointer-events: none" ref="icon-bus">
        <img src="~/assets/icons/busStop.png" alt="busStop"  style="display: none; pointer-events: none" ref="icon-stop-bus">
        <div class="alert shadow-lg bg-neutral">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="text-base">
                    {{realtimeEnabled ? 'Real-time' : 'Simulation' }},
                    {{ realtimeEnabled ? 'Last updated ' : statusMessage }}
                    : {{ realtimeEnabled? lastUpdatedRT : lastUpdatedSim }}s</span>
            </div>
        </div>
    </client-only>
</template>

<script>
import mapboxgl from "mapbox-gl";
import {BusLayer, lineToLayerID} from "~/classes/BusLayer";
import BusLogo from '~/assets/icons/bus.png';
import BusStopLogo from 'assets/icons/busStop.png';
import axios from "axios";
import {getDistanceFromLatLon, getBearing, destinationPoint} from "~/classes/LocationsLib";
import {Feature, FeatureCollection, FeatureCollectionLine, Geometry} from "~/classes/FeatureCollection";
import {getBusPositionSimulation, SimulationState} from "~/classes/SimulationLib";
import {createBusLayers, setLayersColor} from "~/classes/DataProcessing";
import {Config} from "~/classes/Config";
import {getAPIData} from "~/classes/APICalls";
import {ErrorModal} from "~/classes/ErrorModal";

export default {
    name: "MapBoxComponent",
    data: () => ({
        mapRef : null,
        simulatedData : new FeatureCollection(),
        bus_stops : new FeatureCollection(),
        subway_stops : new FeatureCollection(),
        empty : new FeatureCollection(),
        initialized : false,
        realTimeData: new FeatureCollection(),
        routes: {},
        debugDirectionLines : new FeatureCollectionLine(),
        lastUpdatedRT: 0,
        lastUpdatedSim: 0,
        lastUpdatedDateRT: new Date(),
        lastUpdatedDateSim: new Date(),
        busVisible: true,
        displayedRoutes: new FeatureCollection(),
        refreshTimeout: 100.0,
        routesColors: {},
        lastAnimationExecutionTime: 0,
        statusMessage: SimulationState.READY,
    }),
    props: {
        busLines: {
            type: Array,
            default: []
        },
        linesHighlight:{
            type: Array,
            default: []
        },
        dynamicFrameRate:{
            type: Boolean,
            default: true
        },
        busBearing:{
            type: Boolean,
            default: true
        },
        busColor:{
            type: Boolean,
            default: false
        },
        debug:{
            type: Boolean,
            default: false
        },
        realtimeEnabled:{
            type: Boolean,
            default: true
        },
    },
    watch: {
        busColor: function(newVal) {
            setLayersColor(this.mapRef, this.routesColor, newVal);
        },
    },
    methods:{
        switchDebug(value){
            if(!value){
                this.debugDirectionLines.features = [];
                this.mapRef.getSource('debugDirectionLines').setData(this.debugDirectionLines);
            }
        },
        changeVisibilityBus(value){
            this.busVisible = value;
            if(value){
                let data = this.realtimeEnabled ? this.realTimeData : this.simulatedData;
                createBusLayers(this.mapRef, data, this.routesColor, this.busColor);
                this.updateBusesLayersVisibility();
            } else {
                for (let layer of this.mapRef.getStyle().layers) {
                    if(layer.id.startsWith("bus-")){
                        this.mapRef.removeLayer(layer.id);
                    }
                }
                this.mapRef.removeSource("busses");
            }
        },
        changeStopVisibility(value){
            this.mapRef.setLayoutProperty("busStopLayer", 'visibility', value ? 'visible' : 'none');
        },
        updateBusesLayersVisibility(){
            for(let i = 0; i<this.busLines.length; i++){
                if(this.mapRef.getLayer(this.busLines[i].layerID) !== undefined) this.mapRef.setLayoutProperty(this.busLines[i].layerID, 'visibility', this.busLines[i].visible ? 'visible' : 'none');
            }
        },
        updateLinesVisibility(){
            this.displayedRoutes.features = [];
            for(let i = 0; i<this.linesHighlight.length; i++){
                if(this.linesHighlight[i].visible){
                    if(this.routes[this.linesHighlight[i].lineName+"_0"] !== undefined && this.routes[this.linesHighlight[i].lineName+"_0"].length !== undefined){
                        let coordinates0 = this.routes[this.linesHighlight[i].lineName+"_0"].map((route) => {return [route[1], route[0]]});
                        let coordinates1 = this.routes[this.linesHighlight[i].lineName+"_1"].map((route) => {return [route[1], route[0]]});
                        this.displayedRoutes.features.push(new Feature(new Geometry('LineString', coordinates0), {color: this.routesColor[this.linesHighlight[i].lineName] || "#000"}));
                        this.displayedRoutes.features.push(new Feature(new Geometry('LineString', coordinates1), {color: this.routesColor[this.linesHighlight[i].lineName] || "#000"}));
                    }
                }
            }
            this.mapRef.getSource('displayedRoutes').setData(this.displayedRoutes);
        },
        loadMapFirstTime(data){
            const runtimeConfig = useRuntimeConfig();
            this.initialized = true;

            // Set mapbox token
            mapboxgl.accessToken = runtimeConfig.public.mapboxAccessToken;

            // Create map
            this.mapRef = new mapboxgl.Map({
                container: 'mapDiv',
                style: 'mapbox://styles/jeanbombeur/clbm382qs000l14mu0ayx6zxi',
                center: [-1.656946, 48.114572],
                zoom:13,
                minzoom: 16,
                maxPitch: 0,
                minPitch: 0,
                performanceMetricsCollection: false,
                maxBounds: new mapboxgl.LngLatBounds(
                    new mapboxgl.LngLat(-1.776660, 48.044477), //48.044477, -1.776660
                    new mapboxgl.LngLat(-1.563988, 48.188023) //48.188023, -1.563988
                ),
            });

            this.realTimeData = data;
            this.mapRef.on('load', () => {
                // Set canvas attribute to improve performance
                try {
                    let canvas = this.mapRef.getCanvas();
                    canvas.setAttribute("willReadFrequently", "true");
                } catch (e) {
                    console.log("Error setting canvas attribute willReadFrequently to true", e);
                }

                // create the bus stop image logo
                const imageStop = new Image(100, 100);
                imageStop.src = BusStopLogo;
                // add image to the active style and make it SDF-enabled
                this.mapRef.addImage('busstop-icon', imageStop, { sdf: true });

                // create the bus image logo
                const imageBus = new Image(100, 100);
                imageBus.src = BusLogo;
                // add image to the active style and make it SDF-enabled
                this.mapRef.addImage('bus-icon', imageBus, { sdf: true });

                // Add sources of data to the map
                const sources = [
                    {id : "debugDirectionLines", data : this.debugDirectionLines},
                    {id : "busStop", data : this.bus_stops},
                    {id : "subwayStation", data : this.subway_stops},
                    {id : "displayedRoutes", data : {type: 'FeatureCollection', features: []}}
                ];

                for(const source of sources){
                    this.mapRef.addSource(source.id, {
                        'type': 'geojson',
                        'data': source.data
                    });
                }

                // Create debug layer (for direction vectors)
                this.mapRef.addLayer({
                    type: 'line',
                    source: 'debugDirectionLines',
                    id: 'line-background',
                    paint: {
                        'line-color': 'red',
                        'line-width': 6,
                        'line-opacity': 1
                    }
                });

                // Create layer for displayed routes
                this.mapRef.addLayer({
                    id: 'displayedRouteLayer',
                    type: 'line',
                    source: 'displayedRoutes',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': ['get', 'color'],
                        'line-width': 5,
                        'line-opacity': 1
                    }
                });

                // Create layer for bus stops
                this.mapRef.addLayer({
                    'id': "busStopLayer",
                    'type': 'symbol',
                    'source': 'busStop',
                    'layout': {
                        'icon-image': "busstop-icon",
                        'icon-size': 0.15,
                        'icon-allow-overlap': true,
                    },
                    "paint": {
                        "icon-color": Config.busStopColor
                    }
                });

                this.mapRef.on('click', 'busStopLayer', (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const name = e.features[0].properties.name;

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML("<strong>"+name+"</strong>")
                        .addTo(this.mapRef);
                });
                this.mapRef.on('mouseenter', 'busStopLayer', () => {
                    this.mapRef.getCanvas().style.cursor = 'pointer';
                });
                this.mapRef.on('mouseleave', 'busStopLayer', () => {
                    this.mapRef.getCanvas().style.cursor = '';
                });

                // Create all bus layers
                createBusLayers(this.mapRef, data, this.routesColor, this.busColor, (layerID, line) => {
                    this.mapRef.on('click', layerID, (e) => {
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const line = e.features[0].properties.line;
                        let busFilling = "Unknown";
                        let color = "#000000";
                        if(e.features[0].properties.filling_level && e.features[0].properties.filling_proba){
                            switch (e.features[0].properties.filling_level) {
                                case "maxFreqL":
                                    busFilling = "Low, "+e.features[0].properties.filling_proba.toFixed(2)+"%";
                                    color = "#058805";
                                    break;
                                case "maxFreqM":
                                    busFilling = "Medium, "+e.features[0].properties.filling_proba.toFixed(2)+"%";
                                    color = "#FFA500";
                                    break;
                                case "maxFreqH":
                                    busFilling = "High, "+e.features[0].properties.filling_proba.toFixed(2)+"%";
                                    color = "#b72626";
                                    break;
                            }
                        }
                        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                        }

                        new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML("<span>" +
                                "<strong> Bus line : </strong>" +
                                line+
                                "</span>" +
                                "</br>" +
                                "<span style='color: "+color+"'>" +
                                "<strong style='color: #000000'> Bus Filling Prediction : </strong>" +
                                " "+busFilling+
                                "</span>")
                            .addTo(this.mapRef);
                    });
                    this.mapRef.on('mouseenter', layerID, () => {
                        this.mapRef.getCanvas().style.cursor = 'pointer';
                    });
                    this.mapRef.on('mouseleave', layerID, () => {
                        this.mapRef.getCanvas().style.cursor = '';
                    });
                });

                this.loadBusStop();
                this.animate();
            });
        },
        animate(){
            let start = Date.now();
            let data = this.realtimeEnabled ? this.realTimeData : this.simulatedData;
            if(data !== null){
                let debugFeatures = [];
                const distance = 20000.0/3600.0*((this.refreshTimeout)/1000.0);
                data.features.forEach((feature, i) => {
                    if(feature === undefined || feature.geometry === undefined || feature.geometry.coordinates === undefined){
                        return;
                    }

                    const currentCoordinates = feature.geometry.coordinates;
                    let nextCoor = this.routes[feature.properties.line+"_"+feature.properties.sens];
                    if(nextCoor === undefined || nextCoor.length <= feature.properties.nextindex){return;}
                    nextCoor = nextCoor[feature.properties.nextindex];
                    if(nextCoor === undefined){return;}

                    const distanceWithNext = getDistanceFromLatLon(currentCoordinates[1], currentCoordinates[0], nextCoor[0], nextCoor[1])*1000;
                    if(distanceWithNext < distance){
                        feature.properties.nextindex++;
                        feature.geometry.coordinates = [nextCoor[1], nextCoor[0]];
                        return;
                    }

                    const bearing = getBearing(currentCoordinates[1], currentCoordinates[0], nextCoor[0], nextCoor[1]);
                    if(this.debug){
                        let newFeature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                coordinates: [],
                                type: 'LineString'
                            }};

                        newFeature.geometry.coordinates = [[currentCoordinates[0], currentCoordinates[1]], [nextCoor[1], nextCoor[0]]];
                        debugFeatures.push(newFeature);
                    }

                    const nextPoint = destinationPoint(currentCoordinates[1], currentCoordinates[0], distance, bearing);
                    feature.geometry.coordinates = [nextPoint[1], nextPoint[0]];
                    feature.properties.rotation = this.busBearing ? bearing+90 : 0;
                });

                if(this.busVisible) {
                    this.mapRef.getSource('busses').setData(data);
                }
                if(this.debug){
                    this.debugDirectionLines.features = debugFeatures;
                    this.mapRef.getSource('debugDirectionLines').setData(this.debugDirectionLines);
                }
            }
            this.lastAnimationExecutionTime = (Date.now() - start).toFixed(1);
            if(this.dynamicFrameRate){
                this.refreshTimeout = this.lastAnimationExecutionTime;
            }

            this.lastUpdatedRT = Math.floor((new Date().getTime() - this.lastUpdatedDateRT.getTime())/1000);
            this.lastUpdatedSim = Math.floor((new Date().getTime() - this.lastUpdatedDateSim.getTime())/1000);

            setTimeout(() => {requestAnimationFrame(this.animate)}, this.dynamicFrameRate ? 0 : Math.max(0, this.refreshTimeout-this.lastAnimationExecutionTime));
        },

        updateMapRT(data){
            if(this.realtimeEnabled) this.mapRef.getSource('busses').setData(data);
        },
        setFPS(fps){
            if(fps===0) this.refreshTimeout = 100;
            else this.refreshTimeout = 1000.0/fps.toFixed(1);
        },
        onRequestSimulation(simulationInfo){
            if(this.statusMessage === SimulationState.READY){
                this.sendSimulationRequest(simulationInfo);
            }
        },
        sendSimulationRequest(simulationInfo){
            this.statusMessage = SimulationState.WAITING;
            this.lastUpdatedDateSim = new Date();
            getBusPositionSimulation(simulationInfo ,this.updateSimulatedData, this.onErrorSimulation);
        },
        onErrorSimulation(e){
            console.log("Simulation Error", e);
            ErrorModal.show("An error occurred while trying to simulate the bus positions. Please try again.");
            this.statusMessage = SimulationState.READY;
            this.lastUpdatedDateSim = new Date();
        },
        updateSimulatedData(data){
            this.statusMessage = SimulationState.READY;
            this.lastUpdatedDateSim = new Date();
            this.simulatedData.features = [];
            let count = 0;
            for (let key of Object.keys(data)) {
                for (let bus of data[key]) {
                    if(!bus || !bus.position) continue;
                    count++;
                    let feature = new Feature(new Geometry("Point", [bus.position[0], bus.position[1]]),
                        {id: bus.id, sens: bus.sens, line: key, nextindex: bus.next_index_opti, rotation: 0, filling_proba: bus.filling_proba, filling_level: bus.filling_level});
                    this.simulatedData.features.push(feature);
                }
            }
            if(count === 0) {
                ErrorModal.show("No bus position found for the selected time. Please try again.");
            }
        },
        loadBusStop(){
            try{
                let ref = this;
                console.log("Get bus stop locations request...")
                axios.get(Config.urlBack+'/action/station/bus', {
                    headers: {"Access-Control-Allow-Origin": "*"}
                }).then(function (response) {
                    console.log("bus stop received");

                    let stopParsed = new Set();
                    let i = 0;
                    for (let bus_station of response.data) {
                        if(stopParsed.has(bus_station.position.longitude+","+bus_station.position.latitude)) continue;
                        stopParsed.add(bus_station.position.longitude+","+bus_station.position.latitude);
                        ref.bus_stops.features.push(new Feature(new Geometry("Point", [bus_station.position.longitude, bus_station.position.latitude]), {name: bus_station.name}));
                    }
                    ref.mapRef.getSource('busStop').setData(ref.bus_stops);
                })
            } catch (e){
                console.log(e)
            }
        },

        receiveLinesRoutes(response){
            console.log("Api lines routes received");
            this.routes = response.data;
        },
        loadColorsAndLines(response){
            console.log("Api bus colors received");
            this.routesColor = {};
            for (let colorline of response.data) {
                this.routesColor[colorline.line] = colorline.lineColor;
                const layerID = lineToLayerID(colorline.line);
                this.busLines.push(new BusLayer(layerID, colorline.line));
                let busLayer = new BusLayer(layerID, colorline.line);
                busLayer.visible = false;
                this.linesHighlight.push(busLayer);
            }
        },

    },
    mounted() {
        let webSocket = new WebSocket(Config.urlWS);

        webSocket.onerror = (event) => {
            console.log(event);
            ErrorModal.show("An error occurred while trying to connect to the backend. Please try again later.");
        };

        webSocket.onopen = (event) => {
            webSocket.send("bus");
            console.log("WebSocket Connection established");
        };

        webSocket.onmessage = (event) => {
            let data = JSON.parse(event.data);
            this.realTimeData = data;
            this.lastUpdatedDateRT = new Date();

            if(!this.initialized) this.loadMapFirstTime(data);
            else this.updateMapRT(data);
        }

        getAPIData(Config.urlBack+'/lines', this.receiveLinesRoutes, "Error while getting lines routes from backend API. Line visualization and movement interpolation will not work.");
        getAPIData(Config.urlBack+'/action/color/line', this.loadColorsAndLines, "Error while getting color lines from backend API. Color and filtering line of bus will not work.");
    },
}
</script>

<style scoped>
#mapDiv{
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
.alert{
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 1000;
    max-width: 17vw;

}
</style>
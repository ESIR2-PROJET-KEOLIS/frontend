<template>
    <div id="mapDiv" ref="mapDiv">

    </div>
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
</template>

<script>
import mapboxgl from "mapbox-gl";
import { BusLayer} from "~/classes/BusLayer";
import BusLogo from '~/assets/icons/bus.png';
import BusStopLogo from 'assets/icons/busStop.png';
import axios from "axios";
import {getDistanceFromLatLon, getBearing, destinationPoint} from "~/classes/LocationsLib";
import {Feature, FeatureCollection, FeatureCollectionLine, Geometry} from "~/classes/FeatureCollection";
import {getBusPositionSimulation, SimulationState} from "~/classes/SimulationLib";

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
        busColor: function(newVal, oldVal) {
            for (let layer of this.mapRef.getStyle().layers) {
                if(layer.id.startsWith("bus")){
                    let lineName = layer.id.split("-")[2];
                    this.mapRef.setPaintProperty(layer.id, 'icon-color', newVal ? (this.routesColor[lineName] || "#1f89a9") : "#1f89a9");
                }
            }
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
            if(value){
                this.busVisible = true;
                if(this.realtimeEnabled) this.mapRef.getSource('busses').setData(this.realTimeData);
                else this.mapRef.getSource('busses').setData(this.simulatedData);
            } else {
                this.busVisible = false;
                this.mapRef.getSource('busses').setData(this.empty);
            }
        },
        changeStopVisibility(value){
            this.mapRef.setLayoutProperty("busStopLayer", 'visibility', value ? 'visible' : 'none');
        },
        updateBusesLayersVisibility(){
            for(let i = 0; i<this.busLines.length; i++){
                this.mapRef.setLayoutProperty(this.busLines[i].layerID, 'visibility', this.busLines[i].visible ? 'visible' : 'none');
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
                maxBounds: new mapboxgl.LngLatBounds(
                    new mapboxgl.LngLat(-1.776660, 48.044477), //48.044477, -1.776660
                    new mapboxgl.LngLat(-1.563988, 48.188023) //48.188023, -1.563988
                ),
            });

            this.realTimeData = data;
            this.mapRef.on('load', () => {

                // Set canvas attribute to improve performance
                try {
                    this.$refs["mapDiv"].querySelector('.mapboxgl-canvas-container').childNodes[0].setAttribute("willReadFrequently", "true")
                } catch (e) {
                    console.log("Error setting canvas attribute willReadFrequently to true");
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
                    {id : "busses", data : this.realTimeData},
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
                        'icon-size': 0.2,
                        'icon-allow-overlap': true,
                    },
                    "paint": {
                        "icon-color": "#2e43af"
                    }
                });

                // Create all bus layers
                for(const feature of data.features) {
                    const symbol = "bus-icon"
                    const layerID = "bus-line-" + feature.properties.line;

                    if (!this.mapRef.getLayer(layerID)) {
                        this.mapRef.addLayer({
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
                                "icon-color": "#1f89a9"
                            },
                            'filter': ['==', 'line', layerID.split("-")[2]]
                        });
                        this.busLines.push(new BusLayer(layerID, feature.properties.line));
                        let busLayer = new BusLayer(layerID, feature.properties.line);
                        busLayer.visible = false;
                        this.linesHighlight.push(busLayer);
                    }
                }

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

        updateMap(data){
            this.mapRef.getSource('busses').setData(data);
        },
        setFPS(fps){
            if(fps===0) this.refreshTimeout = 100;
            else this.refreshTimeout = 1000.0/fps.toFixed(1);
        },
        onRequestSimulation(simulationInfo){
            this.mapRef.getSource('busses').setData(this.simulatedData);
            if(this.statusMessage === SimulationState.READY){
                this.sendSimulationRequest(simulationInfo);
            }
        },
        sendSimulationRequest(simulationInfo){
            this.statusMessage = SimulationState.WAITING;
            this.lastUpdatedDateSim = new Date();
            getBusPositionSimulation(simulationInfo ,this.updateSimulatedData);
        },
        updateSimulatedData(data){
            this.statusMessage = SimulationState.READY;
            this.lastUpdatedDateSim = new Date();
            this.simulatedData.features = [];
            for (let key of Object.keys(data)) {
                for (let bus of data[key]) {
                    if(!bus || !bus.position) continue;
                    let feature = new Feature(new Geometry("Point", [bus.position[0], bus.position[1]]),
                        {id: bus.id, sens: bus.sens, line: key, nextindex: bus.next_index_opti, rotation: 0});
                    this.simulatedData.features.push(feature);
                }
            }
        },
        loadBusStop(){
            try{
                let ref = this;
                console.log("Get bus stop locations request...")
                axios.get('http://localhost:3500/action/station/bus', {
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
    },
    mounted() {
        let webSocket = new WebSocket("ws://localhost:4000");

        webSocket.onopen = (event) => {
            webSocket.send("bus");
            console.log("WebSocket Connection established");
        };

        webSocket.onmessage = (event) => {
            let data = JSON.parse(event.data);
            this.realTimeData = data;
            this.lastUpdatedDateRT = new Date();
            if(!this.initialized) this.loadMapFirstTime(data);
            else this.updateMap(data);
        }

        try{
            let ref = this;
            console.log("Api lines request...")
            axios.get('http://localhost:3500/lines', {
                headers: {"Access-Control-Allow-Origin": "*"}
            }).then(function (response) {
                console.log("Api lines received");
                ref.routes = response.data;
            })
        } catch (e){
            console.log(e)
        }

        try{
            let ref = this;
            console.log("Get color request...")
            axios.get('http://localhost:3500/action/color/line', {
                headers: {"Access-Control-Allow-Origin": "*"}
            }).then(function (response) {
                console.log("Api colors received");
                ref.routesColor = {};
                for (let colorline of response.data) {
                    ref.routesColor[colorline.line] = colorline.lineColor;
                }
            })
        } catch (e){
            console.log(e)
        }
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
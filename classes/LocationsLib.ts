// source : https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
export function getDistanceFromLatLon(lat1 : number, lon1 : number, lat2 : number, lon2 : number){
    let R = 6371;
    let dLat = deg2rad(lat2-lat1);
    let dLon = deg2rad(lon2-lon1);
    let a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    return d;
};

function deg2rad(deg : number){
    return deg * (Math.PI/180)
};

// https://stackoverflow.com/questions/3932502/calculate-angle-between-two-latitude-longitude-points
export function getBearing(lat1 : number, long1 : number, lat2 : number, long2 : number) {
    let dLon = (long2 - long1);

    let y = Math.sin(dLon) * Math.cos(lat2);
    let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
        * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);

    let pi = Math.PI;
    brng = brng * (180/pi);
    brng = (brng + 360) % 360;
    brng = 360 - brng;

    return brng
};

// source : (DaveAlden) https://stackoverflow.com/questions/19352921/how-to-use-direction-angle-and-speed-to-calculate-next-times-latitude-and-longi
export function destinationPoint(lat : number, lon : number, distance : number, bearing : number) {
    let radius = 6371e3; // (Mean) radius of earth

    let toRadians = function(v : number) { return v * Math.PI / 180; };
    let toDegrees = function(v : number) { return v * 180 / Math.PI; };

    let δ = Number(distance) / radius;
    let θ = toRadians(Number(bearing));

    let φ1 = toRadians(Number(lat));
    let λ1 = toRadians(Number(lon));

    let sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
    let sinδ = Math.sin(δ), cosδ = Math.cos(δ);
    let sinθ = Math.sin(θ), cosθ = Math.cos(θ);

    let sinφ2 = sinφ1*cosδ + cosφ1*sinδ*cosθ;
    let φ2 = Math.asin(sinφ2);
    let y = sinθ * sinδ * cosφ1;
    let x = cosδ - sinφ1 * sinφ2;
    let λ2 = λ1 + Math.atan2(y, x);

    return [toDegrees(φ2), (toDegrees(λ2)+540)%360-180];
};
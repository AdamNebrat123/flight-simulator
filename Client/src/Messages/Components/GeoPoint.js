export class GeoPoint {
  constructor(longitude, latitude, altitude) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
  }
  toString() {
        return `(${this.longitude}, ${this.latitude}, ${this.altitude})`;
    }
}
public class GeoPoint
{
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public double Height { get; set; }

    public GeoPoint() {}

    public GeoPoint(double longitude, double latitude, double height)
    {
        Longitude = longitude;
        Latitude = latitude;
        Height = height;
    }
}
public interface ISetJammingMode
{


    void StartDirectionalJamming(double directionDegrees);
    void StartOmnidirectionalJamming();
    void StopJamming();
}
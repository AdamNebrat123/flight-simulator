using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class DangerZonesDataManager
{
    private static DangerZonesDataManager _instance;
    private DangerZonesData _dangerZonesData = new();
    private string _dataFilePath;

    private DangerZonesDataManager()
    {
    }

    public static DangerZonesDataManager GetInstance()
    {
        if (_instance == null)
        {
            _instance = new DangerZonesDataManager();
        }
        return _instance;
    }

    public void ReadData()
    {
        // Base directory = project root (relative to executable location)
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        // Navigate up from "Server\Src\bin\Debug\netX.X" to "Server"
        string serverDir = Path.GetFullPath(Path.Combine(baseDir, @"..\..\.."));

        // Build the Data folder path
        string dataDir = Path.Combine(serverDir, "Data");

        // Ensure Data folder exists
        Directory.CreateDirectory(dataDir);

        // Full path for the JSON file
        _dataFilePath = Path.Combine(dataDir, "DangerZonesData.json");
        if (!File.Exists(_dataFilePath))
        {
            // Save default empty object
            Save();
        }
        else
        {
            // Load existing data
            Load();
        }
    }

    public void Save()
    {
        var json = JsonSerializer.Serialize(_dangerZonesData, new JsonSerializerOptions
        {
            WriteIndented = true,
            Converters = { new JsonStringEnumConverter() }
        });
        File.WriteAllText(_dataFilePath, json);
    }

    public void Load()
    {
        var json = File.ReadAllText(_dataFilePath);
        if (!string.IsNullOrWhiteSpace(json))
        {
            _dangerZonesData = JsonSerializer.Deserialize<DangerZonesData>(json) ?? new DangerZonesData();
        }
    }

    public DangerZonesData GetData()
    {
        return _dangerZonesData;
    }

    public string GetDataFilePath()
    {
        return _dataFilePath;
    }

    // ---------------------------
    // Add / Remove DangerZone
    // ---------------------------
    public void AddDangerZone(DangerZone zone)
    {
        _dangerZonesData.data.Add(zone);
        Save();
    }
    public DangerZone? GetDangerZoneByName(string zoneName)
    {
        return _dangerZonesData.data.FirstOrDefault(z => z.zoneName == zoneName);
    }

    public List<DangerZone> GetDangerZones()
    {
        return _dangerZonesData.data;
    }
    public List<string> GetAllDangerZoneNames()
    {
        return _dangerZonesData.data.Select(z => z.zoneName).ToList();
    }
    public bool RemoveDangerZone(string zoneName)
    {
        var zone = _dangerZonesData.data.FirstOrDefault(z => z.zoneName == zoneName);
        if (zone != null)
        {
            _dangerZonesData.data.Remove(zone);
            Save();
            return true;
        }
        return false;
    }
    public bool EditDangerZone(string zoneName, DangerZone updatedZone)
    {
        // Find the existing region by name
        var existingZone = _dangerZonesData.data.FirstOrDefault(z => z.zoneName == zoneName);
        if (existingZone != null)
        {
            int index = _dangerZonesData.data.IndexOf(existingZone);
            _dangerZonesData.data[index] = updatedZone;

            Save();
            return true;
        }
        return false;
    }
}

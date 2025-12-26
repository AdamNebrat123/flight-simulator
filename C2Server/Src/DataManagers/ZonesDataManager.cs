using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class ZonesDataManager
{
    private static ZonesDataManager _instance;
    private ZonesData _zonesData = new();
    private string _dataFilePath;

    private ZonesDataManager()
    {
    }

    public static ZonesDataManager GetInstance()
    {
        if (_instance == null)
        {
            _instance = new ZonesDataManager();
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
        var json = JsonSerializer.Serialize(_zonesData, new JsonSerializerOptions
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
            _zonesData = JsonSerializer.Deserialize<ZonesData>(json) ?? new ZonesData();
        }
    }

    public ZonesData GetData()
    {
        return _zonesData;
    }

    public string GetDataFilePath()
    {
        return _dataFilePath;
    }

    public void AddAndSaveZone(Zone zone)
    {
        _zonesData.data.Add(zone);
        Save();
    }

    public List<Zone> GetZones()
    {
        return _zonesData.data;
    }
    public List<string> GetAllZoneNames()
    {
        return _zonesData.data.Select(z => z.zoneName).ToList();
    }
    public bool RemoveAndSaveZone(string zoneId)
    {
        var zone = _zonesData.data.FirstOrDefault(z => z.zoneId == zoneId);
        if (zone != null)
        {
            _zonesData.data.Remove(zone);
            Save();
            return true;
        }
        return false;
    }
    public bool EditAndSaveZone(string zoneId, Zone updatedZone)
    {
        // Find the existing region by name
        var existingZone = _zonesData.data.FirstOrDefault(z => z.zoneId == zoneId);
        if (existingZone != null)
        {
            int index = _zonesData.data.IndexOf(existingZone);
            _zonesData.data[index] = updatedZone;

            Save();
            return true;
        }
        return false;
    }
}

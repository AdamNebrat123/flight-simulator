using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class JammersDataManager
{
    private static JammersDataManager _instance;
    private JammersData _jammersData = new();
    private string _dataFilePath;

    private JammersDataManager()
    {
    }

    public static JammersDataManager GetInstance()
    {
        if (_instance == null)
        {
            _instance = new JammersDataManager();
        }
        return _instance;
    }

    public void ReadData()
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string serverDir = Path.GetFullPath(Path.Combine(baseDir, @"..\..\.."));
        string dataDir = Path.Combine(serverDir, "Data");
        Directory.CreateDirectory(dataDir);

        _dataFilePath = Path.Combine(dataDir, "JammersData.json");
        if (!File.Exists(_dataFilePath))
        {
            Save();
        }
        else
        {
            Load();
        }
    }

    public void Save()
    {
        var json = JsonSerializer.Serialize(_jammersData, new JsonSerializerOptions
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
            _jammersData = JsonSerializer.Deserialize<JammersData>(json) ?? new JammersData();
        }
    }

    public JammersData GetData()
    {
        return _jammersData;
    }

    public string GetDataFilePath()
    {
        return _dataFilePath;
    }

    public void AddAndSaveJammer(Jammer jammer)
    {
        _jammersData.data.Add(jammer);
        Save();
    }

    public List<Jammer> GetJammers()
    {
        return _jammersData.data;
    }

    public bool RemoveAndSaveJammer(string jammerId)
    {
        var jammer = _jammersData.data.FirstOrDefault(j => j.id == jammerId);
        if (jammer != null)
        {
            _jammersData.data.Remove(jammer);
            Save();
            return true;
        }
        return false;
    }

    public bool EditAndSaveJammer(string jammerId, Jammer updatedJammer)
    {
        var existingJammer = _jammersData.data.FirstOrDefault(j => j.id == jammerId);
        if (existingJammer != null)
        {
            int index = _jammersData.data.IndexOf(existingJammer);
            _jammersData.data[index] = updatedJammer;
            Save();
            return true;
        }
        return false;
    }
}

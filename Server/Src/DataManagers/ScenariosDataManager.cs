using System.Text.Json;
using System.Text.Json.Serialization;

public class ScenariosDataManager
{
    private static ScenariosDataManager _instance;
    private ScenariosData _scenariosData = new();
    private string _dataFilePath;

    private ScenariosDataManager()
    {
    }

    public static ScenariosDataManager GetInstance()
    {
        if (_instance == null)
        {
            _instance = new ScenariosDataManager();
        }
        return _instance;
    }

    public void ReadData()
    {
        // Base directory = project root (relative to executable location)
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        // Navigate up from "Server\\Src\\bin\\Debug\\netX.X" to "Server"
        string serverDir = Path.GetFullPath(Path.Combine(baseDir, @"..\..\.."));

        // Build the Data folder path
        string dataDir = Path.Combine(serverDir, "Data");

        // Ensure Data folder exists
        Directory.CreateDirectory(dataDir);

        // Full path for the JSON file
        _dataFilePath = Path.Combine(dataDir, "ScenariosData.json");

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
        var json = JsonSerializer.Serialize(_scenariosData, new JsonSerializerOptions
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
            _scenariosData = JsonSerializer.Deserialize<ScenariosData>(json) ?? new ScenariosData();
        }
    }

    public List<PlanesTrajectoryPointsScenario> GetScenarios()
    {
        return _scenariosData.data;
    }

    public string GetScenariosDataFilePath()
    {
        return _dataFilePath;
    }

    public void AddScenario(PlanesTrajectoryPointsScenario scenario)
    {
        _scenariosData.data.Add(scenario);
        Save();
    }
    public bool RemoveScenario(string scenarioName)
    {
        var scenario = _scenariosData.data.FirstOrDefault(s => s.scenarioName == scenarioName);
        if (scenario != null)
        {
            _scenariosData.data.Remove(scenario);
            Save();
            return true;
        }
        return false;
    }
}

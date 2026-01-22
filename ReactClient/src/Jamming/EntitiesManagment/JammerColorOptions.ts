import * as Cesium from "cesium";
import { Status } from "../../Sensors/Jammer/JammerRelatedEnums";

export interface JammerColorOptions{
    color: Cesium.Color
    outlineColor: Cesium.Color
}

export class JammerColorOptionsManager {
  public static readonly dataMap: Record<
    string,
    () => JammerColorOptions
  > = {
    [Status.Online]: JammerColorOptionsManager.getOnlineOptions,
    [Status.Offline]: JammerColorOptionsManager.getOfflineOptions,
    [Status.Critical]: JammerColorOptionsManager.getCriticalOptions,
  };

  public static getJammerColorOptionsByString(value: string): JammerColorOptions | null {
    if (Object.values(Status).includes(value as Status)) {
      return JammerColorOptionsManager.dataMap[value as Status]();
    }
    return null;
  }

  public static getOnlineOptions(): JammerColorOptions {
    return { color: Cesium.Color.LIME, outlineColor: Cesium.Color.LIME };
  }

  public static getOfflineOptions(): JammerColorOptions {
    return { color: Cesium.Color.GRAY, outlineColor: Cesium.Color.BLACK };
  }
  public static getCriticalOptions(): JammerColorOptions {
    return { color: Cesium.Color.RED, outlineColor: Cesium.Color.RED };
  }
}
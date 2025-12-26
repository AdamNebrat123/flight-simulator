import * as Cesium from "cesium";
import { ZoneTypeEnum } from "../Messages/ZoneTypeEnum";

export interface ZoneOptions{
    color: Cesium.Color
    oppacity: number
}

export class ZoneOptionsManager {
  public static readonly dataMap: Record<
    string,
    () => ZoneOptions
  > = {
    [ZoneTypeEnum.Danger]: ZoneOptionsManager.getDangerZoneOptions,
    [ZoneTypeEnum.Jam]: ZoneOptionsManager.getJamZoneOptions,
  };

  public static getZoneOptionsByString(value: string): ZoneOptions | null {
    if (Object.values(ZoneTypeEnum).includes(value as ZoneTypeEnum)) {
      return ZoneOptionsManager.dataMap[value as ZoneTypeEnum]();
    }
    return null;
  }

  public static getDangerZoneOptions(): ZoneOptions {
    return { color: Cesium.Color.RED, oppacity: 0.3 };
  }

  public static getJamZoneOptions(): ZoneOptions {
    return { color: Cesium.Color.WHITE, oppacity: 0.15 };
  }
}
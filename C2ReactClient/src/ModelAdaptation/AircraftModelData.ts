import { AircraftTypeEnum } from "../Messages/AircraftTypeEnum";
import type { ModelAdaptationData } from "./ModelAdaptationData";

export class AircraftModelData {
  public static readonly dataMap: Record<
    AircraftTypeEnum,
    () => ModelAdaptationData
  > = {
    [AircraftTypeEnum.Drone]: AircraftModelData.getDroneData,
    [AircraftTypeEnum.Plane]: AircraftModelData.getPlaneData,
    [AircraftTypeEnum.Balloon]: AircraftModelData.getBalloonData,
    [AircraftTypeEnum.B2spirit]: AircraftModelData.getB2spiritData,
    [AircraftTypeEnum.F16]: AircraftModelData.getF16Data,
    [AircraftTypeEnum.F35]: AircraftModelData.getF35Data,
    [AircraftTypeEnum.IaiKfir]: AircraftModelData.getIaiKfirData,
    [AircraftTypeEnum.Uav]: AircraftModelData.getUavData,
  };

  public static getModelDataByString(value: string): ModelAdaptationData | null {
    // בודק אם המחרוזת היא אחד מהערכים של האינאם
    if (Object.values(AircraftTypeEnum).includes(value as AircraftTypeEnum)) {
      return AircraftModelData.dataMap[value as AircraftTypeEnum]();
    }
    return null; // אם לא נמצא
  }

  // פונקציות נפרדות לכל סוג
  public static getDroneData(): ModelAdaptationData {
    return { headingOffset: 90, modelSize: 6 };
  }

  public static getPlaneData(): ModelAdaptationData {
    return { headingOffset: -90, modelSize: 2.5 };
  }

  public static getBalloonData(): ModelAdaptationData {
    return { headingOffset: 0, modelSize: 1.5 };
  }

  public static getB2spiritData(): ModelAdaptationData {
    return { headingOffset: 0, modelSize: 0.16 };
  }

  public static getF16Data(): ModelAdaptationData {
    return { headingOffset: 0, modelSize: 0.5 };
  }

  public static getF35Data(): ModelAdaptationData {
    return { headingOffset: 0, modelSize: 3.5 };
  }

  public static getIaiKfirData(): ModelAdaptationData {
    return { headingOffset: -90, modelSize: 4.3 };
  }

  public static getUavData(): ModelAdaptationData {
    return { headingOffset: -90, modelSize: 7 };
  }
}
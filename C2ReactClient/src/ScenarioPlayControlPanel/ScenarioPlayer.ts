// ScenarioPlayer.ts
import type { PlaySelectedScenario, PauseScenarioCmd, ResumeScenarioCmd, ChangeScenarioPlaySpeedCmd } from '../Messages/AllTypes';
import { C2SMessageType } from '../Messages/C2SMessageType';

export class ScenarioPlayer {
  private send: (type: string, data: any) => void;

  // Scenario play state
  public playingScenarioName: string | null = null;
  public playingScenarioId: string | null = null;
  public isPaused: boolean = false;
  public playSpeed: number = 1;

  // Scenario selection state
  public selectedScenario: string | null = null;

  public constructor(send: (type: string, data: any) => void) {
    this.send = send;
  }


  // Methods to manage scenario play
  startScenario(scenarioId: string, scenarioName: string) {
    this.playingScenarioName = scenarioName;
    this.playingScenarioId = scenarioId;
    this.isPaused = false;
    this.playSpeed = 1;
    this.send(C2SMessageType.PlaySelectedScenarioCmd, { scenarioId: this.playingScenarioId } as PlaySelectedScenario);
  }

  pause() {
    if (!this.playingScenarioId) return;
    this.isPaused = true;
    this.send(C2SMessageType.PauseScenarioCmd, { scenarioId : this.playingScenarioId } as PauseScenarioCmd);
  }

  resume() {
    if (!this.playingScenarioId) return;
    this.isPaused = false;
    this.send(C2SMessageType.ResumeScenarioCmd, { scenarioId : this.playingScenarioId } as ResumeScenarioCmd);
  }

  changeSpeed(speed: number) {
    if (!this.playingScenarioId) return;
    this.playSpeed = speed;
    this.send(C2SMessageType.ChangeScenarioPlaySpeedCmd, { scenarioId : this.playingScenarioId, playSpeed: speed } as ChangeScenarioPlaySpeedCmd);
  }

  closeScenario() {
    this.playingScenarioId = null;
    this.playingScenarioName = null;
    this.isPaused = false;
    this.playSpeed = 1;
  }

  selectScenario(scenarioId: string | null) {
    this.selectedScenario = scenarioId;
  }
}

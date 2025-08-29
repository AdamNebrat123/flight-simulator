// ScenarioPlayer.ts
import type { PlaySelectedScenario, PauseScenarioCmd, ResumeScenarioCmd, ChangeScenarioPlaySpeedCmd } from '../Messages/AllTypes';
import { C2SMessageType } from '../Messages/C2SMessageType';

export class ScenarioPlayer {
  private send: (type: string, data: any) => void;

  // Scenario play state
  public playingScenarioName: string | null = null;
  public isPaused: boolean = false;
  public playSpeed: number = 1;

  // Scenario selection state
  public scenarios: string[] = [];
  public selectedScenario: string | null = null;

  public constructor(send: (type: string, data: any) => void) {
    this.send = send;
  }


  // Methods to manage scenario play
  startScenario(scenarioName: string) {
    this.playingScenarioName = scenarioName;
    this.isPaused = false;
    this.playSpeed = 1;
    this.send(C2SMessageType.PlaySelectedScenarioCmd, { scenarioName } as PlaySelectedScenario);
  }

  pause() {
    if (!this.playingScenarioName) return;
    this.isPaused = true;
    this.send(C2SMessageType.PauseScenarioCmd, { scenarioName: this.playingScenarioName } as PauseScenarioCmd);
  }

  resume() {
    if (!this.playingScenarioName) return;
    this.isPaused = false;
    this.send(C2SMessageType.ResumeScenarioCmd, { scenarioName: this.playingScenarioName } as ResumeScenarioCmd);
  }

  changeSpeed(speed: number) {
    if (!this.playingScenarioName) return;
    this.playSpeed = speed;
    this.send(C2SMessageType.ChangeScenarioPlaySpeedCmd, { scenarioName: this.playingScenarioName, playSpeed: speed } as ChangeScenarioPlaySpeedCmd);
  }

  closeScenario() {
    this.playingScenarioName = null;
    this.isPaused = false;
    this.playSpeed = 1;
  }

  // Methods to manage scenario selection
  setScenarios(scenarios: string[]) {
    this.scenarios = scenarios;
    this.selectedScenario = null;
  }

  selectScenario(name: string | null) {
    this.selectedScenario = name;
  }
}

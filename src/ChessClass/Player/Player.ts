import type { Move } from "../Moves/MoveTypes";
import type { ColorType, PlayerType } from "./PlayerTypes";

abstract class Player {
  abstract readonly playerType: PlayerType;
  private color: ColorType;

  constructor(color: ColorType) {
    this.color = color;
  }

  getColor(): ColorType {
    return this.color;
  }

  setColor(color: ColorType) {
    this.color = color;
  }

  abstract suggestMove(): Promise<Move> | null;
}

class HumanPlayer extends Player {
  readonly playerType: PlayerType = 'human';

  constructor(color: ColorType) {
    super(color);
  }

  suggestMove() {
    return null;
  }
}

class ComputerPlayer extends Player {
  readonly playerType: PlayerType = 'ai';

  constructor(color: ColorType) {
    super(color);
  }

  suggestMove() {
    return null;
  }
}

export {Player, HumanPlayer, ComputerPlayer};
import { perft } from "../../src/ChessClass/ChessEngine/perft";
import { GameState } from "../../src/ChessClass/types/ChessTypes";
import { styled } from "../../src/ChessClass/utils/utils";
import { GameController } from "../../src/GameController/GameController";

const RED_COLOR_CODE: number = 31;
const GREEN_COLOR_CODE: number = 32;
const BLUE_COLOR_CODE: number = 34;

const GOOD_TIME_MAX_MS_RESULTS: number[] = [1, 1,1,1,10,50,2000];
const EXCELLENT_TIME_MAX_MS_RESULTS: number[] = [1,1,1,1,1,10,300];
const rateTime: (depth: number, elapsed: number) => 'BAD' | 'GOOD' | 'EXCELLENT' = (depth: number, elapsed: number) => {
  const goodMax: number = GOOD_TIME_MAX_MS_RESULTS[depth];
  const excellentMax: number = EXCELLENT_TIME_MAX_MS_RESULTS[depth];

  if (elapsed <= excellentMax) return 'EXCELLENT';
  if (elapsed <= goodMax) return 'GOOD';
  return 'BAD';
}

const gameState: GameState = GameController.startGame({
  playerDetails: {
    player: 'human',
    opponent: 'human',
  }
})
let startTime: number, endTime: number;

const generatedNodesNumbers: number[] = [];

for (let i = 0; i <= 10; i++) {

  startTime = performance.now();
  const nodesGenerated: number = perft(gameState, i);
  endTime = performance.now();

  const elapsed: number = endTime - startTime;
  generatedNodesNumbers.push(nodesGenerated);

  const rate = rateTime(i, elapsed);

  const colorCode: number = rate === 'BAD' ? RED_COLOR_CODE : rate === 'GOOD' ? BLUE_COLOR_CODE : GREEN_COLOR_CODE; 

  console.log(`Generated nodes on depth ${i}\ttime: ${styled(elapsed.toString(), colorCode)} ms`);
}

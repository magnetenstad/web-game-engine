import { Game, Camera, Vec2, DrawInfo, TextObject } from '../../../lib';
import { Player } from './player';

const gameDiv = document.querySelector('#game');

const options = {
  width: 480,
  height: 320,
  scale: 2,
  fps: 60,
};
const game = new Game(gameDiv).setOptions(options);

const player = new Player(100, 250).activate(game);
game.canvas.camera = new Camera(new Vec2(480, 320)).setTarget(player);

new TextObject(() => `Player: ${JSON.stringify(player.pos)}`, 8, 8).activate(
  game
);

new TextObject(
  () => `Objects: ${game.getGameObjects().length}`,
  8,
  24
).activate(game);
new TextObject(() => `FPS: ${game.currentFps.toFixed(1)}`, 8, 8, {
  gui: true,
}).activate(game);

game.beforeDraw = (info: DrawInfo) => {
  info.canvas.drawRect(
    new Vec2(0, 0),
    new Vec2(options.width, options.height),
    { fillStyle: '', strokeStyle: 'blue', lineWidth: 1 }
  );
};

game.play();

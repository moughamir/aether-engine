import { NetworkManager } from '@aether/core';

const client = new NetworkManager({
  serverUrl: 'ws://localhost:3000'
});

client.on('entityUpdate', (entities) => {
  console.log('Received entity updates:', entities);
});

export function sendPositionUpdate(pos: Vector3) {
  client.emit('positionUpdate', pos);
}

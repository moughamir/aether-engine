import { useAether } from '@aether/react';
import { Vector3 } from '@aether/shared/math';

export function Scene() {
  const { entities } = useAether();

  return (
    <div className="scene">
      {entities.map((e) => (
        <div key={e.id} className="entity"
             style={{ transform: `translate(${e.position.x}px, ${e.position.y}px)` }}>
          🎮
        </div>
      ))}
    </div>
  );
}

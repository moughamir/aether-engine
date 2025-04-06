import { useState, useEffect } from "react";
import { Entity } from "@aether/shared";
import { useAether } from "./useAether";

export const useEntity = (entityId: string) => {
  const { app } = useAether();
  const [entity, setEntity] = useState<Entity | undefined>(
    app?.entityManager.get(entityId)
  );

  useEffect(() => {
    if (!app) return;

    // Get initial entity
    setEntity(app.entityManager.get(entityId));

    // Subscribe to entity updates
    const handleEntityUpdate = (updatedEntity: Entity) => {
      if (updatedEntity.id === entityId) {
        setEntity(updatedEntity);
      }
    };

    const handleEntityRemoved = (removedEntity: Entity) => {
      if (removedEntity.id === entityId) {
        setEntity(undefined);
      }
    };

    app.entityManager.on("entityUpdate", handleEntityUpdate);
    app.entityManager.on("entityRemoved", handleEntityRemoved);

    return () => {
      app.entityManager.off("entityUpdate", handleEntityUpdate);
      app.entityManager.off("entityRemoved", handleEntityRemoved);
    };
  }, [app, entityId]);

  return entity;
};

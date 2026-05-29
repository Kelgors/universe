import { observe, onGet, onSet, type World } from "bitecs";
import { Transform, type TransformComponent } from "../components/transform.js";

export function registerTransformObservers(world: World): void {
  observe(world, onSet(Transform), (eid, params: Partial<TransformComponent>) => {
    if (params.x !== undefined) {
      Transform.x[eid] = params.x;
    }
    if (params.y !== undefined) {
      Transform.y[eid] = params.y;
    }
  });

  observe(world, onGet(Transform), (eid) => ({
    x: Transform.x[eid],
    y: Transform.y[eid],
  }));
}

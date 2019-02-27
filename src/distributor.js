import eventBus$ from "./eventBus";
import { isCorrectVal } from "./utils";

const distributor$ = {
  next: function(events) {
    if (!Array.isArray(events)) {
      events = [events];
    }
    const map = {};
    events.forEach(event => {
      if (typeof event === "string") {
        const type = event;
        event = { type: type };
      }
      if (!isCorrectVal(event.payload)) event.payload = {};
      if (!isCorrectVal(event.options)) event.options = {};
      map[event.type] = event;
    });
    eventBus$.next(map);
  }
};
export default distributor$;

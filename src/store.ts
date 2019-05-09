interface StateMap {
  [key: string]: any
}

class Store {
  stateMap: StateMap = {};
  eventLog = {
    dataMap: {},
    pushHeadersMap: {}
  };
}

export default new Store();
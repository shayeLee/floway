class Store {
  stateMap = {};
  eventLog = {
    dataMap: {},
    pushHeadersMap: {}
  };
}

export default new Store();
class Store {
  obsMap = {};
  stateTree = {};
  eventLog = {
    dataMap: {},
    pushHeadersMap: {}
  };
}

export default new Store();

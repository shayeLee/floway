class Store {
  subscriptions = {};
  stateTree = {};
  stateRegister = {}
  eventLog = {
    dataMap: {},
    pushHeadersMap: {}
  };
}

export default new Store();

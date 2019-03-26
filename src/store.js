class Store {
  subscriptions = {};
  stateTree = {};
  stateRegister = {};
  producerMap = {};
  eventLog = {
    dataMap: {},
    pushHeadersMap: {}
  };
}

export default new Store();

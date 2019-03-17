class Store {
  obsMap = {};
  state = {};
  eventLog = {
    dataMap: {},
    pushHeadersMap: {}
  };

  update(stateName, actionName) {
    const obs$ = this.obsMap[stateName]["obs$"];
    const func = this.obsMap[stateName]["action"][actionName];
    const newState = func(this.state[stateName]);
    obs$.next(newState);
    this.state[stateName] = newState;
  }
}

export default new Store();

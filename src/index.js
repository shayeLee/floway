import config from "./config";

const _setConfig = function(customConfig) {
  Object.keys(customConfig).forEach(key => {
    config[key] = customConfig[key];
  });
};
export const setConfig = _setConfig;

export { default as store } from "./store";

export { default as registerState } from "./registerState";

export { default as ofHot } from "./ofHot";

export { default as distributor$ } from "./distributor";

export { default as ofLast } from "./ofLast";

export { default as attract } from "./attract";

export { default as permeate } from "./permeate";

import { ACCEPTABLE_TIME_RANGE } from "../env.js";

export const isMessageExpired = (timestamp: number) => {
  return Math.abs(Date.now() - timestamp) > ACCEPTABLE_TIME_RANGE;
};

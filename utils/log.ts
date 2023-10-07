/**
 * Log a message to the console.
 * @param action The action to log.
 * @param parameter The parameter to log.
 * @param color The color of the action.
 * @example
 * log("done", `build took ${(performance.now() - t).toFixed(3)}ms`);
 */
export function log(action: string, parameter: string, color = "blue") {
  console.log(`%c${action} %c${parameter}`, `color: ${color}`, "color: black");
}

/**
 * Logs to Console with colors
 * @param action The action to log.
 * @param parameter The parameter to log.
 * @param color The color of the action.
 */
export function log(action: string, parameter: string, color = "blue") {
  console.log(`%c${action} %c${parameter}`, `color: ${color}`, "color: black");
}

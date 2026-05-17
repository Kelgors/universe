import discovery from "./discovery.js";
import health from "./health.js";
import peers from "./peers.js";
import transfers from "./transfers/index.js";

export default [...transfers, health, discovery, peers];

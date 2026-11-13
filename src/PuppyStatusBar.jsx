import { litterPuppyStatus } from "./litterPuppyStatus.js";

// One truthful, text-labeled status treatment across puppy listing surfaces.
export default function PuppyStatusBar({ status }) {
  const { label, tone } = litterPuppyStatus(status);
  return <div className={`litter-puppy-status is-${tone}`}>{label}</div>;
}

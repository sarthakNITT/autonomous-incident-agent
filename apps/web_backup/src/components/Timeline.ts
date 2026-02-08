export function Timeline(status: string) {
  const steps = ["detected", "analyzing", "patching", "validating", "resolved"];
  let html = '<div class="timeline">';

  for (const step of steps) {
    const isActive = step === status;
    const isPast =
      steps.indexOf(step) < steps.indexOf(status) || status === "resolved";
    const className = isActive
      ? "step active"
      : isPast
        ? "step completed"
        : "step";

    html += `<div class="${className}">${step.toUpperCase()}</div>`;
  }

  if (status === "failed") {
    html += '<div class="step error">FAILED</div>';
  }

  html += "</div>";
  return html;
}

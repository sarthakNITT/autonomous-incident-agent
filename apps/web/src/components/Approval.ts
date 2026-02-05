export function Approval(id: string, status: string) {
    if (status === "resolved" || status === "failed") {
        return `<div class="approval-status">Incident is <strong>${status.toUpperCase()}</strong></div>`;
    }

    if (status === "validating") {
        return `
        <div class="approval-actions">
            <button onclick="approveIncident('${id}')" class="btn approve">Approve Fix</button>
            <button onclick="rejectIncident('${id}')" class="btn reject">Reject</button>
        </div>
        <script>
            async function approveIncident(id) {
                if(!confirm("Approve this fix?")) return;
                await fetch('/api/incidents/' + id + '/approve', { method: 'POST' });
                window.location.reload();
            }
             async function rejectIncident(id) {
                if(!confirm("Reject this fix?")) return;
                await fetch('/api/incidents/' + id + '/reject', { method: 'POST' });
                window.location.reload();
            }
        </script>
        `;
    }

    return "<div>Auto-remediation in progress...</div>";
}

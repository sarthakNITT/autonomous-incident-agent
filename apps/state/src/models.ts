import { getDb } from "./db";
import { IncidentStatus, type Incident, type CreateIncidentRequest, type UpdateIncidentRequest } from "@repo/types";

export class IncidentModel {
    static create(req: CreateIncidentRequest): Incident {
        const db = getDb();
        const id = req.id || crypto.randomUUID();
        const now = new Date().toISOString();
        const status = req.status || IncidentStatus.DETECTED;

        db.run(`
            INSERT INTO incidents (id, title, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `, [id, req.title, status, now, now]);

        return this.get(id);
    }

    static update(id: string, req: UpdateIncidentRequest): Incident {
        const db = getDb();
        const fields = [];
        const values = [];

        if (req.status) { fields.push("status = ?"); values.push(req.status); }
        if (req.root_cause) { fields.push("root_cause = ?"); values.push(req.root_cause); }
        if (req.patch_diff_key) { fields.push("patch_diff_key = ?"); values.push(req.patch_diff_key); }
        if (req.pr_url) { fields.push("pr_url = ?"); values.push(req.pr_url); }
        if (req.validation_status !== undefined) { fields.push("validation_status = ?"); values.push(req.validation_status); }
        if (req.snapshot_id) { fields.push("snapshot_id = ?"); values.push(req.snapshot_id); }
        if (req.file_path) { fields.push("file_path = ?"); values.push(req.file_path); }

        fields.push("updated_at = ?");
        values.push(new Date().toISOString());

        values.push(id);

        const sql = `UPDATE incidents SET ${fields.join(", ")} WHERE id = ?`;
        db.run(sql, values);

        return this.get(id);
    }

    static get(id: string): Incident {
        const db = getDb();
        const row = db.query("SELECT * FROM incidents WHERE id = ?").get(id) as any;
        if (!row) throw new Error(`Incident ${id} not found`);
        return row as Incident;
    }

    static list(): Incident[] {
        const db = getDb();
        return db.query("SELECT * FROM incidents ORDER BY created_at DESC").all() as Incident[];
    }
}

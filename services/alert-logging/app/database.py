import aiosqlite
import json
from .config import DB_PATH

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS event_logs (
                id TEXT PRIMARY KEY,
                object_id TEXT,
                event_type TEXT,
                source_id TEXT,
                track_id INTEGER,
                global_id TEXT,
                object_type TEXT,
                object_subtype TEXT,
                timestamp DATETIME,
                position JSON,
                confidence REAL,
                snapshot_path TEXT,
                duration_seconds REAL,
                total_frames_seen INTEGER,
                trajectory_summary JSON,
                best_snapshot_path TEXT,
                best_confidence REAL,
                avg_confidence REAL,
                clip_path TEXT,
                metadata JSON,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await db.execute('''
            CREATE TABLE IF NOT EXISTS object_alerts (
                id TEXT PRIMARY KEY,
                object_id TEXT,
                alert_type TEXT,
                severity TEXT,
                confidence REAL,
                timestamp DATETIME,
                snapshot_path TEXT,
                clip_path TEXT,
                details TEXT,
                acknowledged BOOLEAN DEFAULT 0,
                false_positive BOOLEAN DEFAULT 0
            )
        ''')
        
        await db.execute('''
            CREATE TABLE IF NOT EXISTS known_objects (
                global_id TEXT PRIMARY KEY,
                object_type TEXT,
                label TEXT,
                category TEXT,
                face_embedding BLOB,
                plate_number TEXT,
                notes TEXT,
                total_visits INTEGER DEFAULT 0,
                last_seen_at DATETIME
            )
        ''')
        await db.commit()

async def insert_event_log(log_data: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT INTO event_logs (
                id, object_id, event_type, source_id, track_id, global_id,
                object_type, object_subtype, timestamp, position, confidence,
                snapshot_path, duration_seconds, total_frames_seen,
                trajectory_summary, best_snapshot_path, best_confidence,
                avg_confidence, clip_path, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_data['id'],
            log_data['object_id'],
            log_data['event_type'],
            log_data['source_id'],
            log_data['track_id'],
            log_data.get('global_id'),
            log_data['object_type'],
            log_data.get('object_subtype'),
            log_data['timestamp'],
            json.dumps(log_data['position']) if log_data.get('position') else None,
            log_data.get('confidence'),
            log_data.get('snapshot_path'),
            log_data.get('duration_seconds'),
            log_data.get('total_frames_seen'),
            json.dumps(log_data['trajectory_summary']) if log_data.get('trajectory_summary') else None,
            log_data.get('best_snapshot_path'),
            log_data.get('best_confidence'),
            log_data.get('avg_confidence'),
            log_data.get('clip_path'),
            json.dumps(log_data.get('metadata', {}))
        ))
        await db.commit()

async def update_retroactive_global_id(object_id: str, global_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            UPDATE event_logs 
            SET global_id = ? 
            WHERE object_id = ? AND event_type = 'ENTRY'
        ''', (global_id, object_id))
        await db.commit()

async def insert_object_alert(alert_data: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT INTO object_alerts (
                id, object_id, alert_type, severity, confidence,
                timestamp, snapshot_path, clip_path, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert_data['id'],
            alert_data['object_id'],
            alert_data['alert_type'],
            alert_data['severity'],
            alert_data['confidence'],
            alert_data['timestamp'],
            alert_data['snapshot_path'],
            alert_data.get('clip_path'),
            alert_data['details']
        ))
        await db.commit()

async def query_alerts(filters: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM object_alerts WHERE 1=1"
        params = []
        
        if filters.get("severity") and filters["severity"].lower() != "all":
            query += " AND LOWER(severity) = ?"
            params.append(filters["severity"].lower())
            
        if filters.get("status") and filters["status"].lower() != "all":
            if filters["status"].lower() == "acknowledged":
                query += " AND acknowledged = 1"
            elif filters["status"].lower() == "new":
                query += " AND acknowledged = 0"
                
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([filters.get("limit", 50), filters.get("offset", 0)])
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_alert_by_id(alert_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM object_alerts WHERE id = ?", (alert_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def update_alert(alert_id: str, updates: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        if "status" in updates:
            # map string status to DB field if needed
            ack = 1 if updates["status"].lower() in ["acknowledged", "resolved"] else 0
            await db.execute("UPDATE object_alerts SET acknowledged = ? WHERE id = ?", (ack, alert_id))
        
        if "false_positive" in updates:
            await db.execute("UPDATE object_alerts SET false_positive = ? WHERE id = ?", (int(updates["false_positive"]), alert_id))
            
        if "note" in updates:
            # We don't have a notes array in DB yet, so we append to details for now
            await db.execute("UPDATE object_alerts SET details = details || '\nNote: ' || ? WHERE id = ?", (updates["note"], alert_id))
            
        await db.commit()

async def query_event_logs(filters: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM event_logs WHERE 1=1"
        params = []
        
        if filters.get("since"):
            query += " AND timestamp > ?"
            params.append(filters["since"])
            
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([filters.get("limit", 100), filters.get("offset", 0)])
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_stats():
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM object_alerts") as cursor:
            total_alerts = (await cursor.fetchone())[0]
            
        async with db.execute("SELECT severity, COUNT(*) FROM object_alerts GROUP BY severity") as cursor:
            rows = await cursor.fetchall()
            alerts_by_severity = {row[0]: row[1] for row in rows}
            
        return {
            "total_alerts": total_alerts,
            "alerts_by_severity": alerts_by_severity
        }

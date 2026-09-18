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
                avg_confidence, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            json.dumps(log_data.get('metadata', {}))
        ))
        await db.commit()

async def insert_object_alert(alert_data: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT INTO object_alerts (
                id, object_id, alert_type, severity, confidence,
                timestamp, snapshot_path, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert_data['id'],
            alert_data['object_id'],
            alert_data['alert_type'],
            alert_data['severity'],
            alert_data['confidence'],
            alert_data['timestamp'],
            alert_data['snapshot_path'],
            alert_data['details']
        ))
        await db.commit()

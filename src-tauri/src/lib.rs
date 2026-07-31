use tauri_plugin_sql::{Migration, MigrationKind};

const DB_URL: &str = "sqlite:focusdesk.db";

fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_categories_and_events",
            kind: MigrationKind::Up,
            sql: "
            CREATE TABLE categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                color TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE events (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category_id TEXT NOT NULL REFERENCES categories(id),
                date TEXT NOT NULL,
                start_time TEXT,
                end_time TEXT,
                location TEXT,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE INDEX idx_events_date ON events(date);

            INSERT INTO categories (id, name, color, created_at) VALUES
                ('cat-tareas', 'Tareas', '#6366f1', datetime('now')),
                ('cat-pagos', 'Pagos', '#f59e0b', datetime('now')),
                ('cat-turnos', 'Turnos', '#f97316', datetime('now')),
                ('cat-facultad', 'Facultad', '#8b5cf6', datetime('now')),
                ('cat-trabajo', 'Trabajo', '#10b981', datetime('now')),
                ('cat-actividad-personal', 'Actividad personal', '#ec4899', datetime('now')),
                ('cat-recordatorios', 'Recordatorios', '#64748b', datetime('now'));
        ",
        },
        Migration {
            version: 2,
            description: "create_recurring_events",
            kind: MigrationKind::Up,
            sql: "
                CREATE TABLE recurring_events (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    category_id TEXT NOT NULL REFERENCES categories(id),
                    days_of_week TEXT NOT NULL,
                    start_time TEXT,
                    end_time TEXT,
                    location TEXT,
                    notes TEXT,
                    start_date TEXT NOT NULL,
                    end_date TEXT,
                    skip_holidays INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE recurring_event_skips (
                    id TEXT PRIMARY KEY,
                    recurring_event_id TEXT NOT NULL REFERENCES recurring_events(id) ON DELETE CASCADE,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL
                );

                CREATE INDEX idx_recurring_events_dates ON recurring_events(start_date, end_date);
                CREATE INDEX idx_recurring_skips_event ON recurring_event_skips(recurring_event_id);
            ",
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

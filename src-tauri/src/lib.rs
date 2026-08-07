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
        Migration {
            version: 3,
            description: "create_finance_categories_and_movements",
            kind: MigrationKind::Up,
            sql: "
                CREATE TABLE finance_categories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    UNIQUE(name, type)
                );

                CREATE TABLE movements (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    amount REAL NOT NULL,
                    category_id TEXT NOT NULL REFERENCES finance_categories(id),
                    date TEXT NOT NULL,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE INDEX idx_movements_date ON movements(date);

                INSERT INTO finance_categories (id, name, type, icon, color, created_at) VALUES
                    ('fc-alimentacion', 'Alimentación', 'gasto', 'cart', '#10b981', datetime('now')),
                    ('fc-hogar', 'Hogar', 'gasto', 'home', '#6366f1', datetime('now')),
                    ('fc-ocio', 'Ocio', 'gasto', 'game', '#f97316', datetime('now')),
                    ('fc-transporte', 'Transporte', 'gasto', 'car', '#22c55e', datetime('now')),
                    ('fc-estudios', 'Estudios', 'gasto', 'book', '#8b5cf6', datetime('now')),
                    ('fc-salud', 'Salud', 'gasto', 'heart', '#ef4444', datetime('now')),
                    ('fc-otros-gasto', 'Otros', 'gasto', 'dots', '#64748b', datetime('now')),
                    ('fc-salario', 'Salario', 'ingreso', 'dollar', '#10b981', datetime('now')),
                    ('fc-otros-ingreso', 'Otros ingresos', 'ingreso', 'dots', '#64748b', datetime('now')),
                    ('fc-ahorro', 'Ahorro', 'ahorro', 'piggy', '#f59e0b', datetime('now'));
            ",
        },
        Migration {
            version: 4,
            description: "link_calendario_finanzas",
            kind: MigrationKind::Up,
            sql: "
                ALTER TABLE events ADD COLUMN amount REAL;
                ALTER TABLE events ADD COLUMN movement_type TEXT;
                ALTER TABLE events ADD COLUMN finance_category_id TEXT REFERENCES finance_categories(id);

                ALTER TABLE recurring_events ADD COLUMN amount REAL;
                ALTER TABLE recurring_events ADD COLUMN movement_type TEXT;
                ALTER TABLE recurring_events ADD COLUMN finance_category_id TEXT REFERENCES finance_categories(id);

                CREATE TABLE movement_links (
                    id TEXT PRIMARY KEY,
                    source_type TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    occurrence_date TEXT NOT NULL,
                    movement_id TEXT REFERENCES movements(id) ON DELETE CASCADE,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    UNIQUE(source_type, source_id, occurrence_date)
                );

                CREATE INDEX idx_movement_links_source ON movement_links(source_type, source_id);
            ",
        },
        Migration {
            version: 5,
            description: "create_services",
            kind: MigrationKind::Up,
            sql: "
                CREATE TABLE services (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    amount REAL NOT NULL,
                    first_due_date TEXT NOT NULL,
                    frequency TEXT NOT NULL,
                    custom_interval_days INTEGER,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE service_periods (
                    id TEXT PRIMARY KEY,
                    service_id TEXT NOT NULL REFERENCES services(id),
                    due_date TEXT NOT NULL,
                    amount REAL NOT NULL,
                    paid INTEGER NOT NULL DEFAULT 0,
                    paid_at TEXT,
                    movement_id TEXT REFERENCES movements(id),
                    created_at TEXT NOT NULL,
                    UNIQUE(service_id, due_date)
                );

                CREATE INDEX idx_service_periods_due_date ON service_periods(due_date);
                CREATE INDEX idx_service_periods_service ON service_periods(service_id);

                INSERT INTO finance_categories (id, name, type, icon, color, created_at) VALUES
                    ('fc-servicios', 'Servicios', 'gasto', 'receipt', '#0ea5e9', datetime('now'));
            ",
        },
        Migration {
            version: 6,
            description: "create_savings_movements",
            kind: MigrationKind::Up,
            sql: "
                CREATE TABLE savings_movements (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    usd_amount REAL NOT NULL,
                    ars_amount REAL NOT NULL,
                    notes TEXT,
                    movement_id TEXT NOT NULL REFERENCES movements(id),
                    created_at TEXT NOT NULL
                );

                CREATE INDEX idx_savings_movements_date ON savings_movements(date);

                INSERT INTO finance_categories (id, name, type, icon, color, created_at) VALUES
                    ('fc-compra-dolares', 'Compra de dólares', 'ahorro', 'dollar', '#22c55e', datetime('now')),
                    ('fc-retiro-ahorro', 'Retiro de ahorro', 'ingreso', 'dollar', '#0ea5e9', datetime('now'));
            ",
        },
        Migration {
            version: 7,
            description: "add_currency_to_services",
            kind: MigrationKind::Up,
            sql: "
                ALTER TABLE services ADD COLUMN currency TEXT NOT NULL DEFAULT 'ARS';

                ALTER TABLE service_periods ADD COLUMN currency TEXT NOT NULL DEFAULT 'ARS';
                ALTER TABLE service_periods ADD COLUMN exchange_rate REAL;
                ALTER TABLE service_periods ADD COLUMN paid_amount_ars REAL;

                UPDATE service_periods SET paid_amount_ars = amount WHERE paid = 1;
            ",
        },
        Migration {
            version: 8,
            description: "add_recurring_event_day_schedules",
            kind: MigrationKind::Up,
            sql: "
                ALTER TABLE recurring_events ADD COLUMN schedule_mode TEXT NOT NULL DEFAULT 'unico';

                CREATE TABLE recurring_event_day_schedules (
                    id TEXT PRIMARY KEY,
                    recurring_event_id TEXT NOT NULL REFERENCES recurring_events(id) ON DELETE CASCADE,
                    weekday INTEGER NOT NULL,
                    start_time TEXT,
                    end_time TEXT
                );

                CREATE INDEX idx_recurring_event_day_schedules_event ON recurring_event_day_schedules(recurring_event_id);
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

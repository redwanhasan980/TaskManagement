const mysql = require('mysql');
require('dotenv').config();

// First, create a connection without specifying the database to create it if it doesn't exist
const createDatabase = async () => {
    const tempConnection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
    });

    return new Promise((resolve, reject) => {
        tempConnection.connect((err) => {
            if (err) {
                console.error('❌ Error connecting to MySQL server:', err.message);
                reject(err);
                return;
            }

            console.log('✅ Connected to MySQL server');

            // Create database if it doesn't exist
            const dbName = process.env.DB_NAME || 'task_management';
            tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
                if (err) {
                    console.error('❌ Error creating database:', err.message);
                    tempConnection.end();
                    reject(err);
                    return;
                }

                console.log(`✅ Database '${dbName}' is ready`);
                tempConnection.end();
                resolve();
            });
        });
    });
};

// Initialize database and tables
const initializeDatabase = async () => {
    try {
        // First create the database
        await createDatabase();

        // Now create connection pool with the database
        const pool = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'task_management',
            port: process.env.DB_PORT || 3306,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        });

        // Test the connection with database
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error('❌ Error connecting to database:', err.message);
                    reject(err);
                    return;
                }
                
                console.log('✅ Connected to MySQL database successfully');
                
                // Check if tables exist, if not create them
                connection.query("SHOW TABLES LIKE 'users'", (err, results) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    if (results.length === 0) {
                        console.log('📋 Tables not found, creating schema...');
                        createTables(connection)
                            .then(() => {
                                connection.release();
                                resolve(pool);
                            })
                            .catch((error) => {
                                connection.release();
                                reject(error);
                            });
                    } else {
                        console.log('✅ Database tables already exist');
                        // Check and update table schema if needed
                        updateTableSchema(connection)
                            .then(() => {
                                connection.release();
                                resolve(pool);
                            })
                            .catch((error) => {
                                connection.release();
                                reject(error);
                            });
                    }
                });
            });
        });

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

// Update existing table schema to add missing columns
const updateTableSchema = async (connection) => {
    return new Promise((resolve, reject) => {
        // Check if reset_token column exists
        connection.query("SHOW COLUMNS FROM users LIKE 'reset_token'", (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length === 0) {
                console.log('🔧 Adding reset token columns to users table...');
                
                // Add reset_token column
                connection.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL", (err) => {
                    if (err) {
                        console.error('❌ Error adding reset_token column:', err.message);
                        reject(err);
                        return;
                    }

                    // Add reset_token_expires column
                    connection.query("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL", (err) => {
                        if (err) {
                            console.error('❌ Error adding reset_token_expires column:', err.message);
                            reject(err);
                            return;
                        }

                        console.log('✅ Reset token columns added successfully');
                        // Check for email verification columns
                        checkEmailVerificationColumns(connection, resolve, reject);
                    });
                });
            } else {
                console.log('✅ Reset token columns already exist');
                // Check for email verification columns
                checkEmailVerificationColumns(connection, resolve, reject);
            }
        });
    });
};

// Check and add email verification columns
const checkEmailVerificationColumns = (connection, resolve, reject) => {
    connection.query("SHOW COLUMNS FROM users LIKE 'email_verified'", (err, results) => {
        if (err) {
            reject(err);
            return;
        }

        if (results.length === 0) {
            console.log('🔧 Adding email verification columns to users table...');
            
            // Add email_verified column
            connection.query("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE", (err) => {
                if (err) {
                    console.error('❌ Error adding email_verified column:', err.message);
                    reject(err);
                    return;
                }

                // Add verification_token column
                connection.query("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL", (err) => {
                    if (err) {
                        console.error('❌ Error adding verification_token column:', err.message);
                        reject(err);
                        return;
                    }

                    // Add verification_token_expires column
                    connection.query("ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP NULL", (err) => {
                        if (err) {
                            console.error('❌ Error adding verification_token_expires column:', err.message);
                            reject(err);
                            return;
                        }

                        console.log('✅ Email verification columns added successfully');
                        resolve();
                    });
                });
            });
        } else {
            console.log('✅ Email verification columns already exist');
            resolve();
        }
    });
};

// Create tables if they don't exist
const createTables = async (connection) => {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            reset_token VARCHAR(255) NULL,
            reset_token_expires TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    const createTasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
            priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    const createIndexes = [
        'CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
    ];

    const insertDefaultAdmin = `
        INSERT IGNORE INTO users (username, email, password, role) VALUES 
        ('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
    `;

    return new Promise((resolve, reject) => {
        // Create users table
        connection.query(createUsersTable, (err) => {
            if (err) {
                console.error('❌ Error creating users table:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Users table created');

            // Create tasks table
            connection.query(createTasksTable, (err) => {
                if (err) {
                    console.error('❌ Error creating tasks table:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tasks table created');

                // Create indexes
                let indexPromises = createIndexes.map(indexQuery => {
                    return new Promise((resolve, reject) => {
                        connection.query(indexQuery, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                Promise.all(indexPromises)
                    .then(() => {
                        console.log('✅ Database indexes created');
                        
                        // Insert default admin user
                        connection.query(insertDefaultAdmin, (err) => {
                            if (err) {
                                console.error('❌ Error creating default admin:', err.message);
                                reject(err);
                                return;
                            }
                            console.log('✅ Default admin user created');
                            console.log('📧 Admin Email: admin@example.com');
                            console.log('🔑 Admin Password: admin123');
                            resolve();
                        });
                    })
                    .catch(reject);
            });
        });
    });
};

// Initialize the database and get the pool
let pool;
const dbPromise = initializeDatabase()
    .then((dbPool) => {
        pool = dbPool;
        return pool;
    })
    .catch((error) => {
        console.error('❌ Failed to initialize database:', error.message);
        process.exit(1);
    });

// Promisify query method for async/await usage
const query = async (sql, params) => {
    await dbPromise; // Wait for database to be initialized
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    query,
    dbPromise
};
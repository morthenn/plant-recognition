// Switch to admin database
db = db.getSiblingDB('admin');

// Create root admin user if it doesn't exist
if (!db.getUser("admin")) {
    db.createUser({
        user: "admin",
        pwd: "password",
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" },
            { role: "dbAdminAnyDatabase", db: "admin" },
            { role: "clusterAdmin", db: "admin" }
        ]
    });
}

// Authenticate as admin
db.auth("admin", "password");

// Switch to imagedb database
db = db.getSiblingDB('imagedb');

// Create a specific user for imagedb if it doesn't exist
if (!db.getUser("admin")) {
    db.createUser({
        user: "admin",
        pwd: "password",
        roles: [
            { role: "dbOwner", db: "imagedb" },
            { role: "readWrite", db: "imagedb" }
        ]
    });
}

// Create collections
db.createCollection('images');

// Create indexes
db.images.createIndex({ "userId": 1 });
db.images.createIndex({ "uploadedAt": 1 });
 
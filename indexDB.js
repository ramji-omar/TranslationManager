class DataBase {
    db = null;

    constructor(dbname) {
        if (!window.indexedDB) {
            this.error("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
        }
        if (!dbname) {
            this.error("Database name is required");
        }
        let scope = this;
        var request = indexedDB.open(dbname);
        request.onerror = function (event) {
            scope.error("Why didn't you allow my web app to use IndexedDB?!");
        };
        request.onsuccess = function (event) {
            console.log('Db created successfully');
            scope.db = event.target.result;

            scope.db.onerror = function (event) {
                scope.error("Database error: " + event.target.errorCode);
            };
        }
    }

    respond(data) {
        return new Promise((resolve)=>{
            resolve(data);
        })
    }

    error(err) {
        return new Promise((resolve, reject)=>{
            reject(err);
        })
    }

    createCollection(collectionName, model) {
        if (!collectionName) {
            throw new Error("Collection name is required");
        }
        let request = this.db.createObjectStore(collectionName);
        request.onerror = function (event) {
            throw new Error("Unable to create collection");
        };
        request.onsuccess = function (event) {
            console.log('Collection created successfully')
        }
    }
}
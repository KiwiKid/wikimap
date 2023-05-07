import { Place } from "@prisma/client";
import { PlaceResult } from "~/components/PlaceMarker";

  
  export class IndexedDBClient {
    private readonly dbName: string;
    private readonly objectStoreName: string;
  
    constructor(dbName: string, objectStoreName: string) {
      this.dbName = dbName;
      this.objectStoreName = objectStoreName;
    }
  
    async saveObject(obj: Place): Promise<IDBRequest<IDBValidKey>> {
      const db = await this.openDatabase();
      const tx = db.transaction(this.objectStoreName, 'readwrite');
      const store = tx.objectStore(this.objectStoreName);
      const res = store.put(obj)
      return res;
    }
  
    async getPlaces(): Promise<Place[]> {
        return new Promise<Place[]>((resolve, reject) => {
        this.openDatabase().then((db) => {
          if(db){
            const tx = db.transaction(this.objectStoreName, 'readonly')
            const store = tx.objectStore(this.objectStoreName);
            const result = store.getAll()
            result.onsuccess = () => {
                resolve(result.result as Place[])
            }
            result.onerror = () => {
                console.error('Could not get object')
                reject('Could not get object')
            }
          }
        }).catch((e) => {
            console.error(e)
        });
        })
    }
  
    private async openDatabase(): Promise<IDBDatabase> {
      return new Promise<IDBDatabase>((resolve, reject) => {

        const request = window.indexedDB.open(this.dbName);
        request.onerror = () => {
          reject(new Error(`Failed to open database ${this.dbName}`));
        };
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onupgradeneeded = () => {
          const db = request.result;
          const store = db.createObjectStore(this.objectStoreName, { keyPath: 'id' });
          // ... define any indexes or other options for the object store here
        };
      });
    }
  }
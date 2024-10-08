import lodash from 'lodash'
import { Db, MongoClient } from 'mongodb'
import { config } from './config'
import { crawl } from './crawl'
import { notify } from './notify'
import { Store } from './types'

const client = new MongoClient(config.db.uri)

//--------------------------------------------------------------
// Program entry
//--------------------------------------------------------------

const main = async () => {
  // Establish connection
  await client.connect()
  const db = client.db(config.db.name)

  // Retrieve enabled stores
  const stores = await retrieveStores(db)

  // Process stores
  for (const store of stores) {
    await processStore(db, store).catch(() => {
      process.exitCode = 1
      console.error(`${store._id}: error processing store`)
    })
  }
}

// Run processing logic for a specific store
const processStore = async (db: Db, store: Store): Promise<void> => {
  // Retrieve current state
  const state = await crawl(store.tracker, store.cookie)

  // If state was updated, notify and persist store with new state
  if (!lodash.isEqual(state, store.state)) {
    console.log(`${store._id}: detected an update to state`)

    store.state = state
    await notify(store)

    await persistStore(db, store)
  } else {
    console.log(`${store._id}: state was not updated`)
  }
}

// Retrieve enabled stores in their current states
const retrieveStores = async (db: Db): Promise<Store[]> => {
  const stores = await db.collection('stores').find({ enabled: true }).toArray()
  return stores as Store[]
}

// Persist store
const persistStore = async (db: Db, store: Store) => {
  await db.collection('stores').updateOne({ _id: store._id }, { $set: store })
}

//--------------------------------------------------------------
// Configure program timeout
//--------------------------------------------------------------

setTimeout(() => {
  console.error(`program timed out`)
  process.exit(1)
}, 90e3)

//--------------------------------------------------------------
// Run program
//--------------------------------------------------------------

main().finally(() => {
  // Close database connection
  client.close()

  // Bypass timeout and potentially pending subprocesses
  process.exit()
})

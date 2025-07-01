const upsert = require('knex-upsert')

export class DB {
    private readonly _db;
  constructor (db) {
    this._db = db
  }

  createOrUseTransaction (trx) {
    return async fn => (trx ? fn(trx) : this._db.transaction(fn))
  }

  dbConnection (trx = null) {
    return trx == null ? this._db : trx
  }

  async transaction (fn) {
    return this._db.transaction(fn)
  }

  upsert (table, key, data, trx) {
    return upsert({
      db: this.dbConnection(trx),
      table,
      object: data,
      key
    })
  }
}


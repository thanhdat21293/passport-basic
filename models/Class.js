const {db, } = require('../pgp');
const shortid = require('shortid');

class Class {

  constructor(name, id = undefined) {  //Use ES6 optional parameter
    if (id != undefined) {
      this.id = id;
    } else {
      this.id = shortid.generate();
    }

    this.name = name;
  }


  save() {
    return db.one("INSERT INTO cms.class (id, name) VALUES ($1, $2) \
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name \
      RETURNING id", [this.id, this.name]);
  }

  static all() {
    return db.many("SELECT * FROM cms.class");
  }

  static findById(id) {
    return db.one("SELECT * FROM cms.class WHERE id = $1", [id])
      .then(data => {
        return new Class(data.name, data.id);
      })
      .catch(error => {
        return error;
      })
  }
}

module.exports = Class;
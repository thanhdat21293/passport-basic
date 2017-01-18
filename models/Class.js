const {db,} = require('../pgp');
const shortid = require('shortid');
const Promise = require('bluebird');

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

  getStudents() {
    return db.many("SELECT s.name FROM student AS s \
      JOIN student_class AS sc ON s.id = sc.student_id \
      WHERE sc.class_id = $1", [this.id]);
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

  /**
   * Search class by name exact or like
   * @param {string} name
   * @param {string} operator can be either = or LIKE
   * @returns {Promise.<T>}
   */
  static findByName(name, operator) {

    let query;

    switch (operator) {
      case "=":
        query = "SELECT * FROM cms.class WHERE name = $1";
        break;
      case "LIKE":
        query = "SELECT * FROM cms.class WHERE name LIKE '%$1#%'";
        break;
    }

    return db.one(query, [name])
      .then(data => {
        return new Class(data.name, data.id);
      })
      .catch(error => {
        return error;
      })
  }
}

module.exports = Class;
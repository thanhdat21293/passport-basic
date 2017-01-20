const {db, config} = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const path = require("path");
const pgStructure = require('pg-structure');
const _ = require('lodash');

function sql(file) {
  return new pgp.QueryFile(path.join(__dirname, '../migrations', file), {minify: true});
}

const sql_file = "003.do.PostPageComment.sql";

describe("Create tables Post, Page, Comment", function () {
  it(`It should load ${sql_file} to database`, function () {

    return db.result(sql(sql_file))
      .then(function () {
        return "success";
      })
      .catch((error) => {
        return error;
      })
      .should.eventually.equal("success");
  });

  it("Schema should have tables: post, page and comment", function () {

    const check_table_promise = pgStructure({
      database: config.database,
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port
    }, config.schema)
      .then(database => {
      const tables = database.schemas.get(config.schema).tables;  // Map of Table objects.
      const table_names = Array.from(tables.keys());
      return _.difference(['post', 'page', 'comment'], table_names).length;
    });

    return check_table_promise.should.eventually.equal(0);

  });


});
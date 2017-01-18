const {db, config} = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const path = require("path");
const pgStructure = require('pg-structure');
const _ = require('lodash');
const shortid = require('shortid');


function sql(file) {
  return new pgp.QueryFile(path.join(__dirname, '../migrations', file), {minify: true});
}

describe("Create table trainer inherits person", function () {
  it("It should load 002.do.TableInheritance.sql to database", function () {
    const script = sql('002.do.TableInheritance.sql');
    let result = db.result(script)
      .then(function () {
        return "success";
      })
      .catch((error) => {
        console.log(error);
        return "failed";
      });

    return result.should.eventually.equal("success");
  });

  it("Schema should have following tables: person, trainer", function () {

    const check_table_promise = pgStructure({
      database: config.database,
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port
    }, config.schema).then(database => {
      const tables = database.schemas.get(config.schema).tables;  // Map of Table objects.
      const table_names = Array.from(tables.keys());
      return _.difference(['person', 'trainer'], table_names).length;
    });

    return check_table_promise.should.eventually.equal(0);

  });

  it("Insert data into inherited table", function() {
    const count = db.tx(t => {
      //Đảm bảo bản ghi bảng master phải được insert ổn định trước khi insert dữ liệu vào bảng reference đến
      let queries = [
        t.none("DELETE FROM cms.trainer"),
        t.none("DELETE FROM cms.person"),
        t.none("INSERT INTO cms.person (id, name) VALUES ($1, $2)", [shortid.generate(), "John Lenon"]),
        t.none("INSERT INTO cms.person (id, name) VALUES ($1, $2)", [shortid.generate(), "Kim Basinger"]),
        t.none("INSERT INTO cms.person (id, name) VALUES ($1, $2)", [shortid.generate(), "Elon Musk"]),

        t.none("INSERT INTO cms.trainer (id, name, type, active) VALUES ($1, $2, $3, $4)",
          [shortid.generate(), "Trịnh Minh Cường", "full time", true]),

        t.none("INSERT INTO cms.trainer (id, name, type, active) VALUES ($1, $2, $3, $4)",
          [shortid.generate(), "Nguyễn Kim Nghĩa", "associate", false]),

        t.none("INSERT INTO cms.trainer (id, name, type, active) VALUES ($1, $2, $3, $4)",
          [shortid.generate(), "Mourinho", "part time", true])
      ];


      return t.batch(queries);
    }).then(function() {

      //Đếm số bản ghi 2 bảng person và trainer, trả về mảng
      return db.tx(t => {
        return t.batch([
          t.one("SELECT COUNT(*) FROM cms.person"),  //phải trả về 6
          t.one("SELECT COUNT(*) FROM cms.trainer")  //phải trả về 3
        ])
      }).then(data => {
          //biến mảng trả về thành mảng integer
          let counts = data.map (item => {
            return parseInt(item.count);
          });

          return _.isEqual(counts, [6, 3]);
      })
    });

    return count.should.eventually.equal(true);
  });

});
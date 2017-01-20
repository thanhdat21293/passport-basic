const {db, config} = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const number = 2;

describe("Demo nested transaction", function () {
  it(`It should insert ${number} records into cms.users`, function () {
    const result = db.tx(function (t) {
      // `t` and `this` here are the same;
      let queries = [
        t.none('DROP TABLE IF EXISTS cms.users;'),
        t.none('CREATE TABLE cms.users(id SERIAL NOT NULL, name TEXT NOT NULL)')
      ];
      for (let i = 1; i <= number; i++) {
        queries.push(t.none('INSERT INTO cms.users(name) VALUES($1)', 'name-' + i));
      }
      queries.push(
        t.tx(function (t1) {
          // t1 = this != t;
          /*return t1.tx(function (t2) {
            // t2 = this != t1 != t;
            return t2.one('SELECT count(*) FROM cms.users');
          });*/

          //shorter
          //return t1.one('SELECT count(*) FROM cms.users');
          for (let i = 1; i <= number; i++) {
            t1.none('INSERT INTO cms.users(name) VALUES($1)', 'Cool-' + i);
          }

          return t1.one('SELECT count(*) FROM cms.users');

        }));
      return t.batch(queries);
    }).then(function (data) {
        //Get the last item, result of SELECT count(*) FROM cms.users
      console.log(data);
        return parseInt(data[data.length - 1].count);
      })
      .catch(function (error) {
        return error;
      });

    return result.should.eventually.equal(number * 2);
  });
});

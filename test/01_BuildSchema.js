const {db, config} = require('../pgp');

const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe("Create schema in database", function () {
  it(`It should create schema ${config.schema} successfully`, function () {
    const result = db.one("SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1", [config.schema])
      .then(data => {
        return data.schema_name;
      })
      .catch(error => {
        db.none(`CREATE SCHEMA ${config.schema}`)
          .then(() => {
            return config.schema;
          })
          .catch(error => {
            console.log('Failed to create schema', error);
            return "failed";
          });
      });

    return result.should.eventually.equal(config.schema);
  });

});
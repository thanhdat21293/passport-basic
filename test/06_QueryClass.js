const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const shortid = require('shortid');
const Class = require('../models/Class');
let insertedID;

let foundClass;  //Store Japanese class found in one unit test

describe("SQL Object", function () {
  it("Create object Class", function () {
    let japaneseClass = new Class("Japanese");
    const result = japaneseClass.save()
      .then(data => {
        insertedID = data.id;
        return shortid.isValid(data.id);
      }).catch(error => {
        return error.detail;
      });

    return result.should.eventually.equal(true);
  });

  it("Query all", function () {
    let result = Class.all()
      .then(rows => {
        rows.forEach(item => {
          if (!shortid.isValid(item.id)) {
            return false;
          }
        });
        return true;
      })
      .catch(error => {
        return error.detail;
      });

    return result.should.eventually.equal(true);
  });

  it("Class.findByID", function () {
    const result = Class.findById(insertedID)
      .then(data => {
        foundClass = data;
        return data.id;
      })
      .catch(error => {
        return error.detail;
      });

    return result.should.eventually.equal(insertedID);
  });

  it("Class update using Postgresql UPSERT", function () {
    foundClass.name = "Bahasa Indonesia";  //Change property
    const result = foundClass.save()
      .then(data => {
        return Class.findById(data.id).then(updatedItem => {
          return updatedItem.name;
        }).catch(error => {
          return error;
        });

      })
      .catch(error => {
        return error;
      });

    return result.should.eventually.equal("Bahasa Indonesia");
  });

});



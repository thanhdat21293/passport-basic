const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const {db, config} = require('../pgp');


describe("Query Class --> Student using task", function () {
  it("Given a class, returns list of enrolled students", function () {

    db.task("Get students in English class", function *(t) {  //Sử dụng ES6 generator function
      let search_class = yield t.one("SELECT * FROM cms.class WHERE name LIKE '%$1#%'", "nglis");

      return yield t.manyOrNone("SELECT s.name FROM student AS s \
      JOIN student_class AS sc ON s.id = sc.student_id \
      WHERE sc.class_id = $1", search_class.id);

    }).then(students => {
        return students.length;
      })
      .catch(error => {
        return error
      })
      .should.eventually.equal(2);
  });
});
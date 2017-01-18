const {db, } = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const shortid = require('shortid');
const _ = require('lodash');

let id_math, id_english, id_physics, id_chemistry;
let id_cuong, id_dung, id_thu, id_huy;


describe("Insert data into M:N relationship Class Student", function () {
  //Đây là hàm before hook, chạy trước khi các unit test khác chạy
  before(function () {
    id_math = shortid.generate();
    id_english = shortid.generate();
    id_physics = shortid.generate();
    id_chemistry = shortid.generate();

    id_cuong = shortid.generate();
    id_dung = shortid.generate();
    id_thu = shortid.generate();
    id_huy = shortid.generate();
  });

  it("It should have 8 records in table student_class after many:many insert transaction", function () {
    const count = db.tx(t => {
      //Đảm bảo bản ghi bảng master phải được insert ổn định trước khi insert dữ liệu vào bảng reference đến
      let queries = [
        t.none("DELETE FROM cms.student_class"),
        t.none("DELETE FROM cms.class"),
        t.none("DELETE FROM cms.student"),

        t.none("INSERT INTO cms.class (id, name) VALUES ($1, $2)", [id_math, "Math"]),
        t.none("INSERT INTO cms.class (id, name) VALUES ($1, $2)", [id_english, "English"]),
        t.none("INSERT INTO cms.class (id, name) VALUES ($1, $2)", [id_physics, "Physics"]),
        t.none("INSERT INTO cms.class (id, name) VALUES ($1, $2)", [id_chemistry, "Chemistry"]),

        t.none("INSERT INTO cms.student (id, name) VALUES ($1, $2)", [id_cuong, "Trịnh Minh Cường"]),
        t.none("INSERT INTO cms.student (id, name) VALUES ($1, $2)", [id_dung, "Đoàn Xuân Dũng"]),
        t.none("INSERT INTO cms.student (id, name) VALUES ($1, $2)", [id_thu, "Lê Minh Thu"]),
        t.none("INSERT INTO cms.student (id, name) VALUES ($1, $2)", [id_huy, "Đặng Quang Huy"]),


      ];

      //Phải cho vào nested transaction bởi các lệnh Insert chạy không theo thứ tự
      queries.push(
        t.tx(function (t1) {
          return [t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_cuong, id_math]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_dung, id_math]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_thu, id_math]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_dung, id_english]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_huy, id_english]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_dung, id_chemistry]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_thu, id_chemistry]),
            t1.none("INSERT INTO cms.student_class (student_id, class_id) VALUES ($1, $2)", [id_cuong, id_physics])]
        })
      );
      return t.batch(queries);
    }).then(function () {
      //đếm số bản ghi ở bảng trung gian
      return db.one("SELECT COUNT(*) FROM cms.student_class")  // phải luôn return promise để nhận kết quả trả về
        .then(function (data) {
          return parseInt(data.count);  //Convert sang integer
        }).catch(function (error) {
        return error;
      });
    });

    return count.should.eventually.equal(8);
  });

  it("Join query of many:many relationship should be successful", function() {
    const result = db.many("SELECT s.name AS student, c.name as class FROM student AS s JOIN student_class as sc ON s.id = sc.student_id JOIN class as c ON c.id = sc.class_id;")
      .then(data => {
        //console.log(data);
        return data[0].student === 'Trịnh Minh Cường' && data[0].class === 'Math';
      })
      .catch(error => {
        return error;
      });

    return result.should.eventually.equal(true);
  })

});
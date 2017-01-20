const {db, config} = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const shortid = require('shortid');
const _ = require('lodash');

let page_ids = [];
let person_ids = [];
const number = 2;


describe("Insert pages and comments", function () {
  it(`It should insert ${number} pages`, function () {
    /*
     1. Get all id of persons
     2. Insert number page records
     */

    return db.task("Insert Pages", function (t) {
      /* Chú ý: table trainer kết thừa từ person, phải dùng từ khóa ONLY khi SELECT bởi post, page
       chỉ reference đến id bảng person thôi,
       chứ không đến id bảng trainer
       */
      return t.many("SELECT id FROM ONLY cms.person")
        .then(found_person_ids => {
          person_ids = found_person_ids.map(item => item.id);

          let queries = [];
          for (let i = 1; i <= number; i++) {

            let page_id = shortid.generate();
            page_ids.push(page_id);
            queries.push(t.none('INSERT INTO cms.page (id, title, content, author, cdate) VALUES($1, $2, $3, $4, $5)',
              [page_id, `Title ${i}`, `Content ${i}`, _.sample(person_ids), new Date()]));

          }
          return t.batch(queries);
        })
        .then(result => {
          return result.length;   //Return number of inserted pages
        });


    }).should.eventually.equal(number);
  });


  it("Create hierarchy comments using nested transaction, generator and yield", function () {

    return db.tx(function (t) {
      let queries = [];

      for (let i = 1; i <= page_ids.length; i++) {

        let page_id = page_ids[i - 1];
        for (let j = 1; j <= Math.floor(Math.random() * 2) + 1; j++) {
          let root_commend_id = shortid.generate();

          //Create root comment, reply_commend_id = NULL
          queries.push(t.none('INSERT INTO cms.comment (id, content, author, target_id, reply_comment_id, cdate) \
          VALUES ($1, $2, $3, $4, $5, $6)',
            [root_commend_id, `page ${i} - comment ${j}`, _.sample(person_ids), page_id, null, new Date()]
          ));

          let outer_commend_id = root_commend_id;

          for (let k = 1; k <= Math.floor(Math.random() * 3) + 1; k++) {
            let comment_id = shortid.generate();

            queries.push(
              t.none('INSERT INTO cms.comment (id, content, author, target_id, reply_comment_id, cdate) \
                    VALUES ($1, $2, $3, $4, $5, $6)',
                [comment_id, `page ${i} - comment ${j} - reply ${k}`, _.sample(person_ids), page_id, outer_commend_id, new Date()])
            );

            outer_commend_id = comment_id;
          }
        } //2nd loop 1st level comment
      }  //1st loop page

      return t.batch(queries);
    }).then(data => {
      return data.length > 0;
      //Trả vể số lượng comment cấp độ 1 được insert thành công, không tính được comment reply cấp 2 trỏ lên
    }).should.eventually.equal(true);
  });
});


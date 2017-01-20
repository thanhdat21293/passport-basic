/**
 * Created by techmaster on 1/20/17.
 */
const {db, config} = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const shortid = require('shortid');
const _ = require('lodash');


let post_ids = [];
let person_ids = [];
const number = 2;


describe("Insert posts and comments", function () {
  it(`It should insert ${number} posts`, function () {
    /*
     1. Get all id of persons
     2. Insert number of post records
     */

    return db.task("Insert Posts - Pages", function (t) {
      /* Chú ý: table trainer kết thừa từ person, phải dùng từ khóa ONLY khi SELECT bởi post, page
       chỉ reference đến id bảng person thôi,
       chứ không đến id bảng trainer
       */
      return t.many("SELECT id FROM ONLY cms.person")
        .then(found_person_ids => {
          person_ids = found_person_ids.map(item => item.id);

          let queries = [];
          for (let i = 1; i <= number; i++) {
            let post_id = shortid.generate();
            post_ids.push(post_id);
            queries.push(t.none('INSERT INTO cms.post (id, title, content, author, cdate) VALUES($1, $2, $3, $4, $5)',
              [post_id, `Title ${i}`, `Content ${i}`, _.sample(person_ids), new Date()]));
          }
          return t.batch(queries);
        })
        .then(result => {
          return result.length;   //Return number of inserted posts
        });


    }).should.eventually.equal(number);  //Số lượng bản ghi post page tạo ra gấp 2 lần number
  });


  it("Create hierarchy comments using Task", function () {

    return db.task("Create hierarchy comments", function (t) {
      let queries = [];

      //Duyệt qua tất cả các post để tạo comment ngẫu nhiên
      for (let i = 1; i <= post_ids.length; i++) {

        for (let j = 1; j <= Math.floor(Math.random() * 3) + 1; j++) {
          // Sinh ngẫu nhiên các comment reply lại comment gốc

          let outer_commend_id = null;
          for (let k = 0; k <= Math.floor(Math.random() * 40); k++) {
            let comment_id = shortid.generate();

            queries.push(t.none('INSERT INTO cms.comment (id, content, author, target_id, reply_comment_id, cdate) \
            VALUES ($1, $2, $3, $4, $5, $6)',
            [comment_id, `post ${i} - comment ${j} - reply ${k}`, _.sample(person_ids), post_ids[i-1], outer_commend_id, new Date()]
            ));

            outer_commend_id  = comment_id;

          }
        }
      }
      return t.batch(queries);
    }).then(result => {
      return result.length > 0;
    }).catch(error => {
      return error;
    }).should.eventually.equal(true);
  });
});


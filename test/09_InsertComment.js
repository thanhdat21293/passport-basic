const {db, config} = require('../pgp');
const pgp = require('pg-promise');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const shortid = require('shortid');
const _ = require('lodash');


let post_ids = [];
let page_ids = [];
let person_ids = [];
const number = 2;


describe("Insert posts, pages and comments", function () {
  it(`It should insert ${number} posts and ${number} pages`, function () {
    /*
     1. Get all id of persons
     2. Insert number of post and page records
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

            let page_id = shortid.generate();
            page_ids.push(page_id);
            queries.push(t.none('INSERT INTO cms.page (id, title, content, author, cdate) VALUES($1, $2, $3, $4, $5)',
              [post_id, `Title ${i}`, `Content ${i}`, _.sample(person_ids), new Date()]));

          }
          return t.batch(queries);
        })
        .then(result => {
          return result.length;   //Trả vể số lượng bản ghi đã được insert
        });


    }).should.eventually.equal(number * 2);  //Số lượng bản ghi post page tạo ra gấp 2 lần number
  });


  it("Create deep level comment", function () {

    return db.tx(function (t) {
      let queries = [];
      let post_page_ids = post_ids.concat(page_ids);  //Nhập 2 mảng id của post và page


      //Duyệt qua tất cả các post và page để tạo comment ngẫu nhiên. Cách này không tốt với Asychronous
      for (let i = 1; i <= post_page_ids.length; i++) {

        let article_id = post_page_ids[i - 1];
        let title;
        if (_.includes(post_ids, article_id)) {
          title = "post";
        } else {
          title = "page";
        }

        for (let j = 1; j <= Math.floor(Math.random() * 2) + 1; j++) {
          let root_commend_id = shortid.generate();

          //tạo ra comment gốc, reply_commend_id = NULL
          queries.push(t.none('INSERT INTO cms.comment (id, content, author, target_id, reply_comment_id, cdate) \
          VALUES ($1, $2, $3, $4, $5, $6)',
            [root_commend_id, `${title} ${i} - comment ${j}`, _.sample(person_ids), article_id, null, new Date()]
          ));


          t.tx(function (t1) {
            /*Sinh ngẫu nhiên các comment reply lại comment gốc
            Chú ý đây là nested transaction
             */
            for (let k = 1; k <= Math.floor(Math.random() * 3) + 1; k++) {
              queries.push(t1.none('INSERT INTO cms.comment (id, content, author, target_id, reply_comment_id, cdate) \
              VALUES ($1, $2, $3, $4, $5, $6)',
                [shortid.generate(), `${title} ${i} - comment ${j} - reply ${k}`, _.sample(person_ids), article_id, root_commend_id, new Date()]
              ));
            }

          });
        }
      }

      return t.batch(queries);
      /* Chỉ trả về số lượng query chạy thành công ở vòng ngoài của transaction,
      bỏ quả reply comment ở nested transaction
       */
    }).then(result => {
      return result.length > 0;
      //Trả vể số lượng comment cấp độ 1 được insert thành công, không tính được comment reply cấp 2 trỏ lên
    }).should.eventually.equal(true);
  });
});


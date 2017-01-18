Ứng dụng này dùng để hướng dẫn học viên lớp Node.js.
Thay vì sử dụng ORM thì chuyển sang dùng pg-promise là một lớp mỏng hỗ trợ promise bao lấy pg.

Cách chạy thử:
1. ```git clone https://github.com/TechMaster/pg_promise.git```
2. ```cd pg_promise```
3. ```npm install```
4. Bật Postgresql lên, tạo một cơ sở dữ liệu , sau đó tạo tiếp schema có tên là cms
5. Sửa đổi cấu hình kết nối đến cơ sở dữ liệu ở config/config.json
6. ```npm test```

Các hàm demo để được viết dưới dạng Unit Test sử dụng Mocha, Chai, Chai_Promise

Ví dụ này có sử dụng các module

1. pg_structure
2. shortid
3. pg_promise
4. low_dash
5. mocha
6. chai
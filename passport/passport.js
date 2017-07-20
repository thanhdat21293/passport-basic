module.exports = function (passport) {
    //Dữ liệu ở serializeUser trả về và lưu vào session.passport
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    //Dữ liệu ở deserializeUser trả về và lưu vào req.user
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
}
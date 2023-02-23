var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var accountRouter = require("./routes/account");
var voucherRouter = require("./routes/voucher");
var itemRouter = require("./routes/item");
// var cartRouter = require("./routes/cart");
var orderRouter = require("./routes/order");

var adminItemRouter = require("./routes/ADMIN/item");
var adminAccountRouter = require("./routes/ADMIN/account");
var adminVoucherRouter = require("./routes/ADMIN/voucher");
var adminOrderRouter = require("./routes/ADMIN/order");

const { verifyToken } = require("./middleware/verify");
const { isAdmin } = require("./middleware/isAdmin");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/account", verifyToken, accountRouter);
app.use("/voucher", voucherRouter);
app.use("/item", itemRouter);
// app.use('/cart',verifyToken, cartRouter);
app.use("/order", verifyToken, orderRouter);

app.use("/1/item", verifyToken, isAdmin, adminItemRouter);
app.use("/1/account", verifyToken, isAdmin, adminAccountRouter);
app.use("/1/voucher", verifyToken, isAdmin, adminVoucherRouter);
app.use("/1/order", verifyToken, isAdmin, adminOrderRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

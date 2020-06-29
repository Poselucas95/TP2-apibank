var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//rutas de las apis expuestas ->
var clientesRouter = require('./routes/clientes');
var cuentasRouter = require('./routes/cuentas');
var creditosRouter = require('./routes/creditos');
var debitosRouter = require('./routes/debitos');
var movimientosRouter = require('./routes/movimientos');


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);

//rutas agregadas para dar visibilidad a la api ->
app.use('/api/clientes', clientesRouter);
app.use('/api/cuentas', cuentasRouter);
app.use('/api/creditos', creditosRouter);
app.use('/api/debitos', debitosRouter);
app.use('/api/movimientos', movimientosRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'example'),
    },
    port: 9000,
    compress: true,
    setupMiddlewares(_, { app }) {
      app.get('/success', function (req, res) {
        res.json({ id: 1 })
      })
      app.post('/fail', function (req, res) {
        res.sendStatus(500)
      })
      app.get('/fetch1', function (req, res) {
        res.json({ id: 2 })
      })
      app.post('/fetch2', function (req, res) {
        res.sendStatus(400)
      })
      app.post('/database', function (req, res) {
        res.json({ msg: '', code: 0 })
      })
      return _
    },
  },
}

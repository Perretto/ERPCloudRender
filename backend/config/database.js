const mongoose = require('mongoose')
const base = "erpcloud" //erpcloudfoodtown
module.exports = mongoose.connect('mongodb://localhost/' + base)
//module.exports = mongoose.connect('mongodb://localhost/foodtown')
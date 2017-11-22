const restful = require('node-restful')
const mongoose = restful.mongoose

const controlsLista = new mongoose.Schema ({
    id: { type: Number, required: true },
    autocompleteChange: { type: String, required: true },
    autocompleteSelect: { type: String, required: true },
})

module.exports = restful.model('controls', controlsLista)
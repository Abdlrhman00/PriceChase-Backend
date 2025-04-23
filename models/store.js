const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    StoreName: { type: String, required: true },
    StoreImage: { type: String, required: true }
});

const Store = mongoose.model('Store', storeSchema , 'Store');
module.exports = Store;
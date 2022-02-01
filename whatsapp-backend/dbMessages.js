import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
});

// Collection that is being exported

export default mongoose.model('messagecontents', whatsappSchema);
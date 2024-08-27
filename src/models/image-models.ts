import mongoose, { Schema } from "mongoose";


const mensure_type = [
    "WATER",
    "GAS"
];

const imageSchema: Schema = new Schema({
    image: {
        type: String,
        required: true
    },
    customer_code: {
        type: String,
        required: true
    },
    measure_datetime: {
        type: Date,
        required: true
    },
    measure_type: {
        type: String,
        required: true,
        enum: mensure_type
    }
});

const ImageModel = mongoose.model("Image", imageSchema);

export default ImageModel;
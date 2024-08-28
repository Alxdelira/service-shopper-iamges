import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const imageSchema: Schema = new Schema({
    measure_uuid: { type: String, required: true },
    customer_code: { type: String, required: true },
    measure_datetime: { type: Date, required: true },
    measure_type: { type: String, enum: ['WATER', 'GAS'], required: true },
    image_url: { type: String, required: true },
    measure_value: { type: Number, required: true },
    has_confirmed: { type: Boolean, default: false },
});

imageSchema.plugin(mongoosePaginate);

const ImageModel = mongoose.model("Image", imageSchema);

export default ImageModel;
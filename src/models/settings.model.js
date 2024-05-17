const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema(
	{
		gstValue: {
			type: Number,
			required: true,
			default: 5,
		},
	},
	{ timestamps: true }
);

const Setting = mongoose.model("setting", settingSchema);

module.exports = Setting;

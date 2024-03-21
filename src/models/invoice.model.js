const mongoose = require("mongoose");

const { Schema } = mongoose;

const invoiceSchema = new Schema(
	{
		owner: {
			type: Schema.Types.ObjectId,
			ref: "owner",
		},
		date: {
			type: Date,
			required: true,
			default: Date.now(),
		},
		rental: [
			{
				cars: [
					{
						type: Schema.Types.ObjectId,
						ref: "Car",
						unique: true,
					},
				],
				period: {
					from: Date,
					to: Date,
				},
				days: Number,
				rate: Number,
				amount: Number,
			},
		],
		maintainance: [
			{
				cars: [
					{
						type: Schema.Types.ObjectId,
						ref: "Car",
						unique: true,
					},
				],
				period: {
					start: Number,
					end: Number,
				},
				km: Number,
				rate: Number,
				amount: Number,
			},
		],
		totalAmount: {
			type: Number,
			default: 0,
		},
		invoiceNumber: {
			type: String,
			unique: true,
		},
	},
	{ timestamps: true }
);

invoiceSchema.pre("save", async function (next) {
	if (!this.invoiceNumber) {
		this.invoiceNumber = await generateUniqueInvoiceNumber();
	}
	const totalRentalAmount = this.rental.reduce((acc, val) => acc + val.amount, 0);
	const totalMaintenanceAmount = this.maintainance.reduce((acc, val) => acc + val.amount, 0);
	this.totalAmount = totalRentalAmount + totalMaintenanceAmount;
	next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

async function generateUniqueInvoiceNumber() {
	const prefix = "INV-";
	let isUnique = false;
	let invoiceNumber;

	// Loop until a unique invoice number is generated
	while (!isUnique) {
		// Generate a random 4-digit number
		const randomPart = Math.floor(1000 + Math.random() * 9000);
		invoiceNumber = `${prefix}${randomPart}`;

		// Check if the generated invoice number already exists in the database
		const existingInvoice = await Invoice.findOne({ invoiceNumber });

		// If no matching invoice found, it's unique
		if (!existingInvoice) {
			isUnique = true;
		}
		// Otherwise, regenerate the invoice number and check again
	}

	return invoiceNumber;
}
module.exports = Invoice;

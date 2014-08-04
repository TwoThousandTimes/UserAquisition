'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

/**
 *	PotentialUser is unique according to username::source concatination
 */
var PotentialUserSchema = new Schema({
	unique: {
		type: String,
		unique: true
	},
	username: {
		type: String,
		required: true
	},
	contextUrl: {
		type: String,
		required: true
	},
	source: {
		type: String,
		required: true
	},
	userUrl: {
		type: String,
		unique: true
	},
	karma: Number,
	followers: Number,
	freq: {
		type: String,
		default: 'low'
	},
	comments: String,
	dateAdded: {
		type: Date,
		default: Date.now
	},
	locked: {
		type: Boolean,
		default: false
	},
	processing: {
		isProcessed: {
			type: Boolean,
			default: false
		},
		dateProcessed: Date,
		messageSentToUser: String,
		siteReferedTo: String,
		processedBy: {
			type: Schema.ObjectId,
			ref: 'User'
		},
		readability: Number
	},
	finder: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	success: {
		type: Boolean,
		default: false
	}
});

mongoose.model('PotentialUser', PotentialUserSchema);
module.exports = mongoose.model('PotentialUser');

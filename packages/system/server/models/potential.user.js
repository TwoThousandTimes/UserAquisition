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
	userUrl: String,
	karma: {
		type: Number,
		default: 0
	},
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
		}
	},
	finder: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('PotentialUser', PotentialUserSchema);
module.exports = mongoose.model('PotentialUser');

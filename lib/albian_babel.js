'use strict';

var AlbianBabelNS,
    AlbianBabel,
    Peerpin   = require('peerpin'),
    Blast     = __Protoblast,
    fs        = require('fs'),
    Fn        = Blast.Bound.Function;

// Get the namespace
AlbianBabelNS = Fn.getNamespace('Develry.AlbianBabel');

/**
 * The AlbianBabel class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel = Fn.inherits('Informer', 'Develry.AlbianBabel', function AlbianBabel() {

});

/**
 * Set the storage directory for the blockchain
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.prepareStaticProperty(function peerpin() {
	var instance = new Peerpin.Peerpin('albian-babel');
	return instance;
});

/**
 * Get the albian-babel peerpin link
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.prepareProperty(function peerpin() {
	var that = this,
	    instance = this.constructor.peerpin;

	instance.afterOnce('blockchain_ready', function ready() {
		that.emit('ready');
	});

	return instance;
});

/**
 * How many connections are there currently?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function number_of_connections() {
	return this.peerpin.number_of_connections;
});

/**
 * How many blocks do we have?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function block_count() {
	return this.peerpin.blockchain.length;
});

/**
 * How many blocks are there in the network?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function network_block_count() {
	return this.peerpin.blockchain.voted_length;
});

/**
 * Get the identity instance
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.prepareProperty(function identity() {
	var identity = new Peerpin.Identity(this.peerpin);
	return identity;
});

/**
 * Get all the connected peers
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function peers() {
	return this.identity.peers;
});

/**
 * Get the private mnemonic key
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function private_mnemonic() {
	return this.identity.private_mnemonic;
});

/**
 * Get the public key
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function public_key() {
	return this.identity.public_key;
});

/**
 * Set the storage directory for the blockchain
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   path
 * @param    {Function} callback
 */
AlbianBabel.setMethod(function setMainStorageDir(path, callback) {
	this.peerpin.setMainStorageDir(path, callback);
});

/**
 * Register on the network and get a private key
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
AlbianBabel.setAfterMethod('ready', function register(callback) {

	var that = this;

	this.identity.createKeys();

	this.identity.connect(function done(err) {

		if (err) {
			return callback(err);
		}

		return callback(null, that.identity.private_key);
	});
});

/**
 * Log in to the network using the private key
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String|Buffer}   private_key
 * @param    {Function}        callback
 */
AlbianBabel.setAfterMethod('ready', function login(private_key, callback) {

	var that = this;

	if (Buffer.isBuffer(private_key)) {
		private_key = private_key.toString('hex');
	}

	this.identity.setKeys(private_key);

	this.identity.connect(function done(err) {

		if (err) {
			return callback(err);
		}

		that.emit('logged_in');
		callback();
	});
});

/**
 * Claim a unique value
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   db_name       The type of value (eg: "username")
 * @param    {String}   str_value     The actual value
 * @param    {Object}   data          Optional extra info
 * @param    {Function} callback
 */
AlbianBabel.setMethod(function claimValue(db_name, str_value, data, callback) {

	var that = this;

	if (typeof data == 'function') {
		callback = data;
		data = null;
	}

	this.identity.claimValue(false, db_name, str_value, data, function claimed(err, block) {

		if (err) {
			return callback(err);
		}

		callback(null, block);
	});
});
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

	// The preferred port to connect on?
	this.preferred_port = null;
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
 *
 * @type     {Number}
 */
AlbianBabel.setProperty(function number_of_connections() {
	return this.peerpin.number_of_connections;
});

/**
 * How many connections are there currently?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @type     {Number}
 */
AlbianBabel.setProperty(function number_of_connection_attempts() {
	return this.peerpin.number_of_connection_attempts;
});

/**
 * How many peers have we discovered?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @type     {Number}
 */
AlbianBabel.setProperty(function found_peer_count() {
	return this.number_of_connection_attempts + this.number_of_connections;
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
	var that = this,
	    identity = new Peerpin.Identity(this.peerpin);

	identity.on('peer', function gotPeer(peer) {
		that._initPeer(peer);
	});

	identity.once('listening', function isListening(port) {
		that.emit('connected', port);
	});

	return identity;
});

/**
 * Our IP address
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @type     {String}
 */
AlbianBabel.setProperty(function ip() {
	return this.identity.ip;
});

/**
 * The port we are listening on
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @type     {Number}
 */
AlbianBabel.setProperty(function port() {
	return this.identity.port;
}, function setPort(value) {
	// Set the preferred port
	this.preferred_port = value;
});

/**
 * The port we are discovering peers through
 * Not really important I think, but still
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 *
 * @type     {Number}
 */
AlbianBabel.setProperty(function discovery_port() {
	return this.identity.discovery_port;
}, function setPort(value) {
	throw new Error('This is a read-only port');
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

	this.identity.connect(this.preferred_port, function done(err) {

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

	this.identity.connect(this.preferred_port, function done(err) {

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

/**
 * Initialize a peer
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Peerpin.Peer}   peer
 */
AlbianBabel.setMethod(function _initPeer(peer) {
	this.emit('peer', peer);
});
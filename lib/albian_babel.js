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
 * @version  0.1.2
 */
AlbianBabel = Fn.inherits('Informer', 'Develry.AlbianBabel', function AlbianBabel() {

	// The preferred port to connect on?
	this.preferred_port = null;

	// Forward requests
	this.forward_requests = [];
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
 * @version  0.1.1
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

	identity.on('incoming_connection', function onConnecting(connection) {
		that.emit('incoming_connection', connection);
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
 * Get a specific claim db
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 */
AlbianBabel.setMethod(function getClaimDb(db_name) {
	return this.identity.blockchain.getClaimDb(db_name);
});

/**
 * Initialize a peer
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.3
 *
 * @param    {Peerpin.Peer}   peer
 */
AlbianBabel.setMethod(function _initPeer(peer) {

	var that = this,
	    entry;

	// Emit the peer as an event
	this.emit('peer', peer);

	// Listen for forward requests
	peer.onTalk('request_forward', function onRequestForward(payload, callback) {

		var target_peer,
		    exists;

		exists = Blast.Bound.Array.findByPath(that.forward_requests, 'signature', payload.signature);

		if (exists) {
			return callback(null, {duplicate: true});
		}

		that.emit('request_forward', payload, peer);

		// See if the target peer is connected to us
		target_peer = that.identity.getConnectedPeer(payload.target_key);

		if (target_peer) {
			target_peer.talk('deliver', payload, function done(err, result) {

				if (err) {
					return callback(null, {target_error: err});
				}

				callback(null, {delivered: true, result: result});
			});
		}

		// Remember this request for later
		that.forward_requests.push(payload);
	});

	// Listen for deliveries
	peer.onTalk('deliver', function onDeliveries(payload, callback) {

		var deliveries;

		console.log('Getting delivery:', payload);

		// Make sure it's meant for us
		if (payload.target_key != that.public_key) {
			return callback(new Error('Payload is not meant for us'));
		}

		deliveries = that.identity.setting('deliveries') || {};

		// If we have already seen this payload, ignore it
		if (deliveries[payload.signature]) {
			return callback(null);
		}

		let verified = that.identity.verifyBuffer(payload.data, payload.signature, payload.source_key);

		if (!verified) {
			console.warn('Failed to verify payload:', payload);
			return callback(new Error('Verification error!'));
		}

		// Remember when we received it
		deliveries[payload.signature] = Date.now();

		console.log('Verified!');

		// Make sure we save it
		that.identity.setting('deliveries', deliveries);

	});

	// See if we have any payloads for this peer
	while (entry = Blast.Bound.Array.findByPath(that.forward_requests, 'target_key', peer.public_key)) {
		let payload = entry;
		index = that.forward_requests.indexOf(payload);

		// That's weird...
		if (index == -1) {
			break;
		}

		// Remove it from the requests
		that.forward_requests.splice(index, 1);

		console.log('Going to deliver', payload, 'to', peer);

		peer.talk('deliver', payload, function done(err, result) {

			if (err) {
				console.warn('Failed to deliver packet:', err, payload);
				return;
			}

			console.info('Delivered packet:', result);
		});
	}
});

/**
 * Request the network to forward our (public) message
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.3
 * @version  0.1.3
 *
 * @param    {String|Buffer}   target_key
 * @param    {Object}          message
 * @param    {Function}        callback
 */
AlbianBabel.setAfterMethod('ready', function requestForward(target_key, message, callback) {

	var that = this,
	    signature,
	    payload,
	    buffer,
	    tasks,
	    sent,
	    data,
	    peer = this.identity.getOfflinePeer(target_key);

	// Serialize the message to a first buffer
	// This buffer will get a signature
	data = this.peerpin.serialize({
		sent        : Date.now(),
		target_key  : target_key,
		message     : message
	});

	// Sign the buffer with our (hexadecimal) private key
	signature = this.identity.signBuffer(data, this.identity.private_key);

	// Create the payload object
	payload = {
		source_key : this.public_key,
		target_key : peer.public_key,
		data       : data,
		signature  : signature
	};

	// Now serialize this again
	buffer = this.peerpin.serialize(payload);

	// Prepare tasks array
	tasks = [];
	sent = 0;

	// Iterate over all the connected peers
	this.peers.forEach(function eachPeer(peer) {
		tasks.push(function sendToPeer(next) {

			// Sent to maximum 5 peers
			if (sent > 5) {
				return next();
			}

			peer.talk('request_forward', payload, function done(err, response) {

				if (err) {
					return next();
				}

				sent++;
				next();
			});
		});
	});

	// Shuffle the tasks so we don't always sent to the same ones
	Blast.Bound.Array.shuffle(tasks);

	Fn.series(tasks, function done(err) {

		if (err) {
			return callback(err);
		}

		callback(null, sent);
	});
});
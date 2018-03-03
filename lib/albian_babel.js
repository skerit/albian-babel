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
	return new Peerpin.Peerpin('albian-babel');
});

/**
 * Get the albian-babel peerpin link
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AlbianBabel.setProperty(function peerpin() {
	return this.constructor.peerpin;
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
AlbianBabel.setMethod(function register(callback) {

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
AlbianBabel.setMethod(function login(private_key, callback) {

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
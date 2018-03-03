var AlbianBabel,
    Blast;

// Get an existing Protoblast instance,
// or create a new one
if (typeof __Protoblast != 'undefined') {
	Blast = __Protoblast;
} else {
	Blast = require('protoblast')(false);
}

// Get the Peerpin namespace
AlbianBabel = Blast.Bound.Function.getNamespace('Develry.AlbianBabel');

require('./albian_babel.js');

// Export the AlbianBabel namespace
module.exports = Blast.Classes.Develry.AlbianBabel;
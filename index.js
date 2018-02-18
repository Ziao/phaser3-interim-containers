/**
 * @name Interim Containers for Phaser 3
 * @author Nick Kamer (Ziao on Github) <nick@ziaomedia.com
 * @description Basic Interim Containers for Phaser 3.0.0 and up, until Containers officially land.
 * Supported properties: x, y, alpha, rotation, scale. More can be easily added in the future.
 * You can use Actions on the children like normal, so long as they don't touch the properties mentioned above as they are overwritten on every update.
 *
 * This assumes Phaser to be available in the global namespace, if not, uncomment the import on line 12 or 13 (depending on your environment).
 */

// import Phaser from 'phaser';
// var Phaser = require("phaser");

const Container = Phaser.Class({
	Extends: Phaser.GameObjects.Group,

	//Could include these later, maybe.
	// Mixins: [Phaser.GameObjects.Components.Alpha, Phaser.GameObjects.Components.Transform],

	//Defaults
	props: { x: 0, y: 0, alpha: 1, rotation: 0, scale: 1 },

	initialize: function Container(scene, children, config) {
		Phaser.GameObjects.Group.call(this, scene, children, config);

		for (var key in this.props) {
			this['_' + key] = Phaser.Utils.Objects.GetFastValue(config, key, this.props[key]);

			Object.defineProperty(this, key, {
				get: function() {
					return this['_' + key];
				},
				set: function(value) {
					this['_' + key] = value;
					this._updateChildren();
				},
			});
		}

		this._updateChildren();
	},

	//Same footprint as Group.add
	addChild: function(child, addToScene) {
		var sprite = this.add.apply(this, arguments);
		this._prepareChild(sprite);
		this._updateChild(sprite);
		return sprite;
	},

	//Same footprint as Group.create
	createChild: function(x, y, texture, frame, visible) {
		var sprite = this.create.apply(this, arguments);
		this._prepareChild(sprite);
		this._updateChild(sprite);
		return sprite;
	},

	//Same footprint as Group.remove
	removeChild: function(child) {
		delete child._containerProps;
		return this.remove.apply(this, arguments);
	},

	_updateChildren: function() {
		for (var i = 0; i < this.children.entries.length; i++) {
			this._updateChild(this.children.entries[i]);
		}
	},

	_updateChild: function(sprite) {
		// console.log('U');
		sprite.x = this.x + sprite._containerProps.x * this.scale;
		sprite.y = this.y + sprite._containerProps.y * this.scale;
		sprite.scaleX = this.scale * sprite._containerProps.scale;
		sprite.scaleY = sprite.scaleX;
		sprite.rotation = this.rotation + sprite._containerProps.rotation;
		sprite.alpha = this.alpha * sprite._containerProps.alpha;

		//Todo
		// sprite.flipX = this.flipped;
		// Phaser.Actions.FlipX([sprite.sprite], this.position, this.rotation);

		if (this.rotation !== 0) {
			//todo: this can be better optimized by calling it for all children at once (prevents creating a bunch of 1-length arrays)
			Phaser.Actions.RotateAround([sprite], this, this.rotation);
		}
	},

	_prepareChild: function(sprite) {
		var that = this;

		//We could opt for using setters/getters directly on the child, but this is a can of worms I don't want to open.
		//Instead, if you need to change the childs properties after adding it, alter _containerProps instead.

		sprite._containerProps = {};
		for (var key in this.props) {
			sprite._containerProps['_' + key] = Phaser.Utils.Objects.GetFastValue(sprite, key, this.props[key]);

			Object.defineProperty(sprite._containerProps, key, {
				get: function() {
					return this['_' + key];
				},
				set: function(value) {
					this['_' + key] = value;
					that._updateChild(sprite);
				},
			});
		}
	},
});

//Code taken from Phaser's Group
Phaser.GameObjects.GameObjectCreator.register('container', function(config) {
	return new Container(this.scene, null, config);
});

Phaser.GameObjects.GameObjectFactory.register('container', function(children, config) {
	if (typeof children === 'object' && config === undefined) {
		config = children;
		children = [];
	}

	return this.updateList.add(new Container(this.scene, children, config));
});

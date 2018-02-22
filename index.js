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

	props: null,

	initialize: function Container(scene, children, config) {
		let watchedProps = Phaser.Utils.Objects.GetFastValue(config, 'watch', null);
		let supportedProps = { x: 0, y: 0, alpha: 1, rotation: 0, scale: 1, flipX: false, flipY: false };
		if (watchedProps && watchedProps.constructor === Array && watchedProps.length > 0) {
			this.props = {};
			for (let i = 0; i < watchedProps.length; i++) {
				if (supportedProps[watchedProps[i]] === undefined) return;
				this.props[watchedProps[i]] = supportedProps[watchedProps[i]];
			}
		} else {
			this.props = supportedProps;
		}

		console.log(this.props);

		Phaser.GameObjects.Group.call(this, scene, children, config);
		var that = this;

		for (var _key in this.props) {
			(function() {
				var key = _key; //Don't use the same reference
				var uKey = '_' + key; //Faster than concatenating on every get()

				that[uKey] = Phaser.Utils.Objects.GetFastValue(config, key, that.props[key]);

				Object.defineProperty(that, key, {
					get: function() {
						return this[uKey];
					},
					set: function(value) {
						this[uKey] = value;
						that._updateChildren();
					},
				});
			})();
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
		if (this.props.flipX !== undefined) {
			sprite.flipX = this.flipX != sprite._containerProps.flipX;
		} else if (sprite._containerProps.flipX !== undefined) {
			sprite.flipX = sprite._containerProps.flipX;
		}

		if (this.props.flipY !== undefined) {
			sprite.flipY = this.flipY != sprite._containerProps.flipY;
		} else if (sprite._containerProps.flipY !== undefined) {
			sprite.flipY = sprite._containerProps.flipY;
		}

		if (this.props.x !== undefined && this.props.scale !== undefined) {
			sprite.x = this.x + (sprite._containerProps.x * sprite.flipX ? -1 : 1) * this.scale;
		} else if (this.props.x !== undefined) {
			sprite.x = this.x + (sprite._containerProps.x * sprite.flipX ? -1 : 1);
		} else if (sprite._containerProps.x !== undefined) {
			sprite.x = sprite._containerProps.x;
		}

		if (this.props.y !== undefined && this.props.scale !== undefined) {
			sprite.y = this.y + (sprite._containerProps.y * sprite.flipX ? -1 : 1) * this.scale;
		} else if (this.props.y !== undefined) {
			sprite.y = this.y + (sprite._containerProps.y * sprite.flipX ? -1 : 1);
		} else if (sprite._containerProps.y !== undefined) {
			sprite.y = sprite._containerProps.y;
		}

		if (this.props.scale !== undefined) {
			sprite.scaleX = this.scale * sprite._containerProps.scale;
			sprite.scaleY = sprite.scaleX;
		} else {
			if (sprite._containerProps.scaleX !== undefined) {
				sprite.scaleX = sprite._containerProps.scaleX;
			}
			if (sprite._containerProps.scaleY !== undefined) {
				sprite.scaleY = sprite._containerProps.scaleY;
			}
		}

		if (this.props.rotation !== undefined) {
			sprite.rotation = this.rotation + sprite._containerProps.rotation;
			if (this.rotation !== 0) {
				//todo: this can be better optimized by calling it for all children at once (prevents creating a bunch of 1-length arrays)
				Phaser.Actions.RotateAround([sprite], this, this.rotation);
			}
		} else if (sprite._containerProps.rotation !== undefined) {
			sprite.rotation = sprite._containerProps.rotation;
		}

		if (this.props.alpha !== undefined) {
			sprite.alpha = this.alpha * sprite._containerProps.alpha;
		} else if (sprite._containerProps.alpha !== undefined) {
			sprite.alpha = sprite._containerProps.alpha;
		}
	},

	_prepareChild: function(sprite) {
		var that = this;

		//We could opt for using setters/getters directly on the child, but this is a can of worms I don't want to open.
		//Instead, if you need to change the childs properties after adding it, alter _containerProps instead.

		sprite._containerProps = {};
		for (var _key in this.props) {
			(function() {
				var key = _key; //Don't use the same reference
				sprite._containerProps['_' + key] = Phaser.Utils.Objects.GetFastValue(sprite, key, that.props[key]);

				Object.defineProperty(sprite._containerProps, key, {
					get: function() {
						return this['_' + key];
					},
					set: function(value) {
						// console.log(key);
						this['_' + key] = value;
						that._updateChild(sprite);
					},
				});
			})();
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

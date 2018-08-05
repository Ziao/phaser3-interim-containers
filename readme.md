# WARNING: This project is now deprecated as official Containers are now a thing. See [https://phaser.io/phaser3/devlog/120](This blog post)

# Interim Containers for Phaser 3

### Basic containers for Phaser 3 until they officially land.

[Phaser 3](https://github.com/photonstorm/phaser) has officially been released, but due to time constrains, some features have been left for now. One of the most important features that I am missing is Containers. They are similar to groups, but they allow you to manipulate them as if they were a sprite. For example, you can set their alpha, rotation, position, etc. Groups are mainly aimed at organizing your sprites, and do not have these features.

This repository will be marked as deprecated as soon as Phaser launches their version of Containers, which will no doubt be superior.
Code was written in old-school javascript as much as possible, to avoid the need for transpiling.


### Prerequisites

Interim Containers expects the Phaser object to be available globally. This only works with Phaser 3.0.0 and up (tested up to 3.1.0).

### Installing

NPM

```
npm install --save phaser3-interim-containers
```

Yarn

```
yarn add phaser3-interim-containers
```

Bower (you should move to yarn)

```
bower install phaser3-interim-containers
```

Stoneage

```
Simply download the index.js file and include it in your HTML file.
```


### Usage

Interim Containers function very similar to Groups, with two important gotcha's:
- You must use addChild() or createChild() on the Container, instead of add() and create(). They behave exactly as you'd expect. This is due to the way Phaser's Class system and inheritance works. I couldn't find a clean way to inject my own code there.
- Use `child._containerProps.property` instead of directly changing a child's properties.

Supported properties for both the Container and che children (please update this list when submitting a PR):
- x
- y
- alpha (it's currently impossible to implement this correctly. Eg: setting the container to 0.5 will render all the children at 0.5, making them see-through when overlapping)
- rotation
- scale
- flipX
- flipY

Starting at 1.2.0, you are able to provide a list of properties that will be watched using the watch option. Please see the example. Doing so will increase the performance of containers that are updated all the time (for example, using tweens).
If you do not provide this option, all supported properties will be watched.

### Example

``` js

var container, sprite1, sprite2;

new Phaser.Game({
	scene: {
		create: function(){

			//Creating a container (options are optional)
			container = this.add.container({
				x:100, 
				y: 50, 
				alpha: 0.9, 
				rotation: 1.3, 
				watch: ['x', 'y', 'rotation','alpha']
			});

			//Create a sprite directly on the container, just as you would with group.create
			sprite1 = container.createChild(200, 200, 'spaceship');

			sprite2 = this.add.sprite(200, 200, 'spaceship');
			container.addChild(sprite2);

		},

		update: function(delta){

			//These are all supported - they don't all make sense in this context though ;)
			container.x += 10;
			container.y += 10;
			container.alpha -= 0.01;
			container.rotation += 0.01;
			container.scale += 0.01;

			// You can also alter the children directly and 
			// everything will work out.
			// However, since their properties are overwritten 
			// as soon as you update the container, you'll have
			// to alter the properties on the _containerProps 
			// object (which is automatically added for you by the container):
			// All of these values are relative to the container.

			sprite1._containerProps.rotation -= -0.1;
			sprite1._containerProps.x = 100;
			sprite1._containerProps.y = 50;

		}
	}
});

```

## Todo

- Example code could use some work
- Support more properties
- Find a clean way to support changing values on Sprites directly, without breaking or littering everything (consider defineProperty on them, as long as I'm good about cleaning them later)
- Confirm that Tweens work -> Done. They work fine!
- Nested containers

## Contributing

Feel free to submit a pull request or open an issue with suggestions or ideas.

## License

This project is licensed under the MIT License

## Credits

Created by Nick Kamer, Ziao on Github, or <nick@ziaomedia.com>. Huge shoutout to the guys at [Photonstorm](https://github.com/photonstorm) for creating this awesome framework!

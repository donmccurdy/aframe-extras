(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
AFRAME.registerComponent('sphere-collider', require('./src/misc/sphere-collider'));
},{"./src/misc/sphere-collider":2}],2:[function(require,module,exports){
/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Implement bounding sphere collision detection for entities with a mesh.
 * Sets the specified state on the intersected entities.
 *
 * @property {string} objects - Selector of the entities to test for collision.
 * @property {string} state - State to set on collided entities.
 *
 */
module.exports = {
  schema: {
    objects: {default: ''},
    state: {default: 'collided'},
    radius: {default: 0.05}
  },

  init: function () {
    this.els = [];
    this.collisions = [];
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function () {
    var data = this.data;
    var objectEls;

    // Push entities into list of els to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If objects not defined, intersect with everything.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: (function () {
    var position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3();
    return function () {
      var el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh'),
          collisions = [];

      if (!mesh) { return; }

      position.copy(el.object3D.getWorldPosition());

      // Update collisions.
      this.els.forEach(intersect);
      // Emit events.
      collisions.forEach(handleHit);
      // No collisions.
      if (collisions.length === 0) { el.emit('hit', {el: null}); }
      // Updated the state of the elements that are not intersected anymore.
      this.collisions.filter(function (el) {
        return collisions.indexOf(el) === -1;
      }).forEach(function removeState (el) {
        el.removeState(data.state);
      });
      // Store new collisions
      this.collisions = collisions;

      // AABB collision detection
      function intersect (el) {
        var radius,
            mesh = el.getObject3D('mesh');

        if (!mesh) return;

        mesh.getWorldPosition(meshPosition);
        mesh.geometry.computeBoundingSphere();
        radius = mesh.geometry.boundingSphere.radius;
        if (position.distanceTo(meshPosition) < radius + data.radius) {
          collisions.push(el);
        }
      }

      function handleHit (hitEl) {
        hitEl.emit('hit');
        hitEl.addState(data.state);
        el.emit('hit', {el: hitEl});
      }
    };
  })()
};

},{}]},{},[1]);

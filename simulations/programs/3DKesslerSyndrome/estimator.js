import * as THREE from "three";

export class StateEstimator {
  constructor() {
    this.state = {
      rollRate: 0,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),

      relPosition: new THREE.Vector3(),
      relVelocity: new THREE.Vector3()
    };

    // sensor bias / drift
    this.rollBias = 0;

    // tuning
    this.rollAlpha = 0.2;
    this.velAlpha  = 0.15;
  }

  // ----------------------
  // SENSOR MODELS
  // ----------------------

  measureRollRate(trueRollRate) {
    const amp =  Math.random();// < 0.01 ? 2 : 1; // occasional spike
    const noise = (trueRollRate + 0.5) * (Math.random() - 0.5);
    return trueRollRate + this.rollBias + noise;
  }

  measureVelocity(trueVelocity) {
    const noise = new THREE.Vector3(
      0.3 * (Math.random() - 0.5),
      0.3 * (Math.random() - 0.5),
      0.3 * (Math.random() - 0.5)
    );
    return trueVelocity.clone().add(noise);
  }

  measurePosition(truePosition) {
  const noise = new THREE.Vector3(
    1.0 * (Math.random() - 0.5),
    1.0 * (Math.random() - 0.5),
    1.0 * (Math.random() - 0.5)
  );

  return truePosition.clone().add(noise);
}

measureRelativePosition(trueRelPos) {

  const noise = new THREE.Vector3(
    0.8 * (Math.random() - 0.5),
    0.8 * (Math.random() - 0.5),
    0.8 * (Math.random() - 0.5)
  );

  return trueRelPos.clone().add(noise);
}



  // ----------------------
  // ESTIMATION UPDATES
  // ----------------------

  propagate(dt) {
    this.state.position.addScaledVector(this.state.velocity, dt);
  }

  updateRollEstimate(trueRollRate) {
    const measured = this.measureRollRate(trueRollRate);
    this.state.rollRate =
      (1 - this.rollAlpha) * this.state.rollRate +
      this.rollAlpha * measured;
  }

  updateVelocityEstimate(trueVelocity) {
    const measured = this.measureVelocity(trueVelocity);
    this.state.velocity.lerp(measured, this.velAlpha);
  }

  updatePositionEstimate(truePosition) {

    const measured = this.measurePosition(truePosition);

    this.state.position.lerp(measured, 0.1);
}

updateRelativeEstimate(trueRelPos, dt) {

  const measured = this.measureRelativePosition(trueRelPos);

  // simple blend filter
  this.state.relPosition.lerp(measured, 0.2);

  // estimate relative velocity via finite difference
  const velEstimate = measured.clone()
    .sub(this.state.relPosition)
    .divideScalar(dt);

  this.state.relVelocity.lerp(velEstimate, 0.2);
}



  // ----------------------
  // BIAS / DRIFT
  // ----------------------

  updateBias(dt) {
    this.rollBias += 0.001 * (Math.random() - 0.5) * dt;
  }

  // ----------------------
  // ACCESSORS (important)
  // ----------------------

  getState() {
    return this.state;
  }
}

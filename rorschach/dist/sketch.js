/**
 * Rorschach.
 * Website => https://www.fal-works.com/
 * @copyright 2018 FAL
 * @author FAL <falworks.contact@gmail.com>
 * @version 0.2.0
 * @license CC-BY-SA-3.0
 */

(function (p5ex) {
  'use strict';

  class RorschachShape {
      constructor(p, frameCounter, params) {
          this.p = p;
          this.frameCounter = frameCounter;
          this.shapeSize = params.shapeSize;
          this.noiseMagnitudeFactor = params.noiseMagnitudeFactor;
          this.centerPosition = p.createVector();
          this.rotationAngle = 0;
          this.vertexCount =
              params.vertexCount || Math.floor(0.75 * params.shapeSize);
          this.noiseDistanceScale =
              params.noiseDistanceScale || params.shapeSize / 320;
          this.noiseTimeScale = params.noiseTimeScale || 0.005;
          this.xNoiseParameterOffset = p
              .createVector(Math.random(), Math.random())
              .mult(1024);
          this.yNoiseParameterOffset = p
              .createVector(Math.random(), Math.random())
              .mult(1024);
          this.noiseTime = 0;
          this.reachedEndOfScreen = false;
          if (RorschachShape.isNotInitialized)
              RorschachShape.initializeStatic(p);
      }
      static initializeStatic(p) {
          this.temporalVector = p.createVector();
          this.isNotInitialized = false;
      }
      step() {
          this.noiseTime += this.noiseTimeScale;
      }
      draw() {
          if (this.reachedEndOfScreen)
              return;
          this.p.translate(this.centerPosition.x, this.centerPosition.y);
          this.p.rotate(this.rotationAngle);
          this.drawVertices(+1);
          this.drawVertices(-1);
          this.p.rotate(-this.rotationAngle);
          this.p.translate(-this.centerPosition.x, -this.centerPosition.y);
      }
      drawVertice(yScaleFactor, noiseMagnitude, progressRatio, currentBasePositionX, index) {
          const distanceFactor = progressRatio *
              this.p.sq(this.p.sin((index / this.vertexCount) * this.p.PI));
          const noiseX = (2 *
              this.p.noise(this.xNoiseParameterOffset.x +
                  this.noiseDistanceScale * currentBasePositionX, this.xNoiseParameterOffset.y + this.noiseTime) -
              1) *
              noiseMagnitude;
          const noiseY = (2 *
              this.p.noise(this.yNoiseParameterOffset.x +
                  this.noiseDistanceScale * currentBasePositionX, this.yNoiseParameterOffset.y + this.noiseTime) -
              1) *
              noiseMagnitude;
          const vertexPositionX = currentBasePositionX + distanceFactor * noiseX;
          const vertexPositionY = yScaleFactor * distanceFactor * (0.3 * this.shapeSize + noiseY);
          this.p.curveVertex(vertexPositionX, vertexPositionY);
          const rotatedVertexPosition = RorschachShape.temporalVector;
          rotatedVertexPosition.set(vertexPositionX, vertexPositionY);
          rotatedVertexPosition.rotate(this.rotationAngle);
          this.checkScreen(this.centerPosition.x + rotatedVertexPosition.x, this.centerPosition.y + rotatedVertexPosition.y);
      }
      drawVertices(yScaleFactor) {
          const noiseMagnitude = this.noiseMagnitudeFactor * 0.5 * this.shapeSize;
          this.p.beginShape();
          const basePositionIntervalDistance = this.shapeSize / this.vertexCount;
          const progressRatio = this.frameCounter.getProgressRatio();
          let currentBasePositionX = -0.5 * this.shapeSize;
          for (let i = 0; i < this.vertexCount; i += 1) {
              this.drawVertice(yScaleFactor, noiseMagnitude, progressRatio, currentBasePositionX, i);
              currentBasePositionX += basePositionIntervalDistance;
          }
          currentBasePositionX = -0.5 * this.shapeSize;
          for (let i = 0; i < 3; i += 1) {
              this.drawVertice(yScaleFactor, noiseMagnitude, progressRatio, currentBasePositionX, i);
              currentBasePositionX += basePositionIntervalDistance;
          }
          this.p.endShape();
      }
      checkScreen(absolutePositionX, absolutePositionY) {
          const xMargin = 0.01 * this.p.nonScaledWidth;
          const yMargin = 0.05 * this.p.nonScaledHeight;
          if (absolutePositionX < xMargin ||
              absolutePositionX > this.p.nonScaledWidth - xMargin ||
              absolutePositionY < yMargin ||
              absolutePositionY > this.p.nonScaledHeight - yMargin) {
              this.reachedEndOfScreen = true;
          }
      }
  }
  RorschachShape.isNotInitialized = true;

  const SKETCH_NAME = "Rorschach";
  const sketch = (p) => {
      // ---- constants
      // ---- variables
      const IDEAL_FRAME_RATE = 60;
      let unitLength;
      // let unitSpeed: number;
      let backgroundColor;
      let frameCounter;
      let rorschachShape;
      let rorschachShapeColor;
      // ---- functions
      function initialize() {
          unitLength = Math.min(p.nonScaledWidth, p.nonScaledHeight) / 640;
          // unitSpeed = unitLength / IDEAL_FRAME_RATE;
          p.strokeWeight(Math.max(1, 1 * unitLength));
          p.background(backgroundColor);
          const rorschachShapeSize = 480 * unitLength;
          rorschachShape = new RorschachShape(p, frameCounter, {
              shapeSize: rorschachShapeSize,
              vertexCount: Math.floor(1.5 * rorschachShapeSize),
              noiseDistanceScale: p.random(0.005, 0.05),
              noiseMagnitudeFactor: p.random(1, 4),
              noiseTimeScale: 0.0005
          });
          rorschachShape.centerPosition.set(0.5 * p.nonScaledWidth, 0.48 * p.nonScaledHeight);
          rorschachShape.rotationAngle = p.PI + p.HALF_PI;
          rorschachShapeColor = new p5ex.ShapeColor(p, p.color(0, p.random(4, 48)), null, false);
          frameCounter.resetCount();
          frameCounter.on();
          p.loop();
      }
      // ---- Setup & Draw etc.
      p.preload = () => { };
      p.setup = () => {
          p.createScalableCanvas(p5ex.ScalableCanvasTypes.SQUARE640x640);
          backgroundColor = p.color(252);
          frameCounter = new p5ex.NonLoopedFrameCounter(13 * IDEAL_FRAME_RATE, () => {
              p.noLoop();
          });
          initialize();
      };
      p.draw = () => {
          p.scalableCanvas.scale();
          rorschachShape.step();
          rorschachShapeColor.applyColor();
          rorschachShape.draw();
          frameCounter.step();
          p.scalableCanvas.cancelScale();
      };
      p.windowResized = () => { };
      p.mousePressed = () => {
          // if (!p5ex.mouseIsInCanvas(p)) return;
          // p.noLoop();
      };
      p.keyTyped = () => {
          if (p.key === "p")
              p.noLoop();
      };
  };
  new p5ex.p5exClass(sketch, SKETCH_NAME);

}(p5ex));
//# sourceMappingURL=sketch.js.map

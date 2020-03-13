var GPO = {
  //Config
  logDuration: 2000, // in ms

  gp: null,
  ticking: false,
  log: [],

  // digital button indices
  dbi: [
    0, 1, 2, 3, // A B X Y
    4, 5, // L1 R1
    /* 6, 7, // L2 R2 */
    8, 9, // view, menu
    /* 10, 11, // L3 R3 */
    12, 13, 14, 15 // Up Down Left Right
    /* 16, 17 // Guide, Click */
  ],

  sticksTrailOpacityScale: d3.scalePow()
    .exponent(0.1)
    .range([0, 0.5]),

  stickScale: d3.scaleLinear()
    .domain([-1, 1])
    .range([4, 188]),

  timelineXScale: d3.scaleLinear()
    .domain([-1, 1])
    .range([4, 124]),

  timelineYScale: d3.scaleLinear()
    .domain([3000, 0])
    .range([0, 320]),

  // Elements
  steeringStickTip: null,
  steeringStickLine: null,
  cameraStickTip: null,
  cameraStickLine: null,
  brakeMeter: null,
  acceleratorMeter: null,
  buttonElements: [],
  steeringPath: null,
  acceleratorPath: null,
  brakePath: null,

  // Generators
  steeringLineGen: d3.line()
    .x(function (d) {
      return GPO.timelineXScale(d.steering.x);
    })
    .y(function (d) {
      return GPO.timelineYScale(d.timestamp);
    }),

  acceleratorPathGen: d3.area()
    .y(function (d) {
      return GPO.timelineYScale(d.timestamp);
    })
    .x0(function(d) {
      return GPO.timelineXScale(-d.accelerator);
    })
    .x1(function(d) {
      return GPO.timelineXScale(d.accelerator);
    }),

  brakePathGen: d3.area()
    .y(function (d) {
      return GPO.timelineYScale(d.timestamp);
    })
    .x0(function(d) {
      return GPO.timelineXScale(-d.brake);
    })
    .x1(function(d) {
      return GPO.timelineXScale(d.brake);
    }),

  tick: function () {
    var gamepads = navigator.getGamepads();
    let ctx = GPO.sticksTrailCtx;

    if (GPO.ticking && gamepads && gamepads.length && gamepads[0] && gamepads[0].connected) {
      GPO.gp = gamepads[0];

      GPO.log = GPO.log.filter(function (el) {
        return el.timestamp >= GPO.gp.timestamp - GPO.logDuration;
      });

      GPO.log.push({
        timestamp: GPO.gp.timestamp,
        steering: {
          x: GPO.gp.axes[0],
          y: GPO.gp.axes[1]
        },
        camera: {
          x: GPO.gp.axes[2],
          y: GPO.gp.axes[3]
        },
        brake: GPO.gp.buttons[6].value,
        accelerator: GPO.gp.buttons[7].value
      });

      if (GPO.log.length > 500) {
        debugger;
      }

      GPO.timelineYScale.domain([
        GPO.gp.timestamp,
        GPO.gp.timestamp - GPO.logDuration
      ]);

      if (GPO.log.length >= 2) {
        GPO.sticksTrailOpacityScale.domain([
          GPO.gp.timestamp - GPO.logDuration,
          GPO.gp.timestamp
        ]);

        ctx.clearRect(0, 0, 192, 192);

        for (var i = 0; i < GPO.log.length - 2; i++) {
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(128, 255, 128, ' + GPO.sticksTrailOpacityScale(GPO.log[i].timestamp) + ')';
          //ctx.strokeStyle = 'rgba(128, 255, 128, 0.5)';
          ctx.moveTo(
            GPO.stickScale(GPO.log[i].steering.x),
            GPO.stickScale(GPO.log[i].steering.y)
          );
          ctx.lineTo(
            GPO.stickScale(GPO.log[i+1].steering.x),
            GPO.stickScale(GPO.log[i+1].steering.y)
          );
          ctx.stroke();
        }
      }

      // Update the steering vector display
      GPO.steeringStickTip
        .attr('cx', GPO.stickScale(GPO.gp.axes[0]))
        .attr('cy', GPO.stickScale(GPO.gp.axes[1]));

      GPO.steeringStickLine
        .attr('x1', GPO.stickScale(0))
        .attr('y1', GPO.stickScale(0))
        .attr('x2', GPO.stickScale(GPO.gp.axes[0]))
        .attr('y2', GPO.stickScale(GPO.gp.axes[1]));

      // Update the camera vector display
      GPO.cameraStickTip
        .attr('cx', GPO.stickScale(GPO.gp.axes[2]))
        .attr('cy', GPO.stickScale(GPO.gp.axes[3]));

      GPO.cameraStickLine
        .attr('x1', GPO.stickScale(0))
        .attr('y1', GPO.stickScale(0))
        .attr('x2', GPO.stickScale(GPO.gp.axes[2]))
        .attr('y2', GPO.stickScale(GPO.gp.axes[3]));

      // Update the trigger meters
      GPO.brakeMeter.property('value', GPO.gp.buttons[6].value);
      GPO.acceleratorMeter.property('value', GPO.gp.buttons[7].value);

      GPO.dbi.forEach(function (i) {
        GPO.buttonElements[i].classed('pressed', GPO.gp.buttons[i].pressed);
      });

      GPO.steeringPath.attr('d', GPO.steeringLineGen(GPO.log));
      GPO.brakePath.attr('d', GPO.brakePathGen(GPO.log));
      GPO.acceleratorPath.attr('d', GPO.acceleratorPathGen(GPO.log));

      requestAnimationFrame(GPO.tick);
    } else {
      GPO.ticking = false;
    }
  },

  onGamepadConnected: function (e) {
    console.log('connected', e);
    GPO.gp = navigator.getGamepads()[e.gamepad.index];
    GPO.ticking = true;
    requestAnimationFrame(GPO.tick);
  },

  onGamepadDisconnected: function (e) {
    console.log('disconnected', e);
    GPO.ticking = false;
  },

  main: function () {
    GPO.sticksTrailCtx = document.getElementById('sticksTrail').getContext('2d');

    GPO.steeringStickTip = d3.select('#sticks .steering circle');
    GPO.steeringStickLine = d3.select('#sticks .steering line');

    GPO.cameraStickTip = d3.select('#sticks .camera circle');
    GPO.cameraStickLine = d3.select('#sticks .camera line');

    GPO.brakeMeter = d3.select('.buttons.left meter');
    GPO.acceleratorMeter = d3.select('.buttons.right meter');

    GPO.dbi.forEach(function (i) {
      GPO.buttonElements[i] = d3.select('.buttons .b' + i);
    });

    GPO.acceleratorPath = d3.select('#timeline .accelerator');
    GPO.brakePath = d3.select('#timeline .brake');
    GPO.steeringPath = d3.select('#timeline .steering');

    window.addEventListener('gamepadconnected', GPO.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', GPO.onGamepadConnected);
  }
};

window.addEventListener('DOMContentLoaded', GPO.main);

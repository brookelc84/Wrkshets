/* Connect-the-dots pictures.
 * Each picture is one closed outline in a 100 x 100 box (y grows downward).
 * Points are listed in drawing order; the last point joins back to the first. */
(function (root) {
  var WS = (root.WS = root.WS || {});

  // Points along a circular arc. Angles in degrees, y-down (90 = straight down).
  function arc(cx, cy, r, fromDeg, toDeg, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var a = ((fromDeg + (toDeg - fromDeg) * (i / steps)) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  WS.SHAPES = {
    star: {
      label: "Star",
      points: function () {
        var pts = [];
        for (var i = 0; i < 10; i++) {
          var r = i % 2 === 0 ? 48 : 20;
          var a = ((-90 + i * 36) * Math.PI) / 180;
          pts.push([50 + r * Math.cos(a), 52 + r * Math.sin(a)]);
        }
        return pts;
      }
    },
    heart: {
      label: "Heart",
      points: function () {
        var pts = [];
        for (var i = 0; i < 18; i++) {
          var t = (i / 18) * 2 * Math.PI;
          var x = 16 * Math.pow(Math.sin(t), 3);
          var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
          pts.push([50 + x * 2.8, 45 - y * 2.8]);
        }
        return pts;
      }
    },
    house: {
      label: "House",
      points: function () {
        return [[20, 92], [20, 50], [8, 50], [50, 12], [62, 23], [62, 12], [72, 12], [72, 32],
          [92, 50], [80, 50], [80, 92], [58, 92], [58, 68], [42, 68], [42, 92]];
      }
    },
    fish: {
      label: "Fish",
      points: function () {
        return [[8, 50], [18, 38], [33, 30], [50, 28], [64, 32], [75, 42], [92, 26], [86, 50],
          [92, 74], [75, 58], [64, 68], [50, 72], [33, 70], [18, 62]];
      }
    },
    sailboat: {
      label: "Sailboat",
      points: function () {
        return [[50, 6], [84, 62], [53, 62], [53, 70], [92, 70], [78, 90], [22, 90], [8, 70],
          [47, 70], [47, 62], [16, 62]];
      }
    },
    tree: {
      label: "Pine Tree",
      points: function () {
        return [[50, 5], [66, 26], [58, 26], [76, 47], [66, 47], [86, 72], [56, 72], [56, 93],
          [44, 93], [44, 72], [14, 72], [34, 47], [24, 47], [42, 26], [34, 26]];
      }
    },
    mug: {
      label: "Mug",
      points: function () {
        return [[14, 20], [70, 20], [70, 30], [82, 30], [91, 40], [91, 56], [82, 66], [70, 66],
          [70, 82], [62, 90], [22, 90], [14, 82]];
      }
    },
    apple: {
      label: "Apple",
      points: function () {
        return [[47, 26], [42, 5], [52, 5], [54, 24], [62, 20], [76, 22], [86, 34], [88, 52],
          [82, 70], [70, 86], [58, 90], [50, 86], [42, 90], [30, 86], [18, 70], [12, 52],
          [14, 34], [24, 22], [38, 20]];
      }
    },
    gem: {
      label: "Gem",
      points: function () {
        return [[30, 15], [50, 15], [70, 15], [90, 35], [70, 62], [50, 90], [30, 62], [10, 35]];
      }
    },
    moon: {
      label: "Moon",
      points: function () {
        // Outer edge runs round the left side; inner edge comes back up.
        var outer = arc(50, 50, 42, -70, -290, 10);
        var inner = arc(72, 50, 40.2, 100.9, 259.1, 7).slice(1, -1);
        return outer.concat(inner);
      }
    },
    bulb: {
      label: "Light Bulb",
      points: function () {
        return arc(50, 38, 30, 120, 420, 12).concat(
          [[62, 74], [62, 88], [56, 94], [44, 94], [38, 88], [38, 74]]);
      }
    },
    cat: {
      label: "Cat",
      points: function () {
        return [[12, 60], [14, 34], [18, 8], [38, 24], [62, 24], [82, 8], [86, 34], [88, 60],
          [80, 82], [65, 92], [35, 92], [20, 82]];
      }
    },
    bell: {
      label: "Bell",
      points: function () {
        return [[43, 18], [43, 6], [57, 6], [57, 18], [66, 24], [74, 40], [76, 62], [88, 78],
          [60, 78], [58, 86], [50, 90], [42, 86], [40, 78], [12, 78], [24, 62], [26, 40], [34, 24]];
      }
    },
    car: {
      label: "Car",
      points: function () {
        return [[5, 70], [5, 55], [20, 50], [32, 32], [68, 32], [82, 50], [95, 55], [95, 70]]
          .concat(arc(75, 70, 10, 0, -180, 4))
          .concat(arc(25, 70, 10, 0, -180, 4));
      }
    },
    umbrella: {
      label: "Umbrella",
      points: function () {
        return arc(50, 50, 42, 180, 360, 8).concat([
          [78, 45], [66, 50], [60, 45], [54, 50], [54, 86], [46, 95], [34, 90], [34, 82],
          [41, 82], [41, 86], [46, 87], [48, 82], [48, 50], [40, 45], [34, 50], [22, 45]]);
      }
    }
  };
})(typeof window !== "undefined" ? window : globalThis);

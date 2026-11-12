// VI-003: pass 3 on the same photo. New decisions, not just better shapes:
// tighter crop (horizon leaves the frame), at most eight masses, three values, five colors.
VI.scenes["VI-003"] = {
  id: "VI-003", pass: 3, prev: "VI-002",
  title: "A kitchen in an L (pass 3: simpler, closer)",
  source: "private/VI-001.jpg", size: [1512, 2016],
  nice: [
    "The L of counter and the white stove are the whole story; the upper cabinets only repeat it.",
    "Cream against dark walnut is the strongest value jump in the photo.",
    "Mustard tiles are the only warm accent, so they can be the 'spark'."
  ],
  crop: { x: 140, y: 550, w: 1372, h: 1000, why: "Closer: cuts the upper cabinets, the green post and the screen. The stove now sits on the lower-left third." },
  contrast: { x: 610, y: 1200, why: "The stove, once more: white on the dark floor, now with nothing competing above it." },
  horizon: { y: 490, how: "Eye level is still the same line from pass 1, but it now falls above the crop. When the horizon leaves the frame, say so: the counters read as planes seen from above." },
  vp: [110, 490],
  receding: [[[1285, 1340], [800, 990]], [[1500, 800], [955, 680]]],
  moves: ["Step in and lower the phone slightly so the stove sits low in the frame.", "Hold the phone level.", "Wait for the screen to be out of the shot, or let the crop remove it."],
  vision: "The stove and the L: a white box and a bright counter on dark wood. Everything above is a quiet cream strip.",
  leftOut: ["Upper cabinets, pan and doors (cropped)", "Green post and dark left edge", "The screen, tile detail, reflections and knobs on the wall"],
  notes: {
    "1": "Tighter crop. The horizon (red) is above it, so the frame is full of tilted planes.",
    "2a": "Wall and floor only. The horizon is above the picture; the note says so.",
    "2b": "Eight masses at most (five to eight rule). The bar is one dark block again, on purpose.",
    "2c": "Anchors: stove (A), right counter top (B), backsplash (C).",
    "3a": "Burners, oven, drawer, knobs and two tile patches only.",
    "3b": "The cream counter face and the bar top overlap the dark block.",
    "3c": "Stove 1; counters and bar top 2; cabinets 3; tiles and knobs 4; screen and left edge 5.",
    "4": "Fewer lines than pass 2. The stove and counter edges carry the picture.",
    "5a": "Three values only (dark, mid, light): easier to see the shapes.",
    "5b": "Five colors: cream, walnut, slate, dark slate, mustard.",
    "6a": "Round dots.", "6b": "Octagon dots.", "6c": "Triangle facets.", "6d": "Lines only."
  },
  layers: [
    { id: "wall", name: "Back wall", step: 2, group: "plane", type: "rect", g: [0, 0, 1512, 1400], priority: 4, value: 2, color: "#8d93a1" },
    { id: "floor", name: "Floor", step: 2, group: "plane", type: "poly", g: [[160, 1320], [470, 1388], [790, 1388], [985, 1930], [230, 2016]], priority: 4, value: 0, color: "#3b3d44" },
    { id: "upper", name: "Cabinet strip", step: 2, group: "mass", type: "rect", g: [140, 550, 860, 118], priority: 4, value: 4, color: "#ece6d2" },
    { id: "screen", name: "Screen", step: 2, group: "mass", type: "rect", g: [1118, 550, 380, 160], priority: 5, value: 4, color: "#ece6d2" },
    { id: "splash", name: "Metal backsplash", step: 2, group: "mass", type: "rect", g: [80, 668, 830, 262], priority: 3, value: 2, color: "#8d93a1", anchor: "C" },
    { id: "bar", name: "Bar block", step: 2, group: "mass", type: "poly", g: [[955, 680], [1512, 800], [1512, 1850], [985, 1930], [1010, 1385], [900, 1000]], priority: 3, value: 0, color: "#5a331e" },
    { id: "leftcab", name: "Left cabinet", step: 2, group: "mass", type: "rect", g: [295, 1035, 175, 345], priority: 3, value: 4, color: "#ece6d2" },
    { id: "topL", name: "Left counter top", step: 2, group: "mass", type: "poly", g: [[120, 930], [760, 918], [795, 990], [120, 1010]], priority: 2, value: 2, color: "#8d93a1" },
    { id: "topR", name: "Right counter top", step: 2, group: "mass", type: "poly", g: [[795, 992], [1090, 990], [1285, 1335], [1010, 1385]], priority: 2, value: 2, color: "#8d93a1", anchor: "B" },
    { id: "stove", name: "Stove", step: 2, group: "mass", type: "rect", g: [470, 1030, 290, 360], priority: 1, value: 4, color: "#ece6d2", anchor: "A" },
    { id: "burnL", name: "Burner (left)", step: 3, group: "secondary", type: "oval", g: [545, 958, 55, 22], priority: 2, value: 0, color: "#3b3d44" },
    { id: "burnR", name: "Burner (right)", step: 3, group: "secondary", type: "oval", g: [675, 958, 55, 22], priority: 2, value: 0, color: "#3b3d44" },
    { id: "oven", name: "Oven door", step: 3, group: "secondary", type: "rect", g: [510, 1060, 210, 140], priority: 2, value: 4, color: "#ece6d2" },
    { id: "drawer", name: "Drawer", step: 3, group: "secondary", type: "rect", g: [480, 1215, 275, 170], priority: 3, value: 4, color: "#ece6d2" },
    { id: "k1", name: "Knob 1", step: 3, group: "secondary", type: "circle", g: [545, 1040, 14], priority: 4, value: 2, color: "#8d93a1" },
    { id: "k2", name: "Knob 2", step: 3, group: "secondary", type: "circle", g: [615, 1040, 14], priority: 4, value: 2, color: "#8d93a1" },
    { id: "k3", name: "Knob 3", step: 3, group: "secondary", type: "circle", g: [685, 1038, 14], priority: 4, value: 2, color: "#8d93a1" },
    { id: "tileL", name: "Tile patch (left)", step: 3, group: "secondary", type: "rect", g: [110, 935, 305, 70], priority: 4, value: 2, color: "#d6a64a" },
    { id: "tileR", name: "Tile patch (right)", step: 3, group: "secondary", type: "poly", g: [[825, 992], [1090, 988], [1185, 1290], [1000, 1305]], priority: 4, value: 2, color: "#d6a64a" },
    { id: "face", name: "Cream counter face", step: 3, group: "overlap", type: "poly", g: [[800, 1000], [1010, 1385], [985, 1900], [930, 1830], [800, 1100]], priority: 3, value: 4, color: "#ece6d2" },
    { id: "lip", name: "Bar top", step: 3, group: "overlap", type: "poly", g: [[955, 680], [1512, 800], [1512, 845], [960, 735]], priority: 2, value: 0, color: "#5a331e" }
  ]
};

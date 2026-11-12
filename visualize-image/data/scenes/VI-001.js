// VI-001: a museum kitchen in an L. Coordinates are pixels of the original photo (1512 x 2016).
// Layers run back to front. g: rect [x,y,w,h] · poly [[x,y],...] · oval [cx,cy,rx,ry] · circle [cx,cy,r]
// group: plane | mass | secondary | overlap. priority 1 (cannot live without) to 5 (left back). value 0 dark to 4 light.
VI.scenes["VI-001"] = {
  id: "VI-001",
  title: "A kitchen in an L",
  labelIds: ["stove", "upper", "barD", "floor", "wall"],
  source: "private/VI-001.jpg",
  size: [1512, 2016],
  nice: [
    "Cream boxes against a dark walnut and a gray floor: the light shapes pop.",
    "One strong L of countertop leads the eye from the front corner back to the stove.",
    "Three accent colors (mustard, green, brick) repeat in small doses."
  ],
  crop: { x: 0, y: 30, w: 1512, h: 1620,
    why: "Keeps the whole L and the stove on the lower-left third crossing, and drops the rope and posts in the foreground." },
  contrast: { x: 610, y: 1200, why: "The white stove sits on the darkest floor and the brightest wall of the picture: the sweetest contrast." },
  horizon: { y: 490, how: "Extend two receding edges (the counter edge and the bar top). They meet at the left, about level with the upper shelf. That is eye level." },
  vp: [110, 490],
  receding: [[[1285, 1340], [800, 990]], [[1500, 800], [955, 680]]],
  moves: [
    "Step a little left so the green post leaves the frame.",
    "Hold the phone level: the tall edges lean a little.",
    "Move the screen on the right out of the shot, or step so the bar hides it."
  ],
  vision: "A calm corner built on one L: cream boxes on a dark floor, with the white stove as the bright heart.",
  leftOut: [
    "The screen on the right (a picture inside the picture)",
    "The tile pattern detail (kept only as mustard and brick patches)",
    "Reflections, scuffs and the small knobs on the wall"
  ],
  notes: {
    "1": "Crop, thirds, horizon (dashed) and the two receding edges that find it.",
    "2a": "Wall and floor first. The horizon sits high, so the floor is a big, dark shape.",
    "2b": "Eleven shapes, back to front. More than the five to eight the process asks for. Squint: it still reads as a kitchen.",
    "2c": "Three anchors: upper cabinets (A), stove (B), right counter top (C).",
    "3a": "Pan, doors, burners and knobs, each placed against an anchor.",
    "3b": "The cream counter face and the bar top overlap what is behind them.",
    "3c": "Stove is 1. Counters 2. Cabinets and pan 3. Tiles 4. Screen 5.",
    "4": "Thick for the stove and counters, thin for details. The screen is gone.",
    "5a": "Five grays, flat. Darkest: walnut and the left edge. Lightest: stove and cream.",
    "5b": "Mustard, green, brick and walnut on the same value blocks.",
    "6a": "Round dots: size follows darkness.",
    "6b": "Octagon dots: same idea with eight sides.",
    "6c": "Facets: triangles filled with the color under their middle.",
    "6d": "Lines only: thicker where it is darker."
  },
  layers: [
    // step 2: planes
    { id: "wall", name: "Back wall", step: 2, group: "plane", type: "rect", g: [0, 0, 1512, 1400], priority: 4, value: 3, color: "#8d93a1" },
    { id: "floor", name: "Floor", step: 2, group: "plane", type: "poly", g: [[150, 1300], [800, 1385], [1010, 1700], [190, 1700]], priority: 4, value: 1, color: "#5b5d63" },
    // step 2: masses
    { id: "yellow", name: "Yellow back panel", step: 2, group: "mass", type: "rect", g: [230, 55, 910, 620], priority: 4, value: 2, color: "#d9a21f" },
    { id: "screen", name: "Screen", step: 2, group: "mass", type: "rect", g: [1118, 405, 380, 305], priority: 5, value: 4, color: "#e8a64a" },
    { id: "splash", name: "Metal backsplash", step: 2, group: "mass", type: "rect", g: [80, 670, 830, 260], priority: 4, value: 3, color: "#a8a29a" },
    { id: "upper", name: "Upper cabinets", step: 2, group: "mass", type: "rect", g: [260, 100, 730, 570], priority: 3, value: 4, color: "#ece6d2", anchor: "A" },
    { id: "bar", name: "Bar block", step: 2, group: "mass", type: "poly", g: [[955, 680], [1512, 800], [1512, 1850], [985, 1930], [1005, 1385], [900, 1000]], priority: 3, value: 0, color: "#5a331e" },
    { id: "leftcab", name: "Left cabinet", step: 2, group: "mass", type: "rect", g: [295, 1035, 175, 345], priority: 3, value: 4, color: "#ece6d2" },
    { id: "topL", name: "Left counter top", step: 2, group: "mass", type: "poly", g: [[110, 930], [760, 920], [800, 995], [120, 1010]], priority: 2, value: 3, color: "#a8a29a" },
    { id: "topR", name: "Right counter top", step: 2, group: "mass", type: "poly", g: [[795, 992], [1090, 990], [1285, 1335], [1010, 1385]], priority: 2, value: 3, color: "#a8a29a", anchor: "C" },
    { id: "stove", name: "Stove", step: 2, group: "mass", type: "rect", g: [470, 1030, 290, 360], priority: 1, value: 4, color: "#eceeef", anchor: "B" },
    { id: "green", name: "Green post", step: 2, group: "mass", type: "poly", g: [[0, 0], [250, 60], [270, 290], [160, 330], [150, 1300], [230, 2016], [0, 2016]], priority: 4, value: 2, color: "#6fb04a" },
    { id: "dark", name: "Dark left edge", step: 2, group: "mass", type: "poly", g: [[0, 300], [60, 1100], [130, 2016], [0, 2016]], priority: 4, value: 0, color: "#1b1f1e" },
    // step 3: secondary figures
    { id: "doorL", name: "Cabinet door (left)", step: 3, group: "secondary", type: "rect", g: [275, 125, 360, 170], priority: 3, value: 4, color: "#f3efe2" },
    { id: "doorR", name: "Cabinet door (right)", step: 3, group: "secondary", type: "rect", g: [640, 140, 335, 160], priority: 3, value: 4, color: "#f3efe2" },
    { id: "pan", name: "Pan", step: 3, group: "secondary", type: "oval", g: [755, 410, 80, 70], priority: 3, value: 2, color: "#9aa0a6" },
    { id: "panh", name: "Pan handle", step: 3, group: "secondary", type: "rect", g: [750, 470, 30, 150], priority: 3, value: 1, color: "#6b3a2a" },
    { id: "burnL", name: "Burner (left)", step: 3, group: "secondary", type: "oval", g: [545, 958, 55, 22], priority: 2, value: 0, color: "#1b1b1b" },
    { id: "burnR", name: "Burner (right)", step: 3, group: "secondary", type: "oval", g: [675, 958, 55, 22], priority: 2, value: 0, color: "#1b1b1b" },
    { id: "oven", name: "Oven door", step: 3, group: "secondary", type: "rect", g: [510, 1060, 210, 140], priority: 2, value: 4, color: "#f4f6f6" },
    { id: "drawer", name: "Drawer", step: 3, group: "secondary", type: "rect", g: [480, 1215, 275, 170], priority: 3, value: 4, color: "#f4f6f6" },
    { id: "k1", name: "Knob 1", step: 3, group: "secondary", type: "circle", g: [545, 1040, 14], priority: 4, value: 3, color: "#c9ccd0" },
    { id: "k2", name: "Knob 2", step: 3, group: "secondary", type: "circle", g: [615, 1040, 14], priority: 4, value: 3, color: "#c9ccd0" },
    { id: "k3", name: "Knob 3", step: 3, group: "secondary", type: "circle", g: [685, 1038, 14], priority: 4, value: 3, color: "#c9ccd0" },
    { id: "tileL", name: "Tile patch (left)", step: 3, group: "secondary", type: "rect", g: [110, 935, 305, 70], priority: 4, value: 2, color: "#d6a64a" },
    { id: "tileR", name: "Tile patch (right)", step: 3, group: "secondary", type: "poly", g: [[825, 992], [1090, 988], [1185, 1290], [1000, 1305]], priority: 4, value: 2, color: "#c9863a" },
    // step 3: overlapping figures
    { id: "face", name: "Cream counter face", step: 3, group: "overlap", type: "poly", g: [[800, 1000], [1010, 1385], [985, 1900], [930, 1830], [800, 1100]], priority: 3, value: 4, color: "#ece6d2" },
    { id: "lip", name: "Bar top", step: 3, group: "overlap", type: "poly", g: [[955, 680], [1512, 800], [1512, 850], [960, 735]], priority: 2, value: 0, color: "#3b2515" }
  ]
};

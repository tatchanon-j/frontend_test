var ScaleColors = {}

// set dam scale color
ScaleColors.Dam = [];
ScaleColors.Dam[0] = "#FFC000"; // <= 30
ScaleColors.Dam[1] = "#00B050"; // > 30 - 50
ScaleColors.Dam[2] = "#003CFA"; // > 50 - 80
ScaleColors.Dam[3] = "#FF0000"; // > 80 - 100
ScaleColors.Dam[4] = "#C70000"; // > 100
// ScaleColors.Dam = {};
// ScaleColors.Dam["orange"] = "#FFC000"; // <= 30
// ScaleColors.Dam["green"] = "#00B050"; // > 30 - 50
// ScaleColors.Dam["blue"] = "#003CFA"; // > 50 - 80
// ScaleColors.Dam["red"] = "#FF0000"; // > 80 - 100
// ScaleColors.Dam["darkred"] = "#C70000"; // > 100

// set waterlevel scale color
ScaleColors.WaterLevel = {};
ScaleColors.WaterLevel["darkorange"] = "#DB802B"; // <= 10
ScaleColors.WaterLevel["orange"] = "#FFC000"; // > 10 - 30
ScaleColors.WaterLevel["green"] = "#00B050"; // > 30 - 70
ScaleColors.WaterLevel["blue"] = "#003CFA"; // > 70 - 100
ScaleColors.WaterLevel["red"] = "#FF0000"; // > 100

// set rain scale color
ScaleColors.Rain = {};
ScaleColors.Rain["blue"] = "#A9D1FC"; // > 0 - 10
ScaleColors.Rain["lightgreen"] = "#9CEEB2"; // > 10 - 20
ScaleColors.Rain["green"] = "#66C803"; // > 20 - 35
ScaleColors.Rain["yellow"] = "#F6D300"; // > 35 - 50
ScaleColors.Rain["orange"] = "#FE8A04"; // > 50 - 70
ScaleColors.Rain["brown"] = "#CA6504"; // 70 - 90
ScaleColors.Rain["red"] = "#EE141F"; // > 90

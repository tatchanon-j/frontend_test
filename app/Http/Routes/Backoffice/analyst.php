<?php
/** Route for Analyst Module **/
// by thitiporn
Route::get('/analyst', 'Backoffice\AnalystController@index');
Route::get('/analyst/dam', 'Backoffice\AnalystController@analystDam');

//Dam by peerapong
Route::get('/analyst/iframe/graph/dam', 'Backoffice\AnalystController@graphDam');

// Rain by Werawan
Route::get('/analyst/rain', 'Backoffice\AnalystController@rain');
Route::get('/analyst/iframe/graph/rain', 'Backoffice\AnalystController@graphRain');

// Waterlevel by Werawan
Route::get('/analyst/waterlevel', 'Backoffice\AnalystController@waterlevel');
Route::get('/analyst/iframe/graph/waterlevel', 'Backoffice\AnalystController@graphWaterlevel');

// Waterquality by Peerapong
Route::get('/analyst/water_quality', 'Backoffice\AnalystController@waterQuality');
Route::get('/analyst/iframe/graph/waterquality', 'Backoffice\AnalystController@graphWaterQuality');

// "Weather" by Peerapong
Route::get('/analyst/weather', 'Backoffice\AnalystController@weather');
?>

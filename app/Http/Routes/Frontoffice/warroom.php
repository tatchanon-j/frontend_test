<?php
/*
 * |--------------------------------------------------------------------------
 * | Application Routes
 * |--------------------------------------------------------------------------
 * |
 * | Here is where you can register all of the routes for an application.
 * | It's a breeze. Simply tell Laravel the URIs it should respond to
 * | and give it the controller to call when that URI is requested.
 * |
 */

Route::get('/warroom', 'Frontoffice\WarroomController@home');
Route::get('/warroom/main', 'Frontoffice\WarroomController@main');
Route::get('/warroom/home_night', 'Frontoffice\WarroomController@homeNight');
Route::get('/warroom/storm_ex', 'Frontoffice\WarroomController@stormEx');
Route::get('/warroom/storm', 'Frontoffice\WarroomController@storm');
// svg d3 experiment.
Route::get('/warroom/cpy', 'Frontoffice\ExSvgController@cpy');
Route::get('/warroom/cpy/data', 'Frontoffice\ExSvgController@cpyDatas');

// dam by thitiporn
Route::get('/warroom/dam', 'Frontoffice\WarroomController@dam');
Route::get('/warroom/dam_vue', 'Frontoffice\WarroomController@damVue');

// salinity by thitiporn
Route::get('/warroom/salinity', 'Frontoffice\WarroomController@salinity');

Route::get('/warroom/swan', 'Frontoffice\ExSvgController@swan');
Route::get('/warroom/swan/data', 'Frontoffice\ExSvgController@swanDatas');

Route::get('/warroom/rainfall24h', 'Frontoffice\WarroomController@rainfall24h');
Route::get('/warroom/rainfall24h/home', 'Frontoffice\WarroomController@rainfall24hHome');

// water level
Route::get('/warroom/waterlevel', 'Frontoffice\WarroomController@waterlevel');
Route::get('/warroom/waterlevel/home', 'Frontoffice\WarroomController@waterlevelHome');

// rain wrf
Route::get('/warroom/rain', 'Frontoffice\WarroomController@rain');


// dam_home 
Route::get('/warroom/dam/home', 'Frontoffice\WarroomController@damHome');
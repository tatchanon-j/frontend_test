<?php
/** Route for dashboard **/
Route::get('/dashboard', 'Backoffice\DashboardController@index');
Route::get('/dashboard', 'Backoffice\DashboardController@dashboard');

<?php
/** Route for Manipulate Module **/
Route::get('/metadata', 'Backoffice\MetadataController@index');
Route::get('/metadata/metadata', 'Backoffice\MetadataController@metadata');
Route::get('/metadata/metadata_b', 'Backoffice\MetadataController@metadata_b');
Route::get('/metadata/category', 'Backoffice\MetadataController@category');
Route::get('/metadata/subcat', 'Backoffice\MetadataController@subcat');
Route::get('/metadata/unit', 'Backoffice\MetadataController@unit');
Route::get('/metadata/frequency', 'Backoffice\MetadataController@frequency');
Route::get('/metadata/agency', 'Backoffice\MetadataController@agency');
Route::get('/metadata/department', 'Backoffice\MetadataController@department');
Route::get('/metadata/ministry', 'Backoffice\MetadataController@ministry');
Route::get('/metadata/service_method', 'Backoffice\MetadataController@service_method');
Route::get('/metadata/summary_meta', 'Backoffice\MetadataController@summary_meta');
Route::get('/metadata/hydroinfo', 'Backoffice\MetadataController@hydroinfo');
Route::get('/metadata/method', 'Backoffice\MetadataController@method');
Route::get('/metadata/data_format', 'Backoffice\MetadataController@data_format');
Route::get('/metadata/metadata_status', 'Backoffice\MetadataController@metadata_status');

// ระบบที่นำข้อูลไปแสดงผล
Route::get('/metadata/metadata_show', 'Backoffice\MetadataController@metadata_show');

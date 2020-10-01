/**
 *Return "" replace null when there is no data.
 *
 *@param {json} source data
 *@param {text} key tag json name
*/
function GetJsonValue(source , key){
    var str = "";
    if ( key in source && source ){
        str = source[key];
    }
    return str;
}

/**
 *Return 0 replace null when there is no data.
 *
 *@param {json} source data
 *@param {text} key tag json name
*/
function GetJsonValueInt(source , key){
    var v = GetJsonValue(source , key);
    if (v == "") { return 0; }
    return v;
}

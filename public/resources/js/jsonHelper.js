/**
*
*   Json Helper Object for handler json.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var JH = {};
JH["cache"] = {};
JH["Language"] = {
    locales: []
};

/**
*   set value into cache
*   @param {mix} key - cache name
*   @param {mix} value - ค่าที่ต้องการเก็บ
*/
JH.Set = function(key , value ){
    JH.SetJsonValue(JH["cache"], key, value);
}

/**
*   get value from cache
*   @param {mix} key - cache name
*   @return {mix} value from cache
*/
JH.Get = function(key){
    if (!key) { console.error('invalid key'); return ""; }
    return JH.GetJsonValue(JH["cache"], key);
}

/**
*   set current,fallback, all language language
*   @param {string} lang - ภาษาหลัก
*   @param {string} fallback - ภาษาสำรองในกรณีที่ภาษาหลักไม่มี
*   @param {string} locales - ภาษาทั้งหมดที่รองรับ
*/
JH.SetLang = function(lang, fallback, locales){
    if (arguments.length == 0) { return false; }
    var language = [];
    if ( typeof lang !== 'undefined' ){
        JH["Language"]["default"] = lang;
        language.push(lang);
    }
    if ( typeof fallback !== 'undefined' ){
        JH["Language"]["fallback"] = fallback;
        language.push(fallback);
    }
    if ( typeof locales !== 'undefined' ){
        language = language.concat(locales);
    }
    JH["Language"]["locales"] = $.unique( language );
}

/**
*   @return {string} ภาษาที่ใช้อยู่
*/
JH.GetLang = function(){
    return JH.GetJsonValue(JH["Language"] , "default");
}

/**
*   @return {array} ภาษาทั้งหมดที่รองรับ
*/
JH.GetLocales = function(){
    return JH.GetJsonValue(JH["Language"] , "locales");
}

/**
*   set value into json
*   @param {object} source - object ที่เก็บค่า
*   @param {string} key - key ที่ต้องการเก็บ
*   @param {string} value - value ที่ต้องการเก็บ
*
*   ex.
*   a = { name:{th: 'th', en: 'en'}, value: 100}
*   JH.SetJsonValue(a, 'zxc', 100)  # { name:{th: 'th', en: 'en'}, value: 100, zxc: 100}
*/
JH.SetJsonValue = function(source, key, value){
    if (typeof key === "number") { key = key.toString(); }
    var ks = key.split(".");
    if (ks.length == 1) {
        source[ks] = value;
        return source;
    }else{
        if ( !JH.GetJsonValue(source, ks[0]) ){ source[ks[0]] = {}; }
        source[ks[0]] = JH.SetJsonValue(source[ks[0]], ks.splice(1, ks.length - 1).join('.'), value);
        return source;
    }
}

/**
*   get json value
*   @param {object} source - object ที่เก็บค่า
*   @param {string} key - key ที่ต้องการดึง
*   @param {string} defaultvalue - ค่าสำรอง ถ้าไม่มี key
*   @return {mix} ค่า source[key]
*
*   ex.
*   a = { name:{th: 'th', en: 'en'}, value: 100}
*   JH.GetJsonValue(a, 'value')       # 100
*   JH.GetJsonValue(a, 'zxc')         # ''
*   JH.GetJsonValue(a, 'zxc', 100)    # 100
*/
JH.GetJsonValue = function(source , key , defaultvalue){
    var _defaultvalue = "";
    if (typeof defaultvalue !== "undefined"){ _defaultvalue = defaultvalue; }
    if (typeof source !== "object" || source == null) { return _defaultvalue ;}
    if (typeof key === "number") { key = key.toString(); }
    var ks = key.split(".");
    var rs = source;
    for( var i = 0 ; i < ks.length ; i++){
        var r = rs[ks[i]];
        if ( r === "undefined" ){
            return _defaultvalue;
        }
        if ( r == null ){
            return _defaultvalue;
        }
        rs = r;
    }
    return rs;
}

/**
*   get json value as int  "empty -> 0"
*   @param {object} source - object ที่เก็บค่า
*   @param {string} key - key ที่ต้องการดึง
*   @param {string} defaultvalue - ค่าสำรอง ถ้าไม่มี key
*   @return {mix} ค่า parseInt(source[key])
*
*   ex.
*   a = { name:{th: 'th', en: 'en'}, value: 100}
*   JH.GetJsonValue_Int(a, 'value')       # 100
*   JH.GetJsonValue_Int(a, 'zxc')         # 0
*   JH.GetJsonValue_Int(a, 'zxc', 100)    # 100
*/
JH.GetJsonValue_Int = function(source , key , defaultvalue){
    var str = JH.GetJsonValue(source , key);
    var _defaultvalue = 0;
    if (typeof defaultvalue !== "undefined"){ _defaultvalue = defaultvalue; }
    // if ( str === "undefined" || str == null || str === "" ){ return _defaultvalue; }
    return isNaN(parseInt(str)) ? _defaultvalue : parseInt(str);
}

/**
*   get json value as float  "empty -> 0"
*   @param {object} source - object ที่เก็บค่า
*   @param {string} key - key ที่ต้องการดึง
*   @param {string} defaultvalue - ค่าสำรอง ถ้าไม่มี key
*   @return {mix} ค่า parseFloat(source[key])
*
*   ex.
*   a = { name:{th: 'th', en: 'en'}, value: 100}
*   JH.GetJsonValue_Float(a, 'value')       # 100
*   JH.GetJsonValue_Float(a, 'zxc')         # 0
*   JH.GetJsonValue_Float(a, 'zxc', 100)    # 100
*/
JH.GetJsonValue_Float = function(source , key , defaultvalue){
    var str = JH.GetJsonValue(source , key);
    var _defaultvalue = 0;
    if (typeof defaultvalue !== "undefined"){ _defaultvalue = defaultvalue; }
    // if ( str === "undefined" || str == null || str === "" ){ return _defaultvalue; }
    return isNaN(parseFloat(str)) ? _defaultvalue : parseFloat(str);
}

/**
*   get json value ตามภาษาที่ใช้
*   @param {object} source - object ที่เก็บค่า
*   @param {string} key - key ที่ต้องการดึง
*   @param {bool} isAll - ต้องการให้หาภาษาอื่น ถ้าภาษาที่ใช้อยู่ไม่มี
*   @return {mix} ค่า source[key][lang]
*
*   ex.
*   a = { name:{th: 'th', en: 'en'}, value: 100}
*   JH.GetJsonLangValue(a, 'name')  # 'th'
*/
JH.GetJsonLangValue = function(source , key, isAll){
    var lang = JH.GetLang();
    var text = "";
    var str = JH.GetJsonValue(source , key);
    var _isAll = true;
    if ( typeof isAll !== 'undefined' ){
        _isAll = isAll;
    }
    if (typeof str !== "object") { return str; }
    if (_isAll){
        text = JH.GetLangValue(str);
    }else{
        text = JH.GetJsonValue(str, lang);
    }
    return text;
}

/**
*   get json value ตามภาษาที่ใช้
*   @param {object} source - object ที่เก็บภาษา
*   @return {mix} ค่า source[lang]
*
*   ex.
*   a = {th: 'th', en: 'en'}
*   JH.GetLangValue(a)  # 'th'
*/
JH.GetLangValue = function(source){
    var text = "";
    var locales = JH.GetLocales();
    var i = 0;
    while ( text.trim().length == 0 && i < locales.length) {
        text = JH.GetJsonValue(source, locales[i]);
        i++;
    }
    return text
}

/**
*   sort json array
*   @param {array} array - array object
*   @param {string|array} field - sort โดยดูจาก key ไหน
*   @param {bool|array} reverse - ต้องการให้เป็น DESC
*   @param {function} primer - ฟังค์ชั่นเพิ่มเติม
*
*   ex.
*   a = [{id:3},{id:2},{id:1},{id:4}]
*   JH.Sort(a, 'id')       # [{id:1},{id:2},{id:3},{id:4}]
*   JH.Sort(a, 'id', true) # [{id:4},{id:3},{id:2},{id:1}]
*/
JH.Sort = function(array, field, reverse, primer){
    array.sort(JH.sort_by(field, reverse, primer));
}

/**
*   flexible sort function
*   @param {string|array} field - sort โดยดูจาก key ไหน
*   @param {bool|array} reverse - ต้องการให้เป็น DESC
*   @param {function} primer - ฟังค์ชั่นเพิ่มเติม
*   @return {function} function สำหรับ sort
*/
JH.sort_by = function(field, reverse, primer){
    var key = primer ?
    // custom primer
    function(x) {
        if ( field.constructor === Array ){
            var arr = [];
            for (var i = 0 ; i < field.length ; i++){
                arr.push( primer[i]( JH.GetJsonValue(x, field[i] ) ));
            }
            return arr;
        } else {
            return primer(JH.GetJsonValue(x, field ));
        }
        // return primer(JH.GetJsonValue(x, field))
    } :
    // default primer
    function(x) {
        if ( field.constructor === Array ){
            var arr = [];
            for (var i = 0 ; i < field.length ; i++){
                arr.push( JH.GetJsonValue(x, field[i] ));
            }
            return arr;
        } else {
            return JH.GetJsonValue(x, field );
        }
    };

    if ( reverse ){
        if( reverse.constructor === Array ){
            for (var i = 0 ; i < reverse.length ; i++){
                reverse[i] = !reverse[i] ? 1 : -1;
            }
        }else{
            reverse = !reverse ? 1 : -1 ;
        }
    }else{
        reverse = !reverse ? 1 : -1;
    }

    return function (a, b) {
        var a = key(a), b = key(b);
        if ( a.constructor === Array ){
            for (var i = 0 ; i < a.length ; i++){
                if ( a[i] < b[i] ) return -1 *  reverse[i];
                if ( a[i] > b[i] ) return 1 *   reverse[i];
            }
            return 0;
        }else{
            return reverse *    ((a > b) - (b > a));
        }
    }
}

/**
*   Unique Array object ตาม key
*   @param {array} obj - array object
*   @param {mix} key - ค่าที่ใช้เช็ค
*   @return {array} array objecy ที่ ค่าของ key ไม่ซ้ำกัน
*
*   ex.
*   a = [{id:1},{id:1},{id:1},{id:2}]
*   JH.UniqueArray(a, 'id')
*   # [{id:1},{id:2}]
*/
JH.UniqueArray = function(obj, key){
    var n = {}, r=[];
    var oLen = obj.length;
    for(var i = 0; i < oLen ; i++)
    {
        var o = obj[i];
        var checkIndex = typeof o == "object" ? JH.GetJsonValue(o, key) : o;
        if (!n[checkIndex])
        {
            n[checkIndex] = true;
            r.push(o);
        }
    }
    return r;
}

/**
*   format date ถ้าเป็นภาษาไทย ปี + 543
*   @param {mix} date - date
*   @param {string} format - format
*   @return {mix} วันที่ ตาม format
*
*   ex.
*   JH.DateFormat("20170102", "YYYY-MM-DD")                    # 2017-01-02
*   same as moment("20170102").format("YYYY-MM-DD")
*   JH.DateFormat("2013-02-08 09:01:00", "YYYY-MM-DD HH:mm:ss") # 2013-02-08 09:01:00
*   same as moment("2013-02-08 09:01:00").format("YYYY-MM-DD HH:mm:ss")
*   read more https://momentjs.com/docs/
*/
JH.DateFormat = function(date, format){
    return JH.dateFormat(date, format, false);
}

/**
*   format utc date ถ้าเป็นภาษาไทย ปี + 543
*   @param {mix} date - date
*   @param {string} format - format
*   @return {mix} วันที่ utc ตาม format
*
*   ex.
*   JH.DateFormat("20170102", "YYYY-MM-DD")                    # 2017-01-02
*   same as moment.utc("20170102").format("YYYY-MM-DD")
*   JH.DateFormat("2013-02-08 09:01:00", "YYYY-MM-DD HH:mm:ss") # 2013-02-08 09:01:00
*   same as moment.utc("2013-02-08 09:01:00").format("YYYY-MM-DD HH:mm:ss")
*   read more https://momentjs.com/docs/
*/
JH.DateUtcFormat = function(date, format){
    return JH.dateFormat(date, format, true);
}

/**
*   format date ถ้าเป็นภาษาไทย ปี + 543
*   @param {mix} date - date
*   @param {string} format - format
*   @param {bool} isUtc - is utc ?
*   @return {mix} วันที่ utc ตาม format
*/
JH.dateFormat = function(date, format, isUtc){
    var _format = 'DD MMM YYYY HH:mm';
    var dt = null;
    if ( !date || date == ''){
        if ( isUtc ){
            dt = moment.utc();
        }else{
            dt = moment();
        }

    }else{
        if ( isUtc ){
            dt = moment.utc(date);
        }else{
            dt = moment(date);
        }
    }
    if ( JH.IsTH() ){ dt.add(543, 'years'); }
    if ( typeof format !== 'undefined' ){ _format = format; }
    return dt.format(_format);
}

/***
*   ภาษาที่ใช้อยู่เป็นภาษาไทย ?
*   @return {bool}
*/
JH.IsTH = function(){
    if ( JH.GetLang().toLowerCase() == "th" ){
        return true;
    }
    return false;
}

/***
*   เช็ค ค่า ไม่ใช่ null
*   @param {min} v - ค่าที่ต้องการเช็ค
*   @return {bool} true ถ้าไม่ใช่ null
*
*   ex.
*   JH.NotNull(1)       # true
*   JH.NotNull()        # false
*   JH.NotNull(null)    # false
*/
JH.NotNull = function(v){
    return !(v === undefined || v === null);
}

/***
*   เปรียบเทียบค่ากับตัว object
*   @param {object} source - object, array object
*   @param {mix} value - ค่าที่จะใช้เทียบ
*   @param {string} oper - เงื่อนไข
*   @param {mix} term - ค่าที่จะใช้เทียบ
*   @param {mix} term2 - ค่าที่จะใช้เทียบ
*   @return {mix} object ที่ถูกตามเงื่อนไข, null ถ้าไม่ถูกตามเงื่อนไข
*
*   ex.
*   var a = [{id:1},{id:2}];
*   JH.CompareObject(a, 1, '=', 'id')     # {id:1}
*   JH.CompareObject(a, 1, '>=', 'id')    # {id:1}
*   JH.CompareObject(a, 1, '>', 'id')     # null
*/
JH.CompareObject = function(source, value, oper, term){
    if ( arguments.length != 4){
        // arguments ต้องมี 4 ตัว
        return null;
    }
    if ( !JH.NotNull(source) || !JH.NotNull(value) || !JH.NotNull(oper) || !JH.NotNull(term) ) {
        // source, value, oper, term ต้องไม่ใช่ null
        return null;
    }
    if ( typeof source !== 'object' ){
        // source ต้องเป็น object, array object เท่านั้น
        return null;
    }
    if ( !source.length ){
        // ไม่ใช่ array Object
        if ( oper != 'between' ){
            return JH.Compare( value, oper, JH.GetJsonValue(source, term) );
        }else{
            return JH.Compare( value, oper, JH.GetJsonValue(source, 'term'), JH.GetJsonValue(source, 'term_2') );
        }
    }
    // array object
    for (var i = 0 ; i < source.length ; i++){
        var s = source[i];
        var b = false;
        if ( oper != 'between' ){
            b = JH.Compare( value, oper, JH.GetJsonValue(s, term) );
        }else{
            b = JH.Compare( value, oper, JH.GetJsonValue(s, 'term'), JH.GetJsonValue(s, 'term_2') );
        }
        if ( b ){
            // ค่าถูกต้องตามเงื่อนไข return object
            return s
        }
    }
    return null; // วนทุก object แล้วไม่มีอันไหนถูกเลย
}

/***
*   เปรียบเทียบค่า
*   @param {mix} value - ค่าที่จะใช้เทียบ
*   @param {string} oper - เงื่อนไข
*   @param {mix} term - ค่าที่จะใช้เทียบ
*   @param {mix} term2 - ค่าที่จะใช้เทียบ
*   @return {bool} true ถ้าตรงตามเงื่อนไข
*
*   ex.
*   JH.Compare(1, '=', 1)   # true
*   JH.Compare(1, '=', 2)   # false
*   JH.Compare(1, '!=', 2)  # true
*/
JH.Compare = function(value, oper, term, term2){
    var result = false;
    if ( arguments.length < 3){
        // arguments ต้องมีมากกว่า 3 ตัว
        return false;
    }
    if ( !JH.NotNull(value) || !JH.NotNull(oper) || !JH.NotNull(term)){
        // value, oper, term ต้องไม่ใช่ null
        return false;
    }
    switch (oper) {
        case ">":
        result = value > term;
        break;
        case ">=":
        result = value >= term;
        break;
        case "<":
        result = value < term;
        break;
        case "<=":
        result = value <= term;
        break;
        case "!=":
        result = value != term;
        break;
        case "=":
        result = value == term;
        break;
        case "between":
        if ( !JH.NotNull(term2) ){
            // term2 ต้องไม่ใช่ null
            return null;
        }
        result = value >= term && value <= term2
        break;
    }
    return result;
}

/***
*   แปลง query string ให้เป็น object
*   @param {string} qs - query string
*   @return {object} json
*
*   ex.
*   JH.QueryStringToJSON("?key1=value1&key2=value2&key3=value3")   # {key1: 'value1', key2: 'value2', key3: 'value3'}
*/
JH.QueryStringToJSON = function(qs){
    qs = qs.trim()
    if ( !qs ){ return {} }
    if ( qs[0] === '?' ){ qs = qs.substr(1) }
    return JSON.parse('{"' + decodeURI(qs.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
}

/**
 * The join() method joins the elements of an array into a string, and returns the string.
 * The elements will be separated by a specified separator. The default separator is comma (,).
 * @param {array} arr - array ที่ต้องการ join
 * @param {string} separator - ค่าที่จะมา join
 * @return {string} Join the elements of an array into a string
 * 
 * ex.
 * JH.ArrayJoin([1,2,3,4])          # "1,2,3,4"
 * JH.ArrayJoin([1,2,3,4], "|")     # "1|2|3|4"
 */
JH.ArrayJoin = function(arr, separator){
    if (Array.isArray(arr)){
        if (separator){
            return arr.join(separator);
        }else{
            return arr.join();
        }
    }
    return "";
}

modul.metadata["หน่วยงานระดับกรม"] = function(){
    var url = 'thaiwater30/backoffice/metadata/department';
    var ranStr = unittest.randomString(8);
    var param = {
        department_code: ranStr ,
        department_name:{th:ranStr, en:"", jp:""},
        id:"",
        ministry_id:"18",
        department_shortname:{th:"",en:"",jp:""}
    }

    describe('GET : ' + url, function(){
        var result;
        before(function(done){
            apiService.SendRequest("GET",url,{},function(){
                result = unittest.cb(done, arguments);
            },function(){
                result = unittest.cb(done, arguments);
            })
        })
        it('should return status code 200', function(done){
            result.jqXHR.status.should.equal(200);
            done();
        });
        it('should have property result', function(done){
            result.data.should.have.property('result');
            done();
        });
        it('should have property data', function(done){
            result.data.should.have.property('data');
            done();
        });
    });
    describe('POST : ' + url, function(){
        var result;
        before(function(done){
            apiService.SendRequest("POST",url,param,function(){
                result = unittest.cb(done, arguments);
                param = result.data;
            },function(){
                result = unittest.cb(done, arguments);
            });
        });
        it('should return status code 200', function(done){
            result.jqXHR.status.should.equal(200);
            done();
        });
        it('should have property result', function(done){
            result.data.should.have.property('result');
            done();
        });
    });
    describe('DELETE : ' + url, function(){
        var result;
        before(function(done){
            apiService.SendRequest("DELETE",url + '/' + param.data.id, {} ,function(){
                result = unittest.cb(done, arguments);
            },function(){
                result = unittest.cb(done, arguments);
            });
        });
        it('should return status code 200', function(done){
            result.jqXHR.status.should.equal(200);
            done();
        });
        it('should have property result', function(done){
            result.data.should.have.property('result');
            done();
        });
    });
}

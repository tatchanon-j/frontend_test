modul.metadata["บัญชีข้อมูล"] = function(){
    var url = 'thaiwater30/backoffice/metadata/metadata_load';
    describe('GET : ' + url, function(){
        var result;
        before(function(done){
            apiService.SendRequest("GET",url,{},function(){
                result = unittest.cb(done, arguments);
                // result = {
                //     data: arguments[0],
                //     textStatus: arguments[1],
                //     jqXHR: arguments[2],
                // }
                // done();
            },function(){
                result = unittest.cb(done, arguments);
            });
        });
        it('should return status code 200', function(done){
            result.jqXHR.status.should.equal(200);
            done();
        });
        it('should have property agency', function(done){
            result.data.should.have.property('agency');
            done();
        });
        it('should have property category', function(done){
            result.data.should.have.property('category');
            done();
        });
        it('should have property dataformat', function(done){
            result.data.should.have.property('dataformat');
            done();
        });
        it('should have property dataunit', function(done){
            result.data.should.have.property('dataunit');
            done();
        });
        it('should have property frequencyunit', function(done){
            result.data.should.have.property('frequencyunit');
            done();
        });
        it('should have property hydroinfo', function(done){
            result.data.should.have.property('hydroinfo');
            done();
        });
        it('should have property metadata', function(done){
            result.data.should.have.property('metadata');
            done();
        });
        it('should have property metadata_method', function(done){
            result.data.should.have.property('metadata_method');
            done();
        });
        it('should have property metadata_status', function(done){
            result.data.should.have.property('metadata_status');
            done();
        });
        it('should have property servicemethod', function(done){
            result.data.should.have.property('servicemethod');
            done();
        });
        it('should have property subcategory', function(done){
            result.data.should.have.property('subcategory');
            done();
        });
    });
};

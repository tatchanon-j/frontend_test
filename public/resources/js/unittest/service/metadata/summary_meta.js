modul.metadata["บัญชีข้อมูลที่เชื่อมโยง"] = function(){
    var url = 'thaiwater30/backoffice/metadata/summary_load';

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
        it('should have property agency', function(done){
            result.data["data"].should.have.property('agency');
            done();
        });
        it('should have property category', function(done){
            result.data["data"].should.have.property('category');
            done();
        });
        it('should have property metadata', function(done){
            result.data["data"].should.have.property('metadata');
            done();
        });
    });
}

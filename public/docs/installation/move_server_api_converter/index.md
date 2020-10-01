
# วิธีการแก้ไขและทดสอบในกรณีย้ายเครื่อง api2.thaiwater.net & converter.thaiwater.net

**ขั้นตอนการแก้ไข config และทดสอบ กรณีย้ายเครื่อง api2.thaiwater.net**

    ในตัวอย่างจะใช้ 
    api server ตัวใหม่ : 192.168.150.111 
    database ตัวใหม่ : 192.168.140.137  
    เป็นตัวอย่าง

**1. ตรวจสอบ git** แล้วทำการ git pull เพื่ออัพเดจ code ทั้งหมดที่เครื่อง api

**2. แก้ไข config connect database** 
ที่  /home/cim/haii-api-server/haii-api-server.conf เปิดไฟล์แก้ไขที่ 

	  export TW30_DB=postgres://thaiwater30:cnp2T%402559@master1.
	  thaiwater.net/thaiwater30?sslmode=disable

ตัวอย่างเช่น เปลี่ยนจาก master1.thaiwater.net เป็น 192.168.140.137

**3. Map drive จากเครื่อง archive.thaiwater.net**
ที่ /data/thaiwaterdata/ มาไว้ที่เครื่องใหม่ เช่น 192.168.150.111 ที่ /data/thaiwater/thaiwaterdata/ โดย api จะต้องใช้โฟล์เดอร์ /data/thaiwater/thaiwaterdata/data/serverstore เก็บ api doc

**4. ทำการ start service** โดยคำสั่ง ดังนี้

    * ตรวจสอบสถานะ : /home/cim/haii-api-server/haii-api-server status
    * Start service : /home/cim/haii-api-server/haii-api-server start
    * Stop service : /home/cim/haii-api-server/haii-api-server stop

**5. สามารถดู error log** ได้ที่ /home/cim/haii-api-server/log

**6. แก้ไขการเชื่อมโยงข้อมูล** 
เข้า database api ตาราง system_setting คอลัมน์ name=server.ServerURL แก้ไข value=http:// 192.168.150.111:9200

**7. ทดสอบ Api** 
ได้ที่ [http://192.168.150.111:9200](http://192.168.150.111:9200) 
ตัวอย่าง เช่น [http://192.168.150.111:9200/api/v1/mobile/MBtOTp6IUXbjaCxhQoFQNrFgZUCzNgbo/th/rainfall24h_latest](http://192.168.150.111:9200/api/v1/mobile/MBtOTp6IUXbjaCxhQoFQNrFgZUCzNgbo/th/rainfall24h_latest)
## 

**ขั้นตอนการแก้ไข config และ ทดสอบกรณีย้ายเครื่อง converter.thaiwater.net**

    ในตัวอย่างจะใช้ 
    api server ตัวใหม่ : 192.168.150.111 
    database ตัวใหม่ : 192.168.140.137  
    เป็นตัวอย่าง

**1. ตรวจสอบ git** แล้วทำการ git pull เพื่ออัพเดจ code ทั้งหมดที่เครื่อง api

**2. Map drive จากเครื่อง archive.thaiwater.net**
ที่ /data/thaiwaterdata/ มาไว้ที่เครื่องใหม่ เช่น 192.168.150.111 ที่ /data/thaiwater/thaiwaterdata/ โดย api จะต้องใช้โฟล์เดอร์ /data/thaiwater/thaiwaterdata/data/serverstore เก็บ api doc

**3.เปิด ftp และ sftp** ปัจจุบันมีการ ftp และ sftp ไปยัง host ดังนี้

    ftp
    	* nhc2bma.haii.or.th
    	* nhc2gistda.haii.or.th
    	* nhc2tmd.haii.or.th
    	* 10.111.41.120
    sftp
    	* archive.thaiwater.net
    	* 192.168.12.190
    	* 192.168.12.189
    	* live1.haii.or.th

**4. แจ้งการใช้งาน mail ทาง system เพื่อให้ระบบสามารถใช้งาน mail ได้** 
สามารถดู mail จาก config  database ชื่อ api ตาราง system_setting name=thaiwater30.service.event_management.smtpserver.smtp1

**5. แก้ไขการ config database** 
เข้า database api ตาราง system_setting คอลัมน์ name= server.service.dataimport.RDLNodes.node0 
แก้ไข value

    {"user": "cim", "host": "192.168.150.112", 
    "key": "cimTiwrm*(89", "pathprefix": "dataimport", 
    "timeout_seconds": 1}

>
 ตรง "host": "192.168.150.112" ปรับเป็นเครื่อง converter เครื่องใหม่

**6. ทำการ start service** โดยคำสั่ง ดังนี้

    ตรวจสอบสถานะ : /home/cim/haii-api-server/haii-api-server status
    Start service : /home/cim/haii-api-server/haii-api-server start
    Stop service : /home/cim/haii-api-server/haii-api-server stop

**7. สามารถดู error log** ได้ที่ /home/cim/dataimport/log

**8. การทดสอบ** โดยการ รันคำสั่งเชื่อมโยงข้อมูล

    เช่น dataimport/bin/rdl 1 dl-basic

## 

**ทดสอบเว็บ [web.thaiwater.net/thaiwater30](http://web.thaiwater.net/thaiwater30)** โดยสามารถใช้งาน Api และในส่วนของ backoffice ได้สมบูรณ์

**1. Clone project ลงเครื่อง local**

    Git clone git@git.haii.or.th:cim_cws/fronend-thaiwater30.git

**2. ทำการแก้ไข config**  .env ให้ใช้ api ตัวใหม่ (192.168.150.11)

**3.ทำการตรวจสอบหน้าเว็บและทดสอบ backoffice ในเครื่อง local**

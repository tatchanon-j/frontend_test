<!--by werawan 17/04/2018 -->
# วิธีใช้ฟังก์ชัน string ในตั้งค่า dataset (ตัวอย่าง กรมฝนหลวงฯ)
1. เตรียม Path จากต้นทางที่จะนำไปใช้สร้าง path วางไฟล์ที่ถูกดาวน์โหลดมาจากหน่วยงานต้นทางบนเครื่อง archive.thaiwater.net โดย path จากหน่วยงานต้นทางสามารถดูได้ที่
    * เครื่อง archive.thaiwater.net
    * ไปที่ /data/thaiwaterdata/data/dataset/media/image/radar/drraa/yyyy/mm/dd/HHMMSS
    * เข้าไปที่ไฟล์ dl-...-filelist.json
    * ![ภาพที่ 1 ](string_drraa_01.jpg)
    * ไฟล์ต้นทางอยู่ที่ "name":"cband/chatu/171017/CAPPI240@chatu@171017020600.png"
2. การใช้คำสั่ง 'splitword'
    * Path จากหน่วยงานต้นทาง : cband/chatu/171017/CAPPI240@chatu@171017020600.png
    * ผลที่ต้องการ : cband
    * วิธีใช้คำสั่ง : splitword(input('name'), '/', 'first')
        * input('name') คือ เลือก path ที่จะใช้ splitword โดยเลือกจากข้อ 1.
        * '/' คือ ตัวใช้คั่นแต่ละ array
        * 'first' คือ เลือกจากตำแหน่งของ array ใน path นั้น ซึ่ง cband เป็น array ตำแหน่งแรกของ Path จากหน่วยงานต้นทาง
3. การใช้คำสั่ง 'pickword'
    * Path จากหน่วยงานต้นทาง : cband/chatu/171017/CAPPI240@chatu@171017020600.png
    * ผลที่ต้องการ : 17
    * วิธีใช้คำสั่ง : pickword(input('name'), 12, 13)
        * 12 และ 13 คือ ตำแหน่งของ string (ตัวอักษร) ที่ต้องการ
    * ในกรณีที่ Path จากหน่วยงานต้นทาง มีความยาวของ string (ตัวอักษร) ไม่เท่ากัน จะใช้ทั้งคำสั่ง pickword และ splitword ดังนี้
        * วิธีใช้คำสั่ง : pickword(splitword(input('name'), '/', '2'), 0, 1)
            * splitword(input('name'), '/', '2') = 171017
            * ใช้คำสั่ง pickword เลือกตำแหน่งของ string จากการ spliword แล้ว จะได้ pickword(171017, 0, 1) = 17 

4. การใช้คำสั่ง 'combineword'
    * Path จากหน่วยงานต้นทาง : cband/chatu/171017/CAPPI240@chatu@171017020600.png
    * ผลที่ต้องการ : cband/chatu/17/10/17
    * วิธีใช้คำสั่ง : combineword('/', splitword(input('name'), '/', 'first'), splitword(input('name'), '/', '1'), pickword(splitword(input('name'), '/', '2'), 0, 1), pickword(splitword(input('name'), '/', '2'), 2, 3), pickword(splitword(input('name'), '/', '2'), 4, 5))
        * splitword(input('name'), '/', 'first') = cband
        * splitword(input('name'), '/', '1') = chatu
        * pickword(splitword(input('name'), '/', '2'), 0, 1) = 17
        * pickword(splitword(input('name'), '/', '2'), 2, 3) = 10
        * pickword(splitword(input('name'), '/', '2'), 4, 5) = 17
        * แล้วใช้คำสั่ง combineword('/', cband, chatu, 17, 10, 17) จะได้ cband/chatu/17/10/17 ซึ่งเป็นการรวมคำจากการ splitword และ pickword ทั้งหมดแล้วคั่นด้วย '/'

5. การต่อ string
    * Path จากหน่วยงานต้นทาง : cband/chatu/171017/CAPPI240@chatu@171017020600.png
    * ผลที่ต้องการ : 20171017
    * วิธีใช้คำสั่ง : '20' + splitword(input('name'), '/', '2')
        * '20' = 20
        * splitword(input('name'), '/', '2') = 171017
        * สามารถต่อ string ด้วยการใช้ + ระหว่าง string ที่ต้องการให้เป็นคำเดียวกัน

6. การใช้ linkToFolderDate
* วิธีการใช้ : linkToFolderDate( input('^archive_path'), input('name'), 'product/radar/history/drraa',  splitword(input('name'), '/', '1'),  '20'+pickword(splitword(input('name'),'/','2'),0,1),  pickword(splitword(input('name'),'/','2'),2,3),  pickword(splitword(input('name'),'/','2'),4,5),  splitword(input('name'), '/', 'first')  )
	*  จะต้องเรียงพารามิเตอร์ดังนี้ 
		* linkToFolderDate(
			พารามิเตอร์ตำแหน่งที่ 0,
			พารามิเตอร์ตำแหน่งที่ 1,
			พารามิเตอร์ตำแหน่งที่ 2,
			พารามิเตอร์ตำแหน่งที่ 7,
			พารามิเตอร์ตำแหน่งที่ 3,
			พารามิเตอร์ตำแหน่งที่ 4,
			พารามิเตอร์ตำแหน่งที่ 5,
			พารามิเตอร์ตำแหน่งที่ 6
			)




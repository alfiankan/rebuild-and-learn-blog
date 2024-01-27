---
sidebar_position: 4
---
import GiscusComponent from '../../website/src/components/GiscusComponent';

# Memanipulasi Page dan Block Sederhana

## Pendahuluan

Halo lagi pembaca, pada part 2 ini setelah kita memahami apa yang dilakukan database engine
untuk menulis dan membaca data, kita akan mencoba membuat suatu program untuk melakukan hal yang
sama secara konsep (bukan membuat database engine), untuk sekarang kita akan keep simple
untuk semakin memahami bagaimana cara baca tulis ke block file.

Kita akan membuat 2 program yang pertama untuk membuat file besar, kenapa? karena kita
ingin melihat bagaimana ukuran file tidak berpengaruh untuk membaca dan menulis dengan
block file ini.

Lalu kedua kita akan membuat program untuk menerima input dan eval process ke block file.
kita akan keep it simple yaitu membuat beberapa capability, format command kita akan seperti berikut:

```bash
<meta> <args1> <args2> ...
```

1. `FROM` `<offset>`
    
    Query diatas akan mengambil data dari byte offset `offset` (kb) contoh:
    ```sql
    FROM 4
    ```

    ![PG Page](/img/viz-select.gif)


2. `UPDATE` `<offset>` `<string data>`

    Query diatas akan mengubah data dari byte offset `offset` dengan string data, contoh:
    ```sql
    UPDATE 4 'my breaking hearth and i agree'
    ```
    ![PG Page](/img/viz-update.gif)


3. `DELETE` `<offset>` `<limit>`

    Query diatas akan menghapus bytes dati `offset` dengan `limit` (kb), contoh:
    ```sql
    DELETE 10 5
    ```
    ![PG Page](/img/viz-delete.gif)



data terkecil pada program ini yang selanjutnya akan kita sebut row hanya akan berisi string saja,
unit terkecil yang akan kita gunakan adalah kb (1kb)




import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## Program untuk membuat file
Pertama kita kan mencoba program untuk membuat file yang besar, kita akan mencoba 1GB keatas, prograya sangat sederhana sebagai berikut

:::info
Semua code (Go) pada series ini akan di simpan pada [repositori ini](https://github.com/alfiankan/nano-db)
:::


<Tabs>
  <TabItem value="go" label="Go" default>
    ```go showLineNumbers
    package main
    
    import (
        "fmt"
        "os"
    )
    
    
    func main() {
      // kita akan membaca dan atau membuat file dengan nama mydile dengan permission create dan erite
      file,err := os.OpenFile("myfile", os.O_CREATE|os.O_WRONLY, 0644)
    
      if err != nil {
        fmt.Println(err)
        return
      }
   
      // jangan lupa di close ya
      defer file.Close()
    
      counter := 0
      target := 50000 * 500
      // kita generate string line per line dari lirik lagunya laufey 
      for counter < target {
        file.WriteString(fmt.Sprintf("(%d) my breaking hearth and i agree, that you and i are never be \n", counter))
        counter += 1
      }
    }

    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
  <TabItem value="Ruby" label="Ruby">
    ```ruby showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
</Tabs>

Kode untuk generate file kita hanya simple seperti diatas, anda dapat run lalu akan mendapatkan file dengan ukuran GB.
coba kita jalankan command `stat` untuk melihat lebih detail dari file ini (untuk macos gunakan flag `-x` `stat -x`)

```bash
> du -h myfile
1.7G	myfile
```

```bash
> stat -x myfile
  File: "myfile"
  Size: 1788888890   FileType: Regular File
  Mode: (0644/-rw-r--r--)         Uid: (  501/alfiankan)  Gid: (   20/   staff)
Device: 1,16   Inode: 64030629    Links: 1
Access: Sat Jan 27 17:14:45 2024
Modify: Sat Jan 27 17:14:44 2024
Change: Sat Jan 27 17:14:44 2024
 Birth: Sat Jan 27 17:14:01 2024
```

```bash

> stat myfile
16777232 64030629 -rw-r--r-- 1 alfiankan staff 0 1788888890 "Jan 27 17:14:45 2024" "Jan 27 17:14:44 2024" "Jan 27 17:14:44 2024" "Jan 27 17:14:01 2024" 4096 3508088 0 myfile

```

bisa kita liat dari diatas bahwa ukuran file kita sektar 1.7GB dengan block size nya `4096` bytes atau 4kb dengan total block `3508088`

Pada level sistem operasi ke disk ketika kita membuat file akan di simpan pada sebuah block pada disk, tergantung dari berapa
panjang block yang ditentukan sistem operasi nya, contohnya ketika kita membuat file dengan content hanya huruf `a` yang mana berarti
1 byte akan tetap teralokasi ke dalam block sehingga terbaca sesuai ukuran block, contohnya 4kb

```bash
> du -h kecil
4.0K	kecil
```

sebenarnya actual size nya tidak sebesar itu, inilah konsep block yang digunakan sistem operasi untuk optimize file system sedemikian rupa,
jika kita coba cek actual sizenya maka.

```bash
> stat -x kecil
  File: "kecil"
  Size: 2            FileType: Regular File
  Mode: (0644/-rw-r--r--)         Uid: (  501/alfiankan)  Gid: (   20/   staff)
Device: 1,16   Inode: 64033665    Links: 1
Access: Sat Jan 27 17:47:59 2024
Modify: Sat Jan 27 17:47:57 2024
Change: Sat Jan 27 17:47:57 2024
 Birth: Sat Jan 27 17:44:16 2024
```

![PG Page](/img/disk.png)


## Membuat REPL
REPL adalah Read - Evaluate - Print - Loop suatu interface sederhana untuk menerima input dari user
mengerjakan perintah dan mengebalikan sebagai output print out, kita akan membuat repl ini untuk
program kita.

:::info
Semua code (Go) pada series ini akan di simpan pada [repositori ini](https://github.com/alfiankan/nano-db)
:::




<Tabs>
  <TabItem value="go" label="Go" default>
    ```go showLineNumbers
    
    package main
    
    import (
          "bufio"
          "fmt"
          "os"
          "strings"
    )
    
    func main() {
          // membuka file yang kita buat sebelumnya
          f, err := os.Open("myfile")
          if err != nil {
                  fmt.Println(err)
                  return
          }
    
          defer f.Close()
          input := bufio.NewScanner(os.Stdin)
    
          fmt.Print("(nano-db-test) >> ")
          for input.Scan() {
    
                  command := input.Text()
                  meta := strings.Split(command, " ")[0]
    
                  fmt.Println("executing", command, meta)
    
                  if meta == "FROM" {
                    // kita akan implementasi membaca dari sini 
                          
                  } else if meta == "DELETE" {
                    // kita akan implementasi menghapus disini 
                           
                  } else if meta == "UPDATE" {
                    // kita akan implementasi update disini
    
                  }
                  fmt.Print("(nano-db-test) >> ")
          }
    
    }

    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
  <TabItem value="Ruby" label="Ruby">
    ```ruby showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
</Tabs>



## Membaca Data

Untuk membaca data dengan offset byte sebenarnya cukup simple, apalagi jika menggunakan bahasa pemograman high level.
Untuk membaca data pada lokasi tertentu tanpa scanning dan read dari awal, contohnya kita ingin membaca data di tengah file
asalkan kita sudah tau lokasi byte offset nya kita bisa pindahkan pointer untuk i/o file nya dengan menggunakan `seek`
sehingga kita akan memulai pembacaan data dari byte offset yang sudah kita tentukan. Lalu jangan lupa untuk mengembalikan
pointer ke awal file.

:::info
Semua code (Go) pada series ini akan di simpan pada [repositori ini](https://github.com/alfiankan/nano-db)
:::


<Tabs>
  <TabItem value="go" label="Go" default>
    ```go {7,15,21} showLineNumbers
    
       // truncated code -----    
       // kita tentukan unit terkecil menjadi 1kb agar lebih mudah menghitung
       offset := 1024 * n                                

       // seek ubah posisi pointer ke offset yang kita mau
       ret, err := f.Seek(int64(offset), io.SeekCurrent) 
    
       fmt.Println("seek error", err)
    
       fmt.Println(ret)
    
       dataBuffer := make([]byte, 1024) 
       // baca filenya ke buffer 1kb
       f.Read(dataBuffer) // read to the mem buffer
    
       fmt.Println("result=====")
       fmt.Println(string(dataBuffer))

       // kembalikan (reset) pointer ke awal file
       ret, err = f.Seek(0, io.SeekStart) 
       fmt.Println("seek error", err)
        // truncated code ----- 

    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
  <TabItem value="Ruby" label="Ruby">
    ```ruby showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
</Tabs>

Kita akan coba jalankan dan kita coba `select` dari data paling awal

```bash
> ./cli
(nano-db-test) >> FROM 0
executing FROM 0 FROM
seek error <nil>
0
result=====
(0) my breaking hearth and i agree, that you and i are never be
(1) my breaking hearth and i agree, that you and i are never be
(2) my breaking hearth and i agree, that you and i are never be
(3) my breaking hearth and i agree, that you and i are never be
(4) my breaking hearth and i agree, that you and i are never be
(5) my breaking hearth and i agree, that you and i are never be
(6) my breaking hearth and i agree, that you and i are never be
(7) my breaking hearth and i agree, that you and i are never be
(8) my breaking hearth and i agree, that you and i are never be
(9) my breaking hearth and i agree, that you and i are never be
(10) my breaking hearth and i agree, that you and i are never be
(11) my breaking hearth and i agree, that you and i are never be
(12) my breaking hearth and i agree, that you and i are never be
(13) my breaking hearth and i agree, that you and i are never be
(14) my breaking hearth and i agree, that you and i are never be
(15) my breaking hearth and i agree, that yo
seek error <nil>
(nano-db-test) >>

```

kita akan mendapatkan data dari offset 0 dengan panjang 1kb, kita bisa lihat bahwa ada data yang terpotong karena 
tidak cukup muat di 1kb, kita anggap page size kita disini 1kb, yang dilakukan database contohnya postgree
adalah membuat `TOAST` yaitu membuat pointer ke data (row) asli yang terlalu panjang.

Lalu kita coba membaca dari offset 100mb karena file kita 1.7GB seharusnya kita akan mendapatkan datanya

```bash
> ./cli
(nano-db-test) >> FROM 100000
executing FROM 100000 FROM
seek error <nil>
102400000
result=====
e
(1457903) my breaking hearth and i agree, that you and i are never be
(1457904) my breaking hearth and i agree, that you and i are never be
(1457905) my breaking hearth and i agree, that you and i are never be
(1457906) my breaking hearth and i agree, that you and i are never be
(1457907) my breaking hearth and i agree, that you and i are never be
(1457908) my breaking hearth and i agree, that you and i are never be
(1457909) my breaking hearth and i agree, that you and i are never be
(1457910) my breaking hearth and i agree, that you and i are never be
(1457911) my breaking hearth and i agree, that you and i are never be
(1457912) my breaking hearth and i agree, that you and i are never be
(1457913) my breaking hearth and i agree, that you and i are never be
(1457914) my breaking hearth and i agree, that you and i are never be
(1457915) my breaking hearth and i agree, that you and i are never be
(1457916) my breaking hearth and i agree, that you and i are never be
(1457917) my breaking heart
seek error <nil>
(nano-db-test) >>
```

dan kita berhasil membaca file yang berada jauh dari pointer awal dengan cepat, dibandingkan membaca file
dan evaluatu satu per satu


## Mengupdate Data

Proses mengupdate data juga sederhana selama kita tau dimana offset byte awal yang mau kita update kita dapat melakukannya
dengan cepat yaitu dengan melakukan `seek` ke offset byte yang kita mau, lalu kita write ulang dari offset byte tersebut
setelah itu data kita akan berubah.

:::info
Semua code (Go) pada series ini akan di simpan pada [repositori ini](https://github.com/alfiankan/nano-db)
:::

<Tabs>
  <TabItem value="go" label="Go" default>
    ```go {14,17,20} showLineNumbers

       // truncated code ----- 
       // kita buka lagi file nya dengan permission write only
       f, err := os.OpenFile("myfile", os.O_RDWR, 0664)
       if err != nil {
               fmt.Println(err)
               return
       }
       defer f.Close()
    
       from, _ := strconv.Atoi(strings.Split(command, " ")[1])
       newData := strings.Split(command, " ")[2]
    
       // kita pindahkan pointer dengan seek ke byte offset yang diminta
       f.Seek(int64(from)*1024, io.SeekCurrent) 
    
       // tulis byte dari sini, karena sudah berubah pointernya
       f.Write([]byte(newData)) 
        
       // kembalikan (reset) pointer ke awal
       f.Seek(0, io.SeekStart) // reset
       // truncated code -----
    
                  
    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
  <TabItem value="Ruby" label="Ruby">
    ```ruby showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
</Tabs>


Kita coba jalankan lagi dan kita coba update data dari offset setelah 100mb dengan kata kata `rebuild-and-learn`
maka akan override bytes yang ada setelah offset tersebut seperti berikut ini. dan seharusnya file size tidak
akan berubah coba kita buktikan.

```bash {1,8} 
(nano-db-test) >> UPDATE 100000 rebuild-and-learn
executing UPDATE 100000 rebuild-and-learn UPDATE
(nano-db-test) >> FROM 100000
executing FROM 100000 FROM
seek error <nil>
102400000
result=====
rebuild-and-learnreaking hearth and i agree, that you and i are never be
(1457904) my breaking hearth and i agree, that you and i are never be
(1457905) my breaking hearth and i agree, that you and i are never be
(1457906) my breaking hearth and i agree, that you and i are never be
(1457907) my breaking hearth and i agree, that you and i are never be
(1457908) my breaking hearth and i agree, that you and i are never be
(1457909) my breaking hearth and i agree, that you and i are never be
(1457910) my breaking hearth and i agree, that you and i are never be
(1457911) my breaking hearth and i agree, that you and i are never be
(1457912) my breaking hearth and i agree, that you and i are never be
(1457913) my breaking hearth and i agree, that you and i are never be
(1457914) my breaking hearth and i agree, that you and i are never be
(1457915) my breaking hearth and i agree, that you and i are never be
(1457916) my breaking hearth and i agree, that you and i are never be
(1457917) my breaking heart
seek error <nil>
(nano-db-test) >>
```

lalu kalau kita cek size filenya tidak berubah. karena kita hanya me rewrite bytes yang ada setelah offset ke 10mb

```bash
> du -h myfile
1.7G        myfile
```

hal ini nantinya akan dibahas dan di implementasikan lebih lanjut, pada database engine process update suatu data ini banyak caveat nya
dan atau banyak pendekatan untuk meng handle process ini, jika panjang byte sama maka itu tidak akan jadi issue, namun jika berbeda
akan menjadi issue, nanti akan kita bahas pada part lainya, untuk saat ini kita cukup membuktkan bahwa kita bisa mengupdate data di tengah
file tanpa harus bmembaca dari awal dan me resize dan membuat ulang file, sehingga mengemat `I/O`


## Menghapus Data

Menghapus data kurang lebih mirip dengan mengupdate data, kita akan menulis ulang dari byte offset yang di inginkan sepanjang data
barunya, namun bedanya kita akan menulis byte kosong, tujuanya adalah tetap menjaga ukuran file sehingga strukturnya tidak berubah ini
penting pada database yang menggunakan page dan block karena lokasi byte sangat di tentukan dari panjang byte offset.
untuk menangani ini databsase biasanya sudah memiliki mekanisme sendiri misalnya memanfatkan ulang gap kosong tersebut 
dengan data yang lebuh kecil atau pada postgree memiliki fitur `VACUUM` untuk defragmentasi dan membuang dead record

:::info
Semua code (Go) pada series ini akan di simpan pada [repositori ini](https://github.com/alfiankan/nano-db)
:::

<Tabs>
  <TabItem value="go" label="Go" default>
    ```go {14,17,20} showLineNumbers
        
       // truncated code -----  
       f, err := os.OpenFile("myfile", os.O_RDWR, 0664)
       if err != nil {
               fmt.Println(err)
               return
       }
       defer f.Close()
    
       from, _ := strconv.Atoi(strings.Split(command, " ")[1])
       n, _ := strconv.Atoi(strings.Split(command, " ")[2])
    
       // kita pindahkan pointer ke offset
       f.Seek(int64(from)*1024, io.SeekCurrent) 
        
       // kita tulis byte kosong
       f.Write(make([]byte, n*1024)) 
    
       // kita kembalikan pointer ke awal
       f.Seek(0, io.SeekStart) 
    
       // truncated code ----- 

    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
  <TabItem value="Ruby" label="Ruby">
    ```ruby showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
</Tabs>

Kita akan coba jalankan dan kita akan mencoba menghapus 1kb data dari offset ke 10mb dimana ada data yang kita update tadi,
jika berhasi ketika kita select offset ke 10mb maka datanya akan kosong, namun data lainya akan tetap ada

```bash
(nano-db-test) >> DELETE 100000 1
executing DELETE 100000 1 DELETE
(nano-db-test) >> FROM 100000
executing FROM 100000 FROM
seek error <nil>
102400000
result=====

seek error <nil>
(nano-db-test) >>
```

ketika kita coba baca data ke 15mb akan tetap ada data lainya.

```bash
executing FROM 150000 FROM
seek error <nil>
153600000
result=====
and i are never be
(2179030) my breaking hearth and i agree, that you and i are never be
(2179031) my breaking hearth and i agree, that you and i are never be
(2179032) my breaking hearth and i agree, that you and i are never be
(2179033) my breaking hearth and i agree, that you and i are never be
(2179034) my breaking hearth and i agree, that you and i are never be
(2179035) my breaking hearth and i agree, that you and i are never be
(2179036) my breaking hearth and i agree, that you and i are never be
(2179037) my breaking hearth and i agree, that you and i are never be
(2179038) my breaking hearth and i agree, that you and i are never be
(2179039) my breaking hearth and i agree, that you and i are never be
(2179040) my breaking hearth and i agree, that you and i are never be
(2179041) my breaking hearth and i agree, that you and i are never be
(2179042) my breaking hearth and i agree, that you and i are never be
(2179043) my breaking hearth and i agree, that you and i are never be
(2179044)
seek error <nil>
(nano-db-test) >>
```



## Full Code

:::info
Semua code (Go) pada series ini akan di simpan pada [repositori ini](https://github.com/alfiankan/nano-db)
:::

<Tabs>
  <TabItem value="go" label="Go" default>
    ```go showLineNumbers
    
    package main
    
    import (
          "bufio"
          "fmt"
          "io"
          "os"
          "strconv"
          "strings"
    )
    
    func main() {
          f, err := os.Open("myfile")
          if err != nil {
                  fmt.Println(err)
                  return
          }
    
          defer f.Close()
          input := bufio.NewScanner(os.Stdin)
    
          fmt.Print("(nano-db-test) >> ")
          for input.Scan() {
    
                  command := input.Text()
                  meta := strings.Split(command, " ")[0]
    
                  fmt.Println("executing", command, meta)
    
                  if meta == "FROM" {
    
                          n, _ := strconv.Atoi(strings.Split(command, " ")[1])
    
                          offset := 1024 * n                                
                          ret, err := f.Seek(int64(offset), io.SeekCurrent) 
    
                          fmt.Println("seek error", err)
    
                          fmt.Println(ret)
    
                          dataBuffer := make([]byte, 1024) 
    
                          f.Read(dataBuffer) 
    
                          fmt.Println("result=====")
                          fmt.Println(string(dataBuffer))
                          ret, err = f.Seek(0, io.SeekStart) 
                          fmt.Println("seek error", err)
    
                  } else if meta == "DELETE" {
    
                          f, err := os.OpenFile("myfile", os.O_RDWR, 0664)
                          if err != nil {
                                  fmt.Println(err)
                                  return
                          }
                          defer f.Close()
    
                          from, _ := strconv.Atoi(strings.Split(command, " ")[1])
                          n, _ := strconv.Atoi(strings.Split(command, " ")[2])
    
                          f.Seek(int64(from)*1024, io.SeekCurrent) 
    
                          f.Write(make([]byte, n*1024)) 
    
                          f.Seek(0, io.SeekStart) 
    
                  } else if meta == "UPDATE" {
    
                          f, err := os.OpenFile("myfile", os.O_RDWR, 0664)
                          if err != nil {
                                  fmt.Println(err)
                                  return
                          }
                          defer f.Close()
    
                          from, _ := strconv.Atoi(strings.Split(command, " ")[1])
                          newData := strings.Split(command, " ")[2]
    
                          f.Seek(int64(from)*1024, io.SeekCurrent) 
    
                          f.Write([]byte(newData)) 
    
                          f.Seek(0, io.SeekStart) 
    
                  }
                  fmt.Print("(nano-db-test) >> ")
          }
    
    }

    ```
  </TabItem>
  <TabItem value="python" label="Python">
    ```python showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
  <TabItem value="Ruby" label="Ruby">
    ```ruby showLineNumbers
    Belum tersedia, anda bisa kontribusi ke repository blog ini , dengan bahasa pemograman apapun
    ```
  </TabItem>
</Tabs>


## Penutup
Okay pada part ini kita telah mengulik dan mencoba membuktika cara database membaca dan menulis file naun dengan versi simplenya
yaitu hanya dalam file string, database memiliki kompleksitas lebih tinggi termasuk aturan format page, compressing dan yang lain
sebagainya, namun tetap congratulations sudah menyelesaikan step ini kita suda menaruh pondasi dasar
untuk memahami database storage engine nya bekerja dari yang palin abstrak nya. pada part selanjutnya
kita akan mencoba membuat struktur dan format block dan page kita sendiri untuk membuat database engine kita.
Sampai jumpa di part selanjutnya.


<br/>

> Sampai jumpa di artikel selanjutnya
>
> — Penulis

<GiscusComponent />

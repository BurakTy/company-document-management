# Doküman Yönetim Sistemi

AngularJs ve .Net ile yapmış olduğum ilk projelerden biri. [Devexpress documents](https://demos.devexpress.com/RWA/Documents/){:target="_blank"} ten ilham alarak geliştirdim.
Projenin şimdiki versiyonu sadece belge ekleme , görüntüleme ve indirme üzerine çalışıyor. İlerki versiyonunda üzerinde düzenleme getirilmesi planlanmakta.
Aynı zamanda şuanda webservis olan backend kısmı WebAPI olarak tekrar revize edilmekte.

Firma içerisinde belge yönetimi için geliştirilmiştir. Farklı kişilerde, farklı ortamlarda olan ve bir çok kişinin görmesi , kullanması gereken belgelerin
tek bir yerde toplanması sağlamaktadır. Sadece yetkili kişiler belgeyi görebilir ve düzenleyebilir. Sadece yetkisi olduğu klasöre yeni belgeler yükleyebilir.
Bu sayede her ekip için bir dosyalama ve klasörleme yapısı oluşturulabilir.

Yetkilendirilmiş kullanıcılar  belgeler ve dosyalar üzerinde değişiklik yapılabilir,
yeni personeller ekleyebilir ve bunlara yetkiler atayabilir. 

Yetkilendirilerek kilitlenen belgeler o yetkiye sahip kullanıcılar ve firma yetkilisi tarafından görülebilir.

Firma yetkilisi istek belge oluşturabilir. Kullanıcılardan bu belgeleri isteyebilir. Kullanıcıların yüklemiş oldukları bu belge kullanıcın kendisine ait alanına
eklenir ve sadece kullanıcı ve firma yetkilisi görebilir.

Kullanıcı kendisine ait alana belge ve klasör ekleyebilir. Sadece kendisi görebilir.

Demoyu [buradan](http://demodocumentmanager.snevars.com/) inceleye bilirsiniz.

## Kullanılan teknolojiler
- AngularJs 
- Jquery 
- Bootstrap
- Alertfy
- .Net asmx WebService

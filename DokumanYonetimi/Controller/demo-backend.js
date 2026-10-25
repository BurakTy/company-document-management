/*
 * DEMO SÜRÜMÜ — sahte sunucu.
 * Orijinal uygulama DocService.asmx (.NET) web servisine konuşur. Bu dosya o çağrıları tarayıcı içinde
 * yakalar ve örnek verilerle cevaplar; hiçbir şey sunucuya gönderilmez ve sayfa yenilenince veriler sıfırlanır.
 * Demo giriş: demo@demo.com / Demo1234
 */
(function () {
    'use strict';

    var DEMO = { mail: 'demo@demo.com', pass: 'Demo1234' };
    var seq = 1000;
    function nid() { return ++seq; }
    function p2(n) { return n < 10 ? '0' + n : '' + n; }
    function now() { var d = new Date(); return p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()); }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    var ROOT = 1, PERSONAL = 2;

    var yetkiler = [
        { YetkiID: 1, YetkiAdi: 'Yönetim', Duzenleme: true, IsAktif: true },
        { YetkiID: 2, YetkiAdi: 'Muhasebe', Duzenleme: true, IsAktif: true },
        { YetkiID: 3, YetkiAdi: 'İnsan Kaynakları', Duzenleme: true, IsAktif: true },
        { YetkiID: 4, YetkiAdi: 'Satış ve Pazarlama', Duzenleme: false, IsAktif: true },
        { YetkiID: 5, YetkiAdi: 'Hukuk', Duzenleme: true, IsAktif: true }
    ];

    var users = [
        { KullaniciID: 1, Ad: 'Demo', Soyad: 'Kullanıcı', Mail: DEMO.mail, Telefon: '0 555 000 00 01', IsAktif: true, Ref_Unvan: 2, Yetkiler: [1, 2, 3, 4, 5] },
        { KullaniciID: 2, Ad: 'Ayşe', Soyad: 'Yılmaz', Mail: 'ayse.yilmaz@ornek.com', Telefon: '0 555 000 00 02', IsAktif: true, Ref_Unvan: 3, Yetkiler: [3] },
        { KullaniciID: 3, Ad: 'Mehmet', Soyad: 'Kaya', Mail: 'mehmet.kaya@ornek.com', Telefon: '0 555 000 00 03', IsAktif: true, Ref_Unvan: 3, Yetkiler: [2] },
        { KullaniciID: 4, Ad: 'Zeynep', Soyad: 'Demir', Mail: 'zeynep.demir@ornek.com', Telefon: '0 555 000 00 04', IsAktif: true, Ref_Unvan: 3, Yetkiler: [4] },
        { KullaniciID: 5, Ad: 'Can', Soyad: 'Aydın', Mail: 'can.aydin@ornek.com', Telefon: '0 555 000 00 05', IsAktif: false, Ref_Unvan: 3, Yetkiler: [] }
    ];

    // Düz liste: UstID ile ağaç oluşur. Kilitli = kullanıcının yetkisi yok (kilit simgesi, açılmaz).
    var nodes = [
        { ID: ROOT, UstID: 0, Adi: 'Tum Dosyalar', IsFolder: true },
        { ID: PERSONAL, UstID: 0, Adi: 'Kisisel', IsFolder: true },

        { ID: 10, UstID: ROOT, Adi: 'İnsan Kaynakları', IsFolder: true, SonDuzTarihi: '02.03.2026 09:15', Yetkiler: [3] },
        { ID: 11, UstID: ROOT, Adi: 'Muhasebe', IsFolder: true, SonDuzTarihi: '18.03.2026 16:40', Yetkiler: [2] },
        { ID: 12, UstID: ROOT, Adi: 'Satış ve Pazarlama', IsFolder: true, SonDuzTarihi: '25.02.2026 11:05', Yetkiler: [4] },
        { ID: 13, UstID: ROOT, Adi: 'Hukuk', IsFolder: true, SonDuzTarihi: '10.03.2026 14:20', Yetkiler: [5] },
        { ID: 14, UstID: ROOT, Adi: 'Yönetim Kurulu', IsFolder: true, Kilitli: true, SonDuzTarihi: '05.01.2026 10:00', Yetkiler: [1] },
        { ID: 15, UstID: ROOT, Adi: 'Şirket Tanıtım Sunumu', IsFolder: false, Type: '.pdf', Boyut: '460.41 Kb', SonDuzTarihi: '14.02.2026 13:30', Yetkiler: [1, 4] },
        { ID: 16, UstID: ROOT, Adi: 'Organizasyon Şeması', IsFolder: false, Type: '.png', Boyut: '86.20 Kb', SonDuzTarihi: '20.01.2026 17:45', Yetkiler: [1] },
        { ID: 17, UstID: ROOT, Adi: 'Duyuru Notları', IsFolder: false, Type: '.txt', Boyut: '2.10 Kb', SonDuzTarihi: '01.03.2026 08:50', Yetkiler: [1] },

        { ID: 20, UstID: 10, Adi: 'İzin Yönetmeliği', IsFolder: false, Type: '.pdf', Boyut: '312.00 Kb', SonDuzTarihi: '02.03.2026 09:15', Yetkiler: [3] },
        { ID: 21, UstID: 10, Adi: 'Personel El Kitabı', IsFolder: false, Type: '.docx', Boyut: '1.20 Mb', SonDuzTarihi: '12.02.2026 15:10', Yetkiler: [3] },
        { ID: 22, UstID: 10, Adi: 'İşe Alım Süreci', IsFolder: false, Type: '.pdf', Boyut: '208.55 Kb', SonDuzTarihi: '03.02.2026 10:20', Yetkiler: [3] },
        { ID: 23, UstID: 10, Adi: 'Eğitim Planları', IsFolder: true, SonDuzTarihi: '21.02.2026 12:00', Yetkiler: [3] },
        { ID: 24, UstID: 23, Adi: '2026 Eğitim Takvimi', IsFolder: false, Type: '.pdf', Boyut: '154.80 Kb', SonDuzTarihi: '21.02.2026 12:00', Yetkiler: [3] },

        { ID: 30, UstID: 11, Adi: '2026 Bütçe Planı', IsFolder: false, Type: '.pdf', Boyut: '540.10 Kb', SonDuzTarihi: '18.03.2026 16:40', Yetkiler: [2] },
        { ID: 31, UstID: 11, Adi: 'Fatura Arşivi', IsFolder: true, SonDuzTarihi: '15.03.2026 09:30', Yetkiler: [2] },
        { ID: 32, UstID: 31, Adi: 'Mart 2026 Faturaları', IsFolder: false, Type: '.pdf', Boyut: '2.45 Mb', SonDuzTarihi: '15.03.2026 09:30', Yetkiler: [2] },
        { ID: 33, UstID: 11, Adi: 'Vergi Beyannamesi', IsFolder: false, Type: '.pdf', Boyut: '389.00 Kb', SonDuzTarihi: '28.02.2026 18:05', Yetkiler: [2] },

        { ID: 40, UstID: 12, Adi: 'Ürün Kataloğu', IsFolder: false, Type: '.pdf', Boyut: '3.80 Mb', SonDuzTarihi: '25.02.2026 11:05', Yetkiler: [4], Duzenleme: false },
        { ID: 41, UstID: 12, Adi: 'Fiyat Listesi', IsFolder: false, Type: '.docx', Boyut: '96.30 Kb', SonDuzTarihi: '10.02.2026 14:25', Yetkiler: [4], Duzenleme: false },

        { ID: 50, UstID: 13, Adi: 'Sözleşme Şablonu', IsFolder: false, Type: '.docx', Boyut: '74.20 Kb', SonDuzTarihi: '10.03.2026 14:20', Yetkiler: [5] },
        { ID: 51, UstID: 13, Adi: 'KVKK Aydınlatma Metni', IsFolder: false, Type: '.pdf', Boyut: '128.90 Kb', SonDuzTarihi: '07.01.2026 09:00', Yetkiler: [5] },

        { ID: 60, UstID: PERSONAL, Adi: 'Özlük Belgelerim', IsFolder: true, Kdizin: true, SonDuzTarihi: '11.03.2026 10:10' },
        { ID: 61, UstID: PERSONAL, Adi: 'Yapılacaklar', IsFolder: false, Type: '.txt', Boyut: '0.80 Kb', Kdizin: true, SonDuzTarihi: '22.03.2026 08:30' },
        { ID: 62, UstID: 60, Adi: 'Diploma Sureti', IsFolder: false, Type: '.pdf', Boyut: '720.00 Kb', Kdizin: true, SonDuzTarihi: '11.03.2026 10:10' },

        { ID: 70, UstID: ROOT, Adi: '2025 Faaliyet Raporu', IsFolder: false, Type: '.pdf', Boyut: '1.60 Mb', Arsiv: true, SonDuzTarihi: '30.12.2025 17:00', Yetkiler: [1] },
        { ID: 71, UstID: 11, Adi: 'Eski Bütçe (2024)', IsFolder: false, Type: '.pdf', Boyut: '410.00 Kb', Arsiv: true, SonDuzTarihi: '05.01.2025 12:00', Yetkiler: [2] }
    ];

    var tumIstenilen = [
        { BelgeID: 1, BelgeAdi: 'Kimlik Fotokopisi', IsAktif: true },
        { BelgeID: 2, BelgeAdi: 'İkametgâh Belgesi', IsAktif: true },
        { BelgeID: 3, BelgeAdi: 'Sağlık Raporu', IsAktif: true },
        { BelgeID: 4, BelgeAdi: 'Adli Sicil Kaydı', IsAktif: false }
    ];
    var istenilen = [
        { ID: 150, IstekBelgeID: 1, Adi: 'Kimlik Fotokopisi', Boyut: '120.50 Kb', MevcutDosya: 'Kimlik.pdf', SeciliDosya: '', UstID: 60, Type: '.pdf' },
        { ID: 0, IstekBelgeID: 2, Adi: 'İkametgâh Belgesi', Boyut: null, MevcutDosya: '', SeciliDosya: '', UstID: 60 },
        { ID: 0, IstekBelgeID: 3, Adi: 'Sağlık Raporu', Boyut: null, MevcutDosya: '', SeciliDosya: '', UstID: 60 }
    ];

    // ---------- yardımcılar ----------
    function find(id) { for (var i = 0; i < nodes.length; i++) { if (nodes[i].ID == id) { return nodes[i]; } } return null; }
    function view(n) {
        return {
            ID: n.ID, UstID: n.UstID, Adi: n.Adi, IsFolder: !!n.IsFolder,
            Type: n.IsFolder ? null : (n.Type || '.pdf'), Boyut: n.IsFolder ? '' : (n.Boyut || ''),
            SonDuzTarihi: n.SonDuzTarihi || now(), Yetki: !n.Kilitli, Duzenleme: n.Duzenleme !== false,
            Arsiv: !!n.Arsiv, Kdizin: !!n.Kdizin
        };
    }
    function children(id) {
        return nodes.filter(function (n) { return n.UstID == id && !n.Arsiv; }).map(view);
    }
    function archived() { return nodes.filter(function (n) { return n.Arsiv; }).map(view); }
    function removeTree(id) {
        var kids = nodes.filter(function (n) { return n.UstID == id; });
        kids.forEach(function (k) { removeTree(k.ID); });
        nodes = nodes.filter(function (n) { return n.ID != id; });
    }
    function inPersonal(id) {
        var n = find(id);
        while (n) { if (n.ID == PERSONAL) { return true; } n = find(n.UstID); }
        return false;
    }
    function istView(b) {
        var dosyaVar = b.Boyut != null;
        return {
            ID: b.ID, IstekBelgeID: b.IstekBelgeID, Adi: b.Adi, Boyut: b.Boyut, MevcutDosya: b.MevcutDosya, SeciliDosya: b.SeciliDosya,
            UstID: b.UstID, IsFolder: false, Type: b.Type || (dosyaVar ? '.pdf' : null), Yetki: true, Duzenleme: false
        };
    }
    function unvan(n) { return n == 1 ? 'Admin' : (n == 2 ? 'Firma Yetkilisi' : 'Kullanıcı'); }
    function userRow(u) { return { KullaniciID: u.KullaniciID, AdSoyad: u.Ad + ' ' + u.Soyad, Mail: u.Mail, Unvan: unvan(u.Ref_Unvan), IsAktif: u.IsAktif, Ad: u.Ad, Soyad: u.Soyad }; }
    function son20() { return users.slice(-20).reverse().map(userRow); }
    function ok(data, msg) { return { d: { success: true, message: msg || '', Data: data } }; }
    function fail(msg) { return { d: { success: false, message: msg, Data: null } }; }

    // ---------- metotlar ----------
    var M = {
        Login: function (p) {
            var mail = ((p && p.email) || '').trim().toLowerCase();
            if (mail === DEMO.mail && (p.password || '') === DEMO.pass) {
                return ok({ KullaniciAdSoyad: 'Demo Kullanıcı', KullaniciID: 1, Ref_Unvan: 2, FPath: ROOT, KullaniciPath: PERSONAL, Ref_FirmaID: 1 });
            }
            return fail('Kullanıcı adı veya parola hatalı. Demo giriş: ' + DEMO.mail + ' / ' + DEMO.pass);
        },
        Anadizin: function () { return ok(children(ROOT)); },
        KisiselDizin: function () { return ok(children(PERSONAL)); },
        DokumanListele: function (p) { return ok(children(p.uId)); },
        ArsivleriListele: function () { return ok(archived()); },
        DokumanEkle: function (p) {
            var docs = (p && p.docs) || [];
            if (!docs.length) { return fail('Eklenecek doküman bulunamadı'); }
            docs.forEach(function (d) {
                nodes.push({
                    ID: nid(), UstID: d.UstID, Adi: d.Adi, IsFolder: !!d.IsFolder,
                    Type: d.IsFolder ? null : (d.Type || '.pdf'), Boyut: d.IsFolder ? '' : d.Boyut,
                    SonDuzTarihi: now(), Kdizin: inPersonal(d.UstID), Yetkiler: [1]
                });
            });
            return ok(children(docs[0].UstID));
        },
        DokumanEkleZip: function () { return fail('Demo sürümünde ZIP yükleme kapalıdır.'); },
        DokumanDuzenleme: function (p) {
            var n = find(p.DokID);
            if (!n) { return fail('Doküman bulunamadı'); }
            if (p.YeniAd) { n.Adi = p.YeniAd; n.SonDuzTarihi = now(); }
            if (p.Yetkiler && p.Yetkiler.length) {
                n.Yetkiler = p.Yetkiler.filter(function (y) { return y.Value; }).map(function (y) { return y.YetkiID; });
            }
            return ok(children(n.UstID));
        },
        DokumanSil: function (p) {
            var n = find(p.DocId);
            if (!n) { return fail('Doküman bulunamadı'); }
            var ust = n.UstID, wasArchived = !!n.Arsiv;
            removeTree(n.ID);
            return ok(wasArchived ? archived() : children(ust));
        },
        ArsiveEkle: function (p) {
            var n = find(p.DocId);
            if (!n) { return fail('Doküman bulunamadı'); }
            var wasArchived = !!n.Arsiv;
            n.Arsiv = !wasArchived;
            return ok(wasArchived ? archived() : children(n.UstID));
        },
        DokumanRevizeEt: function () { return fail('Demo sürümünde revizyon kapalıdır.'); },
        GDokumanYetki: function (p) {
            var n = find(p.DokID) || {};
            return ok(yetkiler.filter(function (y) { return y.IsAktif; }).map(function (y) {
                return { YetkiID: y.YetkiID, YetkiAdi: y.YetkiAdi, Value: (n.Yetkiler || []).indexOf(y.YetkiID) > -1 };
            }));
        },
        IstenilenBelgeler: function () { return ok(istenilen.map(istView)); },
        IstenilenBelgeEkle: function (p) {
            var d = p.dok || {};
            var b = null;
            istenilen.forEach(function (x) { if (x.IstekBelgeID == d.IstekBelgeID) { b = x; } });
            if (!b) { return fail('İstenen belge bulunamadı'); }
            if (!b.ID) { b.ID = nid(); }
            b.Boyut = d.Boyut || '1.00 Kb';
            b.Type = d.Type || '.pdf';
            b.MevcutDosya = (d.Adi || b.Adi) + (d.Type || '');
            return ok(istenilen.map(istView));
        },
        TumIstenilenBel: function () { return ok(clone(tumIstenilen)); },
        BelgeAktif: function (p) {
            var b = p.bel || {}, hit = null;
            tumIstenilen.forEach(function (x) { if ((b.BelgeID && x.BelgeID == b.BelgeID) || (!b.BelgeID && x.BelgeAdi === b.BelgeAdi)) { hit = x; } });
            if (hit) { hit.IsAktif = !!b.IsAktif; }
            else { tumIstenilen.push({ BelgeID: nid(), BelgeAdi: b.BelgeAdi, IsAktif: !!b.IsAktif }); }
            return ok(clone(tumIstenilen));
        },
        Son20Kullanici: function () { return ok(son20()); },
        KullaniciArama: function (p) {
            var q = ((p && p.search) || '').toLocaleLowerCase('tr');
            return ok(users.filter(function (u) { return (u.Ad + ' ' + u.Soyad + ' ' + u.Mail).toLocaleLowerCase('tr').indexOf(q) > -1; }).map(userRow));
        },
        KullaniciDetay: function (p) {
            var u = null;
            users.forEach(function (x) { if (x.KullaniciID == p.kId) { u = x; } });
            if (!u) { return fail('Kullanıcı bulunamadı'); }
            return ok({
                KullaniciID: u.KullaniciID, Ad: u.Ad, Soyad: u.Soyad, Mail: u.Mail, Telefon: u.Telefon, Parola: '',
                IsAktif: u.IsAktif, Ref_Unvan: String(u.Ref_Unvan),
                Yetkiler: u.Yetkiler.map(function (id) { return { Ref_YetkiID: id }; })
            });
        },
        KullaniciKaydet: function (p) {
            var k = p.Kull || {};
            var ids = (p.Yetkiler || []).filter(function (y) { return y.Value; }).map(function (y) { return y.YetkiID; });
            var u = null;
            users.forEach(function (x) { if (k.KullaniciID && x.KullaniciID == k.KullaniciID) { u = x; } });
            if (!u) { u = { KullaniciID: nid() }; users.push(u); }
            u.Ad = k.Ad; u.Soyad = k.Soyad; u.Mail = k.Mail; u.Telefon = k.Telefon;
            u.IsAktif = k.IsAktif !== false; u.Ref_Unvan = parseInt(k.Ref_Unvan, 10) || 3; u.Yetkiler = ids;
            return ok(son20());
        },
        FirmaYetkileri: function () { return ok(clone(yetkiler)); },
        YetkiOlustur: function (p) {
            var y = p.yetki || {};
            var hit = null;
            yetkiler.forEach(function (x) { if (y.YetkiID && x.YetkiID == y.YetkiID) { hit = x; } });
            if (hit) { hit.YetkiAdi = y.YetkiAdi; hit.Duzenleme = !!y.Duzenleme; hit.IsAktif = y.IsAktif !== false; }
            else { yetkiler.push({ YetkiID: nid(), YetkiAdi: y.YetkiAdi, Duzenleme: !!y.Duzenleme, IsAktif: y.IsAktif !== false }); }
            return ok(clone(yetkiler));
        },
        MailKontrol: function (p) {
            var kullanilmis = users.some(function (u) { return u.Mail === p.m && u.KullaniciID != p.Id; });
            return ok(!kullanilmis);
        },
        FirmaKayit: function () { return ok(true, 'Demo sürümünde firma kaydı yapılmaz; bu işlem hiçbir yere kaydedilmedi.'); },
        Userp: function (p) {
            if (p.Formdata2 !== DEMO.pass) { return ok(false, 'Mevcut parola hatalı.'); }
            return ok(true, 'Parola değiştirildi (demo sürümünde demo hesabın parolası gerçekte değişmez).');
        },
        HelloWord: function () { return ok('Hello'); }
    };

    function handle(name, payload) {
        if (M.hasOwnProperty(name)) { return M[name](payload || {}); }
        return fail('Demo sürümünde bu işlem desteklenmiyor: ' + name);
    }

    // $http isteklerini yakala (yalnız DocService.asmx; şablonlar ve dosyalar normal yüklenir)
    angular.module('myApp').config(['$provide', function ($provide) {
        $provide.decorator('$httpBackend', ['$delegate', function ($delegate) {
            return function (method, url, post, callback) {
                var m = /DocService\.asmx\/([A-Za-z0-9_]+)/.exec(url);
                if (!m) { return $delegate.apply(this, arguments); }
                var payload = {};
                try { payload = post ? JSON.parse(post) : {}; } catch (e) { payload = {}; }
                var res;
                try { res = handle(m[1], payload); } catch (e) { res = fail('Demo hatası: ' + e.message); }
                setTimeout(function () { callback(200, JSON.stringify(res), 'Content-Type: application/json\r\n', 'OK'); }, 120);
            };
        }]);
    }]);

    // Belge önizleme: orijinalde sunucudaki Onizleme.aspx; demoda örnek dosyalar gösterilir
    window.DemoOnizleme = function (id, tur) {
        var t = (tur || '').toLowerCase();
        if (t === '.pdf') { return 'demo-files/ornek.pdf'; }
        if (t === '.png' || t === '.jpg' || t === '.jpeg') { return 'demo-files/ornek.png'; }
        return 'demo-files/ornek.html?tur=' + encodeURIComponent(t);
    };
}());

using System;
using System.Collections.Generic;
using System.IO;
using ICSharpCode.SharpZipLib.Zip;
using System.Linq;
using System.Web;
using System.Web.Services;
using static DokumanYonetimi.DbClass.Yardimci;

namespace DokumanYonetimi
{
    /// <summary>
    /// Summary description for DocService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class DocService : System.Web.Services.WebService
    {

        //DataClassesDataContext Mydata = new DataClassesDataContext();
        DocumentDBDataContext mydata = new DocumentDBDataContext();
        public class Tbl_DokumanB : Tbl_Dokuman
        {
            public string Byte { get; set; }
            public bool Kisisel { get; set; }
            public int IstekBelgeID { get; set; }
        }
        public class Sonuc
        {
            public bool success { get; set; }
            public string message { get; set; }
            public object Data { get; set; }
        }
        public Sonuc SonucGoster(object Data, string message, bool success)
        {
            Sonuc s = new Sonuc();
            s.Data = Data;
            s.message = message;
            s.success = success;
            return s;
        }
        public cookie GetCookie(string key)
        {
            try
            {
                HttpCookie cookie = Context.Request.Cookies[key];
                var sonuc = JSS.Deserialize<cookie>(Decode(cookie.Value));
                return sonuc;
            }
            catch (Exception)
            {

                return null;
            }

        }
        public bool Yetki(int yetki)
        {
            cookie sonuc = GetCookie("global");
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan == 3)
                {
                    return sonuc.Yetkiler.Contains(yetki);
                }
                else
                {
                    return true;
                }
            }
            return false;
        }
        public bool YetkiDuzenleme(List<Tnm_Yetki> dokyetki, cookie sonuc)
        {
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan == 3)
                {
                    if (dokyetki.Count > 0)
                    {
                        if (sonuc.Yetkiler.Count > 0)
                        {
                            var yetsonuc = dokyetki.FindAll(y => sonuc.Yetkiler.Contains(y.YetkiID));
                            foreach (var item in yetsonuc)
                            {
                                if (item.Duzenleme)
                                {
                                    return true;
                                }
                            }
                            return false;
                        }
                    }
                    return false;
                }
                else
                {
                    return true;
                }
            }
            return false;
        }
        public bool YetkiGoruntulme(List<Tnm_Yetki> dokyetki, cookie sonuc)
        {
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan == 3)
                {
                    if (dokyetki.Count == 0)
                    {
                        return true;
                    }
                    return dokyetki.Find(y => sonuc.Yetkiler.Contains(y.YetkiID)) != null ? true : false;
                }
                else
                {
                    return true;
                }
            }
            return false;
        }
        public List<Tnm_Yetki> DokumanYetkileri(int Id)
        {
            var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                where a.IsAktif && a.Ref_KlasorID == Id
                                select b).ToList();
            return dokumanyetki;
        }
        public string CreateFile(string path, string fileName, byte[] byteArray)
        {
            try
            {
                string mPath = HttpContext.Current.Server.MapPath("~/docs" + path);
                if (!System.IO.Directory.Exists(mPath))
                    System.IO.Directory.CreateDirectory(mPath);

                mPath = Path.Combine(mPath, fileName);
                //if (mPath.Length > 260)
                //{
                //    mPath.StartsWith(@"\\?\");
                //}
                using (var fs = new FileStream(mPath, FileMode.Create, FileAccess.ReadWrite))
                {
                    fs.Write(byteArray, 0, byteArray.Length);
                    fs.Close();
                    //if (fileName.Contains(".zip"))
                    //{
                    //    ZipFile.ExtractToDirectory(path, path.Replace(fileName, ""));
                    //    File.Delete(path);
                    //}
                }


                return "true";
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Exception caught in process: {0}", ex);
                return ex.Message;
            }

        }
        public string DeleteFile(string path, string fileName)
        {

            try
            {
                path = HttpContext.Current.Server.MapPath("~/docs/" + path);
                path += fileName;
                File.Delete(path);
                return "true";
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Exception caught in process: {0}", ex);
                return ex.Message;
            }

        }
        public Sonuc DosyaKaydet(string path, string fileName, string byteArray2)
        {
            //string hatalifile = "";
            //path = path.Replace("-", "/");
            //path = path != "" ? path += "/" : path;

            try
            {
                //Jss.MaxJsonLength = Int32.MaxValue;
                List<byte> intList = byteArray2.Split(',').Select(Byte.Parse).ToList();
                byte[] byteArray = intList.ToArray();
                var a = CreateFile(path, fileName, byteArray);
                if (a == "true")
                {
                    return SonucGoster(null, a, true);
                }
                else
                {
                    return SonucGoster(null, a, false);
                }

            }
            catch (Exception)
            {
                throw;
            }

        }
        public Tbl_Dokuman GetPath(int Id)
        {
            cookie sonuc = GetCookie("global");
            var dokumanyetki = DokumanYetkileri(Id);

            if (YetkiGoruntulme(dokumanyetki, sonuc))
            {
                var data = (from a in mydata.Tbl_Dokuman where a.ID == Id select a).FirstOrDefault();
                if (data.IsFolder)
                {
                    return new Tbl_Dokuman() { Path = Decode(data.Path) + data.ID };
                }
                else
                {
                    return new Tbl_Dokuman() { Path = Decode(data.Path) + data.GuId + data.Type, Adi = data.Adi + data.Type };
                }
            }
            return new Tbl_Dokuman();

        }
        public bool TumYetkileriKaldir(int yetkiId, bool aktif)
        {
            try
            {
                var kullyet = (from a in mydata.Tbl_KullaniciYetki where a.Ref_YetkiID == yetkiId select a);
                var dokyet = (from a in mydata.Tbl_DokumanYetki where a.Ref_YetkiID == yetkiId select a);
                foreach (var item in kullyet)
                {
                    item.IsAktif = aktif;
                }
                foreach (var item in dokyet)
                {
                    item.IsAktif = aktif;
                }
                mydata.SubmitChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public bool KisiselDizinkontrol(int? dokId, int? uId)
        {
            int? ustId = dokId;
            while (ustId != null)
            {
                if (ustId == uId)
                {
                    return true;
                }
                ustId = (from a in mydata.Tbl_Dokuman where a.ID == ustId select a.UstID).FirstOrDefault();

            }
            return false;
        }
        [WebMethod]
        public void HelloWord()
        {
            List<int> idler = new List<int>();
            idler.Add(27);
            idler.AddRange(UstIdler(idler));
            Context.Response.Write(String.Join(", ", idler.ToArray()));
        }
        public List<int> UstIdler(List<int> ids)
        {
            var data = (from a in mydata.Tbl_Dokuman where a.IsFolder && a.IsAktif && ids.Contains((int)a.UstID) select (int)a.ID).ToList<int>();
            if (data.Count > 0)
            {
                List<int> aaaa = UstIdler(data);
                data.AddRange(aaaa);
            }
            return data;
        }

        [WebMethod(EnableSession = true)]
        public Sonuc Login(string email, string password)
        {
            try
            {
                var data = (from a in mydata.Tbl_Kullanici
                            where a.IsAktif && a.Mail == email && a.Parola == password
                            select new
                            {
                                KullaniciAdSoyad = a.Ad + " " + a.Soyad,
                                a.KullaniciID,
                                Yetkiler = (from y in mydata.Tbl_KullaniciYetki where y.IsAktif && y.Ref_KullaniciID == a.KullaniciID select y.Ref_YetkiID).ToList(),
                                a.Ref_FirmaID,
                                a.IsAktif,
                                a.Ref_Unvan,
                                a.KullaniciPath,
                                FPath = a.Ref_FirmaID != 0 ? (from z in mydata.Tbl_Firma where z.FirmaID == a.Ref_FirmaID select z.FirmaDokPath).FirstOrDefault() : 0
                            }).FirstOrDefault();

                if (data != null)
                {
                    HttpCookie cookiee = new HttpCookie("global")
                    {
                        Expires = DateTime.Now.AddDays(1),
                        Value = Encode(JSS.Serialize(data)),
                        HttpOnly = true
                    };

                    Context.Response.Cookies.Add(cookiee);
                    HttpContext.Current.Response.AppendCookie(cookiee);
                    return SonucGoster(data, "Ok", true);
                }
                return SonucGoster(null, "Böyle Bir Kullanıcı Bulunamadı", false);
            }
            catch (Exception)
            {

                return SonucGoster(null, "Sunucu Erişim Hatası İnternetinizi Kontrol Ediniz", false);
            }
        }
        [WebMethod]
        public Sonuc Son20Kullanici()
        {
            cookie sonuc = GetCookie("global");
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan != 3)
                {
                    var data = (from a in mydata.Tbl_Kullanici
                                where a.Ref_FirmaID == sonuc.Ref_FirmaID
                                orderby a.KullaniciID descending
                                select new
                                {
                                    AdSoyad = a.Ad + " " + a.Soyad,
                                    a.Mail,
                                    Unvan = (from b in mydata.Tnm_Unvan where b.UnvanId == a.Ref_Unvan select b.UnvanAdi).FirstOrDefault(),
                                    a.KullaniciID,
                                    a.IsAktif
                                }).ToList();
                    return SonucGoster(data, "Ok", true);
                }
            }

            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc KullaniciArama(string search)
        {
            cookie sonuc = GetCookie("global");
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan != 3)
                {
                    var data = (from a in mydata.Tbl_Kullanici
                                where (a.Ad.Contains(search) || a.Soyad.Contains(search)) && a.Ref_FirmaID == sonuc.Ref_FirmaID
                                select new
                                {
                                    AdSoyad = a.Ad + " " + a.Soyad,
                                    a.Mail,
                                    Unvan = (from b in mydata.Tnm_Unvan where b.UnvanId == a.Ref_Unvan select b.UnvanAdi).FirstOrDefault(),
                                    a.KullaniciID,
                                    a.IsAktif
                                }).ToList();
                    return SonucGoster(data, "Ok", true);
                }
            }

            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc KullaniciDetay(int kId)
        {
            cookie sonuc = GetCookie("global");
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan != 3)
                {
                    var data = (from a in mydata.Tbl_Kullanici
                                where a.KullaniciID == kId
                                select new
                                {
                                    AdSoyad = a.Ad + " " + a.Soyad,
                                    a.Ad,
                                    a.Soyad,
                                    a.Mail,
                                    Ref_Unvan = a.Ref_Unvan.ToString(),
                                    a.Telefon,
                                    Yetkiler = (from y in mydata.Tbl_KullaniciYetki where y.IsAktif && y.Ref_KullaniciID == a.KullaniciID select new { y.Ref_YetkiID, Value = true }),
                                    a.KullaniciID,
                                    a.IsAktif
                                }).FirstOrDefault();
                    return SonucGoster(data, "Ok", true);
                }
            }

            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc FirmaYetkileri()
        {
            cookie sonuc = GetCookie("global");
            if (sonuc != null)
            {
                if (sonuc.Ref_Unvan != 3)
                {
                    var yetkiler = (from a in mydata.Tnm_Yetki where a.Ref_FirmaID == sonuc.Ref_FirmaID select new { a.YetkiAdi, a.YetkiID, a.Duzenleme, a.IsAktif, Value = false }).ToList();

                    return SonucGoster(yetkiler, "Ok", true);
                }
            }

            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc KullaniciKaydet(Tbl_Kullanici Kull, List<KullaniciYetki> Yetkiler)
        {
            try
            {
                if (Yetki(1))
                {
                    cookie sonuc = GetCookie("global");
                    if (Kull.KullaniciID == 0)
                    {
                        Kull.IsAktif = true;
                        Kull.KayitTarihi = DateTime.Now;
                        Kull.KullaniciOnay = sonuc.KullaniciID;
                        Kull.Ref_FirmaID = (sonuc.Ref_Unvan == 1 && Kull.Ref_FirmaID != 0) ? Kull.Ref_FirmaID : sonuc.Ref_FirmaID;
                        mydata.Tbl_Kullanici.InsertOnSubmit(Kull);
                        mydata.SubmitChanges();
                        foreach (var yetki in Yetkiler)
                        {
                            if (yetki.Value)
                            {
                                mydata.Tbl_KullaniciYetki.InsertOnSubmit(new Tbl_KullaniciYetki() { Ref_KullaniciID = Kull.KullaniciID, Ref_YetkiID = yetki.YetkiID, IsAktif = yetki.Value });
                            }
                        }
                        List<Tbl_DokumanB> kisisel = new List<Tbl_DokumanB>();
                        kisisel.Add(new Tbl_DokumanB() { Adi = Kull.Ad + " " + Kull.Soyad, IsFolder = true, UstID = (from a in mydata.Tbl_Firma where a.FirmaID == Kull.Ref_FirmaID select a.FirmaPath).FirstOrDefault(), Kisisel = true });
                        Sonuc ss = DokumanEkle(kisisel);
                        Kull.KullaniciPath = Int32.Parse(ss.Data.ToString());
                        mydata.SubmitChanges();
                    }
                    else
                    {
                        var data = (from a in mydata.Tbl_Kullanici where a.IsAktif && a.KullaniciID == Kull.KullaniciID select a).FirstOrDefault();
                        data.Ad = Kull.Ad;
                        data.Soyad = Kull.Soyad;
                        data.IsAktif = Kull.IsAktif;
                        data.Mail = Kull.Mail;
                        data.Ref_Unvan = Kull.Ref_Unvan;
                        data.Telefon = Kull.Telefon;

                        var kulYetkiler = (from a in mydata.Tbl_KullaniciYetki where a.Ref_KullaniciID == Kull.KullaniciID select a).ToList();
                        foreach (var yetki in Yetkiler)
                        {
                            var aranan = kulYetkiler.Find(x => x.Ref_YetkiID == yetki.YetkiID);
                            if (aranan != null)
                            {
                                aranan.IsAktif = yetki.Value;
                            }
                            else
                            {
                                if (yetki.Value)
                                {
                                    mydata.Tbl_KullaniciYetki.InsertOnSubmit(new Tbl_KullaniciYetki() { Ref_KullaniciID = Kull.KullaniciID, Ref_YetkiID = yetki.YetkiID, IsAktif = yetki.Value });
                                }
                            }

                        }
                    }
                    mydata.SubmitChanges();
                    return Son20Kullanici();
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }

            catch (Exception)
            {

                return SonucGoster(null, "Beklenmedik Hata", false);
            }

        }
        [WebMethod]
        public Sonuc DokumanEkle(List<Tbl_DokumanB> docs)
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                    join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                    where a.IsAktif && a.Ref_KlasorID == docs[0].UstID
                                    select b).ToList();
                if (YetkiDuzenleme(dokumanyetki, sonuc) || KisiselDizinkontrol(docs[0].UstID, sonuc.KullaniciPath))
                {
                    foreach (var dok in docs)
                    {
                        //string ssss = (from a in mydata.Tbl_Dokuman where a.ID == dok.UstID select new { p = a.Path + (dok.IsFolder ? (a.UstID!=null? a.UstID.ToString():"") : a.GuId.ToString()) }).FirstOrDefault().p;
                        var sss = GetPath((int)dok.UstID);

                        Tbl_Dokuman newdoc = new Tbl_Dokuman()
                        {

                            GuId = Guid.NewGuid(),
                            IsAktif = true,
                            IsSil = false,
                            OlusKullanici = sonuc.KullaniciID,
                            OlusTarihi = DateTime.Now,
                            SonDuzKullanici = sonuc.KullaniciID,
                            SonDuzTarihi = DateTime.Now,
                            Arsiv = false,
                            //Path = dok.UstID != null ? (from a in mydata.Tbl_Dokuman where a.ID == dok.UstID select new { p = a.Path + a.GuId.ToString() }).FirstOrDefault().p + "/" : "docs/",
                            Path = Encode("/" + sss.Path + "/"),
                            Adi = dok.Type != null ? dok.Adi.Replace(dok.Type, "") : dok.Adi,
                            Boyut = dok.Boyut,
                            IsFolder = dok.IsFolder,
                            Type = dok.Type,
                            UstID = dok.UstID,
                            DocRevNo = dok.DocRevNo,
                            DocRevTar = dok.DocRevTar
                        };
                        mydata.Tbl_Dokuman.InsertOnSubmit(newdoc);
                        //mydata.SubmitChanges();

                        if (!dok.IsFolder)
                        {
                            Sonuc s = DosyaKaydet(Decode(newdoc.Path), newdoc.GuId.ToString() + newdoc.Type, dok.Byte);
                            if (!s.success)
                            {
                                return SonucGoster(null, "Doküman oluşturulamadı", false);
                            }
                        }
                        //else
                        //{
                        //    newdoc.Path = newdoc.Path + newdoc.ID + "/";
                        //}
                        mydata.SubmitChanges();
                        dok.ID = newdoc.ID;
                    }
                    if (docs[0].UstID != null && !docs[0].Kisisel)
                    {
                        return DokumanListele((int)docs[0].UstID);
                    }
                    else if (docs[0].Kisisel)
                    {
                        return SonucGoster(docs[0].ID, "OK", true);
                    }
                    else
                    {
                        return Anadizin();
                    }
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception ex)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc DokumanDuzenleme(int DokID, string YeniAd, List<KullaniciYetki> Yetkiler)
        {
            cookie sonuc = GetCookie("global");
            var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                where a.IsAktif && a.Ref_KlasorID == DokID
                                select b).ToList();
            if (YetkiDuzenleme(dokumanyetki, sonuc))
            {
                var data = (from a in mydata.Tbl_Dokuman where a.ID == DokID select a).FirstOrDefault();
                data.Adi = YeniAd;
                data.SonDuzKullanici = sonuc.KullaniciID;
                data.SonDuzTarihi = DateTime.Now;
                if (Yetkiler.Count > 0)
                {
                    foreach (var yetki in Yetkiler)
                    {
                        var d = (from a in dokumanyetki where a.YetkiID == yetki.YetkiID select a).FirstOrDefault();
                        if (d == null && yetki.Value)
                        {
                            mydata.Tbl_DokumanYetki.InsertOnSubmit(new Tbl_DokumanYetki() { Ref_KlasorID = DokID, Ref_YetkiID = yetki.YetkiID, IsAktif = yetki.Value });
                        }
                        else if (d != null && d.IsAktif != yetki.Value)
                        {
                            var y = (from a in mydata.Tbl_DokumanYetki where a.Ref_KlasorID == DokID && a.Ref_YetkiID == yetki.YetkiID select a).FirstOrDefault();
                            y.IsAktif = yetki.Value;
                        }
                    }
                }
                mydata.SubmitChanges();
                return DokumanListele((int)data.UstID);
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc DokumanRevizeEt(Tbl_DokumanB doc)
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                    join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                    where a.IsAktif && a.Ref_KlasorID == doc.ID
                                    select b).ToList();
                if (YetkiDuzenleme(dokumanyetki, sonuc))
                {
                    if (doc.Type != null)
                    {
                        var data = (from a in mydata.Tbl_Dokuman where a.ID == doc.ID select a).FirstOrDefault();
                        doc.ID = 0;
                        doc.Kisisel = true;
                        List<Tbl_DokumanB> rev = new List<Tbl_DokumanB>();
                        rev.Add(doc);
                        Sonuc newdoc = DokumanEkle(rev);
                        if (newdoc.Data == null)
                        {
                            SonucGoster(null, newdoc.message, false);
                        }
                        data.IsAktif = false;
                        data.SonDuzKullanici = sonuc.KullaniciID;
                        data.SonDuzTarihi = DateTime.Now;
                        mydata.SubmitChanges();

                        return DokumanListele((int)doc.UstID);
                    }
                    return SonucGoster(null, "Klasörler Revize Edilemez", false);
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc DokumanSil(int DocId)
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                    join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                    where a.IsAktif && a.Ref_KlasorID == DocId
                                    select b).ToList();
                if (YetkiDuzenleme(dokumanyetki, sonuc))
                {
                    var doc = (from a in mydata.Tbl_Dokuman where a.ID == DocId select a).FirstOrDefault();
                    if (doc.Type == null)
                    {
                        var altdokumanlar = (from a in mydata.Tbl_Dokuman where a.UstID == DocId select a);
                        foreach (var item in altdokumanlar)
                        {
                            item.IsAktif = false;
                            item.IsSil = false;
                            item.SonDuzKullanici = sonuc.KullaniciID;
                            item.SonDuzTarihi = DateTime.Now;
                        }
                    }
                    doc.IsAktif = false;
                    doc.IsSil = false;
                    doc.SonDuzKullanici = sonuc.KullaniciID;
                    doc.SonDuzTarihi = DateTime.Now;
                    mydata.SubmitChanges();
                    return DokumanListele((int)doc.UstID);
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc ArsiveEkle(int DocId)
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                    join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                    where a.IsAktif && a.Ref_KlasorID == DocId
                                    select b).ToList();
                if (YetkiDuzenleme(dokumanyetki, sonuc))
                {
                    var doc = (from a in mydata.Tbl_Dokuman where a.ID == DocId select a).FirstOrDefault();
                    if (doc.Type != null)
                    {
                        doc.Arsiv = !doc.Arsiv;
                        doc.SonDuzKullanici = sonuc.KullaniciID;
                        doc.SonDuzTarihi = DateTime.Now;
                        mydata.SubmitChanges();
                        if (!doc.Arsiv)
                        {
                            return ArsivleriListele();
                        }

                    }
                    return DokumanListele((int)doc.UstID);

                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }

        [WebMethod]
        public Sonuc ArsivleriListele()
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var anadizin = (from a in mydata.Tbl_Firma where a.FirmaID == sonuc.Ref_FirmaID select a.FirmaDokPath).FirstOrDefault();
                var dokumanyetki = DokumanYetkileri(anadizin);
                if (YetkiGoruntulme(dokumanyetki, sonuc))
                {
                    List<int> idler = new List<int>();
                    idler.Add(anadizin);
                    idler.AddRange(UstIdler(idler));
                    var dokumalar = (from a in mydata.Tbl_Dokuman where a.IsAktif && !a.IsSil && a.Arsiv && !a.IsFolder && idler.Contains((int)a.UstID) select new { a.Adi, a.Boyut, a.DocRevNo, a.DocRevTar, a.ID, a.IsFolder, a.Arsiv, SonDuzTarihi = TarihFormat(a.SonDuzTarihi), a.Type, a.UstID, Yetki = YetkiGoruntulme(DokumanYetkileri(a.ID), sonuc), Duzenleme = YetkiDuzenleme(DokumanYetkileri(a.ID), sonuc) }).ToList();
                    return SonucGoster(dokumalar, "Ok", true);
                    //System.Web.Script.Serialization.JavaScriptSerializer jss = new System.Web.Script.Serialization.JavaScriptSerializer();
                    //Context.Response.Write(jss.Serialize(dokumalar));
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc DokumanListele(int uId)
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var dokumanyetki = DokumanYetkileri(uId);
                if (YetkiGoruntulme(dokumanyetki, sonuc))
                {
                    var dokumalar = (from a in mydata.Tbl_Dokuman where a.IsAktif && a.UstID == uId && !a.IsSil && !a.Arsiv select new { a.Adi, a.Boyut, a.DocRevNo, a.DocRevTar, a.ID, a.IsFolder, SonDuzTarihi = TarihFormat(a.SonDuzTarihi), a.Type, a.Arsiv, a.UstID, Yetki = YetkiGoruntulme(DokumanYetkileri(a.ID), sonuc), Duzenleme = YetkiDuzenleme(DokumanYetkileri(a.ID), sonuc) }).ToList();
                    return SonucGoster(dokumalar, "Ok", true);
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc Anadizin()
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var anadizin = (from a in mydata.Tbl_Firma where a.FirmaID == sonuc.Ref_FirmaID select a.FirmaDokPath).FirstOrDefault();
                var dokumanyetki = DokumanYetkileri(anadizin);
                if (YetkiGoruntulme(dokumanyetki, sonuc))
                {
                    var dokumalar = (from a in mydata.Tbl_Dokuman where a.IsAktif && a.UstID == anadizin && !a.IsSil && !a.Arsiv select new { a.Adi, a.Boyut, a.DocRevNo, a.DocRevTar, a.ID, a.IsFolder, SonDuzTarihi = TarihFormat(a.SonDuzTarihi), a.Arsiv, a.Type, a.UstID, Yetki = YetkiGoruntulme(DokumanYetkileri(a.ID), sonuc), Duzenleme = YetkiDuzenleme(DokumanYetkileri(a.ID), sonuc) }).ToList();
                    return SonucGoster(dokumalar, "Ok", true);
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception)
            {
                var ex = new Exception("Beklenmedik Hata");
                throw ex;
            }
        }
        [WebMethod]
        public Sonuc KisiselDizin()
        {
            try
            {
                cookie sonuc = GetCookie("global");
                var anadizin = (from a in mydata.Tbl_Kullanici where a.KullaniciID == sonuc.KullaniciID select a.KullaniciPath).FirstOrDefault();
                var dokumalar = (from a in mydata.Tbl_Dokuman where a.IsAktif && a.UstID == anadizin && !a.IsSil && !a.Arsiv select new { a.Adi, a.Boyut, a.DocRevNo, DocRevTar = TarihFormat(a.DocRevTar), a.ID, a.IsFolder, SonDuzTarihi = TarihFormat(a.SonDuzTarihi), a.Arsiv, a.Type, a.UstID, Kdizin = true, Yetki = (a.UstID == sonuc.KullaniciPath), Duzenleme = (a.UstID == sonuc.KullaniciPath) }).ToList();
                return SonucGoster(dokumalar, "Ok", true);
            }
            catch (Exception)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc IstenilenBelgeler()
        {
            cookie user = GetCookie("global");

            if (user.Ref_FirmaID != 0 && user.KullaniciID != 0)
            {
                var data = (from a in mydata.Tbl_Firma where a.FirmaID == user.Ref_FirmaID select a.IstenilenBelgeler).FirstOrDefault();
                if (data != null)
                {
                    List<string> istenilen = data.Split(',').ToList();
                    var belgeler = (from a in mydata.Tbl_KullaniciIstekBelge
                                    join b in mydata.Tbl_Dokuman on a.Ref_DokmumanId equals b.ID
                                    where a.Ref_KullaciciID == user.KullaniciID
                                    select new { a.Ref_IstekBelgeId, b.Adi, b.ID, b.IsFolder, b.Type, b.UstID, b.Boyut }
                                  ).ToList();
                    var firmaIstek = (from a in mydata.Tnm_IstekBelge where istenilen.Contains(a.IstekBelgeID.ToString()) && a.IsAktif select a).ToList();
                    var result = (from e in firmaIstek
                                  join d in belgeler
                                  on e.IstekBelgeID equals d.Ref_IstekBelgeId into empDept
                                  from b in empDept.DefaultIfEmpty()
                                  select new
                                  {
                                      e.IstekBelgeID,
                                      Adi = e.BelgeAdi,
                                      ID = b == null ? 0 : b.ID,
                                      Type = b == null ? null : b.Type,
                                      Boyut = b == null ? null : b.Boyut,
                                      UstID = user.KullaniciPath,
                                      IsFolder = false,
                                      Byte = "",
                                      Yetki = true,
                                      MevcutDosya = b == null ? "" : b.Adi,
                                      SeciliDosya = ""
                                  }).ToList();
                    return SonucGoster(result, "Ok", true);
                }

                return SonucGoster(null, "Ok", true);
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc IstenilenBelgeEkle(Tbl_DokumanB dok)
        {
            try
            {
                cookie user = GetCookie("global");
                if (user.Ref_FirmaID != 0 && user.KullaniciID != 0)
                {
                    if (dok.ID == 0)
                    {
                        var sss = GetPath((int)dok.UstID);
                        Tbl_Dokuman newdoc = new Tbl_Dokuman()
                        {
                            GuId = Guid.NewGuid(),
                            IsAktif = true,
                            IsSil = false,
                            OlusKullanici = user.KullaniciID,
                            OlusTarihi = DateTime.Now,
                            SonDuzKullanici = user.KullaniciID,
                            SonDuzTarihi = DateTime.Now,
                            Path = Encode("/" + sss.Path + "/"),
                            Adi = dok.Type != null ? dok.Adi.Replace(dok.Type, "") : dok.Adi,
                            Boyut = dok.Boyut,
                            IsFolder = dok.IsFolder,
                            Type = dok.Type,
                            UstID = dok.UstID,
                            DocRevNo = dok.DocRevNo,
                            DocRevTar = dok.DocRevTar
                        };
                        mydata.Tbl_Dokuman.InsertOnSubmit(newdoc);

                        if (!dok.IsFolder)
                        {
                            Sonuc s = DosyaKaydet(Decode(newdoc.Path), newdoc.GuId.ToString() + newdoc.Type, dok.Byte);
                            if (!s.success)
                            {
                                return SonucGoster(null, "Doküman oluşturulamadı", false);
                            }
                        }
                        mydata.SubmitChanges();
                        Tbl_KullaniciIstekBelge newBel = new Tbl_KullaniciIstekBelge()
                        {
                            Ref_DokmumanId = newdoc.ID,
                            Ref_IstekBelgeId = dok.IstekBelgeID,
                            Ref_KullaciciID = user.KullaniciID
                        };
                        mydata.Tbl_KullaniciIstekBelge.InsertOnSubmit(newBel);
                        mydata.SubmitChanges();
                    }
                    else
                    {
                        var newdoc = (from a in mydata.Tbl_Dokuman where a.ID == dok.ID select a).FirstOrDefault();
                        newdoc.OlusTarihi = DateTime.Now;
                        newdoc.SonDuzKullanici = user.KullaniciID;
                        newdoc.Adi = dok.Adi;
                        newdoc.Boyut = dok.Boyut;
                        newdoc.Type = dok.Type;
                        Sonuc s = DosyaKaydet(newdoc.Path, newdoc.GuId.ToString() + newdoc.Type, dok.Byte);
                        mydata.SubmitChanges();
                    }

                    return IstenilenBelgeler();

                }
                return SonucGoster(null, "Yetkisiz İşlem", false);

            }
            catch (Exception ex)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        [WebMethod]
        public Sonuc YetkiOlustur(Tnm_Yetki yetki)
        {
            if (Yetki(1))
            {
                if (yetki.YetkiID == 0)
                {
                    yetki.IsAktif = true;
                    yetki.Ref_FirmaID = GetCookie("global").Ref_FirmaID;
                    mydata.Tnm_Yetki.InsertOnSubmit(yetki);
                }
                else
                {
                    var yet = (from a in mydata.Tnm_Yetki where a.YetkiID == yetki.YetkiID select a).FirstOrDefault();
                    yet.YetkiAdi = yetki.YetkiAdi;
                    yet.Duzenleme = yetki.Duzenleme;
                    if (yet.IsAktif != yetki.IsAktif)
                    {
                        if (!TumYetkileriKaldir(yet.YetkiID, yetki.IsAktif))
                        {
                            return SonucGoster(null, "Yetki Kaldırma Başarısız", false);
                        }
                        yet.IsAktif = yetki.IsAktif;
                    }


                }
                mydata.SubmitChanges();
                return FirmaYetkileri();
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc GDokumanYetki(int DokID)
        {
            cookie sonuc = GetCookie("global");
            var dokumanyetki = (from a in mydata.Tbl_DokumanYetki
                                join b in mydata.Tnm_Yetki on a.Ref_YetkiID equals b.YetkiID
                                where a.IsAktif && a.Ref_KlasorID == DokID
                                select b).ToList();
            if (YetkiDuzenleme(dokumanyetki, sonuc))
            {
                var fyetkiler = (from a in mydata.Tnm_Yetki where a.IsAktif && a.Ref_FirmaID == sonuc.Ref_FirmaID select new { a.YetkiAdi, a.YetkiID, Value = false }).ToList();
                if (dokumanyetki.Count == 0)
                {
                    return SonucGoster(fyetkiler, "Ok", true);
                }
                List<KullaniciYetki> ss = new List<KullaniciYetki>();
                foreach (var item in fyetkiler)
                {
                    var d = (from a in dokumanyetki where a.YetkiID == item.YetkiID select a.YetkiID).FirstOrDefault();
                    ss.Add(new KullaniciYetki() { YetkiID = item.YetkiID, YetkiAdi = item.YetkiAdi, Value = d != 0 ? true : false });
                }
                return SonucGoster(ss, "Ok", true);
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc FirmaKayit(Tbl_Firma nFirma, Tbl_Kullanici fYetkili)
        {
            cookie sonuc = GetCookie("global");
            if (sonuc.Ref_Unvan == 1)
            {
                Tbl_Dokuman firmapath = new Tbl_Dokuman(), fdocpath = new Tbl_Dokuman();
                firmapath.Adi = nFirma.Unvan;
                firmapath.GuId = Guid.NewGuid();
                firmapath.IsAktif = fdocpath.IsAktif = true;
                firmapath.IsFolder = fdocpath.IsFolder = true;
                firmapath.IsSil = fdocpath.IsSil = false;
                firmapath.OlusKullanici = firmapath.SonDuzKullanici = fdocpath.OlusKullanici = fdocpath.SonDuzKullanici = sonuc.KullaniciID;
                firmapath.OlusTarihi = firmapath.SonDuzTarihi = fdocpath.OlusTarihi = fdocpath.SonDuzTarihi = nFirma.KayitTarihi = DateTime.Now;
                firmapath.Path = Encode("/");
                mydata.Tbl_Dokuman.InsertOnSubmit(firmapath);
                mydata.SubmitChanges();
                if (firmapath.ID == 0)
                {
                    return SonucGoster(null, "Firma Path Oluşturulamadı", false);
                }
                fdocpath.Adi = "Tüm Dosyalar";
                fdocpath.GuId = Guid.NewGuid();
                fdocpath.UstID = firmapath.ID;
                fdocpath.Path = Encode("/" + firmapath.ID + "/");
                mydata.Tbl_Dokuman.InsertOnSubmit(fdocpath);
                mydata.SubmitChanges();
                if (fdocpath.ID == 0)
                {
                    return SonucGoster(null, "Doküman Path Oluşturulamadı", false);
                }
                nFirma.FirmaPath = firmapath.ID;
                nFirma.FirmaDokPath = fdocpath.ID;
                nFirma.IsAktif = true;
                mydata.Tbl_Firma.InsertOnSubmit(nFirma);
                mydata.SubmitChanges();
                fYetkili.Ref_FirmaID = nFirma.FirmaID;
                fYetkili.Ref_Unvan = 2;
                fYetkili.Ad.Replace("İ", "I");
                fYetkili.Soyad.Replace("İ", "I");
                Sonuc ss = KullaniciKaydet(fYetkili, new List<KullaniciYetki>());
                return SonucGoster(null, "Firma oluşturma Başarılı", true);
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc TumIstenilenBel()
        {
            cookie user = GetCookie("global");
            if (Yetki(1))
            {
                var fbel = (from a in mydata.Tbl_Firma where a.FirmaID == user.Ref_FirmaID select a.IstenilenBelgeler).FirstOrDefault();
                List<string> istenilen = fbel != null ? fbel.Split(',').ToList() : new List<string>();
                var tbel = (from a in mydata.Tnm_IstekBelge where a.IsAktif orderby a.BelgeAdi select new { a.BelgeAdi, a.IstekBelgeID, IsAktif = istenilen.Contains(a.IstekBelgeID.ToString()) }).ToList();


                return SonucGoster(tbel, "Ok", true);
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc BelgeAktif(Tnm_IstekBelge bel)
        {
            cookie user = GetCookie("global");
            if (Yetki(1))
            {
                if (bel.IstekBelgeID != 0)
                {
                    var data = (from a in mydata.Tbl_Firma where a.IsAktif && a.FirmaID == user.Ref_FirmaID select a).FirstOrDefault();
                    if (data != null)
                    {
                        List<string> istenilen = data.IstenilenBelgeler != null ? data.IstenilenBelgeler.Split(',').ToList() : new List<string>();
                        if (bel.IsAktif)
                        {
                            if (!istenilen.Contains(bel.IstekBelgeID.ToString()))
                            {
                                istenilen.Add(bel.IstekBelgeID.ToString());
                            }

                        }
                        else
                        {
                            istenilen.Remove(bel.IstekBelgeID.ToString());
                        }
                        data.IstenilenBelgeler = String.Join(",", istenilen.ToArray());
                    }
                }
                else
                {
                    Tnm_IstekBelge ynBel = new Tnm_IstekBelge()
                    {
                        BelgeAdi = bel.BelgeAdi,
                        IsAktif = true

                    };
                    mydata.Tnm_IstekBelge.InsertOnSubmit(ynBel);


                }
                mydata.SubmitChanges();
                return TumIstenilenBel();
            }
            return SonucGoster(null, "Yetkisiz İşlem", false);
        }
        [WebMethod]
        public Sonuc MailKontrol(string m, int Id)
        {
            if (Yetki(1))
            {
                var data = (from a in mydata.Tbl_Kullanici where a.Mail == m select a.KullaniciID).FirstOrDefault();
                if (data != 0 && (data != Id || Id == 0))
                {
                    return SonucGoster(false, "Ok", true);
                }
                return SonucGoster(true, "Ok", true);
            }
            return SonucGoster(null, "Yetkisiz İşlem", true);
        }
        [WebMethod]
        public Sonuc Userp(string Formdata, string Formdata2)
        {
            try
            {
                cookie user = GetCookie("global");

                if (user != null && user.KullaniciID != 0)
                {
                    var nwu = (from a in mydata.Tbl_Kullanici where a.KullaniciID == user.KullaniciID select a).FirstOrDefault();
                    if (nwu.Parola == Formdata2)
                    {
                        nwu.Parola = Formdata;
                        mydata.SubmitChanges();
                        return SonucGoster(true, "Kayıt Başarılı", true);
                    }
                    return SonucGoster(false, "Eski Parola Hatalı", true);
                }
                return SonucGoster(null, "Yetkisiz İşlem", false);
            }
            catch (Exception ex)
            {
                return SonucGoster(null, "Beklenmedik Hata", false);
            }
        }
        
    }
}
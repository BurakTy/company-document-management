using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DokumanYonetimi.DbClass
{
    public static class Yardimci
    {
        public static System.Web.Script.Serialization.JavaScriptSerializer JSS = new System.Web.Script.Serialization.JavaScriptSerializer();
        public class Document
        {
            public int ID { get; set; }
            public string Adi { get; set; }
            public bool IsFolder { get; set; }
            public string Type { get; set; }
            public string Boyut { get; set; }
        }

        public class cookie
        {
            public int KullaniciID;
            public List<int> Yetkiler;
            public int Ref_FirmaID;
            public int Ref_Unvan;
            public int KullaniciPath;
            public int FPath;
           // public string KullaniciAdSoyad;
            //public bool IsAktif;
        }
        
        public class KullaniciYetki :Tnm_Yetki
        {
            public bool Value { get; set; }
        }

        public static string TarihFormatSaat(DateTime? Tarih)
        {
            if (Tarih != null)
            {
                DateTime _x = Convert.ToDateTime(Tarih);
                string _tarih = _x.ToString("dd.MM.yyyy HH:mm");
                return _tarih;
            }
            else
            {
                return null;
            }
        }
        public static string TarihFormat(DateTime? Tarih)
        {
            if (Tarih != null)
            {
                DateTime _x = Convert.ToDateTime(Tarih);
                string _tarih = _x.ToString("dd.MM.yyyy");
                return _tarih;
            }
            else
            {
                return null;
            }
        }

        public static string Decode(string input2)
        {
            try
            {
                string input = HttpUtility.UrlDecode(input2);
                input = swapUrl(input);
                var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

                var output = "";
                int? chr1;
                int? chr2;
                int? chr3;
                int? enc1;
                int? enc2;
                int? enc3;
                int? enc4;
                int i = 0;
                input = input.Replace(@"/[^A - Za - z0 - 9\+\/\=] / g", "");

                do
                {
                    enc1 = keyStr.IndexOf(input[i++]);
                    enc2 = keyStr.IndexOf(input[i++]);
                    enc3 = keyStr.IndexOf(input[i++]);
                    enc4 = keyStr.IndexOf(input[i++]);

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + Convert.ToChar(chr1).ToString();

                    if (enc3 != 64)
                    {
                        output = output + Convert.ToChar(chr2).ToString();
                    }
                    if (enc4 != 64)
                    {
                        output = output + Convert.ToChar(chr3).ToString();
                    }

                    chr1 = chr2 = chr3 = null;
                    enc1 = enc2 = enc3 = enc4 = null;

                } while (i < input.Length);

                
                return output;
            }
            catch (Exception)
            {

                return null;
            }
        }
        public static string Encode(string input)
        {

            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            var output = "";
            int? chr1;
            int? chr2;
            int? chr3;
            int? enc1;
            int? enc2;
            int? enc3;
            int? enc4;
            int i = 0;

            do
            {

                try
                {
                    if (i == 162)
                    {
                        i = 162;
                    };
                    chr1 = (i < input.Length) ? (int?)input[i++] : 0;
                    chr2 = (i < input.Length) ? (int?)input[i++] : 0;
                    chr3 = (i < input.Length) ? (int?)input[i++] : 0;

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (chr2 == 0)
                    {
                        enc3 = enc4 = 64;
                    }
                    else if (chr3 == 0)
                    {
                        enc4 = 64;
                    }

                    output = output +
                        keyStr[(int)enc1] +
                        keyStr[(int)enc2] +
                        keyStr[(int)enc3] +
                        keyStr[(int)enc4];
                    chr1 = chr2 = chr3 = null;
                    enc1 = enc2 = enc3 = enc4 = null;
                }
                catch (Exception)
                {


                }
            } while (i < input.Length);

            var sonuc1 = swapUrl(output);
            

            return HttpUtility.UrlEncode(sonuc1);
        }

        public static string swapUrl(string d)
        {
            string newd = "";
            if (d.Length % 2 == 1)
            {
                newd += d[0];
                d = d.Remove(0, 1);
            }
           
            for (int i = 0; i < d.Length/2; i++)
            {
                newd += d[(2 * i) + 1];
                newd += d[2 * i];
                // d = d.Remove(0, 2);
            }

            return newd;
        }
    }
}
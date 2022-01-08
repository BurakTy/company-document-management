using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using static DokumanYonetimi.DbClass.Yardimci;

namespace DokumanYonetimi.template
{
    public partial class Onizleme : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string m = Request.QueryString["m"];
            string tur = Request.QueryString["d"];
            if (tur == ".pdf")
            {
                tur ="1";
            }else if(tur ==".png" || tur==".jpeg" || tur == ".jpg")
            {
                tur = "2";
            }else if(tur==".doc" || tur==".docx" || tur == ".rtf")
            {
                tur = "3";
            }else if (tur == ".html" || tur == ".txt")
            {
                tur = "4";
            }
            else
            {
                tur = "0";
            }
            if (m != null && m != "" && tur != null && tur != "")
            {
                int mid = Int32.Parse(m);
                int d = Int32.Parse(tur);
                switch (d)
                {
                    
                    case 1:
                        ShowDocument(mid, "application/pdf");
                        break;
                    case 2:
                        ShowDocument(mid, "image/jpg");
                        break;
                    case 3:
                        ShowDocument(mid, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                        break;
                    case 4:
                        ShowDocument(mid, "text/html");
                        break;
                    case 0:
                        BozukDosya();
                        break;
                    default:
                        break;
                }
            }
            else
            {
                Response.Write("<script>alert('Bildiri Id Bulunamadı');</script>");
            }

        }

        public bool BozukDosya()
        {
            
            return false;
        }
        public bool ShowDocument(int bildiriId,string type)
        {
            DocService service = new DocService();
            //cookie session = service.GetCookie("global");
            try
            {
                var data = service.GetPath(bildiriId);
                string path = HttpContext.Current.Server.MapPath("~/docs/" + data.Path);
                byte[] bytes = File.ReadAllBytes(path);
                Response.ContentType = type;
                Response.AddHeader("content-disposition", "inline;filename=" + data.Adi);
                Response.Buffer = true;
                Response.Clear();
                Response.OutputStream.Write(bytes, 0, bytes.Length);
                Response.OutputStream.Flush();
                onizlemeyok.Visible = false;
                return true;
            }
            catch (Exception)
            {
               // Page.ClientScript.RegisterStartupScript(this.GetType(), "CallMyFunction", "closeAjs()", true);
                return true;
            }
        }
    }
}
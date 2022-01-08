<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="deneme.aspx.cs" Inherits="DokumanYonetimi.template.deneme" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
     <script src="//mozilla.github.io/pdf.js/build/pdf.js"></script>
</head>

<body>
    <form id="form1" runat="server">
        <div>
            <asp:TextBox ID="base64" runat="server" style="width:100%;visibility:hidden" ></asp:TextBox>
            <div id="holder" style="text-align:center"></div>
        </div>
    </form>
</body>
   
    <script>
        // If absolute URL from the remote server is provided, configure the CORS
        // header on that server.
        // var url = 'http://localhost:8081/ekspertiz_eksper%20kullanım%20kılavuzu.pdf';

        var pdfjsLib = window['pdfjs-dist/build/pdf'];

        // The workerSrc property shall be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
        var canvasContainer = document.getElementById('holder');
        // Asynchronous download of PDF
        function pdfgoster() {
            var data = document.getElementById("base64").value;
            var pdfData = atob(data);
            //var loadingTask = pdfjsLib.getDocument(url); // pdf url
            var loadingTask = pdfjsLib.getDocument({ data: pdfData }); // sadece base64 data 
            loadingTask.promise.then(function (pdf) {
                // Fetch the first page
                for (pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

                    pdf.getPage(pageNumber).then(function (page) {
                        var scale = 1.5;
                        var viewport = page.getViewport({ scale: scale });

                        // Prepare canvas using PDF page dimensions
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        //canvas.style.cssText = 'transform:scale(0.25);margin:-50% -50%;'
                        canvasContainer.appendChild(canvas);
                        // Render PDF page into canvas context
                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        var renderTask = page.render(renderContext);
                        renderTask.promise.then(function () {
                            console.log('Page rendered');
                        });
                    });
                }
            }, function (reason) {
                // PDF loading error
                console.error(reason);
            });
        }
        pdfgoster();
    </script>
</html>

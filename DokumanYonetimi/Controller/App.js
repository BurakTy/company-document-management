var app = angular.module("myApp", ['ngRoute', 'ngCookies', 'ngSanitize', 'angular-loading-bar']);

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false);

    $routeProvider
        .when("/", {
            templateUrl: "template/anasayfa.html",
            active: "",
        })
        .when("/anasayfa", {
            templateUrl: "template/anasayfa.html",
            active: ""
        })
        .when("/ayarlar", {
            templateUrl: "template/ayarlar.html",
            active: ""
        })
        .when("/firma", {
            templateUrl: "template/firma.html",
            active: ""
        })
        .when("/login", {
            templateUrl: "template/login.html",
            active: "login"
        })
        .when("/404", {
            templateUrl: 'template/404.html',
            controller: 'dort04Controller'
        })
        .otherwise({
            controller: 'dort04Controller',
            templateUrl: 'template/404.html'
        });

});
app.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    //cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Custom Loading Message...</div>';
}])
app.run(['$rootScope', '$location', '$cookieStore', '$http', 'AuthenticationService',
    function ($rootScope, $location, $cookieStore, $http,) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        $rootScope.Menu = $rootScope.Menu || $cookieStore.get('menu');
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current, newState) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path("/login")
            }
        });
    }
]);

app.filter('searchfilter', function () {
    return function (input, query) {
        query = query == undefined ? "" : query;

        query = query.toLocaleUpperCase('TR')
        return input.replace(query, '<b class="text-danger">' + query + '</b>');
    }
});

app.directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, { $event: event });
            });
        });
    };
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.controller('dort04Controller', function ($scope, $location) {
    $scope.path = $location.path();
    $scope.back = function () {
        history.back();
    };
});

app.controller("anasayfaController", ["$scope", "$timeout",
    function ($scope, $timeout) {

        $scope.Sifirla();
        $scope.encodeistbelfile_uploads = function (element, index) {

            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
                return;
            }
            var input = element;
            if (!input.files) {
                //  alert("Bu Tarayıcı dokuman yüklemeyi desteklemiyor olabilir");
            }
            else if (input.files.length > 5) {
                alertify.alert("", "Tek seferde Yanlız 5 dosya yüklenebilir")
            }
            else if (!input.files[0]) {
                // alert("Seçili döküman bulunamadı");
            }
            else {
                var accepts = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];


                let bilgi = {
                    ID: 0,
                    Adi: "",
                    IsFolder: false,
                    UstID: $scope.filelocation[$scope.filelocation.length - 1].ID,
                    Byte: "",
                    Type: "",
                    Boyut: null,
                    IstekBelgeID: 0
                }
                let file = input.files[0];

                if (!accepts.includes(file.type)) {
                    alertify.alert("", "Dosya Formatı Yanlış. Yanlız Resim ve Pdf yükleyiniz");
                    return;
                }
                // if file type could be detected
                if (file !== null && file.size > 0) {
                    var reader = new FileReader();
                    reader.onload = function () {

                        var arrayBuffer = this.result,
                            array = new Uint8Array(arrayBuffer);



                        if ($scope.SelectIstBel.ID != 0) {
                            alertify.confirm('Uyarı', 'Mevcut Dosya Değiştirilsin mi?', function () {
                                bilgi.Byte = array.toString();

                                let dokty = file.name.split(".");
                                bilgi.Type = "." + dokty[dokty.length - 1];
                                bilgi.Adi = $scope.SelectIstBel.SeciliDosya = file.name.replace(bilgi.Type, "");
                                bilgi.Type = bilgi.Type.toLowerCase();
                                if (((file.size / 1024) / 1024).toFixed(4) > 1) {
                                    bilgi.Boyut = ((file.size / 1024) / 1024).toFixed(2) + " Mb";
                                } else {
                                    bilgi.Boyut = (file.size / 1024).toFixed(2) + " Kb";
                                }
                                bilgi.UstID = $scope.SelectIstBel.UstID;
                                bilgi.ID = $scope.SelectIstBel.ID;
                                bilgi.IstekBelgeID = $scope.SelectIstBel.IstekBelgeID;
                                $scope.getAjax("IstenilenBelgeEkle", { dok: bilgi }, "IstBelgelerd", function (suc, msg) {
                                    if (suc) {
                                        $scope.IstBelgeler = $scope.IstBelgelerd
                                    } else {
                                        alertify.alert("", msg)
                                    }
                                });
                            }, function () { });
                        } else {
                            bilgi.Byte = array.toString();

                            let dokty = file.name.split(".");
                            bilgi.Type = "." + dokty[dokty.length - 1];
                            bilgi.Adi = $scope.SelectIstBel.SeciliDosya = file.name.replace(bilgi.Type, "");
                            bilgi.Type = bilgi.Type.toLowerCase();
                            if (((file.size / 1024) / 1024).toFixed(4) > 1) {
                                bilgi.Boyut = ((file.size / 1024) / 1024).toFixed(2) + " Mb";
                            } else {
                                bilgi.Boyut = (file.size / 1024).toFixed(2) + " Kb";
                            }
                            bilgi.UstID = $scope.SelectIstBel.UstID;
                            bilgi.ID = $scope.SelectIstBel.ID;
                            bilgi.IstekBelgeID = $scope.SelectIstBel.IstekBelgeID;
                            $scope.getAjax("IstenilenBelgeEkle", { dok: bilgi }, "IstBelgelerd", function (suc, msg) {
                                if (suc) {
                                    $scope.IstBelgeler = $scope.IstBelgelerd
                                } else {
                                    alertify.alert("", msg)
                                }
                            });
                        }

                    }
                    reader.readAsArrayBuffer(file);
                } else {
                    alertify.alert(file.name + " Boş");
                }
            }
        }
        $scope.encodeImgtoBase64angular = function (element) {

            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
                return;
            }
            var input = element;
            if (!input.files) {
                //  alert("Bu Tarayıcı dokuman yüklemeyi desteklemiyor olabilir");
            }
            else if (input.files.length > 5) {
                alertify.alert("", "Tek seferde Yanlız 5 dosya yüklenebilir")
            }
            else if (!input.files[0]) {
                // alert("Seçili döküman bulunamadı");
            }
            else {


                var accepts = ["application/x-zip-compressed","application/zip","text/html", "image/jpeg", "image/png", "application/pdf", "application/rtf", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingm", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];


                $scope.byteString = [];

                for (var i = 0; i < input.files.length; i++) {
                    let bilgi = {
                        ID: 0,
                        Adi: "",
                        IsFolder: false,
                        UstID: $scope.filelocation[$scope.filelocation.length - 1].ID,
                        Byte: "",
                        Type: "",
                        Boyut: null,
                    }
                    let file = input.files[i];

                    if (!accepts.includes(file.type)) {
                        continue;
                    }
                    // if file type could be detected
                    if (file !== null && file.size > 0) {
                        var reader = new FileReader();
                        reader.onload = function () {

                            var arrayBuffer = this.result,
                                array = new Uint8Array(arrayBuffer);

                            bilgi.Byte = array.toString();
                            let dokty = file.name.split(".");
                            bilgi.Type = "." + dokty[dokty.length - 1];
                            bilgi.Adi = file.name.replace(bilgi.Type, "");
                            bilgi.Type = bilgi.Type.toLowerCase();

                            if (((file.size / 1024) / 1024).toFixed(4) > 1) {
                                bilgi.Boyut = ((file.size / 1024) / 1024).toFixed(2) + " Mb";
                            } else {
                                bilgi.Boyut = (file.size / 1024).toFixed(2) + " Kb";
                            }


                            $scope.byteString.push(bilgi);
                            $scope.$apply();
                        }
                        reader.readAsArrayBuffer(file);
                    } else {
                        alertify.alert(file.name + " Boş");
                    }
                }
            }
        }
        $scope.YeniKlasorKaydet = function (adi) {
            if (adi !== "" && adi !== undefined) {
                let dok = [{
                    ID: 0,
                    Adi: adi,
                    IsFolder: true,
                    UstID: $scope.filelocation[$scope.filelocation.length - 1].ID
                }]
                $scope.DokumanKayit(dok);

            }
            $scope.ChangeTrueFalse("bosDosya", false);
            //$("#bosDosya").addClass("d-none");

        }
        $scope.BosDosyaAc = function (a) {

            $scope.ChangeTrueFalse("bosDosya", true);
            if (a == 2) {
                $scope.openDrop('yenioption2');
            } else {
                $scope.openDrop('yenioption');
            }

            //$scope.$apply();
            //$("#bosDosya").removeClass("d-none");
            $timeout(function () {
                var input = document.getElementById('bosDosyain');
                input.focus();
                input.select();

            })

        }
        $scope.YeniDokumanEkle = async function (list) {
            $scope.ChangeTrueFalse("kayitloading", true);
           // $scope.kayitloading = true;
            if (list != undefined && list.length > 0) {
                const result = await $scope.DokumanKayit(list);
                if (result) {
                    $scope.byteString = [];
                    alertify.alert("", "Yükleme Başarılı");
                    $scope.closeModal('YeniDokumanModal');
                } else {
                    alertify.alert("", "Doküman oluşturulamadı");
                }
                $scope.ChangeTrueFalse("kayitloading", false);
            } else {
                alertify.alert("Seçili Dosya Bulunamadı");
                $scope.ChangeTrueFalse("kayitloading", false);
            }
        }
        $scope.YeniDokumanZipEkle = async function (list) {
            $scope.ChangeTrueFalse("kayitloading", true);
            // $scope.kayitloading = true;
            if (list != undefined && list.length==1) {
                const result = await $scope.DokumanKayitZip(list[0]);
                if (result) {
                    $scope.byteString = [];
                    alertify.alert("", "Yükleme Başarılı");
                    $scope.closeModal('YeniDokumanModal');
                } else {
                    alertify.alert("", "Doküman oluşturulamadı");
                }
                $scope.ChangeTrueFalse("kayitloading", false);
            } else {
                alertify.alert(list != undefined?"Dosya Seçiniz":"Sadece 1 dosya seçilebilir");
                $scope.ChangeTrueFalse("kayitloading", false);
            }
        }
        $scope.RefreshList = function () {
            $scope.DokumanlisteleUst($scope.filelocation[$scope.filelocation.length - 1].ID);
        }
        // $scope.MenuSelect(2, 'IstBelgelerM');
        $scope.IstBelSelect = function (bel) {
            $('#istbelfile').trigger('click');
            $scope.SelectIstBel = bel;
        }

    }
]);
app.controller("mainController", ["$scope", "orderByFilter", '$http', 'AuthenticationService', '$rootScope',
    function ($scope, orderBy, $http, AuthenticationService, $rootScope) {

        $scope.Sifirla = function () {
            $scope.GorunumSekli('t');
            $scope.filelocation = [];
            $scope.duzenleme = false;
            $scope.GetFiles();
            $scope.GetMenus();
            $scope.Istenilen = false;
            $scope.IstBelgeler = []
            $scope.dyetkiler = []
        }


        //console.log = function () { };
        //console.error = function () { };
        //window.Error = function () { };
        $scope.GetFiles = function () {
            $scope.DokumanlisteleA();
            //$scope.GosterimListesi = orderBy(DosyaListesi.List, $scope.propertyName, $scope.reverse);
            //$scope.filelocation.push({ ID: DosyaListesi.ID, Adi: DosyaListesi.Adi, IsFolder: DosyaListesi.IsFolder });
        }

        alertify.dialog('Onizleme', function () {
            var iframe;
            return {
                // dialog constructor function, this will be called when the user calls alertify.YoutubeDialog(videoId)
                main: function (docId, tur) {
                    //set the videoId setting and return current instance for chaining.
                    return this.set({
                        'doc': [docId, tur]
                    });
                },
                // we only want to override two options (padding and overflow).
                setup: function () {
                    return {
                        options: {
                            //disable both padding and overflow control.
                            padding: !1,
                            overflow: !1,
                        }
                    };
                },
                // This will be called once the DOM is ready and will never be invoked again.
                // Here we create the iframe to embed the video.
                build: function () {
                    // create the iframe element
                    iframe = document.createElement('iframe');
                    iframe.frameBorder = "no";
                    iframe.width = "100%";
                    iframe.height = "100%";
                    iframe.className = "aClassName";
                    // add it to the dialog
                    this.elements.content.appendChild(iframe);

                    //give the dialog initial height (half the screen height).
                    this.elements.body.style.minHeight = screen.height * .5 + 'px';
                },
                // dialog custom settings
                settings: {
                    doc: undefined
                },
                // listen and respond to changes in dialog settings.
                settingUpdated: function (key, oldValue, newValue) {
                    switch (key) {
                        case 'doc':
                            iframe.src = '../template/Onizleme.aspx?m=' + newValue[0] + '&&d=' + newValue[1];
                            break;
                    }
                },

            };
        });

        $scope.openDrop = function (a) {
            $("#" + a).toggleClass("d-block");
        }
        $scope.Cikis = function () {
            AuthenticationService.ClearCredentials();
            location.reload();
        }
        $scope.GetMenus = function () {
            $scope.Menuler = [{
                ID: 1, MenuAd: "Tüm",
                Click: "DokumanlisteleA"
            }, {
                ID: 2, MenuAd: "Bana Ait",
                Click: "DokumanlisteleK"
            }, {
                ID: 3, MenuAd: "İstenilen Belgeler",
                Click: "IstBelgelerM"
            }, {
                ID: 4, MenuAd: "Arşivler",
                Click: "ArsivleriListeleA"
            }];
        }
        $scope.GorunumSekli = function (a) {
            if (a == "t") {
                $("#viewk").removeClass("active");
                $("#viewt").addClass("active");
                $scope.viewList = "t";
            } else {
                $("#viewt").removeClass("active");
                $("#viewk").addClass("active");
                $scope.viewList = "k";

            }
        }
        $scope.SelectActive = function (id) {
            if (id.includes("kls")) {
                for (i = 0; i < $scope.GosterimListesi.length; i++) {
                    $("#kls" + i).removeClass("active");
                }
            } else {
                for (i = 0; i < $scope.GosterimListesi.length; i++) {
                    $("#tbl" + i).removeClass("active");
                }
            }
            $("#" + id).addClass("active");
        }
        $scope.MenuSelect = function (a, clk) {
            $scope.ChangeTrueFalse("Istenilen", false);
            for (i = 1; i <= $scope.Menuler.length; i++) {
                $("#menu" + i).removeClass("act");
            }
            $("#menu" + a).addClass("act");
            $scope[clk]();
        }

        $scope.propertyName = 'Adi';
        $scope.reverse = true;
        $scope.ChangeTrueFalse = function (scp, bool) {
            $scope[scp] = bool;
        }

        //$scope.$route = $route;
        //$scope.$location = $location;

        $scope.getAjax = function (mtd, data, scp, callback) {
            $http.post('DocService.asmx/' + mtd, data)
                .error(function (XMLHttpRequest, textStatus, errorThrown) { console.log(XMLHttpRequest); alertify.alert("HATA", " BİLGİLERİ KONTROL EDİNİZ"); $scope.ChangeTrueFalse("kayitloading", false); $scope.ChangeTrueFalse("docLoading", false);})
                .success(function (response) {
                    $scope.sonucMesaj = response.d.message;
                    if ($scope.sonucMesaj === "Yetkisiz İşlem") {
                        //$location.path("/");
                        alertify.alert("", "Yetkisiz İşlem");
                    } else {
                        if (response.d.success) {
                            $scope[scp] = response.d.Data;
                            //$scope.$apply();
                            callback(true, response.d.message);
                        } else {
                            callback(false, response.d.message);
                        }
                    }
                });
        }

        $scope.back = function () {
            history.back();
        };
        $scope.closeModal = function (id) {
            $('#' + id).modal('hide');
        }
        $scope.openModal = function (id) {
            $('#' + id).modal('show');
        }
        // #region Right Click Menu

        function startFocusOut() {
            $(document).on("click", function () {
                $scope.duzenleme = false;
                $("#cntnr").hide();
                $(document).off("click");
            });
        }
        $scope.OpenMenu = function (e, dosya, id) {
            $scope.eskiAd = "";
            $scope.adDegisen = "";
            $scope.duzenleme = dosya.Duzenleme;
            $scope.Arsivde = dosya.Arsiv;
            $scope.Kdizin = dosya.Kdizin != undefined ? dosya.Kdizin : false;
            $scope.selectInput = dosya;
            $scope.SelectActive(id);
            e.preventDefault();
            $("#cntnr").css("left", e.pageX);
            $("#cntnr").css("top", e.pageY);
            $("#cntnr").fadeIn(200, startFocusOut());

        }
        $scope.OpenMainMenu = function (e) { // aktif değil
            e.preventDefault();
            $("#cntnrmain").css("left", e.pageX);
            $("#cntnrmain").css("top", e.pageY);
            $("#cntnrmain").fadeIn(200, startFocusOut());

        }
        $scope.AdiniDegistir = function () {
            $scope.adDegisen = 'in' + $scope.selectInput.ID;
            $scope.eskiAd = angular.copy($scope.selectInput.Adi);
            $('#' + $scope.adDegisen).removeClass("d-none");
            var dinput = document.getElementById($scope.adDegisen);
            dinput.focus();
        }
        $scope.YetkiVer = function () {
            $scope.dyetkiler = []
            $scope.openModal("dokumanyetkimodal");
            $scope.DokYetkileri($scope.selectInput.ID);
        }
        $scope.DokumanDuzenleme = function (dosya) {
            if ($scope.selectInput.ID != undefined) {
                if (dosya != $scope.selectInput.Adi && dosya != "") {
                    $scope.getAjax("DokumanDuzenleme", { DokID: $scope.selectInput.ID, YeniAd: dosya, Yetkiler: [] }, "DokumanListesi", function (succes, msg) {
                        if (succes) {
                            $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                        } else {
                            alertify.alert("", msg);
                        }
                    });
                }
                $('#' + $scope.adDegisen).addClass("d-none");
                $scope.eskiAd = "";
                $scope.adDegisen = "";
                $scope.selectInput = {};
            }
        }
        $scope.YetkiVerKaydet = function (yetkiler) {
            if ($scope.selectInput.ID != undefined) {
                $scope.getAjax("DokumanDuzenleme", { DokID: $scope.selectInput.ID, YeniAd: $scope.selectInput.Adi, Yetkiler: yetkiler }, "DokumanListesi", function (succes, msg) {
                    if (succes) {
                        $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                        alertify.alert("", "Düzenleme Başarılı");
                    } else {
                        alertify.alert("", msg);
                    }
                });
            }
        }
        $scope.RevizyonEkle = function () {

        }
        $scope.DokumanSil = function () {
            if ($scope.selectInput.ID != undefined) {
                alertify.confirm('Uyarı', ($scope.selectInput.Type == null ? 'Dosyayı ve İçindekileri' : 'Dokümanı') + ' Silmek İstediğine Emin Misiniz ?', function () {
                    $scope.DokumanSilKaydet($scope.selectInput.ID);
                }, function () { });
            } else {
                alertify.alert("", "Seçili Doküman Bulunamadı");
            }
        }
        $scope.Arsivle = function () {
            if ($scope.selectInput.ID != undefined) {
                if (!$scope.selectInput.IsFolder) {
                    $scope.ArsiveEkleKaydet($scope.selectInput.ID);
                } else {
                    alertify.alert("", "Sadece Dokümanlar Arşivlenebilir");
                }
            } else {
                alertify.alert("", "Seçili Doküman Bulunamadı");
            }
        }

        //#endregion

        $scope.OpenFolder = function (a) {
            if (a.Yetki) {
                if (a.IsFolder) {
                    $scope.DokumanlisteleUst(a.ID);
                    //$scope.GosterimListesi = $scope.searchTree(DosyaListesi, a.ID)
                    $scope.filelocation.push({ ID: a.ID, Adi: a.Adi, IsFolder: a.IsFolder, Yetki: a.Yetki });
                } else {
                    alertify.Onizleme(a.ID, a.Type).set({ frameless: false, title: "Önizleme" }).maximize();
                }
            }
        }
        $scope.UpFolder = function () {
            let folder = $scope.filelocation[$scope.filelocation.length - 2];
            $scope.BackFolder(folder, $scope.filelocation.length - 2)
        }
        $scope.BackFolder = function (a, index) {
            let array = angular.copy($scope.filelocation);
            let count = array.length - index;
            array.splice(index + 1, count);
            array.splice(-1, 1);
            $scope.filelocation = array;
            $scope.OpenFolder(a);
        }
        $scope.searchTree = function (list, ID) {
            if (list.ID == ID) {
                $scope.kokdizin += list.Adi;
                return list.List;
            } else if (list.IsFolder) {
                var i;
                var result = null;
                for (i = 0; result == null && i < list.List.length; i++) {
                    result = $scope.searchTree(list.List[i], ID);
                }
                return result;
            }
            return null;
        }
        $scope.sortBy = function (propertyName) {
            $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
                ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
            $scope.GosterimListesi = orderBy($scope.GosterimListesi, $scope.propertyName, $scope.reverse);
        };
        $scope.IstBelgelerM = function () {
            $scope.ChangeTrueFalse("Istenilen", true);
            $scope.IstenilenBelgeler();
        }
        $scope.ParolaY = function (a) {
            $("#parolayenileme").modal("show");
            $scope.newpass = "";
            $scope.oldpass = "";
            $scope.eyeoffold = false;
            $scope.eyeoff = false;
            $scope.openDrop('logoption2');
            $scope.openDrop('logoption');
        }
        $scope.RandomParolaY = function () {
            $scope.newpass = Math.random().toString(36).slice(-8);
        }

        $scope.DokumanKayit = function (d) {
            return new Promise(function (resolve) {
                $scope.getAjax("DokumanEkle", { docs: d }, "DokumanListesi", function (succes, msg) {
                    if (succes) {
                        $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                        resolve(true);
                    } else {
                        alertify.alert("", msg);
                        resolve(false);
                    }
                });
            })
        }
        $scope.DokumanKayitZip = function (d) {
            return new Promise(function (resolve) {
                $scope.getAjax("DokumanEkleZip", { zipfile: d }, "DokumanListesi", function (succes, msg) {
                    if (succes) {
                        $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                        resolve(true);
                    } else {
                        alertify.alert("", msg);
                        resolve(false);
                    }
                });
            })
        }
        $scope.ArsivleriListeleA = function () {
            $scope.filelocation = [];
            $scope.GosterimListesi = [];
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("ArsivleriListele", {}, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                    $scope.filelocation.push({ ID: -2, Adi: "Arşivler", IsFolder: true, Yetki: true });
                    $scope.ChangeTrueFalse("docLoading", false);
                }
            });
        }
        $scope.DokumanlisteleA = function () {
            $scope.filelocation = [];
            $scope.GosterimListesi = [];
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("Anadizin", {}, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                    $scope.filelocation.push({ ID: $rootScope.Menu.FPath || 0, Adi: "Tum Dosyalar", IsFolder: true, Yetki: true });
                    $scope.ChangeTrueFalse("docLoading", false);
                }
            });
        }
        $scope.DokumanlisteleUst = function (ustId) {
            $scope.GosterimListesi = [];
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("DokumanListele", { uId: ustId }, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                }
                $scope.ChangeTrueFalse("docLoading", false);
            });
        }
        $scope.DokumanlisteleK = function () {
            $scope.filelocation = [];
            $scope.GosterimListesi = [];
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("KisiselDizin", {}, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);

                    $scope.filelocation.push({ ID: $rootScope.Menu.KullaniciPath || 0, Adi: "Kisisel", IsFolder: true, Yetki: true });
                    $scope.ChangeTrueFalse("docLoading", false);
                }
            });
        }
        $scope.DokYetkileri = function (a) {
            $scope.getAjax("GDokumanYetki", { DokID: a }, "dyetkiler", function (suc, msg) {
                if (!suc) {
                    alertify.alert("", msg);
                } else {
                }
            });
        };
        $scope.IstenilenBelgeler = function () {
            $scope.getAjax("IstenilenBelgeler", {}, "IstBelgeler", function (suc, msg) { });
        };
        $scope.parolaKaydet = function (b, c) {
            $scope.getAjax("Userp", { Formdata: b, Formdata2: c }, "bosx", function (a, msg) {
                if ($scope.bosx) {
                    $("#parolayenileme").modal("hide");
                    $scope.newpass = "";
                }
                alertify.alert("", msg);
            });
        }
        $scope.ArsiveEkleKaydet = function (a) {
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("ArsiveEkle", { DocId: a }, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                    alertify.alert("", "Düzenleme Başarılı");
                } else {
                    alertify.alert("", msg);
                }
                $scope.ChangeTrueFalse("docLoading", false);
            });
        }
        $scope.DokumanSilKaydet = function (a) {
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("DokumanSil", { DocId: a }, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                    alertify.alert("", "Silme Başarılı");
                } else {
                    alertify.alert("", msg);
                }
                $scope.ChangeTrueFalse("docLoading", false);
            });
        }
        $scope.DokumanRevizeEt = function (a) {
            $scope.ChangeTrueFalse("docLoading", true);
            $scope.getAjax("DokumanRevizeEt", { doc: a }, "DokumanListesi", function (succes, msg) {
                if (succes) {
                    $scope.GosterimListesi = orderBy($scope.DokumanListesi, $scope.propertyName, $scope.reverse);
                    alertify.alert("", "Kayıt Başarılı");
                } else {
                    alertify.alert("", msg);
                }
                $scope.ChangeTrueFalse("docLoading", false);
            });
        }
    }
])
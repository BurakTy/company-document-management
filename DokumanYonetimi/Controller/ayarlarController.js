app.controller("ayarlarController", ["$scope", "$rootScope",
    function ($scope, $rootScope) {

        if (!($rootScope.Menu.Ref_Unvan == 1 || $rootScope.Menu.Ref_Unvan == 2)) {
            location.href = "#/";
        }

        $scope.YeniKullanici = function () {
            $scope.kullaniciDetay = {
                KullaniciID: 0,
                Ad: "",
                Soyad: "",
                Mail: "",
                Parola: "",
                IsAktif: true,
                Ref_Unvan: "3",
                Telefon: "",
                Yetkiler: $scope.fyetkiler

            };
            $scope.yeniYetki = {
                YetkiID: 0,
                Duzenleme: false,
                IsAktif: true,
                YetkiAdi: "",
            }
            $scope.msonuc = true;
            $scope.gecersizMail = "";

        }
        $scope.mSearchSonucbos = function (a) {
            $scope.mSearchSonuc = [];
        }
        $scope.MenuAyarlarSelect = function (a) {
            $("#v-yenikullanici-tab").removeClass("act active");
            $("#v-yenikullanici").removeClass("show active");
            $("#v-yetkiler-tab").removeClass("act active");
            $("#v-yetkiler").removeClass("show active");
            $("#v-dokumanyet-tab").removeClass("act active");
            $("#v-dokumanyet").removeClass("show active");
            $("#v-istenilenbel-tab").removeClass("act active");
            $("#v-istenilenbel").removeClass("show active");
            $("#" + a).addClass("act active");
            $scope.YeniKullanici();
            $scope.searchKull = "";
            $scope.mSearchSonucShow = false;
            
            if (a == "v-istenilenbel-tab") {
                $scope.TumIstenilenler();
            }
            let tabid = a.replace("-tab","");
            $('#' + tabid).addClass('show active');
        }
        $scope.RandomParola = function (a) {
            $scope.kullaniciDetay.Parola = Math.random().toString(36).slice(-8);
            $scope.fYetkili.Parola = Math.random().toString(36).slice(-8);
        }
        $scope.YetkiDetay = function (a) {
            $scope.yeniYetki = angular.copy(a);
        }
        $scope.YeniYetkiKaydet = function (yet) {
            $scope.getAjax("YetkiOlustur", { yetki: yet }, "fyetkilerg", function (suc, msg) {
                if (suc) {
                    $scope.fyetkiler = $scope.fyetkilerg;
                    alertify.alert("", "Kayıt Başarılı");
                } else {
                    alertify.alert("", msg);
                }
            });
        }
        $scope.YeniKullaniciKaydet = function (kull) {

            $scope.MailKontrol(kull.Mail,kull.KullaniciID, function (msonuc) {
                if (msonuc) {
                    $scope.getAjax("KullaniciKaydet", { Kull: kull, Yetkiler: kull.Yetkiler }, "son20Kullanici", function (suc, msg) {
                        if (suc) {
                            alertify.alert("", "Kayıt Başarılı")
                        } else {
                            alertify.alert("", msg);
                        }
                    });
                }
            });

            if ($scope.bosmail) {
                $scope.msonuc = false;
            }
        }

        $scope.KullaniciArama = function (search) {
            if (search.length > 2) {
                $scope.mSearchSonucShow = true
                $scope.getAjax("KullaniciArama", { search: search }, "gmSearchSonuc", function (suc, msg) {
                    $scope.mSearchSonuc = $scope.gmSearchSonuc;
                });
            } else {
                $scope.mSearchSonucbos();
            }
        };

        $scope.SonKullanicilar = function () {
            $scope.mSearchSonucbos();
            $scope.searchKull = "";
            $scope.getAjax("Son20Kullanici", {}, "son20Kullanici", function (suc, msg) {
                if (!suc) {
                    alertfy.alert("", msg);
                }
            });
        };
        $scope.KullaniciDetay = function (kulId) {
            $scope.getAjax("KullaniciDetay", { kId: kulId }, "gkullaniciDetay", function (suc, msg) {
                if (suc) {
                    let kulyet = angular.copy($scope.gkullaniciDetay.Yetkiler) || [];
                    $scope.kullaniciDetay = $scope.gkullaniciDetay;
                    $scope.kullaniciDetay.Yetkiler = $scope.yetkiler;
                    $.each($scope.kullaniciDetay.Yetkiler, function (key, val) {
                        val.Value = false;
                    });
                    if (kulyet.length != 0) {
                        $.each(kulyet, function (key, val) {
                            $scope.kullaniciDetay.Yetkiler.find(x => x.YetkiID == val.Ref_YetkiID).Value = true;
                        });
                    }
                }
            });

        };
        $scope.FirmaYetkileri = function () {
            $scope.getAjax("FirmaYetkileri", {}, "fyetkiler", function (suc, msg) {
                if (!suc) {
                    alertfy.alert("", msg);
                } else {
                    $scope.yetkiler = angular.copy($scope.fyetkiler);
                    $scope.kullaniciDetay.Yetkiler = $scope.yetkiler;
                }
            });
        };

        $scope.FirmaKayit = function (f, k) {
            $scope.MailKontrol(k.Mail, k.KullaniciID, function (msonuc) {
                if (msonuc) {
                    $scope.getAjax("FirmaKayit", { nFirma: f, fYetkili: k }, "fkayitsonuc", function (suc, msg) {
                        alertify.alert("", msg);
                    });
                }
            });
            if ($scope.bosmail) {
                $scope.msonuc = false;
            }
        }
        $scope.MailKontrol = function (mail,id, call) {
            $scope.gecersizMail = angular.copy(mail);
            if (mail != undefined && mail != "") {
                $scope.bosmail = false;
                $scope.getAjax("MailKontrol", { m: mail, Id:id }, "msonucg", function (suc, msg) {
                    $scope.msonuc = $scope.msonucg;
                    if (call != undefined) {
                        call($scope.msonucg);
                    }
                });
            } else {
                $scope.bosmail = true;
            }
        }
        $scope.TumIstenilenler = function () {
            $scope.getAjax("TumIstenilenBel", {}, "tumIstenilenList", function (suc, msg) { });
        }
        $scope.YeniIstBelgeEkle = function (a) {
            let istBel = {
                BelgeAdi: a,
                IsAktif:false
            }
            $scope.IstenilenBelgeAktifEt(istBel);
        }
        $scope.IstenilenBelgeAktifEt = function (aa) {
            let a = angular.copy(aa);
            a.IsAktif = !aa.IsAktif;
            $scope.getAjax("BelgeAktif", { bel: a }, "tumIstenilenList", function (suc, msg) { });
        }
        $scope.mSearchSonucbos();
        $scope.MenuAyarlarSelect('v-yenikullanici-tab');
        $scope.SonKullanicilar();
        $scope.FirmaYetkileri();
        $scope.YeniKullanici();
    }
]);
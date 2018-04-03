/*
 * XpertRule Decision Factory Multi-KB app launcher
 * (C)XpertRule Software Ltd. 2018
 */

var mkb = {
    lastKBID: 0,
    $header: null,
    $body: null,
    $footer: null,
    defaultView: "",
    currentView: "",
    viewChangeCB: null,
    performLoginCB: null,
    performLogoutCB: null,
    resetPwdCB: null,
    populateKBsCB: null,
    performSignupCB: null,
    kbs: [],
    _userObj: false,
    persistUser: true, // show we try and save the user's info in localStorage?
    LOCAL_STORAGE_USER_KEY: "mkb_user",
    startup: function(defaultView, viewChangeCB, performLoginCB, performLogoutCB, resetPwdCB, populateKBsCB, performSignupCB) {
        var self = this;
        self.lastKBID = 0;
        self.defaultView = defaultView;
        self.$header = $("#mkb_header");
        self.$body = $("#mkb_body");
        self.$footer = $("#mkb_footer");
        window.onpopstate = function() {
            self._windowPopState();
        };
        self.viewChangeCB = viewChangeCB;
        self.performLoginCB = performLoginCB;
        self.performLogoutCB = performLogoutCB;
        self.resetPwdCB = resetPwdCB;
        self.populateKBsCB = populateKBsCB;
        self.performSignupCB = performSignupCB;
        self._userObj = false;
        if (self.persistUser && (typeof(Storage) !== "undefined")) {
            // OK, we have local storage on this browser. Tru and retrieve the  user object
            var u = localStorage.getItem(self.LOCAL_STORAGE_USER_KEY);
            if (u) {
                try {
                    u = JSON.parse(u);
                } catch (e) {
                    u = null;
                }
            }
            if (u && $.isPlainObject(u)) {
                self._userObj = u;
            }
        }
        self.currentView = "";
        self._windowPopState(); // show initial screen (defaultView)
    },
    populateData: function(aData) {
        var self = this;
        if (!$.isPlainObject(aData)) {
            throw "populateData must be called with an object";
        }
        if (!$.isArray(aData.items)) {
            throw "populateData must be supplied with an object with an items array";
        }
        self.kbs = aData.items;
        // assign unique kbis to KBs
        for (var c = 0; c < self.kbs.length; c++) {
            self.kbs[c].kbid = ++self.lastKBID;
        }
        // @todo : maybe allow other properties in the data object?
    },
    populateKBs: function(successCB, failCB) {
        var self = this;
        self.populateKBsCB(function(data) {
            self.populateData(data);
            successCB();
        }, function(errorMsg) {
            failCB(errorMsg);
        });
    },
    changeView: function(view, updateHistory) {
        var self = this;
        if (updateHistory == undefined) {
            updateHistory = true;
        }
        //
        self.currentView = view;
        self.$header.show();
        self.$body.show();
        self.$footer.show();
        $(".mkb-view, .mkb-header, .mkb-footer").hide();
        $(".mkb-view-" + view + ", .mkb-header-" + view + ", .mkb-footer-" + view + "").show();
        this._hideSectionIfEmpty(self.$header);
        this._hideSectionIfEmpty(self.$footer);
        //
        if (updateHistory) {
            var s = view == "" ? "" : "#" + view;
            if (history.pushState) {
                history.pushState(null, null, s);
            } else {
                location.hash = s;
            }
        }
        //
        if ($.isFunction(self.viewChangeCB)) {
            self.viewChangeCB(view);
        }
    },
    backView: function() {
        if (history.back) {
            history.back();
        } else {
        }
    },
    populateList: function($container) {
        var self = this;
        $container.empty();

        var scroll_width = 10; // from css

        var cw = $container.width() - scroll_width; // container client width

        var sz = 128; // default size
        var pd = 8; // default padding

        var i = Math.floor((cw + pd) / (sz + pd));
        // i = number across that we can fit at prefered size
        if (i <= 1) {
            // if we can only fit 1 (or none) across, set the size to the container
            sz = cw;
        } else {
            // multiple across, grow to distribute spare space proportionally
            sz += Math.floor((cw - (i * sz + ((i - 1) * pd))) / i);
        }

        var row = 0;
        var col = 0;
        for (var c = 0; c < self.kbs.length; c++) {
            var kb = self.kbs[c];
            if (!self.canAccessKB(kb)) {
                continue;
            }
            var $t = $("<div></div>")
                .addClass("mkb-list-tile")
                .attr("kbid", kb.kbid)
                .attr("title", kb.title)
                .css({
                    width: sz + "px",
                    height: sz + "px"
                })
                .appendTo($container);
            if (kb.image) {
                $t.css("background-image", "url(../apps/" + kb.folder + "/" + kb.image + ")");
            }
            $("<div></div>")
                .addClass("mkb-list-tile-txt")
                .html(kb.name)
                .appendTo($t);
            if (col > 0) {
                $t.css("margin-left", pd + "px");
            }
            if (row > 0) {
                $t.css("margin-top", pd + "px");
            }
            col++;
            if (col == i) {
                col = 0;
                row++;
            }
        }
        $container.find(".mkb-list-tile").click(function() {
            var kb = self._finbKBbyID(parseInt($(this).attr("kbid"), 10));
            if (!kb) {
                throw "Click on tile with bad kbid";
            }
            self.startKB(kb);
        });
    },
    canAccessKB: function(kb) {
        var self = this;
        if (!$.isArray(kb.access)) {
            return true; // access array not defined for KB = anonymous
        }
        if ($.inArray("", kb.access) >= 0) {
            return true; // access array has the empty priv so it's anonymous
        }
        var user = self.userInfo();
        if (!user) {
            return false; // not loggen in
        }
        if ($.inArray(user.access, kb.access) >= 0) {
            return true; // access array has the current user's access
        }
        return false;
    },
    performLogin: function(email, password, successCB, failCB) {
        var self = this;
        if (!$.isFunction(self.performLoginCB)) {
            failCB("perform login callback not supplied in kbs.startup");
            return;
        }
        self.performLoginCB(
            email,
            password,
            function(userObj) {
                self._userObj = userObj;
                if (self.persistUser && (typeof(Storage) !== "undefined")) {
                    // OK, we have local storage on this browser. Store the user object
                    localStorage.setItem(self.LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
                }
                successCB(self._userObj);
            },
            function(errorMsg) {
                failCB(errorMsg);
            }
        );
    },
    resetPwd: function(email, successCB, failCB) {
        var self = this;
        if ($.trim(email).length == 0) {
            failCB("You must supply an email address");
            return;
        }
        if (!$.isFunction(self.resetPwdCB)) {
            failCB("reset password callback not supplied in kbs.startup");
            return;
        }
        self.resetPwdCB(
            email,
            function() {
                successCB();
            },
            function(errorMsg) {
                failCB(errorMsg);
            }
        );
    },
    performLogout: function(successCB, failCB) {
        var self = this;
        if (!$.isFunction(self.performLogoutCB)) {
            failCB("perform logout callback not supplied in kbs.startup");
            return;
        }
        self.performLogoutCB(
            function() {
                self._userObj = false;
                if (self.persistUser && (typeof(Storage) !== "undefined")) {
                    // OK, we have local storage on this browser. Remove the user object
                    localStorage.removeItem(self.LOCAL_STORAGE_USER_KEY);
                }
                successCB();
            },
            function(errorMsg) {
                failCB(errorMsg);
            }
        );
    },
    signup: function(email, pwd1, pwd2, successCB, failCB) {
        var self = this;
        if (pwd1 != pwd2) {
            failCB("Passwords must match");
        } else if ($.trim(pwd1.length) == 0) {
            failCB("Password cannot be blank");
        } else if (!$.isFunction(self.performSignupCB)) {
            failCB("signup callback not supplied in kbs.startup");
            return;
        } else {
            self.performSignupCB(email, pwd1, successCB, failCB);
        }
    },
    userInfo: function() {
        var self = this;
        return self._userObj;
    },
    startKB: function(kb) {
        var self = this;
        document.location = "../apps/" + kb.folder + "/main.html";
    },
    _finbKBbyID: function(kbid) {
        var self = this;
        for (var c = 0; c < self.kbs.length; c++) {
            if (self.kbs[c].kbid == kbid) {
                return self.kbs[c];
            }
        }
        return null;
    },
    _windowPopState: function() {
        var self = this;
        self.changeView(document.location.hash ? document.location.hash.substr(1) : self.defaultView, false);
    },
    _hideSectionIfEmpty: function($div) {
        var empty = true;
        $div.children().each(function() {
            if ($(this).is(":visible")) {
                empty = false;
            }
        });
        if (empty) {
            $div.hide();
        }
    }
};

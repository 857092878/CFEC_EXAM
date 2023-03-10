var mtjwxsdk = function (e) {
    "use strict";
    var o, t, g = {
            logServerUrl: "https://hmma.baidu.com/mini.gif",
            maxRequestRetryCount: 5,
            requestRetryFirstDelay: 1e3,
            requestRetryMultiple: 4,
            maxRequestDataLength: 204800,
            maxUserPropertyCount: 100,
            maxUserPropertyKeyValueLength: 256,
            maxUint8: 255,
            maxUint32: 4294967295,
            enabledEvents: {
                app: ["onShow", "onHide", "onError"],
                page: ["onShow", "onHide"]
            },
            storageKeys: {
                uuid: "mtj_uuid",
                userInfo: "mtj_user",
                userProperty: "mtj_user_property",
                shareCount: "mtj_scnt"
            }
        },
        p = {
            type: 1
        },
        h = {
            aso: {}
        },
        r = function () {
            return "undefined" != typeof crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * g.maxUint32)
        },
        a = function (e, t) {
            return "[object " + t + "]" === {}.toString.call(e)
        },
        n = function n(r) {
            return (a(r, "Object") || a(r, "Array")) && Object.keys(r).forEach(function (e) {
                var t = r[e];
                a(t, "Object") || a(t, "Array") ? r[e] = n(t) : r[e] = "" + t
            }), r
        },
        u = function (e) {
            return a(e, "String") && /^\d{11}$/.test(e)
        },
        i = function (e) {
            return a(e, "String") && 28 === e.length
        },
        s = 0,
        c = function (r) {
            return new Promise(function (t, n) {
                if (r.data = r.data || {}, r.data.v = "1.8.14", r.data.rqc = ++s, e = r.data, !(JSON.stringify(e).length <= g.maxRequestDataLength)) return s--, n(new Error("invalid data"));
                var e;
                r.success = function (e) {
                        return t(e)
                    }, r.fail = function (e) {
                        return n(e)
                    },
                    function t(n) {
                        var r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : g.requestRetryFirstDelay;
                        return o.request({
                            url: n.url,
                            data: n.data,
                            header: Object.assign({
                                "content-type": "application/json"
                            }, n.header),
                            method: n.method || "POST",
                            dataType: n.dataType || "json",
                            success: function (e) {
                                delete n.data.rtc, n.success && n.success(e)
                            },
                            fail: function (e) {
                                n.data.rtc = (n.data.rtc || 0) + 1, n.data.rtc <= g.maxRequestRetryCount ? setTimeout(function () {
                                    return t(n, r * g.requestRetryMultiple)
                                }, r) : (delete n.data.rtc, n.fail && n.fail(e))
                            }
                        })
                    }(r)
            })
        },
        f = function (e, t) {
            var n = a(t, "Object") ? JSON.stringify(t) : "" + t;
            c({
                url: g.logServerUrl,
                dataType: "string",
                data: Object.assign({}, p, {
                    et: "error",
                    en: e,
                    ep: {
                        ex: n
                    },
                    rid: r()
                })
            })
        },
        d = function (e) {
            e.rid = r(), e.aso = e.aso || {};
            var t = {
                url: g.logServerUrl,
                dataType: "string",
                data: Object.assign({}, p, e)
            };
            c(t).catch(function (e) {
                return f("sendRequest", e)
            })
        },
        y = function (e) {
            try {
                return o.getStorageSync(e)
            } catch (e) {
                f("getStorageSync", e)
            }
        },
        m = function (e, t) {
            try {
                o.setStorageSync(e, t)
            } catch (e) {
                f("setStorageSync", e)
            }
        },
        l = function () {
            return Promise.resolve().then(function () {
                var e = y(g.storageKeys.uuid);
                return a(e, "String") && 32 === e.length || (e = ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, function (e) {
                    return (e ^ ("undefined" != typeof crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * g.maxUint8)) & 15 >> e / 4).toString(16)
                }), m(g.storageKeys.uuid, e)), e
            })
        },
        v = function () {
            return t || (p.sid = r(), p.rqc = 0, t = Promise.all([l(), new Promise(function (t) {
                o.getSystemInfo({
                    success: function (e) {
                        delete e.errMsg, t(e)
                    },
                    fail: function () {
                        t({})
                    }
                })
            }), new Promise(function (t) {
                o.getNetworkType({
                    success: function (e) {
                        delete e.errMsg, t(e)
                    },
                    fail: function () {
                        t({})
                    }
                })
            }), Promise.resolve().then(function () {
                var e = y(g.storageKeys.userInfo),
                    n = a(e, "Object") ? e : {};
                return new Promise(function (t) {
                    o.getSetting({
                        success: function (e) {
                            e.authSetting && e.authSetting["scope.userInfo"] ? o.getUserInfo({
                                success: function (e) {
                                    delete e.userInfo.errMsg, t(Object.assign(n, e.userInfo))
                                },
                                fail: function () {
                                    t(n)
                                }
                            }) : t(n)
                        },
                        fail: function () {
                            t(n)
                        }
                    })
                })
            }), new Promise(function (t) {
                if (!g.getLocation) return t({});
                o.getLocation({
                    type: "wgs84",
                    success: function (e) {
                        delete e.errMsg, t(e)
                    },
                    fail: function () {
                        t({})
                    }
                })
            }), Promise.resolve().then(function () {
                var e = y(g.storageKeys.userProperty);
                return a(e, "Object") ? e : {}
            })]).then(function (e) {
                p.uuid = e[0], h.system = n(e[1]), h.network = n(e[2]), 0 < Object.keys(e[3]).length && (h.user = n(e[3])), 0 < Object.keys(e[4]).length && (h.location = n(e[4])), 0 < Object.keys(e[5]).length && (h.userProperty = JSON.stringify(e[5])), h.system.platform
            }))
        },
        j = {
            onLaunch: function () {
                d({
                    et: "app",
                    en: "launch"
                })
            },
            onShow: function () {
                var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                return h.aso.scene = "" + (t.scene || ""), t.referrerInfo && t.referrerInfo.appId ? h.aso.referrerInfo = t.referrerInfo : delete h.aso.referrerInfo, h.aso.path = t.path || "", h.aso.query = Object.keys(t.query || {}).map(function (e) {
                    return {
                        key: e,
                        value: t.query[e]
                    }
                }), v().then(function () {
                    return e = t.shareTicket, new Promise(function (t) {
                        if (!e) return t();
                        o.getShareInfo({
                            shareTicket: e,
                            success: function (e) {
                                delete e.errMsg, t(e)
                            },
                            fail: function () {
                                t({})
                            }
                        })
                    });
                    var e
                }).then(function (e) {
                    e ? h.aso.shareInfo = e : delete h.aso.shareInfo, d(Object.assign({
                        et: "app",
                        en: "show"
                    }, h))
                }).catch(function (e) {
                    f("app.onShow", e)
                })
            },
            onHide: function () {
                d({
                    et: "app",
                    en: "hide"
                })
            },
            onError: function (e) {
                var t = a(e, "Object") ? JSON.stringify(n(e)) : "" + e;
                d({
                    et: "app",
                    en: "error",
                    ep: {
                        ex: t
                    }
                })
            }
        },
        S = function (e, t) {
            return d({
                et: "page",
                en: e,
                ep: t
            })
        },
        b = {
            onLoad: function () {
                S("load")
            },
            onShow: function () {
                var e = getCurrentPages(),
                    t = e[e.length - 1];
                return p.path = t.route, p.query = Object.keys(t.options).map(function (e) {
                    return {
                        key: e,
                        value: t.options[e]
                    }
                }).filter(function (e) {
                    return "mtj_qrid" !== e.key && "mtj_lkid" !== e.key && "mtj_shuuid" !== e.key
                }), v().then(function () {
                    d(Object.assign({
                        et: "page",
                        en: "show"
                    }, h))
                }).catch(function (e) {
                    f("page.onShow", e)
                })
            },
            onReady: function () {
                S("ready")
            },
            onHide: function () {
                S("hide")
            },
            onUnload: function () {
                S("unload")
            },
            onPullDownRefresh: function () {
                S("pullDownRefresh")
            },
            onReachBottom: function () {
                S("reachBottom")
            },
            onPageScroll: function () {
                S("pageScroll")
            },
            onTabItemTap: function (e) {
                S("tabItemTap", e)
            },
            onShareAppMessage: function (e) {
                var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
                    n = y(g.storageKeys.shareCount);
                n = (Number.isInteger(n) ? n : 0) + 1, m(g.storageKeys.shareCount, n);
                var r = {
                    cnt: n,
                    from: e.from,
                    path: t.path
                };
                if (!r.path) {
                    var o = p.query.map(function (e) {
                        return e.key + "=" + e.value
                    }).join("&");
                    r.path = p.path + (o ? "?" + o : "")
                }
                t.title && (r.title = "" + t.title), e.target && (r.target = JSON.stringify(e.target)), d(Object.assign({
                    et: "share",
                    en: "action",
                    ep: r
                }, h));
                var a = h.aso.query.filter(function (e) {
                        return "mtj_shuuid" === e.key
                    }),
                    u = a[0] ? a[0].value.split("_") : [];
                p.uuid !== u[u.length - 1] && u.push(p.uuid);
                var i, s, c, f, l = u.slice(Math.max(0, u.length - 3)).join("_");
                return t.path = (i = r.path, s = "mtj_shuuid", c = l, f = 0 < (i = i.replace(new RegExp(s + "=[^&]*", "g"), "").replace(/(\?|&)&/g, "$1").replace(/(\?|&)$/g, "")).indexOf("?") ? "&" : "?", i + f + s + "=" + encodeURIComponent(c)), t
            }
        },
        P = {
            trackEvent: function (e) {
                var t, r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
                if (!a(t = e, "String") || !/^[a-z][a-z0-9_]{0,31}$/.test(t)) return Promise.reject(new Error("?????????????????????"));
                var n = Object.keys(r).filter(function (e) {
                    return a(n = e, "String") && /^[a-z0-9_]{1,32}$/.test(n) && (t = r[e], a(t, "String") || a(t, "Number"));
                    var t, n
                }).map(function (e) {
                    return {
                        key: "" + e,
                        value: "" + r[e],
                        type: a(r[e], "String") ? "string" : "number"
                    }
                });
                return v().then(function () {
                    d(Object.assign({
                        et: "event",
                        en: "" + e,
                        ep: {
                            data: n
                        }
                    }, h))
                }).catch(function (e) {
                    f("trackEvent", e)
                })
            },
            setUserInfo: function () {
                var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
                    n = e.tel,
                    r = e.openId;
                return v().then(function () {
                    var e = y(g.storageKeys.userInfo),
                        t = a(e, "Object") ? e : {};
                    u(n) && (t.tel = h.user.tel = n.substr(n.length - 11)), i(r) && (t.openId = h.user.openId = r), (t.tel || t.openId) && m(g.storageKeys.userInfo, t), a(n, "Undefined") || u(n) || console.error("????????? ".concat(n, " ?????????")), a(r, "Undefined") || i(r) || console.error("openid ".concat(r, " ?????????"))
                }).catcaaah(function (e) {
                    f("setUserInfo", e)
                })
            },
            setUserId: function (o) {
                return Promise.resolve().then(function () {
                    if (!(a(o, "String") || a(o, "Number") && Number.isFinite(o))) return Promise.reject(new Error("userId???????????????????????????"));
                    var e = "" + o,
                        t = y(g.storageKeys.userProperty),
                        n = a(t, "Object") ? t : {};
                    if (!n.uid_ || n.uid_[0] !== e) {
                        n.uid_ = [e, "1"], m(g.storageKeys.userProperty, n), h.userProperty = JSON.stringify(n);
                        var r = [{
                            key: "uid",
                            value: e
                        }];
                        return v().then(function () {
                            d(Object.assign({
                                et: "api",
                                en: "setUserId",
                                ep: {
                                    data: r
                                }
                            }, h))
                        }).catch(function (e) {
                            f("setUserId", e)
                        })
                    }
                })
            },
            setUserProperty: function (o) {
                return Promise.resolve().then(function () {
                    var e = y(g.storageKeys.userProperty),
                        n = a(e, "Object") ? e : {};
                    if (a(o, "Null")) Object.keys(n).forEach(function (e) {
                        "_" !== e.charAt(0) && "_" !== e.charAt(e.length - 1) && delete n[e]
                    });
                    else if (!a(o, "Object")) return Promise.reject(new Error("userProperty???????????????"));
                    var r = Object.keys(n).filter(function (e) {
                        return "_" !== e.charAt(0) && "_" !== e.charAt(e.length - 1)
                    }).length;
                    Object.keys(o || {}).forEach(function (e) {
                        var t = o[e];
                        "" !== e && "_" !== e.charAt(0) && "_" !== e.charAt(e.length - 1) && (a(t, "Null") ? n[e] && (delete n[e], r--) : !(a(t, "String") || a(t, "Number") && Number.isFinite(t)) || e.length > g.maxUserPropertyKeyValueLength || ("" + t).length > g.maxUserPropertyKeyValueLength || !n[e] && r >= g.maxUserPropertyCount || (n[e] || r++, n[e] = [t, "1"]))
                    }), m(g.storageKeys.userProperty, n), h.userProperty = JSON.stringify(n)
                })
            }
        },
        O = App,
        I = Page,
        k = function (e, t, n) {
            var r = t[e];
            t[e] = function (e) {
                n.call(this, e), r && r.call(this, e)
            }
        },
        w = function (t) {
            g.enabledEvents.app.forEach(function (e) {
                k(e, t, j[e])
            }), t.mtj = P, O(t)
        },
        U = function (a) {
            g.enabledEvents.page.forEach(function (e) {
                k(e, a, b[e])
            }), ["onShareAppMessage"].forEach(function (e) {
                var t, n, r, o;
                r = b[t = e], o = (n = a)[t], n[t] = function (e) {
                    var t = o && o.call(this, e);
                    return r.call(this, e, t)
                }
            }), I(a)
        },
        x = function () {
            var e, t;
            e = wx, o = e;
            try {
                t = require("./mtj-wx-sdk.config")
            } catch (e) {
                return void console.error("??????mtj-wx-sdk.config.js???????????????utils?????????")
            }
            t && t.appKey ? (p.key = t.appKey, g.getLocation = t.getLocation || !1, t.hasPlugin ? module.exports = {
                App: w,
                Page: U
            } : (App = w, Page = U)) : console.error("?????????mtj-wx-sdk.config.js????????????appKey??????")
        };
    return x(), e.init = x, e
}({});
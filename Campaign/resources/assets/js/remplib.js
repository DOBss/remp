import Remplib from 'remp/js/remplib'

remplib = typeof(remplib) === 'undefined' ? {} : remplib;

(function(mocklib) {

    'use strict';

    let prodlib = Remplib;

    prodlib.campaign = {

        _: [],

        callbackIterator: 0,

        initIterator: 0,

        url: null,

        variables: {},

        campaignsStorageKey: "campaigns",

        pageviewCountStorageKey: "pageview_count",

        campaignsSessionStorageKey: "campaigns_session",

        /* JSONP START */

        showtime: {
            name: "campaigns/showtime",
            jsonpParameter: "data",
            prepareData: function() {
                return {
                    "userId": remplib.getUserId(),
                    "browserId": remplib.getBrowserId(),
                    "url": window.location.href,
                    "campaignsSeen": remplib.campaign.getCampaignsSeen(),
                    "campaignsBanners": remplib.campaign.getCampaignsBanners(),
                    "cache": remplib.getFromStorage(remplib.segmentProviderCacheKey, true),
                    "pageviewCount": remplib.getFromStorage(remplib.campaign.pageviewCountStorageKey),
                    "userAgent": window.navigator.userAgent
                }

            },
            processResponse: function(result) {
                if (!result["success"]) {
                    return;
                }
                for (let exec = result.data || [], c = 0; c < exec.length; c++) {
                    try {
                        let fn = new Function(exec[c]);
                        setTimeout(fn(), 0);
                    } catch (u) {
                        console.error("campaign showtime error:", u)
                    }
                }
                let event = new CustomEvent("campaign_showtime", {
                    detail: result.providerData,
                });
                window.dispatchEvent(event);
            },
        },

        /* JSONP END */

        init: function(config) {
            if (typeof config.campaign !== 'object') {
                throw "remplib: configuration campaign invalid or missing: "+config.campaign
            }
            if (typeof config.campaign.url !== 'string') {
                throw "remplib: configuration campaign.url invalid or missing: "+config.campaign.url
            }
            this.url = config.campaign.url;

            if (typeof config.campaign.variables !== 'undefined') {
                if (typeof config.campaign.variables !== 'object') {
                    throw "remplib: configuration variables invalid (object required): "+config.campaign.variables
                }
                this.variables = config.campaign.variables;
            }

            if (window.location.hash === "#remp-picker") {
                this.bannerPicker.init();
            }

            // global
            if (typeof config.userId !== 'undefined' && config.userId !== null) {
                remplib.userId = config.userId;
            }
            if (typeof config.userSubscribed !== 'undefined' && config.userSubscribed !== null) {
                remplib.userSubscribed = config.userSubscribed;
            }

            if (typeof config.cookieDomain === 'string') {
                remplib.cookieDomain = config.cookieDomain;
            }

            this.incrementPageviewCount();
        },

        run: function() {
            this.request(this.showtime);
        },

        request: function(def) {
            let params = {};
            params[def.jsonpParameter] = JSON.stringify(def.prepareData());

            this.get(this.url + "/" + def.name, params, function (data) {
                def.processResponse && def.processResponse(data);
            }, function() {
                def.processError && def.processError();
            });
        },

        get: function(url, params, success, error) {
            let query = "?";
            let cb = "rempcampaign_callback_json" + this.callbackIterator++;

            for (let item in params)
                params.hasOwnProperty(item) && (query += encodeURIComponent(item) + "=" + encodeURIComponent(params[item]) + "&");

            window[cb] = function(data) {
                success(data);
                try {
                    delete window[cb]
                } catch (_) {}
                window[cb] = null
            };

            remplib.loadScript(url + query + "callback=" + cb)
        },

        getCampaignsSeen: function() {
            let campaigns = remplib.getFromStorage(this.campaignsSessionStorageKey, false);
            if (typeof campaigns !== "undefined" && campaigns !== null && campaigns.seen) {
                return campaigns.seen;
            }
            return null;
        },

        getCampaignsBanners: function() {
            let campaigns = remplib.getFromStorage(this.campaignsStorageKey, true);
            if (typeof campaigns !== "undefined" && campaigns !== null && campaigns.values) {
                return campaigns.values;
            }
            return null;
        },

        incrementPageviewCount: function ()  {
            var pageviewCount = remplib.getFromStorage(this.pageviewCountStorageKey);

            if (pageviewCount) {
                remplib.setToStorage(this.pageviewCountStorageKey, pageviewCount+1);
            } else {
                remplib.setToStorage(this.pageviewCountStorageKey, 1);
            }
        },

        // used to store campaign details, called from banner view
        storeCampaignDetails: function(campaignId, bannerId) {
            this.storeCampaigns(campaignId, bannerId);
            this.storeCampaignsSession(campaignId);
        },


        // store persistent campaign details
        storeCampaigns: function(campaignId, bannerId) {
            const now = new Date();
            let campaigns = remplib.getFromStorage(this.campaignsStorageKey, true);

            if (typeof campaigns === "undefined" || campaigns === null) {
                campaigns = {
                    "version": 1,
                    "createdAt": now,
                    "updatedAt": now,
                    "values": {},
                }
            }

            if (!campaigns.hasOwnProperty('values')) {
                campaigns.values = {};
            }

            if (!(campaignId in campaigns.values)) {
                campaigns.values[campaignId] = {
                    "bannerId": bannerId,
                };
            }

            localStorage.setItem(this.campaignsStorageKey, JSON.stringify(campaigns));
        },

        // store session campaign details
        storeCampaignsSession: function(campaignId) {
            const now = new Date();
            let campaigns = remplib.getFromStorage(this.campaignsSessionStorageKey, false);

            if(typeof campaigns === "undefined" || campaigns === null) {
                campaigns = {
                    "version": 1,
                    "createdAt": now,
                    "updatedAt": now,
                    "seen": [],
                }
            }

            let flag = false;
            for (let i = 0, len = campaigns.seen.length; i < len; i++) {
                if (campaigns.seen[i].campaignId === campaignId) {
                    campaigns.seen[i].updatedAt = now;
                    campaigns.seen[i].count++;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                campaigns.seen.push({
                    "campaignId": campaignId,
                    "createdAt": now,
                    "updatedAt": now,
                    "count": 1,
                });
            }

            localStorage.setItem(this.campaignsSessionStorageKey, JSON.stringify(campaigns));
        },

        bannerPicker: {
            init: function() {
                remplib.loadStyle(remplib.campaign.url + '/resources/banner.css');

                window.addEventListener('message', remplib.campaign.bannerPicker.receiver, false);

                let banners = document.getElementsByClassName('remp-banner');

                for (let i=0, len=banners.length; i < len; i++) {
                    if (banners[i].id.length) {
                        banners[i].onclick = remplib.campaign.bannerPicker.bannerClick;
                    }
                }
            },

            bannerClick: function() {
                let banners = document.getElementsByClassName('remp-banner');

                for (let i=0, len=banners.length; i < len; i++) {
                    if (banners[i].id.length) {
                        banners[i].classList.remove("remp-active");
                    }
                }

                this.classList.add("remp-active");
                remplib.campaign.bannerPicker.sendMessage({remp_action: 'el_select', el: '#' + this.id});
            },

            sendMessage: function(msg, target) {
                target = target || parent;

                target.postMessage(JSON.stringify(msg), remplib.campaign.url);
            },

            receiver: function(e) {
                if (e.origin === remplib.campaign.url) {
                    switch (e.data) {
                        case 'remp-test':
                            remplib.campaign.bannerPicker.sendMessage({remp_action: 'test_response'}, e.source);
                            break;

                        case 'remp-picker':
                            if (document.body.classList.contains("remp-selector")) {
                                document.body.classList.remove("remp-selector");
                            } else {
                                document.body.classList.add("remp-selector");
                            }
                    }
                }
            }
        },
    };

    prodlib.campaign._ = mocklib.campaign._ || [];
    remplib = prodlib.extend(mocklib, prodlib);
    remplib.bootstrap(remplib.campaign);

})(remplib);

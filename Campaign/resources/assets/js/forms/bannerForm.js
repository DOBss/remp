import Transformer from '../components/_transformer.js';
import BannerForm from '../components/BannerForm.vue';

remplib = typeof(remplib) === 'undefined' ? {} : remplib;

(function() {

    'use strict';

    remplib.bannerForm = {

        bind: (el, banner) => {
            // failsave, one of the options has to be selected...
            banner.dimensions = banner.dimensions || Object.keys(banner.dimensionOptions)[0];
            banner.textAlign = banner.textAlign || Object.keys(banner.alignmentOptions)[0];
            banner.position = banner.position || Object.keys(banner.positionOptions)[0];

            return new Vue({
                el: el,
                render: h => h(BannerForm, {
                    props: Transformer.transformKeys(banner)
                }),
            });
        },

        targetPicker: {
            compat_timer: 0,
            compat_delay: 3000,

            init: function() {
                window.addEventListener('message', remplib.bannerForm.targetPicker.receiver, false);
            },

            testCompatibility: function(){
                this.sendMessage('remp-test');
                this.compat_timer = setTimeout(function(){
                    $('#target_selection').addClass('disabled');
                    alert("Page is not compatible for interactive element selection.\n" +
                          "Please include the following script in the page:\n" +
                          "http://campaign.remp.press/resources/banner.js"
                    );

                }, this.compat_delay);
            },

            receiver: function(e) {
                let iframe  = $('#preview_frame');
                let message = remplib.bannerForm.targetPicker.parseResponse(e.data);

                if (message && iframe.length && e.origin === iframe[0].src.split('/').slice(0, 3).join('/')) {
                    switch(message.remp_action){
                        case 'test_response':
                            $('#target_selection').removeClass('disabled');
                            clearTimeout(remplib.bannerForm.targetPicker.compat_timer);
                            break;
                        case 'el_select':
                            $('#target_selector').val(message.el).focus().blur();
                    }
                }
            },

            parseResponse: function(jsonString) {
                try {
                    let o = JSON.parse(jsonString);

                    if (o && typeof o === "object" && o.remp_action !== undefined) {
                        return o;
                    }
                } catch (e) {}

                return false;
            },

            sendMessage: function(msg) {
                let iframe = $('#preview_frame');

                if (!iframe.is(':visible')) {
                    alert('Please enter a valid URL of target page for selection');

                } else if(iframe.css("visibility") === "visible") {
                    iframe[0].contentWindow.postMessage(msg, '*');

                }
            }
        }

    };

    remplib.bannerForm.targetPicker.init();

})();
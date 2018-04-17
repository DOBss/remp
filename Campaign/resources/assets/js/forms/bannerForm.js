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
            compatTimer: 0,
            compatDelay: 3000,
            viewportDimensions: {
                auto: 'auto',
                xs: 575,
                sm: 767,
                md: 991,
                lg: 1199,
                xl: 1440
            },

            init: function() {
                window.addEventListener('message', remplib.bannerForm.targetPicker.receiver, false);
                $(window).on('resize', this.changeFrameSize);
            },

            testCompatibility: function() {
                if (this.sendMessage('remp-test')) {
                    clearTimeout(this.compatTimer);

                    this.compatTimer = setTimeout(function() {
                        $('#target_selection').addClass('disabled');
                        $.notify({
                            message: "Page is not compatible for interactive element selection.\n" +
                                     "Please include the required .js file."
                        }, {
                            allow_dismiss: false,
                            type: 'danger'
                        });

                    }, this.compatDelay);
                }
            },

            changeFrameSize: function(e) {
                let frame = $('#preview_frame');

                if (!frame.is(':visible')) return;

                if (e.type === 'click') {
                    $('#frame-size-switcher .btn').removeClass('btn-info').addClass('btn-default');
                    $(e.target).removeClass('btn-default').addClass('btn-info');
                }

                let container = $('#banner-preview'),
                    frameWidth = frame.width(),
                    newWidth = remplib.bannerForm.targetPicker.viewportDimensions[$('#frame-size-switcher .btn.btn-info')[0].dataset.size],
                    ratio = parseFloat(frame[0].style.transform.replace(/[^0-9.]/g, ''));

                container = {
                    width: container.width(),
                    height: container.height()
                };

                let newRatio = container.width / newWidth;

                if (newWidth === 'auto' && frameWidth !== container.width) {
                    frame.removeAttr('style');
                } else if (newWidth !== frameWidth || newRatio !== ratio) {
                    let newHeight = container.height / newRatio;

                    frame.css({
                        top: (container.height - newHeight) / 2,
                        left: (container.width - newWidth) / 2,
                        width: newWidth,
                        height: newHeight,
                        transform: 'scale(' + newRatio + ')'
                    });
                }
            },

            receiver: function(e) {
                let message = remplib.bannerForm.targetPicker.parseResponse(e.data);

                if (message && $('#preview_frame').length) {
                    switch(message.remp_action){
                        case 'test_response':
                            $('#target_selection').removeClass('disabled');
                            clearTimeout(remplib.bannerForm.targetPicker.compatTimer);
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
                    $.notify({
                        message: 'Please enter a valid URL of target page for selection'
                    }, {
                        allow_dismiss: false,
                        type: 'danger'
                    });

                } else if (iframe.is(":visible")) {
                    iframe[0].contentWindow.postMessage(msg, '*');

                    return true;

                }

                return false;
            }
        }

    };

    remplib.bannerForm.targetPicker.init();

})();
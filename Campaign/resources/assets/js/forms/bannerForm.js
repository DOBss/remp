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
        }

    };

    window.addEventListener('message', remp_receiver, false);

    function remp_receiver(e) {
        let iframe = $('#preview_frame');

        if (iframe.length && e.origin === iframe[0].src.split('/').slice(0, 3).join('/')) {
            $('#target_selector').val('#'+e.data).focus().blur();
        }
    }

})();
remplib = typeof remplib === 'undefined' ? {} : remplib;

(function() {

    'use strict';

    remplib.bannerPicker = {
        remp_url: 'http://campaign.remp.press',

        init: function(){
            if (!document.getElementById('remp-css')) {
                let link  = document.createElement('link');

                link.id   = 'remp-css';
                link.rel  = 'stylesheet';
                link.href = this.remp_url + '/resources/banner.css';
                link.media = 'all';
                document.getElementsByTagName('head')[0].appendChild(link);
            }

            window.addEventListener('message', remplib.bannerPicker.receiver, false);

            document.addEventListener('DOMContentLoaded', function(){
                let banners = document.getElementsByClassName('remp-banner');

                for (let i=0, len=banners.length; i < len; i++) {
                    if(banners[i].id.length)
                        banners[i].onclick = remplib.bannerPicker.bannerClick;
                }
            }, false);
        },

        bannerClick: function() {
            let banners = document.getElementsByClassName('remp-banner');

            for (let i=0, len=banners.length; i < len; i++) {
                if(banners[i].id.length)
                    banners[i].classList.remove("active");
            }

            this.classList.add("active");
            remplib.bannerPicker.sendMessage({remp_action: 'el_select', el: '#' + this.id});
        },

        sendMessage: function(msg, target) {
            target = target || parent;

            target.postMessage(JSON.stringify(msg), this.remp_url);
        },

        receiver: function(e) {
            if (e.origin === remplib.bannerPicker.remp_url) {
                switch (e.data) {
                    case 'remp-test':
                        remplib.bannerPicker.sendMessage({remp_action: 'test_response'}, e.source);
                        break;

                    case 'remp-picker':
                        document.body.className += ' remp-picker';
                }
            }
        }
    };

    remplib.bannerPicker.init();

})();

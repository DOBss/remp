(function() {

    'use strict';

    let remp_url = 'http://campaign.remp.press';

    if (!document.getElementById('remp-css')) {
        let link  = document.createElement('link');

        link.id   = 'remp-css';
        link.rel  = 'stylesheet';
        link.href = remp_url + '/resources/banner.css';
        link.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    window.addEventListener('message', remp_receiver, false);

    function remp_receiver(e) {
        if (e.origin === remp_url && e.data === 'remp-picker') {
            document.body.className += ' ' + e.data;
        }
    }

    function bannerClick() {
        this.className += ' active';
        parent.postMessage(this.id, '*');
    }

    document.addEventListener('DOMContentLoaded', function(){
        let banners = document.getElementsByClassName('remp-banner');

        for (let i=0, len=banners.length; i < len; i++) {
            if(banners[i].id.length)
                banners[i].onclick = bannerClick;
        }
    }, false);

})();

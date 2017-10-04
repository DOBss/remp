<style type="text/css">
    @import url('https://fonts.googleapis.com/css?family=Noto+Sans');
    @import url('../../../css/transitions.css');

    .html-preview-close.hidden {
        display: none;
    }
    .html-preview-box {
        font-family: Noto Sans, sans-serif;
        color: white;
        white-space: pre-line;
        display: inline-block;
        overflow: hidden;
        position: relative
    }
    .html-preview-text {
        word-break: break-all;
        vertical-align: middle;
        padding: 5px 10px;
        display: flex;
        height: 100%;
        align-items: center;
    }
    .html-preview-close {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 15px;
        padding: 5px;
        text-decoration: none;
    }
</style>

<template>
    <a v-bind:href="url" v-on:click="clicked" v-if="isVisible" v-bind:style="[
        linkStyles,
        _position,
        dimensionOptions[dimensions]
    ]">
        <transition appear v-bind:name="transition">
            <div class="html-preview-box" v-bind:style="[
                boxStyles,
                dimensionOptions[dimensions],
                _textAlign,
                customBoxStyles
            ]">
                <a class="html-preview-close" href="javascript://" v-bind:class="[{hidden: !closeable || displayType !== 'overlay'}]" v-on:click="closed" v-bind:style="closeStyles">&#x1f5d9;</a>
                <p v-html="text" class="html-preview-text" v-bind:style="[_textAlign, textStyles]"></p>
            </div>
        </transition>
    </a>
</template>

<script>
    export default {
        name: 'html-preview',
        props: [
            "positionOptions",
            "dimensionOptions",
            "alignmentOptions",
            "textAlign",
            "transition",
            "position",
            "dimensions",
            "show",
            "textColor",
            "fontSize",
            "backgroundColor",
            "targetUrl",
            "closeable",
            "text",
            "displayType",
            "forcedPosition",
            "uuid",
            "campaignUuid"
        ],
        data: function() {
            return {
                visible: true,
                closeTracked: false,
                clickTracked: false,
            }
        },
        methods: {
            customPositioned: function() {
                if (this.displayType === 'overlay') {
                    return true;
                }
                if (this.forcedPosition !== undefined && this.forcedPosition === 'absolute') {
                    return true;
                }
                return false;
            },
            closed: function() {
                if (this.closeTracked) {
                    return true;
                }
                this.trackEvent("banner", "close", {
                    "banner_id": this.uuid,
                    "campaign_id": this.campaignUuid,
                });
                this.closeTracked = true;
                this.visible = false;
            },
            clicked: function() {
                if (this.clickTracked) {
                    return true;
                }
                this.trackEvent("banner", "click", {
                    "banner_id": this.uuid,
                    "campaign_id": this.campaignUuid,
                });
                this.clickTracked = true;
                return true;
            },
            trackEvent: function(category, action, fields) {
                if (typeof remplib.tracker === 'undefined') {
                    return;
                }
                remplib.tracker.trackEvent(category, action, fields);
            },
        },
        computed: {
            _textAlign: function() {
                return this.alignmentOptions[this.textAlign] ? this.alignmentOptions[this.textAlign].style : {};
            },
            _position: function() {
                if (!this.customPositioned()) {
                    return {};
                }
                return this.positionOptions[this.position] ? this.positionOptions[this.position].style : {};
            },
            linkStyles: function() {
                let position = this.displayType === 'overlay' ? 'absolute' : 'relative';
                if (typeof this.forcedPosition !== 'undefined') {
                    position = this.forcedPosition;
                }
                return {
                    textDecoration: 'none',
                    position: position,
                    overflow: 'hidden',
                    zIndex: 0,
                }},
            textStyles: function() {
                return {
                    color: this.textColor,
                    fontSize: this.fontSize + "px",
                }
            },
            boxStyles: function() {
                return {
                    backgroundColor: this.backgroundColor,
                }},
            closeStyles: function() {
                return {
                    color: this.textColor,
                }},
            customBoxStyles: function() {
                return {}
            },
            isVisible: function() {
                return this.show && this.visible;
            },
            url: function() {
                if (this.targetUrl === null) {
                    return null;
                }
                let separator = this.targetUrl.indexOf("?") === -1 ? "?" : "&";
                let url =  this.targetUrl + separator + "utm_source=remp_campaign" +
                    "&utm_medium=" + encodeURIComponent(this.displayType);
                if (this.campaignUuid) {
                    url += "&utm_campaign=" + encodeURIComponent(this.campaignUuid);
                }
                if (this.uuid) {
                    url += "&utm_content=" + encodeURIComponent(this.uuid);
                }
                return url;
            },
        },
    }
</script>
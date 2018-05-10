<style type="text/css">
    .cp-value {
        cursor: pointer;
    }
</style>

<template>
    <div class="row">
        <div class="col-md-4">
            <html-template v-if="template === 'html'"
                v-bind:_backgroundColor="htmlTemplate.backgroundColor"
                v-bind:_text="htmlTemplate.text"
                v-bind:_textColor="htmlTemplate.textColor"
                v-bind:_fontSize="htmlTemplate.fontSize"
                v-bind:_textAlign="htmlTemplate.textAlign"
                v-bind:_dimensions="htmlTemplate.dimensions"
                v-bind:alignmentOptions="alignmentOptions"
                v-bind:dimensionOptions="dimensionOptions"
                v-bind:show="show"
            ></html-template>

            <medium-rectangle-template v-if="template === 'medium_rectangle'"
               v-bind:_headerText="mediumRectangleTemplate.headerText"
               v-bind:_mainText="mediumRectangleTemplate.mainText"
               v-bind:_buttonText="mediumRectangleTemplate.buttonText"
               v-bind:_width="mediumRectangleTemplate.height"
               v-bind:_height="mediumRectangleTemplate.width"
               v-bind:_backgroundColor="mediumRectangleTemplate.backgroundColor"
               v-bind:_textColor="mediumRectangleTemplate.textColor"
               v-bind:_buttonBackgroundColor="mediumRectangleTemplate.buttonBackgroundColor"
               v-bind:_buttonTextColor="mediumRectangleTemplate.buttonTextColor"
               v-bind:show="show"
            ></medium-rectangle-template>

            <bar-template v-if="template === 'bar'"
               v-bind:_mainText="barTemplate.mainText"
               v-bind:_buttonText="barTemplate.buttonText"
               v-bind:_backgroundColor="barTemplate.backgroundColor"
               v-bind:_textColor="barTemplate.textColor"
               v-bind:_buttonBackgroundColor="barTemplate.buttonBackgroundColor"
               v-bind:_buttonTextColor="barTemplate.buttonTextColor"
               v-bind:show="show"
            ></bar-template>

            <short-message-template v-if="template === 'short_message'"
              v-bind:_text="shortMessageTemplate.text"
              v-bind:_backgroundColor="shortMessageTemplate.backgroundColor"
              v-bind:_textColor="shortMessageTemplate.textColor"
              v-bind:show="show"
            ></short-message-template>

            <ul class="tab-nav m-t-30" role="tablist" data-tab-color="teal">
                <li class="active">
                    <a href="#settings" role="tab" data-toggle="tab" aria-expanded="true">Settings</a>
                </li>
            </ul>

            <div class="card m-t-15">
                <div class="tab-content p-0">
                    <div role="tabpanel" class="active tab-pane" id="settings">
                        <div class="card-body card-padding p-l-15">
                            <div class="input-group fg-float">
                                <span class="input-group-addon"><i class="zmdi zmdi-account"></i></span>
                                <div class="fg-line">
                                    <label for="name" class="fg-label">Name</label>
                                    <input v-model="name" class="form-control fg-input" name="name" id="name" type="text" required>
                                </div>
                            </div>

                            <div class="input-group">
                                <span class="input-group-addon"><i class="zmdi zmdi-swap-alt"></i></span>
                                <div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <label class="fg-label">Transition</label>
                                        </div>
                                        <div class="col-md-12">
                                            <v-select v-model="transition"
                                                    id="transition"
                                                    :name="'transition'"
                                                    :value="transition"
                                                    :options.sync="transitionOptions"
                                                    :required="'required'"
                                            ></v-select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="input-group fg-float">
                                <span class="input-group-addon"><i class="zmdi zmdi-link"></i></span>
                                <div class="fg-line">
                                    <label for="target_url" class="fg-label">Target URL</label>
                                    <input v-model="targetUrl" class="form-control fg-input" name="target_url" type="text" id="target_url" required>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ul class="tab-nav m-t-30" role="tablist" data-tab-color="teal">
                <li v-on:click="displayType='overlay'" v-bind:class="{active: displayType === 'overlay'}">
                    <a href="#overlay-banner" role="tab" data-toggle="tab" aria-expanded="true">Overlay Banner</a>
                </li>
                <li v-on:click="displayType='inline'" v-bind:class="{active: displayType === 'inline'}">
                    <a href="#inline-banner" role="tab" data-toggle="tab" aria-expanded="false">Inline Banner</a>
                </li>
            </ul>

            <div class="card m-t-15">
                <div class="tab-content p-0">
                    <div role="tabpanel" v-bind:class="[{active: displayType === 'overlay'}, 'tab-pane']" id="overlay-banner">
                        <div class="card-body card-padding p-l-15">
                            <div class="input-group">
                                <span class="input-group-addon"><i class="zmdi zmdi-photo-size-select-large"></i></span>
                                <div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <label for="position" class="fg-label">Position</label>
                                        </div>
                                        <div class="col-md-12">
                                            <select v-model.lazy="position" class="selectpicker" name="position" id="position">
                                                <option v-for="option in positionOptions" v-bind:value="option.key">
                                                    {{ option.name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="input-group fg-float">
                                <span class="input-group-addon"><i class="zmdi zmdi-timer"></i></span>
                                <div class="fg-line">
                                    <label for="display_delay" class="fg-label">Display delay (milliseconds)</label>
                                    <input v-model="displayDelay" class="form-control fg-input" name="display_delay" type="number" id="display_delay">
                                </div>
                            </div>

                            <div class="input-group fg-float">
                                <span class="input-group-addon"><i class="zmdi zmdi-time-interval"></i></span>
                                <div class="fg-line">
                                    <label for="automatic_close" class="fg-label">Automatic close after (milliseconds)</label>
                                    <input v-model="closeTimeout" class="form-control fg-input" name="close_timeout" type="number" id="automatic_close">
                                </div>
                            </div>

                            <div class="input-group fg-float checkbox">
                                <label class="m-l-15">
                                    Ability to close banner manually
                                    <input v-model="closeable" value="1" name="closeable" type="checkbox">
                                    <i class="input-helper"></i>
                                </label>
                            </div>

                        </div>
                    </div>

                    <div role="tabpanel" v-bind:class="[{active: displayType === 'inline'}, 'tab-pane']" id="inline-banner">
                        <div class="card-body card-padding p-l-15">
                            <div class="input-group fg-float m-t-10">
                                <span class="input-group-addon"><i class="zmdi zmdi-filter-center-focus"></i></span>
                                <div class="fg-line">
                                    <label for="target_selector" class="fg-label">Target element selector</label>
                                    <input v-model="targetSelector" class="form-control fg-input" name="target_selector" type="text" id="target_selector">
                                </div>
                                <span class="input-group-addon"><i class="zmdi zmdi-eyedropper" v-bind:class="{ disabled: pickerDisabled }" id="target_selection" v-on:click="selectTarget"></i></span>
                            </div>
                            <div class="input-group fg-float">
                                <span class="input-group-addon"><i class="zmdi zmdi-link"></i></span>
                                <div class="fg-line" v-bind:class="{'has-error': selectorUrlError}">
                                    <label for="target_selector_url" class="fg-label">URL of target page for selection</label>
                                    <input v-model="targetSelectorUrl" class="form-control fg-input" name="target_selector_url" type="url" id="target_selector_url">
                                </div>
                            </div>

                            <div class="input-group fg-float checkbox">
                                <label class="m-l-15">
                                    Ability to close banner manually
                                    <input v-model="closeable" value="1" name="closeable" type="checkbox">
                                    <i class="input-helper"></i>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="input-group m-t-20">
                <div class="fg-line">
                    <button class="btn btn-info waves-effect" type="submit"><i class="zmdi zmdi-mail-send"></i> Save</button>
                </div>
            </div>
        </div>

        <div class="col-md-8">
            <ul class="tab-nav text-center" role="tablist" data-tab-color="teal">
                <li class="active pull-left">
                    <a href="#preview" role="tab" data-toggle="tab" aria-expanded="true">Preview</a>
                </li>
                <li v-if="previewFrameShow">
                    <div class="btn-group" id="frame-size-switcher">
                        <button type="button" class="btn waves-effect" v-bind:class="['btn-' + (previewFrameSize === 'auto' ? 'info' : 'default')]" data-size="auto" v-on:click="changeFrameSize" title="Auto">Auto</button>
                        <button type="button" class="btn waves-effect" v-bind:class="['btn-' + (previewFrameSize === 'xs' ? 'info' : 'default')]" data-size="xs" v-on:click="changeFrameSize" title="Mobile">Mobile</button>
                        <button type="button" class="btn waves-effect" v-bind:class="['btn-' + (previewFrameSize === 'md' ? 'info' : 'default')]" data-size="md" v-on:click="changeFrameSize" title="Medium">Medium</button>
                        <button type="button" class="btn waves-effect" v-bind:class="['btn-' + (previewFrameSize === 'xl' ? 'info' : 'default')]" data-size="xl" v-on:click="changeFrameSize" title="Extra Large">FullHD</button>
                    </div>
                </li>
                <li class="pull-right">
                    <button type="button" class="btn btn-default" v-on:click="show = !show">Toggle banner</button>
                </li>
            </ul>

            <div class="card m-t-15">
                <div class="tab-content p-0">
                    <div role="tabpanel" class="active tab-pane" id="preview">
                        <div class="card-body" id="banner-preview">
                            <iframe id="preview_frame"
                                    v-bind:src="previewFrameUrl"
                                    v-bind:style="previewFrameStyle"
                                    v-if="previewFrameShow"
                                    v-on:load="testCompatibility"
                            ></iframe>
                            <div class="p-relative">
                                <banner-preview
                                        :alignmentOptions="alignmentOptions"
                                        :dimensionOptions="dimensionOptions"
                                        :positionOptions="positionOptions"
                                        :show="show"
                                        :template="template"

                                        :mediumRectangleTemplate="mediumRectangleTemplate"
                                        :barTemplate="barTemplate"
                                        :htmlTemplate="htmlTemplate"
                                        :shortMessageTemplate="shortMessageTemplate"

                                        :position="position"
                                        :targetUrl="targetUrl"
                                        :closeable="closeable"
                                        :transition="transition"
                                        :displayType="displayType"
                                        :forcedPosition="'absolute'"
                                ></banner-preview>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <input type="hidden" name="display_type" v-bind:value="displayType" />
    </div>
</template>


<script>
    import HtmlTemplate from "./templates/Html"
    import MediumRectangleTemplate from "./templates/MediumRectangle";
    import BarTemplate from "./templates/Bar";
    import ShortMessageTemplate from "./templates/ShortMessage";
    import BannerPreview from "./BannerPreview";
    import vSelect from "remp/js/components/vSelect";

    const props = [
        "_name",
        "_targetUrl",
        "_position",
        "_transition",
        "_closeable",
        "_displayDelay",
        "_closeTimeout",
        "_targetSelector",
        "_displayType",
        "_template",

        "_mediumRectangleTemplate",
        "_barTemplate",
        "_htmlTemplate",
        "_shortMessageTemplate",

        "_alignmentOptions",
        "_dimensionOptions",
        "_positionOptions",
    ];

    export default {
        components: {
            HtmlTemplate,
            MediumRectangleTemplate,
            BarTemplate,
            ShortMessageTemplate,
            BannerPreview,
            vSelect,
        },
        name: 'banner-form',
        props: props,
        created: function(){
            props.forEach((prop) => {
                this[prop.slice(1)] = this[prop];
            });
            this.$on('values-changed', function(data) {
                for (let item of data) {
                    this[item.key] = item.val;
                }
            });
        },
        mounted: function(){
            this.$nextTick(function() {
                window.addEventListener('message', this.receiver, false);
                window.addEventListener('resize', this.changeFrameSize);
            })
        },
        data: () => ({
            name: null,
            targetUrl: null,
            position: null,
            transition: null,
            closeable: null,
            displayDelay: null,
            closeTimeout: null,
            targetSelector: null,
            targetSelectorUrl: null,
            displayType: null,
            template: null,

            mediumRectangleTemplate: null,
            barTemplate: null,
            htmlTemplate: null,
            shortMessageTemplate: null,

            alignmentOptions: [],
            dimensionOptions: [],
            positionOptions: [],
            show: true,

            transitionOptions: [
                {"label": "None", "value": "none"},
                {"label": "Fade", "value": "fade"},
                {"label": "Bounce", "value": "bounce"},
                {"label": "Shake", "value": "shake"},
                {"label": "Fade in down", "value": "fade-in-down"},
            ],

            previewFrameShow: false,
            previewFrameUrl: null,

            selectorUrlError: false,
            pickerDisabled: true,
            previewFrameSize: 'auto',
            previewFrameStyle: {},

            compatTimer: 0,
            compatDelay: 3000,
            viewportDimensions: {
                auto: 'auto',
                xs: 575,
                md: 991,
                xl: 1440
            }
        }),
        watch: {
            'targetSelectorUrl': function() {
                let $url   = $('#target_selector_url'),
                    urlVal = $url.val().trim();

                if (urlVal.length && $url[0].checkValidity()) {
                    this.previewFrameUrl = urlVal + "#remp-picker";
                    this.previewFrameShow = true;
                    this.selectorUrlError = false;
                    this.show = false;

                } else {
                    this.selectorUrlError = !!urlVal.length;
                    this.pickerDisabled = !urlVal.length;
                    this.previewFrameShow = false;
                    this.previewFrameUrl = null;
                    $url.focus();
                }
            }
        },
        methods: {
            selectTarget: function() {
                if (!this.pickerDisabled) {
                    this.sendMessage("remp-picker");
                }
            },
            testCompatibility: function() {
                this.$nextTick(() => {
                    if (this.sendMessage('remp-test')) {
                        clearTimeout(this.compatTimer);

                        this.compatTimer = setTimeout(function() {
                            this.pickerDisabled = true;
                            $.notify({
                                message: "Page is not compatible for interactive element selection.\n" +
                                "Please include the required .js file."
                            }, {
                                allow_dismiss: false,
                                type: 'danger'
                            });

                        }, this.compatDelay);
                    }
                });
            },
            changeFrameSize: function(e) {
                let frame = $('#preview_frame');

                if (!frame.is(':visible')) return;

                if (e.type === 'click') {
                    this.previewFrameSize = e.target.dataset.size;
                }

                let frameWidth = frame.width(),
                    newWidth   = this.viewportDimensions[this.previewFrameSize],
                    ratio      = parseFloat(frame[0].style.transform.replace(/[^0-9.]/g, '')) || 1,
                    container  = {
                        width: frame.parent().width(),
                        height: frame.parent().height()
                    },
                    newRatio  = container.width / newWidth,
                    newHeight = container.height / newRatio;

                if (newRatio > 1) {
                    this.previewFrameStyle = {
                        top:    '0px',
                        left:   ((container.width - newWidth) / 2) + 'px',
                        width:  (newWidth) + 'px',
                        height: (container.height) + 'px'
                    };
                } else if (newRatio === 1 || newWidth === 'auto') {
                    this.previewFrameStyle = {};
                } else if (newWidth !== frameWidth || newRatio !== ratio) {
                    this.previewFrameStyle = {
                        top:       ((container.height - newHeight) / 2) + 'px',
                        left:      ((container.width - newWidth) / 2) + 'px',
                        width:     newWidth + 'px',
                        height:    newHeight + 'px',
                        transform: 'scale(' + newRatio + ')'
                    };
                }
            },
            sendMessage: function(msg) {
                let iframe = document.getElementById('preview_frame');

                if (!$(iframe).is(':visible')) {
                    $.notify({
                        message: 'Please enter a valid URL of target page for selection'
                    }, {
                        allow_dismiss: false,
                        type: 'danger'
                    });

                } else {
                    iframe.contentWindow.postMessage(msg, '*');

                    return true;
                }

                return false;
            },
            receiver: function(e) {
                let message = this.parseResponse(e.data);

                if (message && $('#preview_frame').length) {
                    switch(message.remp_action){
                        case 'test_response':
                            this.pickerDisabled = false;
                            clearTimeout(this.compatTimer);
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
            }
        },

        beforeDestroy: function() {
            window.removeEventListener('message', this.receiver);
            window.removeEventListener('resize', this.changeFrameSize);
        }
    }
</script>

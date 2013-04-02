/*jslint vars: false, browser: true, nomen: true */
/*global MOOC: true, Backbone, $, _, */

"use strict";

var VimdingsBaseView = Backbone.View.extend({
    el: 'body',
    events: {
        'keydown *': 'onKeyDown',
        'keypress *': 'onKeyPress',
        'keyup *': 'onKeyUp'
    },
    initialize: function (events) {
        _.bindAll(this);
        if (events) {
            this.events = events;
        }
        this.command_mode = false;
        this.command_text = '';
        this.warning = '';
        this.last_code = '';
        this.last_kd_code = '';
        this.last_ku_code = '';
    },
    redraw_warning: function (command) {
        $('#vimdings-warning').text(command + ": " + this.warning).show();
        if (this.timeout) { clearTimeout(this.timeout); }
        this.timeout = setTimeout(function () {
            $('#vimdings-warning').fadeOut();
        }, 3000);
    },
    redraw_command_prompt: function () {
        $('#vimdings-command-prompt').text(":" + this.command_text);
    },
    onKeyDown: function (event) {
        var command_splited,
            charCode;

        if (this.command_mode) {
            charCode = event.which;
            // if esc
            if (charCode === 27) {
                event.preventDefault();
                this.command_mode = false;
                this.command_text = '';
                $('#vimdings-command-prompt').remove();
            // backspace
            } else if (charCode === 8) {
                event.preventDefault();
                this.command_text = this.command_text.slice(0, -1);
                if (this.command_text === '') {
                    this.command_mode = false;
                    $('#vimdings-command-prompt').remove();
                } else {
                    this.redraw_command_prompt();
                }
            // enter
            } else if (charCode === 13) {
                event.preventDefault();
                command_splited = this.command_text.split(" ");

                if (this['command_' + command_splited[0]] !== undefined) {
                    this['command_' + command_splited[0]](event, command_splited.slice(1));
                } else {
                    this.command_default(event, command_splited.slice(1));
                }
                this.command_text = '';
                this.command_mode = false;
                $('#vimdings-command-prompt').remove();
            }
        } else {
            if (this['handle_kd_' + charCode] !== undefined) {
                this['handle_kd_' + charCode](event);
            } else if (this['handle_kd_' + String.fromCharCode(charCode)] !== undefined && String.fromCharCode(charCode).length > 0) {
                this['handle_kd_' + String.fromCharCode(charCode)](event);
            } else {
                this.handle_kd_default(event);
            }
        }
        this.last_kd_code = charCode;
    },
    onKeyUp: function (event) {
        var charCode = event.which;
        if (this['handle_ku_' + charCode] !== undefined) {
            this['handle_ku_' + charCode](event);
        } else if (this['handle_ku_' + String.fromCharCode(charCode)] !== undefined && String.fromCharCode(charCode).length > 0) {
            this['handle_ku_' + String.fromCharCode(charCode)](event);
        } else {
            this.handle_ku_default(event);
        }
        this.last_ku_code = charCode;
    },
    onKeyPress: function (event) {
        var charCode = event.which;
        if (this.command_mode) {
            event.preventDefault();
            this.command_text = this.command_text + String.fromCharCode(charCode);
            this.redraw_command_prompt();
        } else {
            if (this['handle_' + charCode] !== undefined) {
                this['handle_' + charCode](event);
            } else if (this['handle_' + String.fromCharCode(charCode)] !== undefined) {
                this['handle_' + String.fromCharCode(charCode)](event);
            } else {
                this.handle_default(event);
            }
        }
        this.last_code = charCode;
    },
    // handle :
    'handle_:': function (event) {
        event.preventDefault();
        this.command_mode = true;
        $('body').append($('<div id="vimdings-command-prompt">:</div>"'));
        $('#vimdings-remove').remove();
    },
    handle_kd_default: function (event) {
    },
    handle_ku_default: function (event) {
    },
    handle_default: function (event) {
    },
    command_default: function (event, params) {
        if ($("div#vimdings-warning").length === 0) {
            $('body').append($('<div id="vimdings-warning"></div>"'));
        }
        this.warning = "Command not found";
        this.redraw_warning(this.command_text);
    }
});

'use strict';

(function ($) {

    ////////////////////////
    /* Checkboxes object. */
    ////////////////////////

    /**
     * Create a new checkbox context.
     *
     * @param {Object} context DOM context.
     */
    var Checkboxes = function (context) {
        this.$context = context;
    };

    /**
     * Check all checkboxes in context.
     */
    Checkboxes.prototype.check = function () {
        this.$context.find(':checkbox')
            .filter(':not(:disabled)')
            .prop('checked', true);
    };

    /**
     * Uncheck all checkboxes in context.
     */
    Checkboxes.prototype.uncheck = function () {
        this.$context.find(':checkbox')
            .filter(':not(:disabled)')
            .prop('checked', false);
    };

    /**
     * Toggle the state of all checkboxes in context.
     */
    Checkboxes.prototype.toggle = function () {
        this.$context.find(':checkbox')
            .filter(':not(:disabled)')
            .each(function () {
                var $checkbox = $(this);
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            });
    };

    /**
     * Set the maximum number of checkboxes that can be checked.
     *
     * @param {Number} max The maximum number of checkbox allowed to be checked.
     */
    Checkboxes.prototype.max = function (max) {
        if (max > 0) {
            // Enable max.
            var instance = this;
            this.$context.on('click.checkboxes.max', ':checkbox', function () {
                if (instance.$context.find(':checked').length === max) {
                    instance.$context.find(':checkbox:not(:checked)').prop('disabled', true);
                } else {
                    instance.$context.find(':checkbox:not(:checked)').prop('disabled', false);
                }
            });
        } else {
            // Disable max.
            this.$context.off('click.checkboxes');
        }
    };

    /**
     * Enable or disable range selection.
     *
     * @param {Boolean} enable Indicate is range selection has to be enabled.
     */
    Checkboxes.prototype.range = function (enable) {

        var $this = this;

        // Enable range selection.
        if (enable) {

            // Listing to click event on checkboxes.
            $this.$context.on('click.checkboxes.range', ':checkbox, label', function (event) {

                var $target = $(event.target);
                var isLabel = $target.is('label');
                var isCheckbox = $target.is(':checkbox');
                var $checkbox;

                if (isLabel) {

                    // Prevent label to propagate the event to its checkbox.
                    event.preventDefault();

                    // Find checkbox using the `for` property.
                    var id = $target.prop('for');
                    if ($.trim(id).length !== 0) {
                        $checkbox = $this.$context.find('#' + id);
                    }

                    // Find checkbox inside the label.
                    if (!$checkbox || $checkbox.length === 0) {
                        $checkbox = $target.find(':checkbox');
                    }

                    // Toggle checked property of the related checkbox.
                    if ($checkbox && !$checkbox.is(':disabled')) {
                        $checkbox.prop('checked', !$checkbox.prop('checked'));
                    }
                }

                if (isCheckbox) {
                    event.stopPropagation();
                    $checkbox = $target;
                }

                if (event.shiftKey && $this.$last) {
                    var $checkboxes = $this.$context.find(':checkbox');
                    var from = $checkboxes.index($this.$last);
                    var to = $checkboxes.index($checkbox);
                    var start = Math.min(from, to);
                    var end = Math.max(from, to) + 1;

                    $checkboxes.slice(start, end)
                        .filter(':not(:disabled)')
                        .prop('checked', $checkbox.prop('checked'));
                }

                $this.$last = $checkbox;
            });
        }

        // Disable range selection.
        else {
            this.$context.off('click.checkboxes.range');
        }

    };

    ///////////////////////////////
    /* Checkboxes jQuery plugin. */
    ///////////////////////////////

    // Keep old Checkboxes jQuery plugin, if any, to no override it.
    var old = $.fn.checkboxes;

    /**
     * Checkboxes jQuery plugin.
     *
     * @param {String} method Method to invoke.
     *
     * @return {Object} jQuery object.
     */
    $.fn.checkboxes = function (method) {
        // Get extra arguments as method arguments.
        var methodArgs = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this);

            // Check if we already have an instance.
            var instance = $this.data('checkboxes');
            if (!instance) {
                $this.data('checkboxes', (instance = new Checkboxes($this, typeof method === 'object' && method)));
            }

            // Check if we need to invoke a public method.
            if (typeof method === 'string' && instance[method]) {
                instance[method].apply(instance, methodArgs);
            }
        });
    };

    // Store a constructor reference.
    $.fn.checkboxes.Constructor = Checkboxes;


    ////////////////////////////////////
    /* Checkboxes jQuery no conflict. */
    ////////////////////////////////////

    /**
     * No conflictive Checkboxes jQuery plugin.
     */
    $.fn.checkboxes.noConflict = function () {
        $.fn.checkboxes = old;
        return this;
    };


    //////////////////////////
    /* Checkboxes data-api. */
    //////////////////////////

    /**
     * Handle data-api click.
     *
     * @param {Object} event Click event.
     */
    var dataApiClickHandler = function (event) {
        var el = $(event.target);
        var href = el.attr('href');
        var $context = $(el.data('context') || (href && href.replace(/.*(?=#[^\s]+$)/, '')));
        var action = el.data('action');

        if ($context && action) {
            if (!el.is(':checkbox')) {
                event.preventDefault();
            }
            $context.checkboxes(action);
        }
    };

    /**
     * Handle data-api DOM ready.
     */
    var dataApiDomReadyHandler = function () {
        $('[data-toggle^=checkboxes]').each(function () {
            var el = $(this),
                actions = el.data();
            delete actions.toggle;
            for (var action in actions) {
                el.checkboxes(action, actions[action]);
            }
        });
    };

    // Register data-api listeners.
    $(document).on('click.checkboxes.data-api', '[data-toggle^=checkboxes]', dataApiClickHandler);
    $(document).on('ready.checkboxes.data-api', dataApiDomReadyHandler);

})(window.jQuery);

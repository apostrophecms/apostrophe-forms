// @class Editor for all schema widgets

// After apos.data is available
$(function() {
  apos.log('hi');
  apos.log(apos.data.formWidgets);
  _.each(apos.data.formWidgets, function(info) {
    apos.widgetTypes[info.name] = {
      label: info.label,
      editor: function(options) {
        var self = this;

        self.type = info.name;
        options.template = '.apos-' + info.css + '-editor';

        AposWidgetEditor.call(self, options);

        // Block the standard A2 widget preview, which would cause
        // false negatives for the "required" fields and try too hard
        // to be continuously updated. We'll implement our own
        self.prePreview = function(callback) {
          return callback();
          // The preview call at startup just causes false negatives for
          // the "required" fields, and we don't do preview in the
          // widget editors anymore anyway
          // return self.debrief(callback);
        };

        self.preSave = function(callback) {
          return self.debrief(callback);
        };

        self.afterCreatingEl = function(callback) {
          self.$editButton = self.$el.find('[data-tab-button="edit"]');
          self.$previewButton = self.$el.find('[data-tab-button="preview"]');
          self.$editTab = self.$el.find('[data-tab="edit"]');
          self.$previewTab = self.$el.find('[data-tab="preview"]');

          self.$editButton.addClass('apos-active');
          self.$editTab.addClass('apos-active');

          self.$el.on('click', '[data-tab-button]', function() {
            var $button = $(this);
            var tab = $(this).attr('data-tab-button');
            if (tab === 'preview') {
              self.refreshPreview(after);
            } else {
              after();
            }
            function after() {
              self.$el.find('[data-tab-button]').removeClass('apos-active');
              self.$el.find('[data-tab]').removeClass('apos-active');
              $button.addClass('apos-active');
              var $tab = self.$el.find('[data-tab="' + tab + '"]');
              $tab.addClass('apos-active');
            }
            return false;
          });

          self.$fields = aposSchemas.findSafe(self.$el, '[data-fields]');
          return aposSchemas.populateFields(self.$fields, info.schema, self.data, function() {
            apos.emit('widgetModalReady', self);
            return callback();
          });
        };

        self.refreshPreview = function(callback) {
          // Validate first, then pass that data to the server
          // to get a nice rendering of it
          return self.debrief(function(err) {
            if (err) {
              return callback && callback(err);
            }
            return $.jsonCall(
              '/apos/render-widget',
              { dataType: 'html' },
              self.data,
              function(html) {
                // Work around fussy jquery HTML parsing behavior a little
                var $previewWidget = $($.parseHTML($.trim(html)));
                self.$previewTab.html('');
                self.$previewTab.append($previewWidget);

                // Schema widgets are often menus with links to various
                // pages. If we follow these in the preview, we lose
                // our work, and become sad. Disable links that don't
                // look javascripty in the preview.
                self.$previewTab.on('click', function(e) {
                  var $target = $(e.target);
                  var href = $target.attr('href');
                  if (href && (!href.match(/^#/))) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });

                apos.enablePlayers(self.$previewTab);
                return callback && callback();
              }
            );
          });
        };

        self.debrief = function(callback) {
          self.exists = false;
          return aposSchemas.convertFields(self.$fields, info.schema, self.data, function(err) {
            if (err) {
              aposSchemas.scrollToError(self.$el);
              return callback('error');
            }
            self.exists = true;
            return callback(null);
          });
        };
      }
    };

  });
});

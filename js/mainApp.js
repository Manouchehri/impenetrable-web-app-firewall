var checkConnInterval;
var SessionTimeout = 10 * 60; /*default*/
var SessionRemain = 10 * 60;  /*default*/
var SessionResetFlag = 0;
var SessionInterval;
var currentUser = '';

$(function() {
  /// Define the menus
  // The definition of Menu model.
  var Menu = Backbone.Model.extend({
    // Default attributes for the todo item.
    defaults : function() {
      return {
        tagName : "Tag",
        langTagId : "menu_tag",
        hyperLink : "#",
        visible : false,
        selected : false
      };
    },
    // If tag name is not defined, set the menu to default.
    initialize : function() {
      if (!this.get("tagName")) {
        this.set(this.defaults());
      }
      if (!this.get("selected")) {
        this.set({"selected" : this.defaults().selected});
      }
    }
  });

  // Define the menu collection.
  var MenuList = Backbone.Collection.extend({
    model : Menu,
    url : "/data/getMenu.asp",
    postUrl : "/goform/MainMenu",
    // Only one menu in the menulist can be selected.
    select : function(index) {
      for (i = 0; i < this.length; i++) {
        if (this.models[i].get("index") == index)
          this.models[i].set("selected", true);
        else
          this.models[i].set("selected", false);
      }
    }
  });

  // submenu: extend top menu collection.
  var SubMenuList = MenuList.extend(
      {url : "/data/getSubMenu.asp", postUrl : "/goform/SubMenu"});

  var menus = new MenuList;
  var subMenus = new SubMenuList;

  // Define menu view
  var MenuView = Backbone.View.extend({
    tagName : "li",
    template : _.template($('#menuitem-template').html()),

    events : {"click" : "selectMenu"},

    initialize : function() { this.model.bind('change', this.render, this); },

    render : function() {
      this.$el.html(this.template(this.model.toJSON()));
      if (this.model.get("selected"))
        this.$el.attr("class", "active");
      else
        this.$el.removeAttr("class");

      if (this.model.get("visible") == false)
        this.$el.hide();
      return this;
    },
    selectMenu : function() {
      // menus.select(this.model.get("index"));
      /*
      this.model.save("index",this.model.get("index"),{success:function(){
      subMenus.fetch();
      }});
      */
    }
  });

  // Submenu view
  var SubMenuView = Backbone.View.extend({
    tagName : "li",
    template : _.template($('#submenu-template').html()),
    events : {"click" : "selectMenu", "dblclick" : "selectMenu"},
    initialize : function() {
      this.model.bind('reset', this.render, this);
      this.model.bind('change', this.render, this);
    },
    render : function() {
      this.$el.html(this.template(this.model.toJSON()));
      if (this.model.get("selected")) {
        this.$el.attr("class", "active");
      } else
        this.$el.removeAttr("class");

      if (this.model.get("visible") == false)
        this.$el.hide();
      return this;
    },
    selectMenu : function() {
      // subMenus.select(this.model.get("index"));
      /*
      var loadUrl= this.model.get("hyperLink");
      this.model.save("index",this.model.get("index"),
      {
      success:function(){
      $('#maincontent').fadeOut("fast",function(){
      $('#maincontent').html('');
      $('#maincontent').load(loadUrl+".html");
      $('#maincontent').fadeIn();
      });
      }
      }
      );
      */
    }
  });

  // Define the head view.
  var HeadView = Backbone.View.extend({
    el : $('#menuTitle'),
    template : _.template($('#head-template').html()),
    submenuTemplate : _.template($('#submenu-template').html()),
    initialize : function() {
      this.model.bind('change', this.render, this);
      subMenus.bind('reset', this.showSubMenus, this);
      if (this.model.get("selected")) {
        subMenus.fetch();
      }
    },
    render : function() {
      if (this.model.get("selected")) {
        this.$el.html(this.template(this.model.toJSON()));
      }

      return this;
    },
    showSubMenus : function() {
      if (this.model.get("selected")) {
        this.$('#submenus').html('');
        var mainMenuId = this.model.get("index");
        var loadUrl;
        subMenus.each(function(menu) {
          var submenuview = new SubMenuView({model : menu});
          this.$('#submenus').append(submenuview.render().el);
          if (menu.get("selected")) {
            loadUrl = menu.get("hyperLink");
          }
        });

        $('#maincontent')
            .fadeOut("fast", function() {
              $('#maincontent').html('');
              $('#maincontent').load(loadUrl + ".html");
              $('#maincontent').fadeIn();

            });
      }
    }

  });

  var BatteryModel = Backbone.Model.extend({urlRoot : "data/battery.asp"});

  var batteryModel = new BatteryModel();

  var AppView = Backbone.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el : $("#mainApp"),

    events :
        {"click #btnLogout" : "logOut", "click .langSelect" : "setLanguage"},
    battTemplate : _.template($('#battery-template').html()),
    initialize : function() {
      menus.bind('reset', this.showMenus, this);
      // Backbone.history.start();
      menus.fetch();

      /*Load title*/
      $.getJSON("data/system_model.asp", function(json) {
        document.title = json.modelName + ' ' + $.tag_get('Menu_Title');
        /*Add theme support*/
        if (json.theme == "GCI") {
          console.log("Applying GCI theme");
          $('#navbar-inner').addClass("navbar-inner-silver");
          $('#brand-menu').addClass("brand-gci");
          $('#brand-menu').attr("href", "http://www.gci.com");
          $('#brand-menu')
              .html(
                  '<img src="img/logo_gci_small.png" alt="GCI" height="32px"></img>');

          $('.htx_slim_devider').hide();
          $('.icon-user').removeClass('icon-white');
        } else if (json.theme == "ACCESS") {
          console.log("Applying ACCESS theme");
          $('#navbar-inner').addClass("navbar-inner-silver");
          $('#brand-menu').addClass("brand-access");
          $('#brand-menu').attr("href", "http://www.myaccess.ca");
          $('#brand-menu')
              .html(
                  '<img src="/img/logo_access.png" alt="ACCESS" height="32px"></img>');
          $('.htx_slim_devider').hide();
          $('.icon-user').removeClass('icon-white');
        }
      });
      this.$('#currentUser')
          .load('data/getUser.asp?_=' + Math.random(), function() {
            var objString = $('#currentUser').html().replace(/\s/, '');
            var objLength = objString.length;
            currentUser = objString;
            var num = $('#currentUser').attr("limit");
            $('#titleid').attr('title', objString);
            if (objLength > num) {
              objString = objString.substring(0, num) + "...";
              $('#currentUser').html(objString);
            }
          }); // temprary use for loading user name.
      // this.$('#btnLogout').text($.tag_get("Menu_Logout"));
      // Add battery information for voice units.
      batteryModel.bind('change', this.renderBatteryInfo, this);
      batteryModel.fetch();
      if ($.hitron.languages.lang_current == 'fr_CA') {
        $('#currentLanguage').html($.tag_get('French'));
      } else {
        $('#currentLanguage').html('English');
      }
    },
    showMenus : function() {
      $("#topMenu").html('');
      menus.each(function(menu) {
        var menuview = new MenuView({model : menu});
        this.$("#topMenu").append(menuview.render().el);
        var headview = new HeadView({model : menu});
        // Render the head view.includeing tiltes and submenus.
        if (menu.get("selected")) {
          headview.render();
          /*
          var loadUrl=menu.get('hyperLink');
          loadUrl+="/m/"+menu.get('index');
          approuter.navigate(loadUrl);
          */
        }
      });
    },

    logOut : function() {
      this.$el.fadeOut(function() { window.location = "goform/logout"; });
    },

    renderBatteryInfo : function() {
      this.$('#li_battery').html(this.battTemplate(batteryModel.toJSON()));
    },

    setLanguage : function(event) {
      $.hitron.languages.lang_set($(event.currentTarget).attr("id"));
    }

  });

  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true;
  $.ajaxSetup({cache : false});
  // Finally, we kick things off by creating the **App**.

  $.hitron.languages.lang_init();
  var App = new AppView;

  ////Define the app router for history manage.
  var AppRouter = Backbone.Router.extend({
    routes : {":loadUrl/m/:menuId/s/:subMenuId" : "goPage"},
    goPage : function(loadUrl, menuId, subMenuId) {
      var i;
      if (getCookieValue("isEdit") != "0" || getCookieValue("isEdit1") != "0" ||
          getCookieValue("isEdit2") != "0" ||
          getCookieValue("isEdit3") != "0") {
        if (!confirm($.tag_get('Info_Leave_Confirm'))) {
          // console.log(getCookieValue("isEdit")+"
          // "+getCookieValue("isEdit1")+"   "+getCookieValue("isEdit2"));
          window.location.hash += "/1";
          return;
        }
      }
      if (menus.length == 0) {
        /* users input url or reload the page */
        return;
      }
      /* get the new url menuId index */
      for (i = 0; i < menus.length; i++) {
        if (menus.models[i].get("index") == menuId) {
          break;
        }
      }
      /* get the old url menuId index */
      if (menus.models[i].get("selected") == false) {
        /* menu has changed,need to fetch submenu */
        menus.select(menuId);
        $("a").bind("click", function(event) { event.preventDefault(); });
        //$("link[href='/extjs4/resources/css/ext-all.css']").remove();
        menus.models[i].save({"index" : menuId, "subIndex" : subMenuId}, {
          success : function() {
            subMenus.fetch({
              success : function() {
                $("a").unbind("click");
                setCookie("isEdit", "0", 24 * 30, "/");
                setCookie("isEdit1", "0", 24 * 30, "/");
                setCookie("isEdit2", "0", 24 * 30, "/");
                setCookie("isEdit3", "0", 24 * 30, "/");
              }
            });
          }
        });
      } else {
        /* Only submenu changed */
        for (i = 0; i < subMenus.length; i++) {
          if (subMenus.models[i].get("index") == subMenuId) {
            break;
          }
        }
        subMenus.select(subMenuId);
        $("a").bind("click", function(event) { event.preventDefault(); });
        //$("link[href='/extjs4/resources/css/ext-all.css']").remove();
        subMenus.models[i].save(
            {"index" : subMenuId, "mainIndex" : menuId, "loadurl" : loadUrl}, {
              success : function() {
                $('#maincontent')
                    .fadeOut("fast", function() {
                      $('#maincontent').html('');
                      setCookie("isEdit", "0", 24 * 30, "/");
                      setCookie("isEdit1", "0", 24 * 30, "/");
                      setCookie("isEdit2", "0", 24 * 30, "/");
                      setCookie("isEdit3", "0", 24 * 30, "/");
                      /*if (loadUrl == "advanced_spectrum") {
                      window.location.reload();
                      }*/
                      $('#maincontent')
                          .load(loadUrl + ".html", function(response, status) {
                            if (status == "success") {
                              $("a").unbind("click");
                            }
                          });
                      $('#maincontent').fadeIn();

                    });
              },
              error : function() {

              }
            });
      }
    }

  });
  approuter = new AppRouter;
  Backbone.history.start();

  window.onbeforeunload =
      function() {
    if (SessionRemain <= 0) {
      return;
    }
    if (getCookieValue("isEdit") != "0" || getCookieValue("isEdit1") != "0" ||
        getCookieValue("isEdit2") != "0" || getCookieValue("isEdit3") != "0") {
      return $.tag_get('Info_Leave_Confirm');
    }
    return;
  }

      $.get("data/getAdminMange.asp?_=" + Math.random(), function(data) {
        data = $.parseJSON(data);
        $.each(data, function(n, key) {
          // console.log(this.adminUsername);
          if (this.adminUsername == currentUser) {
            SessionTimeout = this.idleTime;
            SessionRemain = this.idleTime;
          }
        });
        // console.log("SessionTimeout: " + SessionTimeout);
        SessionInterval = setInterval(SessionFn, 1000);
      });

  var SessionFn = function() {
    if (SessionResetFlag == 1) {
      // console.log('Session Reset.');
      SessionRemain = SessionTimeout;
      SessionResetFlag = 0;
    }
    SessionRemain -= 1;
    // console.log("SessionRemain: " + SessionRemain);
    if (SessionRemain <= 0) {
      clearInterval(SessionInterval);
      window.location = '/';
    }
  };

  var checkConnFn = function() {
    $.ajax({
      type : "get",
      async : false,
      url : "data/getUser.asp?_=" + Math.random(),
      cache : false,
      timeout : 10000,
      success : function(result) {},
      error : function() {
        clearInterval(checkConnInterval);
        if (confirm($.tag_get('Info_Connect_Failed_Confirm'))) {
          if (SessionRemain >= 0) {
            clearInterval(SessionInterval);
          }
          window.location = '/';
        }
      }
    });
  };

  checkConnInterval = setInterval(checkConnFn, 60000);
});

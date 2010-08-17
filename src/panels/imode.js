Monocle.Panels.IMode = function (flipper, evtCallbacks) {

  var API = { constructor: Monocle.Panels.IMode }
  var k = API.constants = API.constructor;
  var p = API.properties = {}


  function initialize() {
    p.flipper = flipper;
    p.reader = flipper.properties.reader;
    p.panels = {
      forwards: new Monocle.Controls.Panel(),
      backwards: new Monocle.Controls.Panel()
    }
    p.divs = {}

    for (dir in p.panels) {
      p.reader.addControl(p.panels[dir]);
      p.divs[dir] = p.panels[dir].properties.div;
      p.panels[dir].listenTo(evtCallbacks);
      p.panels[dir].properties.direction = flipper.constants[dir.toUpperCase()];
      p.divs[dir].style.cssText += Monocle.Styles.ruleText(
        Monocle.Styles.Panels.IMode.dirPanel
      );
    }
    p.divs.backwards.style.cssText += Monocle.Styles.ruleText(
      Monocle.Styles.Panels.IMode.leftPanel
    );
    p.divs.forwards.style.cssText += Monocle.Styles.ruleText(
      Monocle.Styles.Panels.IMode.rightPanel
    );

    p.panels.central = new Monocle.Controls.Panel();
    p.reader.addControl(p.panels.central);
    p.divs.central = p.panels.central.properties.div
    p.divs.central.style.cssText += Monocle.Styles.ruleText(
      Monocle.Styles.Panels.IMode.menuPanel
    );
    menuCallbacks({ end: modeOn });

    p.toggleIcon = {
      createControlElements: function () {
        var div = this.div = document.createElement('div');
        div.style.cssText = Monocle.Styles.ruleText(
          Monocle.Styles.Panels.IMode.toggleIcon
        );
        Monocle.Events.listenForContact(div, { start: modeOff });
        return div;
      }
    }
    p.reader.addControl(p.toggleIcon, null, { hidden: true });
  }


  function menuCallbacks(callbacks) {
    p.menuCallbacks = callbacks;
    p.panels.central.listenTo(p.menuCallbacks);
  }


  function toggle() {
    p.interactive ? modeOff() : modeOn();
  }


  function modeOn() {
    if (p.interactive) {
      return;
    }

    p.panels.central.contract();

    var page = flipper.visiblePages()[0];
    var sheaf = page.m.sheafDiv;
    var bw = sheaf.offsetLeft;
    var fw = page.offsetWidth - (sheaf.offsetLeft + sheaf.offsetWidth);
    bw = Math.floor(((bw - 2) / page.offsetWidth) * 10000 / 100 ) + "%";
    fw = Math.floor(((fw - 2) / page.offsetWidth) * 10000 / 100 ) + "%";

    startCameo(function () {
      p.divs.forwards.style.width = fw;
      p.divs.backwards.style.width = bw;
      Monocle.Styles.affix(p.divs.central, 'transform', 'translateY(-100%)');
    });

    p.reader.showControl(p.toggleIcon);

    p.interactive = true;
  }


  function modeOff() {
    if (!p.interactive) {
      return;
    }

    p.panels.central.contract();

    deselect();

    startCameo(function () {
      p.divs.forwards.style.width = "33%";
      p.divs.backwards.style.width = "33%";
      Monocle.Styles.affix(p.divs.central, 'transform', 'translateY(0)');
    });

    p.reader.hideControl(p.toggleIcon);

    p.interactive = false;
  }


  function startCameo(fn) {
    // Set transitions on the panels.
    var trn = Monocle.Panels.IMode.CAMEO_DURATION+"ms ease-in";
    Monocle.Styles.affix(p.divs.forwards, 'transition', "width "+trn);
    Monocle.Styles.affix(p.divs.backwards, 'transition', "width "+trn);
    Monocle.Styles.affix(p.divs.central, 'transition', "-webkit-transform "+trn);

    // Temporarily disable listeners.
    for (var pan in p.panels) {
      p.panels[pan].deafen();
    }

    // Set the panels to opaque.
    for (var div in p.divs) {
      p.divs[div].style.opacity = 1;
    }

    if (typeof WebkitTransitionEvent != "undefined") {
      p.cameoListener = Monocle.Events.listen(
        p.divs.central,
        'webkitTransitionEnd',
        endCameo
      );
    } else {
      setTimeout(endCameo, k.CAMEO_DURATION);
    }
    fn();
  }


  function endCameo() {
    setTimeout(function () {
      // Remove panel transitions.
      var trn = "opacity linear " + Monocle.Panels.IMode.LINGER_DURATION + "ms";
      Monocle.Styles.affix(p.divs.forwards, 'transition', trn);
      Monocle.Styles.affix(p.divs.backwards, 'transition', trn);
      Monocle.Styles.affix(p.divs.central, 'transition', trn);

      // Set the panels to transparent.
      for (var div in p.divs) {
        p.divs[div].style.opacity = 0;
      }

      // Re-enable listeners.
      p.panels.forwards.listenTo(evtCallbacks);
      p.panels.backwards.listenTo(evtCallbacks);
      p.panels.central.listenTo(p.menuCallbacks);
    }, Monocle.Panels.IMode.LINGER_DURATION);


    if (p.cameoListener) {
      Monocle.Events.deafen(p.divs.central, 'webkitTransitionEnd', endCameo);
    }
  }


  function deselect() {
    for (var i = 0; i < p.reader.properties.divs.pages.length; ++i) {
      var frame = p.reader.properties.divs.pages[i].m.activeFrame;
      var sel = frame.contentWindow.getSelection();
      sel.removeAllRanges();
      frame.contentDocument.body.scrollLeft = 0;
      frame.contentDocument.body.scrollTop = 0;
    }
  }


  API.toggle = toggle;
  API.modeOn = modeOn;
  API.modeOff = modeOff;
  API.menuCallbacks = menuCallbacks;

  initialize();

  return API;
}

Monocle.Panels.IMode.CAMEO_DURATION = 250;
Monocle.Panels.IMode.LINGER_DURATION = 250;
Monocle.Panels.IMode.TOGGLE_ICON_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAaCAYAAABPY4eKAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1%2B%2FAAAABV0RVh0Q3JlYXRpb24gVGltZQAzMC82LzEwBMfmVwAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAANYSURBVEiJtdZbiNVVFMfxj8cx85JkIGlqSESgOGA9WIQgGmTRUyRaYFJDnUWYGV2eyiCpkIbEKJI1UqYvUkmFDxFBgpghonajSDCM7hcxLSnt4ulh%2F2c4HufMTOH8Xs75%2F%2Ffa67v3%2Bu%2B91hphGJWZNUzCXJyKiHd6xxqNhhGDTB6NOViAyzARY3EaP%2BNL7MCBiPi9Ze4leBlTsR9jcCnuiYgDbeGZeV4F7EINe7EP3%2BJ49W4GrsZ8NPAGXouIk5k5F93YFhHPVT5H4kbcjaX1ev3kWfDMPB9P4ko8ERE7BopONWcOVmMc1uBRrG8Oc5Ptq1hdr9cPdrQMTMUWfBQRCweD9ioiPsQtmbkeu7G8P3ClsZSI98EzcxqeUsLXM1RwZs7ErRiJKXgQN2Tmzoj4qsV2Hn7BYcq369UaHIqI5yPizyGCx2MPfsRVOBoR6%2FA%2BNmXmqCbbm%2FAiMiJO9cEzcwEuwLODwMZk5oXVLYA6PouIF%2FC6cvBgI37D0mreStyJroh4r9df785XYGtEHG8Hfnjb1w08Xu2qq3regtOZuaka2whV5NZieWY%2BhkV4ICJ2N%2FusZeYMJQm8NdCuuxdPH4HENGzsXjx9REQcqRxvR2dEfNBrHxF7lHywGPXW7085cEvwZkScHAheaRz%2BwngcqyAnlEPan%2Fbh5oj4rr%2FBDlyOXUMA%2Fx%2F9oFytM5SZs3t6epbWlOtxeJjg%2BzEmMye3vF%2BCYx2YhdFnTTs3OoQT2JqZ3TiC2zETyzrwrnIwhkMTqwVsxW24GLsiYmWj0dCBo2gNy7nSRfgpIjZjM6WU1ut1lHt%2BGLOHCd6J79sN1pSkMSUzJwwD%2FBoD5I9aRHyiFIVFQ3D2j1KR%2Fh7MMDPnY1JE7GwLr3434N5BnI3GFRiFzuai0Ub34aWBDGr0pcKPM%2FPpqovpT11KoVinNAvXt1lkLTNXKFesXU1HUz3HI0plWqW0QGcoIjYoERpMy7AS17b2da06o43KzLF4RanRzwwx3%2FfOHYW7lL5ubUR83p9do9Ho%2B99fDzcZDynfdxPejog%2FBoCOxHW4AxOwKiK%2BaGc%2FILzJ6ULcXznciwM4qFSzCUob3Km0UCeU3W5v5%2B8%2FwZsWMQvzlN1Nq8C%2F4ht8qkRm72B%2B%2BoP%2FC0sEOftJmUbfAAAAAElFTkSuQmCC";


Monocle.Styles.Panels.IMode = {
  dirPanel: {
    "width": "33%",
    "background": "rgba(255,255,255,0.7)",
    "opacity": "0"
  },
  leftPanel: {
    "left": "0",
    "-webkit-box-shadow": "1px 1px 3px #777",
    "-moz-box-shadow": "1px 1px 3px #777",
    "box-shadow": "1px 1px 3px #777"
  },
  rightPanel: {
    "right": "0",
    "-webkit-box-shadow": "-1px 1px 3px #777",
    "-moz-box-shadow": "-1px 1px 3px #777",
    "box-shadow": "-1px 1px 3px #777"
  },
  menuPanel: {
    "left": "33%",
    "width": "34%",
    "background": "rgba(255,255,255,0.7)",
    "opacity": "0"
  },
  toggleIcon: {
    "position": "absolute",
    "right": "0",
    "bottom": "0",
    "width": "50px",
    "height": "50px",
    "background": "url("+Monocle.Panels.IMode.TOGGLE_ICON_URI+") " +
      "no-repeat center center"
  }
}


Monocle.pieceLoaded('panels/imode');

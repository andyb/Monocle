// PLACE

Monocle.Place = function () {

  var API = { constructor: Monocle.Place }
  var k = API.constants = API.constructor;
  var p = API.properties = {
    component: null,
    percent: null
  }


  function setPlace(cmpt, pageN) {
    p.component = cmpt;
    p.percent = pageN / cmpt.lastPageNumber();
    p.chapter = null;
  }


  function setPercentageThrough(cmpt, percent) {
    p.component = cmpt;
    p.percent = percent;
    p.chapter = null;
  }


  function componentId() {
    return p.component.properties.id;
  }


  function percentageThrough() {
    return p.percent;
  }


  function pageAtPercentageThrough(pc) {
    return Math.max(Math.round(p.component.lastPageNumber() * pc), 1);
  }


  function pageNumber() {
    return pageAtPercentageThrough(p.percent);
  }


  function chapterInfo() {
    if (p.chapter) {
      return p.chapter;
    }
    return p.chapter = p.component.chapterForPage(pageNumber());
  }


  function chapterTitle() {
    var chp = chapterInfo();
    return chp ? chp.title : null;
  }


  function getLocus(options) {
    options = options || {};
    var locus = {
      page: pageNumber(),
      componentId: componentId()
    }
    if (options.direction) {
      locus.page += options.direction;
    }
    return locus;
  }


  API.setPlace = setPlace;
  API.setPercentageThrough = setPercentageThrough;
  API.componentId = componentId;
  API.percentageThrough = percentageThrough;
  API.pageAtPercentageThrough = pageAtPercentageThrough;
  API.pageNumber = pageNumber;
  API.chapterInfo = chapterInfo;
  API.chapterTitle = chapterTitle;
  API.getLocus = getLocus;

  return API;
}


Monocle.Place.FromPageNumber = function (component, pageNumber) {
  var place = new Monocle.Place();
  place.setPlace(component, pageNumber);
  return place;
}

Monocle.Place.FromPercentageThrough = function (component, percent) {
  var place = new Monocle.Place();
  place.setPercentageThrough(component, percent);
  return place;
}

Monocle.pieceLoaded('place');

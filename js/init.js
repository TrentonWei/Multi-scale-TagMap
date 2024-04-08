// import axios from 'axios';
var ViewResolution; //View分辨率
var wordPara; //word参数
var map; //Map
var CenterPointSource;//Tag中心的Source
var CenterPointLayer;//Tag中心的Point
var RecSource;//Tag矩形的Source
var RecLayer;//Tag矩形的Layer
var TriSource;
var TriLayer;
//var DataURL="./data/Comment_Data.json";
var spanCol = [];
var VectorSource;
var selectedFeats; //选中的要素
var DrawTxtColorArr = [];
var angleArr = [];//记录Tag可选的方向
var bolCheck = true;
var a = 0.0, b = 0.0; //字大比例系数和字大偏置参数，依据MaxWordSize and MinWordSize计算
//Linear时a和b的计算方法
//a=(maxWordSize-minWordSize)/(maxValue-minValue);//字大比例参数
//b=maxWordSize-a*maxValue;//字大偏置参数
var QNum = 7;   //The font size will be divided into 7 quantiles.
var vector;
var view;
var jsonData = [];
var NumData = [];
var worldResolution; //World分辨率


function init() {
  var text;
  var textSize;
  var sizeGap = 20;     //The gap between calculation font size and the last font size is less than 10px.
  var rotateAangle = 0;
  /*var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  });*/


  //#region 示例底图Map
  VectorSource = new ol.source.Vector({
    url: './data/world.geojson',
    //url:'https://openlayers.org/en/v4.4.2/examples/data/geojson/polygon-samples.geojson',
    format: new ol.format.GeoJSON()
  });
  vector = new ol.layer.Vector({
    source: VectorSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 1.25
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,1)'
      })
    })
  });
  //#endregion

  //#region 定义三角网的Vector 指定Source
  TriSource = new ol.source.Vector();
  TriLayer = new ol.layer.Vector({
    source: TriSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,0,0,0.5)'
      })
    })
  });
  //#endregion

  //#region 定义Tag的CenterPoint Vector 指定Source
  CenterPointSource = new ol.source.Vector();
  CenterPointLayer = new ol.layer.Vector({
    source: CenterPointSource
    //style: pointStyleFunction
  });
  //#endregion

  VirtualTagSource = new ol.source.Vector();
  VirtualTagLayer = new ol.layer.Vector(
    {
      source: VirtualTagSource,
      //style:pointStyleFunction,
      style: VirtualPointStyle,
      visible: false
    });

  VirtualTagRecSource = new ol.source.Vector();
  VirtualTagRecLayer = new ol.layer.Vector({
    source: VirtualTagRecSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        //color: 'rgba(0,255,0,0)',// '#f00', //RGB A透明度
        color: 'rgba(0,0,0, 0.5)',
        width: 5
      }),
      //fill: new ol.style.Fill({
      //color: 'rgba(0,255,0,0)'
      //color: 'rgba(0,0,255, 1)'
      //})
    }),
    visible: false
  });
  //#endregion

  //#region 定义Tag的Rectangle Vector 指定Source
  RecSource = new ol.source.Vector();
  RecLayer = new ol.layer.Vector({
    source: RecSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0,255,0,0)',// '#f00',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0,255,0,0)'
      })
    })
    //visible:false
  });
  var SelVectorLayer = RecLayer;
  //#endregion

  //#region 定义叠加图层的Vector，指定source
  var featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#f00',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,0,0,0)'
      })
    })
  });
  //#endregion

  /**
   * Elements that make up the popup.
   */
  var container = document.getElementById('popup');
  //var containerTitle=document.getElementById('popup-title');
  //var containerTitleLabel=document.getElementById('popup-title-label');
  var content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');
  var showTool = document.getElementById('TPShow');
  var showHelp = document.getElementById('TPHelp');
  /**
   * Create an overlay to anchor the popup to the map.
   */
  var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  }));
  /**
   * Add a click handler to hide the popup.
   * @return {boolean} Don't follow the href.
   */
  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  var switched = false;
  showTool.onclick = function () {
    var arrowClass = switched ? "TPShow-up" : "TPShow-down";
    showTool.setAttribute('class', arrowClass);
    switched = !switched;
    $(".TPElem").toggle("blind");
  };

  showHelp.onclick = function () {
    $("#dialog").dialog({
      resizable: false,
      width: "300px"
    });
  };

  view = new ol.View({
    center: [0, 0],
    zoom: 15,
    zoomFactor: 1.1
    //zoom:2,
  });
  worldResolution = view.getResolution();

  var logoUl = document.createElement('ul');
  logoUl.style.styleFloat = 'left'; //ie
  logoUl.style.cssFloat = 'left'; //google chrome
  logoUl.style.font = "bold 12px arial,serif";
  var logoLi = document.createElement('li');
  logoLi.style.display = 'inline';
  var logoTxt = document.createElement('label');
  logoTxt.innerHTML = "©2020-";
  logoLi.appendChild(logoTxt);
  logoUl.appendChild(logoLi);
  logoLi = document.createElement('li');
  logoLi.style.display = 'inline';
  var logoElement = document.createElement('a');
  logoElement.href = 'https://www.geovista.psu.edu/';
  logoElement.target = '_blank';
  //var logoImage = document.createElement('img');
  //logoImage.src = './images/GeoVISTA.gif';
  //logoElement.appendChild(logoImage);
  logoLi.appendChild(logoElement);
  logoUl.appendChild(logoLi);
  logoLi = document.createElement('li');
  logoLi.style.display = 'inline';
  logoTxt = document.createElement('label');
  logoTxt.innerHTML = "contributors.Developed by ";
  logoLi.appendChild(logoTxt);
  logoUl.appendChild(logoLi);
  logoLi = document.createElement('li');
  logoLi.style.display = 'inline';
  logoElement = document.createElement('a');
  logoElement.innerHTML = "CUG";
  logoElement.href = 'mailto:yangnai@cug.edu.cn';
  logoElement.target = '_blank';
  logoLi.appendChild(logoElement);
  logoUl.appendChild(logoLi);

  //#region 定义Map，并添加对应的Source和Layer
  map = new ol.Map({
    //layers: [raster, vector,TriLayer,RecLayer,CenterPointLayer,featureOverlay],
    layers: [vector, RecLayer, CenterPointLayer, VirtualTagLayer, VirtualTagRecLayer],
    //layers: [vector, RecLayer, CenterPointLayer],
    overlays: [overlay],
    target: 'map',
    view: view,
    logo: logoUl
  });
  var zoomslider = new ol.control.ZoomSlider();
  map.addControl(zoomslider);
  //#endregion

  //var toolbar = new ol.control.Turf();
  //map.addControl(toolbar);
  var txtColorArr = ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(82,82,82)', 'rgb(102,166,30)', 'rgb(230,171,2)', 'rgb(166,118,29)', 'rgb(102,102,102)'];
  /*txtColorArr=function(){
    for(var c=0;c<numColor;c++){
      txtColorArr.push($(".rampAccent").find("rect").eq(c).attr("fill"));
    }
    return txtColorArr;
  };*/
  //wordPara save the parameters of word.
  wordPara = {
    text: document.getElementById('points-text'),
    //rotation: document.getElementById('points-rotation'),
    font: document.getElementById('points-font'),
    bold: document.getElementById('points-bold'),
    maxSize: document.getElementById('MaxFontSize'),
    minSize: document.getElementById('MinFontSize'),
    calMethod: document.getElementById('SizeCal'),
    color: txtColorArr,
    outlineColor: document.getElementById('outColor'),
    outlineWidth: document.getElementById('outWidth')
    //maxreso: document.getElementById('points-maxreso')
  };

  ShowDialog();
  SelectOrientation();
  //var wordSizeArr=new Array(); 
  //var zoomFlag=false;
  /**The following code is used to get the DPI of monitor.**/
  var arrDPI = [];
  if (window.screen.deviceXDPI != undefined) {
    arrDPI[0] = window.screen.deviceXDPI;
    arrDPI[1] = window.screen.deviceYDPI;
  }
  else {
    var tmpNode = document.createElement("DIV");
    tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
    document.body.appendChild(tmpNode);
    arrDPI[0] = parseInt(tmpNode.offsetWidth);
    arrDPI[1] = parseInt(tmpNode.offsetHeight);
    tmpNode.parentNode.removeChild(tmpNode);
  }

  var highlight;
  var tagFeatNameCol = [];   //it includes all the tag features' name.
  var popCol = [];
  var DrawLineArr = [];



  // 分辨率改变时的操作(多分辨率主要通过该操作完成)
  map.getView().on("change:resolution", function () {
    //alert('OK');
    //#region 依据Size进行选取
    var curResol = map.getView().getResolution();
    if (curResol < 192000) {     //wordPara.maxreso.value){-----------control the visual scale
      if (CenterPointSource.getFeatures().length > 0) {
        //TriLayer.setVisible(true);
        //RecLayer.setVisible(true);
        CenterPointLayer.setVisible(true);
        var wordFeat;
        var wordFeatStyle;
        var wordStyle;
        var wordFont;
        // if(zoomFlag==false){
        //   wordSizeArr=new Array();
        //   for(var c=0;c<CenterPointSource.getFeatures().length;c++){
        //     wordFeat=CenterPointSource.getFeatures()[c];
        //     wordFeatStyle=wordFeat.getStyle();
        //     wordStyle=wordFeatStyle.getText();
        //     wordFont=wordStyle.getFont();
        //     wordSizeArr.push(wordFont);
        //   }
        //   zoomFlag=true;
        // }else{   

        //setTimeout(main, 6000);
        for (var c = 0; c < CenterPointSource.getFeatures().length; c++) {
          console.log(CenterPointSource.getFeatures().length);
          wordFeat = CenterPointSource.getFeatures()[c];
          // console.log(wordFeat);
          wordFeatStyle = wordFeat.getStyle();
          wordStyle = wordFeatStyle.getText();
          wordFont = wordFeat.get('font');
          var i = wordFont.indexOf("px");
          var sub = wordFont.substr(0, i);
          //console.log(wordStyle.getText()+":"+sub);      
          i = sub.indexOf(" ");
          var txtSize;
          var calResol = wordFeat.get("resolution");
          if (i == -1) {
            txtSize = Math.round(sub * calResol / curResol);
            wordFont = txtSize + "px " + wordPara.font.value;
          } else {
            txtSize = Math.round(sub.slice(i) * calResol / curResol);
            wordFont = "Bold" + ' ' + txtSize + "px " + wordPara.font.value;
          }
          if (txtSize >= minWordSize) {
            //TriLayer.setVisible(true);
            //RecLayer.setVisible(true); 
            wordStyle.setFont(wordFont);
            wordFeatStyle.setText(wordStyle);
            wordFeat.setStyle(wordFeatStyle);
            CenterPointLayer.setVisible(true);
          }
          else {    //若txtsize小于最小尺寸，则设置其txtsize为0  
            //TriLayer.setVisible(false);
            //RecLayer.setVisible(false);
            wordFont = "0 px " + wordPara.font.value;
            wordStyle.setFont(wordFont);
            wordFeatStyle.setText(wordStyle);
            wordFeat.setStyle(wordFeatStyle);
            // console.log(wordFont);
            //CenterPointLayer.setVisible(false);
          }

          //console.log(wordStyle.getText()+":"+txtSize);   
          console.log(c + "." + wordStyle.getText() + ":" + wordFeat.get("weight") + "-" + txtSize + "," + rotateAangle);
        }
        //}        
      } else {
        //TriLayer.setVisible(false);
        //RecLayer.setVisible(false);
        CenterPointLayer.setVisible(false);
      }
      if (spanCol.length > 0) {
        for (var s = 0; s < spanCol.length; s++) {
          sub = spanCol[s][2];      //spanCol.push([labIndex,idTxt,textSize,ViewResolution]);
          calResol = spanCol[s][3];
          txtSize = Math.round(sub * calResol / curResol);
          if (txtSize >= minWordSize) {
            $("#" + spanCol[s][5] + spanCol[s][0]).css({
              "font-size": txtSize,
              display: "inline-block"
            })
          } else {
            $("#" + spanCol[s][5] + spanCol[s][0]).css({
              "font-size": txtSize,
              display: "none"
            })
          }
        }
      }
      map.renderSync();   //It can't be delete. Otherwise, when a polygon is clicked, the map will be zoomed in and zoomed out again. But the line will not recovered.
      for (var p = 0; p < popCol.length; p++) {
        //var pOverLay=popCol[p][2];
        var ele = $("#" + popCol[p][0]);
        var eleX = ele.offset().left;
        var eleY = ele.offset().top;
        var eleW = ele.width();
        var eleH = ele.height();
        eleX = eleX + eleW / 2;
        eleY = eleY + eleH / 2;
        var coor = map.getCoordinateFromPixel([eleX, eleY]);
        var relFeat = popCol[p][3];
        var TSelectCenter = turf.centroid(relFeat);
        var format = new ol.format.GeoJSON();
        var ol_TSelectCenter = format.readFeature(TSelectCenter);
        var ol_TSelPoint = ol.extent.getCenter(ol_TSelectCenter.getGeometry().getExtent());
        var DrawLine;
        for (var l = 0; l < DrawLineArr.length; l++) {
          if (DrawLineArr[l][0] == popCol[p][1]) {
            DrawLine = new ol.geom.LineString([ol_TSelPoint, coor]);
            DrawLineArr.splice(l, 1, [popCol[p][1], DrawLine]);
            break;
          }
        }
      }
    } else {
      CenterPointLayer.setVisible(false);
      featureOverlay.getSource().clear();
      highlight = null;
    }
    //#endregion

    //#region 考虑利用聚合来处理

    //#endregion
  });

  var info = $('#info');
  info.innerHTML = 'hahahahahaahaha';

  /*info.tooltip({
    track:true
  });*/

  //#region The functions for free mousemove
  $("#SizeCal").mousemove(function (e) {
    info[0].style.visibility = "visible";
    info.css({
      left: (e.pageX + 10) + 'px',
      top: (e.pageY + 10) + 'px'
    });
    info[0].innerHTML = 'The method is used to calculate the font size of each tag.';
  });

  $("#SizeCal").mouseout(function (e) {
    info[0].style.visibility = "hidden";
  });

  $("#fileField").mousemove(function (e) {
    this.cursor = "pointer";
    info[0].style.visibility = "visible";
    info.css({
      left: (e.pageX + 10) + 'px',
      top: (e.pageY + 10) + 'px'
    });
    info[0].innerHTML = 'Select a JSON file for tags. The structure like:<br>{<br>"USA":<br>{<br>"Topic1":{"tag11":100,"tag12":100,"tag13":100},<br>"Topic2":{"tag21":100,"tag22":100,"tag23":100},<br>"Topic3":{"tag31":100,"tag32":100,"tag33":100},<br>},<br>"China":<br>{<br>"Topic1":{"tag41":100,"tag42":100,"tag43":100},<br>"Topic2":{"tag51":100,"tag52":100,"tag53":100},<br>"Topic3":{"tag61":100,"tag62":100,"tag63":100},<br>},<br>}"';
  });
  //#endregion

  var minValue;
  var maxValue;
  var valueGap;
  var aveGap;
  var aveNum;
  $("#fileField").on('change', function (e) {
    //var name = e.currentTarget.files[0].name;
    a = 0.0;
    b = 0.0;
    var files = e.target.files;
    /*var reader = new FileReader();
    reader.onload = function(e) {
      reader.readAsDataURL(e.currentTarget.files[0]);
      var data= e.target.result;
      console.log( data);
    }*/
    if (files && files.length > 0) {
      if (!/\.(json)$/.test(files[0].name)) {
        alert('Please select a json file for tags at first!');
        return;
      }
      var reader = new FileReader();
      //读取文件
      reader.readAsText(files[0], "UTF-8");
      //reader.readAsDataURL(files[0]);
      //读取完文件之后会回来这里
      reader.onload = function (evt) {
        var fileString = evt.target.result;
        var jsonFile = $.parseJSON(fileString);
        // console.log(fileString);
        NumData = [];
        jsonData = [];
        $.each(jsonFile, function (countryName, field) {
          jsonData.push({ country: countryName, Properties: field });
          for (var top in field) {
            for (var tag in field[top]) {
              if (field[top][tag] > 0) {
                NumData.push([tag, field[top][tag], countryName]);
              }
            }
          }
        });
        // function sortNumber(a,b)
        // {
        //    return b - a;
        // }
        NumData.sort(descend);
        //var valueExtent = d3.extent(NumData, function(d) { return d; });
        minValue = NumData[NumData.length - 1][1];
        maxValue = NumData[0][1];//valueExtent[1];
        valueGap = maxValue - minValue;     //They are used to generate the normalization of tags' value
        aveGap = valueGap / QNum;
        aveNum = NumData.length / QNum;
        alert("The JSON file has been successfully updated!")
      };
    }
    var filename = $(this).val();
    var lastIndex = filename.lastIndexOf("\\");
    if (lastIndex >= 0) {
      filename = filename.substring(lastIndex + 1);
      //$('#textfield').attr('value',filename);
    } else {
      //$('#textfield').attr('value',"Select your JSON file");
    }
    /*function getObjectURL(file) {
     var url = null ;
     if (window.createObjectURL!=undefined) {
       url = window.createObjectURL(file) ;
     } else if (window.URL!=undefined) {
       url = window.URL.createObjectURL(file) ;
     } else if (window.webkitURL!=undefined) {
       url = window.webkitURL.createObjectURL(file) ;
     }
     return url ;
   }
   var oFReader = new FileReader();
   var file = document.getElementById('fileField').files[0];
   var objUrl = getObjectURL(file) ;
   oFReader.readAsDataURL(file);
   oFReader.onloadend = function(oFRevent){
     var src = oFRevent.target.result;
     //var src=$("#fileField").val();
     //var name = e.currentTarget.files[0].name;
     $('#textfield').attr('value',src);
     alert(objUrl);
   }*/
  });

  var wordFeature;
  var displayFeatureInfo = function (pixel) {
    var countryFeat = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (layer == vector) {
        return feature;
      }
    });
    //if(CenterPointLayer.getVisible()==true){
    wordFeature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (layer == SelVectorLayer) {     //bounding box of each tag
        selectClick.getFeatures().clear();
        selectedFeats.clear();
        $("#clearSelected").attr("disabled", true);
        $("#showInPopup").attr("disabled", true);
        var i = CenterPointSource.getFeatures().length;
        while (i > 0) {
          var tagFeat = CenterPointSource.getFeatures()[i - 1];
          if ((tagFeat.get("tag") == feature.get("name")) && (tagFeat.get("belongto") == feature.get("belongto")) && (tagFeat.get("type") == feature.get("type"))) {
            var wordStyle = tagFeat.getStyle();
            var wordTStyle = wordStyle.getText();
            var wordFont = wordTStyle.getFont();
            var j = wordFont.indexOf("px");
            var sub = wordFont.substr(0, j);
            j = sub.indexOf(" ");
            var txtSize;
            if (j == -1) {
              txtSize = sub;
            } else {
              txtSize = sub.slice(j);
            }
            if (txtSize >= minWordSize) {
              map.getTargetElement().style.cursor = 'pointer';
              return feature;
              //break;
            } else {
              map.getTargetElement().style.cursor = '';
            }
          }
          i = i - 1;
        };
      } else {
        map.getTargetElement().style.cursor = '';
      }
    });
    //Highlight the tags with the same topic      
    if (wordFeature !== highlight) {
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
        i = CenterPointSource.getFeatures().length;
        while (i > 0) {
          tagFeat = CenterPointSource.getFeatures()[i - 1];
          wordStyle = tagFeat.getStyle();
          wordTStyle = wordStyle.getText();
          var wordFill = wordTStyle.getFill();
          var wordColor = wordFill.getColor();
          var wordColorArr = ol.color.asArray(wordColor);
          if (wordColorArr[3] != 1) {
            wordColorArr.splice(3, 1, 1);
            wordFill.setColor(wordColorArr);
            wordTStyle.setFill(wordFill);
            wordStyle.setText(wordTStyle);
            tagFeat.setStyle(wordStyle);
            //map.renderSync();
          }
          i = i - 1;
        }
        if (spanCol.length > 0) {
          for (s = 0; s < spanCol.length; s++) {
            $("#" + spanCol[s][5] + spanCol[s][0]).css({
              opacity: 1
            });
          }
        }
      }
      if (wordFeature) {
        //var CountryName=wordFeature.get("belongto");
        var TopicName = wordFeature.get("type");
        var i = CenterPointSource.getFeatures().length;
        featureOverlay.getSource().addFeature(wordFeature);
        while (i > 0) {
          tagFeat = CenterPointSource.getFeatures()[i - 1];
          tagFeatCName = tagFeat.get("belongto");
          tagFeatTName = tagFeat.get("type");
          //if((CountryName==tagFeatCName) && (TopicName!=tagFeatTName)){
          if (TopicName != tagFeatTName) {
            wordStyle = tagFeat.getStyle();
            wordTStyle = wordStyle.getText();
            wordFill = wordTStyle.getFill();
            wordColor = wordFill.getColor();
            wordColorArr = ol.color.asArray(wordColor);
            wordColorArr.splice(3, 1, 0.2);
            wordFill.setColor(wordColorArr);
            wordTStyle.setFill(wordFill);
            wordStyle.setText(wordTStyle);
            tagFeat.setStyle(wordStyle);
            //map.renderSync();
          }
          i = i - 1;
        }
        if (spanCol.length > 0) {
          for (var s = 0; s < spanCol.length; s++) {
            if (spanCol[s][6] != TopicName) {
              $("#" + spanCol[s][5] + spanCol[s][0]).css({
                opacity: 0.2
              });
            }
          }
        }
      }
      highlight = wordFeature;
    }
    /*}else{
      featureOverlay.getSource().clear();
      highlight=null;
    }*/
    //info[0].innerHTML=countryFeat.get("name");
    //document.getElementById('info').innerHTML=countryFeat.get("name");

    if (countryFeat) {
      i = CenterPointSource.getFeatures().length;
      var tagHideNum = 0;   //it records the number of tags hiden in each region
      while (i > 0) {
        var showTag = CenterPointSource.getFeatures()[i - 1];
        if (countryFeat.get("STUSPS") == showTag.get("belongto")) {
          var tagFont = showTag.getStyle().getText().getFont();
          var tagSize = tagFont.substr(0, 1);
          if (tagSize == 0) {
            tagHideNum = tagHideNum + 1;
          }
        };
        i = i - 1;
      }
      info[0].style.visibility = "visible";
      var countryName = countryFeat.get("STUSPS");  //abbreviation of state name in USA
      var fullName = countryFeat.get("NAME");
      var bolShow = false;
      if (wordFeature) {
        info[0].innerHTML = wordFeature.get("name") + ":" + wordFeature.get("weight");
      } else {
        if (jsonData.length > 0) {
          $.each(jsonData, function (index, field) {
            if (field.country == countryName) {
              //alert(item.country);
              bolShow = true;
              var CData = [];
              var CTagData = [];
              var pro = field.Properties;    //{Culture:{},History:{},Economy:{}}
              for (var top in pro) {
                for (var tag in pro[top]) {
                  if (pro[top][tag] > 0) {
                    CData.push(pro[top][tag]);
                    CTagData.push([tag, pro[top][tag]]);
                  }
                }
              }
              CTagData.sort(descend);
              var infoStr;
              var valueExtent = d3.extent(CData, function (d) { return d; });
              var minCData = valueExtent[0];
              var maxCData = valueExtent[1];
              var aveCData = Math.round(d3.mean(CData));
              if (document.getElementById('baseMap').value == "USA") {
                infoStr = fullName + " (Min:" + minCData + ", Max:" + maxCData + ", Ave:" + aveCData +
                  ")<br><br>  Top 3 tags: " + CTagData[0][0] + "(" + CTagData[0][1] + "), " + CTagData[1][0] + "(" + CTagData[1][1] + "), " + CTagData[2][0] + "(" + CTagData[2][1] + ")";
                if (tagHideNum > 0) {
                  info[0].innerHTML = infoStr + "<br><br>Note: More tags will be shown if you zoom in the map."
                } else {
                  info[0].innerHTML = infoStr;
                }
              } else {
                infoStr = countryName + " (Min: " + minCData + ", Max:" + maxCData + ", Ave:" + aveCData +
                  ")<br><br> Top 3 tags: " + CTagData[0][0] + "(" + CTagData[0][1] + "), " + CTagData[1][0] + "(" + CTagData[1][1] + "), " + CTagData[2][0] + "(" + CTagData[2][1] + ")";
                if (tagHideNum > 0) {
                  info[0].innerHTML = infoStr + "<br><br>Note: More tags will be shown if you zoom in the map."
                } else {
                  info[0].innerHTML = infoStr;
                }
              }
            }
          })
          if (bolShow == false) {
            if (document.getElementById('baseMap').value == "USA") {
              info[0].innerHTML = fullName + "(No data)";
            } else {
              info[0].innerHTML = countryName + "(No data)";
            }
          }
        } else {
          if (document.getElementById('baseMap').value == "USA") {
            info[0].innerHTML = fullName;
          } else {
            info[0].innerHTML = countryName;
          }
        }
      }
    } else {
      info[0].style.visibility = "hidden";
    }
    //var chart=echarts.init(document.getElementById('wordcloud'));
  };

  //#region The functions for mouse on Popup
  function MouseOverTagInPopup() {
    info[0].style.visibility = "visible";
    info[0].innerHTML = $(this).html() + ":" + $(this).css("--Frequency-value");
    var TopicName = $(this).css("--topic-name");
    if (spanCol.length > 0) {
      for (var s = 0; s < spanCol.length; s++) {
        if (spanCol[s][6] != TopicName) {
          $("#" + spanCol[s][5] + spanCol[s][0]).css({
            opacity: 0.2
          });
        }
      }
    }
    var i = CenterPointSource.getFeatures().length;
    while (i > 0) {
      var tagFeat = CenterPointSource.getFeatures()[i - 1];
      var tagFeatCName = tagFeat.get("belongto");
      var tagFeatTName = tagFeat.get("type");     //topic
      //if((CountryName==tagFeatCName) && (TopicName!=tagFeatTName)){
      if (TopicName != tagFeatTName) {
        var wordStyle = tagFeat.getStyle();
        var wordTStyle = wordStyle.getText();
        var wordFill = wordTStyle.getFill();
        var wordColor = wordFill.getColor();
        var wordColorArr = ol.color.asArray(wordColor);
        wordColorArr.splice(3, 1, 0.2);
        wordFill.setColor(wordColorArr);
        wordTStyle.setFill(wordFill);
        wordStyle.setText(wordTStyle);
        tagFeat.setStyle(wordStyle);
        //map.renderSync();
      }
      i = i - 1;
    }
    map.getTargetElement().style.cursor = 'pointer';
  }

  function MouseOutTagInPopup() {
    info[0].style.visibility = "hidden";
    if (spanCol.length > 0) {
      for (var s = 0; s < spanCol.length; s++) {
        $("#" + spanCol[s][5] + spanCol[s][0]).css({
          opacity: 1
        });
      }
    }
    var i = CenterPointSource.getFeatures().length;
    while (i > 0) {
      var tagFeat = CenterPointSource.getFeatures()[i - 1];
      var wordStyle = tagFeat.getStyle();
      var wordTStyle = wordStyle.getText();
      var wordFill = wordTStyle.getFill();
      var wordColor = wordFill.getColor();
      var wordColorArr = ol.color.asArray(wordColor);
      if (wordColorArr[3] != 1) {
        wordColorArr.splice(3, 1, 1);
        wordFill.setColor(wordColorArr);
        wordTStyle.setFill(wordFill);
        wordStyle.setText(wordTStyle);
        tagFeat.setStyle(wordStyle);
        //map.renderSync();
      }
      i = i - 1;
    }
    map.getTargetElement().style.cursor = '';
  }
  //#endregion

  //#region select interaction working on "click"
  var selectClick = new ol.interaction.Select({ layers: [vector] });
  map.addInteraction(selectClick);
  selectedFeats = selectClick.getFeatures();
  //#endregion

  function DoubleClickInPopup() {
    var pID = $(this).attr("id");
    var relFName = $(this).css("--feature-name");
    $("#" + pID).remove();
    for (var p = 0; p < popCol.length; p++) {
      if (popCol[p][1] == relFName) {
        popCol.splice(p, 1);
        break;
      }
    }
    for (i = 0; i < tagFeatNameCol.length; i++) {
      if (relFName == tagFeatNameCol[i]) {
        tagFeatNameCol.splice(i, 1);
        break;
      }
    }
    for (var l = 0; l < DrawLineArr.length; l++) {
      if (DrawLineArr[l][0] == relFName) {
        DrawLineArr.splice(l, 1);
        break;
      }
    }
    selectClick.getFeatures().clear();
    selectedFeats.clear();
    map.renderSync();
    if (tagFeatNameCol.length == 0) {
      $("#LegendTable").empty();
      $("#LegendTable").hide();
      //a=0;
      //b=0;
      DrawTxtColorArr = [];
      DrawTxtSample();
      $("#MaxFontSize").attr("disabled", false);
      $("#MinFontSize").attr("disabled", false);
      $("#SizeCal").attr("disabled", false);
    }
    $("#clearSelected").attr("disabled", true);
    $("#showInPopup").attr("disabled", true);
  }

  //#region The function for mouse of map
  var mouseCoordinate;
  map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var bol = true;
    for (var p = 0; p < popCol.length; p++) {
      var pOverLay = popCol[p][2];
      var pEle = pOverLay.getElement();
      //var pPosition=pOverLay.getPosition();
      //var pPixel=map.getPixelFromCoordinate(pPosition);
      var pPopupRect = pEle.getBoundingClientRect();
      var w = pEle.offsetWidth;
      var h = pEle.offsetHeight;
      //if(pixel[0]>pPixel[0] && pixel[0]<pPixel[0]+w && pixel[1]>pPixel[1] && pixel[1]<pPixel[1]+h){     //It is used to judge whether the mouse move in the popup
      if (pixel[0] > pPopupRect.left && pixel[0] < pPopupRect.right && pixel[1] > pPopupRect.top && pixel[1] < pPopupRect.bottom) {
        bol = false;
        break;
      }
    }
    //mouseCoordinate=map.getEventCoordinate(evt.originalEvent);
    mouseCoordinate = evt.coordinate;
    info.css({
      left: (pixel[0] + 10) + 'px',
      top: (pixel[1] + 15) + 'px'
    });
    //var coordinate = map.getEventCoordinate(evt.originalEvent);    
    if (bol == true) {
      displayFeatureInfo(pixel);
    }
  });

  map.on('moveend', function (evt) {
    for (var p = 0; p < popCol.length; p++) {
      var pOverLay = popCol[p][2];
      map.removeOverlay(pOverLay);    //Sometimes, the Overlay can't be refreshed. So this sentence is added.
      map.addOverlay(pOverLay);

    }
  });

  map.on('singleclick', function (evt) {
    var pixel = map.getEventPixel(evt.originalEvent);
    //var coordinate = map.getEventCoordinate(evt.originalEvent);
    mouseCoordinate = evt.coordinate;
    // var recFeat= map.forEachFeatureAtPixel(pixel, function(feature) {
    //   return feature;
    // },{layerFilter:function(layer){
    //   return layer===SelVectorLayer;
    // }});
    //The following code can be used to show the detail of one tag.
    /*if(recFeat){
      //content.innerHTML = '<p>You clicked here:</p><code>' + hdms +'</code>';      
      //containerTitle.innerHTML=recFeat.get("name");
     containerTitleLabel.innerHTML=recFeat.get("name");
     content.innerHTML ='Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success Success !';
     $("#popup-detail").attr({href:"http://www.google.com",target:"_blank"});
     overlay.setPosition(coordinate);
    } */
  });
  //#endregion

  var lineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(255,0,0,0.9)',
      width: 3
    })
  });
  var vectorContext;

  map.on('postcompose', function (evt) {
    vectorContext = evt.vectorContext;
    vectorContext.setStyle(lineStyle);
    if (DrawLineArr.length > 0) {
      for (var l = 0; l < DrawLineArr.length; l++) {
        var DrawLine = DrawLineArr[l][1];
        vectorContext.drawGeometry(DrawLine);
      }
    }
  });

  //#region ** Select Function
  var data;
  var minWordSize = 0;
  var maxWordSize = 0;
  var qSize;
  // var aveWordSize;
  // var aveWordIndex;
  // var aveWordNum;
  selectedFeats.on("add", function () {
    //$("#Loading").css("visibility","visible");
    /*$("#Loading").show();
    var timer=setInterval(function(){
      if(document.getElementById("Loading").complete){
        WordCloud();
        //$("#Loading").css("visibility","hidden");
        $("#Loading").hide();
        clearInterval(timer);
      }
    },50)*/
    var feat = selectedFeats.item(0);
    if (jsonData.length == 0) {
      alert("Please select a JSON file for tags from your computer first!");
      selectedFeats.remove(feat);
      return;
    }
    if (wordPara.calMethod.value == "Linear") {
      if (a == 0 && b == 0) {
        minWordSize = parseInt(wordPara.minSize.value * arrDPI[1] / 72);
        maxWordSize = parseInt(wordPara.maxSize.value * arrDPI[1] / 72);
        //a=maxWordSize-minWordSize;
        //b=minWordSize;    //The normalization data between[0,1] are represented by the font size between [minWordSize,maxWordSize]
        a = (maxWordSize - minWordSize) / (maxValue - minValue);//字大比例参数
        b = maxWordSize - a * maxValue;//字大偏置参数
      }
    } else {
      minWordSize = parseInt(wordPara.minSize.value * arrDPI[1] / 72);
      maxWordSize = parseInt(wordPara.maxSize.value * arrDPI[1] / 72);
      qSize = Math.pow((minWordSize / maxWordSize), 1 / (QNum - 1));
      //aveWordSize=(maxWordSize-minWordSize)/QNum;
    }
    var oriView = map.getView();
    var oriRes = oriView.getResolution();
    var oriCenter = oriView.getCenter();
    var oriZoom = oriView.getZoom();
    var ItemData = [];
    var cName = feat.get("STUSPS");
    var tagBol = true;
    if (tagFeatNameCol.length > 0) {
      for (var i = 0; i < tagFeatNameCol.length; i++) {
        if (cName == tagFeatNameCol[i]) {
          tagBol = false;
          //selectedFeats.clear();
          break;
        }
      }
    }
    if (tagBol == true) {
      //tagFeatNameCol.push(cName);
      data = [];
      if (jsonData.length > 0) {
        $.each(jsonData, function (index, item) {
          if (item.country == cName) {
            //alert(item.country);
            var pro = item.Properties;    //{Culture:{},History:{},Economy:{}}
            ItemData.push(pro);
            if (tagFeatNameCol.length == 0) {
              $("#LegendTable").empty();
              var LegendHead = $("<th>图例</th>");
              LegendHead.attr("colspan", 2);
              var LegendHeadRow = $("<tr></tr>");
              LegendHeadRow.append(LegendHead);
              $("#LegendTable").append(LegendHeadRow);
              $("#LegendTable").show();
            }
            var pIndex = 0;
            DrawTxtColorArr = [];
            for (var p in pro) {
              var txtColor;
              /*if(p=="Culture"){
                txtColor=txtColorArr[0];
              }else if(p=="History"){
                txtColor=txtColorArr[1];
              }else{
                txtColor=txtColorArr[2];
              } */
              if (tagFeatNameCol.length == 0) {
                if (pIndex < 9) {           //txtColorArr has 9 default colors
                  txtColor = txtColorArr[pIndex];
                } else {
                  txtColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
                }
                var LegendTr = $("<tr></tr>");
                var LegendCell = $("<td></td>");
                var input;
                input = $("<input>", {
                  type: 'text',
                  id: p,
                  width: "60px",
                  value: ""
                });
                LegendCell.append(input);     //It must be placed before input.specturm. Otherwise, input.specturm doesn't work.
                LegendCell.css({
                  //"background-color":txtColor[0],
                  width: "60px"
                });
                //$("#"+String(p)).spectrum({
                DrawTxtColorArr.push(txtColor);
                input.spectrum({
                  color: txtColor,
                  showInput: true,
                  showAlpha: true,
                  preferredFormat: "rgb",
                  change: function (color) {
                    var LegendColor;
                    var rgbStr;
                    var txtColor = [];
                    if (CenterPointSource.getFeatures().length > 0) {
                      for (var c = 0; c < CenterPointSource.getFeatures().length; c++) {
                        var wordFeat = CenterPointSource.getFeatures()[c];
                        LegendColor = $("#" + wordFeat.get('type'));
                        //txtColor=$("#"+data[k][2]).spectrum("get");
                        rgbStr = LegendColor.spectrum("get").toRgbString();
                        rgbStr = rgbStr.slice(4, rgbStr.length - 1);
                        txtColor = rgbStr.split(",");
                        var wordFill = new ol.style.Fill();
                        wordFill.setColor(txtColor);
                        var wordFeatStyle = wordFeat.getStyle();
                        var wordStyle = wordFeatStyle.getText();
                        wordStyle.setFill(wordFill);
                        wordFeat.setStyle(wordFeatStyle);
                      }
                    }
                    if (spanCol.length > 0) {
                      for (var s = 0; s < spanCol.length; s++) {
                        LegendColor = $("#" + spanCol[s][6]);
                        rgbStr = LegendColor.spectrum("get").toRgbString();
                        rgbStr = rgbStr.slice(4, rgbStr.length - 1);
                        txtColor = rgbStr.split(",");
                        $("#" + spanCol[s][5] + spanCol[s][0]).css({
                          color: txtColor
                        });
                      }
                    }
                    var InputChild = $("#LegendTable").find("input");
                    DrawTxtColorArr = [];
                    InputChild.each(function (index, element) {
                      DrawTxtColorArr.push($(this).spectrum("get").toRgbString());
                    });
                    DrawTxtSample();
                  }
                });
                //LegendCell.click(function(){
                //});
                LegendTr.append(LegendCell);
                LegendCell = $("<td></td>", {
                  align: "left"
                });
                LegendCell[0].innerHTML = p;
                LegendTr.append(LegendCell);
                $("#LegendTable").append(LegendTr);
              }
              pIndex++;
              for (var name in ItemData[0][p]) {
                if (ItemData[0][p][name] > 0) {
                  data.push([name, ItemData[0][p][name], p]);
                }
              }
            }
            data.sort(descend);
          }
        })
      } else {
        selectedFeats.remove(feat);
        alert("No Data!");
        return;
      }
      if (data.length > 0) {
        var polygon = feat.getGeometry();
        //var oriExt=oriView.calculateExtent();
        //var oriPolygon=new ol.geom.Polygon([[[oriExt[0],oriExt[1]], [oriExt[2], oriExt[1]],[oriExt[2],oriExt[2]], [oriExt[0],oriExt[2]],[oriExt[0],oriExt[1]]]]);
        view.fit(polygon, { constrainResolution: false });
        tagFeatNameCol.push(cName);
        var loadingLayer = CreatLoadingLayer(feat);
        map.addLayer(loadingLayer);
        setTimeout(function () {  //it is used to show "loading……".
          //WordCloud();
          //scaleWordCloud_Random();//随机采样点
          scaleWordCloud_Re();//均匀采样点
          //VirtualTags();
          //VirtualTags_2();
          //console.log(view.getResolution()+","+view.getCenter());
          DrawTxtSample();
          map.removeLayer(loadingLayer);
          // view.setResolution(oriRes);
          // view.setCenter(oriCenter);
          // view.setZoom(oriZoom);
          map.renderSync();
          //console.log(view.getResolution()+","+view.getCenter());
          selectedFeats.remove(feat);
          $("#clearSelected").attr("disabled", true);
          $("#showInPopup").attr("disabled", true);
          $("#MaxFontSize").attr("disabled", true);
          $("#MinFontSize").attr("disabled", true);
          $("#SizeCal").attr("disabled", true);
        }, 5);
        //map.renderSync();
        /*$("#Loading").show("fast",function(){
          WordCloud();
        })*/
      } else {
        selectedFeats.remove(feat);
        alert("No Data!");
      }
    } else {
      if (wordFeature) {
        selectedFeats.remove(feat);
      }
    }
    if (selectedFeats.getLength() > 0) {
      $("#clearSelected").attr("disabled", false);
      $("#showInPopup").attr("disabled", false);
      $("#clearMap").attr("disabled", false);
      $("#clearAll").attr("disabled", false);
    } else {
      $("#clearSelected").attr("disabled", true);
      $("#showInPopup").attr("disabled", true);
      $("#clearMap").attr("disabled", true);
      $("#clearAll").attr("disabled", true);
    }
    if (wordPara.calMethod.value == "Linear") {
      if (a == 0 && b == 0) {
        $("#MaxFontSize").attr("disabled", false);
        $("#MinFontSize").attr("disabled", false);
        $("#SizeCal").attr("disabled", false);
      } else {
        $("#MaxFontSize").attr("disabled", true);
        $("#MinFontSize").attr("disabled", true);
        $("#SizeCal").attr("disabled", true);
      }
    }
    //$("#Loading").hide();
  });
  //#endregion

  /*var data = [];
  for (var name in keywords) {
      data.push([name,keywords[name]]);
  }*/

  function descend(x, y) {
    return y[1] - x[1];
  }


  //data.sort(descend);
  var oriResolution;
  //var ratioSize=(data[0][1]-data[data.length-1][1])/(maxWordSize-minWordSize);  //The maximum size of word is 100 and the minimum size is 6.
  //var ratioResolution=((maxWordSize*oriResolution/minWordSize)-oriResolution)/(maxWordSize-minWordSize);

  //#region  Main function for WordCloud
  function WordCloud() {
    //zoomFlag=false;
    //TriLayer.setVisible(true);
    //RecLayer.setVisible(true);
    var cTime = new Date(); //时间记录器
    var cTime1 = cTime.getTime();
    var boolShowAll = true;

    let PolygonArea=0;let TextArea=0;
    let oriCount=0;
    CenterPointLayer.setVisible(true); //An layer for open layer and set visible
    //txtContext.stroke();    
    ViewResolution = map.getView().getResolution(); //Get resolution
    if (ViewResolution < 192000) {     //wordPara.maxreso.value){-----------control the visual scale 
      if (selectedFeats.getLength() > 0) {

        //#region 构建选中要素的三角网       
        var format = new ol.format.GeoJSON();
        var feat = selectedFeats.item(0);//获取选中的要素(第一个，也就是Polygon)
        /*feat.setStyle(new ol.style.Style({            
            stroke: new ol.style.Stroke({
              color: 'rgba(11,157,255,1)',
              width: 3
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,255,255,0)'
            })
        }));*/
        var tFeat = format.writeFeatureObject(feat);
        // var tExplodeFeatCol=turf.explode(tFeat);    //point collection
        // tExplodeFeatCol.features.splice(tExplodeFeatCol.features.length-1,1);
        var tExplodePointArr = [];
        var tFeatCoords = turf.getCoords(tFeat);
        var tFeatType = turf.getType(tFeat);
        if (tFeatType == "Polygon") {       //the type of world map data is polygon,but usa map is multiPolygon.
          tFeat = turf.multiPolygon([tFeatCoords])
          tFeatCoords = turf.getCoords(tFeat);
        }
        var subPolygon;
        for (var CIndex = 0; CIndex < tFeatCoords.length; CIndex++) {
          var subCoords = tFeatCoords[CIndex];
          subPolygon = turf.polygon(subCoords);
          var subPoints = turf.explode(subPolygon);
          subPoints.features.splice(subPoints.features.length - 1, 1);
          tExplodePointArr[CIndex] = subPoints;
        }

        //var oriFeat=tFeat;
        var t_selectFeature = tFeat;
        var triangles = turf.tesselate(tFeat);
        var triArr = [];
        var curArea;
        turf.featureEach(triangles, function (currentFeature, featureIndex) {
          //var curArea1=turf.area(curFeature);   //It can't get the real area by using this method.
          curArea = format.readFeature(currentFeature).getGeometry().getArea();
          triArr.push([currentFeature, curArea]);
          console.log(curArea);

          //let CachePolygonArea=turf.area(currentFeature);//计算区域多边形的面积
          //console.log(CachePolygonArea);
          PolygonArea=PolygonArea+curArea;
        });
        //#endregion

        triArr.sort(descend);//三角形按照属性排序     

        //#region 计算每个Name的Word size，依据属性计算 Data[0][1]=属性
        var txtExArr = [];
        var txtExPointArr = [];      //explode the extent of word to pointcollection
        var cpointFeat;
        //if(a==0 && b==0){
        if (tagFeatNameCol.length == 1) {
          oriResolution = ViewResolution;
          //textSize=wordPara.maxSize.value;
        }//else{
        //textSize=Math.round(a*data[0][1]+b);
        if (wordPara.calMethod.value == "Linear") {
          //textSize=Math.round(a*(data[0][1]-minValue)/valueGap+b);
          textSize = Math.round(a * data[0][1] + b);//计算每个Text的字大 data[0][1]可能是Weigth最大的值
          textSize = Math.round(textSize * oriResolution / ViewResolution);
        } else {
          // nIndex=Math.trunc((data[0][1]-minValue)/aveGap);
          // textSize=minWordSize+nIndex*aveWordSize;
          // textSize=Math.round(textSize*oriResolution/ViewResolution);
          for (var nIndex in NumData) {
            if (feat.get("STUSPS") == NumData[nIndex][2] && data[0][1] == NumData[nIndex][1] && data[0][0] == NumData[nIndex][0]) {
              var qNum = Math.ceil(nIndex / aveNum);
              textSize = maxWordSize * Math.pow(qSize, qNum - 1);
              break;
            }
          }
        }
        //#endregion

        //这里的k作用域并非for循环，是整个函数；ES6解决办法：let
        //Tag计算的主函数 循环计算每一个Tag
        for (var k = 0; k < data.length; k++) {
          //for(var k=0;k<5;k++){

          //#region 获取dataName(按照6/8/10/正常字符进行截取) Data[0][0]=Name
          text = data[k][0];
          if (wordPara.text.value == "shorten6") {
            text = text.trunc(6);
          }
          else if (wordPara.text.value == "shorten8") {
            text = text.trunc(8);
          }
          else if (wordPara.text.value == "shorten10") {
            text = text.trunc(10);
          }
          //#endregion

          //#region 确定Tags的内容
          //var maxId=0;
          var ol_cpointFeat, center, pixelCenter;
          //var rAngle;
          if (bolCheck == false) {
            alert("Please select the orientention of tags!");
            for (var t = 0; t < tagFeatNameCol.length; t++) {
              if (feat.get("STUSPS") == tagFeatNameCol[t]) {
                tagFeatNameCol.splice(t, 1);
                break;
              }
            }
            return;
          }
          //#endregion

          /*var radioGroup=document.getElementsByName("radioDir");
          for (var r=0; r<radioGroup.length; r++) {
            if (radioGroup[r].checked) {
              rAngle=radioGroup[r].value;
            }
          }*/

          var wordFont = wordPara.font.value;//字体
          var wordWeight = wordPara.bold.value;//是否加粗
          //var AngNum =Math.ceil(Math.PI/(2*rAngle));
          var recAngle;
          //var flag=false;
          var ol_wordFeature, ol_wordFeature1, ol_wordFeature2;
          var t_wordExtent;
          var bol = false;//Tag放置在三角网中的可行标识，false=不行；true=行
          var bolBreakFor = false;
          var sizeControl = 0;

          //#region 单个注记计算的Main function
          //循环计算并更新textSize，直至其小于minWordSize为止
          //Tag计算的思路：1. 依据TextSize取第一个Tag放置；2.若能放置，取下一个Tag，并依据当前的TextSize继续放置；3.若不能放置，TextSize-1________并非严格的线性关系
          while (textSize >= minWordSize) {
            for (var i = 0; i < 9; i++) {   //9 potential orientations of tags
              if (typeof (angleArr[i]) != "undefined") { //依次判断选择的方向上Tag是否可放置在对应的三角形中
                recAngle = angleArr[i];
                for (var triId = 0; triId < triArr.length; triId++) {
                  cpointFeat = turf.centroid(triArr[triId][0]);
                  ol_cpointFeat = format.readFeature(cpointFeat);//三角网的重心
                  center = ol.extent.getCenter(ol_cpointFeat.getGeometry().getExtent());
                  pixelCenter = map.getPixelFromCoordinate(center);
                  ol_wordFeature1 = GetWordExtent(text, textSize, wordFont, wordWeight, pixelCenter);//计算Text的Extend
                  ol_wordFeature1.getGeometry().rotate(-recAngle, center);//旋转
                  t_wordExtent = format.writeFeatureObject(ol_wordFeature1);
                  bol = BoolInBlank(t_wordExtent, t_selectFeature, txtExArr);//判断Text是否能放置在三角网中
                  if (bol == true) {        //the word doesn't intersect the exist words and is contained by the selected feature.                    
                    ol_wordFeature1.setProperties({ 'name': data[k][0], 'belongto': feat.get("STUSPS"), 'weight': data[k][1], 'type': data[k][2] });
                    RecSource.addFeature(ol_wordFeature1);//在RecFeature中添加一个WordFeautre 包含name/feature/weight
                    txtExPointArr = turf.explode(t_wordExtent).features;
                    //tFeat=turf.difference(tFeat,t_wordExtent);      //if polygon contains too many holes, it can't work.
                    rotateAangle = recAngle;

                    if(rotateAangle==0)
                    {
                      oriCount=oriCount+1;
                    }

                    //var geometry = ol_wordFeature1.getGeometry(); // 获取要素的几何形状 
                    //var coordinates = geometry.getCoordinates(); // 获取多边形的坐标  
                    //var polygon = turf.polygon(coordinates);  
                    //var CacheArea = turf.area(polygon); 
                    let CacheArea = ol_wordFeature1.getGeometry().getArea();
                    TextArea=TextArea+CacheArea; 

                    break;
                  }
                }
                if (bol == true) {
                  break;
                }
              }
            }

            //#region 当前TextSize下没有满足要求的Tag时
            if (bol == true) {
              break;
            } else {
              //sizeControl用于控制
              if (sizeControl > sizeGap) {        //The gap between calculation font size and the last font size is less than 10px.
                if (k <= 10) {    //If the number of tags is less than 10, we show all the tags in the popup._20180531——当显示的注记数小于10时，用一个popup来显示
                  bolBreakFor = true;
                  var cl = CenterPointSource.getFeatures().length;
                  while (cl > 0) {
                    var tagFeat = CenterPointSource.getFeatures()[cl - 1];
                    var tagRecFeat = RecSource.getFeatures()[cl - 1];
                    var CountryName = tagFeat.get("belongto");
                    if (CountryName == feat.get("STUSPS")) {
                      CenterPointSource.removeFeature(tagFeat);
                    }
                    CountryName = tagRecFeat.get("belongto");
                    if (CountryName == feat.get("STUSPS")) {
                      RecSource.removeFeature(tagRecFeat);
                    }
                    cl = cl - 1;
                  }
                }
                break;
              }
              textSize = textSize - 1;//每次Size减1？似乎没有考虑和Weigth相关
              if (k == 0) {
                if (tagFeatNameCol.length > 1) {
                  //if(a!=0 || b!=0){       //The first tag can't be placed. So it is only placed in popup.
                  bolBreakFor = true;
                  break;
                  //}
                }
              } else {
                sizeControl = sizeControl + 1;
              }
            }
            //#endregion
          }
          //#endregion

          //popup is shown and tagclouds are shown in a dialog window
          //这里表示的是若区域无法放置对应的Tag，则弹出一个对话框显示相应的Tags
          if (bolBreakFor == true) {
            var divTag = $("<div></div>");
            var divSubTag = $("<div></div>");
            var idTxt = feat.get("STUSPS");
            var newIDTxt = idTxt.replace(/\s+/g, "");
            divTag.attr("id", newIDTxt);
            //divTag.addClass('divTagCls');
            divTag.css({
              position: 'relative',
              height: 300 + "px",
              width: 300 + "px",
              'background-color': "rgba(255,255,255,1)",
              //overflow:"scroll",
              'border-style': "solid",
              'border-color': "#F5F5F5",
              'border-width': 2 + "px",
              '--feature-name': idTxt
              //'vertical-align':"text-bottom",
              //"display":"inline-block",
            });
            divSubTag.css({
              overflow: "scroll",
              height: divTag.width(),
              width: divTag.height()
            });
            /*var divA=$("<a></a>");
            divA.attr("id",idTxt+"-a");
            divA.attr("href","#");              
            divA.css({
              //"text-decoration": "none",
              height:"30px",
              width:"30px",
              background: "#DCDCDC",
              position: "absolute",
              top: "8px",
              right: 8+"px",
            });
            $("#"+idTxt+"-a").append("<style>'#'+idTxt+'-a':after{content:'✖'}</style>") ;
            divTag.append(divA);     */
            for (DIndex = 0; DIndex < data.length; DIndex++) {
              if (wordPara.calMethod.value == "Linear") {
                textSize = Math.round(a * data[DIndex][1] + b);
                //textSize = Math.round(a * (data[DIndex][1] - minValue) / valueGap + b);
                textSize = Math.round(textSize * oriResolution / ViewResolution);
              } else {
                // var nIndex=Math.trunc((data[DIndex][1]-minValue)/aveGap);
                // textSize=minWordSize+nIndex*aveWordSize;
                // textSize = Math.round(textSize * oriResolution / ViewResolution);
                for (var nIndex in NumData) {
                  if (feat.get("STUSPS") == NumData[nIndex][2] && data[DIndex][1] == NumData[nIndex][1] && data[DIndex][0] == NumData[nIndex][0]) {
                    qNum = Math.ceil(nIndex / aveNum);
                    textSize = maxWordSize * Math.pow(qSize, qNum - 1);
                    break;
                  }
                }
              }
              var txtSpanColor = [];
              /*if(data[DIndex][2]=="Culture"){
                txtSpanColor.push(79,129,189);
              }else if(data[DIndex][2]=="History"){
                txtSpanColor.push(237,125,49);
              }else{
                txtSpanColor.push(128,100,162);
              }*/
              var LegendColor = $("#" + data[DIndex][2]);
              var rgbStr = LegendColor.spectrum("get").toRgbString();
              rgbStr = rgbStr.slice(4, rgbStr.length - 1);
              txtSpanColor = rgbStr.split(",");

              var bolWeight = "normal";
              if (wordWeight == "True") {
                bolWeight = "bold";
              }
              var divSpan = $("<span></span>");
              divSpan.attr("id", newIDTxt + DIndex);
              divSpan.css({
                //position:'absolute',
                //display:"inline-block",
                'vertical-align': "bottom",
                //float:"left",
                padding: 5 + "px",
                color: txtSpanColor,
                "font-weight": bolWeight,
                "font-family": wordFont,
                "font-size": textSize,
                "--topic-name": data[DIndex][2],
                "--Frequency-value": data[DIndex][1].toString(),
                //border:2+"px solid #00f",
              });
              if (textSize >= minWordSize) {
                divSpan.css({
                  display: "inline-block",
                });
              } else {
                divSpan.css({
                  display: "none",
                });
              }
              divSpan.html(data[DIndex][0]);
              divSpan.mouseover(MouseOverTagInPopup);
              divSpan.mouseout(MouseOutTagInPopup);
              divSubTag.append(divSpan);
              spanCol.push([DIndex, idTxt, textSize, ViewResolution, data[DIndex][0], newIDTxt, data[DIndex][2]]);
              console.log(DIndex + "." + data[DIndex][0] + ":" + data[DIndex][1] + "-" + textSize);
            }
            divTag.append(divSubTag);
            var TSelectCenter = turf.centroid(tFeat);
            var ol_TSelectCenter = format.readFeature(TSelectCenter);
            var ol_TSelPoint = ol.extent.getCenter(ol_TSelectCenter.getGeometry().getExtent());
            var DrawLine;
            $("body").append(divTag);
            divTag.draggable({
              //refreshPositions:true,
              stop: function () {
                for (var l = 0; l < DrawLineArr.length; l++) {
                  if (DrawLineArr[l][0] == idTxt) {
                    DrawLine.setCoordinates([ol_TSelPoint, mouseCoordinate]);
                    DrawLineArr.splice(l, 1, [idTxt, DrawLine]);
                    break;
                  }
                }
                //console.log(DrawLine.getLength());
                map.renderSync();
              }
            });
            divTag.resizable();
            divTag.resize(function () {
              divSubTag.width(divTag.width());
              divSubTag.height(divTag.height());
            });
            divTag.dblclick(DoubleClickInPopup);
            var popup = new ol.Overlay({
              position: ol_TSelPoint,
              autoPan: true,
              autoPanAnimation: {
                duration: 250
              },
              element: document.getElementById(newIDTxt)
            });
            map.addOverlay(popup);
            popCol.push([newIDTxt, idTxt, popup, tFeat]);
            DrawLine = new ol.geom.LineString([ol_TSelPoint, ol_TSelPoint]);
            DrawLineArr.push([idTxt, DrawLine]);
            //console.log(DrawLine.getLength());
            map.renderSync();
            break;      //break for;
          }

          //表示正常Tag条件下的显示和放置
          if (bol == true) {
            var txtColor;
            /*var r=Math.floor(Math.random()*256);
            var g=Math.floor(Math.random()*256);
            var b=Math.floor(Math.random()*256);
            txtColor.push(r,g,b);*/
            /*var cr=parseInt(Math.random()*txtColorArr.length,10);
            var rgbStr=txtColorArr[cr];    //get rgb(,,,)
            rgbStr=rgbStr.slice(4,rgbStr.length-1);
            var txtColor=new Array();
            txtColor=rgbStr.split(",");*/
            /*if(data[k][2]=="Culture"){
              txtColor.push(27,158,119);
            }else if(data[k][2]=="History"){
              txtColor.push(217,95,2);
            }else{
              txtColor.push(117,112,179);
            }*/
            LegendColor = $("#" + data[k][2]);
            //console.log(data);
            //console.log(LegendColor);
            //txtColor=$("#"+data[k][2]).spectrum("get");
            try {
              txtColor = LegendColor.spectrum("get").toRgbString();
            }
            catch
            {
              var random = parseInt(Math.random() * Math.pow(32, 4));
              txtColor = ('00000' + random.toString(16)).substr(-4);
            }
            //console.log(txtColor);
            var wordStyle;
            if (wordWeight == "True") {
              wordStyle = 'Bold ' + Math.round(textSize) + "px " + wordFont;
            } else {
              wordStyle = Math.round(textSize) + "px " + wordFont;
            }
            /*txtSize=Math.round(textSize*oriResolution/ViewResolution);    //users may click polygons under different scale,03/08/2018
            var wordStyle2;
            if(wordWeight=="True"){
              wordStyle2='Bold ' + Math.round(textSize) + "px "+wordFont;
            }else{
              wordStyle2=Math.round(textSize) + "px "+wordFont;
            }*/
            var strokeStyle;
            if (wordPara.outlineWidth.value > 0) {
              strokeStyle = new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value });
            } else {
              strokeStyle = null;
            }

            //#region Tag/三角形重心的渲染+对应Tag的渲染
            ol_cpointFeat.setStyle(new ol.style.Style({
              image: new ol.style.Circle({
                radius: 0,
                fill: new ol.style.Fill({ color: 'rgba(0, 0, 255,1)' }),
                //stroke: new ol.style.Stroke({color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value})
              }),
              text: new ol.style.Text({
                textAlign: "center",//align == '' ? undefined : align,
                textBaseline: "middle",
                font: wordStyle,
                text: text,
                fill: new ol.style.Fill({ color: txtColor }), //"#aa3300"}),
                stroke: new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value }),
                //offsetX: offsetX,
                //offsetY: offsetY,
                //placement: placement,
                //maxAngle: maxAngle,
                //exceedLength: exceedLength,
                rotation: rotateAangle
              })
            }));
            //#endregion

            //设置PointFeature的属性，即对应的Tags
            ol_cpointFeat.setProperties({ 'name': data[k][0], 'font': wordStyle, 'resolution': ViewResolution, 'belongto': feat.get("STUSPS"), 'weight': data[k][1], 'type': data[k][2], 'tag': data[k][0], "tagNum": k });         //20171108
            CenterPointSource.addFeature(ol_cpointFeat);
            console.log(k + "." + text + ":" + data[k][1] + "-" + textSize + "," + rotateAangle);
            //oriFeat=tFeat;
            //triangles = turf.tesselate(tFeat);
            TriSource.clear();
            for (i = 0; i < triArr.length; i++) {
              var ol_triFeat = format.readFeature(triArr[i][0]);
              TriSource.addFeature(ol_triFeat);
            }
            txtExArr.push(t_wordExtent);

            for (CIndex = 0; CIndex < tFeatCoords.length; CIndex++) {
              subCoords = tFeatCoords[CIndex];
              subPolygon = turf.polygon(subCoords);
              var tagInPolygon = turf.booleanContains(subPolygon, t_wordExtent);
              if (tagInPolygon == true) {
                for (var triIndex = 0; triIndex < triArr.length; triIndex++) {
                  var curTri = triArr[triIndex][0];
                  var triInPolygon = turf.booleanContains(subPolygon, curTri);
                  if (triInPolygon == true) {
                    triArr.splice(triIndex, 1);
                    triIndex--;
                  }
                }
                for (i = 0; i < txtExPointArr.length - 1; i++) {
                  txtExPointArr[i].properties.z = 0;
                  tExplodePointArr[CIndex].features.push(txtExPointArr[i]);
                }
                cpointFeat.properties.z = 0;
                tExplodePointArr[CIndex].features.push(cpointFeat);
                var subTIN = turf.tin(tExplodePointArr[CIndex], 'z');
                turf.featureEach(subTIN, function (currentFeature, featureIndex) {
                  var cenTri = turf.centroid(currentFeature);
                  var triBool1 = turf.booleanPointInPolygon(cenTri, subPolygon);
                  var triBool2 = turf.booleanContains(subPolygon, currentFeature);
                  if (triBool1 == true && triBool2 == true) {
                    curArea = format.readFeature(currentFeature).getGeometry().getArea();
                    triArr.push([currentFeature, curArea]);
                  }
                });
                break;
              }
            }
            triArr.sort(descend);
            //console.log(wordPara.outlineColor.value);
            //CenterPointLayer.setStyle(pointStyleFunction);  
          }
          else {
            if (k == 0) {
              boolShowAll = false;
              alert("All the tags are smaller than the minimum font size!");
              for (var t = 0; t < tagFeatNameCol.length; t++) {
                if (feat.get("STUSPS") == tagFeatNameCol[t]) {
                  tagFeatNameCol.splice(t, 1);
                  break;
                }
              }
            }
            break;
          }

          // textSize<minWordSize
          if (textSize < minWordSize) {
            if (k <= 10) {
              ShowInPopup();
            }
            break;
          }

          // k<data.length-1
          if (k < data.length - 1) {
            //var tSize=Math.round(a*data[k+1][1]+b);
            var tSize;
            if (wordPara.calMethod.value == "Linear") {
              tSize = Math.round(a * data[k + 1][1] + b);
              //tSize = Math.round(a * (data[k + 1][1] - minValue) / valueGap + b);
              tSize = Math.round(tSize * oriResolution / ViewResolution);
              //textSize=Math.round(a*data[k+1][1]+b);      //y=ax+b;
            }
            else {
              // nIndex=Math.trunc((data[k + 1][1]-minValue)/aveGap);
              // tSize=minWordSize+nIndex*aveWordSize;
              // tSize = Math.round(tSize * oriResolution / ViewResolution);
              for (var nIndex in NumData) {
                if (feat.get("STUSPS") == NumData[nIndex][2] && data[k + 1][1] == NumData[nIndex][1] && data[k + 1][0] == NumData[nIndex][0]) {
                  qNum = Math.ceil(nIndex / aveNum);
                  tSize = maxWordSize * Math.pow(qSize, qNum - 1);
                  break;
                }
              }
            }

            //#region tSize<=textSize         
            if (tSize <= textSize) {
              textSize = tSize;
            }
            //#endregion   

          }

          //val = progressbar.progressbar("value");         

        }
      }
      //map.render();
    }

    //#region 主函数外的异常处理
    else {
      TriSource.clear();
      RecSource.clear();
      CenterPointSource.clear();
    }
    //#endregion

    //#region 时间显示
    cTime = new Date();
    var cTime2 = cTime.getTime();
    //console.log("Calculate time:"+ (cTime2-cTime1)/1000);
    if (boolShowAll == true) {
      alert("Complete! Total time:" + (cTime2 - cTime1) / 1000 + "s");
    }

    //$("#Loading").hide();
    //#endregion

    //#region 计算自相关系数
    let CachePoints = []
    let CacheValues = []
    for (let cacheI = 0; cacheI < CenterPointSource.getFeatures().length; cacheI++) {
      let cacheWordFeat = CenterPointSource.getFeatures()[cacheI];
      let cacheWordFont = cacheWordFeat.get('font');
      let cacheSizeIndex = cacheWordFont.indexOf("px");
      let subSize = parseFloat(cacheWordFont.substr(0, cacheSizeIndex));//需要用parseFloat将text转化为数字
      CachePoints.push(turf.point(cacheWordFeat.getGeometry().getCoordinates()));
      CacheValues.push(subSize);
    }
    //console.log(CachePoints);
    //console.log(CacheValues);
    thisValue = getTagEv(CachePoints, CacheValues);//计算自相关系数
    console.log(thisValue);
    //#endregion

    //计算Compactness
    console.log(TextArea);console.log(PolygonArea);
    console.log(TextArea/PolygonArea);
    console.log(oriCount);
  }
  //#endregion

  //#region  Main function for scaleWordCloud
  //随机采样
  function scaleWordCloud_Random() {
    //zoomFlag=false;
    //TriLayer.setVisible(true);
    //RecLayer.setVisible(true);
    var samplePoints = samplePoint(40);
    var sampleValues = new Array(40).fill(0.1);

    console.log('location')
    console.log(samplePoints);

    var cTime = new Date(); //时间记录器
    var cTime1 = cTime.getTime();
    var boolShowAll = true;
    let PolygonArea=0;let TextArea=0;

    CenterPointLayer.setVisible(true); //An layer for open layer and set visible
    //txtContext.stroke();    
    ViewResolution = map.getView().getResolution(); //Get resolution
    if (ViewResolution < 192000) {     //wordPara.maxreso.value){-----------control the visual scale 
      if (selectedFeats.getLength() > 0) {

        //#region 构建选中要素的三角网       
        var format = new ol.format.GeoJSON();
        var feat = selectedFeats.item(0);//获取选中的要素(第一个，也就是Polygon)
        /*feat.setStyle(new ol.style.Style({            
            stroke: new ol.style.Stroke({
              color: 'rgba(11,157,255,1)',
              width: 3
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,255,255,0)'
            })
        }));*/
        var tFeat = format.writeFeatureObject(feat);
        // var tExplodeFeatCol=turf.explode(tFeat);    //point collection
        // tExplodeFeatCol.features.splice(tExplodeFeatCol.features.length-1,1);
        var tExplodePointArr = [];
        var tFeatCoords = turf.getCoords(tFeat);
        var tFeatType = turf.getType(tFeat);
        if (tFeatType == "Polygon") {       //the type of world map data is polygon,but usa map is multiPolygon.
          tFeat = turf.multiPolygon([tFeatCoords])
          tFeatCoords = turf.getCoords(tFeat);
        }
        var subPolygon;
        for (var CIndex = 0; CIndex < tFeatCoords.length; CIndex++) {
          var subCoords = tFeatCoords[CIndex];
          subPolygon = turf.polygon(subCoords);
          var subPoints = turf.explode(subPolygon);
          subPoints.features.splice(subPoints.features.length - 1, 1);
          tExplodePointArr[CIndex] = subPoints;
        }

        //var oriFeat=tFeat;
        var t_selectFeature = tFeat;
        var triangles = turf.tesselate(tFeat);
        var triArr = [];
        var curArea;
        turf.featureEach(triangles, function (currentFeature, featureIndex) {
          //var curArea1=turf.area(curFeature);   //It can't get the real area by using this method.
          curArea = format.readFeature(currentFeature).getGeometry().getArea();
          triArr.push([currentFeature, curArea]);

          PolygonArea=PolygonArea+curArea;
        });
        //#endregion

        triArr.sort(descend);//三角形按照属性排序     

        //#region 计算每个Name的Word size，依据属性计算 Data[0][1]=属性
        var txtExArr = [];
        var txtExPointArr = [];      //explode the extent of word to pointcollection
        var cpointFeat;
        //if(a==0 && b==0){
        if (tagFeatNameCol.length == 1) {
          oriResolution = ViewResolution;
          //textSize=wordPara.maxSize.value;
        }//else{
        //textSize=Math.round(a*data[0][1]+b);
        if (wordPara.calMethod.value == "Linear") {
          //textSize=Math.round(a*(data[0][1]-minValue)/valueGap+b);
          textSize = Math.round(a * data[0][1] + b);//计算每个Text的字大 data[0][1]可能是Weigth最大的值
          textSize = Math.round(textSize * oriResolution / ViewResolution);
        } else {
          // nIndex=Math.trunc((data[0][1]-minValue)/aveGap);
          // textSize=minWordSize+nIndex*aveWordSize;
          // textSize=Math.round(textSize*oriResolution/ViewResolution);
          for (var nIndex in NumData) {
            if (feat.get("STUSPS") == NumData[nIndex][2] && data[0][1] == NumData[nIndex][1] && data[0][0] == NumData[nIndex][0]) {
              var qNum = Math.ceil(nIndex / aveNum);
              textSize = maxWordSize * Math.pow(qSize, qNum - 1);
              break;
            }
          }
        }
        //#endregion

        //这里的k作用域并非for循环，是整个函数；ES6解决办法：let
        //Tag计算的主函数 循环计算每一个Tag
        for (var k = 0; k < data.length; k++) {
          //for(var k=0;k<5;k++){

          //#region 获取dataName(按照6/8/10/正常字符进行截取) Data[0][0]=Name
          text = data[k][0];
          if (wordPara.text.value == "shorten6") {
            text = text.trunc(6);
          }
          else if (wordPara.text.value == "shorten8") {
            text = text.trunc(8);
          }
          else if (wordPara.text.value == "shorten10") {
            text = text.trunc(10);
          }
          //#endregion

          //#region 确定Tags的内容
          //var maxId=0;
          var ol_cpointFeat, center, pixelCenter;
          //var rAngle;
          if (bolCheck == false) {
            alert("Please select the orientention of tags!");
            for (var t = 0; t < tagFeatNameCol.length; t++) {
              if (feat.get("STUSPS") == tagFeatNameCol[t]) {
                tagFeatNameCol.splice(t, 1);
                break;
              }
            }
            return;
          }
          //#endregion

          /*var radioGroup=document.getElementsByName("radioDir");
          for (var r=0; r<radioGroup.length; r++) {
            if (radioGroup[r].checked) {
              rAngle=radioGroup[r].value;
            }
          }*/

          var wordFont = wordPara.font.value;//字体
          var wordWeight = wordPara.bold.value;//是否加粗
          //var AngNum =Math.ceil(Math.PI/(2*rAngle));
          var recAngle;
          //var flag=false;
          var ol_wordFeature, ol_wordFeature1, ol_wordFeature2;
          var t_wordExtent;
          var bol = false;//Tag放置在三角网中的可行标识，false=不行；true=行
          let CacheSat = false;//表示存在三角形能满足条件
          var bolBreakFor = false;
          var sizeControl = 0;

          //#region 单个注记计算的Main function
          //循环计算并更新textSize，直至其小于minWordSize为止
          //Tag计算的思路：1. 依据TextSize取第一个Tag放置；2.若能放置，取下一个Tag，并依据当前的TextSize继续放置；3.若不能放置，TextSize-1________并非严格的线性关系
          while (textSize >= minWordSize) {

            let ol_wordFeatureList = [];
            let cpointFeatList = [];
            let AngleList = [];

            //#region 获取满足条件的n个位置 
            for (var i = 0; i < 9; i++) {   //9 potential orientations of tags
              if (typeof (angleArr[i]) != "undefined") { //依次判断选择的方向上Tag是否可放置在对应的三角形中
                recAngle = angleArr[i];

                let StopIndex = 200; let IndexCount = 0;//提升效率
                for (let triId = 0; triId < triArr.length; triId++) {
                  if (IndexCount >= StopIndex) //提升效率
                  {
                    break;
                  }

                  cache_cpointFeat = turf.centroid(triArr[triId][0]);
                  let cache_ol_cpointFeat = format.readFeature(cache_cpointFeat);//三角网的重心
                  center = ol.extent.getCenter(cache_ol_cpointFeat.getGeometry().getExtent());
                  pixelCenter = map.getPixelFromCoordinate(center);
                  let cache_ol_wordFeature1 = GetWordExtent(text, textSize, wordFont, wordWeight, pixelCenter);//计算Text的Extend
                  cache_ol_wordFeature1.getGeometry().rotate(-recAngle, center);//旋转
                  let cache_t_wordExtent = format.writeFeatureObject(cache_ol_wordFeature1);
                  bol = BoolInBlank(cache_t_wordExtent, t_selectFeature, txtExArr);//判断Text是否能放置在三角网中

                  if (bol == true) {
                    /*
                    if (ol_wordFeatureList.length == 0)//提升效率
                    {
                      StopIndex = 20;
                      IndexCount = 0;
                    }
                    */

                    CacheSat = true;
                    ol_wordFeatureList.push(cache_ol_wordFeature1);
                    cpointFeatList.push(cache_cpointFeat);
                    AngleList.push(recAngle);
                  }
                }
              }
            }
            //#endregion

            //#region 计算自相关系数获取自相关系数最大的目标
            if (ol_wordFeatureList.length > 0) {
              //#region 删除不好的candidate
              FilterCandidate(ol_wordFeatureList, cpointFeatList, AngleList,CenterPointSource);
              //#endregion

              //遍历计算相关系数最大目标
              let maxValue = -100000;
              let CacheRAngle = 0;
              for (let cacheJ = 0; cacheJ < ol_wordFeatureList.length; cacheJ++) {
                //#region 获取现有的Points和对应的Values
                let CachePoints = []
                let CacheValues = []
                for (let cacheI = 0; cacheI < CenterPointSource.getFeatures().length; cacheI++) {
                  let cacheWordFeat = CenterPointSource.getFeatures()[cacheI];
                  let cacheWordFont = cacheWordFeat.get('font');
                  let cacheSizeIndex = cacheWordFont.indexOf("px");
                  let subSize = parseFloat(cacheWordFont.substr(0, cacheSizeIndex));//文本需要转化为Float类型
                  CachePoints.push(turf.point(cacheWordFeat.getGeometry().getCoordinates()));
                  CacheValues.push(subSize);
                }
                //console.log(samplePoints);
                for (let PointI = 0; PointI < samplePoints.length; PointI++) {
                  CachePoints.push(samplePoints[PointI]);
                }
                for (let ValueI = 0; ValueI < sampleValues.length; ValueI++) {
                  CacheValues.push(sampleValues[ValueI]);
                }

                //console.log(cpointFeatList[cacheJ]);
                CachePoints.push(turf.point(cpointFeatList[cacheJ].geometry.coordinates));
                CacheValues.push(parseFloat(textSize));//文本转Float类型

                //console.log(CachePoints);

                thisValue = getTagEv(CachePoints, CacheValues);

                //考虑方向的优先级
                if (i == 0) {
                  if (thisValue > 0) {
                    thisValue = thisValue * 2;
                  }
                  else {
                    thisValue = thisValue / 2;
                  }
                }

                if (thisValue > maxValue) {
                  maxValue = thisValue;

                  cpointFeat = cpointFeatList[cacheJ];
                  ol_cpointFeat = format.readFeature(cpointFeat);//三角网的重心
                  ol_wordFeature1 = ol_wordFeatureList[cacheJ];
                  ol_wordFeature1.setProperties({ 'name': data[k][0], 'belongto': feat.get("STUSPS"), 'weight': data[k][1], 'type': data[k][2] });
                  t_wordExtent = format.writeFeatureObject(ol_wordFeature1);
                  CacheRAngle = AngleList[cacheJ];
                }
              }
              //#endregion

              RecSource.addFeature(ol_wordFeature1);//在RecFeature中添加一个WordFeautre 包含name/feature/weight
              txtExPointArr = turf.explode(t_wordExtent).features;
              //tFeat=turf.difference(tFeat,t_wordExtent);      //if polygon contains too many holes, it can't work.
              rotateAangle = CacheRAngle;

              let CacheArea = ol_wordFeature1.getGeometry().getArea();
              TextArea=TextArea+CacheArea;

              //#region 删除被占据的要素
              if (samplePoints.length > 0) {
                samplePoints.shift();
              }
              if (sampleValues.length > 0) {
                sampleValues.shift();
              }
              if (RecSource.getFeatures().length > 20) //要素超过10个就删除
              {
                samplePoints = [];
                sampleValues = []
              }
              //#endregion
            }
            //#endregion

            //#region 当前TextSize下没有满足要求的Tag时
            if (CacheSat == true) {
              console.log(RecSource.getFeatures().length)
              break;
            } else {
              //sizeControl用于控制
              if (sizeControl > sizeGap) {        //The gap between calculation font size and the last font size is less than 10px.
                if (k <= 10) {    //If the number of tags is less than 10, we show all the tags in the popup._20180531——当显示的注记数小于10时，用一个popup来显示
                  bolBreakFor = true;
                  var cl = CenterPointSource.getFeatures().length;
                  while (cl > 0) {
                    var tagFeat = CenterPointSource.getFeatures()[cl - 1];
                    var tagRecFeat = RecSource.getFeatures()[cl - 1];
                    var CountryName = tagFeat.get("belongto");
                    if (CountryName == feat.get("STUSPS")) {
                      CenterPointSource.removeFeature(tagFeat);
                    }
                    CountryName = tagRecFeat.get("belongto");
                    if (CountryName == feat.get("STUSPS")) {
                      RecSource.removeFeature(tagRecFeat);
                    }
                    cl = cl - 1;
                  }
                }
                break;
              }
              textSize = textSize - 1;//每次Size减1？似乎没有考虑和Weigth相关
              if (k == 0) {
                if (tagFeatNameCol.length > 1) {
                  //if(a!=0 || b!=0){       //The first tag can't be placed. So it is only placed in popup.
                  bolBreakFor = true;
                  break;
                  //}
                }
              } else {
                sizeControl = sizeControl + 1;
              }
            }
            //#endregion
          }
          //#endregion

          //popup is shown and tagclouds are shown in a dialog window
          //这里表示的是若区域无法放置对应的Tag，则弹出一个对话框显示相应的Tags
          if (bolBreakFor == true) {
            var divTag = $("<div></div>");
            var divSubTag = $("<div></div>");
            var idTxt = feat.get("STUSPS");
            var newIDTxt = idTxt.replace(/\s+/g, "");
            divTag.attr("id", newIDTxt);
            //divTag.addClass('divTagCls');
            divTag.css({
              position: 'relative',
              height: 300 + "px",
              width: 300 + "px",
              'background-color': "rgba(255,255,255,1)",
              //overflow:"scroll",
              'border-style': "solid",
              'border-color': "#F5F5F5",
              'border-width': 2 + "px",
              '--feature-name': idTxt
              //'vertical-align':"text-bottom",
              //"display":"inline-block",
            });
            divSubTag.css({
              overflow: "scroll",
              height: divTag.width(),
              width: divTag.height()
            });
            /*var divA=$("<a></a>");
            divA.attr("id",idTxt+"-a");
            divA.attr("href","#");              
            divA.css({
              //"text-decoration": "none",
              height:"30px",
              width:"30px",
              background: "#DCDCDC",
              position: "absolute",
              top: "8px",
              right: 8+"px",
            });
            $("#"+idTxt+"-a").append("<style>'#'+idTxt+'-a':after{content:'✖'}</style>") ;
            divTag.append(divA);     */
            for (DIndex = 0; DIndex < data.length; DIndex++) {
              if (wordPara.calMethod.value == "Linear") {
                textSize = Math.round(a * data[DIndex][1] + b);
                //textSize = Math.round(a * (data[DIndex][1] - minValue) / valueGap + b);
                textSize = Math.round(textSize * oriResolution / ViewResolution);
              } else {
                // var nIndex=Math.trunc((data[DIndex][1]-minValue)/aveGap);
                // textSize=minWordSize+nIndex*aveWordSize;
                // textSize = Math.round(textSize * oriResolution / ViewResolution);
                for (var nIndex in NumData) {
                  if (feat.get("STUSPS") == NumData[nIndex][2] && data[DIndex][1] == NumData[nIndex][1] && data[DIndex][0] == NumData[nIndex][0]) {
                    qNum = Math.ceil(nIndex / aveNum);
                    textSize = maxWordSize * Math.pow(qSize, qNum - 1);
                    break;
                  }
                }
              }
              var txtSpanColor = [];
              /*if(data[DIndex][2]=="Culture"){
                txtSpanColor.push(79,129,189);
              }else if(data[DIndex][2]=="History"){
                txtSpanColor.push(237,125,49);
              }else{
                txtSpanColor.push(128,100,162);
              }*/
              var LegendColor = $("#" + data[DIndex][2]);
              var rgbStr = LegendColor.spectrum("get").toRgbString();
              rgbStr = rgbStr.slice(4, rgbStr.length - 1);
              txtSpanColor = rgbStr.split(",");

              var bolWeight = "normal";
              if (wordWeight == "True") {
                bolWeight = "bold";
              }
              var divSpan = $("<span></span>");
              divSpan.attr("id", newIDTxt + DIndex);
              divSpan.css({
                //position:'absolute',
                //display:"inline-block",
                'vertical-align': "bottom",
                //float:"left",
                padding: 5 + "px",
                color: txtSpanColor,
                "font-weight": bolWeight,
                "font-family": wordFont,
                "font-size": textSize,
                "--topic-name": data[DIndex][2],
                "--Frequency-value": data[DIndex][1].toString(),
                //border:2+"px solid #00f",
              });
              if (textSize >= minWordSize) {
                divSpan.css({
                  display: "inline-block",
                });
              } else {
                divSpan.css({
                  display: "none",
                });
              }
              divSpan.html(data[DIndex][0]);
              divSpan.mouseover(MouseOverTagInPopup);
              divSpan.mouseout(MouseOutTagInPopup);
              divSubTag.append(divSpan);
              spanCol.push([DIndex, idTxt, textSize, ViewResolution, data[DIndex][0], newIDTxt, data[DIndex][2]]);
              console.log(DIndex + "." + data[DIndex][0] + ":" + data[DIndex][1] + "-" + textSize);
            }
            divTag.append(divSubTag);
            var TSelectCenter = turf.centroid(tFeat);
            var ol_TSelectCenter = format.readFeature(TSelectCenter);
            var ol_TSelPoint = ol.extent.getCenter(ol_TSelectCenter.getGeometry().getExtent());
            var DrawLine;
            $("body").append(divTag);
            divTag.draggable({
              //refreshPositions:true,
              stop: function () {
                for (var l = 0; l < DrawLineArr.length; l++) {
                  if (DrawLineArr[l][0] == idTxt) {
                    DrawLine.setCoordinates([ol_TSelPoint, mouseCoordinate]);
                    DrawLineArr.splice(l, 1, [idTxt, DrawLine]);
                    break;
                  }
                }
                //console.log(DrawLine.getLength());
                map.renderSync();
              }
            });
            divTag.resizable();
            divTag.resize(function () {
              divSubTag.width(divTag.width());
              divSubTag.height(divTag.height());
            });
            divTag.dblclick(DoubleClickInPopup);
            var popup = new ol.Overlay({
              position: ol_TSelPoint,
              autoPan: true,
              autoPanAnimation: {
                duration: 250
              },
              element: document.getElementById(newIDTxt)
            });
            map.addOverlay(popup);
            popCol.push([newIDTxt, idTxt, popup, tFeat]);
            DrawLine = new ol.geom.LineString([ol_TSelPoint, ol_TSelPoint]);
            DrawLineArr.push([idTxt, DrawLine]);
            //console.log(DrawLine.getLength());
            map.renderSync();
            break;      //break for;
          }

          //表示正常Tag条件下的显示和放置
          if (CacheSat == true)
          //if (bol == true) //bol多次判断后可能为false
          {
            var txtColor;
            /*var r=Math.floor(Math.random()*256);
            var g=Math.floor(Math.random()*256);
            var b=Math.floor(Math.random()*256);
            txtColor.push(r,g,b);*/
            /*var cr=parseInt(Math.random()*txtColorArr.length,10);
            var rgbStr=txtColorArr[cr];    //get rgb(,,,)
            rgbStr=rgbStr.slice(4,rgbStr.length-1);
            var txtColor=new Array();
            txtColor=rgbStr.split(",");*/
            /*if(data[k][2]=="Culture"){
              txtColor.push(27,158,119);
            }else if(data[k][2]=="History"){
              txtColor.push(217,95,2);
            }else{
              txtColor.push(117,112,179);
            }*/
            LegendColor = $("#" + data[k][2]);
            //txtColor=$("#"+data[k][2]).spectrum("get");
            txtColor = LegendColor.spectrum("get").toRgbString();
            var wordStyle;
            if (wordWeight == "True") {
              wordStyle = 'Bold ' + Math.round(textSize) + "px " + wordFont;
            } else {
              wordStyle = Math.round(textSize) + "px " + wordFont;
            }
            /*txtSize=Math.round(textSize*oriResolution/ViewResolution);    //users may click polygons under different scale,03/08/2018
            var wordStyle2;
            if(wordWeight=="True"){
              wordStyle2='Bold ' + Math.round(textSize) + "px "+wordFont;
            }else{
              wordStyle2=Math.round(textSize) + "px "+wordFont;
            }*/
            var strokeStyle;
            if (wordPara.outlineWidth.value > 0) {
              strokeStyle = new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value });
            } else {
              strokeStyle = null;
            }
            //#region Tag/三角形重心的渲染+对应Tag的渲染
            ol_cpointFeat.setStyle(new ol.style.Style({
              image: new ol.style.Circle({
                radius: 0,
                fill: new ol.style.Fill({ color: 'rgba(0, 0, 255,1)' }),
                //stroke: new ol.style.Stroke({color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value})
              }),
              text: new ol.style.Text({
                textAlign: "center",//align == '' ? undefined : align,
                textBaseline: "middle",
                font: wordStyle,
                text: text,
                fill: new ol.style.Fill({ color: txtColor }), //"#aa3300"}),
                stroke: new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value }),
                //offsetX: offsetX,
                //offsetY: offsetY,
                //placement: placement,
                //maxAngle: maxAngle,
                //exceedLength: exceedLength,
                rotation: rotateAangle
              })
            }));
            //#endregion

            //设置PointFeature的属性，即对应的Tags
            ol_cpointFeat.setProperties({ 'name': data[k][0], 'font': wordStyle, 'resolution': ViewResolution, 'belongto': feat.get("STUSPS"), 'weight': data[k][1], 'type': data[k][2], 'tag': data[k][0], "tagNum": k });         //20171108
            CenterPointSource.addFeature(ol_cpointFeat);
            console.log(k + "." + text + ":" + data[k][1] + "-" + textSize + "," + rotateAangle);
            //oriFeat=tFeat;
            //triangles = turf.tesselate(tFeat);
            TriSource.clear();
            for (i = 0; i < triArr.length; i++) {
              var ol_triFeat = format.readFeature(triArr[i][0]);
              TriSource.addFeature(ol_triFeat);
            }
            txtExArr.push(t_wordExtent);

            for (CIndex = 0; CIndex < tFeatCoords.length; CIndex++) {
              subCoords = tFeatCoords[CIndex];
              subPolygon = turf.polygon(subCoords);
              var tagInPolygon = turf.booleanContains(subPolygon, t_wordExtent);
              if (tagInPolygon == true) {
                for (var triIndex = 0; triIndex < triArr.length; triIndex++) {
                  var curTri = triArr[triIndex][0];
                  var triInPolygon = turf.booleanContains(subPolygon, curTri);
                  if (triInPolygon == true) {
                    triArr.splice(triIndex, 1);
                    triIndex--;
                  }
                }
                for (i = 0; i < txtExPointArr.length - 1; i++) {
                  txtExPointArr[i].properties.z = 0;
                  tExplodePointArr[CIndex].features.push(txtExPointArr[i]);
                }
                cpointFeat.properties.z = 0;
                tExplodePointArr[CIndex].features.push(cpointFeat);
                var subTIN = turf.tin(tExplodePointArr[CIndex], 'z');
                turf.featureEach(subTIN, function (currentFeature, featureIndex) {
                  var cenTri = turf.centroid(currentFeature);
                  var triBool1 = turf.booleanPointInPolygon(cenTri, subPolygon);
                  var triBool2 = turf.booleanContains(subPolygon, currentFeature);
                  if (triBool1 == true && triBool2 == true) {
                    curArea = format.readFeature(currentFeature).getGeometry().getArea();
                    triArr.push([currentFeature, curArea]);
                  }
                });
                break;
              }
            }
            triArr.sort(descend);
            //console.log(wordPara.outlineColor.value);
            //CenterPointLayer.setStyle(pointStyleFunction);  
          }
          else {
            if (k == 0) {
              boolShowAll = false;
              alert("All the tags are smaller than the minimum font size!");
              for (var t = 0; t < tagFeatNameCol.length; t++) {
                if (feat.get("STUSPS") == tagFeatNameCol[t]) {
                  tagFeatNameCol.splice(t, 1);
                  break;
                }
              }
            }
            break;
          }

          // textSize<minWordSize
          if (textSize < minWordSize) {
            if (k <= 10) {
              ShowInPopup();
            }
            break;
          }

          // k<data.length-1
          if (k < data.length - 1) {
            //var tSize=Math.round(a*data[k+1][1]+b);
            var tSize;
            if (wordPara.calMethod.value == "Linear") {
              tSize = Math.round(a * data[k + 1][1] + b);
              //tSize = Math.round(a * (data[k + 1][1] - minValue) / valueGap + b);
              tSize = Math.round(tSize * oriResolution / ViewResolution);
              //textSize=Math.round(a*data[k+1][1]+b);      //y=ax+b;
            }
            else {
              // nIndex=Math.trunc((data[k + 1][1]-minValue)/aveGap);
              // tSize=minWordSize+nIndex*aveWordSize;
              // tSize = Math.round(tSize * oriResolution / ViewResolution);
              for (var nIndex in NumData) {
                if (feat.get("STUSPS") == NumData[nIndex][2] && data[k + 1][1] == NumData[nIndex][1] && data[k + 1][0] == NumData[nIndex][0]) {
                  qNum = Math.ceil(nIndex / aveNum);
                  tSize = maxWordSize * Math.pow(qSize, qNum - 1);
                  break;
                }
              }
            }

            //#region tSize<=textSize         
            if (tSize <= textSize) {
              textSize = tSize;
            }
            //#endregion   

          }

          //val = progressbar.progressbar("value");         

        }
      }
      //map.render();
    }

    //#region 主函数外的异常处理
    else {
      TriSource.clear();
      RecSource.clear();
      CenterPointSource.clear();
    }
    //#endregion

    //#region 时间显示
    cTime = new Date();
    var cTime2 = cTime.getTime();
    //console.log("Calculate time:"+ (cTime2-cTime1)/1000);
    if (boolShowAll == true) {
      alert("Complete! Total time:" + (cTime2 - cTime1) / 1000 + "s");
    }
    //#endregion
    //$("#Loading").hide();

    //#region 计算自相关系数
    let CachePoints = []
    let CacheValues = []
    for (let cacheI = 0; cacheI < CenterPointSource.getFeatures().length; cacheI++) {
      let cacheWordFeat = CenterPointSource.getFeatures()[cacheI];
      let cacheWordFont = cacheWordFeat.get('font');
      let cacheSizeIndex = cacheWordFont.indexOf("px");
      let subSize = parseFloat(cacheWordFont.substr(0, cacheSizeIndex));//需要用parseFloat将text转化为数字
      CachePoints.push(turf.point(cacheWordFeat.getGeometry().getCoordinates()));
      CacheValues.push(subSize);
    }
    //console.log(CachePoints);
    //console.log(CacheValues);
    thisValue = getTagEv(CachePoints, CacheValues);//计算自相关系数
    console.log(thisValue);
    //#endregion

    
    //计算Compactness
    console.log(TextArea);console.log(PolygonArea);
    console.log(TextArea/PolygonArea);
    //console.log(data);
  }
  //#endregion

  //删除bad candidates（删除小于平均值的）
  function FilterCandidate(wordFilterFeatureList, pointWordFilterFeatureList, angleFilterList,CenterFilterSourceLayer) {
    let shortestDisList = []

    for (let i = 0; i < pointWordFilterFeatureList.length; i++) {
      let pointFilterFeature = pointWordFilterFeatureList[i];
      let shortestDis = getShortestDis(pointFilterFeature, CenterFilterSourceLayer);
      shortestDisList.push(shortestDis);
    }

    let sumDis = 0;
    for (let i = 0; i < shortestDisList.length; i++) {
      sumDis = shortestDisList[i] + sumDis;
    }
    let aveDis = sumDis / shortestDisList.length;

    //console.log(shortestDisList);

    let deleteIndexList = []
    for (let i = 0; i < shortestDisList.length; i++) {
      if (shortestDisList[i] < aveDis) {
        deleteIndexList.push(i);
      }
    }


    /*
    if (shortestDisList.length > 5 && (shortestDisList.length - deleteIndexList.length) > 5) {
      let ShortDisListCopy = [...shortestDisList].sort((a, b) => b - a);
      let topFive = ShortDisListCopy.slice(0, 5);

      //console.log(topFive);
      deleteIndexList = [];//清空
      for (let i = 0; i < shortestDisList.length; i++) {
        if (!topFive.includes(shortestDisList[i])) {
          deleteIndexList.push(i);
        }
      }
    }
    */

    //console.log(deleteIndexList);
    deleteIndexList.sort((a, b) => b - a);

    for (let i = 0; i < deleteIndexList.length; i++) {
      pointWordFilterFeatureList.splice(deleteIndexList[i], 1);
      wordFilterFeatureList.splice(deleteIndexList[i], 1);
      angleFilterList.splice(deleteIndexList[i],1);
    }
    //console.log(wordFilterFeatureList);
    //console.log(pointWordFilterFeatureList);
  }

  ///获取点要素到已放置Tag中心的最短距离
  function getShortestDis(pointFeature, TagCenterLayer) {
    let shortestDis = 100000000000;
    var options = { units: 'miles' };

    for (let i = 0; i < TagCenterLayer.getFeatures().length; i++) {
      let point_1 = turf.point(pointFeature.geometry.coordinates);
      let point_2 = turf.point(TagCenterLayer.getFeatures()[i].getGeometry().getCoordinates());
      //console.log(point_2);
      let Dis = getDis(point_1, point_2, options);
      //console.log(Dis);
      if (Dis < shortestDis) {
        shortestDis = Dis;
      }
    }
    return shortestDis;
  }

  //#region  Main function for scaleWordCloud
  //规则采样
  function scaleWordCloud_Re() {
    //zoomFlag=false;
    //TriLayer.setVisible(true);
    //RecLayer.setVisible(true);

    var cTime = new Date(); //时间记录器
    var cTime1 = cTime.getTime();
    var boolShowAll = true;

    let PolygonArea=0;let TextArea=0;let oriCount=0;
    CenterPointLayer.setVisible(true); //An layer for open layer and set visible
    //txtContext.stroke();    
    ViewResolution = map.getView().getResolution(); //Get resolution
    if (ViewResolution < 192000) {     //wordPara.maxreso.value){-----------control the visual scale 
      if (selectedFeats.getLength() > 0) {

        //#region 构建选中要素的三角网       
        var format = new ol.format.GeoJSON();
        var feat = selectedFeats.item(0);//获取选中的要素(第一个，也就是Polygon)     
        var tFeat = format.writeFeatureObject(feat);

        var samplePoints = ResamplePoint_2(tFeat, 500, { units: 'miles' });
        var sampleValues = new Array(samplePoints.length).fill(0.1);
        console.log(samplePoints);
        console.log(sampleValues);

        // var tExplodeFeatCol=turf.explode(tFeat);    //point collection
        // tExplodeFeatCol.features.splice(tExplodeFeatCol.features.length-1,1);
        var tExplodePointArr = [];
        var tFeatCoords = turf.getCoords(tFeat);
        var tFeatType = turf.getType(tFeat);
        if (tFeatType == "Polygon") {       //the type of world map data is polygon,but usa map is multiPolygon.
          tFeat = turf.multiPolygon([tFeatCoords])
          tFeatCoords = turf.getCoords(tFeat);         
        }
        var subPolygon;
        for (var CIndex = 0; CIndex < tFeatCoords.length; CIndex++) {
          var subCoords = tFeatCoords[CIndex];
          subPolygon = turf.polygon(subCoords);
          var subPoints = turf.explode(subPolygon);
          subPoints.features.splice(subPoints.features.length - 1, 1);
          tExplodePointArr[CIndex] = subPoints;
        }

        //var oriFeat=tFeat;
        var t_selectFeature = tFeat;
        var triangles = turf.tesselate(tFeat);

        console.log(triangles.length);
        var triArr = [];
        var curArea;
        turf.featureEach(triangles, function (currentFeature, featureIndex) {
          //var curArea1=turf.area(curFeature);   //It can't get the real area by using this method.
          curArea = format.readFeature(currentFeature).getGeometry().getArea();
          triArr.push([currentFeature, curArea]);
          //let CachePolygonArea=turf.area(tFeat);//计算区域多边形的面积
          PolygonArea=PolygonArea+curArea;
        });
        //#endregion

        triArr.sort(descend);//三角形按照属性排序     

        //#region 计算每个Name的Word size，依据属性计算 Data[0][1]=属性
        var txtExArr = [];
        var txtExPointArr = [];      //explode the extent of word to pointcollection
        var cpointFeat;
        //if(a==0 && b==0){
        if (tagFeatNameCol.length == 1) {
          oriResolution = ViewResolution;
          //textSize=wordPara.maxSize.value;
        }//else{
        //textSize=Math.round(a*data[0][1]+b);
        if (wordPara.calMethod.value == "Linear") {
          //textSize=Math.round(a*(data[0][1]-minValue)/valueGap+b);
          textSize = Math.round(a * data[0][1] + b);//计算每个Text的字大 data[0][1]可能是Weigth最大的值
          textSize = Math.round(textSize * oriResolution / ViewResolution);
        } else {
          // nIndex=Math.trunc((data[0][1]-minValue)/aveGap);
          // textSize=minWordSize+nIndex*aveWordSize;
          // textSize=Math.round(textSize*oriResolution/ViewResolution);
          for (var nIndex in NumData) {
            if (feat.get("STUSPS") == NumData[nIndex][2] && data[0][1] == NumData[nIndex][1] && data[0][0] == NumData[nIndex][0]) {
              var qNum = Math.ceil(nIndex / aveNum);
              textSize = maxWordSize * Math.pow(qSize, qNum - 1);
              break;
            }
          }
        }
        //#endregion

        //这里的k作用域并非for循环，是整个函数；ES6解决办法：let
        //Tag计算的主函数 循环计算每一个Tag
        for (var k = 0; k < data.length; k++) {
          //for(var k=0;k<5;k++){

          //#region 获取dataName(按照6/8/10/正常字符进行截取) Data[0][0]=Name
          text = data[k][0];
          if (wordPara.text.value == "shorten6") {
            text = text.trunc(6);
          }
          else if (wordPara.text.value == "shorten8") {
            text = text.trunc(8);
          }
          else if (wordPara.text.value == "shorten10") {
            text = text.trunc(10);
          }
          //#endregion

          //#region 确定Tags的内容
          //var maxId=0;
          var ol_cpointFeat, center, pixelCenter;
          //var rAngle;
          if (bolCheck == false) {
            alert("Please select the orientention of tags!");
            for (var t = 0; t < tagFeatNameCol.length; t++) {
              if (feat.get("STUSPS") == tagFeatNameCol[t]) {
                tagFeatNameCol.splice(t, 1);
                break;
              }
            }
            return;
          }
          //#endregion

          var wordFont = wordPara.font.value;//字体
          var wordWeight = wordPara.bold.value;//是否加粗
          //var AngNum =Math.ceil(Math.PI/(2*rAngle));
          var recAngle;
          //var flag=false;
          var ol_wordFeature, ol_wordFeature1, ol_wordFeature2;
          var t_wordExtent;
          var bol = false;//Tag放置在三角网中的可行标识，false=不行；true=行
          let CacheSat = false;//表示存在三角形能满足条件
          var bolBreakFor = false;
          var sizeControl = 0;

          //#region 单个注记计算的Main function
          //循环计算并更新textSize，直至其小于minWordSize为止
          //Tag计算的思路：1. 依据TextSize取第一个Tag放置；2.若能放置，取下一个Tag，并依据当前的TextSize继续放置；3.若不能放置，TextSize-1________并非严格的线性关系
          while (textSize >= minWordSize) {

            let ol_wordFeatureList = [];
            let cpointFeatList = [];
            let AngleList = [];

            //#region 获取满足条件的n个位置 
            for (var i = 0; i < 9; i++) {   //9 potential orientations of tags
              if (typeof (angleArr[i]) != "undefined") { //依次判断选择的方向上Tag是否可放置在对应的三角形中
                recAngle = angleArr[i];

                let StopIndex = 50; let IndexCount = 0;//提升效率
                for (let triId = 0; triId < triArr.length; triId++) {
                  if (IndexCount >= StopIndex) //提升效率
                  {
                    break;
                  }

                  IndexCount = IndexCount + 1;
                  let cache_cpointFeat = turf.centroid(triArr[triId][0]);
                  let cache_ol_cpointFeat = format.readFeature(cache_cpointFeat);//三角网的重心
                  center = ol.extent.getCenter(cache_ol_cpointFeat.getGeometry().getExtent());
                  pixelCenter = map.getPixelFromCoordinate(center);
                  let cache_ol_wordFeature1 = GetWordExtent(text, textSize, wordFont, wordWeight, pixelCenter);//计算Text的Extend
                  cache_ol_wordFeature1.getGeometry().rotate(-recAngle, center);//旋转
                  let cache_t_wordExtent = format.writeFeatureObject(cache_ol_wordFeature1);
                  bol = BoolInBlank(cache_t_wordExtent, t_selectFeature, txtExArr);//判断Text是否能放置在三角网中

                  if (bol == true) {
                    /*if (ol_wordFeatureList.length == 0)//提升效率
                    {
                      StopIndex = 20;
                      IndexCount = 0;
                    }
                    */

                    CacheSat = true;
                    ol_wordFeatureList.push(cache_ol_wordFeature1);
                    cpointFeatList.push(cache_cpointFeat);
                    AngleList.push(recAngle);
                  }
                }
              }
            }
            //#endregion

            //#region 计算自相关系数获取自相关系数最大的目标
            if (ol_wordFeatureList.length > 0) {
              //#region 删除不好的candidate
              console.log(ol_wordFeatureList.length);
              //FilterCandidate(ol_wordFeatureList, cpointFeatList, AngleList,CenterPointSource);
              //#endregion

              //遍历计算相关系数最大目标
              let maxValue = -100000;
              let CacheRAngle;
              for (let cacheJ = 0; cacheJ < ol_wordFeatureList.length; cacheJ++) {
                //#region 获取现有的Points和对应的Values
                let CachePoints = []
                let CacheValues = []
                for (let cacheI = 0; cacheI < CenterPointSource.getFeatures().length; cacheI++) {
                  let cacheWordFeat = CenterPointSource.getFeatures()[cacheI];
                  let cacheWordFont = cacheWordFeat.get('font');
                  let cacheSizeIndex = cacheWordFont.indexOf("px");
                  let subSize = parseFloat(cacheWordFont.substr(0, cacheSizeIndex));//文本需要转化为Float类型
                  CachePoints.push(turf.point(cacheWordFeat.getGeometry().getCoordinates()));
                  CacheValues.push(subSize);
                }
                //console.log(samplePoints);
                for (let PointI = 0; PointI < samplePoints.length; PointI++) {
                  CachePoints.push(samplePoints[PointI]);
                }
                for (let ValueI = 0; ValueI < sampleValues.length; ValueI++) {
                  CacheValues.push(sampleValues[ValueI]);
                }

                //console.log(cpointFeatList[cacheJ]);
                CachePoints.push(turf.point(cpointFeatList[cacheJ].geometry.coordinates));
                CacheValues.push(parseFloat(textSize));//文本转Float类型

                //console.log(CachePoints);

                thisValue = getTagEv(CachePoints, CacheValues);

                //考虑方向的优先级
                if (i == 0) {
                  if (thisValue > 0) {
                    thisValue = thisValue * 2;
                  }
                  else {
                    thisValue = thisValue / 2;
                  }
                }

                if (thisValue > maxValue) {
                  maxValue = thisValue;

                  cpointFeat = cpointFeatList[cacheJ];
                  ol_cpointFeat = format.readFeature(cpointFeat);//三角网的重心
                  ol_wordFeature1 = ol_wordFeatureList[cacheJ];
                  t_wordExtent = format.writeFeatureObject(ol_wordFeature1);
                  CacheRAngle = AngleList[cacheJ];
                }
              }
              //#endregion
             
              ol_wordFeature1.setProperties({ 'name': data[k][0], 'belongto': feat.get("STUSPS"), 'weight': data[k][1], 'type': data[k][2] });
              RecSource.addFeature(ol_wordFeature1);//在RecFeature中添加一个WordFeautre 包含name/feature/weight             
              txtExPointArr = turf.explode(t_wordExtent).features;
              //tFeat=turf.difference(tFeat,t_wordExtent);      //if polygon contains too many holes, it can't work.

              //var geometry = ol_wordFeature1.getGeometry(); // 获取要素的几何形状 
              //var coordinates = geometry.getCoordinates(); // 获取多边形的坐标  
              //var polygon = turf.polygon(coordinates);  
              //var CacheArea = turf.area(polygon); 
              let CacheArea = ol_wordFeature1.getGeometry().getArea();
              TextArea=TextArea+CacheArea; 

              rotateAangle = CacheRAngle;
              if(rotateAangle==0)
              {
                oriCount++;
              }
              
            }

            //#region 删除被占据的要素
            if (samplePoints.length > 0) {
              for (let CacheF = samplePoints.length - 1; CacheF >= 0; CacheF--) {
                try {
                  if (turf.booleanPointInPolygon(samplePoints[CacheF], t_wordExtent.geometry)) {
                    samplePoints.splice(CacheF, 1);
                    sampleValues.splice(CacheF, 1);
                  }
                }
                catch
                { }
              }
            }

            if (RecSource.getFeatures().length > 10) //要素超过10个就删除
            {
              samplePoints = [];
              sampleValues = []
            }
            //#endregion
            //#endregion

            //计算Text的面积并相交
            //let CacheArea=turf.area(t_wordExtent.geometry);
            //console.log(CacheArea);
            //TextArea=TextArea+CacheArea;

            //#region 当前TextSize下没有满足要求的Tag时
            if (CacheSat == true) {
              console.log(RecSource.getFeatures().length)
              break;
            } else {
              //sizeControl用于控制
              if (sizeControl > sizeGap) {        //The gap between calculation font size and the last font size is less than 10px.
                if (k <= 10) {
                  console.log(sizeControl);
                  console.log(location);   //If the number of tags is less than 10, we show all the tags in the popup._20180531——当显示的注记数小于10时，用一个popup来显示
                  bolBreakFor = true;
                  var cl = CenterPointSource.getFeatures().length;
                  while (cl > 0) {
                    var tagFeat = CenterPointSource.getFeatures()[cl - 1];
                    var tagRecFeat = RecSource.getFeatures()[cl - 1];
                    var CountryName = tagFeat.get("belongto");
                    if (CountryName == feat.get("STUSPS")) {
                      CenterPointSource.removeFeature(tagFeat);
                    }
                    CountryName = tagRecFeat.get("belongto");
                    if (CountryName == feat.get("STUSPS")) {
                      RecSource.removeFeature(tagRecFeat);
                    }
                    cl = cl - 1;
                  }
                }
                break;
              }
              textSize = textSize - 1;//每次Size减1？似乎没有考虑和Weigth相关
              if (k == 0) {
                if (tagFeatNameCol.length > 1) {
                  //if(a!=0 || b!=0){       //The first tag can't be placed. So it is only placed in popup.
                  bolBreakFor = true;
                  break;
                  //}
                }
              } else {
                sizeControl = sizeControl + 1;
              }
            }
            //#endregion
          }
          //#endregion

          //popup is shown and tagclouds are shown in a dialog window
          //这里表示的是若区域无法放置对应的Tag，则弹出一个对话框显示相应的Tags
          if (bolBreakFor == true) {
            var divTag = $("<div></div>");
            var divSubTag = $("<div></div>");
            var idTxt = feat.get("STUSPS");
            var newIDTxt = idTxt.replace(/\s+/g, "");
            divTag.attr("id", newIDTxt);
            //divTag.addClass('divTagCls');
            divTag.css({
              position: 'relative',
              height: 300 + "px",
              width: 300 + "px",
              'background-color': "rgba(255,255,255,1)",
              //overflow:"scroll",
              'border-style': "solid",
              'border-color': "#F5F5F5",
              'border-width': 2 + "px",
              '--feature-name': idTxt
              //'vertical-align':"text-bottom",
              //"display":"inline-block",
            });
            divSubTag.css({
              overflow: "scroll",
              height: divTag.width(),
              width: divTag.height()
            });
            /*var divA=$("<a></a>");
            divA.attr("id",idTxt+"-a");
            divA.attr("href","#");              
            divA.css({
              //"text-decoration": "none",
              height:"30px",
              width:"30px",
              background: "#DCDCDC",
              position: "absolute",
              top: "8px",
              right: 8+"px",
            });
            $("#"+idTxt+"-a").append("<style>'#'+idTxt+'-a':after{content:'✖'}</style>") ;
            divTag.append(divA);     */
            for (DIndex = 0; DIndex < data.length; DIndex++) {
              if (wordPara.calMethod.value == "Linear") {
                textSize = Math.round(a * data[DIndex][1] + b);
                //textSize = Math.round(a * (data[DIndex][1] - minValue) / valueGap + b);
                textSize = Math.round(textSize * oriResolution / ViewResolution);
              } else {
                // var nIndex=Math.trunc((data[DIndex][1]-minValue)/aveGap);
                // textSize=minWordSize+nIndex*aveWordSize;
                // textSize = Math.round(textSize * oriResolution / ViewResolution);
                for (var nIndex in NumData) {
                  if (feat.get("STUSPS") == NumData[nIndex][2] && data[DIndex][1] == NumData[nIndex][1] && data[DIndex][0] == NumData[nIndex][0]) {
                    qNum = Math.ceil(nIndex / aveNum);
                    textSize = maxWordSize * Math.pow(qSize, qNum - 1);
                    break;
                  }
                }
              }
              var txtSpanColor = [];
              /*if(data[DIndex][2]=="Culture"){
                txtSpanColor.push(79,129,189);
              }else if(data[DIndex][2]=="History"){
                txtSpanColor.push(237,125,49);
              }else{
                txtSpanColor.push(128,100,162);
              }*/
              var LegendColor = $("#" + data[DIndex][2]);
              var rgbStr = LegendColor.spectrum("get").toRgbString();
              rgbStr = rgbStr.slice(4, rgbStr.length - 1);
              txtSpanColor = rgbStr.split(",");

              var bolWeight = "normal";
              if (wordWeight == "True") {
                bolWeight = "bold";
              }
              var divSpan = $("<span></span>");
              divSpan.attr("id", newIDTxt + DIndex);
              divSpan.css({
                //position:'absolute',
                //display:"inline-block",
                'vertical-align': "bottom",
                //float:"left",
                padding: 5 + "px",
                color: txtSpanColor,
                "font-weight": bolWeight,
                "font-family": wordFont,
                "font-size": textSize,
                "--topic-name": data[DIndex][2],
                "--Frequency-value": data[DIndex][1].toString(),
                //border:2+"px solid #00f",
              });
              if (textSize >= minWordSize) {
                divSpan.css({
                  display: "inline-block",
                });
              } else {
                divSpan.css({
                  display: "none",
                });
              }
              divSpan.html(data[DIndex][0]);
              divSpan.mouseover(MouseOverTagInPopup);
              divSpan.mouseout(MouseOutTagInPopup);
              divSubTag.append(divSpan);
              spanCol.push([DIndex, idTxt, textSize, ViewResolution, data[DIndex][0], newIDTxt, data[DIndex][2]]);
              console.log(DIndex + "." + data[DIndex][0] + ":" + data[DIndex][1] + "-" + textSize);
            }
            divTag.append(divSubTag);
            var TSelectCenter = turf.centroid(tFeat);
            var ol_TSelectCenter = format.readFeature(TSelectCenter);
            var ol_TSelPoint = ol.extent.getCenter(ol_TSelectCenter.getGeometry().getExtent());
            var DrawLine;
            $("body").append(divTag);
            divTag.draggable({
              //refreshPositions:true,
              stop: function () {
                for (var l = 0; l < DrawLineArr.length; l++) {
                  if (DrawLineArr[l][0] == idTxt) {
                    DrawLine.setCoordinates([ol_TSelPoint, mouseCoordinate]);
                    DrawLineArr.splice(l, 1, [idTxt, DrawLine]);
                    break;
                  }
                }
                //console.log(DrawLine.getLength());
                map.renderSync();
              }
            });
            divTag.resizable();
            divTag.resize(function () {
              divSubTag.width(divTag.width());
              divSubTag.height(divTag.height());
            });
            divTag.dblclick(DoubleClickInPopup);
            var popup = new ol.Overlay({
              position: ol_TSelPoint,
              autoPan: true,
              autoPanAnimation: {
                duration: 250
              },
              element: document.getElementById(newIDTxt)
            });
            map.addOverlay(popup);
            popCol.push([newIDTxt, idTxt, popup, tFeat]);
            DrawLine = new ol.geom.LineString([ol_TSelPoint, ol_TSelPoint]);
            DrawLineArr.push([idTxt, DrawLine]);
            //console.log(DrawLine.getLength());
            map.renderSync();
            break;      //break for;
          }

          //表示正常Tag条件下的显示和放置
          if (CacheSat == true)
          //if (bol == true) //bol多次判断后可能为false
          {
            var txtColor;
            /*var r=Math.floor(Math.random()*256);
            var g=Math.floor(Math.random()*256);
            var b=Math.floor(Math.random()*256);
            txtColor.push(r,g,b);*/
            /*var cr=parseInt(Math.random()*txtColorArr.length,10);
            var rgbStr=txtColorArr[cr];    //get rgb(,,,)
            rgbStr=rgbStr.slice(4,rgbStr.length-1);
            var txtColor=new Array();
            txtColor=rgbStr.split(",");*/
            /*if(data[k][2]=="Culture"){
              txtColor.push(27,158,119);
            }else if(data[k][2]=="History"){
              txtColor.push(217,95,2);
            }else{
              txtColor.push(117,112,179);
            }*/
            LegendColor = $("#" + data[k][2]);
            //txtColor=$("#"+data[k][2]).spectrum("get");
            txtColor = LegendColor.spectrum("get").toRgbString();
            var wordStyle;
            if (wordWeight == "True") {
              wordStyle = 'Bold ' + Math.round(textSize) + "px " + wordFont;
            } else {
              wordStyle = Math.round(textSize) + "px " + wordFont;
            }
            /*txtSize=Math.round(textSize*oriResolution/ViewResolution);    //users may click polygons under different scale,03/08/2018
            var wordStyle2;
            if(wordWeight=="True"){
              wordStyle2='Bold ' + Math.round(textSize) + "px "+wordFont;
            }else{
              wordStyle2=Math.round(textSize) + "px "+wordFont;
            }*/
            var strokeStyle;
            if (wordPara.outlineWidth.value > 0) {
              strokeStyle = new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value });
            } else {
              strokeStyle = null;
            }
            //#region Tag/三角形重心的渲染+对应Tag的渲染
            ol_cpointFeat.setStyle(new ol.style.Style({
              image: new ol.style.Circle({
                radius: 0,
                fill: new ol.style.Fill({ color: 'rgba(0, 0, 255,1)' }),
                //stroke: new ol.style.Stroke({color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value})
              }),
              text: new ol.style.Text({
                textAlign: "center",//align == '' ? undefined : align,
                textBaseline: "middle",
                font: wordStyle,
                text: text,
                fill: new ol.style.Fill({ color: txtColor }), //"#aa3300"}),
                stroke: new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value }),
                //offsetX: offsetX,
                //offsetY: offsetY,
                //placement: placement,
                //maxAngle: maxAngle,
                //exceedLength: exceedLength,
                rotation: rotateAangle
              })
            }));
            //#endregion

            //设置PointFeature的属性，即对应的Tags
            ol_cpointFeat.setProperties({ 'name': data[k][0], 'font': wordStyle, 'resolution': ViewResolution, 'belongto': feat.get("STUSPS"), 'weight': data[k][1], 'type': data[k][2], 'tag': data[k][0], "tagNum": k });         //20171108
            CenterPointSource.addFeature(ol_cpointFeat);
            console.log(k + "." + text + ":" + data[k][1] + "-" + textSize + "," + rotateAangle);
            //oriFeat=tFeat;
            //triangles = turf.tesselate(tFeat);
            TriSource.clear();
            for (i = 0; i < triArr.length; i++) {
              var ol_triFeat = format.readFeature(triArr[i][0]);
              TriSource.addFeature(ol_triFeat);
            }
            txtExArr.push(t_wordExtent);

            for (CIndex = 0; CIndex < tFeatCoords.length; CIndex++) {
              subCoords = tFeatCoords[CIndex];
              subPolygon = turf.polygon(subCoords);
              var tagInPolygon = turf.booleanContains(subPolygon, t_wordExtent);
              if (tagInPolygon == true) {
                for (var triIndex = 0; triIndex < triArr.length; triIndex++) {
                  var curTri = triArr[triIndex][0];
                  var triInPolygon = turf.booleanContains(subPolygon, curTri);
                  if (triInPolygon == true) {
                    triArr.splice(triIndex, 1);
                    triIndex--;
                  }
                }
                for (i = 0; i < txtExPointArr.length - 1; i++) {
                  txtExPointArr[i].properties.z = 0;
                  tExplodePointArr[CIndex].features.push(txtExPointArr[i]);
                }
                cpointFeat.properties.z = 0;
                tExplodePointArr[CIndex].features.push(cpointFeat);
                var subTIN = turf.tin(tExplodePointArr[CIndex], 'z');
                turf.featureEach(subTIN, function (currentFeature, featureIndex) {
                  var cenTri = turf.centroid(currentFeature);
                  var triBool1 = turf.booleanPointInPolygon(cenTri, subPolygon);
                  var triBool2 = turf.booleanContains(subPolygon, currentFeature);
                  if (triBool1 == true && triBool2 == true) {
                    curArea = format.readFeature(currentFeature).getGeometry().getArea();
                    triArr.push([currentFeature, curArea]);
                  }
                });
                break;
              }
            }
            triArr.sort(descend);
            //console.log(wordPara.outlineColor.value);
            //CenterPointLayer.setStyle(pointStyleFunction);  
          }
          else {
            if (k == 0) {
              boolShowAll = false;
              alert("All the tags are smaller than the minimum font size!");
              for (var t = 0; t < tagFeatNameCol.length; t++) {
                if (feat.get("STUSPS") == tagFeatNameCol[t]) {
                  tagFeatNameCol.splice(t, 1);
                  break;
                }
              }
            }
            break;
          }

          // textSize<minWordSize
          if (textSize < minWordSize) {
            if (k <= 10) {
              ShowInPopup();
            }
            break;
          }

          // k<data.length-1
          if (k < data.length - 1) {
            //var tSize=Math.round(a*data[k+1][1]+b);
            var tSize;
            if (wordPara.calMethod.value == "Linear") {
              tSize = Math.round(a * data[k + 1][1] + b);
              //tSize = Math.round(a * (data[k + 1][1] - minValue) / valueGap + b);
              tSize = Math.round(tSize * oriResolution / ViewResolution);
              //textSize=Math.round(a*data[k+1][1]+b);      //y=ax+b;
            }
            else {
              // nIndex=Math.trunc((data[k + 1][1]-minValue)/aveGap);
              // tSize=minWordSize+nIndex*aveWordSize;
              // tSize = Math.round(tSize * oriResolution / ViewResolution);
              for (var nIndex in NumData) {
                if (feat.get("STUSPS") == NumData[nIndex][2] && data[k + 1][1] == NumData[nIndex][1] && data[k + 1][0] == NumData[nIndex][0]) {
                  qNum = Math.ceil(nIndex / aveNum);
                  tSize = maxWordSize * Math.pow(qSize, qNum - 1);
                  break;
                }
              }
            }

            //#region tSize<=textSize         
            if (tSize <= textSize) {
              textSize = tSize;
            }
            //#endregion   

          }

          //val = progressbar.progressbar("value");         

        }
      }
      //map.render();
    }

    //#region 主函数外的异常处理
    else {
      TriSource.clear();
      RecSource.clear();
      CenterPointSource.clear();
    }
    //#endregion

    //#region 时间显示
    cTime = new Date();
    var cTime2 = cTime.getTime();
    //console.log("Calculate time:"+ (cTime2-cTime1)/1000);
    if (boolShowAll == true) {
      alert("Complete! Total time:" + (cTime2 - cTime1) / 1000 + "s");
    }
    //#endregion
    //$("#Loading").hide();

    //#region 计算自相关系数
    let CachePoints = []
    let CacheValues = []
    for (let cacheI = 0; cacheI < CenterPointSource.getFeatures().length; cacheI++) {
      let cacheWordFeat = CenterPointSource.getFeatures()[cacheI];
      let cacheWordFont = cacheWordFeat.get('font');
      let cacheSizeIndex = cacheWordFont.indexOf("px");
      let subSize = parseFloat(cacheWordFont.substr(0, cacheSizeIndex));//需要用parseFloat将text转化为数字
      CachePoints.push(turf.point(cacheWordFeat.getGeometry().getCoordinates()));
      CacheValues.push(subSize);
    }
    //console.log(CachePoints);
    //console.log(CacheValues);
    thisValue = getTagEv(CachePoints, CacheValues);//计算自相关系数
    console.log(thisValue);
    //#endregion

    //console.log(data);

    //计算Compactness
    /*
    var totalArea = 0;

    // 遍历矢量源中的所有要素  
    RecSource.getFeatures().forEach(function (feature) {
      var geometry = feature.getGeometry();
        var coordinates = geometry.getCoordinates(); // 获取多边形的坐标  
        var polygon = turf.polygon(coordinates);
        var area = turf.area(polygon); // 面积单位取决于你的坐标系统（可能是平方米或平方度等）  

        totalArea += area; // 累加面积  
    });
    */

    console.log(TextArea);console.log(PolygonArea);
    console.log(TextArea/PolygonArea);
    console.log(oriCount);
  }
  //#endregion

  function VirtualTags() {
    VirtualTagLayer.setVisible(true);
    VirtualTagRecLayer.setVisible(true);
    //txtContext.stroke();    
    ViewResolution = map.getView().getResolution(); //Get resolution
    if (ViewResolution < 192000) {     //wordPara.maxreso.value){-----------control the visual scale 
      if (selectedFeats.getLength() > 0) {
        let format = new ol.format.GeoJSON();
        let feat = selectedFeats.item(0);//获取选中的要素(第一个，也就是Polygon)

        feat.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 5
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,1)'
            //color: 'rgba(0,255,255,1)'
          })
        }));
        //VectorSource.addFeature(feat);
        //map.renderSync();
        VectorSource.changed();

        let tFeat = format.writeFeatureObject(feat);
        let BBox = turf.bbox(tFeat);
        let extent = [BBox[0], BBox[1], BBox[2], BBox[3]];
        //console.log(BBox);

        //let gridPoints = ResamplePoint(BBox, 1000, { units: 'miles' });
        let Grids = ResampleGrid(BBox, 200, { units: 'miles' });
        console.log(Grids);
        //console.log(gridPoints);
        //console.log(gridPoints.features.length);
        /*
        let FinalPoints=turf.pointsWithinPolygon(gridPoints,tFeat);
        for (let i = 0; i < FinalPoints.features.length; i++) {
          //console.log(i);

          ol_cpointFeat = format.readFeature(FinalPoints.features[i]);
          //console.log(ol_cpointFeat);
          VirtualTagSource.addFeature(ol_cpointFeat);
        }
        */
        for (let i = 0; i < Grids.features.length; i++) {
          let centroid = turf.centroid(Grids.features[i]);
          ol_cpointFeat = format.readFeature(centroid);
          if (turf.booleanPointInPolygon(centroid, tFeat.geometry))//在Polygon内的才考虑
          {
            VirtualTagSource.addFeature(ol_cpointFeat);
          }


          ol_GridFeat = format.readFeature(Grids.features[i]);
          //if(turf.booleanIntersects(ol_GridFeat,tFeat))
          //{
          //VirtualTagRecSource.addFeature(ol_GridFeat);
          //}
        }
        //console.log(VirtualTagSource);
      }
    }
  }

  function VirtualTags_2() {
    VirtualTagLayer.setVisible(true);
    VirtualTagRecLayer.setVisible(true);
    //txtContext.stroke();    
    ViewResolution = map.getView().getResolution(); //Get resolution
    if (ViewResolution < 192000) {     //wordPara.maxreso.value){-----------control the visual scale 
      if (selectedFeats.getLength() > 0) {
        let format = new ol.format.GeoJSON();
        var samplePoints = samplePoint(40);
        for (let i = 0; i < samplePoints.length; i++) {
          ol_cpointFeat = format.readFeature(samplePoints[i]);
          //console.log(ol_cpointFeat);
          VirtualTagSource.addFeature(ol_cpointFeat);
        }
      }
    }
  }

  function pointStyleFunction(resolution) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: 'rgba(0, 0, 255,1)' }),
        stroke: new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value })
      }),
      text: createTextStyle(resolution)
    });
  }

  function VirtualPointStyle() {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: '#fff', width: 0.1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0,0,255, 1)'
        })
      })
    })
  }

  var createTextStyle = function (resolution) {
    var align = "center";
    var baseline = "middle";
    size = textSize;
    //var offsetX = parseInt(dom.offsetX.value, 10);
    //var offsetY = parseInt(dom.offsetY.value, 10);
    var weight = "Bold";
    //var placement = "Point";
    //var maxAngle ="45°";
    //var exceedLength = "False";
    var rotation = rotateAangle;
    var font = weight + ' ' + Math.round(size) + "px Arial";
    var fillColor = "#aa3300";
    var outlineColor = wordPara.outlineColor.value;
    var outlineWidth = wordPara.outlineWidth.value;

    return new ol.style.Text({
      textAlign: align,//align == '' ? undefined : align,
      textBaseline: baseline,
      font: font,
      text: text,
      fill: new ol.style.Fill({ color: fillColor }),
      stroke: new ol.style.Stroke({ color: outlineColor, width: outlineWidth }),
      //offsetX: offsetX,
      //offsetY: offsetY,
      //placement: placement,
      //maxAngle: maxAngle,
      //exceedLength: exceedLength,
      rotation: rotation
    });
  };

  function GetWordExtent(text, size, font, wordWeight, placePoint) {
    //var halfText = (size + 1) * (text.length / 4);
    var buffer = 2;     //a buffer radius
    var c = document.getElementById("TxtSize");
    var ctx = c.getContext("2d");
    if (wordWeight == "True") {
      ctx.font = "Bold " + (size) + "px " + font;
    } else {
      ctx.font = (size) + "px " + font;
    }
    ctx.txt = text;
    halfText = ctx.measureText(text).width / 2 + buffer;
    size = parseInt(size) + buffer;
    // Create a bounding box for the label using known pixel heights
    var minx = parseInt(placePoint[0] - halfText);
    var maxx = parseInt(placePoint[0] + halfText);

    var maxy = parseInt(placePoint[1] - (size / 2));
    var miny = parseInt(placePoint[1] + (size / 2));

    // Get bounding box points back into coordinate space
    var min = map.getCoordinateFromPixel([minx, miny]);
    var max = map.getCoordinateFromPixel([maxx, maxy]);
    var polygonFeature = new ol.Feature(
      new ol.geom.Polygon([[[min[0], min[1]], [min[0], max[1]],
      [max[0], max[1]], [max[0], min[1]], [min[0], min[1]]]]));
    return polygonFeature;
  }

  // It is used to judege the suitable place.
  function BoolInBlank(wordExtent, polygonFeature, wordExArray) {
    var n = polygonFeature.geometry.coordinates.length;    //it is used to judge single polygon or multi polygon
    var WordPointArr = turf.explode(wordExtent).features;
    var cPCol;
    var cpointArr = [];
    for (var i = 0; i < WordPointArr.length - 1; i++) {
      cpointArr.push(WordPointArr[i]);
      var cP1 = WordPointArr[i];
      var cP2 = WordPointArr[i + 1];
      cPCol = turf.featureCollection([cP1, cP2]);
      var cP3 = turf.center(cPCol);
      cpointArr.push(cP3);
      cPCol = turf.featureCollection([cP1, cP3]);
      var cP4 = turf.center(cPCol);
      cpointArr.push(cP4);
      cPCol = turf.featureCollection([cP3, cP2]);
      cP4 = turf.center(cPCol);
      cpointArr.push(cP4);
    }
    var cpointFCol = turf.featureCollection(cpointArr);
    var bool1 = false, bool2 = false;
    var poly;
    var FeatPoints;
    var ptsWithin;
    var ptsExtWithin;
    if (n == 1) {
      //bool1=turf.booleanContains(polygonFeature,wordExtent);    //The principle is that the nodes of polygon are contained or not by the other polygon.
      ptsExtWithin = turf.pointsWithinPolygon(cpointFCol, polygonFeature);
      if (ptsExtWithin.features.length == cpointArr.length) {
        bool1 = true;
      } else {
        bool1 = false;
      }
      if (bool1 == false) {
        return false;
      } else {

        FeatPoints = turf.explode(polygonFeature);
        ptsWithin = turf.pointsWithinPolygon(FeatPoints, wordExtent);
        if (ptsWithin.features.length > 0) {
          return false;
        } else {
          if (wordExArray.length == 0) {
            return true;
          } else {
            for (i = 0; i < wordExArray.length; i++) {
              var ele = wordExArray[i];
              poly = turf.intersect(ele, wordExtent);
              if (poly != null) {
                return false;
              } else {
                bool2 = true;
              }
            }
            if (bool2 == true) {
              return true;
            }
          }
        }
      }
    } else if (n > 1) {
      for (var j = 0; j < n; j++) {
        var subPolygon = polygonFeature.geometry.coordinates[j];
        var TsubPolygon;
        if (subPolygon.length == 1) {   //island
          TsubPolygon = turf.polygon(subPolygon);
        } else {    //hole
          TsubPolygon = turf.polygon([subPolygon]);
        }
        //bool1=turf.booleanContains(TsubPolygon,wordExtent);
        ptsExtWithin = turf.pointsWithinPolygon(cpointFCol, TsubPolygon);
        if (ptsExtWithin.features.length == cpointArr.length) {
          bool1 = true;
        } else {
          bool1 = false;
        }
        if (bool1 == true) {
          FeatPoints = turf.explode(TsubPolygon);
          ptsWithin = turf.pointsWithinPolygon(FeatPoints, wordExtent);
          if (ptsWithin.features.length > 0) {
            return false;
          } else {
            if (wordExArray.length == 0) {
              return true;
            } else {
              for (i = 0; i < wordExArray.length; i++) {
                ele = wordExArray[i];
                poly = turf.intersect(ele, wordExtent);
                if (poly != null) {
                  return false;
                } else {
                  bool2 = true;
                }
              }
              if (bool2 == true) {
                return true;
              }
            }
          }
        }
      }
      if (bool1 == false) {
        return false;
      }
    }
  }


  // It is used to judge the suitable place.
  function BoolInBlank2(wordExtent, polygonFeature, wordExArray) {
    var n = polygonFeature.geometry.coordinates.length;    //it is used to judge single polygon or multi polygon
    var bool1 = false, bool2 = false, bool3 = false, bool4 = false;
    var poly;
    var wordCenter = turf.centroid(wordExtent);
    var WordPointArr1 = turf.explode(wordExtent).features;
    var WordPointArr2;
    wordCenter.properties.z = 0;
    WordPointArr2 = turf.featureCollection([wordCenter]);
    for (var i = 0; i < WordPointArr1.length - 1; i++) {
      WordPointArr1[i].properties.z = 0;
      WordPointArr2.features.push(WordPointArr1[i]);
    }
    var tin = turf.tin(WordPointArr2, 'z');
    var cpointArr = [];
    turf.featureEach(tin, function (currentFeature, featureIndex) {
      var triCenter = turf.centroid(currentFeature);
      cpointArr.push(triCenter);
    });

    if (n == 1) {
      bool1 = turf.booleanContains(polygonFeature, wordExtent);    //The principle is that the nodes of polygon are contained or not by the other polygon.
      if (bool1 == false) {
        return false;
      } else {
        for (i = 0; i < cpointArr.length; i++) {
          var tpoint = cpointArr[i];
          bool2 = turf.booleanContains(polygonFeature, tpoint);
          if (bool2 == false) {
            bool3 = false;
            return false;
          } else {
            bool3 = true;
          }
        }
        //bool2=turf.booleanEqual(recPoly,wordExtent); // The coordinate of nodes exists a bit diffrence.
        if (bool3 == true) {
          if (wordExArray.length == 0) {
            return true;
          } else {
            for (i = 0; i < wordExArray.length; i++) {
              var ele = wordExArray[i];
              poly = turf.intersect(ele, wordExtent);
              if (poly != null) {
                return false;
              } else {
                bool4 = true;
              }
            }
            if (bool4 == true) {
              return true;
            }
          }
        }
      }
    } else if (n > 1) {
      for (var j = 0; j < n; j++) {
        var subPolygon = polygonFeature.geometry.coordinates[j];
        var TsubPolygon = turf.polygon(subPolygon);
        bool1 = turf.booleanContains(TsubPolygon, wordExtent);
        if (bool1 == true) {
          for (i = 0; i < cpointArr.length; i++) {
            tpoint = cpointArr[i];
            bool2 = turf.booleanContains(TsubPolygon, tpoint);
            if (bool2 == false) {
              bool3 = false;
              return false;
            } else {
              bool3 = true;
            }
          }
          //bool2=turf.booleanEqual(recPoly,wordExtent); // The coordinate of nodes exists a bit diffrence.
          if (bool3 == true) {
            if (wordExArray.length == 0) {
              return true;
            } else {
              for (i = 0; i < wordExArray.length; i++) {
                ele = wordExArray[i];
                poly = turf.intersect(ele, wordExtent);
                if (poly != null) {
                  return false;
                } else {
                  bool4 = true;
                }
              }
              if (bool4 == true) {
                return true;
              }
            }
          }
        }
      }
    }
  }


  /*
  //it is used to exclude the triangles from TIN
  function BoolTriInWhiteSpace(triFeat,polygonFeature,wordExtent){
    var CID=turf.centroid(triFeat);
    var bool1=turf.booleanContains(wordExtent,CID);
    var bool2=turf.booleanContains(polygonFeature,CID);
    if(bool1==false && bool2==true){
      return true;
    }else{
      return false;
    }
  }

  function BoolTriInRec(triFeat,wordExArray){
   var bol=false;
   var CID=turf.centroid(triFeat);
   for(var i=0;i<wordExArray.length;i++) {
    var ele=wordExArray[i];
    //bol=turf.booleanOverlap(triFeat,ele);
    bol=turf.booleanContains(ele,CID);
    if(bol==true){      
      break;
    }
   }
   return bol;
  }*/

  //#region Functions for panel button
  // function for clear map
  document.getElementById('clearMap').addEventListener('click', function () {
    CenterPointSource.clear();
    RecSource.clear();
    selectClick.getFeatures().clear();
    //map.removeInteraction(selectClick);
    selectedFeats.clear();
    for (var i = 0; i < tagFeatNameCol.length; i++) {
      var featName = tagFeatNameCol[i];
      featName = featName.replace(/\s+/g, "");
      if ($("#" + featName).length > 0) {
        $("#" + featName).remove();
      }
    }

    $("#LegendTable").empty();
    $("#LegendTable").hide();
    popCol = [];
    tagFeatNameCol = [];
    DrawTxtColorArr = [];
    DrawTxtSample();
    a = 0;
    b = 0;
    DrawLineArr = [];
    $("#clearSelected").attr("disabled", true);
    $("#showInPopup").attr("disabled", true);
    $("#clearMap").attr("disabled", true);
    $("#clearAll").attr("disabled", true);
    $("#MaxFontSize").attr("disabled", false);
    $("#MinFontSize").attr("disabled", false);
    $("#SizeCal").attr("disabled", false);
  });

  // function for clearAll
  document.getElementById('clearAll').addEventListener('click', function () {
    $("#clearMap").click();
    $("#points-font").val("Arial");
    $("#points-bold").val("False");
    $("#MaxFontSize").val("60");
    $("#MinFontSize").val("6");
    $("#SizeCal").val("Linear");
    $("#points-text").val("normal");
    var checkGroup = document.getElementsByName("checkboxOri");
    angleArr = new Array(9);
    for (var c = 0; c < checkGroup.length; c++) {
      if (checkGroup[c].id == 'checkbox0') {
        checkGroup[c].checked = true;
        angleArr[0] = 0;
      } else {
        checkGroup[c].checked = false;
      }
    }
    var checkAll = document.getElementById("checkboxAll");
    checkAll.checked = false;
  });

  // function for showInPopup
  document.getElementById('showInPopup').addEventListener('click', ShowInPopup);
  function ShowInPopup() {
    if (selectedFeats.getLength() > 0) {
      var format = new ol.format.GeoJSON();
      var feat = selectedFeats.item(0);
      var tFeat = format.writeFeatureObject(feat);
      var featName = feat.get("STUSPS");
      var i = CenterPointSource.getFeatures().length;
      var bol = false;
      while (i > 0) {
        var tagFeat = CenterPointSource.getFeatures()[i - 1];
        var tagRecFeat = RecSource.getFeatures()[i - 1];
        var CountryName = tagFeat.get("belongto");
        if (CountryName == featName) {
          CenterPointSource.removeFeature(tagFeat);
          bol = true;
        }
        CountryName = tagRecFeat.get("belongto");
        if (CountryName == featName) {
          RecSource.removeFeature(tagRecFeat);
        }
        i = i - 1;
      }
      if (bol == true) {
        ViewResolution = map.getView().getResolution();
        data = [];
        var ItemData = [];
        if (jsonData.length > 0) {
          $.each(jsonData, function (index, item) {
            if (item.country == featName) {
              var pro = item.Properties;    //{Culture:{},History:{},Economy:{}}
              ItemData.push(pro);
              for (var p in pro) {
                for (var name in ItemData[0][p]) {
                  data.push([name, ItemData[0][p][name], p]);
                }
              }
              data.sort(descend);

            }
          })
        }
        var wordFont = wordPara.font.value;
        var wordWeight = wordPara.bold.value;
        var divTag = $("<div></div>");
        var divSubTag = $("<div></div>");
        var idTxt = featName;
        var newIDTxt = idTxt.replace(/\s+/g, "");
        divTag.attr("id", newIDTxt);
        divTag.css({
          position: 'relative',
          height: 300 + "px",
          width: 300 + "px",
          'background-color': "rgba(255,255,255,1)",
          //overflow:"scroll",
          'border-style': "solid",
          'border-color': "#F5F5F5",
          'border-width': 2 + "px",
          '--feature-name': idTxt
        });
        divSubTag.css({
          overflow: "scroll",
          height: divTag.width(),
          width: divTag.height()
        });

        for (var DIndex = 0; DIndex < data.length; DIndex++) {
          if (wordPara.calMethod.value == "Linear") {
            textSize = Math.round(a * data[DIndex][1] + b);
            //textSize=Math.round(a*(data[0][1]-minValue)/valueGap+b);
          } else {
            // nIndex=Math.trunc((data[DIndex][1]-minValue)/aveGap);
            // textSize=minWordSize+nIndex*aveWordSize;
            for (var nIndex in NumData) {
              if (feat.get("STUSPS") == NumData[nIndex][2] && data[DIndex][1] == NumData[nIndex][1] && data[DIndex][0] == NumData[nIndex][0]) {
                var qNum = Math.ceil(nIndex / aveNum);
                textSize = maxWordSize * Math.pow(qSize, qNum - 1);
                break;
              }
            }
          }
          textSize = Math.round(textSize * oriResolution / ViewResolution);
          var txtSpanColor = [];
          var LegendColor = $("#" + data[DIndex][2]);
          var rgbStr = LegendColor.spectrum("get").toRgbString();
          rgbStr = rgbStr.slice(4, rgbStr.length - 1);
          txtSpanColor = rgbStr.split(",");

          var bolWeight = "normal";
          if (wordWeight == "True") {
            bolWeight = "bold";
          }
          var divSpan = $("<span></span>");
          divSpan.attr("id", newIDTxt + DIndex);
          divSpan.css({
            //position:'absolute',
            //display:"inline-block",
            'vertical-align': "bottom",
            //float:"left",
            padding: 5 + "px",
            color: txtSpanColor,
            "font-weight": bolWeight,
            "font-family": wordFont,
            "font-size": textSize,
            "--topic-name": data[DIndex][2],
            "--Frequency-value": data[DIndex][1].toString()
            //border:2+"px solid #00f",
          });
          if (textSize >= minWordSize) {
            divSpan.css({
              display: "inline-block"
            });
          } else {
            divSpan.css({
              display: "none"
            });
          }
          divSpan.html(data[DIndex][0]);
          divSpan.mouseover(MouseOverTagInPopup);
          divSpan.mouseout(MouseOutTagInPopup);
          divSubTag.append(divSpan);

          spanCol.push([DIndex, idTxt, textSize, ViewResolution, data[DIndex][0], newIDTxt, data[DIndex][2]]);
          console.log(DIndex + "." + data[DIndex][0] + ":" + data[DIndex][1] + "-" + textSize);
        }
        divTag.append(divSubTag);
        var TSelectCenter = turf.centroid(tFeat);
        var ol_TSelectCenter = format.readFeature(TSelectCenter);
        var ol_TSelPoint = ol.extent.getCenter(ol_TSelectCenter.getGeometry().getExtent());
        var DrawLine;
        $("body").append(divTag);
        divTag.draggable({
          //refreshPositions:true,
          stop: function () {
            for (var l = 0; l < DrawLineArr.length; l++) {
              if (DrawLineArr[l][0] == idTxt) {
                DrawLine.setCoordinates([ol_TSelPoint, mouseCoordinate]);
                DrawLineArr.splice(l, 1, [idTxt, DrawLine]);
                break;
              }
            }
            //console.log(DrawLine.getLength());
            map.renderSync();
          }
        });
        divTag.resizable();
        divTag.resize(function () {
          divSubTag.width(divTag.width());
          divSubTag.height(divTag.height());
        });
        divTag.dblclick(DoubleClickInPopup);
        var popup = new ol.Overlay({
          position: ol_TSelPoint,
          autoPan: true,
          autoPanAnimation: {
            duration: 250
          },
          element: document.getElementById(newIDTxt)
        });
        map.addOverlay(popup);
        popCol.push([newIDTxt, idTxt, popup, tFeat]);
        DrawLine = new ol.geom.LineString([ol_TSelPoint, ol_TSelPoint]);
        DrawLineArr.push([idTxt, DrawLine]);
        //console.log(DrawLine.getLength());
        map.renderSync();
      }
    } else {
      alert("Please select a tag cloud region!");
    }
  }

  // function for clearSelected
  document.getElementById('clearSelected').addEventListener('click', function () {
    if (selectedFeats.getLength() > 0) {
      var feat = selectedFeats.item(0);
      var featName = feat.get("STUSPS");
      var newIDTxt = featName.replace(/\s+/g, "");
      if ($("#" + newIDTxt).length > 0) {
        $("#" + newIDTxt).remove();
        for (var p = 0; p < popCol.length; p++) {
          if (popCol[p][1] == featName) {
            popCol.splice(p, 1);
            break;
          }
        }
        //popCol.push([newIDTxt,idTxt,popup,tFeat]);
      } else {
        var i = CenterPointSource.getFeatures().length;
        while (i > 0) {
          var tagFeat = CenterPointSource.getFeatures()[i - 1];
          var tagRecFeat = RecSource.getFeatures()[i - 1];
          var CountryName = tagFeat.get("belongto");
          if (CountryName == featName) {
            CenterPointSource.removeFeature(tagFeat);
          }
          CountryName = tagRecFeat.get("belongto");
          if (CountryName == featName) {
            RecSource.removeFeature(tagRecFeat);
          }
          i = i - 1;
        }
      }
      for (i = 0; i < tagFeatNameCol.length; i++) {
        if (featName == tagFeatNameCol[i]) {
          tagFeatNameCol.splice(i, 1);
          break;
        }
      }
      for (var l = 0; l < DrawLineArr.length; l++) {
        if (DrawLineArr[l][0] == featName) {
          DrawLineArr.splice(l, 1);
          break;
        }
      }
      selectClick.getFeatures().clear();
      selectedFeats.clear();
      if (tagFeatNameCol.length == 0) {
        $("#LegendTable").empty();
        $("#LegendTable").hide();
        //a=0;
        //b=0;
        DrawTxtColorArr = [];
        DrawTxtSample();
        $("#MaxFontSize").attr("disabled", false);
        $("#MinFontSize").attr("disabled", false);
        $("#SizeCal").attr("disabled", false);
      }
      $("#clearSelected").attr("disabled", true);
      $("#showInPopup").attr("disabled", true);
      //$("#clearMap").attr("disabled",true);      
    } else {
      alert("Please select a tag cloud region!");
    }
  });
  //#endregion
}

function CreatLoadingLayer(feat) {
  var centerPoint = new ol.geom.Point(ol.extent.getCenter(feat.getGeometry().getExtent()));
  var centerFeat = new ol.Feature(centerPoint);
  var loadingText = "Loading......";
  var loadingTextStyle = new ol.style.Text({
    textAlign: "center",//align == '' ? undefined : align,
    textBaseline: "middle",
    font: "Bold 30px " + wordPara.font.value,
    text: loadingText,
    fill: new ol.style.Fill({ color: "#aa3300" }),
    stroke: new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value }),
  });
  var loadingStyle = new ol.style.Style({
    text: loadingTextStyle
  });
  var loadingSource = new ol.source.Vector();
  loadingSource.addFeature(centerFeat);
  var loadingLayer = new ol.layer.Vector({
    source: loadingSource,
    style: loadingStyle
  });
  //$("#Loading").show();     
  return loadingLayer;
}

function ChangeMaxSize() {
  var maxFS = parseInt(document.getElementById('MaxFontSize').value);
  var minFS = parseInt(document.getElementById('MinFontSize').value);
  if (isNaN(maxFS)) {
    alert("Please input a number larger than " + minFS + "!");
    $("#MaxFontSize").val(minFS + 1);
  }
  if (maxFS <= minFS) {
    alert("It must be larger than " + minFS + "!");
    $("#MaxFontSize").val(minFS + 1);
  }
  wordPara.maxSize = document.getElementById('MaxFontSize');
  a = 0;
  b = 0;
}

function ChangeMinSize() {
  var maxFS = parseInt(document.getElementById('MaxFontSize').value);
  var minFS = parseInt(document.getElementById('MinFontSize').value);
  if (isNaN(minFS)) {
    alert("Please input a number smaller than " + maxFS + "!");
    $("#MinFontSize").val(6);
  }
  if (minFS < 1) {
    alert("Please input a number larger than 0!");
    $("#MinFontSize").val(maxFS - 1);
  }
  if (minFS >= maxFS) {
    alert("It must be smaller than " + maxFS + "!");
    $("#MinFontSize").val(maxFS - 1);
  }
  wordPara.minSize = document.getElementById('MinFontSize');
  a = 0;
  b = 0;
}

function RefreshWordCloud() {
  DrawTxtSample();
  ViewResolution = map.getView().getResolution();
  if (ViewResolution < 192000) {     //wordPara.maxreso.value){-----------control the visual scale 
    if (selectedFeats.getLength() > 0) {
      var feat = selectedFeats.item(0);
      var featName = feat.get("STUSPS");
      //var newIDTxt=featName.replace(/\s+/g,"");
      if (CenterPointSource.getFeatures().length > 0) {
        //TriLayer.setVisible(true);
        //RecLayer.setVisible(true);
        CenterPointLayer.setVisible(true);
        for (var c = 0; c < CenterPointSource.getFeatures().length; c++) {
          var wordFeat = CenterPointSource.getFeatures()[c];
          if (wordFeat.get('belongto') == featName) {
            var wordFeatStyle = wordFeat.getStyle();
            var wordStyle = wordFeatStyle.getText();
            var wordFont = wordStyle.getFont();
            var text = wordFeat.get('name');
            if (wordPara.text.value == "shorten6") {
              text = text.trunc(6);
            } else if (wordPara.text.value == "shorten8") {
              text = text.trunc(8);
            } else if (wordPara.text.value == "shorten10") {
              text = text.trunc(10);
            }
            wordStyle.setText(text);
            var i = wordFont.indexOf("px");
            var sub = wordFont.substr(0, i);
            i = sub.indexOf(" ");
            var txtSize;
            if (i == -1) {
              txtSize = sub;
            } else {
              txtSize = sub.slice(i);
            }
            if (wordPara.bold.value == "True") {
              wordFont = "Bold" + ' ' + txtSize + "px " + wordPara.font.value;
            } else {
              wordFont = txtSize + "px " + wordPara.font.value;
            }
            if (wordPara.outlineWidth.value > 0) {
              $("#outColor").spectrum.disabled = "false";
              wordStyle.setStroke(new ol.style.Stroke({ color: wordPara.outlineColor.value, width: wordPara.outlineWidth.value }));
            } else {
              $("#outColor").spectrum.disabled = "disabled";
              wordStyle.setStroke(null);
            }
            wordStyle.setFont(wordFont);
            wordFeatStyle.setText(wordStyle);
            wordFeat.setStyle(wordFeatStyle);
          }
        }
        // 更新spanCol
        if (spanCol.length > 0) {
          for (var s = 0; s < spanCol.length; s++) {
            if (spanCol[s][1] == featName) {
              sub = spanCol[s][2];      //spanCol.push([DIndex,idTxt,textSize,ViewResolution,data[DIndex][0],newIDTxt]);
              calResol = spanCol[s][3];
              txtSize = Math.round(sub * calResol / ViewResolution);//计算新的TxtSize
              text = spanCol[s][4];
              //divSpan.html(data[labIndex][0]);
              if (wordPara.text.value == "shorten6") {
                text = text.trunc(6);
              } else if (wordPara.text.value == "shorten8") {
                text = text.trunc(8);
              } else if (wordPara.text.value == "shorten10") {
                text = text.trunc(10);
              }
              $("#" + spanCol[s][5] + spanCol[s][0]).html(text);
              $("#" + spanCol[s][5] + spanCol[s][0]).css({
                'vertical-align': "bottom",
                //float:"left",
                padding: 5 + "px",
                //color: txtSpanColor,                
                "font-family": wordPara.font.value,
                "font-size": txtSize,
                display: "inline-block",
              });
              if (wordPara.bold.value == "True") {
                $("#" + spanCol[s][5] + spanCol[s][0]).css({
                  "font-weight": "bold",
                })
              } else {
                $("#" + spanCol[s][5] + spanCol[s][0]).css({
                  "font-weight": "normal",
                })
              }
              if (wordPara.outlineWidth.value > 0) {
                $("#outColor").spectrum.disabled = "false";
                $("#" + spanCol[s][5] + spanCol[s][0]).css({
                  "-webkit-text-stroke": wordPara.outlineWidth.value + "px " + wordPara.outlineColor.value,
                });
              } else {
                $("#outColor").spectrum.disabled = "disabled";
                $("#" + spanCol[s][5] + spanCol[s][0]).css({
                  "-webkit-text-stroke": 0 + "px",
                })
              }
            }
          }
        }
        //DrawTxtSample();
      }
    }
  } else {
    //TriLayer.setVisible(false);
    //RecLayer.setVisible(false);
    CenterPointLayer.setVisible(false);
  }

}
/**
 * @param {number} n The max number of characters to keep.
 * @return {string} Truncated string.
 */
String.prototype.trunc = String.prototype.trunc ||
  function (n) {
    return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
  };

function DrawTxtSample() {
  /*var txtColor=function(){
    var r=Math.floor(Math.random()*256);
    var g=Math.floor(Math.random()*256);
    var b=Math.floor(Math.random()*256);
    return 'rgb('+r+","+g+","+b+")";
  }*/
  var txtColorArr;
  if (DrawTxtColorArr.length == 0) {
    txtColorArr = wordPara.color;
  } else {
    if (DrawTxtColorArr.length < 9) {
      var arrLength = DrawTxtColorArr.length;
      var i = 0;
      for (var c = 8; c >= arrLength; c--) {
        /*var txtColor=function(){
          var r=Math.floor(Math.random()*256);
          var g=Math.floor(Math.random()*256);
          var b=Math.floor(Math.random()*256);
          return 'rgb('+r+","+g+","+b+")";
        }
        DrawTxtColorArr.push(txtColor());*/
        DrawTxtColorArr.push(DrawTxtColorArr[i]);
        i++;
      }
    }
    txtColorArr = DrawTxtColorArr;
  }
  //var str=$("#points-rotation").find("option:selected").text();
  var txtCanvas = document.getElementById("txtCanvasID");
  var txtContext = txtCanvas.getContext('2d');
  txtContext.clearRect(0, 0, txtCanvas.width, txtCanvas.height);
  var wordFont;
  if (wordPara.bold.value == "True") {
    wordFont = "Bold 15px " + wordPara.font.value;
  } else {
    wordFont = "15px " + wordPara.font.value;
  }
  var lineWidth = wordPara.outlineWidth.value;
  var lineColor = wordPara.outlineColor.value;
  txtContext.font = wordFont;
  //var halfText=txtContext.measureText("word").width;
  txtContext.save();
  txtContext.translate(15, 35);
  txtContext.rotate(-Math.PI / 2);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[0];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(30, 37);
  txtContext.rotate(-Math.PI / 3);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[1];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(48, 35);
  txtContext.rotate(-Math.PI / 4);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[2];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(72, 35);
  txtContext.rotate(-Math.PI / 6);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[3];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 93, 35);
  txtContext.fillStyle = txtColorArr[4];
  txtContext.fillText("word", 93, 35);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(123, 18);
  txtContext.rotate(Math.PI / 6);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[5];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(151, 13);
  txtContext.rotate(Math.PI / 4);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[6];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(175, 5);
  txtContext.rotate(Math.PI / 3);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[7];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
  txtContext.save();

  txtContext.translate(210, 0);
  txtContext.rotate(Math.PI / 2);
  txtContext.strokeStyle = lineColor;
  txtContext.lineWidth = lineWidth;
  txtContext.strokeText("word", 0, 0);
  txtContext.fillStyle = txtColorArr[8];
  txtContext.fillText("word", 0, 0);
  txtContext.restore();
}

function ShowDialog() {
  $("#outColor").spectrum({
    preferredFormat: "name",
    change: function () {
      RefreshWordCloud();
    }
  });
  DrawTxtSample();
}

//#region  function for oritation selection
function SelectOrientation() {
  angleArr = new Array(9);
  bolCheck = false;
  var checkGroup = document.getElementsByName("checkboxOri");
  for (var c = 0; c < checkGroup.length; c++) {
    if (checkGroup[c].checked) {
      //angleArr.push(checkGroup[c].value)
      if (checkGroup[c].id == 'checkbox0') {
        angleArr[0] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox30') {
        angleArr[1] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox_30') {
        angleArr[2] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox45') {
        angleArr[3] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox_45') {
        angleArr[4] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox60') {
        angleArr[5] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox_60') {
        angleArr[6] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox90') {
        angleArr[7] = checkGroup[c].value;
        bolCheck = true;
      } else if (checkGroup[c].id == 'checkbox_90') {
        angleArr[8] = checkGroup[c].value;
        bolCheck = true;
      }
    } else {
      var checkAll = document.getElementById("checkboxAll");
      checkAll.checked = false;
    }
  }
}

function SelectAllOrientation() {
  var checkGroup = document.getElementsByName("checkboxOri");
  var checkAll = document.getElementById("checkboxAll");
  if (checkAll.checked == true) {
    for (var c = 0; c < checkGroup.length; c++) {
      checkGroup[c].checked = true;
    }
  } else {
    for (var c = 0; c < checkGroup.length; c++) {
      checkGroup[c].checked = false;
    }
    angleArr = new Array(9);
    var checkSel = document.getElementById("checkbox0");
    checkSel.checked = true;
    angleArr[0] = 0;
  }
  SelectOrientation();
}
//#endregion

/// function for ChangeBasemap
/// Two maps. USA and World
function ChangeBasemap() {
  $("#clearMap").click();
  a = 0.0;
  b = 0.0;
  jsonData = [];
  var basemapSelector = document.getElementById('baseMap');
  var mapName = basemapSelector.value;
  switch (basemapSelector.selectedIndex) {
    case 1:
      VectorSource = new ol.source.Vector({
        url: './data/world.geojson',
        //url:'https://openlayers.org/en/v4.4.2/examples/data/geojson/polygon-samples.geojson',
        format: new ol.format.GeoJSON()
      });
      view.setProperties({
        projection: 'EPSG:3857',
        center: [0, 0],
        resolution: worldResolution,
        zoom: 15,
        zoomFactor: 1.1
        //zoom:2,
      });
      break;
    case 2:
      VectorSource = new ol.source.Vector({
        url: './data/usa.geojson',
        //url:'https://openlayers.org/en/v4.4.2/examples/data/geojson/polygon-samples.geojson',
        format: new ol.format.GeoJSON()
      });
      view.setProperties({
        projection: 'EPSG:4326',
        center: [-120, 48],
        resolution: 0.09,
        zoom: 15,
        zoomFactor: 1.1
      });
      break;
  }
  vector.setSource(VectorSource);
  //map.setView(view);
}




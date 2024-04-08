function ClusterAnalysis(){
  ClearClusterAnalysis();
	var earthquakeFill = new ol.style.Fill({
    color: 'rgba(255, 153, 0, 0.8)'
  });
  var earthquakeStroke = new ol.style.Stroke({
    color: 'rgba(255, 204, 0, 0.2)',
    width: 1
  });
  var textFill = new ol.style.Fill({
    color: '#fff'
  });
  var textStroke = new ol.style.Stroke({
    color: 'rgba(255, 255, 255, 0.6)',
    width: 2
  });
  // var invisibleFill = new ol.style.Fill({
  //   color: 'rgba(255, 255, 255, 0.01)'
  // });  

  var maxFeatureCount, vector1,vector2,vector3,vector4,vector5;
  function calculateClusterInfo(vector,resolution) {
    maxFeatureCount = 0;
    var features = vector.getSource().getFeatures();
    var feature, radius;
    for (var i = features.length - 1; i >= 0; --i) {
      feature = features[i];
      var originalFeatures = feature.get('features');
      var extent = ol.extent.createEmpty();
      var j, jj;
      for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
        ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
      }
      maxFeatureCount = Math.max(maxFeatureCount, jj);
      radius = 0.25 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) /
          resolution; //average value of half of width and height
      feature.set('radius', radius);
    }
  }

  var currentResolution1,currentResolution2,currentResolution3,currentResolution4,currentResolution5;

  function styleFunction1(feature, resolution) {
    if (resolution != currentResolution1) {
      calculateClusterInfo(vector1,resolution);
      currentResolution1 = resolution;
    }
    var style;
    var size = feature.get('features').length;    
    if(size>1){
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: size/2,//feature.get('radius'),
          stroke:new ol.style.Stroke({
            color:'#fff'
          }),
          fill: new ol.style.Fill({
            color: [64, 64, 64,0.8]
          })
        }),
        text: new ol.style.Text({
          text: "Negative2",//size.toString(),
          font: size/2+'px Arial',
          fill: new ol.style.Fill({color: [0, 0, 0,0.2]}),//textFill,
          stroke: textStroke
        })
      });    
    }else{
      style=new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: [64, 64, 64,0.8]
          })
        })
      });      
    };    
    return style;
  }
   
    function styleFunction2(feature, resolution) {
    if (resolution != currentResolution2) {
      calculateClusterInfo(vector2,resolution);
      currentResolution2 = resolution;
    }
    var style;
    var size = feature.get('features').length;
    if(size>1){
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: size/2,//feature.get('radius'),
          stroke:new ol.style.Stroke({
            color:'#fff'
          }),
          fill: new ol.style.Fill({
            color: [64, 64, 64, 0.4]
          })
        }),
        text: new ol.style.Text({
          text: "Negative2",//size.toString(),
          font: size/2+'px Arial',
          fill: new ol.style.Fill({color: [0, 0, 0,0.4]}),//textFill,
          stroke: textStroke
        })
      })
    }else{
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: [64, 64, 64, 0.4]
          })
        })
      });
    };
    ;    
    return style;
  }

    function styleFunction3(feature, resolution) {
    if (resolution != currentResolution3) {
      calculateClusterInfo(vector3,resolution);
      currentResolution3 = resolution;
    }
    var style;
    var size = feature.get('features').length;
    if(size>1){
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: size/2,//feature.get('radius'),
          stroke:new ol.style.Stroke({
            color:'#fff'
          }),
          fill: new ol.style.Fill({
            color: [224, 224, 224, 0.8]
          })
        }),
        text: new ol.style.Text({
          text: "Neutrality",//size.toString(),
          font: size/2+'px Arial',
          fill: new ol.style.Fill({color: [0, 0, 0, 0.6]}),//textFill,
          stroke: textStroke
        })
      });    
    }else{
        style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: [224, 224, 224, 0.8]
          })
        })
      });
    };
    
    return style;
  }

    function styleFunction4(feature, resolution) {
    if (resolution != currentResolution4) {
      calculateClusterInfo(vector4,resolution);
      currentResolution4 = resolution;
    }
    var style;
    var size = feature.get('features').length;
    if(size>1){
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: size/2,//feature.get('radius'),
          stroke:new ol.style.Stroke({
            color:'#fff'
          }),
          fill: new ol.style.Fill({
            color: [243, 152, 0, 0.4]
          })
        }),
      text: new ol.style.Text({
        text: "Positive1",//size.toString(),
        font: size/2+'px Arial',
        fill: new ol.style.Fill({color: [0, 0, 0, 0.8]}),//textFill,
        stroke: textStroke
      })
    });    
    }else{
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: [243, 152, 0, 0.4]
          })
        })
      });
    };
    
    return style;
  }

    function styleFunction5(feature, resolution) {
    if (resolution != currentResolution5) {
      calculateClusterInfo(vector5,resolution);
      currentResolution5 = resolution;
    }
    var style;
    var size = feature.get('features').length;
    if(size>1){
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: size/2,//feature.get('radius'),
          stroke:new ol.style.Stroke({
            color:'#fff'
          }),
          fill: new ol.style.Fill({
            color: [243, 152, 0, 0.8]
          })
        }),
      text: new ol.style.Text({
        text: "Positive2",//size.toString(),
        font: size/2+'px Arial',
        fill: new ol.style.Fill({color: [0, 0, 0,1]}),//textFill,
        stroke: textStroke
      })
    });    
    }else{
       style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: [243, 152, 0, 0.8]
          })
        })
      });
    };
    
    return style;
  }

  // function selectStyleFunction(feature) {
  //   var styles = [new ol.style.Style({
  //     image: new ol.style.Circle({
  //       radius: feature.get('radius'),
  //       fill: invisibleFill
  //     })
  //   })];
  //   var originalFeatures = feature.get('features');
  //   var originalFeature;
  //   for (var i = originalFeatures.length - 1; i >= 0; --i) {
  //     originalFeature = originalFeatures[i];
  //     styles.push(createEarthquakeStyle(originalFeature));
  //   }
  //   return styles;
  // }

  var feats=vectorSource.getFeatures();
  var feat;
  var feats1=new Array(),feats2=new Array(),feats3=new Array(),feats4=new Array(),feats5=new Array();   //classfy all the features to 5 groups
  var arr =new Array();
  for(var i in feats){
    feat=feats[i];
    arr.push(feat.get('cartodb_id'));
  }
  //console.log(Math.min.apply(null,arr)+";"+Math.max.apply(null,arr));
  var arrMin=Math.min.apply(null,arr);
  var arrMax=Math.max.apply(null,arr);
  for(var i in feats){
    feat=feats[i];
    if(feat.get('cartodb_id')<=arrMax/5){
      feats1.push(feat);
    }else if(feat.get('cartodb_id')>arrMax/5 && feat.get('cartodb_id')<=arrMax*2/5){
      feats2.push(feat);
    }else if(feat.get('cartodb_id')>arrMax*2/5 && feat.get('cartodb_id')<=arrMax*3/5){
      feats3.push(feat);
    }else if(feat.get('cartodb_id')>arrMax*3/5 && feat.get('cartodb_id')<=arrMax*4/5){
      feats4.push(feat);
    }else{
      feats5.push(feat);
    }
  }
  vector1 = new ol.layer.Vector({
    title:"cluster",
    source: new ol.source.Cluster({
      distance: 30,
      geometryFunction:function(feature){
        return feature.getGeometry();
      },
      source: new ol.source.Vector({
         features:feats1
      })
    }),
    style: styleFunction1
  });  
  //tagmap.addLayer(vector1);
  vector2 = new ol.layer.Vector({
    title:"cluster",
    source: new ol.source.Cluster({
      distance: 30,
      geometryFunction:function(feature){
        return feature.getGeometry();
      },
      source: new ol.source.Vector({
         features:feats2
      })
    }),
    style: styleFunction2
  });  
  vector3 = new ol.layer.Vector({
    title:"cluster",
    source: new ol.source.Cluster({
      distance: 30,
      geometryFunction:function(feature){
        return feature.getGeometry();
      },
      source: new ol.source.Vector({
         features:feats3
      })
    }),
    style: styleFunction3
  });  
  vector4 = new ol.layer.Vector({
    title:"cluster",
    source: new ol.source.Cluster({
      distance: 30,
      geometryFunction:function(feature){
        return feature.getGeometry();
      },
      source: new ol.source.Vector({
         features:feats4
      })
    }),
    style: styleFunction4
  });  
  vector5 = new ol.layer.Vector({
    title:"cluster",
    source: new ol.source.Cluster({
      distance: 40,
      geometryFunction:function(feature){
        return feature.getGeometry();
      },
      source: new ol.source.Vector({
         features:feats5
      })
    }),
    style: styleFunction5
  });  
  //tagmap.addLayer(vector5);
  var tagmap = new ol.Map({
    target:'tagmap',
    layers:[vector1,vector2,vector3,vector4,vector5],
    view: map.getView()
  });
  // var SelectFeat=new ol.interaction.Select({
  //   layers:[vector],
  //   condition: function(evt) {
  //       return  evt.type == 'pointermove' ||
  //           evt.type == 'singleclick';
  //     },
  //   style: selectStyleFunction
  // })
  // map.addInteraction(SelectFeat);  

}

function ClearClusterAnalysis(){
  // var layerCol=map.getLayers();
  // var layer;
  // layerCol.forEach(function(layer,index,array){
  //   layer=array[index];
  //   var pro=layer.getProperties()
  //   if(pro.title=="cluster"){
  //     map.removeLayer(layer);
  //     return;
  //   }
  // });
  var clusterMap=document.getElementById('tagmap');
  clusterMap.innerHTML="";
}
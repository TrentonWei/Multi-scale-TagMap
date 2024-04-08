
function loadletters(){
  var iconFeatures=new Array(); 
  var json = $.getJSON("./data/JSONFile.json", function(data){
    $.each(data, function(i, field){
      //found track if the item in the JSON has coordinates or not. If yes, we will add a point on the map
      var found = false;

      //lon and lat are the variables where we are going to store the coordinates taken from the JSON item
      var lon = 0.0;
      var lat = 0.0;

      //wcwords is the variable where we are going to store the words and weights for the word cloud.
      var wcwords = "";
      var doctext = "";
      $.each(field, function(j, item){
        if(j=="Stakeholder's Info"){
          $.each(item, function(l, stakeholder){
            if(l=="Coordinates"){
              if(stakeholder!="None,None"){
                found = true;
                //this is to take the coordinates from the JSON field "Coordinates"
                var slon = stakeholder.substring(0,stakeholder.lastIndexOf(",")-3);
                lon = parseFloat(slon);
                var slat = "-"+stakeholder.substring(stakeholder.lastIndexOf(",")+1,stakeholder.length-3);
                lat = parseFloat(slat);
              }
              else{
                found = false;
              }
            }
          });
        }
        // if(j=="Doc Text"){ //"Doc Text" is the JSON field where the text of the comment is stored
        //   //this is TEMPORARY
        //   doctext = item;
        //   doctextwords = item.split(/\s+/);
        //   wcwords = doctextwords.slice(0,10).join(" ");
        //   colors = ["crimson","green","blue","purple","orange","darkcyan","salmon","goldenrod"]

        //   for(d = 0; d < dictJSON.length; d++){
        //     for(x = 0; x < dictJSON[d]["topics"].length; x++){
        //       //console.log(dictJSON[d]["topics"][x]["topic"]);
        //       doctext = doctext.replace(new RegExp('\\b' + dictJSON[d]["topics"][x]["topic"] + '\\b', 'g'),"<span class='relevantword' style='color:"+colors[d]+"'>"+dictJSON[d]["topics"][x]["topic"]+"</span>");
        //     }
        //   }

        //   doctext = "<span class='otherword'>"+doctext+"</span>";
        // }
      });
      if(found){ //if the JSON item has valid coordinates
        var n, nb=0, data=[];
        for (var k=0; k<4; k++){
          n = Math.round(8*Math.random());
          data.push(n);
          nb += n;
        }

        //madrid is the variable corresponding to the marker to add to the map
        var piechart = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([lat,lon])),
          data: data,
          size: nb
        });

        //madrid is the variable corresponding to the marker to add to the map
        var madrid = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([lat,lon]))
        });

        //this is to change the style of the madrid variable (the marker)
        madrid.setStyle(new ol.style.Style({
          /*image: new ol.style.Icon(({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                scale: 1.0,
                src: './images/doc.png'
            }))*/
            image: new ol.style.Circle({
              radius: 10,
              fill: new ol.style.Fill({
                  color: [187, 199, 200, 1]
              }),
              stroke: new ol.style.Stroke({
                  color: [0, 0, 0, 1],
                  width: 1.5
              })
            })
        }));

        //this is to create a property for the feature named wordcloud for storing the words and weights for the word cloud
        //madrid.set("wordcloud",wcwords);

        //this is to create a property for the feature named doctext for storing the entire comment labeled by the dictionary
        //piechart.set("doctext",doctext);

        //this is to add the piechart to the pie chart layer
        //pcfeatures.push(piechart);

        //this is to add the madrid feature (the marker) to the second layer
        iconFeatures.push(madrid);        
      }
    });
    return;
    //alert(iconFeatures.length);
  });  
  alert(iconFeatures.length);
  return json;
}
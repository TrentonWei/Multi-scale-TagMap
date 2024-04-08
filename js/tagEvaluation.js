//定义Tag的CenterPoint Vector 指定Source
//CenterPointSource = new ol.source.Vector();

//定义Tag的Rectangle Vector 指定Source
//RecSource = new ol.source.Vector();


//计算Tag评价的自相关系数
//CenterPoints 给定的点要素
//arrTags点要素对应的值
function getTagEv(CenterPoints, arrTags) {
    //console.log(CenterPoints);
    if (CenterPoints.length > 0) {
        Weigths = this.getPointWeight(CenterPoints);//获取权重矩阵
        //console.log(Weigths);

        //#region 计算自相关系数
        //计算Tag的平均值
        var sumTags = 0;
        for (let i = 0; i < arrTags.length; i++) {
            sumTags = arrTags[i] + sumTags;
        }
        var aveTag = sumTags / arrTags.length;
        //console.log(sumTags);
        //console.log(arrTags.length);
        //console.log(arrTags);
        //console.log(aveTag);

        //计算Tag平方差的总和
        var sumTags_W = 0;
        for (let i = 0; i < arrTags.length; i++) {
            sumTags_W = (arrTags[i] - aveTag) * (arrTags[i] - aveTag) + sumTags_W;
        }

        //计算协方差的总和
        //计算权重的总和
        var sumWeigths_IJ = 0;
        var sumWeigths_Cross = 0;
        for (let i = 0; i < arrTags.length; i++) {
            for (let j = 0; j < arrTags.length; j++) {
                sumWeigths_Cross = Weigths[i][j] * (arrTags[i] - aveTag) * (arrTags[j] - aveTag) + sumWeigths_Cross;
                sumWeigths_IJ = sumWeigths_IJ + Weigths[i][j];
            }
        }

        //计算自相关系数
        var tagEv = -(arrTags.length * sumWeigths_Cross) / (sumWeigths_IJ * sumTags_W);
        //#endregion

        return tagEv;
    }

    else {
        return null;
    }
}


//获取自相关计算的权重矩阵（按照点距离处理）{不考虑邻近关系，即所有点都认为相邻}
//CenterPoints Tag的中心
function getPointWeight(CenterPoints) {
    var options = {units: 'miles'};
    if (CenterPoints.length > 0) {
        // 创建一个包含n*n的二维数组 存储权重
        var arr = new Array(CenterPoints.length); // 第一维长度为CenterPointSource.getFeatures().length
        for (let i = 0; i < CenterPoints.length; i++) {
            arr[i] = new Array(CenterPoints.length).fill(0); // 每个元素都是一个新的一维数组，长度为CenterPointSource.getFeatures().length
        }
        //console.log(arr);

        for (let c = 0; c < CenterPoints.length; c++) {
            for (let d = c + 1; d < CenterPoints.length; d++) {
                let cacheDis = this.getDis(CenterPoints[c], CenterPoints[d],options);
                arr[c][d] = arr[d][c] = cacheDis;
            }
        }

        return arr;
    }

    else {
        return null;
    }
}

//计算两个给定点的距离
function getDis(Point1, Point2,options) {
    //console.log(Point1);
    //console.log(Point2);
    //console.log(Point1.getGeometry().getCoordinates());
    //fromPt = turf.fromLngLat(Point1.getLng(), Point1.getLat());
    //toPt = turf.fromLngLat(Point2.getLng(), Point2.getLat());
    //console.log(turf.distance(turf.point(Point1.getGeometry().getCoordinates()), turf.point(Point2.getGeometry().getCoordinates())));
    return 1 / turf.distance(Point1, Point2,options);
}

//在给定区域内随机采样
//numPoints采样点数；gPolygon区域范围
function samplePoint(numPoints, gPolygon) {
    let points = []
    for (let i = 0; i < numPoints; i++) {
        let point = turf.randomPoint(gPolygon);
        //console.log(point);
        points.push(point.features[0]);
    }

    //console.log(points);
    return points;
}

//在给定区域内规则采样
//gPolygon区域范围；cellSide尺寸；options单位如 options={units:'miles'}
function ResamplePoint(gPolygon, cellSide, Options) {
    let gridPoints = turf.pointGrid(gPolygon, cellSide, Options)
    //console.log(points);
    return gridPoints;
}

//在给定区域内规则采样
//feat区域范围；cellSide尺寸；options单位如 options={units:'miles'}
function ResamplePoint_2(tFeat, cellSide, Options) {
    let points = []
    let BBox = turf.bbox(tFeat);
    let extent = [BBox[0], BBox[1], BBox[2], BBox[3]];
    //console.log(extent);
    let gridPoints = turf.pointGrid(extent, cellSide, Options)
    //console.log(gridPoints);

    for (let i = 0; i < gridPoints.features.length; i++) {
        let centroid = turf.centroid(gridPoints.features[i]);
        if (turf.booleanPointInPolygon(centroid, tFeat.geometry))//在Polygon内的才考虑
        {
            points.push(centroid);
        }
    }
    return points;
}

//在给定区域内规则采样
//gPolygon区域范围；cellSide尺寸；options单位如 options={units:'miles'}
function ResampleGrid(gPolygon, cellSide, Options) {
    let grids = turf.squareGrid(gPolygon, cellSide, Options)
    //console.log(points);
    return grids;
}

function getDifPolygon(tagPoly, RecSource) {
    var resPoly;
    if (RecSource.getFeatures().length > 0) {
        for (let i = 0; i < RecSource.getFeatures().length; i++) {
            resPoly = turf.difference(tagPoly, RecSource.getFeatures()[i]);
        }
    }

    else {
        return tagPoly;
    }
}

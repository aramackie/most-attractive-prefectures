import standardDeviation from "./StandardDeviation.js";
import * as d3 from "d3";

const BumpChart = ({ Data, prefecturesData, hoveredPref, setHoveredPref, labels, margin, contentWidth, contentHeight, color }) => {
  const width = contentWidth + margin * 2;
  const height = contentHeight + margin * 2;

  const xScale = d3.scaleLinear()
    .domain(d3.extent(Data.children, (item) => item.year))
    .range([0, contentWidth])
    .nice();

  const selectedPrefsData = Data.children.filter((item) => {
    return prefecturesData[item.regionId].prefectures[item.prefectureId].isSelected
  });
  const yScale = d3.scaleLinear()
    .domain((selectedPrefsData.length === 0) ? [1, 47] : d3.extent(selectedPrefsData, (item) => item.rank))
    .range([0, contentHeight])
    .nice();

  const prefColors = {};
  prefecturesData.map((region) => {
    return region.prefectures.map((prefecture) => {
      return { region: region.region, prefecture: prefecture.prefecture };
    });
  }).flat().forEach((item) => {
    prefColors[item.prefecture] = color(item.region);
  })


  const dataByPref = {};
  Data.children.forEach((item) => {
    if (dataByPref[item.prefecture] === undefined) {
      dataByPref[item.prefecture] = [];
    }
    dataByPref[item.prefecture].push({ year: item.year, rank: item.rank });
  });

  const line = d3.line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.rank))


  const prefSds = {};
  prefecturesData.map((region) => region.prefectures.map((prefecture) => prefecture.prefecture)).flat().forEach((prefecture) => {
    prefSds[prefecture] = standardDeviation(dataByPref[prefecture].map((item) => item.rank));
  });

  return (
    <svg width={width} height={height} style={{ userSelect: "none" }}>
      <g transform={`translate(${margin},${10})`}>
        <g transform={`translate(0,${contentHeight})`}>
          <line x0='0' y0='0' x1={contentWidth} y1='0' stroke='black' />
          {
            xScale.ticks().map((x, i) => {
              return (
                <g key={i} transform={`translate(${xScale(x)},0)`}>
                  <line x0='0' y0='0' x1='0' y1='5' stroke='black' />
                  <text y='30' textAnchor='middle'>{x}</text>
                </g>
              )
            })
          }
          <text
            transform={`translate(${contentWidth / 2},60)`}
            textAnchor='middle'
          >
            {labels.x}
          </text>
        </g>
        <g>
          <line x0='0' y0='0' x1='0' y1={contentHeight} stroke='black' />
          {
            prefecturesData.map((region) => region.prefectures.map((prefecture) => prefecture.prefecture)).flat().map((_, i) => {
              return (
                <g
                  key={i + 1}
                  transform={`translate(0,${yScale(i + 1)})`}
                  style={{
                    transitionDuration: "1s",
                    WebkitTransition: "all 1s",
                    MozTransition: "all 1s",
                    MsTransition: "all 1s",
                    OTransition: "all 1s",
                    transition: "all 1s",
                    opacity: yScale.ticks().includes(i + 1) ? 1 : 0
                  }}
                >
                  <line x0='0' y0='0' x1='-5' y1='0' stroke='black' />
                  <line x0='0' y0='0' x1={contentWidth} y1='0' stroke='#ccc' />
                  <text x='-10' y='5' textAnchor='end'>{i + 1}</text>
                </g>
              )
            })
          }
          <text
            transform={`translate(-40,${contentHeight / 2})rotate(-90)`}
            textAnchor='middle'
          >
            {labels.y}
          </text>
        </g>
        <g>
          {
            Data.children.filter((item) => {
              return prefecturesData[item.regionId].prefectures[item.prefectureId].isSelected;
            }).map((item) => {
              return (
                <g key={item.id}>
                  <circle
                    cx={xScale(item.year)}
                    cy={yScale(item.rank)}
                    r='5'
                    fill={prefColors[item.prefecture]}
                    strokeWidth="10px"
                    stroke={(item.prefecture === hoveredPref) ? prefColors[item.prefecture] : "0"}
                    style={{ transitionDuration: '1s' }}
                    onMouseEnter={() => setHoveredPref(item.prefecture)}
                    onMouseLeave={() => setHoveredPref(null)}
                  />
                </g>
              );
            })
          }
        </g>
        <g>
          {
            prefecturesData.map((region, regionId) => {
              return region.prefectures.filter((prefecture, prefectureId) => {
                return prefecturesData[regionId].prefectures[prefectureId].isSelected
              }).map((prefecture) => {
                return prefecture.prefecture;
              });
            }).flat().map((prefecture) => {
              return (
                <g key={prefecture}>
                  <path
                    d={line(dataByPref[prefecture])}
                    stroke={prefColors[prefecture]}
                    strokeWidth={(prefecture === hoveredPref) ? "8px" : "3px"}
                    fill="none"
                    style={{ transitionDuration: '1s' }}
                    strokeDasharray={prefSds[prefecture] * 1.5}
                    onMouseEnter={() => setHoveredPref(prefecture)}
                    onMouseLeave={() => setHoveredPref(null)}
                  >
                  </path>
                  <path
                    d={line(dataByPref[prefecture])}
                    stroke={prefColors[prefecture]}
                    strokeWidth="8px"
                    strokeOpacity="0"
                    fill="none"
                    style={{ transitionDuration: '1s' }}
                    onMouseEnter={() => setHoveredPref(prefecture)}
                    onMouseLeave={() => setHoveredPref(null)}
                  >
                  </path>
                </g>
              );
              dataByPref[prefecture];

            })
          }
        </g>
      </g>
    </svg >
  );
};

export default BumpChart;
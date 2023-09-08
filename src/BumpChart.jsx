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
      <clipPath id="clip01">
        <rect x="-110" y="-10" width={contentWidth + 130} height={contentHeight + 20} />
      </clipPath>
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
                <g key={i + 1} clipPath="url(#clip01)" >
                  <g
                    transform={`translate(0,${yScale(i + 1)})`}
                    style={{
                      transitionDuration: '1s',
                      opacity: yScale.ticks().includes(i + 1) ? 1 : 0
                    }}
                  >
                    <line x0='0' y0='0' x1={contentWidth} y1='0' stroke='#ccc' />
                    <line x0='0' y0='0' x1='-5' y1='0' stroke='black' />
                    <text x='-10' y='5' textAnchor='end'>{i + 1}</text>
                  </g>
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
        <g clipPath="url(#clip01)">
          {
            prefecturesData.map((region) => {
              return region.prefectures.map((prefecture) => {
                return prefecture.ranks.map((item) => {
                  return (
                    <g key={item.id}>
                      <circle
                        cx={xScale(item.year)}
                        cy={yScale(item.rank)}
                        r='5'
                        fill={(prefecture.isSelected) ? prefColors[prefecture.prefecture] : "none"}
                        strokeWidth="10px"
                        stroke={(prefecture.prefecture === hoveredPref && prefecture.isSelected) ? prefColors[prefecture.prefecture] : "0"}
                        style={{ transitionDuration: '1s' }}
                        onMouseEnter={() => setHoveredPref(prefecture.isSelected ? prefecture.prefecture : null)}
                        onMouseLeave={() => setHoveredPref(null)}
                      />
                    </g>
                  );
                });
              });
            })
          }
        </g>
        <g clipPath="url(#clip01)">
          {
            prefecturesData.map((region) => {
              return region.prefectures.map((prefecture) => {
                return (
                  <g key={prefecture.prefecture}>
                    <path
                      d={line(prefecture.ranks)}
                      stroke={(prefecture.isSelected) ? prefColors[prefecture.prefecture] : "none"}
                      strokeWidth={(prefecture.prefecture === hoveredPref) ? "8px" : "3px"}
                      fill="none"
                      style={{ transitionDuration: '1s' }}
                      strokeDasharray={prefSds[prefecture.prefecture] * 1.5}
                      onMouseEnter={() => setHoveredPref(prefecture.isSelected ? prefecture.prefecture : null)}
                      onMouseLeave={() => setHoveredPref(null)}
                    >
                    </path>
                    <path
                      d={line(prefecture.ranks)}
                      stroke={prefColors[prefecture.prefecture]}
                      strokeWidth="8px"
                      strokeOpacity="0"
                      fill="none"
                      style={{ transitionDuration: '1s' }}
                      onMouseEnter={() => setHoveredPref(prefecture.isSelected ? prefecture.prefecture : null)}
                      onMouseLeave={() => setHoveredPref(null)}
                    >
                    </path>
                  </g>
                );
              });
            })
          }
        </g>
      </g>
    </svg >
  );
};

export default BumpChart;
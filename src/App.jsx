import Data from "./Most_Attractive_Prefectures.json";
import * as d3 from "d3";
import { useEffect, useState, useRef } from "react";

const BumpChart = ({ prefecturesData, hoveredPref, setHoveredPref, labels, margin, contentWidth, contentHeight, color }) => {
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

const BulkSelecter = ({ prefecturesData, setPrefecturesData }) => {
  const handleBulkSelected = (isSelected) => {
    setPrefecturesData(prefecturesData.map((region) => {
      return {
        region: region.region,
        prefectures: region.prefectures.map((prefecture) => {
          return {
            prefecture: prefecture.prefecture,
            isSelected: isSelected
          }
        })
      }
    }));
  };

  return (
    <div className="tags" style={{ justifyContent: "flex-end" }}>
      全都道府県の選択
      <button type="button" className="button" style={{ marginLeft: "10px" }} onClick={() => handleBulkSelected(true)}>ON</button>
      <button type="button" className="button" style={{ marginLeft: "10px" }} onClick={() => handleBulkSelected(false)}>OFF</button>
    </div>
  );
};

const Selecter = ({ prefecturesData, setPrefecturesData, hoveredPref, setHoveredPref, color }) => {
  return (
    <ul style={{ marginTop: "0" }}>
      {
        prefecturesData.map((item, i) => {
          return (
            <div key={i} style={{ backgroundColor: color(item.region), borderRadius: "4px" }}>
              <label className="checkbox" key={i} style={{ userSelect: "none" }}>
                <span className="tag is-black" style={{ margin: "4px" }}>
                  <input
                    type="checkbox"
                    name={item.region}
                    regionid={i}
                    checked={item.prefectures.some((prefecture) => prefecture.isSelected)}
                    style={{ marginRight: "8px" }}
                    onChange={(e) => {
                      setPrefecturesData(prefecturesData.map((region, regionId) => {
                        if (regionId == e.target.attributes.getNamedItem('regionid').value) {
                          return {
                            region: region.region,
                            prefectures: region.prefectures.map((prefecture) => (
                              { ...prefecture, isSelected: e.target.checked }
                            ))
                          }
                        } else {
                          return region;
                        }
                      }));
                    }}
                  />
                  {item.region}
                </span>
              </label>
              <PrefectureSelecter
                prefecturesData={prefecturesData}
                setPrefecturesData={setPrefecturesData}
                regionId={i}
                hoveredPref={hoveredPref}
                setHoveredPref={setHoveredPref}
              />
            </div>
          );
        })
      }
    </ul>
  );
};

const PrefectureSelecter = ({ prefecturesData, setPrefecturesData, regionId, hoveredPref, setHoveredPref }) => {
  return (
    <ul style={{ marginTop: "2px", marginBottom: "10px" }}>
      {
        prefecturesData[regionId].prefectures.map((item, i) => {
          return (
            <label
              className="checkbox"
              key={i}
              onMouseEnter={() => setHoveredPref(item.prefecture)}
              onMouseLeave={() => setHoveredPref(null)}
              style={{ margin: "4px", userSelect: "none" }}
            >
              <span
                className="tag"
                style={{
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: (item.prefecture === hoveredPref) ? "rgb(0, 0, 0)" : "rgb(245, 245, 245)",
                  backgroundColor: (item.prefecture === hoveredPref) ? "rgb(200, 200, 200)" : "rgb(245, 245, 245)",
                }}
              >
                <input
                  type="checkbox"
                  name={item.prefecture}
                  regionid={regionId}
                  prefectureid={i}
                  checked={item.isSelected}
                  style={{ marginRight: "8px" }}
                  onChange={(e) => {
                    setPrefecturesData(prefecturesData.map((region, regionId) => (
                      {
                        region: region.region,
                        prefectures: region.prefectures.map((prefecture, prefectureId) => {
                          return (
                            regionId == e.target.attributes.getNamedItem('regionid').value
                            && prefectureId == e.target.attributes.getNamedItem('prefectureid').value) ?
                            { ...prefecture, isSelected: !prefecture.isSelected }
                            : prefecture
                        })
                      }
                    )));
                  }}
                />
                {item.prefecture}
              </span>
            </label>
          );
        })
      }
    </ul>
  );
};

const App = () => {
  const labels = {
    x: '年',
    y: 'ランキング'
  }
  const defaultSelectedPrefs = ["茨城県", "福井県", "鳥取県", "徳島県", "佐賀県"];
  const [prefecturesData, setPrefecturesData] = useState([]);
  const [hoveredPref, setHoveredPref] = useState(null);

  useEffect(() => {
    Data.children.forEach((item, i) => {
      item["id"] = i
    });
    const regions = Array.from(new Set(Data.children.map((item) => item.region)));

    const preformattedData = regions.map((region) => ({ region: region, prefectures: [] }));
    const regionNums = new Map(regions.map((item, idx) => [item, idx]));
    const prefectures = new Map(Data.children.map((item) => [item.prefecture, item.region]));
    const prefectureNums = new Map();
    Array.from(prefectures.entries()).forEach((item) => {
      preformattedData[regionNums.get(item[1])].prefectures.push(
        {
          prefecture: item[0],
          isSelected: defaultSelectedPrefs.includes(item[0])
        }
      );
      prefectureNums.set(item[0], preformattedData[regionNums.get(item[1])].prefectures.length - 1);
    });
    setPrefecturesData(preformattedData);

    Data.children.forEach((item) => {
      item["regionId"] = regionNums.get(item.region);
      item["prefectureId"] = prefectureNums.get(item.prefecture);
    });
  }, []);

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  prefecturesData.forEach((region) => color(region));

  if (prefecturesData.length === 0) {
    return (<></>);
  }

  return (
    <div>
      <div className='content'>
        <header className="hero is-dark is-bold">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">都道府県魅力度ランキング</h1>
            </div>
          </div>
        </header>
        <section className="section">
          <div className="container" style={{ display: "flex" }}>
            <div>
              <BumpChart
                prefecturesData={prefecturesData}
                hoveredPref={hoveredPref}
                setHoveredPref={setHoveredPref}
                labels={labels}
                margin={60}
                contentWidth={600}
                contentHeight={500}
                color={color}
              />
            </div>
            <div>
              <div className="control">
                <Selecter
                  prefecturesData={prefecturesData}
                  setPrefecturesData={setPrefecturesData}
                  hoveredPref={hoveredPref}
                  setHoveredPref={setHoveredPref}
                  color={color}
                />
                <BulkSelecter
                  prefecturesData={prefecturesData}
                  setPrefecturesData={setPrefecturesData}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const standardDeviation = (data) => {
  const average = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = sum + data[i];
    }
    return (sum / data.length);
  }

  const variance = (data) => {
    let ave = average(data);
    let varia = 0;
    for (let i = 0; i < data.length; i++) {
      varia = varia + Math.pow(data[i] - ave, 2);
    }
    return (varia / data.length);
  }

  let varia = variance(data);
  return Math.sqrt(varia);
}

export default App;
import BumpChart from "./BumpChart";
import { BulkSelecter, Selecter } from "./Selecter";

import Data from "./Most_Attractive_Prefectures.json";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

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
    Data.children.map((item) => {
      const pref = preformattedData[regionNums.get(item.region)].prefectures[prefectureNums.get(item.prefecture)];
      if (pref.ranks === undefined) {
        pref.ranks = [];
      }
      pref.ranks.push({ year: item.year, rank: item.rank, id: item.id });
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
                Data={Data}
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

export default App;
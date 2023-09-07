export const BulkSelecter = ({ prefecturesData, setPrefecturesData }) => {
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

export const Selecter = ({ prefecturesData, setPrefecturesData, hoveredPref, setHoveredPref, color }) => {
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
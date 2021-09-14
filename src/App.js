import './App.css';
import React, { useState } from 'react';


function App() {

  const [tableData, setTableData] = useState(<tr><td>No data to show.</td></tr>);

  function handleButtonClick() {
    getPoolData()
      .then((poolsMetadata) => {
        setTableData(formatTable(poolsMetadata));
      });  
  }

  function formatTable(JSONDataArray) {
    return JSONDataArray.map((dataRow) => {
      console.log(dataRow);
      return <tr><td>{dataRow.ticker}</td><td>{dataRow.name}</td></tr>
    })

  }


  async function getPoolData(page = 1) {
    let poolIds = await blockfrost({endpoint: "pools"});
    let poolPrimaryData = await Promise.all(poolIds.map(async (pool_id) => {
      let poolData = await blockfrost({endpoint: "specificPool", pool_id, page});
      return poolData;
    }));
    let poolMetadata = await Promise.all(poolIds.map(async (pool_id) => {
      let poolData = await blockfrost({endpoint: "specificPoolMetadata", pool_id, page});
      return poolData;
    }));
    let poolNextPage = {};
    if(poolPrimaryData.length < 100) {
      poolNextPage = await getPoolData(2); // Dirty bit of recursion
    }
    console.log(poolNextPage);
    return {...poolPrimaryData, ...poolMetadata};
  }


  async function blockfrost(dataToFetch) {
    if(!dataToFetch) {
      console.warn("No object provided")
      return null;
    }

    try {
      switch(dataToFetch.endpoint) {
        case "pools":
          return await fetch("https://cardano-mainnet.blockfrost.io/api/v0/pools",
                                        {headers: {project_id: '9g7w0nXfq33EqODWz3U2Ffzyryn1HuIi'}})
                                    .then(response => response.json());

        case "specificPool":
          if(!dataToFetch.pool_id) return;
            return await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/pools/` + dataToFetch.pool_id + "/" (dataToFetch.page ?? ""),
                                          {headers: {project_id: '9g7w0nXfq33EqODWz3U2Ffzyryn1HuIi'}})
                                      .then(response => response.json());


        case "specificPoolMetadata":
          if(!dataToFetch.pool_id) return;
          return await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/pools/` + dataToFetch.pool_id + "/metadata/" + (dataToFetch.page ?? ""),
                                        {headers: {project_id: '9g7w0nXfq33EqODWz3U2Ffzyryn1HuIi'}})
                                    .then(response => response.json());
        default:
          console.warn("No endpoint specified.")
      }
    } catch(err) {
      console.error(err);
      return {error: "ERROR - Check Console!"}
    }
  }

  return (
    <>
      <table>{tableData}</table>
      <button onClick={handleButtonClick}>Dis a button.</button>
    </>
  );
}

export default App;

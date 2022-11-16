import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Row from './Row';

import '../styles/index.scss';
import { prettyLog } from '../util/prettyLog';
import { algoChoices } from '../util/algoChoices';
import chooseGrid from '../util/chooseGrid';

const metaStarter = () => {
  return {
    current: ``,
    potential: ``,
    visited: new Set(),
    discovered: new Set(),
  };
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const App = () => {
  // set vars
  const [customAlgoString, setCustomAlgoString] = useState<string>(
    'alert("Custom function executed!");'
  );
  const [algoChoice, setAlgoChoice] = useState<string>('forfor');
  const [algoDesc, setAlgoDesc] = useState<string>('');
  const [gridChoice, setGridChoice] = useState<string>('maze');
  const [currentGrid, setCurrentGrid] = useState<any>([[]]);
  const [currentAlgo, setCurrentAlgo] = useState<any>(false);
  const [algoRunning, setAlgoRunning] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<number[]>([0, 0]);
  const [endPoint, setEndPoint] = useState<number[]>([0, 0]);
  const [endPointStatus, setEndPointStatus] = useState<boolean>(false);
  const [delay, setDelay] = useState<number>(10);
  const [meta, setMeta] = useState<any>(metaStarter());

  useEffect(() => {
    setCurrentGrid(chooseGrid(gridChoice));
  }, [gridChoice]);

  useEffect(() => {
    let func: Function,
      desc: string = 'Custom Function!',
      endPoint: boolean = true;

    if (algoChoice === 'custom') func = buildAlgo(customAlgoString);
    else ({ func, desc, endPoint } = algoChoices[algoChoice]);

    setCurrentAlgo(() => func);
    setAlgoDesc(desc);
    setEndPointStatus(endPoint);
  }, [algoChoice]);

  useEffect(() => {
    if (endPointStatus) {
      setEndPoint([currentGrid.length - 1, currentGrid[0].length - 1]);
    }
  }, [currentGrid, endPointStatus]);

  useEffect(() => {
    setMeta(() => metaStarter());
  }, [currentGrid]);

  useEffect(() => {
    console.log('algoRunning changed! is now', algoRunning);
    if (algoRunning && currentAlgo) runAlgo();
    else setAlgoRunning(false);
  }, [algoRunning]);

  const updateGrid = async (e: any, row: number, col: number) => {
    const newValue =
      Number(e.target.value) !== Number(e.target.value) ||
      e.target.value !== '0'
        ? e.target.value
        : Number(e.target.value);
    setCurrentGrid((grid: any) => {
      const gridClone = [...grid];
      console.log(gridClone);
      gridClone[row][col] = newValue;
      return [...gridClone];
    });
  };

  /**
   *
   * @param newMeta object with new values for meta state. Sets will use the .add method.
   * @param ms Milliseconds to delay after updating screen.
   */
  const updateScreen = async (newMeta: any, ms: number = delay) => {
    setMeta((meta: any) => {
      const tempObj = { ...meta };
      if (newMeta.visited !== undefined)
        tempObj.visited = meta.visited.add(newMeta.visited);
      if (newMeta.discovered !== undefined)
        tempObj.discovered = meta.discovered.add(newMeta.discovered);
      if (newMeta.potential !== undefined)
        tempObj.potential = newMeta.potential;
      if (newMeta.current !== undefined) tempObj.current = newMeta.current;
      return tempObj;
    });
    if (newMeta.grid !== undefined) {
      console.log(newMeta.grid);
      await updateGrid(
        { target: { value: newMeta.grid[2] } },
        newMeta.grid[0],
        newMeta.grid[1]
      );
    }
    await sleep(ms);
  };

  /**
   * Invoke currentAlgo function and provide it with params from current state
   */
  const runAlgo = async () => {
    setMeta(() => metaStarter());
    await sleep(100);
    currentAlgo(
      currentGrid,
      startPoint,
      endPointStatus && endPoint,
      updateScreen,
      setAlgoRunning
    );
  };

  const handleAlgoSelect = (e: any) => {
    setAlgoChoice(e.target.value);
  };

  const handleGridSelect = (e: any) => {
    setGridChoice(e.target.value);
  };

  const handleCustomFuncChange = (e: any) => {
    setCustomAlgoString(e.target.value);
  };

  /**
   *
   * Updates currentAlgo with a func generated from user input.
   *
   * Takes user's input and wraps it in a function that returns an async function.
   *
   * We generate the outer function, then invoke it and pass the returned async function as the new currentAlgo.
   */
  const buildAlgo = (algoString: string) => {
    console.log(algoString);
    const newFunc = new Function(
      'grid, start=[1,3], updateScreen, shutOff',
      `
      return async (grid, start, end, updateScreen, shutOff) => { 
        ${algoString} \n 
        shutOff(false);
      }`
    );
    const asyncFunc = newFunc();
    return asyncFunc;
  };

  return (
    <div id='Main'>
      <h1>Welcome to Graphsy!</h1>
      <Routes>
        <Route
          path='/'
          element={
            <div id='main2'>
              <div className='panel'>
                <button onClick={() => setAlgoRunning(true)}>
                  Run Algorithm
                </button>

                <div id='options'>
                  <label>Set Delay (ms)</label>
                  <select
                    defaultValue={10}
                    onChange={(e) => {
                      setDelay(Number(e.target.value));
                    }}
                  >
                    <option>10</option>
                    <option>50</option>
                    <option>100</option>
                    <option>200</option>
                    <option>500</option>
                    <option>800</option>
                    <option>1000</option>
                    <option>2000</option>
                  </select>

                  <div className='coordinate-set'>
                    <label>Start</label>
                    <div className='coordinate'>
                      <label>Row</label>
                      <input
                        type={'text'}
                        defaultValue={startPoint[0]}
                        onChange={(e) => {
                          setStartPoint((current) => [
                            Number(e.target.value),
                            current[1],
                          ]);
                        }}
                      ></input>
                    </div>

                    <div className='coordinate'>
                      <label>Column</label>
                      <input
                        type={'text'}
                        defaultValue={startPoint[1]}
                        onChange={(e) => {
                          setStartPoint((current) => [
                            current[0],
                            Number(e.target.value),
                          ]);
                        }}
                      ></input>
                    </div>
                  </div>

                  {endPointStatus && (
                    <div className='coordinate-set'>
                      <label>End</label>
                      <div className='coordinate'>
                        <label>Row</label>
                        <input
                          type={'text'}
                          value={endPoint[0]}
                          onChange={(e) => {
                            setEndPoint((current) => [
                              Number(e.target.value),
                              current[1],
                            ]);
                          }}
                        ></input>
                      </div>

                      <div className='coordinate'>
                        <label>Column</label>
                        <input
                          type={'text'}
                          value={endPoint[1]}
                          onChange={(e) => {
                            setEndPoint((current) => [
                              current[0],
                              Number(e.target.value),
                            ]);
                          }}
                        ></input>
                      </div>
                    </div>
                  )}

                  <label>Select Grid *</label>
                  <select onChange={handleGridSelect} value={gridChoice}>
                    <option>anchor</option>
                    <option>grid1</option>
                    <option>bigEmpty</option>
                    <option>partitions</option>
                    <option>maze</option>
                  </select>

                  <label>Select Algorithm *</label>
                  <select onChange={handleAlgoSelect} value={algoChoice}>
                    {Object.keys(algoChoices).map((el: any, i: number) => {
                      return <option key={i}>{el}</option>;
                    })}
                    <option>custom</option>
                  </select>

                  <label>Algo Description:</label>
                  <span className='elaboration'>{algoDesc}</span>

                  <label>Custom Algorithm</label>
                  <span className='elaboration'>
                    {
                      'updateScreen options: current, potential, visited, discovered.'
                    }
                  </span>
                  <span className='elaboration'>
                    {'All options receive a string of "r.c".'}
                  </span>
                  <span className='elaboration mono'>
                    {'async (grid, startPoint, endPoint, updateScreen) => { '}
                  </span>
                  <textarea
                    onChange={handleCustomFuncChange}
                    value={customAlgoString}
                  ></textarea>
                </div>
              </div>
              <div id='grid'>
                {currentGrid.map((el: any, i: number) => {
                  return (
                    <Row
                      key={i}
                      row={i}
                      cells={el}
                      meta={meta}
                      updateGrid={updateGrid}
                    ></Row>
                  );
                })}
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};
export default App;

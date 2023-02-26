import { useState, useRef, useContext, createContext } from 'react';
import { useEffect } from 'react';
import { Editor } from './layout_maker/Editor';
import { createTableData, alertInfoPrompt } from '../util';

/**
 * Hook that alerts clicks outside of the passed ref
 */

let defaultTableData = createTableData(12, 12);

export const tableDataContext = createContext(null);

function App() {
  const [tableData, setTableData] = useState(defaultTableData);

  return (
    <div className='App text-unselectable'>
      <header className='App-header'>
        <span className='side-menu-container'>
          <button onClickCapture={alertInfoPrompt}>Info</button>
        </span>

        <tableDataContext.Provider value={{ tableData, setTableData }}>
          <Editor />
        </tableDataContext.Provider>
      </header>
    </div>
  );
}

export default App;

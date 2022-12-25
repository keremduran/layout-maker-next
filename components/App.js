import { useState, useRef, useContext, createContext } from 'react';
import { useEffect } from 'react';
import { Editor } from '../components/Editor';
import {
  createTableData,
  capitalizeFirstLetter,
  getCell,
  handleSetSelectedValues,
  deepCopy,
  alertInfoPrompt,
  borderStyleNames,
} from '../util';

import { useContextMenu } from '../hooks';

/**
 * Hook that alerts clicks outside of the passed ref
 */

let defaultTableData = createTableData(6, 6);

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

export const Table = ({ props }) => {
  const { tableData } = props;
  const table = [];

  tableData.rows.forEach((rowData, i) => {
    const row = [];

    rowData.cells.forEach((cell, j) => {
      cell.location = { i, j };
      row.push(<Cell key={`${i},${j}`} props={cell} />);
    });

    table.push(
      <Row key={`${i}`} row={tableData.rows[i]}>
        {row}
      </Row>
    );
  });
  return (
    <table
      cellSpacing={
        tableData.attributes.cellSpacing ? tableData.attributes.cellSpacing : 0
      }
      style={{ ...tableData.styles }}
    >
      <tbody>{table}</tbody>
    </table>
  );
};

const Row = ({ children, row }) => {
  return <tr style={{ ...row.styles }}>{children}</tr>;
};

const Cell = ({ props }) => {
  let { location, styles, attributes, children } = props;
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const [cellText, setCellText] = useState(children[0].text);
  const [cellHtml, setCellHtml] = useState(children[0].html);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    i: 0,
    j: 0,
  });
  const { tableData, setTableData } = useContext(tableDataContext);
  const [selected, setSelected] = useState(false);
  const { editTextMode } = tableData.events;

  const handleRightClick = (e) => {
    e.preventDefault();
    setContextMenuVisible(true);
    setContextMenuPosition({ i: e.clientX, j: e.clientY });
  };

  useEffect(() => {
    const { selectedCells } = tableData;

    const { i, j } = location;
    const flatLocation = i + '-' + j;

    const isSelected =
      selectedCells && selectedCells.indexOf(flatLocation) !== -1;

    setSelected(isSelected);
  }, [tableData.selectedCells]);

  useEffect(() => {
    let currentCellText = '';
    let currentCellHtml = '';

    children.forEach((child) => {
      currentCellText += child.text;
      currentCellHtml += child.html;
    });

    setCellText(currentCellText);
    setCellHtml(currentCellHtml);
  }, [children]);

  const handleEditText = (e) => {
    let html = e.currentTarget.innerHTML;
    let text = e.currentTarget.textContent;
    const { i, j } = location;
    const children = tableData.rows[i].cells[j].children;
    children[0].html = html;
    children[0].text = text;
    //setTableData({ ...tableData });
  };

  const handleSelectCell = (e) => {
    if (e.button !== 0 || contextMenuVisible) return;
    setSelected((selected) => !selected);

    let selectedCells = tableData['selectedCells'];
    if (!selectedCells) selectedCells = [];

    const { i, j } = location;
    const locationValue = i + '-' + j;
    const foundIndex = selectedCells.indexOf(locationValue);

    if (!selected) selectedCells.push(locationValue);
    else selectedCells.splice(foundIndex, 1);

    setTableData({ ...tableData, selectedCells });
  };

  const handleSelect = (e) => {
    if (!tableData.events.editTextMode) handleSelectCell(e);
  };

  return (
    <td
      className={selected ? 'selected' : null}
      style={{ ...styles }}
      onMouseDownCapture={handleSelect}
      onContextMenu={!editTextMode ? handleRightClick : undefined}
      {...attributes}
    >
      <div
        className='cell-text'
        contentEditable={editTextMode}
        onInputCapture={handleEditText}
        dangerouslySetInnerHTML={{ __html: cellHtml }}
        style={!editTextMode ? { opacity: 0.5 } : null}
      ></div>

      {contextMenuVisible && (
        <ContextMenu
          props={{
            setContextMenuVisible,
            styles,
            location,
            contextMenuPosition,
          }}
        />
      )}
    </td>
  );
};

const ContextMenu = ({ props }) => {
  const { tableData, setTableData } = useContext(tableDataContext);

  const contextMenuRef = useRef(null);

  const { setContextMenuVisible, contextMenuPosition } = props;

  let contextMenuStyle = {
    left: contextMenuPosition.i,
    top: contextMenuPosition.j,
  };

  const handleBoldText = () => {
    if (tableData.selectedCells.length > 0) {
      tableData.selectedCells.forEach((flatLocation) => {
        const [i, j] = flatLocation.split('-');
        boldText({ i, j });
      });
    } else boldText();
  };

  const boldText = ({ i, j } = props.location) => {
    const { children } = tableData.rows[i].cells[j];
    const newChildren = [];

    function removeBTags(htmlString) {
      return htmlString.replace(/<b>|<\/b>/g, '');
    }

    let cleanedHtml = removeBTags(children[0].html);

    const html = `<b>${cleanedHtml}</b>`;

    newChildren[0] = { html, text: children[0].text };
    tableData.rows[i].cells[j].children = newChildren;
    setTableData({ ...tableData });
  };

  useContextMenu(contextMenuRef, setContextMenuVisible);

  return (
    <div
      ref={contextMenuRef}
      style={{ ...contextMenuStyle }}
      className='context-menu'
    >
      <span className='quick-access'>
        <h3>Quick Access</h3>
        <SelectCells {...props} />
        <button onClick={handleBoldText}>Set Bold</button>
      </span>
      {tableData.selectedCells?.length > 0 && (
        <details>
          <summary>Selection</summary>
          <EditSelection />
          <EditSelectedCellBorders />
          <EditSelectedCellPaddings />
          <EditSelectedAlignments />
          <EditSelectedFontSizes />
        </details>
      )}
      <details>
        <summary>Table</summary>
        <EditTable />
        <SelectCells {...props} />
      </details>
      <details>
        <summary>Column</summary>
        <EditColumn props={props} />
      </details>
      <details>
        <summary>Row</summary>
        <EditRow props={props} />
      </details>
      <details>
        <summary>Cell</summary>
        <EditCellBorders props={props} />
        <EditPaddings props={props} />
        <EditSizes props={props} />
        <Insert {...props} />
        <EditAlignments {...props} />
        <EditFontSize {...props} />
      </details>
    </div>
  );
};

const SelectCells = ({ location }) => {
  const { tableData, setTableData } = useContext(tableDataContext);

  let selectedCells = tableData.selectedCells
    ? [...tableData.selectedCells]
    : [];

  const { i, j } = location;

  const selectRow = (row = tableData.rows[i]) => {
    row.cells.forEach(({ location }) => {
      const { i, j } = location;
      const flatLocation = i + '-' + j;
      const cellIsSelected = selectedCells.indexOf(flatLocation) !== -1;
      if (!cellIsSelected) selectedCells.push(i + '-' + j);
    });

    setTableData({ ...tableData, selectedCells });
  };

  const unSelectRow = (row = tableData.rows[i]) => {
    row.cells.forEach(({ location }) => {
      const { i, j } = location;
      const index = selectedCells.indexOf(i + '-' + j);
      if (index !== -1) selectedCells.splice(index, 1);
    });

    setTableData({ ...tableData, selectedCells });
  };

  const selectCol = (row = tableData.rows[i]) => {
    row.cells.forEach(({ location }) => {
      const { i, j: currentJ } = location;
      if (j !== currentJ) return;

      const flatLocation = i + '-' + currentJ;
      const cellIsSelected = selectedCells.indexOf(flatLocation) !== -1;
      if (!cellIsSelected) selectedCells.push(i + '-' + currentJ);
    });

    setTableData({ ...tableData, selectedCells });
  };

  const unSelectCol = (row = tableData.rows[i]) => {
    row.cells.forEach(({ location }) => {
      const { i, j: colJ } = location;
      if (j !== colJ) return;
      const index = selectedCells.indexOf(i + '-' + colJ);
      if (index !== -1) selectedCells.splice(index, 1);
    });

    setTableData({ ...tableData, selectedCells });
  };

  const handleSelectTable = () => tableData.rows.forEach(selectRow);
  const handleUnSelectTable = () => tableData.rows.forEach(unSelectRow);
  const handleSelectCol = () => tableData.rows.forEach(selectCol);
  const handleUnselectCol = () => tableData.rows.forEach(unSelectCol);
  const handleSelectRow = () => selectRow();
  const handleUnselectRow = () => unSelectRow();

  const SelectCellsOptions = [
    { name: 'Select Table', action: handleSelectTable },
    { name: 'Unselect Table', action: handleUnSelectTable },
    { name: 'Select Row', action: handleSelectRow },
    { name: 'Unselect Row', action: handleUnselectRow },
    { name: 'Select Column', action: handleSelectCol },
    { name: 'Unselect Col', action: handleUnselectCol },
  ];

  return (
    <div>
      <h3>Select Cells</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(2, 3rem)`,
        }}
      >
        {SelectCellsOptions.map(({ action, name }, index) => {
          return (
            <span key={`InputElement${index}`}>
              <button onClick={action}>{name}</button>
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Insert = ({ location }) => {
  const insertStyleNames = ['table'];
  const { tableData, setTableData } = useContext(tableDataContext);
  const [tableDimensions, setTableDimensions] = useState({ rows: 3, cols: 3 });
  const { i, j } = location;

  const handleInsertTable = () => {
    const children = tableData.rows[i].cells[j].children;
    console.log(children);
    const { rows, cols } = tableDimensions;
    const insertTableData = createTableData(rows, cols);
    const newTable = <Table props={{ tableData: insertTableData }} />;
    children.push(newTable);
    setTableData({ ...tableData });
  };

  const handleSetTableRows = (e) => {
    tableDimensions.rows = e.target.value;
    setTableDimensions({ ...tableDimensions });
  };

  const handleSetTableCols = (e) => {
    tableDimensions.cols = e.target.value;
    setTableDimensions({ ...tableDimensions });
  };

  return (
    <div>
      <h3>Insert</h3>
      <div className='context-menu-input-elements'>
        {insertStyleNames.map((styleName, index) => {
          return (
            <span key={`InputElement${index}`}>
              {styleName === 'table' && (
                <span>
                  <label htmlFor='cols'>Cols</label>
                  <input
                    type='number'
                    name={'cols'}
                    value={tableDimensions.cols}
                    onChange={handleSetTableCols}
                  />

                  <label htmlFor='rows'>Rows</label>
                  <input
                    type='number'
                    name={'rows'}
                    value={tableDimensions.rows}
                    onChange={handleSetTableRows}
                  />
                  <button disabled={false} onClick={handleInsertTable}>
                    Insert Table {`(under contruction)`}
                  </button>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditSelection = () => {
  const selectionStyleNames = [
    'width',
    'height',
    'allBorders',
    'currentBorders',
    'outerBorders',
    'innerBorders',
    'mergeCells',
  ];

  let { tableData, setTableData } = useContext(tableDataContext);

  const selectedCells = tableData.selectedCells
    .sort((a, b) => a.replace('-', '') - b.replace('-', ''))
    .map((selectedCell) => {
      const i = Number(selectedCell.split('-')[0]);
      const j = Number(selectedCell.split('-')[1]);
      return tableData.rows[i].cells[j];
    });

  const [styles, setTableStyles] = useState({});

  // Group selected cells to rows (they are already sorted)
  const getGroupedSelectedRows = () => {
    const selectedRows = {};

    selectedCells.forEach((cell) => {
      const { i, j } = cell.location;
      if (!selectedRows[i]) selectedRows[i] = [];
      selectedRows[i].push(cell);
    });

    return selectedRows;
  };

  const handleSetStyle = (e, styleName) => {
    if (Number(e.target.value) < 0) return;
    const styleVal = e.target.value;
    const stylePostFix = 'px solid black';
    const newStyle = styleVal + stylePostFix;

    if (styleName === 'allBorders') {
      selectedCells.forEach((cell) => {
        borderStyleNames.forEach((styleName) => {
          if (styleName === 'border') return;
          const borderValue = e.target.value;
          setTableStyles({ ...styles, allBorders: borderValue });
          cell.styles[styleName] = borderValue + 'px solid black';
        });
      });
      setTableData({ ...tableData });
      return;
    } else if (styleName === 'currentBorders') {
      selectedCells.forEach((cell) => {
        const cellStyles = cell.styles;
        Object.keys(cellStyles).forEach((styleName) => {
          if (styleName.includes('border')) {
            const borderValue = e.target.value;
            setTableStyles({ ...styles, allBorders: borderValue });
            const borderStyle = 'px' + cellStyles[styleName].split('px')[1];
            cellStyles[styleName] = borderValue + borderStyle;
          }
        });
      });

      setTableData({ ...tableData });
      return;
    } else if (styleName.includes('outer')) {
      const selectedRows = getGroupedSelectedRows();

      Object.keys(selectedRows).forEach((rowIndex, selectedI) => {
        const selectedRow = selectedRows[rowIndex];
        const firstRow = selectedI === 0;
        const lastRow = selectedI === Object.keys(selectedRows).length - 1;
        selectedRow.forEach((cell, selectedJ) => {
          const firstCol = selectedJ === 0;
          const lastCol = selectedJ === selectedRow.length - 1;
          const { location, styles } = cell;

          if (firstCol) styles.borderLeft = newStyle;
          if (lastCol) styles.borderRight = newStyle;
          if (firstRow) styles.borderTop = newStyle;
          if (lastRow) styles.borderBottom = newStyle;

          const { i, j } = location;
          tableData.rows[i].cells[j] = cell;
        });
      });

      setTableData({ ...tableData });
    } else if (styleName.includes('inner')) {
      const selectedRows = getGroupedSelectedRows();

      Object.keys(selectedRows).forEach((rowIndex, selectedI) => {
        const selectedRow = selectedRows[rowIndex];
        const firstRow = selectedI === 0;
        const lastRow = selectedI === Object.keys(selectedRows).length - 1;
        selectedRow.forEach((cell, selectedJ) => {
          const firstCol = selectedJ === 0;
          const lastCol = selectedJ === selectedRow.length - 1;
          const { location, styles } = cell;

          if (!firstCol) styles.borderLeft = newStyle;
          if (!lastCol) styles.borderRight = newStyle;
          if (!firstRow) styles.borderTop = newStyle;
          if (!lastRow) styles.borderBottom = newStyle;

          const { i, j } = location;
          tableData.rows[i].cells[j] = cell;
        });
      });

      setTableData({ ...tableData });
    }

    styles[styleName] = e.target.value;

    setTableStyles(styles);

    tableData.styles[styleName] = `${styles[styleName]}%`;
    setTableData({ ...tableData });
  };

  const handleMergeCells = (e) => {
    const selectedRows = getGroupedSelectedRows();

    // Compute colspans and left-most cells for each row
    Object.keys(selectedRows).forEach((rowIndex) => {
      // Get the selected row and check if there's anything selected.
      const selectedRow = selectedRows[rowIndex];
      if (selectedRow.length === 0) return;

      // Assign left-most cell where all the cells to it's right will be merged into
      const leftMostCell = selectedRow[0];
      const { i: leftI, j: leftJ } = leftMostCell.location;

      // Initialize colSpan attribute to avoid errors.
      const leftMostAttributes = leftMostCell.attributes;
      if (!leftMostAttributes.colSpan) leftMostAttributes.colSpan = 1;

      // initialize rightMost cell
      const rightMostCell = selectedRow[selectedRow.length - 1];
      const { j: rightJ } = rightMostCell.location;

      // Loop through every cell to the right until the end of selection and gather the colspan values
      for (let index = leftJ; index < rightJ; index++) {
        const rightCell = tableData.rows[leftI].cells[index + 1];
        if (!rightCell) return;

        // Gather the colspan of the cell to the right
        let rightColSpan = rightCell.attributes.colSpan;
        if (!rightColSpan) rightColSpan = 1;

        // Add it to the leftMost cell's colspan
        leftMostAttributes.colSpan += rightColSpan;

        // Add the contents of the cell to the leftMost
        const { text: oldText, html: oldHtml } = leftMostCell.children[0];
        const { text, html } = rightCell.children[0];

        leftMostCell.children = [
          { text: oldText + text, html: oldHtml + html },
        ];
      }

      // Remove the selectedCells to the right
      const removeCount = rightJ - leftJ;
      tableData.rows[leftI].cells.splice(leftJ + 1, removeCount);

      // Assign the leftMostCell to the table
      tableData.rows[leftI].cells[leftJ] = leftMostCell;
    });

    tableData['selectedCells'] = [];
    setTableData({ ...tableData });
  };
  return (
    <div>
      <h3>Selection Styles</h3>
      <div className='context-menu-input-elements'>
        {selectionStyleNames.map((styleName, index) => {
          return (
            <span key={`InputElement${index}`}>
              {!['mergeCells'].includes(styleName) && (
                <span>
                  <label htmlFor={styleName}>
                    {styleName}
                    {['width', 'height'].includes(styleName) && ' (%)'}
                  </label>
                  <input
                    type='number'
                    name={styleName}
                    min={0}
                    value={styles[styleName] ? styles[styleName] : 1}
                    onChange={(e) => handleSetStyle(e, styleName)}
                  />
                </span>
              )}
              {styleName === 'mergeCells' && (
                <span>
                  <br />
                  <button onClick={handleMergeCells}>Merge Cells</button>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditTable = ({ props }) => {
  // const { styles: tableStyles, location } = props;

  const tableStyleNames = ['width', 'height', 'allBorders', 'borderCollapse'];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [styles, setTableStyles] = useState({});

  const initTableStyles = () => {};

  useEffect(initTableStyles, []);

  const handleSetStyle = (e, styleName) => {
    if (Number(e.target.value) < 0) return;

    if (styleName === 'allBorders') {
      tableData.rows.forEach((row) => {
        row.cells.forEach((cell) => {
          borderStyleNames.forEach((styleName) => {
            if (styleName === 'border') return;
            const borderValue = e.target.value;
            setTableStyles({ ...styles, allBorders: borderValue });
            cell.styles[styleName] = borderValue + 'px solid black';
          });
        });
      });
      setTableData({ ...tableData });
      return;
    }

    styles[styleName] = e.target.value;

    setTableStyles(styles);

    tableData.styles[styleName] = `${styles[styleName]}%`;
    setTableData({ ...tableData });
  };

  const handleBorderCollapse = (e) => {
    tableData.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        const { i, j } = cell.location;

        const lastRow = i === tableData.rows.length - 1;
        const lastCol = j === row.cells.length - 1;

        if (!lastCol) cell.styles['borderRight'] = '0px solid black';
        if (!lastRow) cell.styles['borderBottom'] = '0px solid black';
      });
    });

    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Table All Styles</h3>
      <div className='context-menu-input-elements'>
        {tableStyleNames.map((styleName, index) => {
          return (
            <span key={`InputElement${index}`}>
              {['width', 'height', 'allBorders'].includes(styleName) && (
                <span>
                  <label htmlFor={styleName}>
                    {styleName}
                    {['width', 'height'].includes(styleName) && ' (%)'}
                  </label>
                  <input
                    type='number'
                    name={styleName}
                    min={0}
                    value={styles[styleName] ? styles[styleName] : 1}
                    onChange={(e) => handleSetStyle(e, styleName)}
                  />
                </span>
              )}
              {styleName === 'borderCollapse' && (
                <span>
                  <br />
                  <button onClick={handleBorderCollapse}>
                    Border Collapse
                  </button>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditRow = ({ props }) => {
  const { location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const currentStyles = tableData.rows[location.i].styles;

  const handleCopyBelow = () => {
    const row = tableData.rows[location.i];
    const copiedRow = deepCopy(row);
    tableData.rows.splice(location.i, 0, copiedRow);
    setTableData({ ...tableData });
  };

  const handleDelete = () => {
    tableData.rows.splice(location.i, 1);
    setTableData({ ...tableData });
  };

  const handleSetStyle = (e, styleName) => {
    styles[styleName] = e.target.value;
    setStyles({ ...styles });
    const row = tableData.rows[location.i];

    try {
      row.styles[styleName] = Number(styles[styleName]) + 'px';
    } catch (error) {
      console.log(error);
    }

    setTableData({ ...tableData });
  };

  const rowControls = [
    {
      title: 'Add or Remove Row',
      items: [
        { type: 'button', label: 'Copy Below', action: handleCopyBelow },
        { type: 'button', label: 'Delete Row', action: handleDelete },
      ],
    },
    {
      title: 'Row Styles',
      items: [{ type: 'number', label: 'height', action: handleSetStyle }],
    },
  ];
  const rowStuff = {
    addRemove: [
      { type: 'button', label: 'Copy Below', action: handleCopyBelow },
      { type: 'button', label: 'Delete Row', action: handleDelete },
    ],
    styles: [{ type: 'number', label: 'height', action: handleSetStyle }],
  };

  const currentStyleValues = {};

  //Extracting style number value from style like '1px' to 1
  const initRowStyleValues = () => {
    const heightStyle = currentStyles['height'];
    if (heightStyle) {
      const heightValue = Number(heightStyle.split('px')[0]);
      currentStyleValues['height'] = heightValue;
      setStyles({ ...currentStyleValues });
    }
  };

  useEffect(initRowStyleValues, []);

  const [styles, setStyles] = useState({});

  return (
    <div>
      <h3>Row All Styles</h3>
      <div>
        <div>
          {rowStuff.addRemove.map(({ action, label, index }) => (
            <button key={label + index} onClick={action}>
              {label}
            </button>
          ))}
        </div>
        <div className='context-menu-input-elements'>
          {rowStuff.styles.map(({ action, label, index }) => (
            <span key={label + index}>
              <label htmlFor={label}>{label}</label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={label}
                min={0}
                value={styles[label]}
                onChange={(e) => action(e, label)}
              />
            </span>
          ))}
        </div>
        <div></div>
      </div>
    </div>
  );
};

const EditColumn = ({ props }) => {
  const { location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const handleCopyColumn = () => {
    tableData.rows.forEach((row) => {
      const cell = row.cells[location.j];
      const copiedCell = deepCopy(cell);
      row.cells.splice(location.j, 0, copiedCell);
    });
    setTableData({ ...tableData });
  };

  const handleDelete = () => {
    tableData.rows.forEach((row) => {
      row.cells.splice(location.j, 1);
    });
    setTableData({ ...tableData });
  };

  const handleSetStyle = (e, styleName) => {
    styles[styleName] = e.target.value;
    setStyles({ ...styles });
    const row = tableData.rows[location.i];

    try {
      row.styles[styleName] = Number(styles[styleName]) + 'px';
    } catch (error) {
      console.log(error);
    }

    setTableData({ ...tableData });
  };

  const columnStuff = {
    addRemove: [
      { type: 'button', label: 'Copy to Right', action: handleCopyColumn },
      { type: 'button', label: 'Delete Col', action: handleDelete },
    ],
    styles: [{ type: 'number', label: 'height', action: handleSetStyle }],
  };

  const [styles, setStyles] = useState({});

  return (
    <div>
      <div>
        {columnStuff.addRemove.map(({ action, label, index }) => (
          <button key={label + index} onClick={action}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

const EditSizes = ({ props }) => {
  const { styles: cellStyles, location } = props;

  const sizeStyleNames = ['height'];

  const { tableData, setTableData } = useContext(tableDataContext);

  const defaultSizes = {};

  const [sizes, setSizes] = useState({});

  const initSizes = () => {
    Object.keys(cellStyles).forEach((styleName) => {
      const sizeCriteria = (sizeStyleName) => sizeStyleName === styleName;
      const sizeFound = sizeStyleNames.find(sizeCriteria);
      if (sizeFound) {
        const sizeName = styleName;
        defaultSizes[sizeName] = Number(cellStyles[sizeName].split('px')[0]);
        setSizes(defaultSizes);
      }
    });
  };

  useEffect(initSizes, []);

  const handleSetSize = (e, sizeName) => {
    if (Number(e.target.value) < 0) return;

    sizes[sizeName] = e.target.value;

    setSizes(sizes);

    const cell = tableData.rows[location.i].cells[location.j];
    cell.styles[sizeName] = `${sizes[sizeName]}px`;
    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Sizes</h3>
      <div className='context-menu-input-elements'>
        {sizeStyleNames.map((sizeName, index) => {
          return (
            <span key={sizeName + '' + index}>
              <label htmlFor={sizeName}>
                {sizeName === 'size' ? 'All' : sizeName.replace('size', '')}
              </label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={sizeName}
                min={0}
                value={sizes[sizeName]}
                onChange={(e) => handleSetSize(e, sizeName)}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditSelectedCellBorders = () => {
  const borderStyleNames = [
    'borderTop',
    'borderRight',
    'borderBottom',
    'borderLeft',
    'all',
  ];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [borders, setBorders] = useState({});

  const handleSetBorder = (e, borderName, location) => {
    if (Number(e.target.value) < 0) return;
    const cell = tableData.rows[location.i].cells[location.j];

    const assignBorderStyle = (borderName) => {
      borders[borderName] = e.target.value;

      if (borderName !== 'all')
        cell.styles[borderName] = `${borders[borderName]}px solid black`;
    };

    if (borderName === 'all') {
      borderStyleNames.forEach((borderName) => {
        assignBorderStyle(borderName);
      });
    } else assignBorderStyle(borderName);

    setBorders(borders);
    setTableData({ ...tableData });
  };

  const handleSetSelectedCellBorders = (e, borderName) => {
    tableData.selectedCells.forEach((selectedCell) => {
      const i = Number(selectedCell.split('-')[0]);
      const j = Number(selectedCell.split('-')[1]);
      handleSetBorder(e, borderName, { i, j });
    });
  };

  return (
    <div>
      <h3>Borders</h3>
      <div className='context-menu-input-elements'>
        {borderStyleNames.map((borderName, index) => {
          const borderValue = borders[borderName] ? borders[borderName] : 1;
          return (
            <span key={index}>
              <label htmlFor={borderName}>
                {borderName.replace('border', '')}
              </label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={borderName}
                min={0}
                value={borderValue}
                onChange={(e) => handleSetSelectedCellBorders(e, borderName)}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditCellBorders = ({ props }) => {
  const borderStyleNames = [
    'borderTop',
    'borderRight',
    'borderBottom',
    'borderLeft',
    'all',
  ];

  const { styles: cellStyles, location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const defaultBorders = {};

  const [borders, setBorders] = useState({});

  const handleSetBorder = (e, borderName) => {
    if (Number(e.target.value) < 0) return;
    const cell = tableData.rows[location.i].cells[location.j];

    const assignBorderStyle = (borderName) => {
      borders[borderName] = e.target.value;

      if (borderName !== 'all')
        cell.styles[borderName] = `${borders[borderName]}px solid black`;
    };

    if (borderName === 'all') {
      borderStyleNames.forEach((borderName) => {
        assignBorderStyle(borderName);
      });
    } else assignBorderStyle(borderName);

    setBorders(borders);
    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Borders</h3>
      <div className='context-menu-input-elements'>
        {borderStyleNames.map((borderName, index) => {
          const borderValue = borders[borderName] ? borders[borderName] : 1;
          return (
            <span key={index}>
              <label htmlFor={borderName}>
                {borderName.replace('border', '')}
              </label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={borderName}
                min={0}
                value={borderValue}
                onChange={(e) => handleSetBorder(e, borderName)}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditPaddings = ({ props }) => {
  const { styles: cellStyles, location } = props;

  const paddingStyleNames = [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'padding',
  ];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [paddings, setPaddings] = useState({});
  const defaultPaddings = {};
  const initPaddings = () => {
    Object.keys(cellStyles).forEach((styleName) => {
      const paddingCriteria = (paddingStyleName) =>
        paddingStyleName === styleName;
      const paddingFound = paddingStyleNames.find(paddingCriteria);
      if (paddingFound) {
        const paddingName = styleName;
        defaultPaddings[paddingName] = cellStyles[paddingName].split('px')[0];
        setPaddings(defaultPaddings);
      }
    });
  };

  useEffect(initPaddings, []);

  const handleSetPadding = (e, paddingName) => {
    paddings[paddingName] = e.target.value;

    if (e.target.value < 0) return;

    setPaddings(paddings);

    const cell = tableData.rows[location.i].cells[location.j];
    cell.styles[paddingName] = `${paddings[paddingName]}px`;
    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Paddings</h3>
      <div className='context-menu-input-elements'>
        {paddingStyleNames.map((paddingName, index) => {
          return (
            <span key={paddingName + '' + index}>
              <label htmlFor={paddingName}>
                {paddingName === 'padding'
                  ? 'All'
                  : paddingName.replace('padding', '')}
              </label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={paddingName}
                min={0}
                value={paddings[paddingName] ? paddings[paddingName] : 1}
                onChange={(e) => handleSetPadding(e, paddingName)}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditAlignments = ({ location }) => {
  const verticalOptions = ['top', 'middle', 'bottom'];
  const horizontalOptions = ['left', 'center', 'right'];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [alignments, setAlignments] = useState({
    valign: 'middle',
    align: 'center',
  });

  const handleSetAlignment = (alignmentValue) => {
    const alignmentType = verticalOptions.includes(alignmentValue)
      ? 'valign'
      : 'align';

    console.log(alignmentValue);

    alignments[alignmentType] = alignmentValue;
    setAlignments(alignments);

    const cell = getCell(location, tableData);
    cell.attributes[alignmentType] = alignmentValue;
    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Alignments</h3>
      <div className='context-menu-input-elements'>
        {verticalOptions.map((verticalAlignment, index) => {
          return (
            <button
              onClickCapture={() => handleSetAlignment(verticalAlignment)}
              key={verticalAlignment + '' + index}
            >
              {capitalizeFirstLetter(verticalAlignment)}
            </button>
          );
        })}
      </div>
      <div className='context-menu-input-elements'>
        {horizontalOptions.map((verticalAlignment, index) => {
          return (
            <button
              onClickCapture={() => handleSetAlignment(verticalAlignment)}
              key={verticalAlignment + '' + index}
            >
              {capitalizeFirstLetter(verticalAlignment)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const EditSelectedAlignments = () => {
  const verticalOptions = ['top', 'middle', 'bottom'];
  const horizontalOptions = ['left', 'center', 'right'];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [alignments, setAlignments] = useState({
    valign: 'middle',
    align: 'center',
  });

  const handleSetAlignment = (e, alignmentValue, location) => {
    const alignmentType = verticalOptions.includes(alignmentValue)
      ? 'valign'
      : 'align';

    alignments[alignmentType] = alignmentValue;
    setAlignments(alignments);

    const cell = getCell(location, tableData);
    cell.attributes[alignmentType] = alignmentValue;
    setTableData({ ...tableData });
  };

  const handleSetSelectedAlignments = (alignmentValue) =>
    handleSetSelectedValues(
      null,
      alignmentValue,
      tableData,
      handleSetAlignment
    );

  return (
    <div>
      <h3>Alignments</h3>
      <div className='context-menu-input-elements'>
        {verticalOptions.map((alignmentValue, index) => {
          return (
            <button
              onClickCapture={() => handleSetSelectedAlignments(alignmentValue)}
              key={alignmentValue + '' + index}
            >
              {capitalizeFirstLetter(alignmentValue)}
            </button>
          );
        })}
      </div>
      <div className='context-menu-input-elements'>
        {horizontalOptions.map((alignmentValue, index) => {
          return (
            <button
              onClickCapture={() => handleSetSelectedAlignments(alignmentValue)}
              key={alignmentValue + '' + index}
            >
              {capitalizeFirstLetter(alignmentValue)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const EditSelectedCellPaddings = () => {
  const paddingStyleNames = [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'padding',
  ];

  const { tableData, setTableData } = useContext(tableDataContext);

  const [paddings, setPaddings] = useState({});

  const handleSetPadding = (e, paddingName, location) => {
    paddings[paddingName] = e.target.value;

    if (e.target.value < 0) return;

    setPaddings(paddings);

    const cell = tableData.rows[location.i].cells[location.j];
    cell.styles[paddingName] = `${paddings[paddingName]}px`;
    setTableData({ ...tableData });
  };

  const handleSetSelectedPaddings = (e, paddingName) => {
    tableData.selectedCells.forEach((selectedCell) => {
      const i = Number(selectedCell.split('-')[0]);
      const j = Number(selectedCell.split('-')[1]);
      handleSetPadding(e, paddingName, { i, j });
    });
  };

  return (
    <div>
      <h3>Selected Paddings</h3>
      <div className='context-menu-input-elements'>
        {paddingStyleNames.map((paddingName, index) => {
          return (
            <span key={paddingName + '' + index}>
              <label htmlFor={paddingName}>
                {paddingName === 'padding'
                  ? 'All'
                  : paddingName.replace('padding', '')}
              </label>
              <input
                key={`InputElement${index}`}
                type='number'
                name={paddingName}
                min={0}
                value={paddings[paddingName] ? paddings[paddingName] : 1}
                onChange={(e) => handleSetSelectedPaddings(e, paddingName)}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EditFontSize = ({ location }) => {
  const { tableData, setTableData } = useContext(tableDataContext);

  const [fontSize, setFontSize] = useState(10);

  useEffect(() => {
    const cell = getCell(location, tableData);
    const fontSizeStyle = cell.styles['fontSize']
      ? cell.styles['fontSize']
      : '12px';
    const fontSizeValue = fontSizeStyle.split('px')[0];
    setFontSize(fontSizeValue);
  }, []);

  const handleSetFontSize = (e) => {
    if (e.target.value < 0) return;
    const fontSizeValue = e.target.value;
    setFontSize(fontSizeValue);

    const cell = tableData.rows[location.i].cells[location.j];
    cell.styles['fontSize'] = `${fontSize}px`;
    setTableData({ ...tableData });
  };

  return (
    <div>
      <h3>Font Size</h3>
      <div className='context-menu-input-elements'>
        <span>
          <label htmlFor={'fontSize'}>{'Font Size (px)'}</label>
          <input
            type='number'
            name={'fontSize'}
            min={0}
            value={fontSize}
            onChange={(e) => handleSetFontSize(e)}
          />
        </span>
      </div>
    </div>
  );
};
const EditSelectedFontSizes = () => {
  const { tableData, setTableData } = useContext(tableDataContext);

  const [fontSize, setFontSize] = useState(12);

  const handleSetFontSize = (e, location) => {
    if (e.target.value < 0) return;
    const fontSizeValue = e.target.value;
    setFontSize(fontSizeValue);

    const cell = tableData.rows[location.i].cells[location.j];
    cell.styles['fontSize'] = `${fontSize}px`;
    setTableData({ ...tableData });
  };

  const handleSetSelectedFontSizes = (e) => {
    tableData.selectedCells.forEach((selectedCell) => {
      const i = Number(selectedCell.split('-')[0]);
      const j = Number(selectedCell.split('-')[1]);
      handleSetFontSize(e, { i, j });
    });
  };

  return (
    <div>
      <h3>Font Size</h3>
      <div className='context-menu-input-elements'>
        <span>
          <label htmlFor={'fontSize'}>{'Font Size (px)'}</label>
          <input
            type='number'
            name={'fontSize'}
            min={0}
            value={fontSize}
            onChange={handleSetSelectedFontSizes}
          />
        </span>
      </div>
    </div>
  );
};

export default App;

import { SelectCells } from './Selection';
import { useContext, useState, useEffect } from 'react';
import { tableDataContext } from '../../App';
import { capitalizeFirstLetter, getCell, deepCopy } from '../../../util';
import Table from '../Table';

function MiscEdit(props) {
  console.log(props);
  return (
    <>
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
    </>
  );
}

export default MiscEdit;

export const Insert = ({ location }) => {
  const insertStyleNames = ['table'];
  const { tableData, setTableData } = useContext(tableDataContext);
  const [tableDimensions, setTableDimensions] = useState({ rows: 3, cols: 3 });
  const { i, j } = location;

  const handleInsertTable = () => {
    const children = tableData.rows[i].cells[j].children;
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

export const EditSizes = ({ props }) => {
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

export const EditCellBorders = ({ props }) => {
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

export const EditPaddings = ({ props }) => {
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

export const EditAlignments = ({ location }) => {
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

export const EditFontSize = ({ location }) => {
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

export const EditTable = ({ props }) => {
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

export const EditRow = ({ props }) => {
  const { location } = props;

  const { tableData, setTableData } = useContext(tableDataContext);

  const currentStyles = tableData.rows[location.i].styles;

  const handleCopyBelow = () => {
    const row = tableData.rows[location.i];
    const copiedRow = deepCopy(row);
    tableData.rows.splice(location.i, 0, copiedRow);
    tableData.selectedCells = [];
    setTableData({ ...tableData });
  };

  const handleDelete = () => {
    tableData.selectedCells = [];
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

export const EditColumn = ({ props }) => {
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

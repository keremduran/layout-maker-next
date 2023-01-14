import { useContext, useState } from 'react';
import { tableDataContext } from '../../App';
import {
  capitalizeFirstLetter,
  handleSetSelectedValues,
  getCell,
  borderStyleNames,
} from '../../../util';

import React from 'react';

const Selection = () => {
  const { tableData } = useContext(tableDataContext);

  return (
    <>
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
    </>
  );
};

export default Selection;

export const SelectCells = ({ location }) => {
  const { tableData, setTableData } = useContext(tableDataContext);
  const [tableSelected, setTableSelected] = useState(false);
  const [rowSelected, setRowSelected] = useState(false);
  const [colSelected, setColSelected] = useState(false);

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

  const handleSelectTable = () => {
    tableData.rows.forEach(tableSelected ? unSelectRow : selectRow);
    setTableSelected((selected) => !selected);
  };

  const handleSelectCol = () => {
    tableData.rows.forEach(colSelected ? unSelectCol : selectCol);
    setColSelected((selected) => !selected);
  };

  const handleSelectRow = () => {
    setRowSelected((selected) => !selected);
    rowSelected ? unSelectRow() : selectRow();
  };

  const SelectCellsOptions = [
    { name: 'All', action: handleSelectTable, active: tableSelected },

    { name: 'Row', action: handleSelectRow, active: rowSelected },

    { name: 'Col', action: handleSelectCol, active: colSelected },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        {SelectCellsOptions.map(({ action, name, active }, index) => {
          return (
            <span key={`InputElement${index}`}>
              <button
                style={{
                  padding: '0.2rem',
                  fontWeight: active ? '600' : null,
                  boxShadow: active ? '0 0 0 1px gray' : null,
                  width: '2rem',
                }}
                onClick={action}
              >
                {name}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const EditSelection = () => {
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

      return tableData?.rows[i]?.cells[j];
    });

  const [styles, setTableStyles] = useState({});

  // Group selected cells to rows (they are already sorted)
  const getGroupedSelectedRows = () => {
    const selectedRows = {};

    selectedCells.forEach((cell) => {
      if (!cell) return;

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

export const EditSelectedCellPaddings = () => {
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

export const EditSelectedCellBorders = () => {
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

export const EditSelectedFontSizes = () => {
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

export const EditSelectedAlignments = () => {
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

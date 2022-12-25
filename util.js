//The createTable function takes an object as input, with the following structure:
// {
//   "styles": {
//     // object containing styles to apply to the table element
//   },
//   "rows": [
//     {
//       "styles": {
//         // object containing styles to apply to the tr element
//       },
//       "cells": [
//         {
//           "children": [
//             // array of strings or elements to place inside the cell
//           ],
//           "styles": {
//             // object containing styles to apply to the td element
//           },
//           "attributes": {
//             // object containing attributes to apply to the td element
//           },
//           "location": {
//             "i": number, // row index
//             "j": number // column index
//           }
//         },
//         // more cells...
//       ]
//     },
//     // more rows...
//   ]
// }

export const createTableData = (rowCount, colCount) => {
  const borderStyle = '1px solid black';
  const tableData = {
    rows: [],
    styles: { width: '100%' },
    attributes: { cellSpacing: 0 },
    events: {},
  };
  for (let index = 0; index < rowCount; index++) {
    const row = {
      cells: [],
      styles: { fontSize: '12px' },
      attributes: {},
      i: index,
    };
    for (let col = 0; col < colCount; col++) {
      const text = `${index}-${col} `;
      const html = `<div>${text}</div>`;
      const cell = {
        children: [{ text, html }],
        styles: {
          borderRight: borderStyle,
          borderLeft: borderStyle,
          borderBottom: borderStyle,
          borderTop: borderStyle,
        },
        attributes: {},
        location: { i: 0, j: 0 },
      };
      row.cells.push(cell);
    }
    tableData.rows.push(row);
  }
  return tableData;
};

export const getCell = ({ i, j }, tableData) => tableData.rows[i].cells[j];

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const handleSetSelectedValues = (
  e = null,
  value,
  tableData,
  setStyle
) => {
  tableData.selectedCells.forEach((selectedCell) => {
    const i = Number(selectedCell.split('-')[0]);
    const j = Number(selectedCell.split('-')[1]);
    setStyle(e, value, { i, j });
  });
};

export function deepCopy(obj) {
  if (typeof obj !== 'object') return obj;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(deepCopy);
  } else {
    let copy = {};
    for (let key in obj) {
      copy[key] = deepCopy(obj[key]);
    }
    return copy;
  }
}

export const alertInfoPrompt = () => {
  const infoPrompt = `
  This program was created for generating table layouts for legacy systems such as PDF rendering engine BFO, used by Advanced PDF service of Netsuite, which has a very limited css capability.
  
  Left click any cell to select multiple cells and right click for context menu to transform the table layout, then extract with Copy Table Layout button.

  You can copy rows and columns, merge cells, and adjust styles such as border, padding, font-size, font-weight (bold or not), height and other values.
  
  If you click text edit mode (or press ctrl when table is focused), cell texts become editable, and if you click save, program saves the current version which you can scroll through with R/L buttons.
`;
  alert(infoPrompt);
};

export const getDirections = () => ['Top', 'Right', 'Bottom', 'Left'];

export const borderStyleNames = [
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'all',
];

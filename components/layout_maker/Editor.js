import { useContext, useEffect, useRef, useState } from 'react';
import { tableDataContext } from '../App';
import Table from './Table';
import {
  deepCopy,
  kebabToCamel,
  camelToKebab,
  hasRepeatedValues,
} from '../../util';

const defaultImportHTML = `<table cellSpacing="0" style=" width: 100%; ">
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; font-size: 36px; " colspan="9" rowspan="1" align="left" ><b>INVOICE<br/><div></div><div></div><div></div><div></div></b></td>
    <td style="border: 0px solid black; " colspan="3" rowspan="1" align="right" >[Logo]<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 13px; " colspan="9" rowspan="1" align="left" >Yukon Packing<br/><div></div><div></div><div></div><div></div><div><span><span>[Address]</span></span></div><div><span><span>[Address]</span></span></div></td>
    <td style="border: 0px solid black; padding-top: 13px; " colspan="3" rowspan="1" align="left" ><div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 16px; padding-bottom: 18px; " colspan="3" rowspan="1" align="left" ><b>BILL TO<div></div><div></div><div></div><div><span><span><br></span></span></div><div><span><span><br></span></span></div><div><span><span><br></span></span></div></b></td>
    <td style="border: 0px solid black; padding-top: 16px; padding-bottom: 18px; " colspan="3" rowspan="1" align="left" ><b>SHIP TO<div></div><div></div><div></div><div><span><span><br></span></span></div><div><span><span><br></span></span></div><div><span><span><br></span></span></div></b></td>
    <td style="border: 0px solid black; padding-top: 16px; padding-bottom: 18px; " colspan="3" rowspan="1" align="left" ><b>INVOICE #<div></div><div></div><div></div><div><span><span>INVOICE DATE</span></span></div><div><span><span>P.O #</span></span></div><div><span><span>DUE DATE</span></span></div></b></td>
    <td style="border: 0px solid black; padding-top: 16px; padding-bottom: 18px; " colspan="3" rowspan="1" align="right" >CA-001<div></div><div></div><div></div><div><span><span>29/01/2019</span></span></div><div><span><span>29/01/2019<br></span></span></div><div><span><span><span style="text-align: -webkit-left;">29/01/2019</span><br></span></span></div></td>
  </tr>
  <tr style="font-size: 12px; height: 36px; ">
    <td style="border-right: 0px solid black; border-left: 0px solid black; border-bottom: 1px solid black; border-top: 1px solid black; font-size: 14px; " colspan="2" rowspan="1" align="left" ><b>QTY<div></div><div></div></b></td>
    <td style="border-right: 0px solid black; border-left: 0px solid black; border-bottom: 1px solid black; border-top: 1px solid black; font-size: 14px; " colspan="4" rowspan="1" align="left" ><b>DESCRIPTION<div></div><div></div><div></div><div></div></b></td>
    <td style="border-right: 0px solid black; border-left: 0px solid black; border-bottom: 1px solid black; border-top: 1px solid black; font-size: 14px; " colspan="3" rowspan="1" align="right" ><b>UNIT PRICE<div></div><div></div><div></div></b></td>
    <td style="border-right: 0px solid black; border-left: 0px solid black; border-bottom: 1px solid black; border-top: 1px solid black; font-size: 14px; " colspan="3" rowspan="1" align="right" ><b>AMOUNT<div></div><div></div><div></div></b></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="2" rowspan="1" align="left" >1<div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="4" rowspan="1" align="left" >Smoked chinook salmon fillet<div></div><div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="3" rowspan="1" align="right" >100.0<div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="3" rowspan="1" align="right" >100.0<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="2" rowspan="1" align="left" >1<div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="4" rowspan="1" align="left" >Smoked chinook salmon fillet<div></div><div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="3" rowspan="1" align="right" >100.0<div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="3" rowspan="1" align="right" >100.0<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="2" rowspan="1" align="left" >1<div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="4" rowspan="1" align="left" >Smoked chinook salmon fillet<div></div><div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="3" rowspan="1" align="right" >100.0<div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 8px; padding-bottom: 8px; " colspan="3" rowspan="1" align="right" >100.0<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 12px; " colspan="2" rowspan="1" align="left" ><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 12px; " colspan="4" rowspan="1" align="left" ><div></div><div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 12px; " colspan="3" rowspan="1" align="right" >Subtotal<div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 12px; " colspan="3" rowspan="1" align="right" >145.00<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 10px; " colspan="2" rowspan="1" align="left" ><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 10px; " colspan="4" rowspan="1" align="left" ><div></div><div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 10px; " colspan="3" rowspan="1" align="right" >GST 5.0%<div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 10px; " colspan="3" rowspan="1" align="right" >7.25<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; padding-top: 10px; " colspan="2" rowspan="1" align="left" ><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 10px; " colspan="4" rowspan="1" align="left" ><div></div><div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 10px; " colspan="3" rowspan="1" align="right" >TOTAL<div></div><div></div><div></div></td>
    <td style="border: 0px solid black; padding-top: 10px; " colspan="3" rowspan="1" align="right" >$152.2<div></div><div></div><div></div></td>
  </tr>
  <tr style="font-size: 12px; ">
    <td style="border: 0px solid black; " colspan="1" rowspan="1" align="left" ><div></div></td>
    <td style="border: 0px solid black; " colspan="1" rowspan="1" align="left" ><div></div></td>
    <td style="border: 0px solid black; " colspan="1" rowspan="1" align="left" ><div></div></td>
    <td style="border: 0px solid black; " colspan="1" rowspan="1" align="left" ><div></div></td>
    <td style="border: 0px solid black; " colspan="1" rowspan="1" align="left" ><div></div></td>
    <td style="border: 0px solid black; " colspan="1" rowspan="1" align="left" ><div></div></td>
    <td style="border: 0px solid black; font-size: 16px; padding-top: 24px; " colspan="6" rowspan="1" align="right" ><b>[Signature]<br/><div></div><div><span><span><br></span></span></div></b></td>
  </tr>
</table>`;

function cleanDirectionalStyles(cell) {
  const styles = Object.keys(cell.styles);
  const outputStyles = {};

  // Combine directional styles
  ['padding', 'border'].forEach((directionalStyle) => {
    const directionalKeys = styles.filter((key) =>
      key.includes(directionalStyle)
    );
    if (directionalKeys.length >= 4) {
      const values = directionalKeys.map((key) => cell.styles[key]);
      if (new Set(values).size === 1) {
        const newKey = directionalStyle === 'border' ? 'border' : 'padding';
        outputStyles[newKey] = values[0];
        directionalKeys.forEach((key) => delete cell.styles[key]);
      }
    }
  });

  // Merge repeated values
  const canMerge =
    Object.keys(outputStyles).length === 0 && hasRepeatedValues(cell.styles);
  if (canMerge) {
    const styleValue = cell.styles[Object.keys(cell.styles)[0]];
    outputStyles.border = styleValue;
    cell.styles = {};
  }

  cell.styles = { ...outputStyles, ...cell.styles };
}

function cleanDivs(cell) {
  const cellHtml = cell.children[0].html;

  const divRegex = /<div>(.*?)<\/div>/g;
  let newCellHtml = cellHtml.replace(divRegex, (match, content) => {
    if (content.trim() === '') {
      // Return the original empty div element
      return '<div></div>';
    } else {
      // Wrap the non-empty div content in a span element
      return `<div><span>${content}</span></div>`;
    }
  });

  newCellHtml = newCellHtml.replaceAll(
    '<div></div><div></div><div></div><div></div><div></div>',
    '<br/>'
  );

  cell.children[0].html = newCellHtml;
}

function convertBreaks(cell) {
  const cellHtml = cell.children[0].html;
  cell.children[0].html = cellHtml.replaceAll('<br>', '<br/>');
}

/**
 * Prepares the table data for advanced pdf by looping through every cell.
 * @param {*} tableData
 * @returns tableData
 */
function cleanTableData(tableData) {
  // Iterate over the rows in the tableData object
  for (let row of tableData.rows) {
    // Iterate over the cells in each row
    for (let cell of row.cells) {
      // Development only style
      delete cell.styles['all'];
      cleanDirectionalStyles(cell);
      cleanDivs(cell);
      convertBreaks(cell);
    }
  }
  return tableData;
}

/**
 * Copies the resulting table html code to the clipboard.
 * @param {*} oldTableData
 * @returns tableData
 */
async function copyAdvancedPDFTable(e, oldTableData) {
  let tableData = deepCopy(oldTableData);
  tableData = cleanTableData(tableData);
  // Define a function to convert a string from camel case to kebab case
  const { cellSpacing } = tableData.attributes;

  // Convert the table styles to kebab case
  let tableStyles = '';
  for (let style of Object.keys(tableData.styles)) {
    const kebabStyle = camelToKebab(style);
    if (kebabStyle === 'inner-borders') continue;
    tableStyles += ` ${camelToKebab(style)}: ${tableData.styles[style]}; `;
  }

  let table = `<table cellSpacing="${cellSpacing}" style="${tableStyles}">
`;

  // Iterate over the rows in the tableData object
  for (let row of tableData.rows) {
    // Convert the row styles to kebab case
    let rowStyles = '';
    for (let style of Object.keys(row.styles)) {
      rowStyles += `${camelToKebab(style)}: ${row.styles[style]}; `;
    }

    table += `  <tr style="${rowStyles}">
`;
    // Iterate over the cells in each row
    for (let cell of row.cells) {
      // Convert the cell styles to kebab case
      let styles = '';
      for (let style of Object.keys(cell.styles)) {
        if (style && cell.styles[style].length > 0)
          styles += `${camelToKebab(style)}: ${cell.styles[style]}; `;
      }
      // Create a string of attributes for the cell
      let attributes = '';
      for (let attribute of Object.keys(cell.attributes)) {
        attributes += `${attribute}="${cell.attributes[attribute]}" `;
      }
      attributes = attributes.toLowerCase();
      const html = cell.children[0].html;
      // Add the cell to the table
      let style = '';
      if (styles.length > 0) style = `style="${styles}"`;

      table += `    <td ${style} ${attributes}>${html}</td>
`;
    }
    table += `  </tr>
`;
  }

  table += `</table>`;
  await navigator.clipboard.writeText(table);
  //This console log will remain during production until stable release
  console.log(`${new Date()} - Your copied data\n`, table);
  alert('copied to clipboard! (also in console  app crashes)');
  return table;
}

function tableToJson(tableData) {
  // Initialize empty object to store table data
  const table = {
    rows: [],
    styles: { width: '100%' },
    selectedCells: [],
    events: [],
    attributes: { cellSpacing: 0 },
  };

  // Split the table data string into an array of rows
  const rowsData = tableData.match(/<tr[\s\S]*?<\/tr>/g);

  // Loop through each row in the array
  for (let rowIndex = 0; rowIndex < rowsData.length; rowIndex++) {
    // Initialize empty array to store cells
    const cells = [];

    const row = {
      cells,
      styles: {},
      attributes: {},
    };

    // Split the current row into an array of cells
    const cellsData = rowsData[rowIndex].match(/<td[\s\S]*?<\/td>/g);
    const rowStylesData = rowsData[rowIndex].match(/style="[^"]*"/g);
    const rowAttributesData = rowsData[rowIndex].match(/<tr[^>]*>/g);

    if (rowStylesData) {
      const styles = rowStylesData[0]
        .replace('style=', '')
        .replace(/"/g, '')
        .split(';');

      for (let style of styles) {
        let [property, value] = style.split(':');
        if (property && value) {
          property = kebabToCamel(property.trim());
          row.styles[property] = value.trim();
        }
      }
    }

    if (rowAttributesData) {
      const attributes = rowAttributesData[0]
        .replace('<tr', '')
        .replace('>', '')
        .split(' ');

      for (let attribute of attributes) {
        const [property, value] = attribute.split('=');

        if (property && value && property !== 'style') {
          const processedValue = value.replace(/^\s+|\s+$/g, '');
          row.attributes[property.trim()] = processedValue;
        }
      }
    }

    // Loop through each cell in the array
    for (let cellIndex = 0; cellIndex < cellsData.length; cellIndex++) {
      // Initialize empty object to store cell data
      const cell = {
        children: [],
        styles: {},
        attributes: {
          colSpan: 1,
          rowSpan: 1,
        },
        location: {
          rowIndex,
          cellIndex,
        },
      };

      // Get the child elements of the cell
      function extractTdHtml(string) {
        const regex = /<td[^>]*>(.+)<\/td>/;
        const match = regex.exec(string);
        if (match) {
          return match[1];
        }
        return null;
      }

      function extractTdText(string) {
        if (string) return string.replace(/<[^>]+>/g, '');
        return '';
      }

      const tdHTML = extractTdHtml(cellsData[cellIndex]);
      const tdText = extractTdText(tdHTML);
      cell.children.push({
        html: tdHTML,
        text: tdText,
      });
      const stylesData = cellsData[cellIndex].match(/style="[^"]*"/g);
      if (stylesData) {
        const styles = stylesData[0]
          .replace('style=', '')
          .replace(/"/g, '')
          .split(';');
        for (let style of styles) {
          let [property, value] = style.split(':');
          if (property && value) {
            property = kebabToCamel(property.trim());
            cell.styles[property] = value.trim();
          }
        }
      }

      // Get the attributes of the cell element
      const attributesData = cellsData[cellIndex].match(/<td[^>]*>/g);
      if (attributesData) {
        const attributeRegex =
          /([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
        const attributes = attributesData[0]
          .replace('<td', '')
          .replace('>', '');
        const attributeList = attributes.match(attributeRegex);
        for (let attribute of attributeList) {
          let [property, value] = attribute.split('=');

          if (property && value && property !== 'style' && value.length > 0) {
            const processedValue = value.replace(/^"|"$/g, '');
            property = property.trim();
            if (property === 'colspan') property = 'colSpan';
            else if (property === 'rowspan') property = 'rowSpan';
            cell.attributes[property] = processedValue;
          }
        }
      }

      cells.push(cell);
    }
    table.rows.push(row);
  }
  return table;
}

export const Editor = () => {
  let { tableData, setTableData } = useContext(tableDataContext);
  const [editTextMode, setEditTextMode] = useState(true);
  const [history, setHistory] = useState([deepCopy(tableData)]);
  const [version, setVersion] = useState(0);
  const [importHTML, setImportHTML] = useState(defaultImportHTML);
  const [showImportTextArea, setShowImportTextArea] = useState(false);
  const selectedCellsRef = useRef(null);

  function handleClickOutside(event, ref = selectedCellsRef) {
    if (ref.current && !ref.current.contains(event.target)) {
      tableData['selectedCells'] = [];
      setTableData({ ...tableData });
    }
  }

  const handleToggleEditTextMode = () => {
    const events = tableData['events'];

    setEditTextMode((editTextMode) => !editTextMode);

    events['editTextMode'] = editTextMode;

    setTableData({ ...tableData });
  };

  const handleKeyUp = (e) => {
    if (e.which === 17) handleToggleEditTextMode();
  };

  const handleSave = (historyTableData = tableData) => {
    if (history.length === 30) {
      alert('Too many saves!');
      return;
    }
    history.push(deepCopy(historyTableData));
    setHistory(history);
    handleSetVersion(history.length - 1);
  };

  const handleSetVersion = (versionNo) => {
    if (versionNo < 0 || versionNo >= history.length) return;

    setVersion(versionNo);
    tableData = history[versionNo];

    setTableData({ ...tableData });
  };

  const handleImportHTML = () => {
    let importedTableData;

    try {
      importedTableData = tableToJson(importHTML);
    } catch (error) {
      console.error(error);
      alert('Bad import.');
    }

    handleSave(importedTableData);
    setShowImportTextArea(false);
  };

  return (
    <div
      tabIndex='0'
      onKeyUpCapture={handleKeyUp}
      onClick={handleClickOutside}
      style={{ padding: '2rem', paddingTop: '1rem' }}
    >
      <h1>Table Layout Generator</h1>

      <div className='editor-controls'>
        <button
          className='button-primary'
          onClick={(e) => copyAdvancedPDFTable(e, tableData)}
        >
          Copy Layout
        </button>
        <button className='button-primary' onClick={handleToggleEditTextMode}>
          Edit Text mode {!editTextMode && ` ✓`}
        </button>
        <span className='import-layout'>
          {showImportTextArea && (
            <span className='import-layout-elements'>
              <button
                className='button-primary'
                disabled={importHTML.length <= 0 || importHTML.length > 40000}
                onClick={handleImportHTML}
              >
                Send {`(${importHTML.length}/40000)`}
              </button>
              <textarea
                value={importHTML}
                onChange={(e) => {
                  setImportHTML(e.target.value);
                }}
              />
            </span>
          )}

          <button
            className='button-primary'
            onClick={() =>
              setShowImportTextArea((showImportTextArea) => !showImportTextArea)
            }
          >
            Import
          </button>
        </span>
        <span className='version-control'>
          <span className='version-control-buttons'>
            <button onClick={() => handleSetVersion(version - 1)}>L</button>
            <span>
              {version + 1}/{history.length}
            </span>
            <button onClick={() => handleSetVersion(version + 1)}>R</button>
          </span>
          <button className='button-primary' onClick={() => handleSave()}>
            Save
          </button>
        </span>
      </div>
      <div className='letter'>
        <span ref={selectedCellsRef}>
          <Table props={{ tableData }} />
        </span>
      </div>
    </div>
  );
};
